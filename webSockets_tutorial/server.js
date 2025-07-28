import express from 'express';
import {createServer} from 'http';
import {Server} from 'socket.io';
import path from 'path';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get('/', (req, res) => {
    res.sendFile(path.resolve('./index.html'));
})

io.on('connection', (socket) => {
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    })
})



server.listen(3000, () => {
    console.log('Server is running on port 3000');
})

