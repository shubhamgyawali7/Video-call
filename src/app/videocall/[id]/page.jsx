"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser, setRoom } from "@/store/conferenceSlice.js";
import VideoModel from "@/components/VideoModel";

export default function Video() {
  const params = useParams(); // dynamic route parameters ([id])
  const searchParams = useSearchParams(); // query parameters (username)
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);

  const roomId = params.id;
  const username = searchParams.get("username");

  useEffect(() => {
    if (roomId && username) {
      dispatch(
        setUser({
          id: generateUserId(),
          username: username,
        })
      );
      dispatch(setRoom(roomId));
      setIsReady(true);
    }
  }, [roomId, username, dispatch]);

  const generateUserId = () => {
    return Math.random().toString(36).substr(2, 9);
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <div className="w-[52px] h-[52px] rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin-slow" />
          <p className="text-slate-400 text-[15px] font-medium">Joining Conference...</p>
        </div>
      </div>
    );
  }

  return <VideoModel />;
}
