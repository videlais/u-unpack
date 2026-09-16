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

Install globally with [Bun](https://bun.sh):

```bash
bun install -g u-unpack
```

Or use locally:

```bash
bun install u-unpack
```

### Standalone executables

Prebuilt, self-contained binaries (no Bun or Node.js runtime required) are
attached to each [GitHub release](https://github.com/videlais/u-unpack/releases)
for Linux, macOS, and Windows:

| Platform | File |
| --- | --- |
| Linux (x64) | `u-unpack-linux-x64` |
| Linux (arm64) | `u-unpack-linux-arm64` |
| macOS (Intel) | `u-unpack-darwin-x64` |
| macOS (Apple Silicon) | `u-unpack-darwin-arm64` |
| Windows (x64) | `u-unpack-windows-x64.exe` |

Download the binary for your platform, make it executable (`chmod +x` on
Linux/macOS), and run it directly:

```bash
./u-unpack-linux-x64 path/to/package.unitypackage -o output/directory
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

This project uses [Bun](https://bun.sh) as its runtime, package manager, and
test runner.

### Build Commands

```bash
bun install          # Install dependencies
bun run build        # Build CLI version (TypeScript -> dist/)
bun run build:web    # Build web version
bun run dev:web      # Start development server
bun run test         # Run unit tests (bun test)
bun run test:coverage # Run unit tests with coverage
bun run test:e2e     # Run Playwright browser tests
bun run test:e2e:ui  # Run Playwright tests with UI
bun run test:all     # Run all tests (unit + Playwright)
bun run lint         # Run ESLint
bun run all          # Lint, build, test, and clean
```

### Building standalone executables

Bun can cross-compile a single-file executable for every supported platform
from any machine:

```bash
bun run compile              # Executable for the current platform
bun run compile:linux-x64    # Linux x64
bun run compile:linux-arm64  # Linux arm64
bun run compile:darwin-x64   # macOS Intel
bun run compile:darwin-arm64 # macOS Apple Silicon
bun run compile:windows-x64  # Windows x64
bun run compile:all          # All of the above
```

Executables are written to `dist/`.

## Testing

This project includes comprehensive testing:

- **Unit Tests (`bun test`)**: covering the CLI and Node.js unpacker
- **E2E Tests (Playwright)**: browser tests for the web demo
  - Page loading and UI elements
  - File upload functionality
  - Results display and statistics
  - File structure visualization

Run browser tests:
```bash
bun run test:e2e          # Headless mode
bun run test:e2e:headed   # With browser UI
bun run test:e2e:ui       # Interactive UI mode
```

## License

MIT © Dan Cox

## Author

Dan Cox
