"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

// 1. Keep this outside the main component
const VideoElement = ({ stream, username, isLocal }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (stream) {
      console.log(
        `Stream for ${username} tracks:`,
        stream.getTracks().map((t) => `${t.kind}: ${t.enabled}`)
      );

      // Check if the stream is active
      if (stream.active === false) {
        console.warn(`Stream for ${username} is inactive!`);
      }
    }
    const video = videoRef.current;
    // Standard assignment logic
    if (video && stream instanceof MediaStream) {
      video.srcObject = stream;

      // If the video is already ready, play it immediately
      if (video.readyState >= 2) {
        video.play().catch((e) => console.error("Immediate play error:", e));
      }

      // 3. Ensure the video plays once metadata is loaded
      video.onloadedmetadata = () => {
        video.play().catch((e) => console.error("Video play error:", e));
      };
    }
  }, [stream]);

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <video
        className="rounded border w-full max-w-[800px] aspect-video object-cover"
        ref={videoRef} // This now correctly points to the top-level ref
        autoPlay
        playsInline
        muted={Boolean(isLocal)}
      />
      <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-white text-xs">
        {username} {isLocal ? "(You)" : ""}
      </div>
    </div>
  );
};

const VideoGrid = ({ localStream, user }) => {
  // Use a default empty object to prevent mapping errors
  const peers = useSelector((state) => state.conference.peers || {});
  const allPeers = Object.entries(peers);

  const totalParticipants = allPeers.length + (localStream ? 1 : 0);

  const getGridClass = () => {
    if (totalParticipants === 1) return "grid-cols-1";
    if (totalParticipants === 2) return "grid-cols-1 md:grid-cols-2";
    if (totalParticipants <= 4) return "grid-cols-1 md:grid-cols-2";
    if (totalParticipants <= 6)
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto h-[200px]">
      <div className={`grid gap-4 ${getGridClass()}`}>
        {/* Render Local User - ALWAYS provide a unique key */}
        {localStream && user && (
          <VideoElement
            key={`local-${user.id || "me"}`}
            stream={localStream}
            username={user.username}
            isLocal={true}
          />
        )}

        {/* Render Peers with Validation */}
        {allPeers.map(([socketId, peer]) => {
          // Verify it's a valid MediaStream to prevent Ref assignment crashes
          const hasValidStream = peer.stream instanceof MediaStream;

          if (!hasValidStream) {
            return (
              <div
                key={socketId}
                className="rounded border bg-gray-900 aspect-video flex items-center justify-center text-white"
              >
                Loading {peer.username}...
              </div>
            );
          }

          return (
            <VideoElement
              key={socketId}
              stream={peer.stream}
              username={peer.username}
              isLocal={false}
            />
          );
        })}
      </div>
    </div>
  );
};

export default VideoGrid;
