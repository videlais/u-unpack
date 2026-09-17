import { describe, it, expect } from 'bun:test';
import { ConsoleCapture } from './test-helpers';

describe('ConsoleCapture', () => {
  it('captures log, error, and warn output while active', () => {
    const capture = new ConsoleCapture();
    capture.start();
    console.log('hello', 'world');
    console.error('boom');
    console.warn('careful');
    capture.stop();

    expect(capture.logs).toContain('hello world');
    expect(capture.errors).toContain('boom');
    expect(capture.warnings).toContain('careful');
  });

  it('restores the original console methods on stop', () => {
    const capture = new ConsoleCapture();
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    capture.start();
    capture.stop();

    expect(console.log).toBe(originalLog);
    expect(console.error).toBe(originalError);
    expect(console.warn).toBe(originalWarn);
  });

  it('clears previously captured output', () => {
    const capture = new ConsoleCapture();
    capture.start();
    console.log('temporary');
    capture.clear();
    capture.stop();

    expect(capture.logs).toHaveLength(0);
    expect(capture.errors).toHaveLength(0);
    expect(capture.warnings).toHaveLength(0);
  });
});
