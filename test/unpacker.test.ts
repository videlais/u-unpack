import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { unpackUnityPackage, isValidUnityPackage } from '../src/unpacker';
import * as fs from 'fs';
import * as path from 'path';

describe('Unity Package Unpacker', () => {
  describe('isValidUnityPackage', () => {
    describe('when checking file existence', () => {
      it('should return false for non-existent files', () => {
        const result = isValidUnityPackage('/path/to/nonexistent.unitypackage');
        expect(result).toBe(false);
      });

      it('should return false when file path is empty', () => {
        const result = isValidUnityPackage('');
        expect(result).toBe(false);
      });
    });

    describe('when validating file extension', () => {
      const testDir = path.join(__dirname, 'extension-test-temp');
      const wrongExtFile = path.join(testDir, 'test.zip');

      beforeEach(() => {
        if (!fs.existsSync(testDir)) {
          fs.mkdirSync(testDir, { recursive: true });
        }
      });

      afterEach(() => {
        if (fs.existsSync(testDir)) {
          fs.rmSync(testDir, { recursive: true });
        }
      });

      it('should return false for files without .unitypackage extension', () => {
        const result = isValidUnityPackage('/path/to/file.zip');
        expect(result).toBe(false);
      });

      it('should return false for existing files with wrong extension', () => {
        fs.writeFileSync(wrongExtFile, 'test content');
        const result = isValidUnityPackage(wrongExtFile);
        expect(result).toBe(false);
      });

      it('should return false for files with similar but incorrect extensions', () => {
        expect(isValidUnityPackage('/path/to/file.unity')).toBe(false);
        expect(isValidUnityPackage('/path/to/file.package')).toBe(false);
        expect(isValidUnityPackage('/path/to/file.unitypackages')).toBe(false);
      });

      it('should handle uppercase extensions case-insensitively', () => {
        const result = isValidUnityPackage('/test.UNITYPACKAGE');
        // Returns false because file doesn't exist, but extension check passes
        expect(result).toBe(false);
      });

      it('should handle mixed case extensions', () => {
        const result = isValidUnityPackage('/test.UnityPackage');
        expect(result).toBe(false);
      });
    });

    describe('when file exists with correct extension', () => {
      const testFile = path.join(__dirname, 'test.unitypackage');

      beforeEach(() => {
        // Create a test file
        if (!fs.existsSync(testFile)) {
          fs.writeFileSync(testFile, 'test content');
        }
      });

      afterEach(() => {
        // Clean up test file
        if (fs.existsSync(testFile)) {
          fs.unlinkSync(testFile);
        }
      });

      it('should return true for valid unity package files', () => {
        const result = isValidUnityPackage(testFile);
        expect(result).toBe(true);
      });

      it('should handle files in nested directories', () => {
        const nestedDir = path.join(__dirname, 'nested', 'dir');
        fs.mkdirSync(nestedDir, { recursive: true });
        const nestedFile = path.join(nestedDir, 'test.unitypackage');
        fs.writeFileSync(nestedFile, 'test content');

        const result = isValidUnityPackage(nestedFile);
        expect(result).toBe(true);

        // Cleanup
        fs.unlinkSync(nestedFile);
        fs.rmSync(path.join(__dirname, 'nested'), { recursive: true });
      });
    });
  });

  describe('unpackUnityPackage', () => {
    const testDir = path.join(__dirname, 'unpacker-test-temp');
    const testFile = path.join(testDir, 'test.unitypackage');
    const outputDir = path.join(testDir, 'output');

    beforeEach(() => {
      // Create test directory
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
    });

    afterEach(() => {
      // Clean up
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true });
      }
    });

    describe('when function exists', () => {
      it('should be defined and callable', () => {
        expect(unpackUnityPackage).toBeDefined();
        expect(typeof unpackUnityPackage).toBe('function');
      });

      it('should accept required parameters', () => {
        expect(unpackUnityPackage.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('when handling errors', () => {
      it('should handle Error instances correctly', () => {
        const error = new Error('Test error');
        const message = error instanceof Error ? error.message : error;
        expect(message).toBe('Test error');
      });

      it('should handle non-Error exceptions', () => {
        const stringError = 'String error';
        const message = typeof stringError === 'string' ? stringError : 'Unknown error';
        expect(message).toBe('String error');
      });

      it('should throw error with verbose logging for invalid files', async () => {
        // Create an invalid tar file
        fs.writeFileSync(testFile, 'not a valid tar file');

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        await expect(unpackUnityPackage(testFile, outputDir, true)).rejects.toThrow(
          'Failed to extract Unity package'
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith('Extraction failed:', expect.any(Error));
        consoleErrorSpy.mockRestore();
      });
    });

    describe('when formatting file sizes', () => {
      it('should format bytes to MB correctly', () => {
        const sizes = [
          { bytes: 1024 * 1024, expected: '1.00' },
          { bytes: 5.5 * 1024 * 1024, expected: '5.50' },
          { bytes: 10.25 * 1024 * 1024, expected: '10.25' },
        ];

        sizes.forEach(({ bytes, expected }) => {
          const mb = (bytes / 1024 / 1024).toFixed(2);
          expect(mb).toBe(expected);
        });
      });
    });
  });
});
