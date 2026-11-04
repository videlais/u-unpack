import * as fs from 'fs';
import * as path from 'path';
import * as tar from 'tar';

function isWithinDirectory(directory: string, candidate: string): boolean {
  const relativePath = path.relative(directory, candidate);
  return relativePath === '' ||
    (relativePath !== '..' &&
      !relativePath.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relativePath));
}

function resolvePackagePath(outputPath: string, originalPath: string): string {
  const resolvedOutputPath = path.resolve(outputPath);
  const targetPath = path.resolve(resolvedOutputPath, originalPath);

  if (
    !originalPath ||
    path.isAbsolute(originalPath) ||
    !isWithinDirectory(resolvedOutputPath, targetPath)
  ) {
    throw new Error(`Package pathname is outside the output directory: ${originalPath}`);
  }

  return targetPath;
}

function assertSafeDestination(outputPath: string, targetPath: string): void {
  const realOutputPath = fs.realpathSync(outputPath);
  const realTargetDirectory = fs.realpathSync(path.dirname(targetPath));

  if (!isWithinDirectory(realOutputPath, realTargetDirectory)) {
    throw new Error(`Package pathname resolves outside the output directory: ${targetPath}`);
  }

  try {
    if (fs.lstatSync(targetPath).isSymbolicLink()) {
      throw new Error(`Refusing to overwrite symbolic link: ${targetPath}`);
    }
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) {
      throw error;
    }
  }
}

/**
 * Extracts a Unity Package file (.unitypackage) to the specified output directory.
 * Unity packages are special tar.gz files containing assets in a specific structure.
 * This function reconstructs the original Unity project structure.
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

    // Create a temporary directory for extraction
    const tempDir = path.join(outputPath, '.temp-extract');
    fs.mkdirSync(tempDir, { recursive: true });

    // Extract the tar.gz to temp directory
    await tar.extract({
      file: inputPath,
      cwd: tempDir,
      strict: true,
    });

    if (verbose) {
      console.log('Reconstructing Unity project structure...');
    }

    // Reconstruct the project structure from GUID folders
    const guidFolders = fs.readdirSync(tempDir).filter(item => {
      const itemPath = path.join(tempDir, item);
      return fs.statSync(itemPath).isDirectory();
    });

    let filesProcessed = 0;
    for (const guid of guidFolders) {
      const guidPath = path.join(tempDir, guid);
      const pathnamePath = path.join(guidPath, 'pathname');
      const assetPath = path.join(guidPath, 'asset');
      const metaPath = path.join(guidPath, 'asset.meta');

      // Check if this GUID folder has the required files
      if (!fs.existsSync(pathnamePath)) {
        if (verbose) {
          console.log(`Skipping ${guid}: no pathname file`);
        }
        continue;
      }

      // Read the original pathname
      const originalPath = fs.readFileSync(pathnamePath, 'utf-8').trim();
      const targetPath = resolvePackagePath(outputPath, originalPath);
      const targetDir = path.dirname(targetPath);

      // Create the directory structure
      fs.mkdirSync(targetDir, { recursive: true });

      // Copy the asset file if it exists
      if (fs.existsSync(assetPath)) {
        assertSafeDestination(outputPath, targetPath);
        fs.copyFileSync(assetPath, targetPath);
        filesProcessed++;
        
        if (verbose) {
          console.log(`Restored: ${originalPath}`);
        }
      }

      // Copy the .meta file if it exists
      if (fs.existsSync(metaPath)) {
        const metaTargetPath = `${targetPath}.meta`;
        assertSafeDestination(outputPath, metaTargetPath);
        fs.copyFileSync(metaPath, metaTargetPath);
        
        if (verbose) {
          console.log(`Restored: ${originalPath}.meta`);
        }
      }
    }

    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    if (verbose) {
      console.log(`Extraction completed - ${filesProcessed} files restored`);
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
