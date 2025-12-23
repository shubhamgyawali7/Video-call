'use client'

import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import {io} from 'socket.io-client';
import VideoGrid from './VideoGrid';
import ControlPanel from './ControlPanel';
import ChatSidebar from './ChatSidebar';
import { addPeer, removePeer, addChatMessage } from '@/store/conferenceSlice.js';

const VideoConference = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, room } = useSelector(state => state.conference);

  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState(new Map());
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const socketRef = useRef(null);
  const peersRef = useRef(new Map());
  const screenStreamRef = useRef(null);

  useEffect(() => {
    if (user && room) {
      initializeMedia();
      connectSocket();
    }

    return () => cleanData();
  }, [user, room]);

  // -------------------
  // Media initialization
  // -------------------
  const initializeMedia = async () => {
    if (window.localStream) {
      setLocalStream(window.localStream);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      window.localStream = stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      if (error.name === 'NotReadableError') {
        alert('Camera or microphone is busy. Close other tabs or apps using it.');
      } else {
        alert('Please allow camera and microphone access');
      }
    }
  };

  // -------------------
  // Socket connection
  // -------------------
  const connectSocket = () => {
    if (!user || !room) return;

    const socket = io(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('join-room', { roomId: room, userId: user.id, username: user.username });
    });

    // For Video Confernce sets up peer-to-peer connections
    socket.on('room-users', (users) => {
      users.forEach(u => createPeerConnection(socket, u.socketId, u.userId, u.username, false));
    });

    socket.on('user-joined', (userData) => {
      createPeerConnection(socket, userData.socketId, userData.userId, userData.username, true);
    });

    socket.on('user-left', (userData) => removePeerConnection(userData.socketId));
    socket.on('offer', async (data) => await handleOffer(socket, data));
    socket.on('answer', async (data) => await handleAnswer(data));
    socket.on('ice-candidate', async (data) => await handleIceCandidate(data));
    socket.on('chat-message', (data) => dispatch(addChatMessage(data)));
  };

  // -------------------
  // Peer Management
  // -------------------
  const setPeer = (socketId, data) => {
    peersRef.current.set(socketId, data);
    setPeers(new Map(peersRef.current));
  };

  const getPeer = (socketId) => peersRef.current.get(socketId);

  // video/audio (WebRTC)
  const createPeerConnection = async (socket, socketId, userId, username, shouldCreateOffer) => {
    if (!localStream) return;

    const connection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    // Add local tracks
    localStream.getTracks().forEach(track => connection.addTrack(track, localStream));

    // Handle remote tracks
    connection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (!peersRef.current.has(socketId)) {
        setPeer(socketId, { connection, userId, username, stream: remoteStream });
        dispatch(addPeer({ socketId, userId, username, stream: remoteStream }));
      }
    };

    // ICE candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { to: socketId, candidate: event.candidate, from: user.id });
      }
    };

    setPeer(socketId, { connection, userId, username });

    if (shouldCreateOffer) {
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);
      socket.emit('offer', { to: socketId, offer, from: user.id });
    }
  };

  const handleOffer = async (socket, data) => {
    const peer = getPeer(data.from);
    if (!peer) return;

    await peer.connection.setRemoteDescription(data.offer);
    const answer = await peer.connection.createAnswer();
    await peer.connection.setLocalDescription(answer);
    socket.emit('answer', { to: data.from, answer, from: user.id });
  };

  const handleAnswer = async (data) => {
    const peer = getPeer(data.from);
    if (!peer) return;
    await peer.connection.setRemoteDescription(data.answer);
  };

  const handleIceCandidate = async (data) => {
    const peer = getPeer(data.from);
    if (peer && data.candidate) await peer.connection.addIceCandidate(data.candidate);
  };

  const removePeerConnection = (socketId) => {
    const peer = getPeer(socketId);
    if (peer) {
      peer.connection.close();
      peersRef.current.delete(socketId);
      setPeers(new Map(peersRef.current));
      dispatch(removePeer(socketId));
    }
  };

  // -------------------
  // Controls
  // -------------------
  const toggleAudio = () => {
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !isAudioOn;
      setIsAudioOn(!isAudioOn);
      socketRef.current?.emit('toggle-audio', { roomId: room, userId: user.id, isAudioOn: !isAudioOn });
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
      socketRef.current?.emit('toggle-video', { roomId: room, userId: user.id, isVideoOn: !isVideoOn });
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        screenStreamRef.current = screenStream;
        const videoTrack = screenStream.getVideoTracks()[0];

        peersRef.current.forEach(peer => {
          const sender = peer.connection.getSenders().find(s => s.track.kind === 'video');
          sender?.replaceTrack(videoTrack);
        });

        videoTrack.onended = stopScreenShare;
        setIsScreenSharing(true);
      } catch (err) {
        console.error('Screen share error:', err);
      }
    } else stopScreenShare();
  };

  const stopScreenShare = () => {
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    const videoTrack = localStream?.getVideoTracks()[0];
    peersRef.current.forEach(peer => {
      const sender = peer.connection.getSenders().find(s => s.track.kind === 'video');
      sender?.replaceTrack(videoTrack);
    });
    setIsScreenSharing(false);
  };

  const sendChatMessage = (message) => {
    if (!message.trim()) return;
    socketRef.current?.emit('chat-message', { roomId: room, message: message.trim(), userId: user.id, username: user.username });
  };

  const leaveRoom = () => {
    cleanData();
    router.push('/');
  };

  // -------------------
  // Cleanup
  // -------------------
  const cleanData = () => {
    socketRef.current?.emit('leave-room');
    socketRef.current?.disconnect();
    socketRef.current = null;

    localStream?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());

    peersRef.current.forEach(peer => peer.connection.close());
    peersRef.current.clear();
    setPeers(new Map());

    window.localStream = null;
  };

  // -------------------
  // Render
  // -------------------
  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <div className="bg-white shadow-sm p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Video Conference</h1>
          <p className="text-sm text-gray-600">Room: {room}</p>
        </div>
        <button
          onClick={leaveRoom}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        >
          Leave Room
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <VideoGrid localStream={localStream} user={user} />
          <ControlPanel
            isAudioOn={isAudioOn}
            isVideoOn={isVideoOn}
            isScreenSharing={isScreenSharing}
            showChat={showChat}
            onToggleAudio={toggleAudio}
            onToggleVideo={toggleVideo}
            onToggleScreenShare={toggleScreenShare}
            onToggleChat={() => setShowChat(!showChat)}
          />
        </div>
        {/* {showChat && <ChatSidebar onSendMessage={sendChatMessage} />} */}
      </div>
    </div>
  );
};

export default VideoConference;
