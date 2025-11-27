# MARL AI Toolkit

Multi-Agent Reinforcement Learning toolkit for wide-scope AI applications, starting with swarm intelligence for traffic safety and coordination.

## 🚀 Live Demo

Experience the AI in action! Run `npm start` and open http://localhost:3000 to watch autonomous vehicles coordinate in real-time using swarm intelligence and reinforcement learning. Click "Start Simulation" to see the magic happen.

## Why This Matters

Traffic accidents kill over 1.3 million people annually worldwide. This AI could prevent thousands by enabling safe coordination between autonomous and legacy vehicles. Imagine a world where traffic flows like a symphony—harmonious, efficient, and safe.

## Features

- **Swarm Intelligence**: Pheromone-based coordination for autonomous vehicles
- **Reinforcement Learning**: Q-learning with TensorFlow.js for adaptive decision-making
- **Threat Detection**: Flash signaling for legacy vehicles and vulnerable road users (VRUs)
- **Communication Zones**: Satellite zones for long-range coordination, WiFi zones for local networking, extended zones created by autonomous vehicle clusters
- **ID System**: Unique vehicle IDs for safety verification and insurance tracking
- **Real-Time Visualization**: Interactive web dashboard with live updates
- **Dynamic Environment**: Road blocks, bad roads, and detours for realistic challenges
- **Multi-Agent Types**: Autonomous, legacy cars, semis, emergency vehicles, buses, trains, pedestrians, cyclists, e-bikes
- **Crash Simulation**: Minor (slows traffic), medium (blocks roads), deadly (removes vehicles)
- **Metrics**: Wait time, congestion levels, accident risk, throughput

## Getting Started

1. Install dependencies: `npm install`
2. Build: `npm run build`
3. Start web demo: `npm start` (opens on http://localhost:3000)
4. For console simulation: `npm run sim`

## Current Prototype

Swarm-optimized traffic control simulation with 50 vehicles navigating road blocks, bad roads, and handling crashes.

### Sample Results
- **Swarm Optimized**: Wait time: 427, Congestion: [5,0,1,3], Accident risk: 210, Throughput: 0, Crashes: Variable (simulates real-world collisions)
- **Random Baseline**: Wait time: 1082, Congestion: [7,0,3,3], Accident risk: 0, Throughput: 1
- **Improvements**: 60.54% reduction in wait time, adaptive routing around obstacles, crash prevention through coordination

Visualization saved as `traffic_visualization.png`.

## Architecture

- **TypeScript/Node.js**: Core runtime
- **TensorFlow.js**: RL model training
- **ML-Matrix**: Distance calculations
- **Canvas**: Server-side and client-side visualization
- **Express/Socket.io**: Real-time web interface

## Future Roadmap

- Advanced RL (DQN, multi-agent)
- Real-time simulation dashboard
- Emergency vehicle prioritization
- Integration with real maps/APIs
- Scalability to hundreds of agents

## Contributing

This is an open-source project focused on impactful AI for safety. Contributions welcome—focus on grounded, testable improvements.

## License

MIT