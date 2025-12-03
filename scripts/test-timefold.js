// Test TimeFold integration in running demo
const { GhostTrailsTimeFold } = require('../dist/index.js');

console.log('🧪 Testing TimeFold Integration...\n');

// Test basic TimeFold calculations
console.log('TimeFold Ghost Lifetime Values:');
for (let i = 1; i <= 10; i++) {
  const tau = GhostTrailsTimeFold.ghostLifetime(i);
  console.log(`  Iteration ${i}: τ = ${tau.toFixed(6)}`);
}

console.log('\nFleet Memory Calculations:');
const broadcasts = [1, 5, 10, 20, 50];
broadcasts.forEach(b => {
  const memory = GhostTrailsTimeFold.fleetMemoryAfterBroadcasts(b);
  console.log(`  After ${b} broadcasts: ${memory} vehicles`);
});

const maxIter = GhostTrailsTimeFold.maxIterationsBeforeSaturation();
console.log(`\nMax iterations before saturation: ${maxIter}`);

console.log('\n✅ TimeFold integration test complete!');
console.log('Demo should now show TimeFold temporal weighting instead of linear decay.');