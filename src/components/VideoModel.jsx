"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import socket from "@/lib/socket.js";
import {
  addChatMessage,
  addPeer,
  removePeer,
} from "@/store/conferenceSlice.js";
import VideoGrid from "./VideoGrid";
import ControlPanel from "./ControlPanel";
import { useRouter } from "next/navigation";

const VideoModel = () => {
  // --- UI States ---
  const [localStream, setLocalStream] = useState(null);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  // Refs for WebRTC management (Prevents re-renders from breaking connections)
  const peersRef = useRef(new Map());
  const screenStreamRef = useRef(null);

  const { user, room } = useSelector((state) => state.conference);

  const cleanup = useCallback(() => {
    // logic for your custom cleanup (e.g., UI resets)
    console.log("Custom cleanup executed");
  }, []);
  // --- Signaling Logic ---
  useEffect(() => {
    if (!user || !room) return;

    const init = async () => {
      let stream = window.localStream;
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });
          window.localStream = stream;
        } catch (error) {
          console.error("Media Error:", error);
          return;
        }
      }
      setLocalStream(stream);

      socket.emit("join-room", {
        roomId: room,
        userId: user.id,
        username: user.username,
      });

      socket.on("room-users", (users) => {
        users.forEach((u) => {
          dispatch(
            addPeer({
              socketId: u.socketId,
              userId: u.userId,
              username: u.username,
              stream: null,
            })
          );
          createPeerConnection(u.socketId, u.userId, u.username, false, stream);
        });
      });

      socket.on("user-joined", (userData) => {
        createPeerConnection(
          userData.socketId,
          userData.userId,
          userData.username,
          true,
          stream
        );
      });

      socket.on("offer", async (data) => await handleOffer(data, stream));
      socket.on("answer", async (data) => await handleAnswer(data));
      socket.on(
        "ice-candidate",
        async (data) => await handleIceCandidate(data)
      );

      socket.on("user-left", (socketId) => {
        const peer = peersRef.current.get(socketId);
        if (peer) {
          peer.connection.close();
          peersRef.current.delete(socketId);
          dispatch(removePeer(socketId));
        }
      });
    };

    init();

    return () => {
      socket.off("room-users");
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("user-left");

      peersRef.current.forEach((peer) => {
        peer.connection
          .getSenders()
          .forEach((sender) => peer.connection.removeTrack(sender));
        peer.connection.close();
      });
      peersRef.current.clear();

      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
        window.localStream = null;
      }
      cleanup();
    };
  }, [user?.id, room, dispatch]);

  // --- WebRTC Core Functions ---
  const createPeerConnection = async (
    socketId,
    userId,
    username,
    shouldCreateOffer,
    stream
  ) => {
    if (peersRef.current.has(socketId)) return;

    // const pc = new RTCPeerConnection({
    //   iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    // });
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        {
          // Free relay servers from Open Relay Project
          urls: [
            "turn:openrelay.metered.ca:80",
            "turn:openrelay.metered.ca:443",
            "turn:openrelay.metered.ca:443?transport=tcp",
          ],
          username: "openrelayproject",
          credential: "openrelayprojectsecret",
        },
      ],
    });
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("ice-candidate", {
          to: socketId,
          candidate: e.candidate,
          from: socket.id,
        });
      }
    };

    pc.ontrack = (e) => {
      const remoteStream = e.streams[0];
      dispatch(addPeer({ socketId, userId, username, stream: remoteStream }));
    };

    peersRef.current.set(socketId, {
      connection: pc,
      username,
      candidateQueue: [],
    });

    if (shouldCreateOffer) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { to: socketId, offer, from: socket.id });
    }
  };

  const handleOffer = async (data, stream) => {
    let peer = peersRef.current.get(data.from);

    // 1. Initialize peer if not already existing
    if (!peer) {
      await createPeerConnection(
        data.from,
        "unknown",
        "Remote Peer",
        false,
        stream
      );
      peer = peersRef.current.get(data.from);
    }

    const pc = peer.connection;

    pc.onsignalingstatechange = () => {
      console.log("Signaling state changed offer:", pc.signalingState);
      // Implement logic here to react to state changes, e.g., enable/disable buttons,
      // or prevent certain operations until the state is correct.
    };

    // If we receive an offer while we have already sent one (have-local-offer)
    const isCollision =
      data.offer && (pc.signalingState !== "stable" || peer.makingOffer);

    const isPolite = socket.id < data.from;

    if (isCollision && !isPolite) {
      console.log("Collision detected, ignoring offer because I am impolite");
      return;
    }

    try {
      console.log("Current signaling state Handle Offer:", pc.signalingState);
      console.log("Data of HandelOffer=>", data);
      // 3. Set Remote Description (Offer)
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

      peer.candidateQueue.forEach((cand) =>
        pc.addIceCandidate(new RTCIceCandidate(cand))
      );
      peer.candidateQueue = [];
      // 4. Create Answer
      const answer = await pc.createAnswer();

      // 5. Set Local Description (Answer)
      await pc.setLocalDescription(answer);

      // 6. Send Answer back to the caller via Socket
      socket.emit("answer", { to: data.from, answer, from: socket.id });
    } catch (error) {
      console.error("Error in Offer/Answer exchange:", error);
    }
  };

  const handleAnswer = async (data) => {
    const peer = peersRef.current.get(data.from);
    if (!peer || !peer.connection) return;

    const pc = peer.connection;

    if (pc.signalingState === "have-local-offer") {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));

        // --- ADD THIS PART ---
        // Process queued candidates now that the remote description is set
        if (peer.candidateQueue && peer.candidateQueue.length > 0) {
          console.log(
            `Processing ${peer.candidateQueue.length} queued candidates for ${data.from}`
          );
          peer.candidateQueue.forEach((cand) =>
            pc
              .addIceCandidate(new RTCIceCandidate(cand))
              .catch((e) => console.error("Error adding queued candidate", e))
          );
          peer.candidateQueue = []; // Clear the queue
        }
        // ----------------------

        console.log(
          `Successfully transitioned to stable state for: ${data.from}`
        );
      } catch (error) {
        console.error("Failed to set remote answer description:", error);
      }
    }
  };

  const handleIceCandidate = async (data) => {
    const peer = peersRef.current.get(data.from);
    if (peer && data.candidate) {
      try {
        // Ensure we have a remote description before adding candidates
        if (peer.connection.remoteDescription) {
          await peer.connection.addIceCandidate(
            new RTCIceCandidate(data.candidate)
          );
        } else {
          peer.candidateQueue.push(data.candidate);
          // Optional: Queue candidates if remoteDescription isn't ready yet
          console.warn(
            "Remote description not set yet, candidate ignored or queued"
          );
        }
      } catch (e) {
        console.error("ICE Error", e);
      }
    }
  };

  // --- Media Handlers ---
  const toggleAudio = () => {
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !isAudioOn;
      setIsAudioOn(!isAudioOn);
    }
  };

  const toggleVideo = () => {
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !isVideoOn;
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        // 1. Capture the screen
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];

        // 2. Replace the track for all connected peers
        peersRef.current.forEach((peer) => {
          const senders = peer.connection.getSenders();
          const videoSender = senders.find((s) => s.track?.kind === "video");
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        });

        // 3. Handle user stopping share via browser UI (the "Stop sharing" button at the top)
        screenTrack.onended = () => {
          stopScreenSharing();
        };

        setIsScreenSharing(true);
      } catch (error) {
        console.error("Error starting screen share:", error);
      }
    } else {
      stopScreenSharing();
    }
  };

  const stopScreenSharing = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }

    // Replace screen track back with the original camera video track
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
      peersRef.current.forEach((peer) => {
        const senders = peer.connection.getSenders();
        const videoSender = senders.find((s) => s.track?.kind === "video");
        if (videoSender) {
          videoSender.replaceTrack(videoTrack);
        }
      });
    }
    setIsScreenSharing(false);
  };

  const leaveRoom = useCallback(() => {
    socket.emit("leave-room");
    localStream?.getTracks().forEach((track) => track.stop());
    peersRef.current.forEach((peer) => peer.connection.close());
    peersRef.current.clear();
    window.localStream = null;
    router.push("/");
  }, [localStream, router]);

  return (
    <div className="h-screen bg-gray-100 flex flex-col relative">
      {/* Header Info */}
      <div className="absolute top-4 left-4 z-20 bg-black/50 text-white p-2 rounded">
        <p className="text-sm font-bold">Room: {room}</p>
        <p className="text-xs">User: {user?.username}</p>
      </div>

      <VideoGrid localStream={localStream} user={user} />

      <ControlPanel
        isAudioOn={isAudioOn}
        isVideoOn={isVideoOn}
        isScreenSharing={isScreenSharing}
        showChat={showChat}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleScreenShare={() =>
          alert("Screen sharing implementation pending.")
        }
        onToggleChat={() => setShowChat(!showChat)}
        onLeave={leaveRoom}
      />

      {/* Basic Chat Overlay Placeholder */}
      {showChat && (
        <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl z-30 p-4">
          <h2 className="font-bold border-b pb-2">Chat</h2>
          <button
            onClick={() => setShowChat(false)}
            className="text-xs text-red-500"
          >
            Close
          </button>
          {/* Chat message list and input would go here */}
        </div>
      )}
    </div>
  );
};

export default VideoModel;
