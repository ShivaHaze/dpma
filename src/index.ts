/**
 * DPMA Trademark Registration API
 * Main entry point
 *
 * Usage:
 *   npm run dev     - Start development server with debug logging
 *   npm run build   - Compile TypeScript
 *   npm start       - Start production server
 */

import { startServer } from './api/server';

// Configuration from environment variables
const PORT = parseInt(process.env.PORT || '3000', 10);
const DEBUG = process.env.DEBUG === 'true' || process.env.NODE_ENV !== 'production';

// Start the server
startServer(PORT, { debug: DEBUG });
