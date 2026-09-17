#!/usr/bin/env bun
/**
 * Fails the build if aggregate line coverage of the shipped `src/` code drops
 * below MIN_LINE_COVERAGE. Bun's built-in coverageThreshold is per-file and
 * can't gate overall source coverage, so this reads coverage/lcov.info instead.
 */
import { readFileSync } from 'node:fs';

const MIN_LINE_COVERAGE = 0.9;
const LCOV_PATH = 'coverage/lcov.info';

let lcov;
try {
  lcov = readFileSync(LCOV_PATH, 'utf8');
} catch {
  console.error(`Coverage gate: ${LCOV_PATH} not found. Run "bun test --coverage" first.`);
  process.exit(1);
}

let currentFile = null;
let linesFound = 0;
let linesHit = 0;

for (const line of lcov.split('\n')) {
  if (line.startsWith('SF:')) {
    currentFile = line.slice(3).replace(/\\/g, '/');
  } else if (currentFile?.startsWith('src/')) {
    if (line.startsWith('LF:')) linesFound += Number(line.slice(3));
    else if (line.startsWith('LH:')) linesHit += Number(line.slice(3));
  }
}

if (linesFound === 0) {
  console.error('Coverage gate: no src/ coverage data found in lcov report.');
  process.exit(1);
}

const coverage = linesHit / linesFound;
const pct = (coverage * 100).toFixed(2);
const floor = (MIN_LINE_COVERAGE * 100).toFixed(2);

if (coverage < MIN_LINE_COVERAGE) {
  console.error(`Coverage gate: src/ line coverage ${pct}% is below the ${floor}% floor.`);
  process.exit(1);
}

console.log(`Coverage gate: src/ line coverage ${pct}% (floor ${floor}%) OK`);
