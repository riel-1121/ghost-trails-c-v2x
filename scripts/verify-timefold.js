// Quick verification of TimeFold formula
class GhostTrailsTimeFold {
  static get LAMBDA() { return 16.0; }
  static get OMEGA() { return Math.sqrt(0.001); }

  static ghostLifetime(iteration) {
    let phi_n = 0;
    for (let k = 1; k <= iteration; k++) {
      phi_n += 1 / Math.sqrt(k);
    }
    return Math.exp(-this.LAMBDA * Math.sqrt(iteration)) * Math.cos(this.OMEGA * phi_n);
  }

  static maxIterationsBeforeSaturation() {
    let iter = 1;
    while (this.ghostLifetime(iter) > 0.01 && iter < 1000) {
      iter++;
    }
    return iter;
  }
}

// Test the formula
console.log('TimeFold Verification:');
for (let i = 1; i <= 10; i++) {
  const tau = GhostTrailsTimeFold.ghostLifetime(i);
  console.log(`Iteration ${i}: τ = ${tau.toFixed(6)}`);
}

const fleetMemory = Math.floor(1000000 * GhostTrailsTimeFold.ghostLifetime(5));
console.log(`Fleet Memory after 5 broadcasts: ${fleetMemory}`);

const maxIter = GhostTrailsTimeFold.maxIterationsBeforeSaturation();
console.log(`Max iterations before saturation: ${maxIter}`);