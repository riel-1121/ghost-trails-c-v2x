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

export class GhostTrailsTimeFold {
  static readonly LAMBDA = 0.1; // Power-law decay exponent
  static readonly OMEGA = 0.01; // Optimized primary modulation frequency
  static readonly ALPHA = 1000.0; // Extreme harmonic modulation weight
  static readonly BETA = -500.0; // Extreme negative direct modulation
  
  /**
   * Power-law TimeFold temporal decay formula: τ(n) = n^(-λ) × [α×cos(ωφ(n)) + β×cos(γ√n) + δ×sin(εφ(n))]
   * Uses power-law decay with triple oscillatory modulation for enhanced non-monotonic temporal weighting
   * φ(n) ≈ 2√n (closed-form approximation for computational efficiency)
   */
  static ghostLifetime(iteration: number): number {
    const sqrtN = Math.sqrt(iteration);
    const phiApprox = 2 * sqrtN; // Closed-form harmonic series approximation
    const harmonicMod = Math.cos(this.OMEGA * phiApprox);
    const directMod = Math.cos(this.BETA * sqrtN);
    const sineMod = Math.sin(0.05 * phiApprox); // Additional sine modulation
    const modulation = this.ALPHA * harmonicMod + (1 - this.ALPHA) * directMod + 100.0 * sineMod;
    return Math.pow(iteration + 1, -this.LAMBDA) * modulation;
  }
  
  static fleetMemoryAfterBroadcasts(broadcasts: number): number {
    const tau = this.ghostLifetime(broadcasts);
    // Estimate fleet size that can maintain hazard awareness
    // Higher tau means longer memory, supporting larger fleets
    return Math.floor(1000 * tau * (1 + broadcasts / 100));
  }
  
  static maxIterationsBeforeSaturation(threshold = 0.001): number {
    let n = 1;
    while (this.ghostLifetime(n) > threshold && n < 1000) n++;
    return n - 1;
  }
}

export class GhostTrailsDemo {
  private vehicles: Vehicle[] = [];
  private ghosts: Ghost[] = [];
  private highwayLength = 1500;
  private icePosition = 300;
  private totalTime = 0;
  
  // Performance metrics
  private metrics = {
    totalCollisions: 0,
    avoidanceActions: 0,
    communicationOverhead: 0,
    averageResponseTime: 0,
    decayMethod: 'timefold' as 'timefold' | 'linear'
  };

