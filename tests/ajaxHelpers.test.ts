/**
 * Tests for AjaxHelpers - Form data creation and encoding utilities
 */

import {
  createFormData,
  createUrlEncodedBody,
  addNavigationFields,
  AJAX_HEADERS,
  BROWSER_HEADERS,
} from '../src/client/http/AjaxHelpers';
import { JsfTokens } from '../src/types/dpma';

describe('AjaxHelpers', () => {
  describe('AJAX_HEADERS', () => {
    it('should have faces-request header for partial/ajax', () => {
      expect(AJAX_HEADERS['faces-request']).toBe('partial/ajax');
    });

    it('should have X-Requested-With header for XMLHttpRequest', () => {
      expect(AJAX_HEADERS['X-Requested-With']).toBe('XMLHttpRequest');
    });

    it('should have Accept header for XML', () => {
      expect(AJAX_HEADERS['Accept']).toContain('application/xml');
      expect(AJAX_HEADERS['Accept']).toContain('text/xml');
    });

    it('should have all required AJAX headers', () => {
      const requiredHeaders = ['faces-request', 'X-Requested-With', 'Accept'];
      for (const header of requiredHeaders) {
        expect(AJAX_HEADERS).toHaveProperty(header);
      }
    });
  });

  describe('BROWSER_HEADERS', () => {
    it('should have Accept header for HTML', () => {
      expect(BROWSER_HEADERS['Accept']).toContain('text/html');
      expect(BROWSER_HEADERS['Accept']).toContain('application/xhtml+xml');
    });

    it('should have Accept-Language header for German', () => {
      expect(BROWSER_HEADERS['Accept-Language']).toContain('de-DE');
      expect(BROWSER_HEADERS['Accept-Language']).toContain('de');
    });

    it('should have User-Agent header', () => {
      expect(BROWSER_HEADERS['User-Agent']).toContain('Mozilla');
      expect(BROWSER_HEADERS['User-Agent']).toContain('Chrome');
    });

    it('should have sec-ch-ua headers', () => {
      expect(BROWSER_HEADERS['sec-ch-ua']).toBeDefined();
      expect(BROWSER_HEADERS['sec-ch-ua-mobile']).toBe('?0');
      expect(BROWSER_HEADERS['sec-ch-ua-platform']).toBe('"Windows"');
    });
  });

  describe('createFormData', () => {
    it('should create FormData with single field', () => {
      const fields = { key1: 'value1' };
      const formData = createFormData(fields);

      expect(formData).toBeDefined();
      // FormData doesn't have a direct size check, but we can verify it's created
      expect(formData.getHeaders).toBeDefined(); // form-data package method
    });

    it('should create FormData with multiple fields', () => {
      const fields = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      };
      const formData = createFormData(fields);

      expect(formData).toBeDefined();
    });

    it('should create FormData with empty fields object', () => {
      const fields = {};
      const formData = createFormData(fields);

      expect(formData).toBeDefined();
    });

    it('should handle special characters in values', () => {
      const fields = {
        germanText: 'Müller & Söhne GmbH',
        specialChars: 'test@example.com',
        unicode: '测试',
      };
      const formData = createFormData(fields);

      expect(formData).toBeDefined();
    });

    it('should handle empty string values', () => {
      const fields = {
        emptyField: '',
        normalField: 'value',
      };
      const formData = createFormData(fields);

      expect(formData).toBeDefined();
    });
  });

  describe('createUrlEncodedBody', () => {
    it('should create URL-encoded body for single field', () => {
      const fields = { key: 'value' };
      const body = createUrlEncodedBody(fields);

      expect(body).toBe('key=value');
    });

    it('should create URL-encoded body for multiple fields', () => {
      const fields = {
        key1: 'value1',
        key2: 'value2',
      };
      const body = createUrlEncodedBody(fields);

      expect(body).toContain('key1=value1');
      expect(body).toContain('key2=value2');
      expect(body).toContain('&');
    });

    it('should properly encode special characters', () => {
      const fields = {
        email: 'test@example.com',
        space: 'hello world',
        ampersand: 'a&b',
        equals: 'a=b',
      };
      const body = createUrlEncodedBody(fields);

      // @ is encoded in URLSearchParams
      expect(body).toContain('email=test%40example.com');
      // Space is encoded as + or %20
      expect(body).toMatch(/space=hello(\+|%20)world/);
      // & is encoded
      expect(body).toContain('ampersand=a%26b');
      // = is encoded
      expect(body).toContain('equals=a%3Db');
    });

    it('should properly encode German umlauts', () => {
      const fields = {
        name: 'Müller',
        city: 'München',
        street: 'Königstraße',
      };
      const body = createUrlEncodedBody(fields);

      // German characters should be URL-encoded
      expect(body).not.toContain('ü');
      expect(body).not.toContain('ö');
      expect(body).not.toContain('ß');
      expect(body).toContain('%'); // Should contain percent-encoded chars
    });

    it('should return empty string for empty fields', () => {
      const fields = {};
      const body = createUrlEncodedBody(fields);

      expect(body).toBe('');
    });

    it('should handle empty string values', () => {
      const fields = { empty: '' };
      const body = createUrlEncodedBody(fields);

      expect(body).toBe('empty=');
    });

    it('should preserve order of fields', () => {
      const fields = {
        a: '1',
        b: '2',
        c: '3',
      };
      const body = createUrlEncodedBody(fields);

      const parts = body.split('&');
      expect(parts[0]).toBe('a=1');
      expect(parts[1]).toBe('b=2');
      expect(parts[2]).toBe('c=3');
    });
  });

  describe('addNavigationFields', () => {
    const mockTokens: JsfTokens = {
      viewState: 'test-viewstate-123',
      clientWindow: 'test-client-window:0',
      primefacesNonce: 'test-nonce-abc',
    };

    it('should add all standard navigation fields', () => {
      const existingFields = { customField: 'customValue' };
      const dpmaViewId = 'agents';

      const result = addNavigationFields(existingFields, dpmaViewId, mockTokens);

      // Check existing fields are preserved
      expect(result.customField).toBe('customValue');

      // Check AJAX fields are added
      expect(result['jakarta.faces.partial.ajax']).toBe('true');
      expect(result['jakarta.faces.source']).toBe('cmd-link-next');
      expect(result['jakarta.faces.partial.execute']).toBe('editor-form');
      expect(result['jakarta.faces.partial.render']).toBe('editor-form');
      expect(result['cmd-link-next']).toBe('cmd-link-next');
    });

    it('should add dpmaViewId and dpmaViewCheck', () => {
      const existingFields = {};
      const dpmaViewId = 'trademark';

      const result = addNavigationFields(existingFields, dpmaViewId, mockTokens);

      expect(result.dpmaViewId).toBe('trademark');
      expect(result.dpmaViewCheck).toBe('true');
    });

    it('should add editor-form field', () => {
      const result = addNavigationFields({}, 'wdvz', mockTokens);

      expect(result['editor-form']).toBe('editor-form');
    });

    it('should add JSF tokens from provided tokens object', () => {
      const result = addNavigationFields({}, 'payment', mockTokens);

      expect(result['jakarta.faces.ViewState']).toBe('test-viewstate-123');
      expect(result['jakarta.faces.ClientWindow']).toBe('test-client-window:0');
      expect(result['primefaces.nonce']).toBe('test-nonce-abc');
    });

    it('should not modify original fields object', () => {
      const existingFields = { original: 'value' };
      const existingFieldsCopy = { ...existingFields };

      addNavigationFields(existingFields, 'agents', mockTokens);

      expect(existingFields).toEqual(existingFieldsCopy);
    });

    it('should work with different dpmaViewId values', () => {
      const viewIds = ['agents', 'correspondence', 'trademark', 'wdvz', 'priorities', 'payment', 'submit'];

      for (const viewId of viewIds) {
        const result = addNavigationFields({}, viewId, mockTokens);
        expect(result.dpmaViewId).toBe(viewId);
      }
    });

    it('should handle complex existing fields', () => {
      const existingFields = {
        'applicant-type': 'natural',
        'applicant-firstName': 'Max',
        'applicant-lastName': 'Mustermann',
        'j_idt123:j_idt456': 'value',
        'checkbox-field': 'true',
      };

      const result = addNavigationFields(existingFields, 'agents', mockTokens);

      // All existing fields should be preserved
      expect(result['applicant-type']).toBe('natural');
      expect(result['applicant-firstName']).toBe('Max');
      expect(result['applicant-lastName']).toBe('Mustermann');
      expect(result['j_idt123:j_idt456']).toBe('value');
      expect(result['checkbox-field']).toBe('true');

      // Navigation fields should be added
      expect(result['jakarta.faces.partial.ajax']).toBe('true');
      expect(result.dpmaViewId).toBe('agents');
    });

    it('should handle empty tokens gracefully', () => {
      const emptyTokens: JsfTokens = {
        viewState: '',
        clientWindow: '',
        primefacesNonce: '',
      };

      const result = addNavigationFields({}, 'agents', emptyTokens);

      expect(result['jakarta.faces.ViewState']).toBe('');
      expect(result['jakarta.faces.ClientWindow']).toBe('');
      expect(result['primefaces.nonce']).toBe('');
    });
  });
});
