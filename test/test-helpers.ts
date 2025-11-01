/**
 * Test utilities and helpers for Unity Unpack tests
 */

import * as fs from 'fs';
import * as path from 'path';
import * as tar from 'tar';

/**
 * Creates a mock Unity package file for testing
 * @param filePath - Path where the mock file should be created
 * @param files - Array of file objects to include in the package
 */
export async function createMockUnityPackage(
  filePath: string,
  files: Array<{ path: string; content: string }> = []
): Promise<void> {
  const tempDir = path.join(path.dirname(filePath), '.temp-unity-package');
  
  try {
    // Create temporary directory structure
    fs.mkdirSync(tempDir, { recursive: true });
    
    // Create files
    for (const file of files) {
      const fullPath = path.join(tempDir, file.path);
      const dir = path.dirname(fullPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, file.content);
    }
    
    // Create tar.gz archive
    await tar.create(
      {
        gzip: true,
        file: filePath,
        cwd: tempDir,
      },
      fs.readdirSync(tempDir)
    );
  } finally {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

/**
 * Cleans up test files and directories
 * @param paths - Array of paths to remove
 */
export function cleanupTestFiles(...paths: string[]): void {
  for (const p of paths) {
    if (fs.existsSync(p)) {
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        fs.rmSync(p, { recursive: true, force: true });
      } else {
        fs.unlinkSync(p);
      }
    }
  }
}

/**
 * Creates a temporary directory for testing
 * @param prefix - Optional prefix for the directory name
 * @returns Path to the created directory
 */
export function createTempDirectory(prefix: string = 'test-'): string {
  const tempDir = path.join(__dirname, `${prefix}${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Verifies that a directory contains expected files
 * @param directory - Directory to check
 * @param expectedFiles - Array of expected file paths (relative to directory)
 * @returns True if all expected files exist
 */
export function verifyExtractedFiles(
  directory: string,
  expectedFiles: string[]
): boolean {
  return expectedFiles.every(file => {
    const fullPath = path.join(directory, file);
    return fs.existsSync(fullPath);
  });
}

/**
 * Gets all files in a directory recursively
 * @param directory - Directory to search
 * @param baseDir - Base directory for relative paths (used internally)
 * @returns Array of relative file paths
 */
export function getAllFilesInDirectory(
  directory: string,
  baseDir: string = directory
): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(directory)) {
    return files;
  }
  
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...getAllFilesInDirectory(fullPath, baseDir));
    } else {
      files.push(path.relative(baseDir, fullPath));
    }
  }
  
  return files;
}

/**
 * Sample Unity package structure for testing
 */
export const SAMPLE_UNITY_PACKAGE_STRUCTURE = [
  {
    path: 'guid1/asset',
    content: 'Binary asset data',
  },
  {
    path: 'guid1/pathname',
    content: 'Assets/Scripts/MyScript.cs',
  },
  {
    path: 'guid1/asset.meta',
    content: 'fileFormatVersion: 2\nguid: guid1\n',
  },
  {
    path: 'guid2/asset',
    content: 'Another asset',
  },
  {
    path: 'guid2/pathname',
    content: 'Assets/Prefabs/MyPrefab.prefab',
  },
  {
    path: 'guid2/asset.meta',
    content: 'fileFormatVersion: 2\nguid: guid2\n',
  },
];

/**
 * Mock console output capture for testing
 */
export class ConsoleCapture {
  private originalLog: typeof console.log;
  private originalError: typeof console.error;
  private originalWarn: typeof console.warn;
  
  public logs: string[] = [];
  public errors: string[] = [];
  public warnings: string[] = [];
  
  constructor() {
    this.originalLog = console.log;
    this.originalError = console.error;
    this.originalWarn = console.warn;
  }
  
  start(): void {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
    
    console.log = (...args: unknown[]) => {
      this.logs.push(args.map(a => String(a)).join(' '));
    };
    
    console.error = (...args: unknown[]) => {
      this.errors.push(args.map(a => String(a)).join(' '));
    };
    
    console.warn = (...args: unknown[]) => {
      this.warnings.push(args.map(a => String(a)).join(' '));
    };
  }
  
  stop(): void {
    console.log = this.originalLog;
    console.error = this.originalError;
    console.warn = this.originalWarn;
  }
  
  clear(): void {
    this.logs = [];
    this.errors = [];
    this.warnings = [];
  }
}
