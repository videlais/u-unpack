import pako from 'pako';

/**
 * Browser-compatible Unity Package unpacker
 */

export interface UnpackedFile {
  path: string;
  content: Uint8Array;
  isMetaFile: boolean;
}

export interface UnpackResult {
  files: UnpackedFile[];
  fileCount: number;
  structure: string[];
}

interface TarEntry {
  name: string;
  size: number;
  data: Uint8Array;
}

/**
 * Simple TAR parser for browser
 */
function parseTar(data: Uint8Array): TarEntry[] {
  const entries: TarEntry[] = [];
  let offset = 0;

  while (offset < data.length) {
    // Read TAR header (512 bytes)
    const header = data.slice(offset, offset + 512);
    
    // Check for end of archive (all zeros)
    if (header.every(b => b === 0)) {
      break;
    }

    // Extract filename (first 100 bytes, null-terminated)
    const nameBytes = header.slice(0, 100);
    const nameEnd = nameBytes.indexOf(0);
    const name = new TextDecoder().decode(nameBytes.slice(0, nameEnd > 0 ? nameEnd : 100)).trim();
    
    if (!name) {
      offset += 512;
      continue;
    }

    // Extract file size (octal, bytes 124-135)
    const sizeStr = new TextDecoder().decode(header.slice(124, 136)).trim().replace(/\0/g, '');
    const size = parseInt(sizeStr, 8) || 0;

    // Skip header
    offset += 512;

    // Read file data
    const fileData = data.slice(offset, offset + size);
    
    entries.push({
      name,
      size,
      data: fileData,
    });

    // Move to next entry (files are padded to 512-byte boundaries)
    offset += Math.ceil(size / 512) * 512;
  }

  return entries;
}

/**
 * Unpacks a Unity Package file in the browser
 * @param arrayBuffer - The .unitypackage file as ArrayBuffer
 * @returns Promise with unpacked files and structure
 */
export async function unpackUnityPackageWeb(arrayBuffer: ArrayBuffer): Promise<UnpackResult> {
  const files: UnpackedFile[] = [];
  const guidData = new Map<string, { pathname?: string; asset?: Uint8Array; meta?: Uint8Array }>();

  // Decompress gzip
  const compressed = new Uint8Array(arrayBuffer);
  const decompressed = pako.ungzip(compressed);

  // Parse TAR archive
  const entries = parseTar(decompressed);

  // Process entries
  for (const entry of entries) {
    const parts = entry.name.split('/');
    if (parts.length < 2) continue;

    const guid = parts[0];
    const fileName = parts[parts.length - 1];

    if (!guidData.has(guid)) {
      guidData.set(guid, {});
    }

    const data = guidData.get(guid)!;

    if (fileName === 'pathname') {
      data.pathname = new TextDecoder().decode(entry.data).trim();
    } else if (fileName === 'asset') {
      data.asset = entry.data;
    } else if (fileName === 'asset.meta') {
      data.meta = entry.data;
    }
  }

  // Reconstruct the file structure
  const structure: Set<string> = new Set();

  for (const [_guid, data] of guidData.entries()) {
    if (!data.pathname) continue;

    const originalPath = data.pathname;
    const pathParts = originalPath.split('/');
    
    // Add all directory levels to structure
    for (let i = 1; i < pathParts.length; i++) {
      structure.add(pathParts.slice(0, i).join('/'));
    }

    // Add the asset file
    if (data.asset) {
      files.push({
        path: originalPath,
        content: data.asset,
        isMetaFile: false,
      });
    }

    // Add the meta file
    if (data.meta) {
      files.push({
        path: `${originalPath}.meta`,
        content: data.meta,
        isMetaFile: true,
      });
    }
  }

  return {
    files,
    fileCount: files.filter(f => !f.isMetaFile).length,
    structure: Array.from(structure).sort(),
  };
}
