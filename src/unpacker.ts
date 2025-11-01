import * as fs from 'fs';
import * as tar from 'tar';

/**
 * Extracts a Unity Package file (.unitypackage) to the specified output directory.
 * Unity packages are special tar.gz files containing assets in a specific structure.
 * 
 * @param inputPath - Path to the .unitypackage file
 * @param outputPath - Directory where the package contents will be extracted
 * @param verbose - Enable verbose logging
 */
export async function unpackUnityPackage(
  inputPath: string,
  outputPath: string,
  verbose: boolean = false,
): Promise<void> {
  if (verbose) {
    console.log('Starting Unity package extraction...');
  }

  try {
    // Check if the file is a valid archive
    const stats = fs.statSync(inputPath);
    if (verbose) {
      console.log(`File size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    }

    // Unity packages are gzipped tar archives
    // Extract using tar
    await tar.extract({
      file: inputPath,
      cwd: outputPath,
      strict: true,
      onentry: (entry: tar.ReadEntry) => {
        if (verbose) {
          console.log(`Extracting: ${entry.path}`);
        }
      },
    });

    if (verbose) {
      console.log('Extraction completed');
    }
  } catch (error) {
    if (verbose) {
      console.error('Extraction failed:', error);
    }
    throw new Error(`Failed to extract Unity package: ${error instanceof Error ? error.message : error}`);
  }
}

/**
 * Validates if a file is a valid Unity Package file
 * 
 * @param filePath - Path to the file to validate
 * @returns true if the file appears to be a valid Unity package
 */
export function isValidUnityPackage(filePath: string): boolean {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  // Check file extension
  if (!filePath.toLowerCase().endsWith('.unitypackage')) {
    return false;
  }

  // Additional validation could be added here
  // (e.g., checking magic bytes, file structure, etc.)
  
  return true;
}
