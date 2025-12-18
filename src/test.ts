/**
 * DPMA Trademark Registration API - Test Script
 *
 * This script tests the API endpoint with sample data.
 * Run with: npm test
 *
 * WARNING: This will submit a REAL trademark application to DPMA!
 * Use with caution and only with valid test data.
 */

import axios from 'axios';
import {
  TrademarkRegistrationRequest,
  ApplicantType,
  TrademarkType,
  PaymentMethod,
} from './types/dpma';

const API_URL = process.env.API_URL || 'http://localhost:3000';

/**
 * Sample trademark registration request
 */
const sampleRequest: TrademarkRegistrationRequest = {
  applicant: {
    type: ApplicantType.NATURAL,
    firstName: 'Max',
    lastName: 'Mustermann',
    address: {
      street: 'Musterstraße 123',
      zip: '12345',
      city: 'Musterstadt',
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
    text: 'TestMarke',
  },
  niceClasses: [
    { classNumber: 9 },  // Electronics, software
    { classNumber: 42 }, // IT services
  ],
  leadClass: 9,
  paymentMethod: PaymentMethod.BANK_TRANSFER,
  senderName: 'Max Mustermann',
};

/**
 * Test the validation endpoint
 */
async function testValidation(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Testing API Validation');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Test with invalid data
  const invalidRequests = [
    { name: 'Empty request', data: {} },
    { name: 'Missing applicant', data: { ...sampleRequest, applicant: undefined } },
    { name: 'Invalid email', data: { ...sampleRequest, email: 'not-an-email' } },
    { name: 'Invalid Nice class', data: { ...sampleRequest, niceClasses: [{ classNumber: 99 }] } },
  ];

  for (const test of invalidRequests) {
    try {
      console.log(`Testing: ${test.name}`);
      const response = await axios.post(`${API_URL}/api/trademark/register`, test.data, {
        validateStatus: () => true, // Don't throw on error status
      });

      if (response.status === 400 && !response.data.success) {
        console.log(`  ✓ Correctly rejected with: ${response.data.error.message}`);
        if (response.data.error.details) {
          console.log(`    Validation errors: ${response.data.error.details.length}`);
        }
      } else {
        console.log(`  ✗ Unexpected response: ${response.status}`);
      }
    } catch (error: any) {
      console.log(`  ✗ Request failed: ${error.message}`);
    }
  }
}

/**
 * Test a valid request (DRY RUN - does not submit to DPMA)
 */
async function testValidRequest(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Testing Valid Request (Validation Only)');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('Sample request:');
  console.log(JSON.stringify(sampleRequest, null, 2));

  // Note: This would actually submit to DPMA if the server is running
  // For safety, we just show the request data

  console.log('\n⚠️  To actually submit, run the server and POST to /api/trademark/register');
  console.log('    curl -X POST http://localhost:3000/api/trademark/register \\');
  console.log('         -H "Content-Type: application/json" \\');
  console.log('         -d \'<request_json>\'');
}

/**
 * Test the health endpoint
 */
async function testHealth(): Promise<void> {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Testing Health Endpoint');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('Health check response:');
    console.log(JSON.stringify(response.data, null, 2));

    if (response.data.success && response.data.data?.status === 'healthy') {
      console.log('\n✓ Server is healthy');
    }
  } catch (error: any) {
    console.log(`✗ Health check failed: ${error.message}`);
    console.log('  Make sure the server is running: npm run dev');
  }
}

/**
 * Main test runner
 */
async function runTests(): Promise<void> {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   DPMA Trademark Registration API - Test Suite                ║
║                                                               ║
║   API URL: ${API_URL.padEnd(49)}║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);

  await testHealth();
  await testValidation();
  await testValidRequest();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Test suite complete');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run tests
runTests().catch(console.error);
