// Comprehensive Benchmarking Script for TimeFold vs Linear Decay
const { GhostTrailsDemo, GhostTrailsTimeFold } = require('./dist/index.js');

class BenchmarkSuite {
  constructor() {
    this.results = {
      timefold: { runs: [], averages: {} },
      linear: { runs: [], averages: {} }
    };
  }

  runBenchmark(method, numRuns = 50, duration = 30) {
    console.log(`\n🧪 Running ${method.toUpperCase()} benchmark (${numRuns} runs, ${duration}s each)...`);

    for (let run = 1; run <= numRuns; run++) {
      const demo = new GhostTrailsDemo(method);
      const runMetrics = {
        totalCollisions: 0,
        avoidanceActions: 0,
        communicationOverhead: 0,
        averageResponseTime: 0,
        duration: duration
      };

      // Run simulation for specified duration
      for (let t = 0; t < duration; t += 0.08) {
        demo.step(0.08);
      }

      const finalMetrics = demo.getMetrics();
      runMetrics.totalCollisions = finalMetrics.totalCollisions;
      runMetrics.avoidanceActions = finalMetrics.avoidanceActions;
      runMetrics.communicationOverhead = finalMetrics.communicationOverhead;
      runMetrics.averageResponseTime = finalMetrics.averageResponseTime;

      this.results[method].runs.push(runMetrics);
      if (run % 10 === 0) {
        console.log(`  Run ${run}: ${runMetrics.totalCollisions} collisions, ${runMetrics.avoidanceActions} avoidances`);
      }
    }

    this.calculateAverages(method);
  }

  calculateAverages(method) {
    const runs = this.results[method].runs;
    const avg = {
      collisions: runs.reduce((sum, r) => sum + r.totalCollisions, 0) / runs.length,
      avoidanceActions: runs.reduce((sum, r) => sum + r.avoidanceActions, 0) / runs.length,
      communicationOverhead: runs.reduce((sum, r) => sum + r.communicationOverhead, 0) / runs.length,
      responseTime: runs.reduce((sum, r) => sum + r.averageResponseTime, 0) / runs.length,
      collisionRate: runs.reduce((sum, r) => sum + (r.totalCollisions / r.duration), 0) / runs.length,
      avoidanceEfficiency: runs.reduce((sum, r) => sum + (r.avoidanceActions / Math.max(1, r.communicationOverhead)), 0) / runs.length
    };

    this.results[method].averages = avg;
  }

  generateReport() {
    const tf = this.results.timefold.averages;
    const ln = this.results.linear.averages;

    console.log('\n📊 BENCHMARK RESULTS SUMMARY');
    console.log('='.repeat(50));

    console.log('\n🔹 TIMEFOLD METHOD:');
    console.log(`  Average Collisions: ${tf.collisions.toFixed(2)}`);
    console.log(`  Collision Rate: ${tf.collisionRate.toFixed(4)}/sec`);
    console.log(`  Avoidance Actions: ${tf.avoidanceActions.toFixed(2)}`);
    console.log(`  Avoidance Efficiency: ${tf.avoidanceEfficiency.toFixed(4)}`);
    console.log(`  Communication Overhead: ${tf.communicationOverhead.toFixed(2)}`);

    console.log('\n🔹 LINEAR DECAY METHOD:');
    console.log(`  Average Collisions: ${ln.collisions.toFixed(2)}`);
    console.log(`  Collision Rate: ${ln.collisionRate.toFixed(4)}/sec`);
    console.log(`  Avoidance Actions: ${ln.avoidanceActions.toFixed(2)}`);
    console.log(`  Avoidance Efficiency: ${ln.avoidanceEfficiency.toFixed(4)}`);
    console.log(`  Communication Overhead: ${ln.communicationOverhead.toFixed(2)}`);

    console.log('\n🎯 PERFORMANCE COMPARISON:');
    const collisionImprovement = ln.collisionRate > 0 ?
      ((ln.collisionRate - tf.collisionRate) / ln.collisionRate) * 100 : 0;
    const efficiencyImprovement = ln.avoidanceEfficiency > 0 ?
      ((tf.avoidanceEfficiency - ln.avoidanceEfficiency) / ln.avoidanceEfficiency) * 100 : 0;

    console.log(`  Collision Reduction: ${collisionImprovement.toFixed(2)}%`);
    console.log(`  Avoidance Efficiency Improvement: ${efficiencyImprovement.toFixed(2)}%`);

    if (collisionImprovement > 0) {
      console.log(`  ✅ TimeFold shows ${collisionImprovement.toFixed(1)}% fewer collisions`);
    } else {
      console.log(`  ❌ TimeFold shows ${Math.abs(collisionImprovement).toFixed(1)}% more collisions`);
    }

    return {
      timefold: tf,
      linear: ln,
      improvements: {
        collisionReduction: collisionImprovement,
        efficiencyImprovement: efficiencyImprovement
      }
    };
  }

  runFullSuite() {
    this.runBenchmark('timefold', 50);
    this.runBenchmark('linear', 50);
    return this.generateReport();
  }
}

// Run the benchmark
const benchmark = new BenchmarkSuite();
const results = benchmark.runFullSuite();
console.log('\n🏁 Benchmark complete!');
console.log('Results saved for patent documentation.');