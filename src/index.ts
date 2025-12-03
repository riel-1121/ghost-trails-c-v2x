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
  
  // Dynamic parameters that can be updated
  private static currentLambda = 0.1;
  private static currentAlpha = 1000.0;
  private static currentBeta = -500.0;
  
  static setParameters(lambda: number, alpha: number, beta: number) {
    this.currentLambda = lambda;
    this.currentAlpha = alpha;
    this.currentBeta = beta;
  }
  
  /**
   * Power-law TimeFold temporal decay formula: τ(n) = n^(-λ) × [α×cos(ωφ(n)) + β×cos(γ√n) + δ×sin(εφ(n))]
   * Uses power-law decay with triple oscillatory modulation for enhanced non-monotonic temporal weighting
   * φ(n) ≈ 2√n (closed-form approximation for computational efficiency)
   */
  static ghostLifetime(iteration: number): number {
    const sqrtN = Math.sqrt(iteration);
    const phiApprox = 2 * sqrtN; // Closed-form harmonic series approximation
    const harmonicMod = Math.cos(this.OMEGA * phiApprox);
    const directMod = Math.cos(this.currentBeta * sqrtN);
    const sineMod = Math.sin(0.05 * phiApprox); // Additional sine modulation
    const modulation = this.currentAlpha * harmonicMod + (1 - this.currentAlpha) * directMod + 100.0 * sineMod;
    return Math.pow(iteration + 1, -this.currentLambda) * modulation;
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
  
  // Dynamic parameters
  private vehicleCount = 20;
  private hazardFrequency = 5;
  
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

  setVehicleCount(count: number) {
    this.vehicleCount = Math.max(1, Math.min(50, count));
    this.reset(); // Reset to apply new vehicle count
  }

  setHazardFrequency(frequency: number) {
    this.hazardFrequency = Math.max(0.1, Math.min(20, frequency));
  }

  reset() {
    // Generate vehicles based on vehicleCount
    this.vehicles = [];
    const colors = ['#3498db', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e', '#16a085', '#f1c40f'];
    
    // Add lead vehicle
    this.vehicles.push({
      id: 0,
      x: 50,
      y: 50,
      speed: 5,
      color: '#3498db',
      type: 'lead',
      direction: 0,
      lateralSpeed: 0
    });
    
    // Add follower vehicles
    for (let i = 1; i < this.vehicleCount; i++) {
      const spacing = (this.highwayLength - 100) / (this.vehicleCount - 1);
      this.vehicles.push({
        id: i,
        x: 50 + i * spacing,
        y: 50,
        speed: 4 + Math.random() * 1.5, // Random speed between 4-5.5
        color: colors[i % colors.length],
        type: 'follow',
        direction: 0,
        lateralSpeed: 0
      });
    }
    
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

    // Spawn hazards based on frequency
    const hazardInterval = 60 / this.hazardFrequency; // Convert frequency to seconds between hazards
    const hazardCount = Math.floor(this.totalTime / hazardInterval);
    while (this.ghosts.length < hazardCount && this.ghosts.length < 10) {
      const hazardX = this.icePosition + (this.ghosts.length * 100);
      this.ghosts.push({ x: hazardX, y: 50, age: 0, maxAge: 120 });
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