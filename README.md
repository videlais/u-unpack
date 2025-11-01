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

## License

MIT © Dan Cox

## Author

Dan Cox
