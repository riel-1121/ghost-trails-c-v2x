import express from 'express';
import { Server as SocketServer } from 'socket.io';
import { createServer } from 'http';
import path from 'path';
import { GhostTrailsDemo } from './index';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const demo = new GhostTrailsDemo();

console.log('Starting server...');
app.use(express.static(path.join(__dirname, '../public')));

app.get('/test', (req, res) => {
  res.send('Server is running!');
});

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

setInterval(() => {
  demo.step(0.08); // 80ms step
  io.emit('update', demo.getData());
}, 80);

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});