'use client'

import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiMonitor, FiMessageCircle } from 'react-icons/fi';

const ControlButton = ({ icon: Icon, isActive, onClick, activeClass = 'bg-green-600', inactiveClass = 'bg-gray-600' }) => {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-full text-white transition-all duration-200 hover:scale-110 ${
        isActive ? activeClass : inactiveClass
      }`}
    >
      <Icon size={20} />
    </button>
  );
};

const ControlPanel = ({
  isAudioOn,
  isVideoOn,
  isScreenSharing,
  showChat,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
      <div className="flex space-x-4 bg-gray-800 p-4 rounded-full shadow-lg">
        <ControlButton
          icon={isAudioOn ? FiMic : FiMicOff}
          isActive={isAudioOn}
          onClick={onToggleAudio}
          activeClass="bg-green-600"
          inactiveClass="bg-red-600"
        />
        
        <ControlButton
          icon={isVideoOn ? FiVideo : FiVideoOff}
          isActive={isVideoOn}
          onClick={onToggleVideo}
          activeClass="bg-green-600"
          inactiveClass="bg-red-600"
        />
        
        <ControlButton
          icon={FiMonitor}
          isActive={isScreenSharing}
          onClick={onToggleScreenShare}
          activeClass="bg-blue-600"
          inactiveClass="bg-gray-600"
        />
        
        <ControlButton
          icon={FiMessageCircle}
          isActive={showChat}
          onClick={onToggleChat}
          activeClass="bg-purple-600"
          inactiveClass="bg-gray-600"
        />
      </div>
    </div>
  );
};

export default ControlPanel;