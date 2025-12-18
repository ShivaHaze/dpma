/**
 * DPMA Trademark Registration - Comprehensive Test Suite
 *
 * This script tests all implemented features across different constellations.
 * Run with: npx ts-node src/comprehensive-test.ts
 *
 * Test modes:
 *   --validate-only  : Only run validation tests (no DPMA connection)
 *   --dry-run        : Connect to DPMA but stop before final submission
 *   --full           : Full submission (WARNING: Creates real applications!)
 *
 * Usage:
 *   npx ts-node src/comprehensive-test.ts --validate-only
 *   npx ts-node src/comprehensive-test.ts --dry-run --scenario=1
 *   npx ts-node src/comprehensive-test.ts --dry-run --all
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  TrademarkRegistrationRequest,
  ApplicantType,
  TrademarkType,
  PaymentMethod,
  NaturalPersonApplicant,
  LegalEntityApplicant,
  WordTrademark,
  ImageTrademark,
  CombinedTrademark,
  NiceClassSelection,
  AdditionalOptions,
  DeliveryAddress,
  Representative,
} from './types/dpma';
import { validateTrademarkRequest, ValidationResult } from './validation/validateRequest';
import { DPMAClient } from './client/DPMAClient';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

interface TestScenario {
  id: number;
  name: string;
  description: string;
  request: TrademarkRegistrationRequest;
  expectedFees?: number;
}

// ============================================================================
// SAMPLE DATA BUILDERS
// ============================================================================

/**
 * Create a natural person applicant
 */
function createNaturalPerson(overrides?: Partial<NaturalPersonApplicant>): NaturalPersonApplicant {
  return {
    type: ApplicantType.NATURAL,
    salutation: 'Herr',
    firstName: 'Max',
    lastName: 'Mustermann',
    address: {
      street: 'Musterstraße 123',
      zip: '80331',
      city: 'München',
      country: 'DE',
    },
    ...overrides,
  };
}

/**
 * Create a legal entity applicant
 */
function createLegalEntity(overrides?: Partial<LegalEntityApplicant>): LegalEntityApplicant {
  return {
    type: ApplicantType.LEGAL,
    companyName: 'Muster GmbH',
    legalForm: 'GmbH',
    address: {
      street: 'Industriestraße 42',
      zip: '10115',
      city: 'Berlin',
      country: 'DE',
    },
    ...overrides,
  };
}

/**
 * Create a word trademark
 */
function createWordTrademark(text: string = 'TestMarke'): WordTrademark {
  return {
    type: TrademarkType.WORD,
    text,
  };
}

/**
 * Create an image trademark (placeholder - requires actual image data)
 */
function createImageTrademark(): ImageTrademark {
  // Create a simple 1x1 pixel PNG for testing
  const pngData = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
    0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x0f, 0x00, 0x00,
    0x01, 0x01, 0x00, 0x05, 0x18, 0xd8, 0x4d, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  return {
    type: TrademarkType.FIGURATIVE,
    imageData: pngData,
    imageMimeType: 'image/png',
    imageFileName: 'test-logo.png',
  };
}

/**
 * Create a combined word/image trademark
 */
function createCombinedTrademark(): CombinedTrademark {
  const pngData = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
    0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0x0f, 0x00, 0x00,
    0x01, 0x01, 0x00, 0x05, 0x18, 0xd8, 0x4d, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  return {
    type: TrademarkType.COMBINED,
    imageData: pngData,
    imageMimeType: 'image/png',
    imageFileName: 'test-combined.png',
  };
}

/**
 * Create Nice class selections
 */
function createNiceClasses(config: 'simple' | 'with-terms' | 'multiple'): NiceClassSelection[] {
  switch (config) {
    case 'simple':
      // Just class headers
      return [
        { classNumber: 9 },
        { classNumber: 42 },
      ];

    case 'with-terms':
      // With specific term selection
      return [
        {
          classNumber: 9,
          terms: ['Software', 'Anwendungssoftware'],
          selectClassHeader: false,
        },
        {
          classNumber: 42,
          terms: ['IT-Dienstleistungen', 'Entwicklung, Programmierung und Implementierung von Software'],
          selectClassHeader: false,
        },
      ];

    case 'multiple':
      // Multiple classes with mixed selection
      return [
        { classNumber: 9, selectClassHeader: true },
        { classNumber: 35, terms: ['Werbung, Marketing und Verkaufsförderung'] },
        { classNumber: 42, terms: ['IT-Dienstleistungen'] },
      ];
  }
}

