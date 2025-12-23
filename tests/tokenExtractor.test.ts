/**
 * Tests for TokenExtractor - JSF token extraction from HTML responses
 */

import { TokenExtractor } from '../src/client/session/TokenExtractor';
import { DebugLogger } from '../src/client/utils/DebugLogger';

describe('TokenExtractor', () => {
  let extractor: TokenExtractor;
  let logger: DebugLogger;

  beforeEach(() => {
    logger = new DebugLogger({ enabled: false, debugDir: '/tmp' }); // Silent for tests
    extractor = new TokenExtractor(logger);
  });

  describe('extractTokens', () => {
    describe('ViewState Extraction', () => {
      it('should extract ViewState from standard hidden input', () => {
        const html = `
          <html>
            <form id="editor-form">
              <input type="hidden" name="jakarta.faces.ViewState" value="abc123viewstate" />
              <input type="hidden" name="jakarta.faces.ClientWindow" value="uuid-123:0" />
            </form>
            <script>PrimeFaces.csp.init('nonce123');</script>
          </html>
        `;

        const tokens = extractor.extractTokens(html);
        expect(tokens.viewState).toBe('abc123viewstate');
      });

      it('should extract ViewState from input with id$=ViewState selector', () => {
        // The implementation uses cheerio $('input[id$="ViewState"]') as fallback
        // This selector matches inputs whose ID ends with "ViewState" (not ":0")
        const html = `
          <html>
            <form>
              <input type="hidden" id="j_id1:jakarta.faces.ViewState" value="viewstate-from-id-selector" />
              <input type="hidden" name="jakarta.faces.ClientWindow" value="uuid-456:0" />
            </form>
            <script>PrimeFaces.csp.init('nonce456');</script>
          </html>
        `;

        const tokens = extractor.extractTokens(html);
        // The cheerio selector $('input[id$="ViewState"]') finds inputs whose ID ends with "ViewState"
        expect(tokens.viewState).toBe('viewstate-from-id-selector');
      });

      it('should throw error when ViewState is missing', () => {
        const html = `
          <html>
            <form>
              <input type="hidden" name="jakarta.faces.ClientWindow" value="uuid-789:0" />
            </form>
            <script>PrimeFaces.csp.init('nonce789');</script>
          </html>
        `;

        expect(() => extractor.extractTokens(html)).toThrow('Failed to extract jakarta.faces.ViewState');
      });
    });

    describe('ClientWindow Extraction', () => {
      it('should extract ClientWindow from hidden input', () => {
        const html = `
          <html>
            <form>
              <input type="hidden" name="jakarta.faces.ViewState" value="viewstate-ok" />
              <input type="hidden" name="jakarta.faces.ClientWindow" value="client-window-uuid:0" />
            </form>
            <script>PrimeFaces.csp.init('nonce');</script>
          </html>
        `;

        const tokens = extractor.extractTokens(html);
        expect(tokens.clientWindow).toBe('client-window-uuid:0');
      });

      it('should use jfwid fallback when ClientWindow input is missing', () => {
        const html = `
          <html>
            <form>
              <input type="hidden" name="jakarta.faces.ViewState" value="viewstate-ok" />
            </form>
            <script>PrimeFaces.csp.init('nonce');</script>
          </html>
        `;

        const tokens = extractor.extractTokens(html, 'fallback-jfwid:0');
        expect(tokens.clientWindow).toBe('fallback-jfwid:0');
      });

      it('should add :0 suffix to jfwid fallback if not present', () => {
        const html = `
          <html>
            <form>
              <input type="hidden" name="jakarta.faces.ViewState" value="viewstate-ok" />
            </form>
            <script>PrimeFaces.csp.init('nonce');</script>
          </html>
        `;

        const tokens = extractor.extractTokens(html, 'fallback-jfwid');
        expect(tokens.clientWindow).toBe('fallback-jfwid:0');
      });

      it('should use sessionJfwid when other sources missing', () => {
        const html = `
          <html>
            <form>
              <input type="hidden" name="jakarta.faces.ViewState" value="viewstate-ok" />
            </form>
            <script>PrimeFaces.csp.init('nonce');</script>
          </html>
        `;

        const tokens = extractor.extractTokens(html, undefined, 'session-jfwid');
        expect(tokens.clientWindow).toBe('session-jfwid:0');
      });

      it('should throw error when ClientWindow cannot be determined', () => {
        const html = `
          <html>
            <form>
              <input type="hidden" name="jakarta.faces.ViewState" value="viewstate-ok" />
            </form>
            <script>PrimeFaces.csp.init('nonce');</script>
          </html>
        `;

        expect(() => extractor.extractTokens(html)).toThrow('Failed to extract jakarta.faces.ClientWindow');
      });
    });

    describe('PrimeFaces Nonce Extraction', () => {
      it('should extract nonce from PrimeFaces.csp.init() call', () => {
        const html = `
          <html>
            <form>
              <input type="hidden" name="jakarta.faces.ViewState" value="viewstate" />
              <input type="hidden" name="jakarta.faces.ClientWindow" value="uuid:0" />
            </form>
            <script>PrimeFaces.csp.init('my-secure-nonce-value');</script>
          </html>
        `;

        const tokens = extractor.extractTokens(html);
        expect(tokens.primefacesNonce).toBe('my-secure-nonce-value');
      });

      it('should extract nonce from hidden input as fallback', () => {
        const html = `
          <html>
            <form>
              <input type="hidden" name="jakarta.faces.ViewState" value="viewstate" />
              <input type="hidden" name="jakarta.faces.ClientWindow" value="uuid:0" />
              <input type="hidden" name="primefaces.nonce" value="hidden-input-nonce" />
            </form>
          </html>
        `;

        const tokens = extractor.extractTokens(html);
        expect(tokens.primefacesNonce).toBe('hidden-input-nonce');
      });

      it('should extract nonce from script tag nonce attribute', () => {
        const html = `
          <html>
            <form>
              <input type="hidden" name="jakarta.faces.ViewState" value="viewstate" />
              <input type="hidden" name="jakarta.faces.ClientWindow" value="uuid:0" />
            </form>
            <script nonce="script-tag-nonce">console.log('test');</script>
          </html>
        `;

        const tokens = extractor.extractTokens(html);
        expect(tokens.primefacesNonce).toBe('script-tag-nonce');
      });

      it('should return empty string when nonce is not found', () => {
        const html = `
          <html>
            <form>
              <input type="hidden" name="jakarta.faces.ViewState" value="viewstate" />
              <input type="hidden" name="jakarta.faces.ClientWindow" value="uuid:0" />
            </form>
          </html>
        `;

        const tokens = extractor.extractTokens(html);
        expect(tokens.primefacesNonce).toBe('');
      });
    });

    describe('Complex HTML Scenarios', () => {
      it('should handle real-world DPMA form HTML structure', () => {
        const html = `
          <!DOCTYPE html>
          <html xmlns="http://www.w3.org/1999/xhtml" lang="de">
          <head>
            <title>DPMA Markenanmeldung</title>
            <script nonce="abc123nonce">
              if (window.PrimeFaces) {
                PrimeFaces.csp.init('abc123nonce');
              }
            </script>
          </head>
          <body>
            <form id="editor-form" method="post" action="/dpma-formular/editor">
              <input type="hidden" name="jakarta.faces.ViewState" id="j_id1:jakarta.faces.ViewState:0" value="e2s1:abc123==:encoded-viewstate-value" autocomplete="off" />
              <input type="hidden" name="jakarta.faces.ClientWindow" value="a1b2c3d4-e5f6-7890-abcd-ef1234567890:0" />
              <div class="form-content">
                <!-- Form fields here -->
              </div>
            </form>
          </body>
          </html>
        `;

        const tokens = extractor.extractTokens(html);
        expect(tokens.viewState).toBe('e2s1:abc123==:encoded-viewstate-value');
        expect(tokens.clientWindow).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890:0');
        expect(tokens.primefacesNonce).toBe('abc123nonce');
      });

      it('should handle special characters in ViewState', () => {
        const html = `
          <form>
            <input type="hidden" name="jakarta.faces.ViewState" value="e2s1:base64+with/special==chars:123" />
            <input type="hidden" name="jakarta.faces.ClientWindow" value="uuid:0" />
          </form>
          <script>PrimeFaces.csp.init('nonce');</script>
        `;

        const tokens = extractor.extractTokens(html);
        expect(tokens.viewState).toBe('e2s1:base64+with/special==chars:123');
      });
    });
  });

  describe('extractJfwid', () => {
    it('should extract jfwid from URL with simple value', () => {
      const url = 'https://dpma.de/formular?jfwid=abc123';
      expect(extractor.extractJfwid(url)).toBe('abc123');
    });

    it('should extract jfwid from URL with counter suffix', () => {
      const url = 'https://dpma.de/formular?jfwid=abc123:0';
      expect(extractor.extractJfwid(url)).toBe('abc123:0');
    });

    it('should extract jfwid from URL with multiple query params', () => {
      const url = 'https://dpma.de/formular?step=1&jfwid=uuid-here&other=value';
      expect(extractor.extractJfwid(url)).toBe('uuid-here');
    });

    it('should throw error when jfwid is missing from URL', () => {
      const url = 'https://dpma.de/formular?step=1&other=value';
      expect(() => extractor.extractJfwid(url)).toThrow('Failed to extract jfwid from URL');
    });

    it('should handle UUID-formatted jfwid', () => {
      const url = 'https://dpma.de/formular?jfwid=a1b2c3d4-e5f6-7890-abcd-ef1234567890:5';
      expect(extractor.extractJfwid(url)).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890:5');
    });
  });

  describe('updateTokensFromResponse', () => {
    it('should update ViewState from AJAX response', () => {
      const currentTokens = {
        viewState: 'old-viewstate',
        clientWindow: 'uuid:0',
        primefacesNonce: 'old-nonce',
      };

      const responseData = `
        <?xml version="1.0" encoding="UTF-8"?>
        <partial-response>
          <changes>
            <update id="jakarta.faces.ViewState"><![CDATA[new-viewstate-value]]></update>
          </changes>
        </partial-response>
      `;

      const updated = extractor.updateTokensFromResponse(responseData, currentTokens);
      expect(updated.viewState).toBe('new-viewstate-value');
      expect(updated.clientWindow).toBe('uuid:0'); // Unchanged
      expect(updated.primefacesNonce).toBe('old-nonce'); // Unchanged
    });

    it('should update ClientWindow from AJAX response', () => {
      const currentTokens = {
        viewState: 'viewstate',
        clientWindow: 'old-uuid:0',
        primefacesNonce: 'nonce',
      };

      const responseData = `
        <update id="jakarta.faces.ClientWindow"><![CDATA[new-uuid:1]]></update>
      `;

      const updated = extractor.updateTokensFromResponse(responseData, currentTokens);
      expect(updated.clientWindow).toBe('new-uuid:1');
    });

    it('should update nonce from PrimeFaces.csp.init in response', () => {
      const currentTokens = {
        viewState: 'viewstate',
        clientWindow: 'uuid:0',
        primefacesNonce: 'old-nonce',
      };

      const responseData = `
        <script>PrimeFaces.csp.init('brand-new-nonce');</script>
      `;

      const updated = extractor.updateTokensFromResponse(responseData, currentTokens);
      expect(updated.primefacesNonce).toBe('brand-new-nonce');
    });

    it('should preserve tokens when response has no updates', () => {
      const currentTokens = {
        viewState: 'original-vs',
        clientWindow: 'original-cw:0',
        primefacesNonce: 'original-nonce',
      };

      const responseData = '<div>Some content without token updates</div>';

      const updated = extractor.updateTokensFromResponse(responseData, currentTokens);
      expect(updated.viewState).toBe('original-vs');
      expect(updated.clientWindow).toBe('original-cw:0');
      expect(updated.primefacesNonce).toBe('original-nonce');
    });

    it('should handle all updates in single response', () => {
      const currentTokens = {
        viewState: 'old-vs',
        clientWindow: 'old-cw:0',
        primefacesNonce: 'old-nonce',
      };

      const responseData = `
        <partial-response>
          <update id="jakarta.faces.ViewState"><![CDATA[new-vs]]></update>
          <update id="jakarta.faces.ClientWindow"><![CDATA[new-cw:1]]></update>
          <script>PrimeFaces.csp.init('new-nonce');</script>
        </partial-response>
      `;

      const updated = extractor.updateTokensFromResponse(responseData, currentTokens);
      expect(updated.viewState).toBe('new-vs');
      expect(updated.clientWindow).toBe('new-cw:1');
      expect(updated.primefacesNonce).toBe('new-nonce');
    });
  });

  describe('extractDynamicFields', () => {
    it('should extract itemsPanel_active fields with exact pattern', () => {
      const html = `
        <input id="j_idt9679:j_idt9684:itemsPanel_active" name="j_idt9679:j_idt9684:itemsPanel_active" value="0" />
      `;

      const fields = extractor.extractDynamicFields(html);
      expect(fields['j_idt9679:j_idt9684:itemsPanel_active']).toBeDefined();
    });

    it('should extract itemsPanel_active with name first attribute order', () => {
      const html = `
        <input name="j_idt1234:j_idt5678:itemsPanel_active" value="-1" type="hidden" />
      `;

      const fields = extractor.extractDynamicFields(html);
      expect(fields['j_idt1234:j_idt5678:itemsPanel_active']).toBe('-1');
    });

    it('should extract multiple dynamic fields', () => {
      const html = `
        <input name="j_idt100:j_idt101:itemsPanel_active" value="0" />
        <input name="j_idt200:j_idt201:itemsPanel_active" value="1" />
        <input name="j_idt300:j_idt301:itemsPanel_active" value="2" />
      `;

      const fields = extractor.extractDynamicFields(html);
      expect(Object.keys(fields).length).toBe(3);
      expect(fields['j_idt100:j_idt101:itemsPanel_active']).toBe('0');
      expect(fields['j_idt200:j_idt201:itemsPanel_active']).toBe('1');
      expect(fields['j_idt300:j_idt301:itemsPanel_active']).toBe('2');
    });

    it('should extract from CDATA sections in AJAX responses', () => {
      const html = `
        <![CDATA[<input name="j_idt999:j_idt888:itemsPanel_active" value="5" />]]>
      `;

      const fields = extractor.extractDynamicFields(html);
      expect(fields['j_idt999:j_idt888:itemsPanel_active']).toBe('5');
    });

    it('should return empty object when no dynamic fields found', () => {
      const html = `
        <form>
          <input name="regular-field" value="test" />
        </form>
      `;

      const fields = extractor.extractDynamicFields(html);
      expect(Object.keys(fields).length).toBe(0);
    });

    it('should default value to -1 if empty', () => {
      const html = `
        <input name="j_idt123:j_idt456:itemsPanel_active" value="" />
      `;

      const fields = extractor.extractDynamicFields(html);
      // Implementation defaults empty values to '-1' for proper JSF handling
      expect(fields['j_idt123:j_idt456:itemsPanel_active']).toBe('-1');
    });
  });
});
