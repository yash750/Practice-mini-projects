const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Store polls in memory
let polls = [];

app.use(express.static('client'));

app.get('/', (req, res) => {
    res.sendFile(path.resolve('client/index.html'));
});

io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Send existing polls to new user
    socket.emit('existingPolls', polls);
    
    socket.on('createPoll', (poll) => {
        console.log('New poll created:', poll);
        polls.push(poll);
        io.emit('newPoll', poll);
    });
    
    socket.on('vote', (voteData) => {
        console.log('Vote received:', voteData);
        const poll = polls.find(p => p.id === voteData.pollId);
        if (poll) {
            poll.options[voteData.optionId].votes++;
            poll.totalVotes++;
            io.emit('pollUpdate', poll);
        }
    });
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});