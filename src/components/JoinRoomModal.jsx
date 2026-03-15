"use client";

import { useState } from "react";
import { FiUser, FiHash, FiArrowRight, FiVideo, FiUsers, FiZap } from "react-icons/fi";

const features = [
  { icon: FiUsers, text: "Multi-Party" },
  { icon: FiZap,   text: "Low Latency" },
  { icon: FiVideo, text: "HD Video" },
];

const JoinRoomModal = ({ show, onJoin }) => {
  const [username, setUsername] = useState("");
  const [roomId,   setRoomId]   = useState("");
  const [loading,  setLoading]  = useState(false);

  const generateRoomId = () => Math.random().toString(36).substr(2, 6).toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    onJoin(roomId.trim() || generateRoomId(), username.trim());
  };

  if (!show) return null;

  return (
    <div className="animate-slide-up w-full max-w-md mx-auto">

      {/* ── Brand ── */}
      <div className="flex flex-col items-center mb-8">
        <div className="animate-float w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                        bg-gradient-to-br from-indigo-500 to-violet-600
                        shadow-[0_0_30px_rgba(99,102,241,0.55)]">
          <FiVideo size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-extrabold gradient-text mb-1 tracking-tight">NexMeet</h1>
        <p className="text-sm text-slate-400">Crystal-clear video conferencing, instantly</p>
      </div>

      {/* ── Feature pills ── */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {features.map(({ icon: Icon, text }) => (
          <span key={text}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                       bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            <Icon size={11} />
            {text}
          </span>
        ))}
      </div>

      {/* ── Card ── */}
      <div className="rounded-2xl p-8
                      bg-[#1a2035]/70 backdrop-blur-xl
                      border border-white/[0.07]
                      shadow-[0_25px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]">

        <h2 className="text-xl font-semibold text-slate-100 mb-6">Join a Conference</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Name */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              Your Name
            </label>
            <div className="relative">
              <FiUser size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                autoFocus
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your display name"
                required
                className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-slate-100
                           bg-white/5 border border-white/10
                           placeholder:text-slate-600
                           outline-none transition-all
                           focus:border-indigo-500 focus:bg-indigo-500/5
                           focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Room ID */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              Room ID <span className="normal-case text-slate-600 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <FiHash size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Leave empty to create new room"
                className="w-full pl-9 pr-4 py-3 rounded-xl text-sm text-slate-100
                           bg-white/5 border border-white/10
                           placeholder:text-slate-600 uppercase tracking-widest
                           outline-none transition-all
                           focus:border-indigo-500 focus:bg-indigo-500/5
                           focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <p className="text-xs text-slate-600">Share the Room ID with others to invite them</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !username.trim()}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl
                       font-semibold text-sm text-white
                       bg-gradient-to-r from-indigo-500 to-violet-600
                       transition-all duration-200
                       hover:shadow-[0_8px_25px_rgba(99,102,241,0.5)] hover:-translate-y-0.5
                       active:translate-y-0 active:shadow-none
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Joining...
              </>
            ) : (
              <>
                {roomId.trim() ? "Join Room" : "Create & Join Room"}
                <FiArrowRight size={15} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer note */}
      <p className="text-center mt-5 text-xs text-slate-600">
        By joining, you agree to allow camera &amp; microphone access
      </p>
    </div>
  );
};

export default JoinRoomModal;
