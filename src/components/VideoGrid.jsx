"use client";

import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { FiUser } from "react-icons/fi";

/* ── Single video tile ── */
const VideoElement = ({ stream, username, isLocal }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && stream instanceof MediaStream) {
      video.srcObject = stream;
      if (video.readyState >= 2) {
        video.play().catch((e) => console.error("Immediate play error:", e));
      }
      video.onloadedmetadata = () => {
        video.play().catch((e) => console.error("Video play error:", e));
      };
    }
  }, [stream]);

  return (
    <div className="relative rounded-2xl overflow-hidden bg-[#0d1117] aspect-video
                    border border-transparent transition-all duration-300
                    hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={Boolean(isLocal)}
        className="w-full h-full object-cover block"
      />
      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 h-16
                      bg-gradient-to-t from-black/75 to-transparent pointer-events-none" />
      {/* Name badge */}
      <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5">
        {isLocal && (
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
        )}
        <span className="text-white text-xs font-semibold drop-shadow">
          {username}{isLocal ? " (You)" : ""}
        </span>
      </div>
    </div>
  );
};

/* ── Loading placeholder tile ── */
const LoadingTile = ({ username }) => (
  <div className="relative rounded-2xl overflow-hidden aspect-video
                  bg-gradient-to-br from-[#111827] to-[#1a2035]
                  border border-white/5
                  flex flex-col items-center justify-center gap-3">
    <div className="w-11 h-11 rounded-full bg-indigo-500/15 border border-indigo-500/20
                    flex items-center justify-center">
      <FiUser size={20} className="text-indigo-400" />
    </div>
    <div className="text-center">
      <p className="text-slate-400 text-sm font-medium">{username}</p>
      <p className="text-slate-600 text-xs mt-0.5">Connecting...</p>
    </div>
    {/* Pulse ring */}
    <div className="absolute w-11 h-11 rounded-full border-2 border-indigo-500/30 animate-pulse-glow" />
  </div>
);

/* ── Empty state ── */
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-600">
    <div className="w-16 h-16 rounded-full bg-indigo-500/5 border-2 border-dashed border-indigo-500/20
                    flex items-center justify-center">
      <FiUser size={26} className="text-indigo-900" />
    </div>
    <p className="text-sm">Waiting for camera access...</p>
  </div>
);

/* ── Grid layout helper ── */
const getGridCols = (count) => {
  if (count === 1) return "grid-cols-1 max-w-3xl mx-auto";
  if (count === 2) return "grid-cols-2";
  if (count <= 4) return "grid-cols-2";
  if (count <= 6) return "grid-cols-3";
  return "grid-cols-4";
};

const VideoGrid = ({ localStream, user }) => {
  const peers = useSelector((state) => state.conference.peers || {});
  const allPeers = Object.entries(peers);
  const total = allPeers.length + (localStream ? 1 : 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 pb-28">
      {total === 0 && <EmptyState />}
      <div className={`grid gap-4 ${getGridCols(total)}`}>
        {localStream && user && (
          <VideoElement
            key={`local-${user.id || "me"}`}
            stream={localStream}
            username={user.username}
            isLocal={true}
          />
        )}
        {allPeers.map(([socketId, peer]) =>
          peer.stream instanceof MediaStream ? (
            <VideoElement
              key={socketId}
              stream={peer.stream}
              username={peer.username}
              isLocal={false}
            />
          ) : (
            <LoadingTile key={socketId} username={peer.username} />
          )
        )}
      </div>
    </div>
  );
};

export default VideoGrid;
