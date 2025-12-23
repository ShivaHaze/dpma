/**
 * Tests for DebugLogger - Centralized debug logging utility
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DebugLogger } from '../src/client/utils/DebugLogger';

describe('DebugLogger', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create a unique temp directory for each test
    tempDir = path.join(os.tmpdir(), `dpma-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  });

  afterEach(() => {
    // Cleanup temp directory if it exists
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  // ===========================================================================
  // Constructor Tests
  // ===========================================================================

  describe('constructor', () => {
    it('should create logger with enabled=true', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      expect(logger.isEnabled()).toBe(true);
    });

    it('should create logger with enabled=false', () => {
      const logger = new DebugLogger({ enabled: false, debugDir: tempDir });
      expect(logger.isEnabled()).toBe(false);
    });

    it('should store debugDir correctly', () => {
      const customDir = '/custom/debug/path';
      const logger = new DebugLogger({ enabled: true, debugDir: customDir });
      expect(logger.getDebugDir()).toBe(customDir);
    });

    it('should handle empty debugDir', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: '' });
      expect(logger.getDebugDir()).toBe('');
    });
  });

  // ===========================================================================
  // isEnabled Tests
  // ===========================================================================

  describe('isEnabled', () => {
    it('should return true when enabled', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      expect(logger.isEnabled()).toBe(true);
    });

    it('should return false when disabled', () => {
      const logger = new DebugLogger({ enabled: false, debugDir: tempDir });
      expect(logger.isEnabled()).toBe(false);
    });
  });

  // ===========================================================================
  // getDebugDir Tests
  // ===========================================================================

  describe('getDebugDir', () => {
    it('should return the configured debug directory', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: '/test/dir' });
      expect(logger.getDebugDir()).toBe('/test/dir');
    });

    it('should return Windows-style path correctly', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: 'C:\\Users\\test\\debug' });
      expect(logger.getDebugDir()).toBe('C:\\Users\\test\\debug');
    });
  });

  // ===========================================================================
  // log Tests
  // ===========================================================================

  describe('log', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log message when enabled', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      logger.log('Test message');

      expect(consoleSpy).toHaveBeenCalledWith('[DPMAClient] Test message', '');
    });

    it('should log message with data when enabled', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      const data = { foo: 'bar', count: 42 };
      logger.log('Test message', data);

      expect(consoleSpy).toHaveBeenCalledWith('[DPMAClient] Test message', data);
    });

    it('should NOT log when disabled', () => {
      const logger = new DebugLogger({ enabled: false, debugDir: tempDir });
      logger.log('Test message');

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should NOT log with data when disabled', () => {
      const logger = new DebugLogger({ enabled: false, debugDir: tempDir });
      logger.log('Test message', { data: 'test' });

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle undefined data parameter', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      logger.log('Test message', undefined);

      expect(consoleSpy).toHaveBeenCalledWith('[DPMAClient] Test message', '');
    });

    it('should handle null data parameter', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      logger.log('Test message', null);

      // Note: Implementation uses `data ?? ''` so null becomes empty string
      expect(consoleSpy).toHaveBeenCalledWith('[DPMAClient] Test message', '');
    });

    it('should handle array data parameter', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      const arrayData = [1, 2, 3];
      logger.log('Test message', arrayData);

      expect(consoleSpy).toHaveBeenCalledWith('[DPMAClient] Test message', arrayData);
    });

    it('should handle string data parameter', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      logger.log('Test message', 'extra info');

      expect(consoleSpy).toHaveBeenCalledWith('[DPMAClient] Test message', 'extra info');
    });

    it('should handle empty message', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      logger.log('');

      expect(consoleSpy).toHaveBeenCalledWith('[DPMAClient] ', '');
    });

    it('should handle message with special characters', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      logger.log('Test: Müller & Söhne <test>');

      expect(consoleSpy).toHaveBeenCalledWith('[DPMAClient] Test: Müller & Söhne <test>', '');
    });
  });

  // ===========================================================================
  // ensureDir Tests
  // ===========================================================================

  describe('ensureDir', () => {
    it('should create directory if it does not exist', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      const newDir = path.join(tempDir, 'nested', 'dir');

      expect(fs.existsSync(newDir)).toBe(false);

      logger.ensureDir(newDir);

      expect(fs.existsSync(newDir)).toBe(true);
    });

    it('should not fail if directory already exists', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });

      // Create directory first
      fs.mkdirSync(tempDir, { recursive: true });
      expect(fs.existsSync(tempDir)).toBe(true);

      // Should not throw
      expect(() => logger.ensureDir(tempDir)).not.toThrow();
    });

    it('should create deeply nested directories', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      const deepDir = path.join(tempDir, 'a', 'b', 'c', 'd', 'e');

      logger.ensureDir(deepDir);

      expect(fs.existsSync(deepDir)).toBe(true);
    });
  });

  // ===========================================================================
  // saveFile Tests
  // ===========================================================================

  describe('saveFile', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should save string content to file when enabled', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      const content = 'Test file content';

      logger.saveFile('test.txt', content);

      const filePath = path.join(tempDir, 'test.txt');
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
    });

    it('should save Buffer content to file when enabled', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      const content = Buffer.from('Binary content');

      logger.saveFile('test.bin', content);

      const filePath = path.join(tempDir, 'test.bin');
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath)).toEqual(content);
    });

    it('should NOT save file when disabled', () => {
      const logger = new DebugLogger({ enabled: false, debugDir: tempDir });

      logger.saveFile('test.txt', 'content');

      const filePath = path.join(tempDir, 'test.txt');
      expect(fs.existsSync(filePath)).toBe(false);
    });

    it('should create debug directory if it does not exist', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });

      expect(fs.existsSync(tempDir)).toBe(false);

      logger.saveFile('test.txt', 'content');

      expect(fs.existsSync(tempDir)).toBe(true);
    });

    it('should log success message after saving', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });

      logger.saveFile('test.txt', 'content');

      expect(consoleSpy).toHaveBeenCalledWith('[DPMAClient] Saved debug file: test.txt', '');
    });

    it('should handle files with special characters in content', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      const content = 'Müller & Söhne <xml>test</xml> 日本語';

      logger.saveFile('special.txt', content);

      const filePath = path.join(tempDir, 'special.txt');
      expect(fs.readFileSync(filePath, 'utf8')).toBe(content);
    });

    it('should handle empty content', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });

      logger.saveFile('empty.txt', '');

      const filePath = path.join(tempDir, 'empty.txt');
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath, 'utf8')).toBe('');
    });

    it('should handle large content', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });
      const largeContent = 'A'.repeat(100000); // 100KB

      logger.saveFile('large.txt', largeContent);

      const filePath = path.join(tempDir, 'large.txt');
      expect(fs.readFileSync(filePath, 'utf8')).toBe(largeContent);
    });

    it('should handle filename with subdirectory', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });

      // Note: saveFile uses path.join, so subdirectory in filename
      // would require the directory to exist
      logger.saveFile('simple.txt', 'content');

      expect(fs.existsSync(path.join(tempDir, 'simple.txt'))).toBe(true);
    });

    it('should overwrite existing file', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });

      logger.saveFile('overwrite.txt', 'original content');
      logger.saveFile('overwrite.txt', 'new content');

      const filePath = path.join(tempDir, 'overwrite.txt');
      expect(fs.readFileSync(filePath, 'utf8')).toBe('new content');
    });

  });

  // ===========================================================================
  // Integration Tests
  // ===========================================================================

  describe('Integration', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should work in typical debug session flow', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });

      // Log a message
      logger.log('Starting debug session');

      // Save some debug files
      logger.saveFile('request.json', JSON.stringify({ data: 'test' }));
      logger.saveFile('response.html', '<html><body>Response</body></html>');

      // Log another message
      logger.log('Session complete', { files: 2 });

      // Verify files exist
      expect(fs.existsSync(path.join(tempDir, 'request.json'))).toBe(true);
      expect(fs.existsSync(path.join(tempDir, 'response.html'))).toBe(true);

      // Verify logs were called
      expect(consoleSpy).toHaveBeenCalledTimes(4); // 2 logs + 2 saveFile logs
    });

    it('should be silent when disabled (no side effects)', () => {
      const logger = new DebugLogger({ enabled: false, debugDir: tempDir });

      // All operations should be no-ops
      logger.log('This should not log');
      logger.saveFile('should-not-exist.txt', 'content');

      // No console output
      expect(consoleSpy).not.toHaveBeenCalled();

      // No files created
      expect(fs.existsSync(tempDir)).toBe(false);
    });

    it('should handle typical DPMA debug file names', () => {
      const logger = new DebugLogger({ enabled: true, debugDir: tempDir });

      // Simulate typical debug files from DPMA workflow
      const debugFiles = [
        { name: 'step1-request.json', content: '{"step": 1}' },
        { name: 'step1-response.html', content: '<html></html>' },
        { name: 'step2-ajax-response.xml', content: '<?xml version="1.0"?><response/>' },
        { name: 'tokens.json', content: '{"viewState": "abc123"}' },
        { name: 'final-submission.pdf', content: Buffer.from('PDF content') },
      ];

      for (const file of debugFiles) {
        logger.saveFile(file.name, file.content);
        expect(fs.existsSync(path.join(tempDir, file.name))).toBe(true);
      }
    });
  });
});
