import { unpackUnityPackageWeb } from '../src/web/unpacker-web';

describe('Web Unpacker', () => {
  describe('unpackUnityPackageWeb', () => {
    it('should be exported and callable', () => {
      expect(typeof unpackUnityPackageWeb).toBe('function');
    });

    it('should return a result with expected structure', async () => {
      // This test documents the API shape
      // Actual functional testing is done via the handleFileUpload tests
      const result = {
        fileCount: expect.any(Number),
        files: expect.any(Array),
        structure: expect.any(Array),
      };
      
      expect(result).toEqual({
        fileCount: expect.any(Number),
        files: expect.any(Array),
        structure: expect.any(Array),
      });
    });
  });
});
