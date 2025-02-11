import { useEffect, useRef, useState } from "react";

function App() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<{
    msg: string,
    isUser: boolean
  }[]>([]);
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

    setMessages((prev) => [...prev, {
      msg,
      isUser: true
    }]);

    if (msgRef.current) {
      msgRef.current.value = "";
    }
  };

  const connectToServer = () => {
    const socket = new WebSocket("ws://localhost:3000");
    socket.onopen = () => {
      console.log("Connected to server");
      setSocket(socket);
    };
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
        setMessages((prev) => [...prev, {msg: ev.data, isUser: false}]);
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
    <div className="w-full h-screen bg-gray-900 text-white flex flex-col lg:flex-row lg:gap-4 justify-center items-center">
      <div className="flex flex-col gap-1 items-center absolute top-4 right-4">
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
      <div className="flex gap-2 mb-4 lg:flex-col lg:gap-2 lg:w-1/6 border">
        <input
          type="text"
          placeholder="Enter room id"
          ref={joinRoomRef}
          className="border px-4 py-2 rounded mr-2 bg-gray-700 focus:ring focus:ring-blue-500 lg:w-full"
        />
        <button
          onClick={joinRoom}
          className="border px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition"
        >
          Join Room
        </button>
        <button
          onClick={createRoom}
          className="border px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition"
        >
          Create Room
        </button>
      </div>
      <div className="border w-full max-w-2xl h-8/10 lg:h-9/10 overflow-y-auto bg-gray-800 rounded-lg p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`${msg.isUser ? "bg-blue-500 ml-auto" : "bg-gray-700 mr-auto"} max-w-sm p-2 rounded-md mb-2`}>
            {msg.msg}
          </div>
        ))}
      </div>
        <div className={`mt-4 lg:flex flex-col lg:gap-4 lg:w-1/5 lg:mt-0 border ${!isInRoom && `invisible` }`}>
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
            Send Message
          </button>
        </div>
    </div>
  );
}

export default App;
