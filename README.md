# unity-unpack

A command-line tool for unpacking Unity Package (`.unitypackage`) files.

## Description

Unity Package files are special gzipped tar archives used by Unity to package and distribute assets. This tool provides a simple command-line interface to extract these packages to a directory of your choice.

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
