import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { GhostTrailsDemo, GhostTrailsTimeFold } from './index';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Create both versions for comparison
const demoTimeFold = new GhostTrailsDemo('timefold');
const demoLinear = new GhostTrailsDemo('linear');

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

async function runLoop() {
  let packetCount = 0;
  while (true) {
    try {
      // Step both simulations
      demoTimeFold.step(0.08); // 80ms step
      demoLinear.step(0.08); // 80ms step
      
      const dataTimeFold = demoTimeFold.getData();
      const dataLinear = demoLinear.getData();
      packetCount++;
      
      // Add TimeFold statistics for real-time monitoring
      const timeFoldStats = {
        fleetMemory: GhostTrailsTimeFold.fleetMemoryAfterBroadcasts(packetCount),
        maxIterations: GhostTrailsTimeFold.maxIterationsBeforeSaturation(),
        packetCount: packetCount
      };
      
      // Emit comparative data
      io.emit('update', { 
        timeFold: dataTimeFold,
        linear: dataLinear,
        timeFoldStats,
        comparison: {
          collisionReduction: ((demoLinear.getMetrics().totalCollisions - demoTimeFold.getMetrics().totalCollisions) / Math.max(demoLinear.getMetrics().totalCollisions, 1)) * 100,
          avoidanceEfficiency: demoTimeFold.getMetrics().avoidanceActions / Math.max(demoLinear.getMetrics().avoidanceActions, 1),
          communicationOverhead: demoTimeFold.getMetrics().communicationOverhead / Math.max(demoLinear.getMetrics().communicationOverhead, 1)
        }
      });
      await new Promise(resolve => setTimeout(resolve, 80));
    } catch (error) {
      console.error('Simulation error:', error);
      // Reset both demos on error
      demoTimeFold.reset();
      demoLinear.reset();
    }
  }
}

server.listen(3000, () => {
  console.log('Server running on port 3000');
  runLoop();
});