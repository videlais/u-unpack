import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { createMockUnityPackage, cleanupTestFiles, SAMPLE_UNITY_PACKAGE_STRUCTURE } from './test-helpers';

describe('CLI Integration Tests', () => {
  const testDir = path.join(__dirname, 'cli-test-artifacts');
  const testPackage = path.join(testDir, 'test.unitypackage');
  const testOutput = path.join(testDir, 'output');

  beforeEach(async () => {
    // Create test directory and mock package
    fs.mkdirSync(testDir, { recursive: true });
    await createMockUnityPackage(testPackage, SAMPLE_UNITY_PACKAGE_STRUCTURE);
  });

  afterEach(() => {
    // Cleanup
    cleanupTestFiles(testDir);
  });

  const runCLI = (args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number | null }> => {
    return new Promise((resolve) => {
      const child = spawn('node', ['dist/index.js', ...args]);
      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (exitCode) => {
        resolve({ stdout, stderr, exitCode });
      });
    });
  };

  describe('when running with valid arguments', () => {
    it('should successfully unpack a Unity package', async () => {
      const result = await runCLI([testPackage, '-o', testOutput]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✓ Unity package unpacked successfully');
      expect(fs.existsSync(testOutput)).toBe(true);
    });

    it('should show verbose output when -v flag is used', async () => {
      const result = await runCLI([testPackage, '-o', testOutput, '-v']);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('Input file:');
      expect(result.stdout).toContain('Output directory:');
      expect(result.stdout).toContain('Starting Unity package extraction');
    });

    it('should use current directory as default output', async () => {
      const result = await runCLI([testPackage]);

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain('✓ Unity package unpacked successfully');
    }, 10000);
  });

  describe('when running with invalid arguments', () => {
    it('should exit with error when input file does not exist', async () => {
      const result = await runCLI(['nonexistent.unitypackage', '-o', testOutput]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Error: Input file');
      expect(result.stderr).toContain('does not exist');
    });

    it('should show warning for files without .unitypackage extension', async () => {
      const wrongExtFile = path.join(testDir, 'test.zip');
      fs.writeFileSync(wrongExtFile, 'test');

      const result = await runCLI([wrongExtFile, '-o', testOutput]);

      expect(result.stderr).toContain('Warning: Input file does not have .unitypackage extension');
    });
  });

  describe('when checking CLI metadata', () => {
    it('should display version with --version flag', async () => {
      const result = await runCLI(['--version']);

      expect(result.stdout).toContain('1.0.0');
    });

    it('should display help with --help flag', async () => {
      const result = await runCLI(['--help']);

      expect(result.stdout).toContain('unity-unpack');
      expect(result.stdout).toContain('Usage:');
      expect(result.stdout).toContain('Options:');
    });
  });
});
