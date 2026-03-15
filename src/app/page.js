'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import JoinRoomModal from '@/components/JoinRoomModal';

export default function Home() {
  const [showJoinModal, setShowJoinModal] = useState(true);
  const router = useRouter();

  const handleJoinRoom = (roomId, username) => {
    router.push(`/room/${roomId}?username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="noise min-h-screen bg-animated relative overflow-hidden flex items-center justify-center">
      {/* Ambient glowing orbs */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', filter: 'blur(60px)' }} />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(40px)' }} />

      <div className="relative z-10 w-full max-w-md px-4">
        <JoinRoomModal show={showJoinModal} onJoin={handleJoinRoom} />
      </div>
    </div>
  );
}