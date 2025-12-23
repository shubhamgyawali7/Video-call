'use client';

import { useEffect, useRef, useState } from 'react';

export const useWebRTC = () => {
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const screenStreamRef = useRef(null);

  const getLocalStream = async (constraints = { video: true, audio: true }) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error('Failed to access camera/microphone');
    }
  };

  const createPeerConnection = (configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }) => {
    return new RTCPeerConnection(configuration);
  };

  const addTracksToPeer = (peerConnection, stream) => {
    stream.getTracks().forEach(track => {
      peerConnection.addTrack(track, stream);
    });
  };

  const replaceVideoTrack = async (newTrack) => {
    const promises = [];
    
    peers.forEach(async (peer) => {
      const sender = peer.connection.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      if (sender) {
        promises.push(sender.replaceTrack(newTrack));
      }
    });

    await Promise.all(promises);
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
        return !isAudioEnabled;
      }
    }
    return isAudioEnabled;
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
        return !isVideoEnabled;
      }
    }
    return isVideoEnabled;
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      screenStreamRef.current = screenStream;
      const videoTrack = screenStream.getVideoTracks()[0];
      
      await replaceVideoTrack(videoTrack);
      
      videoTrack.onended = () => {
        stopScreenShare();
      };
      
      return screenStream;
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  };

  const stopScreenShare = async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      await replaceVideoTrack(videoTrack);
    }
  };

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }

    peers.forEach(peer => {
      if (peer.connection) {
        peer.connection.close();
      }
    });

    setPeers(new Map());
    setLocalStream(null);
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return {
    localStream,
    peers,
    isAudioEnabled,
    isVideoEnabled,
    getLocalStream,
    createPeerConnection,
    addTracksToPeer,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    setPeers,
    cleanup
  };
};