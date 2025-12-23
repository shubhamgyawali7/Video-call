export const generateRoomId = () => {
  return Math.random().toString(36).substr(2, 8).toUpperCase();
};

export const generateUserId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

export const validateRoomId = (roomId) => {
  return roomId && /^[A-Z0-9]{6,12}$/i.test(roomId.trim());
};

export const validateUsername = (username) => {
  return username && username.trim().length >= 2 && username.trim().length <= 50;
};