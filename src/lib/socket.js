import { io } from "socket.io-client";
const URL = process.env.NEXT_PUBLIC_API_URL;
const socket = io(URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

export default socket;
