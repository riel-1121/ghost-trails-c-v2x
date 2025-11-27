const express = require('express');
const { Server } = require('socket.io');
const { createServer } = require('http');
const path = require('path');

class GhostTrailsDemo {
  constructor() {
    this.vehicles = [];
    this.ghosts = [];
    this.highwayLength = 1500;
    this.icePosition = 300;
    this.totalTime = 0;
    this.reset();
  }

  reset() {
    this.vehicles = [
      { id: 0, x: 50, y: 50, speed: 5, color: '#3498db', type: 'lead', direction: 0, lateralSpeed: 0 },
      { id: 1, x: 200, y: 50, speed: 5, color: '#e74c3c', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 2, x: 350, y: 50, speed: 5, color: '#27ae60', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 3, x: 500, y: 50, speed: 5, color: '#f39c12', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 4, x: 100, y: 50, speed: 4.5, color: '#9b59b6', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 5, x: 250, y: 50, speed: 5.5, color: '#1abc9c', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 6, x: 400, y: 50, speed: 4, color: '#e67e22', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 7, x: 150, y: 50, speed: 5.2, color: '#34495e', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 8, x: 300, y: 50, speed: 4.8, color: '#16a085', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 9, x: 450, y: 50, speed: 5.3, color: '#f1c40f', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 10, x: 50, y: 50, speed: 4.7, color: '#e74c3c', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 11, x: 200, y: 50, speed: 5.1, color: '#9b59b6', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 12, x: 350, y: 50, speed: 4.9, color: '#27ae60', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 13, x: 500, y: 50, speed: 5.4, color: '#f39c12', type: 'follow', direction: 0, lateralSpeed: 0 },
      { id: 14, x: 100, y: 50, speed: 4.6, color: '#1abc9c', type: 'follow', direction: 0, lateralSpeed: 0 },
    ];
    this.ghosts = [];
    this.totalTime = 0;
  }

  step(deltaTime) {
    this.totalTime += deltaTime;
    this.vehicles.forEach(vehicle => {
      if (vehicle.type === 'follow') {
        let lateralForce = 0;
        this.ghosts.forEach(ghost => {
          const dx = ghost.x - vehicle.x;
          const dist = Math.abs(dx);
          if (dist < 120 && ghost.age < 60) {
            const strength = (1 - ghost.age / 60) * 0.2;
            lateralForce += strength * (dx > 0 ? -1 : 1);
          }
        });
        vehicle.lateralSpeed += lateralForce * 0.05;
        vehicle.lateralSpeed *= 0.95;
        vehicle.y = 50 + vehicle.lateralSpeed * 10;
      }
      vehicle.x += vehicle.speed;
      if (vehicle.x > this.highwayLength) {
        vehicle.x = -50;
        vehicle.direction = 0;
        vehicle.lateralSpeed = 0;
        vehicle.y = 50;
      }
    });

    const lead = this.vehicles.find(v => v.type === 'lead');
    if (lead && lead.x >= this.icePosition - 5 && lead.x <= this.icePosition + 5 && this.ghosts.length === 0) {
      lead.x += (Math.random() - 0.5) * 20;
      lead.y += (Math.random() - 0.5) * 10;
      this.ghosts.push({ x: this.icePosition, y: 50, age: 0, maxAge: 60 });
    }

    if (this.totalTime > 8 && this.ghosts.length === 1) {
      this.ghosts.push({ x: this.icePosition + 100, y: 50, age: 0, maxAge: 60 });
    }

    this.ghosts.forEach(ghost => {
      ghost.age += deltaTime;
    });
    this.ghosts = this.ghosts.filter(ghost => ghost.age < ghost.maxAge);
  }

  getData() {
    return {
      vehicles: this.vehicles,
      ghosts: this.ghosts,
      highwayLength: this.highwayLength,
      icePosition: this.icePosition,
      totalTime: this.totalTime,
    };
  }
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const demo = new GhostTrailsDemo();

console.log('Starting server...');
app.use(express.static(path.join(__dirname, 'public')));

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
  demo.step(0.08);
  io.emit('update', demo.getData());
}, 80);

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});