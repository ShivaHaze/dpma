/**
 * DPMA Trademark Registration API Server
 * Express-based REST API for automated trademark registration
 */

import express, { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DPMAClient } from '../client/DPMAClient';
import { TaxonomyService } from '../client/services/TaxonomyService';
import { validateTrademarkRequest, isValidRequest } from '../validation/validateRequest';
import {
  TrademarkRegistrationRequest,
  TrademarkRegistrationResult,
  TrademarkRegistrationSuccess,
  TaxonomyEntry,
} from '../types/dpma';

// ============================================================================
// Types
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  requestId: string;
  timestamp: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  version: string;
  uptime: number;
}

// ============================================================================
// Server Setup
// ============================================================================

// Singleton TaxonomyService instance
let taxonomyService: TaxonomyService | null = null;

async function getTaxonomy(): Promise<TaxonomyService> {
  if (!taxonomyService) {
    taxonomyService = new TaxonomyService();
    await taxonomyService.load();
  }
  return taxonomyService;
}

export function createServer(options: { debug?: boolean } = {}): express.Application {
  const app = express();
  const startTime = Date.now();

  // Middleware
  app.use(express.json({ limit: '10mb' })); // Allow larger payloads for image uploads
  app.use(express.urlencoded({ extended: true }));

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = uuidv4();
    (req as any).requestId = requestId;

    if (options.debug) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - RequestID: ${requestId}`);
    }

    next();
  });

  // ============================================================================
  // Routes
  // ============================================================================

  /**
   * Health check endpoint
   */
  app.get('/health', (req: Request, res: Response) => {
    const response: ApiResponse<HealthCheckResponse> = {
      success: true,
      requestId: (req as any).requestId || uuidv4(),
      timestamp: new Date().toISOString(),
      data: {
        status: 'healthy',
        version: '1.0.0',
        uptime: Math.floor((Date.now() - startTime) / 1000),
      },
    };
    res.json(response);
  });

  /**
   * API documentation endpoint
   */
  app.get('/api', (req: Request, res: Response) => {
    const response: ApiResponse<object> = {
      success: true,
      requestId: (req as any).requestId || uuidv4(),
      timestamp: new Date().toISOString(),
      data: {
        name: 'DPMA Trademark Registration API',
        version: '1.0.0',
        endpoints: {
          'POST /api/trademark/register': 'Register a new trademark',
          'GET /api/taxonomy/search': 'Search Nice classification terms',
          'GET /api/taxonomy/validate': 'Validate Nice class terms',
          'GET /api/taxonomy/classes': 'List all Nice classes',
          'GET /api/taxonomy/classes/:id': 'Get Nice class details',
          'GET /api/taxonomy/stats': 'Get taxonomy statistics',
          'GET /health': 'Health check',
          'GET /api': 'API documentation',
        },
        documentation: 'See README.md for detailed documentation',
      },
    };
    res.json(response);
  });

  // ============================================================================
  // Taxonomy API Endpoints
  // ============================================================================

  /**
   * Search Nice classification terms
   * GET /api/taxonomy/search?q=software&class=9&limit=10
   */
  app.get('/api/taxonomy/search', async (req: Request, res: Response) => {
    const requestId = (req as any).requestId || uuidv4();
    const timestamp = new Date().toISOString();

    try {
      const taxonomy = await getTaxonomy();

      const query = (req.query.q as string) || '';
      const classNumber = req.query.class ? parseInt(req.query.class as string, 10) : undefined;
      const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 100);
      const minScore = parseFloat((req.query.minScore as string) || '0.3');
      const leafOnly = req.query.leafOnly === 'true';

      if (!query || query.length < 2) {
        return res.status(400).json({
          success: false,
          requestId,
          timestamp,
          error: {
            code: 'INVALID_QUERY',
            message: 'Query parameter "q" must be at least 2 characters',
          },
        });
      }

      const results = taxonomy.search(query, {
        classNumbers: classNumber ? [classNumber] : undefined,
        limit,
        minScore,
        leafOnly,
      });

      const response: ApiResponse<{ query: string; results: TaxonomyEntry[]; count: number }> = {
        success: true,
        requestId,
        timestamp,
        data: {
          query,
          results,
          count: results.length,
        },
      };

      res.json(response);
    } catch (error: any) {
      /* istanbul ignore next - taxonomy service errors */
      res.status(500).json({
        success: false,
        requestId,
        timestamp,
        error: {
          code: 'TAXONOMY_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * Validate Nice class terms
   * GET /api/taxonomy/validate?terms=Software,Anwendungssoftware&class=9
   * POST /api/taxonomy/validate { "terms": ["Software"], "classNumber": 9 }
   */
  app.all('/api/taxonomy/validate', async (req: Request, res: Response) => {
    const requestId = (req as any).requestId || uuidv4();
    const timestamp = new Date().toISOString();

    try {
      const taxonomy = await getTaxonomy();

      // Support both GET (query params) and POST (body)
      let terms: string[];
      let classNumber: number | undefined;

      if (req.method === 'POST') {
        terms = req.body.terms || [];
        classNumber = req.body.classNumber;
      } else {
        const termsParam = req.query.terms as string;
        terms = termsParam ? termsParam.split(',').map(t => t.trim()) : [];
        classNumber = req.query.class ? parseInt(req.query.class as string, 10) : undefined;
      }

      if (terms.length === 0) {
        return res.status(400).json({
          success: false,
          requestId,
          timestamp,
          error: {
            code: 'INVALID_REQUEST',
            message: 'At least one term is required',
          },
        });
      }

      // Validate each term
      const results: Array<{
        term: string;
        valid: boolean;
        entry?: TaxonomyEntry;
        suggestions?: TaxonomyEntry[];
        error?: string;
      }> = [];

      let allValid = true;

      for (const term of terms) {
        const validation = taxonomy.validateTerm(term, classNumber);
        results.push({
          term,
          valid: validation.found,
          entry: validation.entry,
          suggestions: validation.suggestions,
          error: validation.error,
        });
        if (!validation.found) allValid = false;
      }

      const response: ApiResponse<{
        valid: boolean;
        classNumber?: number;
        results: typeof results;
      }> = {
        success: true,
        requestId,
        timestamp,
        data: {
          valid: allValid,
          classNumber,
          results,
        },
      };

      res.json(response);
    } catch (error: any) {
      /* istanbul ignore next - taxonomy service errors */
      res.status(500).json({
        success: false,
        requestId,
        timestamp,
        error: {
          code: 'TAXONOMY_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * List all Nice classes
   * GET /api/taxonomy/classes
   */
  app.get('/api/taxonomy/classes', async (req: Request, res: Response) => {
    const requestId = (req as any).requestId || uuidv4();
    const timestamp = new Date().toISOString();

    try {
      const taxonomy = await getTaxonomy();
      const classes = taxonomy.getAvailableClasses();

      const classInfo = classes.map(num => {
        const header = taxonomy.getClassHeader(num);
        const categories = taxonomy.getClassCategories(num);
        return {
          classNumber: num,
          name: header?.text || `Klasse ${num}`,
          category: num <= 34 ? 'goods' : 'services',
          categoryCount: categories.length,
          totalItems: header?.childCount || 0,
        };
      });

      const response: ApiResponse<{ classes: typeof classInfo }> = {
        success: true,
        requestId,
        timestamp,
        data: { classes: classInfo },
      };

      res.json(response);
    } catch (error: any) {
      /* istanbul ignore next - taxonomy service errors */
      res.status(500).json({
        success: false,
        requestId,
        timestamp,
        error: {
          code: 'TAXONOMY_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * Get Nice class details
   * GET /api/taxonomy/classes/:id
   */
  app.get('/api/taxonomy/classes/:id', async (req: Request, res: Response) => {
    const requestId = (req as any).requestId || uuidv4();
    const timestamp = new Date().toISOString();

    try {
      const taxonomy = await getTaxonomy();
      const classNumber = parseInt(req.params.id, 10);

      if (isNaN(classNumber) || classNumber < 1 || classNumber > 45) {
        return res.status(400).json({
          success: false,
          requestId,
          timestamp,
          error: {
            code: 'INVALID_CLASS',
            message: 'Class number must be between 1 and 45',
          },
        });
      }

      const header = taxonomy.getClassHeader(classNumber);
      const categories = taxonomy.getClassCategories(classNumber);
      const entries = taxonomy.getClassEntries(classNumber);

      const response: ApiResponse<{
        classNumber: number;
        name: string;
        category: string;
        totalItems: number;
        categories: TaxonomyEntry[];
        allEntries: TaxonomyEntry[];
      }> = {
        success: true,
        requestId,
        timestamp,
        data: {
          classNumber,
          name: header?.text || `Klasse ${classNumber}`,
          category: classNumber <= 34 ? 'goods' : 'services',
          totalItems: header?.childCount || 0,
          categories,
          allEntries: entries,
        },
      };

      res.json(response);
    } catch (error: any) {
      /* istanbul ignore next - taxonomy service errors */
      res.status(500).json({
        success: false,
        requestId,
        timestamp,
        error: {
          code: 'TAXONOMY_ERROR',
          message: error.message,
        },
      });
    }
  });

  /**
   * Get taxonomy statistics
   * GET /api/taxonomy/stats
   */
  app.get('/api/taxonomy/stats', async (req: Request, res: Response) => {
    const requestId = (req as any).requestId || uuidv4();
    const timestamp = new Date().toISOString();

    try {
      const taxonomy = await getTaxonomy();
      const stats = taxonomy.getStats();

      const response: ApiResponse<typeof stats & { loaded: boolean }> = {
        success: true,
        requestId,
        timestamp,
        data: {
          ...stats,
          loaded: taxonomy.isLoaded(),
        },
      };

      res.json(response);
    } catch (error: any) {
      /* istanbul ignore next - taxonomy service errors */
      res.status(500).json({
        success: false,
        requestId,
        timestamp,
        error: {
          code: 'TAXONOMY_ERROR',
          message: error.message,
        },
      });
    }
  });

  // ============================================================================
  // Trademark Registration Endpoint
  // ============================================================================

  /**
   * Main trademark registration endpoint
   */
  app.post('/api/trademark/register', async (req: Request, res: Response) => {
    const requestId = (req as any).requestId || uuidv4();
    const timestamp = new Date().toISOString();

    try {
      // Validate request
      const validationResult = validateTrademarkRequest(req.body);

      if (!isValidRequest(req.body, validationResult)) {
        const response: ApiResponse<null> = {
          success: false,
          requestId,
          timestamp,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details: validationResult.errors,
          },
        };
        return res.status(400).json(response);
      }

      const trademarkRequest: TrademarkRegistrationRequest = req.body;

      /* istanbul ignore next - requires live DPMA connection */
      if (options.debug) {
        console.log(`[${timestamp}] Processing registration for: ${trademarkRequest.trademark.type === 'word' ? (trademarkRequest.trademark as any).text : 'image/combined'}`);
      }

      // Create DPMA client and register trademark
      /* istanbul ignore next - requires live DPMA connection */
      const client = new DPMAClient({ debug: options.debug });
      /* istanbul ignore next - requires live DPMA connection */
      const result: TrademarkRegistrationResult = await client.registerTrademark(trademarkRequest);

      /* istanbul ignore next - requires live DPMA connection */
      if (result.success) {
        const successResult = result as TrademarkRegistrationSuccess;

        // Convert all receipt documents to base64 for JSON response
        const documents = successResult.receiptDocuments?.map(doc => ({
          filename: doc.filename,
          mimeType: doc.mimeType,
          dataBase64: doc.data.toString('base64'),
        })) || [];

        const response: ApiResponse<object> = {
          success: true,
          requestId,
          timestamp,
          data: {
            aktenzeichen: successResult.aktenzeichen,
            drn: successResult.drn,
            transactionId: successResult.transactionId,
            submissionTime: successResult.submissionTime,
            fees: successResult.fees,
            payment: successResult.payment,
            documents, // All documents from the ZIP
            receiptFilePath: successResult.receiptFilePath, // Path to saved ZIP
          },
        };

        if (options.debug) {
          console.log(`[${timestamp}] Registration successful: ${successResult.aktenzeichen}`);
        }

        return res.status(201).json(response);
      } else {
        /* istanbul ignore next - requires live DPMA connection */
        const response: ApiResponse<null> = {
          success: false,
          requestId,
          timestamp,
          error: {
            code: result.errorCode,
            message: result.errorMessage,
            details: {
              failedAtStep: result.failedAtStep,
              validationErrors: result.validationErrors,
            },
          },
        };

        /* istanbul ignore next - requires live DPMA connection */
        if (options.debug) {
          console.log(`[${timestamp}] Registration failed: ${result.errorMessage}`);
        }

        /* istanbul ignore next - requires live DPMA connection */
        return res.status(500).json(response);
      }

    } catch (error: any) {
      /* istanbul ignore next - requires live DPMA connection */
      console.error(`[${timestamp}] Unexpected error:`, error);

      /* istanbul ignore next - requires live DPMA connection */
      const response: ApiResponse<null> = {
        success: false,
        requestId,
        timestamp,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || 'An unexpected error occurred',
          details: options.debug ? error.stack : undefined,
        },
      };

      /* istanbul ignore next - requires live DPMA connection */
      return res.status(500).json(response);
    }
  });

  // ============================================================================
  // Error Handling
  // ============================================================================

  // 404 handler
  app.use((req: Request, res: Response) => {
    const response: ApiResponse<null> = {
      success: false,
      requestId: (req as any).requestId || uuidv4(),
      timestamp: new Date().toISOString(),
      error: {
        code: 'NOT_FOUND',
        message: `Endpoint ${req.method} ${req.path} not found`,
      },
    };
    res.status(404).json(response);
  });

  // Global error handler
  /* istanbul ignore next - requires triggering unhandled error */
  app.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
    console.error('Unhandled error:', error);

    const response: ApiResponse<null> = {
      success: false,
      requestId: (req as any).requestId || uuidv4(),
      timestamp: new Date().toISOString(),
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An internal server error occurred',
        details: options.debug ? error.message : undefined,
      },
    };
    res.status(500).json(response);
  });

  return app;
}

/**
 * Start the server
 */
/* istanbul ignore next - starts actual HTTP server */
export function startServer(port: number = 3000, options: { debug?: boolean } = {}): void {
  const app = createServer(options);

  app.listen(port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   DPMA Trademark Registration API                             ║
║   ─────────────────────────────────────────────────────────   ║
║                                                               ║
║   Server running on: http://localhost:${port.toString().padEnd(24)}║
║                                                               ║
║   Trademark Endpoints:                                        ║
║   • POST /api/trademark/register  - Register trademark        ║
║                                                               ║
║   Taxonomy Endpoints:                                         ║
║   • GET  /api/taxonomy/search     - Search terms              ║
║   • GET  /api/taxonomy/validate   - Validate terms            ║
║   • GET  /api/taxonomy/classes    - List Nice classes         ║
║   • GET  /api/taxonomy/classes/:id - Get class details        ║
║   • GET  /api/taxonomy/stats      - Taxonomy statistics       ║
║                                                               ║
║   Utility Endpoints:                                          ║
║   • GET  /health                  - Health check              ║
║   • GET  /api                     - API documentation         ║
║                                                               ║
║   Debug mode: ${(options.debug ? 'ENABLED' : 'DISABLED').padEnd(45)}║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });
}
