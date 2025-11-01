import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { unpackUnityPackage } from '../src/unpacker';
import {
  createMockUnityPackage,
  cleanupTestFiles,
  createTempDirectory,
  verifyExtractedFiles,
  getAllFilesInDirectory,
  SAMPLE_UNITY_PACKAGE_STRUCTURE,
} from './test-helpers';
import * as path from 'path';
import * as fs from 'fs';

describe('Unity Package Unpacker Integration Tests', () => {
  let testPackagePath: string;
  let testOutputDir: string;

  beforeAll(async () => {
    // Create a real mock Unity package for integration testing
    testPackagePath = path.join(__dirname, 'test-package.unitypackage');
    await createMockUnityPackage(testPackagePath, SAMPLE_UNITY_PACKAGE_STRUCTURE);
  });

  afterAll(() => {
    // Clean up test files
    cleanupTestFiles(testPackagePath);
    if (testOutputDir) {
      cleanupTestFiles(testOutputDir);
    }
  });

  describe('when unpacking a real Unity package', () => {
    it('should successfully extract all files to the output directory', async () => {
      testOutputDir = createTempDirectory('integration-test-');
      
      await unpackUnityPackage(testPackagePath, testOutputDir, false);
      
      const extractedFiles = getAllFilesInDirectory(testOutputDir);
      expect(extractedFiles.length).toBeGreaterThan(0);
    });

    it('should preserve the Unity package directory structure', async () => {
      testOutputDir = createTempDirectory('integration-test-structure-');
      
      await unpackUnityPackage(testPackagePath, testOutputDir, false);
      
      // Check that GUID directories exist
      const expectedDirs = ['guid1', 'guid2'];
      const hasExpectedStructure = expectedDirs.every(dir => 
        getAllFilesInDirectory(testOutputDir).some(file => file.startsWith(dir)),
      );
      
      expect(hasExpectedStructure).toBe(true);
    });

    it('should extract with verbose logging enabled', async () => {
      testOutputDir = createTempDirectory('integration-test-verbose-');
      
      // This should not throw and should complete successfully
      await expect(
        unpackUnityPackage(testPackagePath, testOutputDir, true),
      ).resolves.not.toThrow();
    });
  });

  describe('when unpacking to different output locations', () => {
    it('should handle nested output directories', async () => {
      testOutputDir = createTempDirectory('integration-test-nested-');
      const nestedOutput = path.join(testOutputDir, 'nested', 'deep', 'path');
      
      // Create the nested directory structure
      fs.mkdirSync(nestedOutput, { recursive: true });
      
      await unpackUnityPackage(testPackagePath, nestedOutput, false);
      
      const extractedFiles = getAllFilesInDirectory(nestedOutput);
      expect(extractedFiles.length).toBeGreaterThan(0);
      
      cleanupTestFiles(testOutputDir);
    });

    it('should handle output directory with spaces in name', async () => {
      testOutputDir = path.join(__dirname, 'test with spaces');
      
      // Create the directory first
      fs.mkdirSync(testOutputDir, { recursive: true });
      
      await unpackUnityPackage(testPackagePath, testOutputDir, false);
      
      const extractedFiles = getAllFilesInDirectory(testOutputDir);
      expect(extractedFiles.length).toBeGreaterThan(0);
      
      cleanupTestFiles(testOutputDir);
    });
  });

  describe('when verifying extracted content', () => {
    it('should extract files with correct content', async () => {
      testOutputDir = createTempDirectory('integration-test-content-');
      
      await unpackUnityPackage(testPackagePath, testOutputDir, false);
      
      // Verify specific files exist
      const expectedFiles = SAMPLE_UNITY_PACKAGE_STRUCTURE.map(f => f.path);
      const hasAllFiles = verifyExtractedFiles(testOutputDir, expectedFiles);
      
      expect(hasAllFiles).toBe(true);
    });
  });
});
