"use client";

import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { FiSend, FiMessageCircle, FiX } from "react-icons/fi";

const ChatSidebar = ({ onSendMessage, onClose }) => {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);

  const { user } = useSelector((state) => state.conference);
  const roomId = useSelector((state) => state.conference.room);
  const chatMessages = useSelector(
    (state) => state.conference.chatMessages?.[roomId] || []
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  return (
    <div className="animate-fade-in w-80 flex flex-col h-full
                    bg-[#0a0d14]/95 backdrop-blur-xl
                    border-l border-white/[0.07]">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5
                      border-b border-white/[0.07]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20
                          flex items-center justify-center">
            <FiMessageCircle size={14} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">Chat</p>
            <p className="text-xs text-slate-600">{chatMessages.length} messages</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center
                       bg-white/5 border border-white/[0.07] text-slate-500
                       transition-all duration-150 cursor-pointer
                       hover:bg-red-500/15 hover:text-red-400 hover:border-red-500/20"
          >
            <FiX size={13} />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {chatMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 gap-2.5 text-slate-600 pt-16">
            <FiMessageCircle size={32} className="text-indigo-900/60" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs">Say hello to everyone 👋</p>
          </div>
        )}

        {chatMessages.map((msg, index) => {
          const isOwn = msg.userId === user?.id;
          return (
            <div key={index} className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
              <span className="text-[10px] text-slate-600 font-medium mb-1">
                {isOwn ? "You" : msg.username}
              </span>
              <div className={`max-w-[82%] px-3 py-2 text-sm text-white leading-relaxed break-words ${
                isOwn
                  ? "bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl rounded-br-sm"
                  : "bg-white/7 border border-white/[0.06] rounded-2xl rounded-bl-sm"
              }`}>
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 items-center px-4 py-3
                      border-t border-white/[0.07]">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Send a message..."
          className="flex-1 px-3.5 py-2.5 rounded-xl text-sm text-slate-100
                     bg-white/5 border border-white/10 placeholder:text-slate-600
                     outline-none transition-all
                     focus:border-indigo-500 focus:bg-indigo-500/5
                     focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim()}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                     transition-all duration-200 cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed
                     bg-gradient-to-br from-indigo-500 to-violet-600 text-white
                     hover:scale-105 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)]
                     disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          <FiSend size={15} />
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