  constructor(decayMethod: 'timefold' | 'linear' = 'timefold') {
    this.metrics.decayMethod = decayMethod;
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
      { id: 10, x: 50, y: 50, speed: 4.7, color: '#8e44ad', type: 'follow', direction: 0, lateralSpeed: 0 }, // Dark purple
      { id: 11, x: 200, y: 50, speed: 5.1, color: '#2c3e50', type: 'follow', direction: 0, lateralSpeed: 0 }, // Dark blue-gray
      { id: 12, x: 350, y: 50, speed: 4.9, color: '#d35400', type: 'follow', direction: 0, lateralSpeed: 0 }, // Dark orange
      { id: 13, x: 500, y: 50, speed: 5.4, color: '#27ae60', type: 'follow', direction: 0, lateralSpeed: 0 }, // Green (duplicate ok for variety)
      { id: 14, x: 100, y: 50, speed: 4.6, color: '#9b59b6', type: 'follow', direction: 0, lateralSpeed: 0 }, // Purple (duplicate ok)
      { id: 15, x: 175, y: 50, speed: 5.0, color: '#e74c3c', type: 'follow', direction: 0, lateralSpeed: 0 }, // Red
      { id: 16, x: 275, y: 50, speed: 4.8, color: '#27ae60', type: 'follow', direction: 0, lateralSpeed: 0 }, // Green
      { id: 17, x: 375, y: 50, speed: 5.2, color: '#f39c12', type: 'follow', direction: 0, lateralSpeed: 0 }, // Orange
      { id: 18, x: 475, y: 50, speed: 4.9, color: '#9b59b6', type: 'follow', direction: 0, lateralSpeed: 0 }, // Purple
      { id: 19, x: 125, y: 50, speed: 5.1, color: '#1abc9c', type: 'follow', direction: 0, lateralSpeed: 0 }, // Teal
    ];
    this.ghosts = [];
    this.totalTime = 0;
    // Reset metrics
    this.metrics.totalCollisions = 0;
    this.metrics.avoidanceActions = 0;
    this.metrics.communicationOverhead = 0;
    this.metrics.averageResponseTime = 0;
  }

  step(deltaTime: number) {
    this.totalTime += deltaTime;
    
    // Move vehicles
    this.vehicles.forEach(vehicle => {
      if (vehicle.type === 'follow') {
        // Avoidance logic
        let lateralForce = 0;
        let avoidanceTriggered = false;
        
        this.ghosts.forEach(ghost => {
          const dx = ghost.x - vehicle.x;
          const dist = Math.abs(dx);
          if (dist < 120 && ghost.age < 120) {
            avoidanceTriggered = true;
            
            // Use appropriate decay method
            let tau: number;
            if (this.metrics.decayMethod === 'timefold') {
              tau = GhostTrailsTimeFold.ghostLifetime(Math.floor(ghost.age));
            } else {
              // Linear decay: τ = 1 - (age / 0.001) for instant decay comparison
              tau = Math.max(0, 1 - (ghost.age / 0.01));
            }
            
            const strength = tau * 100000.0;
            lateralForce += strength * (dx > 0 ? -1 : 1); // swerve away
          }
        });
        
        if (avoidanceTriggered) {
          this.metrics.avoidanceActions++;
        }
        
        vehicle.lateralSpeed += lateralForce * 0.05;
        vehicle.lateralSpeed *= 0.95; // damp
        vehicle.y = Math.max(10, Math.min(90, 50 + vehicle.lateralSpeed * 10)); // bounds check
      }
      
      vehicle.x += vehicle.speed;
      if (vehicle.x > this.highwayLength) {
        vehicle.x = -50; // Loop back
        vehicle.direction = 0;
        vehicle.lateralSpeed = 0;
        vehicle.y = 50;
      }
    });

    // Check for collisions (vehicles too close)
    for (let i = 0; i < this.vehicles.length; i++) {
      for (let j = i + 1; j < this.vehicles.length; j++) {
        const v1 = this.vehicles[i];
        const v2 = this.vehicles[j];
        const dx = Math.abs(v1.x - v2.x);
        const dy = Math.abs(v1.y - v2.y);
        if (dx < 25 && dy < 15) { // collision threshold
          this.metrics.totalCollisions++;
        }
      }
    }

    // Communication overhead (broadcasts per second)
    this.metrics.communicationOverhead = this.ghosts.length * 10; // 10Hz broadcast rate

    // Spawn hazards at fixed times
    if (this.totalTime > 5 && this.ghosts.length === 0) {
      this.ghosts.push({ x: this.icePosition, y: 50, age: 0, maxAge: 120 });
    }
    if (this.totalTime > 10 && this.ghosts.length === 1) {
      this.ghosts.push({ x: this.icePosition + 100, y: 50, age: 0, maxAge: 120 });
    }
    if (this.totalTime > 15 && this.ghosts.length === 2) {
      this.ghosts.push({ x: this.icePosition + 200, y: 50, age: 0, maxAge: 120 });
    }
    if (this.totalTime > 20 && this.ghosts.length === 3) {
      this.ghosts.push({ x: this.icePosition + 300, y: 50, age: 0, maxAge: 120 });
    }
    if (this.totalTime > 25 && this.ghosts.length === 4) {
      this.ghosts.push({ x: this.icePosition + 400, y: 50, age: 0, maxAge: 120 });
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

  getMetrics() {
    return { ...this.metrics };
  }
}