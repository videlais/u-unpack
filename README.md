# unity-unpack

A command-line tool for unpacking Unity Package (`.unitypackage`) files.

## Description

Unity Package files are special gzipped tar archives used by Unity to package and distribute assets. This tool provides a simple command-line interface to extract these packages to a directory of your choice.

## Installation

```bash
npm install -g unity-unpack
```

Or use locally:

```bash
npm install unity-unpack
```

## Usage

### Command Line

```bash
# Unpack to current directory
unity-unpack path/to/package.unitypackage

# Unpack to specific directory
unity-unpack path/to/package.unitypackage -o output/directory

# Verbose output
unity-unpack path/to/package.unitypackage -v
```

### Options

- `-o, --output <directory>` - Output directory (defaults to current directory)
- `-v, --verbose` - Enable verbose output
- `-V, --version` - Display version number
- `-h, --help` - Display help information

## Development

### Setup

```bash
# Install dependencies
npm install

# Lint code
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run everything (lint, build, test)
npm run all
```

### Testing

This project uses **BDD (Behavior-Driven Development)** testing with Jest. The test suite includes:

- **Unit Tests** (`*.test.ts`) - Test individual functions and modules in isolation
- **Integration Tests** (`integration.test.ts`) - Test the complete unpacking workflow
- **Test Helpers** (`test-helpers.ts`) - Utilities for creating mock Unity packages and fixtures

**Test Coverage:**
- ✓ File validation (existence, extension checking)
- ✓ Tar.gz extraction functionality
- ✓ Verbose logging behavior
- ✓ Error handling and edge cases
- ✓ CLI argument parsing
- ✓ Path resolution
- ✓ Output directory creation
- ✓ Complete integration scenarios

Run tests with:
```bash
npm test                 # Run all tests once
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Code Quality

This project uses **ESLint** with TypeScript support for code quality and consistency:

- **Recommended Rules**: Uses ESLint and TypeScript ESLint recommended rulesets
- **Semicolons**: Enforced (always required)
- **Quotes**: Single quotes preferred (with escape flexibility)
- **Console**: Allowed (required for CLI output)

Run linting with:
```bash
npm run lint             # Check for linting issues
npm run lint:fix         # Auto-fix linting issues
```

### Project Structure

```
unity-unpack/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── index.test.ts         # CLI BDD tests
│   ├── unpacker.ts           # Core unpacking logic
│   ├── unpacker.test.ts      # Unpacker BDD tests
│   ├── integration.test.ts   # Integration tests
│   └── test-helpers.ts       # Test utilities and fixtures
├── dist/                     # Compiled JavaScript (generated)
├── coverage/                 # Test coverage reports (generated)
├── jest.config.js            # Jest configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # NPM package configuration
└── LICENSE                   # MIT License
```

## Technical Details

Unity Package files (`.unitypackage`) are gzipped tar archives that contain Unity assets in a specific directory structure. This tool uses the `tar` library to extract these archives.

## License

MIT © Dan Cox

## Author

Dan Cox
