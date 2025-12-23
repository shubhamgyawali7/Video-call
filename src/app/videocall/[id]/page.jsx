"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser, setRoom } from "@/store/conferenceSlice.js";

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading Conference...</p>
        </div>
      </div>
    );
  }

  return <VideoModel />;
}
