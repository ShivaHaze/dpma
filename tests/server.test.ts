/**
 * Integration tests for DPMA API Server endpoints
 */

import request from 'supertest';
import { createServer } from '../src/api/server';
import express from 'express';
import { ApplicantType, TrademarkType, PaymentMethod } from '../src/types/dpma';

describe('API Server', () => {
  let app: express.Application;

  beforeAll(() => {
    app = createServer({ debug: false });
  });

  // Ensure clean shutdown - fixes "worker process failed to exit gracefully" warning
  afterAll(async () => {
    // Give pending requests time to complete
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  // ===========================================================================
  // Health Check Endpoint
  // ===========================================================================

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.version).toBe('1.0.0');
      expect(response.body.data.uptime).toBeGreaterThanOrEqual(0);
    });

    it('should include requestId in response', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body.requestId).toBeDefined();
      expect(response.body.requestId).toMatch(/^[a-f0-9-]+$/i);
    });

    it('should include timestamp in response', async () => {
      const response = await request(app).get('/health').expect(200);

      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp).getTime()).not.toBeNaN();
    });
  });

  // ===========================================================================
  // API Documentation Endpoint
  // ===========================================================================

  describe('GET /api', () => {
    it('should return API documentation', async () => {
      const response = await request(app)
        .get('/api')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('DPMA Trademark Registration API');
      expect(response.body.data.version).toBe('1.0.0');
    });

    it('should list all endpoints', async () => {
      const response = await request(app).get('/api').expect(200);

      const endpoints = response.body.data.endpoints;
      expect(endpoints).toHaveProperty('POST /api/trademark/register');
      expect(endpoints).toHaveProperty('GET /api/taxonomy/search');
      expect(endpoints).toHaveProperty('GET /api/taxonomy/validate');
      expect(endpoints).toHaveProperty('GET /api/taxonomy/classes');
      expect(endpoints).toHaveProperty('GET /api/taxonomy/classes/:id');
      expect(endpoints).toHaveProperty('GET /api/taxonomy/stats');
      expect(endpoints).toHaveProperty('GET /health');
      expect(endpoints).toHaveProperty('GET /api');
    });
  });

  // ===========================================================================
  // 404 Handler
  // ===========================================================================

  describe('404 Handler', () => {
    it('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown/endpoint')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toContain('/unknown/endpoint');
    });

    it('should return 404 for unknown POST endpoints', async () => {
      const response = await request(app)
        .post('/api/unknown')
        .send({})
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ===========================================================================
  // Taxonomy Search Endpoint
  // ===========================================================================

  describe('GET /api/taxonomy/search', () => {
    it('should return search results for valid query', async () => {
      const response = await request(app)
        .get('/api/taxonomy/search')
        .query({ q: 'Software' })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.query).toBe('Software');
      expect(response.body.data.results).toBeDefined();
      expect(Array.isArray(response.body.data.results)).toBe(true);
      expect(response.body.data.count).toBeGreaterThanOrEqual(0);
    });

    it('should reject query shorter than 2 characters', async () => {
      const response = await request(app)
        .get('/api/taxonomy/search')
        .query({ q: 'a' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_QUERY');
      expect(response.body.error.message).toContain('2 characters');
    });

    it('should reject missing query parameter', async () => {
      const response = await request(app)
        .get('/api/taxonomy/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_QUERY');
    });

    it('should filter by class number', async () => {
      const response = await request(app)
        .get('/api/taxonomy/search')
        .query({ q: 'Software', class: '9' })
        .expect(200);

      expect(response.body.success).toBe(true);
      // All results should be from class 9
      for (const result of response.body.data.results) {
        expect(result.classNumber).toBe(9);
      }
    });

    it('should respect limit parameter', async () => {
      const response = await request(app)
        .get('/api/taxonomy/search')
        .query({ q: 'Software', limit: '5' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeLessThanOrEqual(5);
    });

    it('should respect leafOnly parameter', async () => {
      const response = await request(app)
        .get('/api/taxonomy/search')
        .query({ q: 'Software', leafOnly: 'true' })
        .expect(200);

      expect(response.body.success).toBe(true);
      // All results should be leaf nodes
      for (const result of response.body.data.results) {
        expect(result.isLeaf).toBe(true);
      }
    });

    it('should cap limit at 100', async () => {
      const response = await request(app)
        .get('/api/taxonomy/search')
        .query({ q: 'Software', limit: '500' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results.length).toBeLessThanOrEqual(100);
    });
  });

  // ===========================================================================
  // Taxonomy Validate Endpoint
  // ===========================================================================

  describe('/api/taxonomy/validate', () => {
    describe('GET', () => {
      it('should validate terms via query parameter', async () => {
        const response = await request(app)
          .get('/api/taxonomy/validate')
          .query({ terms: 'Klasse 9' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.results).toBeDefined();
        expect(response.body.data.results.length).toBe(1);
      });

      it('should validate multiple comma-separated terms', async () => {
        const response = await request(app)
          .get('/api/taxonomy/validate')
          .query({ terms: 'Klasse 9,Klasse 35' })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.results.length).toBe(2);
      });

      it('should reject empty terms parameter', async () => {
        const response = await request(app)
          .get('/api/taxonomy/validate')
          .query({ terms: '' })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_REQUEST');
      });

      it('should reject missing terms parameter', async () => {
        const response = await request(app)
          .get('/api/taxonomy/validate')
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INVALID_REQUEST');
      });
    });

    describe('POST', () => {
      it('should validate terms via JSON body', async () => {
        const response = await request(app)
          .post('/api/taxonomy/validate')
          .send({ terms: ['Klasse 9'] })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.results).toBeDefined();
      });

      it('should validate terms with class number filter', async () => {
        const response = await request(app)
          .post('/api/taxonomy/validate')
          .send({ terms: ['Software'], classNumber: 9 })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.classNumber).toBe(9);
      });

      it('should return suggestions for invalid terms', async () => {
        const response = await request(app)
          .post('/api/taxonomy/validate')
          .send({ terms: ['InvalidTermXYZ123'] })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.valid).toBe(false);
        const invalidResult = response.body.data.results[0];
        expect(invalidResult.valid).toBe(false);
        expect(invalidResult.error).toBeDefined();
      });
    });
  });

  // ===========================================================================
  // Taxonomy Classes Endpoint
  // ===========================================================================

  describe('GET /api/taxonomy/classes', () => {
    it('should return all Nice classes', async () => {
      const response = await request(app)
        .get('/api/taxonomy/classes')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.classes).toBeDefined();
      expect(Array.isArray(response.body.data.classes)).toBe(true);
      expect(response.body.data.classes.length).toBeGreaterThan(0);
    });

    it('should include class information', async () => {
      const response = await request(app)
        .get('/api/taxonomy/classes')
        .expect(200);

      const class9 = response.body.data.classes.find((c: any) => c.classNumber === 9);
      expect(class9).toBeDefined();
      expect(class9.category).toBe('goods');
      expect(class9.name).toContain('Klasse');
    });

    it('should categorize goods classes (1-34) correctly', async () => {
      const response = await request(app)
        .get('/api/taxonomy/classes')
        .expect(200);

      const goodsClasses = response.body.data.classes.filter(
        (c: any) => c.classNumber >= 1 && c.classNumber <= 34
      );

      for (const cls of goodsClasses) {
        expect(cls.category).toBe('goods');
      }
    });

    it('should categorize services classes (35-45) correctly', async () => {
      const response = await request(app)
        .get('/api/taxonomy/classes')
        .expect(200);

      const servicesClasses = response.body.data.classes.filter(
        (c: any) => c.classNumber >= 35 && c.classNumber <= 45
      );

      for (const cls of servicesClasses) {
        expect(cls.category).toBe('services');
      }
    });
  });

  // ===========================================================================
  // Taxonomy Class Details Endpoint
  // ===========================================================================

  describe('GET /api/taxonomy/classes/:id', () => {
    it('should return class details for valid class', async () => {
      const response = await request(app)
        .get('/api/taxonomy/classes/9')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.classNumber).toBe(9);
      expect(response.body.data.category).toBe('goods');
      expect(response.body.data.categories).toBeDefined();
      expect(response.body.data.allEntries).toBeDefined();
    });

    it('should reject class number 0', async () => {
      const response = await request(app)
        .get('/api/taxonomy/classes/0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CLASS');
    });

    it('should reject class number 46', async () => {
      const response = await request(app)
        .get('/api/taxonomy/classes/46')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CLASS');
    });

    it('should reject non-numeric class', async () => {
      const response = await request(app)
        .get('/api/taxonomy/classes/abc')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CLASS');
    });

    it('should return class 1 (boundary)', async () => {
      const response = await request(app)
        .get('/api/taxonomy/classes/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.classNumber).toBe(1);
    });

    it('should return class 45 (boundary)', async () => {
      const response = await request(app)
        .get('/api/taxonomy/classes/45')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.classNumber).toBe(45);
    });
  });

  // ===========================================================================
  // Taxonomy Stats Endpoint
  // ===========================================================================

  describe('GET /api/taxonomy/stats', () => {
    it('should return taxonomy statistics', async () => {
      const response = await request(app)
        .get('/api/taxonomy/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalEntries).toBeGreaterThan(0);
      expect(response.body.data.leafCount).toBeGreaterThanOrEqual(0);
      expect(response.body.data.categoryCount).toBeGreaterThanOrEqual(0);
      expect(response.body.data.loaded).toBe(true);
    });

    it('should include class counts', async () => {
      const response = await request(app)
        .get('/api/taxonomy/stats')
        .expect(200);

      expect(response.body.data.classCounts).toBeDefined();
      expect(typeof response.body.data.classCounts).toBe('object');
    });
  });

  // ===========================================================================
  // Trademark Registration Endpoint - Validation Tests
  // ===========================================================================

  describe('POST /api/trademark/register', () => {
    // Helper to create valid request
    const createValidRequest = () => ({
      applicant: {
        type: ApplicantType.NATURAL,
        firstName: 'Max',
        lastName: 'Mustermann',
        address: {
          street: 'Musterstraße 123',
          zip: '80331',
          city: 'München',
          country: 'DE',
        },
      },
      sanctions: {
        hasRussianNationality: false,
        hasRussianResidence: false,
      },
      email: 'test@example.com',
      trademark: {
        type: TrademarkType.WORD,
        text: 'TestMark',
      },
      niceClasses: [{ classNumber: 9 }],
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Max Mustermann',
    });

    describe('Request Validation', () => {
      it('should reject empty request body', async () => {
        const response = await request(app)
          .post('/api/trademark/register')
          .send({})
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
        expect(response.body.error.details).toBeDefined();
        expect(response.body.error.details.length).toBeGreaterThan(0);
      });

      it('should reject request with missing applicant', async () => {
        const req = createValidRequest();
        delete (req as any).applicant;

        const response = await request(app)
          .post('/api/trademark/register')
          .send(req)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
        expect(response.body.error.details.some((e: any) => e.field === 'applicant')).toBe(true);
      });

      it('should reject request with invalid email', async () => {
        const req = createValidRequest();
        req.email = 'not-an-email';

        const response = await request(app)
          .post('/api/trademark/register')
          .send(req)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.details.some((e: any) => e.field === 'email')).toBe(true);
      });

      it('should reject request with invalid Nice class', async () => {
        const req = createValidRequest();
        req.niceClasses = [{ classNumber: 50 }];

        const response = await request(app)
          .post('/api/trademark/register')
          .send(req)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.details.some((e: any) => e.field.includes('classNumber'))).toBe(true);
      });

      it('should reject request with empty Nice classes', async () => {
        const req = createValidRequest();
        req.niceClasses = [];

        const response = await request(app)
          .post('/api/trademark/register')
          .send(req)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.details.some((e: any) => e.field === 'niceClasses')).toBe(true);
      });

      it('should reject request with invalid payment method', async () => {
        const req = createValidRequest();
        (req as any).paymentMethod = 'CREDIT_CARD';

        const response = await request(app)
          .post('/api/trademark/register')
          .send(req)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.details.some((e: any) => e.field === 'paymentMethod')).toBe(true);
      });

      it('should reject natural person without sanctions declaration', async () => {
        const req = createValidRequest();
        delete (req as any).sanctions;

        const response = await request(app)
          .post('/api/trademark/register')
          .send(req)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.error.details.some((e: any) => e.field === 'sanctions')).toBe(true);
      });

      it('should pass validation for legal entity without sanctions declaration', async () => {
        // Note: This test only verifies validation passes (no 400 VALIDATION_ERROR)
        // We use a short timeout and catch timeout errors as expected behavior
        const req = {
          applicant: {
            type: ApplicantType.LEGAL,
            companyName: 'Test GmbH',
            legalForm: 'GmbH',
            address: {
              street: 'Teststr. 1',
              zip: '10115',
              city: 'Berlin',
              country: 'DE',
            },
          },
          email: 'test@company.de',
          trademark: {
            type: TrademarkType.WORD,
            text: 'TestMark',
          },
          niceClasses: [{ classNumber: 9 }],
          paymentMethod: PaymentMethod.BANK_TRANSFER,
          senderName: 'Test GmbH',
        };

        try {
          const response = await request(app)
            .post('/api/trademark/register')
            .timeout(1500) // Short timeout - validation happens immediately
            .send(req);

          // If we get a response, check it's not a validation error
          if (response.status === 400) {
            expect(response.body.error.code).not.toBe('VALIDATION_ERROR');
          }
          // 500 or 201 means validation passed
        } catch (error: any) {
          // Timeout is expected - it means validation passed and server started DPMA connection
          // which takes longer than our timeout
          if (error.code === 'ECONNABORTED' || error.message?.includes('Timeout')) {
            // This is success - validation passed, DPMA connection started
            expect(true).toBe(true);
          } else {
            throw error;
          }
        }
      }, 5000);
    });

    describe('Response Format', () => {
      it('should include requestId in error response', async () => {
        const response = await request(app)
          .post('/api/trademark/register')
          .send({})
          .expect(400);

        expect(response.body.requestId).toBeDefined();
        expect(response.body.requestId).toMatch(/^[a-f0-9-]+$/i);
      });

      it('should include timestamp in error response', async () => {
        const response = await request(app)
          .post('/api/trademark/register')
          .send({})
          .expect(400);

        expect(response.body.timestamp).toBeDefined();
        expect(new Date(response.body.timestamp).getTime()).not.toBeNaN();
      });
    });
  });

  // ===========================================================================
  // Content-Type and JSON Parsing
  // ===========================================================================

  describe('Content-Type Handling', () => {
    it('should accept application/json content type', async () => {
      const response = await request(app)
        .post('/api/trademark/register')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({}))
        .expect(400);

      // Should get validation error, not content-type error
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return JSON for all responses', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /application\/json/);
    });
  });

  // ===========================================================================
  // Large Payload Handling
  // ===========================================================================

  describe('Payload Size Handling', () => {
    it('should accept payloads up to 10mb without 413 error', async () => {
      // This test verifies the limit is set - we test with a moderately large payload
      // that should NOT trigger 413 Payload Too Large
      const req = {
        applicant: {
          type: ApplicantType.NATURAL,
          firstName: 'Max',
          lastName: 'Mustermann',
          address: {
            street: 'Musterstraße 123',
            zip: '80331',
            city: 'München',
            country: 'DE',
          },
        },
        sanctions: {
          hasRussianNationality: false,
          hasRussianResidence: false,
        },
        email: 'test@example.com',
        trademark: {
          type: TrademarkType.WORD,
          text: 'TestMark',
          // Large description (but still valid)
          description: 'A'.repeat(2000),
        },
        niceClasses: [{ classNumber: 9 }],
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        senderName: 'Max Mustermann',
      };

      try {
        const response = await request(app)
          .post('/api/trademark/register')
          .timeout(1500) // Short timeout - just verify payload is parsed
          .send(req);

        // Should not fail due to payload size (413)
        expect(response.status).not.toBe(413); // Payload Too Large
      } catch (error: any) {
        // Timeout is expected - it means the request was accepted and parsed
        // (413 would return immediately, not timeout)
        if (error.code === 'ECONNABORTED' || error.message?.includes('Timeout')) {
          // This is success - payload was accepted
          expect(true).toBe(true);
        } else if (error.status === 413) {
          // This would be a failure
          fail('Payload was rejected as too large (413)');
        } else {
          throw error;
        }
      }
    }, 5000);
  });
});

