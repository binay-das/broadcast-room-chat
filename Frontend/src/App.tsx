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
    setIsInRoom(true)
  };

  const sendMsg = () => {
    const msg = msgRef.current?.value;
    if (!msg || !userRoom) return;

    socket?.send(
      JSON.stringify({ type: "chat", payload: { msg, room: userRoom } })
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

  useEffect(() => {
    if (socket) {
      socket.onmessage = (ev) => {
        setMessages((prev) => [...prev, ev.data]);
      };
    }
  }, [socket]);

  return (
    <div className="w-full h-screen bg-black text-white">
      <div className="flex flex-col gap-2 items-center absolute top-4 right-4">
        <button className="border rounded px-4 py-2" onClick={connectToServer}>
          {socket ? "Disconnect" : "Connect"}
        </button>
        <span>{socket ? "Connected" : "Disconnected"}</span>
      </div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <div>
        <h1>JOIN a ROOM</h1>
        <input type="text" placeholder="Enter room id" ref={joinRoomRef} />
        <button onClick={joinRoom}>JOIN ROOM</button>
      </div>
      {isInRoom && (
        <div>
          <h1>ENTER MSG</h1>
          <input type="text" placeholder="Enter msg" ref={msgRef} />
          <button onClick={sendMsg}>SEND MSG</button>
        </div>
      )}
    </div>
  );
}

export default App;
