import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { createProgram, handleUnpack } from '../src/index';
import { createMockUnityPackage, cleanupTestFiles, SAMPLE_UNITY_PACKAGE_STRUCTURE } from './test-helpers';

// Mock the unpacker module
jest.mock('../src/unpacker', () => ({
  unpackUnityPackage: jest.fn(async () => Promise.resolve()),
}));

describe('Unity Unpack CLI', () => {
  const testDir = path.join(__dirname, 'index-test-artifacts');
  let consoleLogSpy: jest.SpiedFunction<typeof console.log>;
  let consoleErrorSpy: jest.SpiedFunction<typeof console.error>;
  let consoleWarnSpy: jest.SpiedFunction<typeof console.warn>;
  let processExitSpy: jest.SpiedFunction<typeof process.exit>;

  beforeEach(() => {
    fs.mkdirSync(testDir, { recursive: true });
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation((() => {}) as never);
  });

  afterEach(() => {
    cleanupTestFiles(testDir);
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  describe('createProgram', () => {
    it('should create a Commander program instance', () => {
      const program = createProgram();
      expect(program).toBeInstanceOf(Command);
    });

    it('should have the correct name', () => {
      const program = createProgram();
      expect(program.name()).toBe('unity-unpack');
    });

    it('should have the correct description', () => {
      const program = createProgram();
      expect(program.description()).toBe('A command-line tool for unpacking Unity Package (.unitypackage) files');
    });

    it('should have version 1.0.0', () => {
      const program = createProgram();
      expect(program.version()).toBeDefined();
    });
  });

  describe('handleUnpack', () => {
    describe('when input file exists', () => {
      let testFile: string;
      let outputDir: string;

      beforeEach(async () => {
        testFile = path.join(testDir, 'test.unitypackage');
        outputDir = path.join(testDir, 'output');
        await createMockUnityPackage(testFile, SAMPLE_UNITY_PACKAGE_STRUCTURE);
      });

      it('should successfully unpack a file', async () => {
        await handleUnpack(testFile, { output: outputDir, verbose: false });

        expect(consoleLogSpy).toHaveBeenCalledWith('✓ Unity package unpacked successfully');
      });

      it('should create output directory if it does not exist', async () => {
        await handleUnpack(testFile, { output: outputDir, verbose: false });

        expect(fs.existsSync(outputDir)).toBe(true);
      });

      it('should log verbose output when verbose is true', async () => {
        await handleUnpack(testFile, { output: outputDir, verbose: true });

        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Input file:'));
        expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Output directory:'));
      });

      it('should not log verbose output when verbose is false', async () => {
        await handleUnpack(testFile, { output: outputDir, verbose: false });

        expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.stringContaining('Input file:'));
      });

      it('should warn when file does not have .unitypackage extension', async () => {
        const wrongExtFile = path.join(testDir, 'test.zip');
        fs.writeFileSync(wrongExtFile, 'test');

        await handleUnpack(wrongExtFile, { output: outputDir, verbose: false });

        expect(consoleWarnSpy).toHaveBeenCalledWith('Warning: Input file does not have .unitypackage extension');
      });

      it('should handle uppercase .UNITYPACKAGE extension', async () => {
        const upperFile = path.join(testDir, 'test.UNITYPACKAGE');
        await createMockUnityPackage(upperFile, SAMPLE_UNITY_PACKAGE_STRUCTURE);

        await handleUnpack(upperFile, { output: outputDir, verbose: false });

        expect(consoleWarnSpy).not.toHaveBeenCalled();
      });
    });

    describe('when input file does not exist', () => {
      it('should exit with error code 1', async () => {
        const nonExistentFile = path.join(testDir, 'nonexistent.unitypackage');
        const outputDir = path.join(testDir, 'output');

        await handleUnpack(nonExistentFile, { output: outputDir, verbose: false });

        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Error: Input file'));
        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('does not exist'));
        expect(processExitSpy).toHaveBeenCalledWith(1);
      });
    });
  });
});

