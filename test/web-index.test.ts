import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import * as fs from 'fs';
import * as path from 'path';
import { unpack, handleFileUpload } from '../src/web/index';
import { unpackUnityPackageWeb } from '../src/web/unpacker-web';
import { createMockUnityPackage, cleanupTestFiles, SAMPLE_UNITY_PACKAGE_STRUCTURE } from './test-helpers';

describe('Web Index', () => {
  const testDir = path.join(__dirname, 'web-index-artifacts');
  let packageBytes: Uint8Array;

  beforeAll(async () => {
    fs.mkdirSync(testDir, { recursive: true });
    const packagePath = path.join(testDir, 'sample.unitypackage');
    await createMockUnityPackage(packagePath, SAMPLE_UNITY_PACKAGE_STRUCTURE);
    packageBytes = new Uint8Array(fs.readFileSync(packagePath));
  });

  afterAll(() => {
    cleanupTestFiles(testDir);
  });

  describe('unpack', () => {
    it('should export unpack function', () => {
      expect(typeof unpack).toBe('function');
    });

    it('should be an alias for unpackUnityPackageWeb', () => {
      expect(unpack).toBe(unpackUnityPackageWeb);
    });
  });

  describe('handleFileUpload', () => {
    it('should export handleFileUpload function', () => {
      expect(typeof handleFileUpload).toBe('function');
    });

    it('should unpack a File and return the reconstructed structure', async () => {
      const file = new File([packageBytes], 'sample.unitypackage');

      const result = await handleFileUpload(file);

      expect(result.fileCount).toBe(2);
      expect(result.files.map(f => f.path).sort()).toEqual([
        'Assets/Prefabs/MyPrefab.prefab',
        'Assets/Prefabs/MyPrefab.prefab.meta',
        'Assets/Scripts/MyScript.cs',
        'Assets/Scripts/MyScript.cs.meta',
      ]);
    });
  });
});
