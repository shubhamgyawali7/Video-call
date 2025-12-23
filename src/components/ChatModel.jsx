"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import socket from "@/lib/socket.js";
import ChatSidebar from "./ChatSidebar";
import { addChatMessage } from "@/store/conferenceSlice.js";

const ChatModel = () => {
  const dispatch = useDispatch();
  const { user, room } = useSelector((state) => state.conference);

  useEffect(() => {
    if (!user || !room) return;

    // console.log("Herro");

    // Client connect event
    socket.on("connect", () => {
      console.log("Connected to server with id:", socket.id);
    });

    // Join room
    socket.emit("join-room", {
      roomId: room,
      userId: user.id,
      username: user.username,
    });

    // Listen for messages from server
    socket.on("chat-message", (msg) => {
      
      dispatch(addChatMessage(msg));
    });

    // Cleanup listeners
    return () => {
      socket.off("chat-message");
      socket.off("connect");
    };
  }, [user, room, dispatch]);

  const sendChatMessage = (message) => {
    if (!message.trim()) return;
    const msgData = {
      roomId: room,
      message: message.trim(),
      userId: user.id,
      username: user.username,
    };

    // Send to server (don’t dispatch here → avoid duplicates)
    socket.emit("chat-message", msgData);
  };

  return <ChatSidebar onSendMessage={sendChatMessage} />;
};

export default ChatModel;
