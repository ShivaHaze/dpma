/**
 * Tests for SessionManager - DPMA session state management
 */

import { SessionManager } from '../src/client/session/SessionManager';
import { JsfTokens } from '../src/types/dpma';

describe('SessionManager', () => {
  let session: SessionManager;

  const mockTokens: JsfTokens = {
    viewState: 'test-viewstate-123',
    clientWindow: 'test-uuid-456:0',
    primefacesNonce: 'test-nonce-789',
  };

  beforeEach(() => {
    session = new SessionManager();
  });

  // ===========================================================================
  // Initialization Tests
  // ===========================================================================

  describe('initialization', () => {
    it('should not be initialized by default', () => {
      expect(session.isInitialized()).toBe(false);
    });

    it('should be initialized after calling initialize()', () => {
      session.initialize('abc-123:0', mockTokens);
      expect(session.isInitialized()).toBe(true);
    });

    it('should store base jfwid without counter suffix', () => {
      session.initialize('abc-123-456:5', mockTokens);
      expect(session.getJfwid()).toBe('abc-123-456');
    });

    it('should handle jfwid without counter suffix', () => {
      session.initialize('simple-uuid', mockTokens);
      expect(session.getJfwid()).toBe('simple-uuid');
    });

    it('should store tokens correctly', () => {
      session.initialize('test-jfwid:0', mockTokens);
      const tokens = session.getTokens();
      expect(tokens.viewState).toBe('test-viewstate-123');
      expect(tokens.clientWindow).toBe('test-uuid-456:0');
      expect(tokens.primefacesNonce).toBe('test-nonce-789');
    });

    it('should initialize step counter to 0', () => {
      session.initialize('test-jfwid:0', mockTokens);
      expect(session.getStepCounter()).toBe(0);
    });

    it('should initialize lastResponseHtml to empty string', () => {
      session.initialize('test-jfwid:0', mockTokens);
      expect(session.getLastResponse()).toBe('');
    });
  });

  // ===========================================================================
  // Error Handling (Uninitialized State)
  // ===========================================================================

  describe('uninitialized state errors', () => {
    it('should throw when getState() called before initialization', () => {
      expect(() => session.getState()).toThrow('Session not initialized');
    });

    it('should throw when getJfwid() called before initialization', () => {
      expect(() => session.getJfwid()).toThrow('Session not initialized');
    });

    it('should throw when getTokens() called before initialization', () => {
      expect(() => session.getTokens()).toThrow('Session not initialized');
    });

    it('should throw when updateTokens() called before initialization', () => {
      expect(() => session.updateTokens({ viewState: 'new' })).toThrow('Session not initialized');
    });

    it('should throw when setTokens() called before initialization', () => {
      expect(() => session.setTokens(mockTokens)).toThrow('Session not initialized');
    });

    it('should throw when incrementStep() called before initialization', () => {
      expect(() => session.incrementStep()).toThrow('Session not initialized');
    });

    it('should throw when getStepCounter() called before initialization', () => {
      expect(() => session.getStepCounter()).toThrow('Session not initialized');
    });

    it('should throw when setLastResponse() called before initialization', () => {
      expect(() => session.setLastResponse('<html></html>')).toThrow('Session not initialized');
    });

    it('should throw when getLastResponse() called before initialization', () => {
      expect(() => session.getLastResponse()).toThrow('Session not initialized');
    });

    it('should throw when setTransactionId() called before initialization', () => {
      expect(() => session.setTransactionId('txn-123')).toThrow('Session not initialized');
    });

    it('should throw when getTransactionId() called before initialization', () => {
      expect(() => session.getTransactionId()).toThrow('Session not initialized');
    });

    it('should throw when buildFormUrl() called before initialization', () => {
      expect(() => session.buildFormUrl()).toThrow('Session not initialized');
    });
  });

  // ===========================================================================
  // Token Management
  // ===========================================================================

  describe('token management', () => {
    beforeEach(() => {
      session.initialize('test-jfwid:0', mockTokens);
    });

    it('should update viewState with updateTokens()', () => {
      session.updateTokens({ viewState: 'new-viewstate' });
      expect(session.getTokens().viewState).toBe('new-viewstate');
      // Other tokens should remain unchanged
      expect(session.getTokens().clientWindow).toBe('test-uuid-456:0');
      expect(session.getTokens().primefacesNonce).toBe('test-nonce-789');
    });

    it('should update clientWindow with updateTokens()', () => {
      session.updateTokens({ clientWindow: 'new-client-window:1' });
      expect(session.getTokens().clientWindow).toBe('new-client-window:1');
    });

    it('should update primefacesNonce with updateTokens()', () => {
      session.updateTokens({ primefacesNonce: 'new-nonce' });
      expect(session.getTokens().primefacesNonce).toBe('new-nonce');
    });

    it('should update multiple tokens at once', () => {
      session.updateTokens({
        viewState: 'vs-new',
        clientWindow: 'cw-new:2',
      });
      expect(session.getTokens().viewState).toBe('vs-new');
      expect(session.getTokens().clientWindow).toBe('cw-new:2');
      expect(session.getTokens().primefacesNonce).toBe('test-nonce-789'); // Unchanged
    });

    it('should replace all tokens with setTokens()', () => {
      const newTokens: JsfTokens = {
        viewState: 'completely-new-vs',
        clientWindow: 'completely-new-cw:0',
        primefacesNonce: 'completely-new-nonce',
      };
      session.setTokens(newTokens);
      expect(session.getTokens()).toEqual(newTokens);
    });
  });

  // ===========================================================================
  // Step Counter
  // ===========================================================================

  describe('step counter', () => {
    beforeEach(() => {
      session.initialize('test-jfwid:0', mockTokens);
    });

    it('should start at 0', () => {
      expect(session.getStepCounter()).toBe(0);
    });

    it('should increment by 1', () => {
      session.incrementStep();
      expect(session.getStepCounter()).toBe(1);
    });

    it('should increment multiple times', () => {
      session.incrementStep();
      session.incrementStep();
      session.incrementStep();
      expect(session.getStepCounter()).toBe(3);
    });

    it('should track all 8 DPMA steps', () => {
      for (let i = 0; i < 8; i++) {
        session.incrementStep();
      }
      expect(session.getStepCounter()).toBe(8);
    });
  });

  // ===========================================================================
  // Last Response HTML
  // ===========================================================================

  describe('last response HTML', () => {
    beforeEach(() => {
      session.initialize('test-jfwid:0', mockTokens);
    });

    it('should store and retrieve response HTML', () => {
      const html = '<html><body>Test response</body></html>';
      session.setLastResponse(html);
      expect(session.getLastResponse()).toBe(html);
    });

    it('should overwrite previous response', () => {
      session.setLastResponse('<html>First</html>');
      session.setLastResponse('<html>Second</html>');
      expect(session.getLastResponse()).toBe('<html>Second</html>');
    });

    it('should handle empty response', () => {
      session.setLastResponse('');
      expect(session.getLastResponse()).toBe('');
    });

    it('should handle large HTML response', () => {
      const largeHtml = '<html>' + 'A'.repeat(100000) + '</html>';
      session.setLastResponse(largeHtml);
      expect(session.getLastResponse()).toBe(largeHtml);
    });

    it('should handle response with special characters', () => {
      const htmlWithSpecials = '<html><body>Müller & Söhne <script>alert("test")</script></body></html>';
      session.setLastResponse(htmlWithSpecials);
      expect(session.getLastResponse()).toBe(htmlWithSpecials);
    });
  });

  // ===========================================================================
  // Transaction ID
  // ===========================================================================

  describe('transaction ID', () => {
    beforeEach(() => {
      session.initialize('test-jfwid:0', mockTokens);
    });

    it('should be undefined initially', () => {
      expect(session.getTransactionId()).toBeUndefined();
    });

    it('should store and retrieve transaction ID', () => {
      session.setTransactionId('encrypted-txn-abc123');
      expect(session.getTransactionId()).toBe('encrypted-txn-abc123');
    });

    it('should overwrite previous transaction ID', () => {
      session.setTransactionId('txn-1');
      session.setTransactionId('txn-2');
      expect(session.getTransactionId()).toBe('txn-2');
    });

    it('should handle long encrypted transaction ID', () => {
      const longTxn = 'a'.repeat(500);
      session.setTransactionId(longTxn);
      expect(session.getTransactionId()).toBe(longTxn);
    });
  });

  // ===========================================================================
  // Form URL Building
  // ===========================================================================

  describe('buildFormUrl', () => {
    it('should build correct form URL with ClientWindow', () => {
      session.initialize('test-jfwid:0', {
        viewState: 'vs',
        clientWindow: 'my-client-window:5',
        primefacesNonce: 'nonce',
      });

      const url = session.buildFormUrl();
      expect(url).toContain('jfwid=my-client-window:5');
      expect(url).toContain('w7005web.xhtml');
    });

    it('should include jftfdi and jffi parameters', () => {
      session.initialize('test-jfwid:0', mockTokens);
      const url = session.buildFormUrl();
      expect(url).toContain('jftfdi=');
      expect(url).toContain('jffi=w7005');
    });

    it('should use updated ClientWindow after token update', () => {
      session.initialize('test-jfwid:0', mockTokens);
      session.updateTokens({ clientWindow: 'updated-cw:10' });

      const url = session.buildFormUrl();
      expect(url).toContain('jfwid=updated-cw:10');
    });
  });

  // ===========================================================================
  // getState Direct Access
  // ===========================================================================

  describe('getState', () => {
    it('should return the complete state object', () => {
      session.initialize('my-jfwid:0', mockTokens);
      session.incrementStep();
      session.setLastResponse('<html></html>');
      session.setTransactionId('txn-123');

      const state = session.getState();

      expect(state.jfwid).toBe('my-jfwid');
      expect(state.stepCounter).toBe(1);
      expect(state.tokens).toEqual(mockTokens);
      expect(state.lastResponseHtml).toBe('<html></html>');
      expect(state.encryptedTransactionId).toBe('txn-123');
    });
  });

  // ===========================================================================
  // Integration: Full Session Flow
  // ===========================================================================

  describe('full session flow', () => {
    it('should handle complete DPMA session workflow', () => {
      // 1. Initialize session
      session.initialize('session-uuid:0', {
        viewState: 'initial-vs',
        clientWindow: 'session-uuid:0',
        primefacesNonce: 'initial-nonce',
      });

      expect(session.isInitialized()).toBe(true);
      expect(session.getStepCounter()).toBe(0);

      // 2. Simulate Step 1 completion
      session.incrementStep();
      session.updateTokens({ viewState: 'step1-vs', clientWindow: 'session-uuid:1' });
      session.setLastResponse('<html>Step 1 response</html>');

      expect(session.getStepCounter()).toBe(1);
      expect(session.getTokens().viewState).toBe('step1-vs');

      // 3. Simulate Steps 2-7
      for (let step = 2; step <= 7; step++) {
        session.incrementStep();
        session.updateTokens({
          viewState: `step${step}-vs`,
          clientWindow: `session-uuid:${step}`,
        });
      }

      expect(session.getStepCounter()).toBe(7);

      // 4. Final step with transaction ID
      session.incrementStep();
      session.setTransactionId('final-encrypted-txn');

      expect(session.getStepCounter()).toBe(8);
      expect(session.getTransactionId()).toBe('final-encrypted-txn');
    });
  });
});