/**
 * Create additional options
 */
function createOptions(config: 'none' | 'accelerated' | 'full'): AdditionalOptions | undefined {
  switch (config) {
    case 'none':
      return undefined;

    case 'accelerated':
      return {
        acceleratedExamination: true,
      };

    case 'full':
      return {
        acceleratedExamination: true,
        licensingDeclaration: true,
        saleDeclaration: true,
      };
  }
}

/**
 * Create a separate delivery address
 */
function createDeliveryAddress(): DeliveryAddress {
  return {
    type: ApplicantType.NATURAL,
    firstName: 'Anna',
    lastName: 'Beispiel',
    address: {
      street: 'Lieferweg 7',
      zip: '50667',
      city: 'Köln',
      country: 'DE',
    },
    contact: {
      telephone: '+49 221 1234567',
      email: 'delivery@example.com',
    },
  };
}

/**
 * Create a legal representative
 */
function createRepresentative(): Representative {
  return {
    type: ApplicantType.LEGAL,
    companyName: 'Rechtsanwälte Muster & Partner',
    legalForm: 'PartG mbB',
    address: {
      street: 'Kanzleistraße 10',
      zip: '60311',
      city: 'Frankfurt am Main',
      country: 'DE',
    },
    contact: {
      telephone: '+49 69 9876543',
      email: 'kanzlei@example.com',
    },
    lawyerRegistrationId: 'RAK-FFM-12345',
    internalReference: 'M-2024-001',
  };
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

const testScenarios: TestScenario[] = [
  // Scenario 1: Basic Natural Person + Word Mark
  {
    id: 1,
    name: 'Basic Natural Person + Word Mark',
    description: 'Simplest case: natural person applicant with a word trademark',
    expectedFees: 290,
    request: {
      applicant: createNaturalPerson(),
      sanctions: { hasRussianNationality: false, hasRussianResidence: false },
      email: 'test@example.com',
      trademark: createWordTrademark('MusterMarke'),
      niceClasses: createNiceClasses('simple'),
      leadClass: 9,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Max Mustermann',
    },
  },

  // Scenario 2: Legal Entity + Word Mark
  {
    id: 2,
    name: 'Legal Entity + Word Mark',
    description: 'Company applicant (GmbH) with a word trademark',
    expectedFees: 290,
    request: {
      applicant: createLegalEntity(),
      sanctions: { hasRussianNationality: false, hasRussianResidence: false },
      email: 'company@example.com',
      trademark: createWordTrademark('FirmenMarke'),
      niceClasses: createNiceClasses('simple'),
      leadClass: 9,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Geschäftsführer Muster GmbH',
    },
  },

  // Scenario 3: Natural Person + Image Mark (Bildmarke)
  {
    id: 3,
    name: 'Natural Person + Image Mark',
    description: 'Natural person with an image-only trademark (Bildmarke)',
    expectedFees: 290,
    request: {
      applicant: createNaturalPerson(),
      sanctions: { hasRussianNationality: false, hasRussianResidence: false },
      email: 'image@example.com',
      trademark: createImageTrademark(),
      niceClasses: createNiceClasses('simple'),
      leadClass: 9,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Max Mustermann',
    },
  },

  // Scenario 4: Legal Entity + Combined Mark (Wort-/Bildmarke)
  {
    id: 4,
    name: 'Legal Entity + Combined Mark',
    description: 'Company with combined word/image trademark',
    expectedFees: 290,
    request: {
      applicant: createLegalEntity(),
      sanctions: { hasRussianNationality: false, hasRussianResidence: false },
      email: 'combined@example.com',
      trademark: createCombinedTrademark(),
      niceClasses: createNiceClasses('simple'),
      leadClass: 9,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Geschäftsführer Muster GmbH',
    },
  },

  // Scenario 5: With Specific Nice Class Terms
  {
    id: 5,
    name: 'Specific Nice Class Terms',
    description: 'Using specific term selection instead of class headers',
    expectedFees: 290,
    request: {
      applicant: createNaturalPerson(),
      sanctions: { hasRussianNationality: false, hasRussianResidence: false },
      email: 'terms@example.com',
      trademark: createWordTrademark('SoftwareMarke'),
      niceClasses: createNiceClasses('with-terms'),
      leadClass: 9,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Max Mustermann',
    },
  },

  // Scenario 6: With Accelerated Examination
  {
    id: 6,
    name: 'Accelerated Examination',
    description: 'Word mark with accelerated examination option (+200€)',
    expectedFees: 490,  // 290 + 200
    request: {
      applicant: createNaturalPerson(),
      sanctions: { hasRussianNationality: false, hasRussianResidence: false },
      email: 'accelerated@example.com',
      trademark: createWordTrademark('SchnellMarke'),
      niceClasses: createNiceClasses('simple'),
      leadClass: 9,
      options: createOptions('accelerated'),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Max Mustermann',
    },
  },

  // Scenario 7: Full Options (Accelerated + Licensing + Sale)
  {
    id: 7,
    name: 'Full Additional Options',
    description: 'All additional options enabled',
    expectedFees: 490,  // 290 + 200 (licensing/sale don't add fees)
    request: {
      applicant: createLegalEntity(),
      sanctions: { hasRussianNationality: false, hasRussianResidence: false },
      email: 'fulloptions@example.com',
      trademark: createWordTrademark('VollMarke'),
      niceClasses: createNiceClasses('simple'),
      leadClass: 9,
      options: createOptions('full'),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Geschäftsführer Muster GmbH',
    },
  },

  // Scenario 8: With Separate Delivery Address
  {
    id: 8,
    name: 'Separate Delivery Address',
    description: 'Different delivery address from applicant',
    expectedFees: 290,
    request: {
      applicant: createNaturalPerson(),
      sanctions: { hasRussianNationality: false, hasRussianResidence: false },
      deliveryAddress: createDeliveryAddress(),
      email: 'delivery@example.com',
      trademark: createWordTrademark('LieferMarke'),
      niceClasses: createNiceClasses('simple'),
      leadClass: 9,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Max Mustermann',
    },
  },

  // Scenario 9: With Legal Representative
  {
    id: 9,
    name: 'With Legal Representative',
    description: 'Application with a law firm representative',
    expectedFees: 290,
    request: {
      applicant: createNaturalPerson(),
      sanctions: { hasRussianNationality: false, hasRussianResidence: false },
      representatives: [createRepresentative()],
      email: 'representative@example.com',
      trademark: createWordTrademark('AnwaltMarke'),
      niceClasses: createNiceClasses('simple'),
      leadClass: 9,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Max Mustermann',
    },
  },

  // Scenario 10: Multiple Nice Classes
  {
    id: 10,
    name: 'Multiple Nice Classes (3+)',
    description: 'Registration with 3 Nice classes (additional fee per class over 3)',
    expectedFees: 290,  // First 3 classes included in base fee
    request: {
      applicant: createLegalEntity(),
      sanctions: { hasRussianNationality: false, hasRussianResidence: false },
      email: 'multiple@example.com',
      trademark: createWordTrademark('MultiMarke'),
      niceClasses: createNiceClasses('multiple'),
      leadClass: 9,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Geschäftsführer Muster GmbH',
    },
  },

  // Scenario 11: Full Complex Scenario
  {
    id: 11,
    name: 'Full Complex Scenario',
    description: 'Legal entity + Combined mark + Terms + Accelerated + Representative + Delivery Address',
    expectedFees: 490,
    request: {
      applicant: createLegalEntity(),
      sanctions: { hasRussianNationality: false, hasRussianResidence: false },
      representatives: [createRepresentative()],
      deliveryAddress: createDeliveryAddress(),
      email: 'complex@example.com',
      trademark: createCombinedTrademark(),
      niceClasses: createNiceClasses('with-terms'),
      leadClass: 9,
      options: createOptions('accelerated'),
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Geschäftsführer Muster GmbH',
    },
  },

  // Scenario 12: Austrian Applicant
  {
    id: 12,
    name: 'Austrian Applicant',
    description: 'Natural person from Austria',
    expectedFees: 290,
    request: {
      applicant: {
        type: ApplicantType.NATURAL,
        firstName: 'Hans',
        lastName: 'Österreicher',
        address: {
          street: 'Wiener Straße 1',
          zip: '1010',
          city: 'Wien',
          country: 'AT',
        },
      },
      sanctions: { hasRussianNationality: false, hasRussianResidence: false },
      email: 'austria@example.com',
      trademark: createWordTrademark('AlpenMarke'),
      niceClasses: createNiceClasses('simple'),
      leadClass: 9,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      senderName: 'Hans Österreicher',
    },
  },
];

// ============================================================================
// TEST RUNNERS
// ============================================================================

/**
 * Run validation tests only (no network calls)
 */
async function runValidationTests(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                     VALIDATION TESTS                             ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  let failed = 0;

  for (const scenario of testScenarios) {
    const result = validateTrademarkRequest(scenario.request);
    const status = result.valid ? '✓ PASS' : '✗ FAIL';
    const statusColor = result.valid ? '\x1b[32m' : '\x1b[31m';

    console.log(`${statusColor}${status}\x1b[0m  Scenario ${scenario.id}: ${scenario.name}`);

    if (!result.valid) {
      console.log(`       Errors:`);
      for (const error of result.errors) {
        console.log(`         - ${error.field}: ${error.message}`);
      }
      failed++;
    } else {
      passed++;
    }
  }

  console.log('\n────────────────────────────────────────────────────────────────────');
  console.log(`Validation Results: ${passed} passed, ${failed} failed`);
  console.log('────────────────────────────────────────────────────────────────────\n');
}

/**
 * Run invalid request tests
 */
async function runInvalidRequestTests(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                  INVALID REQUEST TESTS                           ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  const invalidRequests = [
    {
      name: 'Empty request',
      data: {},
      expectedErrors: ['applicant', 'sanctions', 'email', 'trademark', 'niceClasses', 'paymentMethod', 'senderName'],
    },
    {
      name: 'Missing applicant name',
      data: {
        applicant: { type: ApplicantType.NATURAL, address: { street: 'Test', zip: '12345', city: 'Berlin', country: 'DE' } },
        sanctions: { hasRussianNationality: false, hasRussianResidence: false },
        email: 'test@test.com',
        trademark: { type: TrademarkType.WORD, text: 'Test' },
        niceClasses: [{ classNumber: 9 }],
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        senderName: 'Test',
      },
      expectedErrors: ['applicant.firstName', 'applicant.lastName'],
    },
    {
      name: 'Invalid email format',
      data: {
        ...testScenarios[0].request,
        email: 'not-an-email',
      },
      expectedErrors: ['email'],
    },
    {
      name: 'Invalid Nice class (99)',
      data: {
        ...testScenarios[0].request,
        niceClasses: [{ classNumber: 99 }],
      },
      expectedErrors: ['niceClasses[0].classNumber'],
    },
    {
      name: 'Empty Nice classes array',
      data: {
        ...testScenarios[0].request,
        niceClasses: [],
      },
      expectedErrors: ['niceClasses'],
    },
    {
      name: 'Word mark without text',
      data: {
        ...testScenarios[0].request,
        trademark: { type: TrademarkType.WORD, text: '' },
      },
      expectedErrors: ['trademark.text'],
    },
    {
      name: 'Invalid country code',
      data: {
        applicant: {
          type: ApplicantType.NATURAL,
          firstName: 'Test',
          lastName: 'User',
          address: { street: 'Test', zip: '12345', city: 'Berlin', country: 'INVALID' },
        },
        sanctions: { hasRussianNationality: false, hasRussianResidence: false },
        email: 'test@test.com',
        trademark: { type: TrademarkType.WORD, text: 'Test' },
        niceClasses: [{ classNumber: 9 }],
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        senderName: 'Test User',
      },
      expectedErrors: ['applicant.address.country'],
    },
    {
      name: 'Lead class not in selected classes',
      data: {
        ...testScenarios[0].request,
        leadClass: 35,  // Not in niceClasses
      },
      expectedErrors: ['leadClass'],
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of invalidRequests) {
    const result = validateTrademarkRequest(test.data);
    const foundErrors = result.errors.map(e => e.field);
    const allExpectedFound = test.expectedErrors.every(expected =>
      foundErrors.some(found => found.includes(expected))
    );

    if (!result.valid && allExpectedFound) {
      console.log(`\x1b[32m✓ PASS\x1b[0m  ${test.name}`);
      console.log(`       Expected errors: ${test.expectedErrors.join(', ')}`);
      passed++;
    } else {
      console.log(`\x1b[31m✗ FAIL\x1b[0m  ${test.name}`);
      console.log(`       Expected errors: ${test.expectedErrors.join(', ')}`);
      console.log(`       Actual errors: ${foundErrors.join(', ')}`);
      console.log(`       Valid: ${result.valid}`);
      failed++;
    }
  }

  console.log('\n────────────────────────────────────────────────────────────────────');
  console.log(`Invalid Request Tests: ${passed} passed, ${failed} failed`);
  console.log('────────────────────────────────────────────────────────────────────\n');
}

/**
 * Run a dry-run test for a specific scenario
 */
async function runDryRunTest(scenarioId: number): Promise<void> {
  const scenario = testScenarios.find(s => s.id === scenarioId);
  if (!scenario) {
    console.log(`\x1b[31mError: Scenario ${scenarioId} not found\x1b[0m`);
    return;
  }

  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log(`║  DRY RUN: Scenario ${scenario.id.toString().padEnd(48)}║`);
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  console.log(`Name: ${scenario.name}`);
  console.log(`Description: ${scenario.description}`);
  console.log(`Expected Fees: ${scenario.expectedFees}€`);
  console.log('\n────────────────────────────────────────────────────────────────────\n');

  // Validate first
  const validation = validateTrademarkRequest(scenario.request);
  if (!validation.valid) {
    console.log('\x1b[31mValidation failed:\x1b[0m');
    for (const error of validation.errors) {
      console.log(`  - ${error.field}: ${error.message}`);
    }
    return;
  }
  console.log('\x1b[32m✓ Validation passed\x1b[0m\n');

  // Create client in debug mode
  const client = new DPMAClient({ debug: true });

  try {
    console.log('Initializing DPMA session...');
    await client.initSession();
    console.log('\x1b[32m✓ Session initialized\x1b[0m\n');

    console.log('Step 1: Submitting applicant data...');
    await client.submitApplicant(scenario.request);
    console.log('\x1b[32m✓ Applicant submitted\x1b[0m\n');

    // Skip Step 2 (Representative) if not provided
    if (scenario.request.representatives && scenario.request.representatives.length > 0) {
      console.log('Step 2: Submitting representative...');
      // Note: submitRepresentative would need to be called here
      console.log('\x1b[33m⚠ Representative step skipped (not fully implemented)\x1b[0m\n');
    } else {
      console.log('Step 2: No representative - skipping...\n');
    }

    console.log('Step 3: Submitting delivery address...');
    await client.submitDeliveryAddress(scenario.request);
    console.log('\x1b[32m✓ Delivery address submitted\x1b[0m\n');

    console.log('Step 4: Submitting trademark...');
    await client.submitTrademark(scenario.request);
    console.log('\x1b[32m✓ Trademark submitted\x1b[0m\n');

    console.log('Step 5: Submitting Nice classes...');
    await client.submitNiceClasses(scenario.request);
    console.log('\x1b[32m✓ Nice classes submitted\x1b[0m\n');

    console.log('Step 6: Submitting additional options...');
    await client.submitOptions(scenario.request);
    console.log('\x1b[32m✓ Additional options submitted\x1b[0m\n');

    console.log('Step 7: Submitting payment method...');
    await client.submitPayment(scenario.request);
    console.log('\x1b[32m✓ Payment submitted\x1b[0m\n');

    console.log('\x1b[33m════════════════════════════════════════════════════════════════════\x1b[0m');
    console.log('\x1b[33m  DRY RUN COMPLETE - Step 8 (Final Submission) NOT executed        \x1b[0m');
    console.log('\x1b[33m  All steps up to payment have been completed successfully.        \x1b[0m');
    console.log('\x1b[33m════════════════════════════════════════════════════════════════════\x1b[0m\n');

  } catch (error: any) {
    console.log(`\n\x1b[31m✗ Error during dry run: ${error.message}\x1b[0m`);
    if (error.stack) {
      console.log('\nStack trace:');
      console.log(error.stack);
    }
  }
}

/**
 * Run all dry-run tests
 */
async function runAllDryRunTests(): Promise<void> {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                    ALL DRY RUN TESTS                             ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  const results: { id: number; name: string; success: boolean; error?: string }[] = [];

  for (const scenario of testScenarios) {
    console.log(`\n────────────────────────────────────────────────────────────────────`);
    console.log(`Testing Scenario ${scenario.id}: ${scenario.name}`);
    console.log(`────────────────────────────────────────────────────────────────────\n`);

    const client = new DPMAClient({ debug: false });

    try {
      await client.initSession();
      await client.submitApplicant(scenario.request);
      await client.submitDeliveryAddress(scenario.request);
      await client.submitTrademark(scenario.request);
      await client.submitNiceClasses(scenario.request);
      await client.submitOptions(scenario.request);
      await client.submitPayment(scenario.request);

      console.log(`\x1b[32m✓ Scenario ${scenario.id} passed\x1b[0m`);
      results.push({ id: scenario.id, name: scenario.name, success: true });
    } catch (error: any) {
      console.log(`\x1b[31m✗ Scenario ${scenario.id} failed: ${error.message}\x1b[0m`);
      results.push({ id: scenario.id, name: scenario.name, success: false, error: error.message });
    }

    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                       TEST SUMMARY                               ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  for (const result of results) {
    const status = result.success ? '\x1b[32m✓ PASS\x1b[0m' : '\x1b[31m✗ FAIL\x1b[0m';
    console.log(`${status}  Scenario ${result.id}: ${result.name}`);
    if (result.error) {
      console.log(`       Error: ${result.error}`);
    }
  }

  console.log('\n────────────────────────────────────────────────────────────────────');
  console.log(`Total: ${passed} passed, ${failed} failed out of ${results.length} scenarios`);
  console.log('────────────────────────────────────────────────────────────────────\n');
}

/**
 * Print available scenarios
 */
function printScenarios(): void {
  console.log('\n╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                    AVAILABLE SCENARIOS                           ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  for (const scenario of testScenarios) {
    console.log(`  ${scenario.id.toString().padStart(2)}. ${scenario.name}`);
    console.log(`      ${scenario.description}`);
    console.log(`      Expected fees: ${scenario.expectedFees}€`);
    console.log('');
  }
}

/**
 * Print usage information
 */
function printUsage(): void {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║         DPMA Comprehensive Test Suite - Usage                    ║
╚══════════════════════════════════════════════════════════════════╝

Commands:
  --validate-only     Run validation tests only (no DPMA connection)
  --invalid           Run invalid request tests
  --list              List all available test scenarios
  --dry-run           Run dry-run tests (connects to DPMA, stops before submit)
  --scenario=N        Run specific scenario number (requires --dry-run)
  --all               Run all scenarios (requires --dry-run)
  --help              Show this help message

Examples:
  npx ts-node src/comprehensive-test.ts --validate-only
  npx ts-node src/comprehensive-test.ts --invalid
  npx ts-node src/comprehensive-test.ts --list
  npx ts-node src/comprehensive-test.ts --dry-run --scenario=1
  npx ts-node src/comprehensive-test.ts --dry-run --scenario=6
  npx ts-node src/comprehensive-test.ts --dry-run --all

⚠️  WARNING: --dry-run tests connect to the real DPMA website!
    They stop before final submission but do create form state.
`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     DPMA Trademark Registration - Comprehensive Test Suite       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
  `);

  if (args.includes('--help') || args.length === 0) {
    printUsage();
    return;
  }

  if (args.includes('--list')) {
    printScenarios();
    return;
  }

  if (args.includes('--validate-only')) {
    await runValidationTests();
    return;
  }

  if (args.includes('--invalid')) {
    await runInvalidRequestTests();
    return;
  }

  if (args.includes('--dry-run')) {
    const scenarioArg = args.find(a => a.startsWith('--scenario='));

    if (scenarioArg) {
      const scenarioId = parseInt(scenarioArg.split('=')[1], 10);
      await runDryRunTest(scenarioId);
    } else if (args.includes('--all')) {
      await runAllDryRunTests();
    } else {
      console.log('\x1b[33mPlease specify --scenario=N or --all with --dry-run\x1b[0m');
      printUsage();
    }
    return;
  }

  printUsage();
}

main().catch(console.error);