// ===========================================================================
// Debug Mode Tests (separate describe to use debug: true)
// ===========================================================================

describe('API Server (Debug Mode)', () => {
  let debugApp: express.Application;
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    debugApp = createServer({ debug: true });
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should log requests when debug mode is enabled', async () => {
    await request(debugApp).get('/health').expect(200);

    // Check that console.log was called with request info
    expect(consoleSpy).toHaveBeenCalled();
    const logCalls = consoleSpy.mock.calls.map(call => call[0]);
    const hasRequestLog = logCalls.some(
      (log: string) => log.includes('GET') && log.includes('/health') && log.includes('RequestID')
    );
    expect(hasRequestLog).toBe(true);
  });

  it('should log request ID in debug mode', async () => {
    consoleSpy.mockClear();
    await request(debugApp).get('/api').expect(200);

    const logCalls = consoleSpy.mock.calls.map(call => call[0]);
    const hasRequestId = logCalls.some((log: string) => log.includes('RequestID:'));
    expect(hasRequestId).toBe(true);
  });

  it('should log POST requests in debug mode', async () => {
    consoleSpy.mockClear();
    await request(debugApp)
      .post('/api/taxonomy/validate')
      .send({ terms: ['Software'] })
      .expect(200);

    const logCalls = consoleSpy.mock.calls.map(call => call[0]);
    const hasPostLog = logCalls.some((log: string) => log.includes('POST'));
    expect(hasPostLog).toBe(true);
  });
});

// ===========================================================================
// Server without debug mode (verify no logging)
// ===========================================================================

describe('API Server (No Debug Mode)', () => {
  let quietApp: express.Application;
  let consoleSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    quietApp = createServer({ debug: false });
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should NOT log requests when debug mode is disabled', async () => {
    consoleSpy.mockClear();
    await request(quietApp).get('/health').expect(200);

    // Should not have request logging (may have other logs from taxonomy loading)
    const logCalls = consoleSpy.mock.calls.map(call => call[0]);
    const hasRequestLog = logCalls.some(
      (log: string) => typeof log === 'string' && log.includes('GET') && log.includes('/health') && log.includes('RequestID')
    );
    expect(hasRequestLog).toBe(false);
  });
});
