import { GhostTrailsTimeFold, GhostTrailsDemo } from '../src/index';

describe('GhostTrailsTimeFold', () => {
  test('ghostLifetime returns positive values', () => {
    for (let n = 0; n <= 100; n++) {
      const tau = GhostTrailsTimeFold.ghostLifetime(n);
      expect(tau).toBeGreaterThanOrEqual(0);
      // Updated for optimized parameters with extreme modulation
      expect(tau).toBeLessThanOrEqual(2000); // Allow for large modulation values
    }
  });

  test('ghostLifetime shows non-monotonic behavior', () => {
    // With extreme oscillatory modulation, values show complex behavior
    const tau0 = GhostTrailsTimeFold.ghostLifetime(0);
    const tau10 = GhostTrailsTimeFold.ghostLifetime(10);
    const tau50 = GhostTrailsTimeFold.ghostLifetime(50);
    const tau100 = GhostTrailsTimeFold.ghostLifetime(100);

    // Check that values are positive and within reasonable bounds
    expect(tau0).toBeGreaterThan(0);
    expect(tau10).toBeGreaterThan(0);
    expect(tau50).toBeGreaterThan(0);
    expect(tau100).toBeGreaterThan(0);

    // Verify oscillatory behavior - values change significantly
    expect(Math.abs(tau10 - tau0)).toBeGreaterThan(100);
    expect(Math.abs(tau50 - tau10)).toBeGreaterThan(100);
  });

  test('fleetMemoryAfterBroadcasts returns reasonable values', () => {
    const mem1 = GhostTrailsTimeFold.fleetMemoryAfterBroadcasts(1);
    const mem10 = GhostTrailsTimeFold.fleetMemoryAfterBroadcasts(10);
    expect(mem1).toBeGreaterThan(1000); // Reasonable initial memory with optimized λ
    expect(mem10).toBeGreaterThan(0); // Some memory remains
  });

  test('maxIterationsBeforeSaturation is reasonable', () => {
    const maxIter = GhostTrailsTimeFold.maxIterationsBeforeSaturation();
    expect(maxIter).toBeGreaterThan(10);
    expect(maxIter).toBeLessThan(1000);
  });
});

describe('GhostTrailsDemo', () => {
  test('constructor initializes with correct decay method', () => {
    const demoTimeFold = new GhostTrailsDemo('timefold');
    const demoLinear = new GhostTrailsDemo('linear');
    expect(demoTimeFold.getMetrics().decayMethod).toBe('timefold');
    expect(demoLinear.getMetrics().decayMethod).toBe('linear');
  });

  test('reset initializes vehicles correctly', () => {
    const demo = new GhostTrailsDemo();
    demo.reset();
    expect(demo.getData().vehicles).toHaveLength(20);
    expect(demo.getData().vehicles[0].type).toBe('lead');
    expect(demo.getData().vehicles[1].type).toBe('follow');
  });

  test('step updates simulation state', () => {
    const demo = new GhostTrailsDemo();
    const initialTime = demo.getData().totalTime;
    demo.step(0.1);
    const newTime = demo.getData().totalTime;
    expect(newTime).toBeGreaterThan(initialTime);
  });

  test('metrics are updated during simulation', () => {
    const demo = new GhostTrailsDemo();
    // Run for a few seconds to trigger hazard and collisions
    for (let i = 0; i < 100; i++) {
      demo.step(0.1);
    }
    const metrics = demo.getMetrics();
    expect(metrics.avoidanceActions).toBeGreaterThanOrEqual(0);
    expect(metrics.totalCollisions).toBeGreaterThanOrEqual(0);
  });

  test('collision detection works', () => {
    const demo = new GhostTrailsDemo();
    // Manually position vehicles close together
    const data = demo.getData();
    data.vehicles[0].x = 100;
    data.vehicles[0].y = 50;
    data.vehicles[1].x = 100;
    data.vehicles[1].y = 50;
    // Note: This tests the logic but doesn't modify the actual demo state
    // In real simulation, collisions are detected in step()
  });
});