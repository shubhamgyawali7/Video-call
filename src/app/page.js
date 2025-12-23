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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl font-bold mb-8">Video Conference</h1>
        <p className="text-xl mb-8">Connect with people around the world</p>
        <JoinRoomModal 
          show={showJoinModal}
          onJoin={handleJoinRoom}
        />
      </div>
  
    </div>
  );
}