# u-unpack

A command-line tool for unpacking Unity Package (`.unitypackage`) files.

## Description

Unity Package files are special gzipped tar archives used by Unity to package and distribute assets. This tool extracts these packages and **reconstructs the original Unity project structure**, placing assets in their proper folders (e.g., `Assets/Scripts/`, `Assets/Prefabs/`) instead of leaving them in GUID-named directories.

### How it works

Unity packages store assets in GUID-named folders, each containing:
- `asset` - The actual file content
- `pathname` - The original Unity project path
- `asset.meta` - Unity metadata

This tool reads the `pathname` files and reconstructs the complete directory structure, making it easy to browse, modify, or integrate the extracted assets into your Unity projects.

## Web Demo

Try it online! 🌐 [https://videlais.github.io/u-unpack/](https://videlais.github.io/u-unpack/)

Extract .unitypackage files directly in your browser - no installation required. All processing happens client-side for complete privacy.

## Installation

```bash
npm install -g u-unpack
```

Or use locally:

```bash
npm install u-unpack
```

## Usage

### Command Line

```bash
# Unpack to current directory
u-unpack path/to/package.unitypackage

# Unpack to specific directory
u-unpack path/to/package.unitypackage -o output/directory

# Verbose output
u-unpack path/to/package.unitypackage -v
```

### Options

- `-o, --output <directory>` - Output directory (defaults to current directory)
- `-v, --verbose` - Enable verbose output
- `-V, --version` - Display version number
- `-h, --help` - Display help information

### Programmatic Usage (Browser)

You can also use u-unpack in the browser:

```html
<script src="https://unpkg.com/u-unpack/docs/u-unpack.bundle.js"></script>
<script>
  async function unpackFile(file) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.UUnpack.unpack(arrayBuffer);
    console.log('Extracted files:', result.files);
    console.log('Project structure:', result.structure);
  }
</script>
```

## Development

### Build Commands

```bash
npm run build        # Build CLI version
npm run build:web    # Build web version
npm run dev:web      # Start development server
npm run test         # Run Jest unit tests
npm run test:e2e     # Run Playwright browser tests
npm run test:e2e:ui  # Run Playwright tests with UI
npm run test:all     # Run all tests (Jest + Playwright)
npm run lint         # Run ESLint
npm run all          # Lint, build, test, and clean
```

## Testing

This project includes comprehensive testing:

- **Unit Tests (Jest)**: 69 tests covering CLI and Node.js unpacker (89.28% coverage)
- **E2E Tests (Playwright)**: 12 browser tests for the web demo
  - Page loading and UI elements
  - File upload functionality
  - Results display and statistics
  - File structure visualization

Run browser tests:
```bash
npm run test:e2e          # Headless mode
npm run test:e2e:headed   # With browser UI
npm run test:e2e:ui       # Interactive UI mode
```

## License

MIT © Dan Cox

## Author

Dan Cox
