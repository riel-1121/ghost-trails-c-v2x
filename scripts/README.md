# Scripts Directory

This directory contains utility scripts for the TimeFold CV2X simulation project.

## Scripts

### `benchmark.js`
Comprehensive benchmarking script that runs 50 simulations each for TimeFold and Linear decay methods, comparing collision rates and performance metrics.

**Usage:**
```bash
npm run benchmark
```

**Output:** Detailed performance comparison with collision reduction statistics.

### `test-timefold.js`
Integration test script for TimeFold algorithm functionality.

**Usage:**
```bash
node scripts/test-timefold.js
```

### `verify-timefold.js`
Standalone verification of the TimeFold mathematical formula with sample calculations.

**Usage:**
```bash
node scripts/verify-timefold.js
```

**Output:** Sample τ values for different iterations and fleet memory calculations.