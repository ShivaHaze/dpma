/**
 * Test script for Word Mark (Wortmarke) - Full submission test
 *
 * This tests the complete registration process with a word mark.
 * Uses UEBERWEISUNG payment - application only valid if paid within 3 months.
 *
 * Tests:
 * - Legal entity applicant (GmbH)
 * - Word mark registration
 * - Nice class selection with specific terms (sub-classes)
 * - Full submission flow through to ZIP file generation
 */

import { DPMAClient } from './client/DPMAClient';
import { TrademarkRegistrationRequest, ApplicantType, TrademarkType, PaymentMethod, TrademarkRegistrationSuccess } from './types/dpma';
import * as fs from 'fs';
import * as path from 'path';

async function runWordMarkTest() {
  console.log('='.repeat(70));
  console.log('WORD MARK (Wortmarke) FULL SUBMISSION TEST');
  console.log('='.repeat(70));
  console.log('');
  console.log('WARNING: This will submit a REAL trademark application to DPMA!');
  console.log('Payment method: UEBERWEISUNG (bank transfer)');
  console.log('If you do NOT pay within 3 months, the application is automatically withdrawn.');
  console.log('');

  // Create the request - USE DUMMY TEST DATA ONLY!
  // Using a unique word mark name with timestamp to avoid conflicts
  const timestamp = Date.now();
  const wordMarkText = `MUSTERTEST${timestamp}`;

  const request: TrademarkRegistrationRequest = {
    applicant: {
      type: ApplicantType.LEGAL,
      companyName: 'Mustermann Test GmbH',
      legalForm: 'GmbH',
      address: {
        street: 'Musterstraße 123',
        zip: '80331',
        city: 'München',
        country: 'DE',
      },
    },
    email: 'test@example.com',
    sanctions: {
      hasRussianNationality: false,
      hasRussianResidence: false,
    },
    trademark: {
      type: TrademarkType.WORD,
      text: wordMarkText,
    },
    // Nice classes WITH SPECIFIC TERMS - these are ACTUAL DPMA term names discovered via Chrome DevTools
    // Note: These are "Gruppentitel" (group titles) which can be selected as checkboxes
    niceClasses: [
      {
        classNumber: 9,
        // Actual DPMA terms for Class 9 (from "Herunterladbare und aufgezeichnete Daten" category)
        terms: [
          'Anwendungssoftware',  // Application software (325 sub-terms)
          'Spielsoftware',        // Game software (51 sub-terms)
          'Betriebssysteme',      // Operating systems (5 sub-terms)
        ],
      },
      {
        classNumber: 42,
        // Actual DPMA terms for Class 42 (from "IT-Dienstleistungen" category)
        terms: [
          'IT-Dienstleistungen',  // IT services (413 sub-terms) - main group title
          'Entwicklung, Programmierung und Implementierung von Software',  // Software development (268 sub-terms)
          'Hosting-Dienste, Software as a Service [SaaS] und Vermietung von Software',  // Hosting/SaaS (95 sub-terms)
        ],
      },
    ],
    leadClass: 9, // Explicitly set lead class
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    senderName: 'Mustermann Test GmbH',
    options: {
      acceleratedExamination: false,
    },
  };

  console.log('');
  console.log('Request configuration (DUMMY TEST DATA):');
  console.log(`  Applicant: ${request.applicant.type === ApplicantType.LEGAL ? (request.applicant as any).companyName : 'Natural Person'}`);
  console.log(`  Trademark Type: ${request.trademark.type}`);
  console.log(`  Trademark Text: "${(request.trademark as any).text}"`);
  console.log(`  Lead Class: ${request.leadClass}`);
  console.log(`  Payment: ${request.paymentMethod}`);
  console.log('');
  console.log('  Nice Classes with specific terms:');
  request.niceClasses.forEach(nc => {
    console.log(`    Class ${nc.classNumber}:`);
    if (nc.terms && nc.terms.length > 0) {
      nc.terms.forEach(term => console.log(`      - ${term}`));
    } else {
      console.log(`      - [Class header only]`);
    }
  });
  console.log('');

  // Initialize client with debug mode
  const client = new DPMAClient({ debug: true });

  try {
    console.log('Starting trademark registration process...');
    console.log('');

    const result = await client.registerTrademark(request);

    if (!result.success) {
      console.error('Registration failed:', result.errorMessage);
      process.exit(1);
    }

    // Type guard - result is now TrademarkRegistrationSuccess
    const successResult = result as TrademarkRegistrationSuccess;

    console.log('');
    console.log('='.repeat(70));
    console.log('SUCCESS! Trademark application submitted!');
    console.log('='.repeat(70));
    console.log('');
    console.log('Result:');
    console.log(`  Aktenzeichen: ${successResult.aktenzeichen}`);
    console.log(`  DRN: ${successResult.drn}`);
    console.log(`  Transaction ID: ${successResult.transactionId}`);
    console.log(`  Submission Time: ${successResult.submissionTime}`);
    console.log('');
    console.log('Fees:');
    successResult.fees.forEach((fee: { description: string; amount: number }) => {
      console.log(`  ${fee.description}: €${fee.amount}`);
    });
    console.log('');
    console.log('Payment Details:');
    if (successResult.payment?.bankDetails) {
      console.log(`  Recipient: ${successResult.payment.bankDetails.recipient}`);
      console.log(`  IBAN: ${successResult.payment.bankDetails.iban}`);
      console.log(`  BIC: ${successResult.payment.bankDetails.bic}`);
      console.log(`  Reference: ${successResult.payment.bankDetails.reference}`);
      console.log(`  Total Amount: €${successResult.payment.totalAmount}`);
    }
    console.log('');

    if (successResult.receiptFilePath) {
      console.log(`Receipt saved to: ${successResult.receiptFilePath}`);
    }

    // Check for ZIP file
    const receiptsDir = path.join(__dirname, '..', 'receipts');
    if (fs.existsSync(receiptsDir)) {
      const files = fs.readdirSync(receiptsDir);
      const zipFiles = files.filter(f => f.endsWith('.zip') || f.endsWith('.ZIP'));
      const pdfFiles = files.filter(f => f.endsWith('.pdf') || f.endsWith('.PDF'));

      console.log('');
      console.log('Files in receipts folder:');
      files.forEach(f => console.log(`  - ${f}`));

      if (zipFiles.length > 0) {
        console.log('');
        console.log('ZIP FILES FOUND - Word mark registration fully working!');
        console.log('');
        console.log('TEST PASSED: Full registration flow completed successfully!');
      }
    }

  } catch (error) {
    console.error('');
    console.error('='.repeat(70));
    console.error('ERROR during registration:');
    console.error('='.repeat(70));
    console.error(error);

    // Check debug folder for more info
    const debugDir = path.join(__dirname, '..', 'debug');
    if (fs.existsSync(debugDir)) {
      const files = fs.readdirSync(debugDir);
      console.log('');
      console.log('Debug files available:');
      files.forEach(f => console.log(`  - ${f}`));
    }

    process.exit(1);
  }
}

// Run the test
runWordMarkTest();
