import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  room: null,
  peers: {}, // changed from array to object
  chatMessages: {},
};

const conferenceSlice = createSlice({
  name: "conference",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setRoom: (state, action) => {
      state.room = action.payload;
    },
    addChatMessage: (state, action) => {
      const { roomId, ...msg } = action.payload;
      state.chatMessages[roomId] = [...(state.chatMessages[roomId] || []), msg];
    },
    addPeer: (state, action) => {
      const { socketId, userId, username, stream } = action.payload;

      state.peers[socketId] = {
        ...(state.peers[socketId] || {}),
        userId,
        username,
        stream:
          stream ||
          (state.peers[socketId] && state.peers[socketId].stream) ||
          null,
      };
    },
    removePeer: (state, action) => {
      console.log("Before Peers=>", state.peers);
      // action.payload should be the socketId of the user who left
      state.peers = state.peers.filter(
        (peer) => peer.socketId !== action.payload
      );

      console.log("After Peers=>", state.peers);
    },
  },
});

export const { setUser, setRoom, addChatMessage, addPeer, removePeer } =
  conferenceSlice.actions;
export default conferenceSlice.reducer;
