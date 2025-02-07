import { useEffect, useRef, useState } from "react";

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [userRoom, setUserRoom] = useState<string | null>(null);

  const [isInRoom, setIsInRoom] = useState<boolean>(false);

  const joinRoomRef = useRef<HTMLInputElement>(null);
  const msgRef = useRef<HTMLInputElement>(null);

  const joinRoom = () => {
    const roomId = joinRoomRef.current?.value;
    if (!roomId) return;

    socket?.send(JSON.stringify({ type: "join", payload: { roomId } }));
    setUserRoom(roomId);
    setIsInRoom(true);
  };

  const createRoom = () => {
    const items =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let roomId = "";
    for (let i = 0; i < 6; i++) {
      roomId += items.charAt(Math.floor(Math.random() * items.length));
    }
    if (joinRoomRef.current) {
      joinRoomRef.current.value = roomId;
    }
    socket?.send(JSON.stringify({ type: "join", payload: { roomId } }));
    setUserRoom(roomId);
    setIsInRoom(true);
  };

  const sendMsg = () => {
    const msg = msgRef.current?.value;
    if (!msg || !userRoom) return;

    socket?.send(
      // JSON.stringify({ type: "chat", payload: { msg, room: userRoom } })
      JSON.stringify({ type: "chat", payload: { message: msg } })
    );

    if (msgRef.current.value) {
      msgRef.current.value = "";
    }
  };

  const connectToServer = () => {
    const socket = new WebSocket("ws://localhost:3000");
    socket.onopen = () => console.log("Connected to server");
    setSocket(socket);
  };

  const disconnectFromServer = () => {
    console.log("Disconnected from server");
    socket?.close();
    setSocket(null);
    setIsInRoom(false);
    setUserRoom(null);
  };

  useEffect(() => {
    if (socket) {
      socket.onmessage = (ev) => {
        setMessages((prev) => [...prev, ev.data]);
      };

      socket.onclose = () => {
        console.log("Disconnected from server");
        setSocket(null);
        setIsInRoom(false);
        setUserRoom(null);
      };
    }
  }, [socket]);

  return (
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col justify-center items-center">
      <div className="flex flex-col gap-2 items-center absolute top-4 right-4">
        <button
          className={`border rounded px-4 py-2 cursor-pointer`}
          onClick={socket ? disconnectFromServer : connectToServer}
        >
          {socket ? "Disconnect" : "Connect"}
        </button>
        <span className={socket ? "text-green-400" : "text-red-400"}>
          {socket ? "Connected" : "Disconnected"}
        </span>
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Enter room id"
          ref={joinRoomRef}
          className="border px-4 py-2 rounded mr-2 bg-gray-700 focus:ring focus:ring-blue-500"
        />
        <button
          onClick={joinRoom}
          className="border px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition"
        >
          JOIN ROOM
        </button>
        <button
          onClick={createRoom}
          className="border px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition"
        >
          CREATE ROOM
        </button>
      </div>
      <div className="border w-full max-w-2xl h-80 overflow-y-auto bg-gray-800 rounded-lg p-4">
        {messages.map((msg, index) => (
          <div key={index} className="bg-gray-700 p-2 rounded-md mb-2">
            {msg}
          </div>
        ))}
      </div>
      {isInRoom && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter msg"
            ref={msgRef}
            className="border px-4 py-2 rounded bg-gray-800 text-white focus:ring focus:ring-blue-500"
          />
          <button
            onClick={sendMsg}
            className="border px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 transition"
          >
            SEND MSG
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
