import { WebSocket, WebSocketServer } from 'ws';
const wss = new WebSocketServer({ port: 3000 });
interface User {
    socket: WebSocket;
    room: string;
}
const allUsers: User[] = [];

wss.on('connection', (socket) => {
    socket.on('message', (msg: string) => {
        const parsedMsg = JSON.parse(msg);

        if (parsedMsg.type === 'join') {
            allUsers.push({
                socket,
                room: parsedMsg.payload.roomId
            });
        } else if (parsedMsg.type === 'chat') {
            const room = allUsers.find(x => x.socket === socket);
            if (!room) {
                return;             
                // if this user had ever send a request to join the server, it should be present in the array, find it and get the roomId
            }

            const targetedUsers = allUsers.filter(x => x.room === room);

            targetedUsers.forEach(targetedUser => {
                if (targetedUser.socket !== socket) {
                    targetedUser.socket.send(parsedMsg.payload.message)
                }
            });
        }
    });
});