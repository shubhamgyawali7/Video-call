"use client";

import { useState } from "react";
import { useSelector } from "react-redux";

const ChatSidebar = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const { user } = useSelector((state) => state.conference);
  const roomId = useSelector((state) => state.conference.room);
  const chatMessages = useSelector(
    (state) => state.conference.chatMessages[roomId] || []
  );

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  return (
    <div className="w-full h-screen bg-white text-black flex flex-col">
      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {chatMessages.map((msg, index) => (
          <div
            key={index}
            className={`text-black p-2 rounded ${
              msg.userId === user?.id
                ? "bg-blue-100 self-end"
                : "bg-gray-100 self-start"
            }`}
          >
            <strong>{msg.username}: </strong>
            {msg.message}
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-2 border-t border-gray-300 flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 text-black px-2 py-1 border rounded"
          placeholder="Type a message..."
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          className="ml-2 px-3 py-1 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;
