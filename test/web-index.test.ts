import { unpack, handleFileUpload } from '../src/web/index';

describe('Web Index', () => {
  describe('unpack', () => {
    it('should export unpack function', () => {
      expect(typeof unpack).toBe('function');
    });
  });

  describe('handleFileUpload', () => {
    it('should export handleFileUpload function', () => {
      expect(typeof handleFileUpload).toBe('function');
    });
  });
});
