#!/usr/bin/env node

import { Command } from 'commander';
import { unpackUnityPackage } from './unpacker';
import * as path from 'path';
import * as fs from 'fs';

export async function handleUnpack(
  input: string,
  options: { output: string; verbose: boolean }
): Promise<void> {
  // Validate input file
  if (!fs.existsSync(input)) {
    console.error(`Error: Input file "${input}" does not exist`);
    process.exit(1);
  }

  if (!input.toLowerCase().endsWith('.unitypackage')) {
    console.warn('Warning: Input file does not have .unitypackage extension');
  }

  // Resolve paths
  const inputPath = path.resolve(input);
  const outputPath = path.resolve(options.output);

  if (options.verbose) {
    console.log(`Input file: ${inputPath}`);
    console.log(`Output directory: ${outputPath}`);
  }

  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  // Unpack the Unity package
  await unpackUnityPackage(inputPath, outputPath, options.verbose);

  console.log('✓ Unity package unpacked successfully');
}

export function createProgram(): Command {
  const program = new Command();

  program
    .name('unity-unpack')
    .description('A command-line tool for unpacking Unity Package (.unitypackage) files')
    .version('1.0.0');

  program
    .argument('<input>', 'Path to the .unitypackage file to unpack')
    .option('-o, --output <directory>', 'Output directory (defaults to current directory)', process.cwd())
    .option('-v, --verbose', 'Enable verbose output', false)
    .action(async (input: string, options: { output: string; verbose: boolean }) => {
      try {
        await handleUnpack(input, options);
      } catch (error) {
        console.error('Error unpacking Unity package:', error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return program;
}

// Only run if executed directly (not imported)
if (require.main === module) {
  const program = createProgram();
  program.parse();
}
