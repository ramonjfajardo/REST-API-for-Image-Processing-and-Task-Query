import {
  isURL,
  getFileExtension,
  getFileNameWithoutExtension,
  calculateMD5FromBuffer,
  getRelativePath,
} from '../../../src/utils/fileUtils';

describe('File Utils', () => {
  describe('isURL', () => {
    it('should return true for valid HTTP URL', () => {
      expect(isURL('http://example.com/image.jpg')).toBe(true);
    });

    it('should return true for valid HTTPS URL', () => {
      expect(isURL('https://example.com/image.jpg')).toBe(true);
    });

    it('should return false for local file path', () => {
      expect(isURL('/path/to/image.jpg')).toBe(false);
    });

    it('should return false for relative path', () => {
      expect(isURL('./image.jpg')).toBe(false);
    });

    it('should return false for invalid URL', () => {
      expect(isURL('not-a-url')).toBe(false);
    });
  });

  describe('getFileExtension', () => {
    it('should extract extension from file path', () => {
      expect(getFileExtension('/path/to/image.jpg')).toBe('.jpg');
    });

    it('should return lowercase extension', () => {
      expect(getFileExtension('/path/to/image.JPG')).toBe('.jpg');
    });

    it('should return empty string for file without extension', () => {
      expect(getFileExtension('/path/to/file')).toBe('');
    });
  });

  describe('getFileNameWithoutExtension', () => {
    it('should return filename without extension', () => {
      expect(getFileNameWithoutExtension('/path/to/image.jpg')).toBe('image');
    });

    it('should handle files with multiple dots', () => {
      expect(getFileNameWithoutExtension('/path/to/image.backup.jpg')).toBe('image.backup');
    });

    it('should return full filename if no extension', () => {
      expect(getFileNameWithoutExtension('/path/to/file')).toBe('file');
    });
  });

  describe('calculateMD5FromBuffer', () => {
    it('should calculate MD5 hash from buffer', () => {
      const buffer = Buffer.from('test content');
      const hash = calculateMD5FromBuffer(buffer);
      expect(hash).toBeTruthy();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(32); // MD5 hash is 32 characters
    });

    it('should produce consistent hash for same content', () => {
      const buffer = Buffer.from('test content');
      const hash1 = calculateMD5FromBuffer(buffer);
      const hash2 = calculateMD5FromBuffer(buffer);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different content', () => {
      const buffer1 = Buffer.from('content 1');
      const buffer2 = Buffer.from('content 2');
      const hash1 = calculateMD5FromBuffer(buffer1);
      const hash2 = calculateMD5FromBuffer(buffer2);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('getRelativePath', () => {
    it('should convert backslashes to forward slashes and add leading slash', () => {
      const windowsPath = 'output\\image\\1024\\file.jpg';
      const result = getRelativePath(windowsPath);
      expect(result).toBe('/output/image/1024/file.jpg');
    });

    it('should normalize path and add leading slash', () => {
      const path = './output/../output/image.jpg';
      const result = getRelativePath(path);
      expect(result).toBe('/output/image.jpg');
    });
  });
});

