export interface Vehicle {
  id: number;
  x: number;
  y: number;
  speed: number;
  color: string;
  type: 'lead' | 'follow';
  direction: number;
  lateralSpeed: number;
}

export interface Ghost {
  x: number;
  y: number;
  age: number; // seconds
  maxAge: number;
}

export class GhostTrailsDemo {
  private vehicles: Vehicle[] = [];
  private ghosts: Ghost[] = [];
  private highwayLength = 1500;
  private icePosition = 300;
  private totalTime = 0;

  constructor() {
    this.reset();
  }

  reset() {
    this.vehicles = [
      { id: 0, x: 50, y: 50, speed: 5, color: '#3498db', type: 'lead', direction: 0, lateralSpeed: 0 }, // Blue lead
      { id: 1, x: 200, y: 50, speed: 5, color: '#e74c3c', type: 'follow', direction: 0, lateralSpeed: 0 }, // Red follow
      { id: 2, x: 350, y: 50, speed: 5, color: '#27ae60', type: 'follow', direction: 0, lateralSpeed: 0 }, // Green follow
      { id: 3, x: 500, y: 50, speed: 5, color: '#f39c12', type: 'follow', direction: 0, lateralSpeed: 0 }, // Orange follow
      { id: 4, x: 100, y: 50, speed: 4.5, color: '#9b59b6', type: 'follow', direction: 0, lateralSpeed: 0 }, // Purple
      { id: 5, x: 250, y: 50, speed: 5.5, color: '#1abc9c', type: 'follow', direction: 0, lateralSpeed: 0 }, // Teal
      { id: 6, x: 400, y: 50, speed: 4, color: '#e67e22', type: 'follow', direction: 0, lateralSpeed: 0 }, // Carrot
      { id: 7, x: 150, y: 50, speed: 5.2, color: '#34495e', type: 'follow', direction: 0, lateralSpeed: 0 }, // Dark blue
      { id: 8, x: 300, y: 50, speed: 4.8, color: '#16a085', type: 'follow', direction: 0, lateralSpeed: 0 }, // Green sea
      { id: 9, x: 450, y: 50, speed: 5.3, color: '#f1c40f', type: 'follow', direction: 0, lateralSpeed: 0 }, // Yellow
      { id: 10, x: 50, y: 50, speed: 4.7, color: '#e74c3c', type: 'follow', direction: 0, lateralSpeed: 0 }, // Red
      { id: 11, x: 200, y: 50, speed: 5.1, color: '#9b59b6', type: 'follow', direction: 0, lateralSpeed: 0 }, // Purple
      { id: 12, x: 350, y: 50, speed: 4.9, color: '#27ae60', type: 'follow', direction: 0, lateralSpeed: 0 }, // Green
      { id: 13, x: 500, y: 50, speed: 5.4, color: '#f39c12', type: 'follow', direction: 0, lateralSpeed: 0 }, // Orange
      { id: 14, x: 100, y: 50, speed: 4.6, color: '#1abc9c', type: 'follow', direction: 0, lateralSpeed: 0 }, // Teal
    ];
    this.ghosts = [];
    this.totalTime = 0;
  }

  step(deltaTime: number) {
    this.totalTime += deltaTime;
    // Move vehicles
    this.vehicles.forEach(vehicle => {
      if (vehicle.type === 'follow') {
        // Avoidance
        let lateralForce = 0;
        this.ghosts.forEach(ghost => {
          const dx = ghost.x - vehicle.x;
          const dist = Math.abs(dx);
          if (dist < 120 && ghost.age < 60) {
            const strength = (1 - ghost.age / 60) * 0.2;
            lateralForce += strength * (dx > 0 ? -1 : 1); // swerve away
          }
        });
        vehicle.lateralSpeed += lateralForce * 0.05;
        vehicle.lateralSpeed *= 0.95; // damp
        vehicle.y = 50 + vehicle.lateralSpeed * 10;
      }
      vehicle.x += vehicle.speed;
      if (vehicle.x > this.highwayLength) {
        vehicle.x = -50; // Loop back
        vehicle.direction = 0;
        vehicle.lateralSpeed = 0;
        vehicle.y = 50;
      }
    });

    // Check for ice hit
    const lead = this.vehicles.find(v => v.type === 'lead');
    if (lead && lead.x >= this.icePosition - 5 && lead.x <= this.icePosition + 5 && this.ghosts.length === 0) {
      // Hit ice: wiggle
      lead.x += (Math.random() - 0.5) * 20;
      lead.y += (Math.random() - 0.5) * 10;
      // Drop ghost
      this.ghosts.push({ x: this.icePosition, y: 50, age: 0, maxAge: 60 });
    }

    // Second hazard
    if (this.totalTime > 8 && this.ghosts.length === 1) {
      this.ghosts.push({ x: this.icePosition + 100, y: 50, age: 0, maxAge: 60 });
    }

    // Age ghosts
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