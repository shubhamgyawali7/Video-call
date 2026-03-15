'use client'

import {
  FiMic, FiMicOff, FiVideo, FiVideoOff,
  FiMonitor, FiMessageCircle, FiPhoneOff, FiUsers,
} from 'react-icons/fi';

/* ── Individual control button ── */
const CtrlBtn = ({ icon: Icon, label, onClick, colorClass, labelClass }) => (
  <div className="flex flex-col items-center gap-1.5">
    <button
      onClick={onClick}
      title={label}
      className={`w-13 h-13 rounded-full flex items-center justify-center
                  transition-all duration-200 cursor-pointer border border-transparent
                  hover:scale-110 hover:-translate-y-0.5 active:scale-95
                  ${colorClass}`}
    >
      <Icon size={20} />
    </button>
    <span className={`text-[10px] font-medium tracking-wide ${labelClass ?? 'text-slate-500'}`}>
      {label}
    </span>
  </div>
);

const ControlPanel = ({
  isAudioOn, isVideoOn, isScreenSharing, showChat,
  onToggleAudio, onToggleVideo, onToggleScreenShare, onToggleChat,
  onLeave, room, participantCount,
}) => {
  return (
    <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-6 py-3.5
                      bg-[#0a0d14]/90 backdrop-blur-2xl
                      rounded-full border border-white/[0.07]
                      shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]">

        {/* Room info pill */}
        {room && (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 mr-2
                            bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span className="text-[11px] font-bold text-indigo-300 tracking-widest uppercase">
                {room}
              </span>
              {participantCount != null && (
                <span className="flex items-center gap-1 text-[10px] text-slate-500">
                  <FiUsers size={9} /> {participantCount}
                </span>
              )}
            </div>
            {/* Divider */}
            <div className="w-px h-8 bg-white/[0.07] mx-1" />
          </>
        )}

        {/* Mic */}
        <CtrlBtn
          icon={isAudioOn ? FiMic : FiMicOff}
          label={isAudioOn ? 'Mute' : 'Unmute'}
          onClick={onToggleAudio}
          colorClass={isAudioOn
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
            : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'}
        />

        {/* Camera */}
        <CtrlBtn
          icon={isVideoOn ? FiVideo : FiVideoOff}
          label={isVideoOn ? 'Stop Video' : 'Start Video'}
          onClick={onToggleVideo}
          colorClass={isVideoOn
            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
            : 'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25'}
        />

        {/* Screen Share */}
        <CtrlBtn
          icon={FiMonitor}
          label={isScreenSharing ? 'Stop Share' : 'Share Screen'}
          onClick={onToggleScreenShare}
          colorClass={isScreenSharing
            ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:bg-indigo-600'
            : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25'}
        />

        {/* Chat */}
        <CtrlBtn
          icon={FiMessageCircle}
          label="Chat"
          onClick={onToggleChat}
          colorClass={showChat
            ? 'bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:bg-violet-600'
            : 'bg-violet-500/15 text-violet-400 border-violet-500/30 hover:bg-violet-500/25'}
        />

        {/* Divider */}
        <div className="w-px h-8 bg-white/[0.07] mx-1" />

        {/* Leave */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={onLeave}
            title="Leave Room"
            className="w-13 h-13 rounded-full flex items-center justify-center cursor-pointer
                       bg-red-500 text-white border-none
                       shadow-[0_0_20px_rgba(239,68,68,0.45)]
                       transition-all duration-200
                       hover:scale-110 hover:-translate-y-0.5 hover:bg-red-600
                       hover:shadow-[0_8px_25px_rgba(239,68,68,0.7)]
                       active:scale-95"
          >
            <FiPhoneOff size={20} />
          </button>
          <span className="text-[10px] font-medium text-red-400 tracking-wide">Leave</span>
        </div>

      </div>
    </div>
  );
};

export default ControlPanel;