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
    const items = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let roomId = '';
    for (let i = 0; i < 6; i++) {
      roomId += items.charAt(Math.floor(Math.random() * items.length));
    }
    socket?.send(JSON.stringify({ type: "join", payload: { roomId } }));
    setUserRoom(roomId);
    setIsInRoom(true);

  }

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
    <div className="w-full h-screen bg-black text-white flex flex-col justify-center items-center">
      <div className="flex flex-col gap-2 items-center absolute top-4 right-4">
        <button
          className="border rounded px-4 py-2"
          onClick={socket ? disconnectFromServer : connectToServer}
        >
          {socket ? "Disconnect" : "Connect"}
        </button>
        <span>{socket ? "Connected" : "Disconnected"}</span>
      </div>
      <div>
        <input type="text" placeholder="Enter room id" ref={joinRoomRef} className="border px-4 py-2 rounded mr-2 mb-4"/>
        <button onClick={joinRoom} className="border rounded mr-2 p-2">JOIN ROOM</button>
        <button onClick={createRoom} className="border rounded mr-2 p-2">CREATE ROOM</button>
      </div>
      <div className="border w-1/2 mx-auto h-3/4 ">
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
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
