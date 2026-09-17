import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import pako from 'pako';
import { unpackUnityPackageWeb } from '../src/web/unpacker-web';
import { createMockUnityPackage, cleanupTestFiles, SAMPLE_UNITY_PACKAGE_STRUCTURE } from './test-helpers';

/**
 * Reads a file from disk and returns its contents as an ArrayBuffer,
 * which is what the browser unpacker consumes.
 */
function readAsArrayBuffer(filePath: string): ArrayBuffer {
  const buf = fs.readFileSync(filePath);
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

describe('Web Unpacker', () => {
  const testDir = path.join(__dirname, 'web-unpacker-artifacts');
  let packagePath: string;
  let packageBuffer: ArrayBuffer;

  beforeAll(async () => {
    fs.mkdirSync(testDir, { recursive: true });
    packagePath = path.join(testDir, 'sample.unitypackage');
    await createMockUnityPackage(packagePath, SAMPLE_UNITY_PACKAGE_STRUCTURE);
    packageBuffer = readAsArrayBuffer(packagePath);
  });

  afterAll(() => {
    cleanupTestFiles(testDir);
  });

  describe('unpackUnityPackageWeb', () => {
    it('should be exported and callable', () => {
      expect(typeof unpackUnityPackageWeb).toBe('function');
    });

    it('should reconstruct assets and their meta files', async () => {
      const result = await unpackUnityPackageWeb(packageBuffer);

      const paths = result.files.map(f => f.path).sort();
      expect(paths).toEqual([
        'Assets/Prefabs/MyPrefab.prefab',
        'Assets/Prefabs/MyPrefab.prefab.meta',
        'Assets/Scripts/MyScript.cs',
        'Assets/Scripts/MyScript.cs.meta',
      ]);
    });

    it('should count only non-meta files in fileCount', async () => {
      const result = await unpackUnityPackageWeb(packageBuffer);
      expect(result.fileCount).toBe(2);
    });

    it('should flag meta files with isMetaFile', async () => {
      const result = await unpackUnityPackageWeb(packageBuffer);

      const meta = result.files.find(f => f.path.endsWith('.meta'));
      const asset = result.files.find(f => !f.path.endsWith('.meta'));
      expect(meta?.isMetaFile).toBe(true);
      expect(asset?.isMetaFile).toBe(false);
    });

    it('should preserve the original asset content', async () => {
      const result = await unpackUnityPackageWeb(packageBuffer);

      const script = result.files.find(f => f.path === 'Assets/Scripts/MyScript.cs');
      expect(script).toBeDefined();
      expect(new TextDecoder().decode(script!.content)).toBe('Binary asset data');
    });

    it('should build a sorted list of directory levels', async () => {
      const result = await unpackUnityPackageWeb(packageBuffer);

      expect(result.structure).toEqual([
        'Assets',
        'Assets/Prefabs',
        'Assets/Scripts',
      ]);
    });

    it('should skip GUID entries that have no pathname', async () => {
      const noPathnamePath = path.join(testDir, 'no-pathname.unitypackage');
      await createMockUnityPackage(noPathnamePath, [
        { path: 'orphan/asset', content: 'orphaned asset with no pathname' },
        { path: 'orphan/asset.meta', content: 'meta only' },
      ]);

      const result = await unpackUnityPackageWeb(readAsArrayBuffer(noPathnamePath));
      expect(result.fileCount).toBe(0);
      expect(result.files).toHaveLength(0);
      expect(result.structure).toHaveLength(0);
    });

    it('should include an asset without a meta file', async () => {
      const assetOnlyPath = path.join(testDir, 'asset-only.unitypackage');
      await createMockUnityPackage(assetOnlyPath, [
        { path: 'solo/asset', content: 'just an asset' },
        { path: 'solo/pathname', content: 'Assets/Solo.txt' },
      ]);

      const result = await unpackUnityPackageWeb(readAsArrayBuffer(assetOnlyPath));
      expect(result.files.map(f => f.path)).toEqual(['Assets/Solo.txt']);
      expect(result.fileCount).toBe(1);
    });

    it('should skip TAR header blocks that have an empty name', async () => {
      // Prepend a 512-byte header block whose name field is all spaces. It is
      // non-zero (so it is not treated as the end-of-archive marker) yet decodes
      // to an empty name after trimming, exercising the empty-name skip branch.
      const validTar = pako.ungzip(new Uint8Array(packageBuffer));
      const emptyHeader = new Uint8Array(512);
      emptyHeader.fill(0x20, 0, 100);

      const combined = new Uint8Array(emptyHeader.length + validTar.length);
      combined.set(emptyHeader, 0);
      combined.set(validTar, emptyHeader.length);

      const regz = pako.gzip(combined);
      const buffer = regz.buffer.slice(regz.byteOffset, regz.byteOffset + regz.byteLength) as ArrayBuffer;

      const result = await unpackUnityPackageWeb(buffer);
      expect(result.fileCount).toBe(2);
    });
  });
});