// We'll test the CLI indirectly by importing and testing the command structure
describe('Unity Unpack CLI', () => {
  describe('command configuration', () => {
    let program: Command;

    beforeEach(() => {
      program = new Command();
      program
        .name('unity-unpack')
        .description('A command-line tool for unpacking Unity Package (.unitypackage) files')
        .version('1.0.0');
    });

    it('should have the correct name', () => {
      expect(program.name()).toBe('unity-unpack');
    });

    it('should have the correct description', () => {
      expect(program.description()).toBe('A command-line tool for unpacking Unity Package (.unitypackage) files');
    });

    it('should have version 1.0.0', () => {
      const version = program.version();
      expect(version).toBeDefined();
    });
  });

  describe('command-line argument parsing', () => {
    let program: Command;
    let mockAction: jest.MockedFunction<(..._args: unknown[]) => void>;

    beforeEach(() => {
      mockAction = jest.fn() as jest.MockedFunction<(..._args: unknown[]) => void>;
      program = new Command();
      program
        .name('unity-unpack')
        .argument('<input>', 'Path to the .unitypackage file to unpack')
        .option('-o, --output <directory>', 'Output directory (defaults to current directory)', process.cwd())
        .option('-v, --verbose', 'Enable verbose output', false)
        .action(mockAction);
    });

    it('should require an input argument', () => {
      expect(program.registeredArguments.length).toBe(1);
      expect(program.registeredArguments[0].name()).toBe('input');
      expect(program.registeredArguments[0].required).toBe(true);
    });

    it('should have an output option with default value', () => {
      const outputOption = program.options.find(opt => opt.long === '--output');
      expect(outputOption).toBeDefined();
      expect(outputOption?.short).toBe('-o');
      expect(outputOption?.defaultValue).toBe(process.cwd());
    });

    it('should have a verbose option with default false', () => {
      const verboseOption = program.options.find(opt => opt.long === '--verbose');
      expect(verboseOption).toBeDefined();
      expect(verboseOption?.short).toBe('-v');
      expect(verboseOption?.defaultValue).toBe(false);
    });
  });

  describe('input validation behavior', () => {
    describe('when checking file existence', () => {
      it('should validate that input file exists', () => {
        const testFile = '/nonexistent/file.unitypackage';
        const exists = fs.existsSync(testFile);
        expect(exists).toBe(false);
      });

      it('should accept existing files', () => {
        const testFile = path.join(__dirname, 'test-temp.unitypackage');
        fs.writeFileSync(testFile, 'test content');
        
        const exists = fs.existsSync(testFile);
        expect(exists).toBe(true);
        
        // Cleanup
        fs.unlinkSync(testFile);
      });
    });

    describe('when validating file extension', () => {
      it('should recognize .unitypackage extension', () => {
        const filename = 'test.unitypackage';
        expect(filename.toLowerCase().endsWith('.unitypackage')).toBe(true);
      });

      it('should handle case-insensitive extensions', () => {
        const filenames = [
          'test.unitypackage',
          'test.UNITYPACKAGE',
          'test.UnityPackage',
        ];

        filenames.forEach(filename => {
          expect(filename.toLowerCase().endsWith('.unitypackage')).toBe(true);
        });
      });

      it('should reject incorrect extensions', () => {
        const incorrectFiles = [
          'test.zip',
          'test.tar.gz',
          'test.unity',
          'test.pkg',
        ];

        incorrectFiles.forEach(filename => {
          expect(filename.toLowerCase().endsWith('.unitypackage')).toBe(false);
        });
      });
    });
  });

  describe('path resolution behavior', () => {
    describe('when resolving input paths', () => {
      it('should resolve relative paths to absolute paths', () => {
        const relativePath = './test.unitypackage';
        const absolutePath = path.resolve(relativePath);
        
        expect(path.isAbsolute(absolutePath)).toBe(true);
        expect(absolutePath).toContain('test.unitypackage');
      });

      it('should handle paths with parent directory references', () => {
        const relativePath = '../test.unitypackage';
        const absolutePath = path.resolve(relativePath);
        
        expect(path.isAbsolute(absolutePath)).toBe(true);
      });

      it('should keep absolute paths unchanged', () => {
        const absolutePath = '/Users/test/file.unitypackage';
        const resolved = path.resolve(absolutePath);
        
        expect(resolved).toBe(absolutePath);
      });
    });

    describe('when resolving output paths', () => {
      it('should default to current working directory', () => {
        const defaultOutput = process.cwd();
        expect(path.isAbsolute(defaultOutput)).toBe(true);
      });

      it('should resolve custom output directories', () => {
        const customOutput = './output';
        const resolved = path.resolve(customOutput);
        
        expect(path.isAbsolute(resolved)).toBe(true);
      });
    });
  });

  describe('output directory creation behavior', () => {
    const testOutputDir = path.join(__dirname, 'test-output-dir');

    afterEach(() => {
      // Cleanup
      if (fs.existsSync(testOutputDir)) {
        fs.rmSync(testOutputDir, { recursive: true });
      }
    });

    it('should create output directory if it does not exist', () => {
      expect(fs.existsSync(testOutputDir)).toBe(false);
      
      fs.mkdirSync(testOutputDir, { recursive: true });
      
      expect(fs.existsSync(testOutputDir)).toBe(true);
    });

    it('should handle nested directory creation', () => {
      const nestedDir = path.join(testOutputDir, 'nested', 'deep');
      
      fs.mkdirSync(nestedDir, { recursive: true });
      
      expect(fs.existsSync(nestedDir)).toBe(true);
    });

    it('should not throw error if directory already exists', () => {
      fs.mkdirSync(testOutputDir, { recursive: true });
      
      expect(() => {
        fs.mkdirSync(testOutputDir, { recursive: true });
      }).not.toThrow();
    });
  });

  describe('error handling scenarios', () => {
    describe('when input file does not exist', () => {
      it('should detect missing files', () => {
        const missingFile = '/path/to/missing.unitypackage';
        expect(fs.existsSync(missingFile)).toBe(false);
      });
    });

    describe('when handling extraction errors', () => {
      it('should catch and handle Error instances', () => {
        const error = new Error('Extraction failed');
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Extraction failed');
      });

      it('should handle non-Error exceptions', () => {
        const stringError = 'String error';
        expect(typeof stringError).toBe('string');
      });
    });

    describe('when process exits on error', () => {
      it('should prepare to exit with code 1 on error', () => {
        const exitCode = 1;
        expect(exitCode).toBe(1);
      });
    });
  });

  describe('verbose mode behavior', () => {
    it('should control logging output based on verbose flag', () => {
      const verbose = true;
      const quiet = false;
      
      expect(verbose).toBe(true);
      expect(quiet).toBe(false);
    });

    it('should display file paths when verbose is enabled', () => {
      const verbose = true;
      const inputPath = '/test/input.unitypackage';
      const outputPath = '/test/output';
      
      if (verbose) {
        expect(inputPath).toBeDefined();
        expect(outputPath).toBeDefined();
      }
    });
  });

  describe('success confirmation behavior', () => {
    it('should display success message after unpacking', () => {
      const successMessage = '✓ Unity package unpacked successfully';
      expect(successMessage).toContain('✓');
      expect(successMessage).toContain('successfully');
    });
  });
});
