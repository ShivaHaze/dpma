/**
 * Comprehensive tests for DPMA Trademark Registration validation
 */

import { validateTrademarkRequest, ValidationResult } from '../src/validation/validateRequest';
import { ApplicantType, TrademarkType, PaymentMethod, SepaMandateType, TrademarkRegistrationRequest } from '../src/types/dpma';

describe('validateTrademarkRequest', () => {
  // Helper to create a minimal valid request - returns any to allow easy test manipulation
  const createValidRequest = (): any => ({
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

  describe('Request Structure', () => {
    it('should accept a valid minimal request', () => {
      const result = validateTrademarkRequest(createValidRequest());
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject null request', () => {
      const result = validateTrademarkRequest(null);
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('request');
    });

    it('should reject undefined request', () => {
      const result = validateTrademarkRequest(undefined);
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('request');
    });

    it('should reject non-object request', () => {
      const result = validateTrademarkRequest('not an object');
      expect(result.valid).toBe(false);
      expect(result.errors[0].field).toBe('request');
    });

    it('should reject empty object', () => {
      const result = validateTrademarkRequest({});
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Applicant Validation', () => {
    describe('Natural Person', () => {
      it('should accept valid natural person', () => {
        const result = validateTrademarkRequest(createValidRequest());
        expect(result.valid).toBe(true);
      });

      it('should require firstName for natural person', () => {
        const req = createValidRequest();
        delete (req.applicant as any).firstName;
        const result = validateTrademarkRequest(req);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'applicant.firstName')).toBe(true);
      });

      it('should require lastName for natural person', () => {
        const req = createValidRequest();
        delete (req.applicant as any).lastName;
        const result = validateTrademarkRequest(req);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'applicant.lastName')).toBe(true);
      });

      it('should reject empty firstName', () => {
        const req = createValidRequest();
        (req.applicant as any).firstName = '   ';
        const result = validateTrademarkRequest(req);
        expect(result.valid).toBe(false);
      });
    });

    describe('Legal Entity', () => {
      it('should accept valid legal entity', () => {
        const req = createValidRequest();
        req.applicant = {
          type: ApplicantType.LEGAL,
          companyName: 'Test GmbH',
          legalForm: 'GmbH',
          address: {
            street: 'Industriestr. 1',
            zip: '10115',
            city: 'Berlin',
            country: 'DE',
          },
        };
        const result = validateTrademarkRequest(req);
        expect(result.valid).toBe(true);
      });

      it('should require companyName for legal entity', () => {
        const req = createValidRequest();
        req.applicant = {
          type: ApplicantType.LEGAL,
          address: {
            street: 'Industriestr. 1',
            zip: '10115',
            city: 'Berlin',
            country: 'DE',
          },
        } as any;
        const result = validateTrademarkRequest(req);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.field === 'applicant.companyName')).toBe(true);
      });
    });

    describe('Address Validation', () => {
      it('should require street', () => {
        const req = createValidRequest();
        delete (req.applicant.address as any).street;
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'applicant.address.street')).toBe(true);
      });

      it('should require zip', () => {
        const req = createValidRequest();
        delete (req.applicant.address as any).zip;
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'applicant.address.zip')).toBe(true);
      });

      it('should require city', () => {
        const req = createValidRequest();
        delete (req.applicant.address as any).city;
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'applicant.address.city')).toBe(true);
      });

      it('should require country', () => {
        const req = createValidRequest();
        delete (req.applicant.address as any).country;
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'applicant.address.country')).toBe(true);
      });

      it('should validate German postal code format', () => {
        const req = createValidRequest();
        req.applicant.address.zip = '1234'; // Too short
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'applicant.address.zip')).toBe(true);
      });

      it('should accept valid 5-digit German postal code', () => {
        const req = createValidRequest();
        req.applicant.address.zip = '10115';
        const result = validateTrademarkRequest(req);
        expect(result.valid).toBe(true);
      });

      it('should reject invalid country code format', () => {
        const req = createValidRequest();
        req.applicant.address.country = 'DEU'; // Too long
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'applicant.address.country')).toBe(true);
      });

      it('should reject lowercase country code', () => {
        const req = createValidRequest();
        req.applicant.address.country = 'de';
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'applicant.address.country')).toBe(true);
      });

      it('should accept Austrian postal codes without German validation', () => {
        const req = createValidRequest();
        req.applicant.address.country = 'AT';
        req.applicant.address.zip = '1010'; // Vienna, 4 digits
        const result = validateTrademarkRequest(req);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Email Validation', () => {
    it('should accept valid email', () => {
      const req = createValidRequest();
      req.email = 'test@example.com';
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should reject missing email', () => {
      const req = createValidRequest();
      delete (req as any).email;
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('should reject invalid email format', () => {
      const req = createValidRequest();
      req.email = 'not-an-email';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('should reject email without @', () => {
      const req = createValidRequest();
      req.email = 'testexample.com';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('should reject email without domain', () => {
      const req = createValidRequest();
      req.email = 'test@';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('should accept complex valid email', () => {
      const req = createValidRequest();
      req.email = 'user.name+tag@sub.domain.co.uk';
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });
  });

  describe('Trademark Validation', () => {
    describe('Word Mark', () => {
      it('should accept valid word mark', () => {
        const req = createValidRequest();
        const result = validateTrademarkRequest(req);
        expect(result.valid).toBe(true);
      });

      it('should require text for word mark', () => {
        const req = createValidRequest();
        delete (req.trademark as any).text;
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'trademark.text')).toBe(true);
      });

      it('should reject empty text for word mark', () => {
        const req = createValidRequest();
        (req.trademark as any).text = '';
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'trademark.text')).toBe(true);
      });

      it('should reject text longer than 500 characters', () => {
        const req = createValidRequest();
        (req.trademark as any).text = 'a'.repeat(501);
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'trademark.text')).toBe(true);
      });

      it('should accept text with exactly 500 characters', () => {
        const req = createValidRequest();
        (req.trademark as any).text = 'a'.repeat(500);
        const result = validateTrademarkRequest(req);
        expect(result.valid).toBe(true);
      });
    });

    describe('Image Mark', () => {
      it('should require imageData for figurative mark', () => {
        const req = createValidRequest();
        req.trademark = {
          type: TrademarkType.FIGURATIVE,
        } as any;
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'trademark.imageData')).toBe(true);
      });

      it('should accept figurative mark with imageData', () => {
        const req = createValidRequest();
        req.trademark = {
          type: TrademarkType.FIGURATIVE,
          imageData: Buffer.from('test-image'),
          imageMimeType: 'image/jpeg',
          imageFileName: 'test.jpg',
        };
        const result = validateTrademarkRequest(req);
        expect(result.valid).toBe(true);
      });
    });

    describe('Combined Mark', () => {
      it('should require imageData for combined mark', () => {
        const req = createValidRequest();
        req.trademark = {
          type: TrademarkType.COMBINED,
        } as any;
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'trademark.imageData')).toBe(true);
      });
    });

    describe('Invalid Trademark Type', () => {
      it('should reject invalid trademark type', () => {
        const req = createValidRequest();
        (req.trademark as any).type = 'invalid-type';
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'trademark.type')).toBe(true);
      });
    });
  });

  describe('Nice Classes Validation', () => {
    it('should accept valid Nice class', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 9 }];
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept multiple Nice classes', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 9 }, { classNumber: 35 }, { classNumber: 42 }];
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should reject empty Nice classes array', () => {
      const req = createValidRequest();
      req.niceClasses = [];
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'niceClasses')).toBe(true);
    });

    it('should reject class number 0', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 0 }];
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field.includes('classNumber'))).toBe(true);
    });

    it('should reject class number 46', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 46 }];
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field.includes('classNumber'))).toBe(true);
    });

    it('should reject negative class number', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: -1 }];
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field.includes('classNumber'))).toBe(true);
    });

    it('should accept class number 1 (boundary)', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 1 }];
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept class number 45 (boundary)', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 45 }];
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should reject duplicate Nice classes', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 9 }, { classNumber: 9 }];
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.message.includes('Duplicate'))).toBe(true);
    });

    it('should reject lead class not in selected classes', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 9 }];
      req.leadClass = 35;
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'leadClass')).toBe(true);
    });

    it('should accept valid lead class', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 9 }, { classNumber: 35 }];
      req.leadClass = 35;
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });
  });

  describe('Payment Validation', () => {
    it('should accept bank transfer payment', () => {
      const req = createValidRequest();
      req.paymentMethod = PaymentMethod.BANK_TRANSFER;
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should reject missing payment method', () => {
      const req = createValidRequest();
      delete (req as any).paymentMethod;
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'paymentMethod')).toBe(true);
    });

    it('should reject invalid payment method', () => {
      const req = createValidRequest();
      (req as any).paymentMethod = 'CREDIT_CARD';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'paymentMethod')).toBe(true);
    });

    describe('SEPA Validation', () => {
      it('should require SEPA details for SEPA payment', () => {
        const req = createValidRequest();
        req.paymentMethod = PaymentMethod.SEPA_DIRECT_DEBIT;
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'sepaDetails')).toBe(true);
      });

      it('should require mandate reference number', () => {
        const req = createValidRequest();
        req.paymentMethod = PaymentMethod.SEPA_DIRECT_DEBIT;
        req.sepaDetails = {
          mandateType: SepaMandateType.PERMANENT,
          copyFromApplicant: true,
        } as any;
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'sepaDetails.mandateReferenceNumber')).toBe(true);
      });

      it('should require mandate type', () => {
        const req = createValidRequest();
        req.paymentMethod = PaymentMethod.SEPA_DIRECT_DEBIT;
        req.sepaDetails = {
          mandateReferenceNumber: 'REF123',
          copyFromApplicant: true,
        } as any;
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'sepaDetails.mandateType')).toBe(true);
      });

      it('should require contact when not copying from applicant', () => {
        const req = createValidRequest();
        req.paymentMethod = PaymentMethod.SEPA_DIRECT_DEBIT;
        req.sepaDetails = {
          mandateReferenceNumber: 'REF123',
          mandateType: SepaMandateType.PERMANENT,
          copyFromApplicant: false,
        };
        const result = validateTrademarkRequest(req);
        expect(result.errors.some(e => e.field === 'sepaDetails.contact')).toBe(true);
      });

      it('should accept valid SEPA with copyFromApplicant', () => {
        const req = createValidRequest();
        req.paymentMethod = PaymentMethod.SEPA_DIRECT_DEBIT;
        req.sepaDetails = {
          mandateReferenceNumber: 'REF123',
          mandateType: SepaMandateType.PERMANENT,
          copyFromApplicant: true,
        };
        const result = validateTrademarkRequest(req);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Sender Name Validation', () => {
    it('should require sender name', () => {
      const req = createValidRequest();
      delete (req as any).senderName;
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'senderName')).toBe(true);
    });

    it('should reject empty sender name', () => {
      const req = createValidRequest();
      req.senderName = '  ';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'senderName')).toBe(true);
    });
  });

  describe('Sanctions Validation', () => {
    it('should require sanctions declaration for natural persons', () => {
      const req = createValidRequest();
      delete (req as any).sanctions;
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'sanctions')).toBe(true);
    });

    it('should NOT require sanctions declaration for legal entities', () => {
      const req = createValidRequest();
      req.applicant = {
        type: ApplicantType.LEGAL,
        companyName: 'Test GmbH',
        legalForm: 'GmbH',
        address: {
          street: 'Industriestr. 1',
          zip: '10115',
          city: 'Berlin',
          country: 'DE',
        },
      };
      delete (req as any).sanctions;
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
      expect(result.errors.some(e => e.field === 'sanctions')).toBe(false);
    });

    it('should require hasRussianNationality to be boolean for natural persons', () => {
      const req = createValidRequest();
      (req.sanctions as any).hasRussianNationality = 'no';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'sanctions.hasRussianNationality')).toBe(true);
    });

    it('should require hasRussianResidence to be boolean for natural persons', () => {
      const req = createValidRequest();
      (req.sanctions as any).hasRussianResidence = 'no';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'sanctions.hasRussianResidence')).toBe(true);
    });
  });

  describe('Multiple Error Handling', () => {
    it('should collect all errors from an invalid request', () => {
      const result = validateTrademarkRequest({
        // Missing almost everything
        applicant: {
          type: 'invalid',
        },
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });
  });

  // ===========================================================================
  // Additional Edge Cases and Comprehensive Tests
  // ===========================================================================

  describe('3D Trademark Validation', () => {
    it('should accept valid 3D mark with imageData', () => {
      const req = createValidRequest();
      req.trademark = {
        type: TrademarkType.THREE_DIMENSIONAL,
        imageData: Buffer.from('3d-model-data'),
        imageMimeType: 'image/jpeg',
        imageFileName: '3d-mark.jpg',
      };
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept 3D mark type (validation does not require imageData)', () => {
      // Note: Current validation does not require imageData for 3D marks
      // (unlike figurative and combined marks). This may be intentional as
      // 3D marks might have different requirements in the DPMA form.
      const req = createValidRequest();
      req.trademark = {
        type: TrademarkType.THREE_DIMENSIONAL,
      };
      const result = validateTrademarkRequest(req);
      // Currently validation passes - DPMA form handles 3D mark requirements
      expect(result.valid).toBe(true);
    });
  });

  describe('Nice Classes with Terms', () => {
    it('should accept Nice class with specific terms', () => {
      const req = createValidRequest();
      req.niceClasses = [{
        classNumber: 9,
        terms: ['Anwendungssoftware', 'Spielsoftware'],
      }];
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept Nice class with selectClassHeader', () => {
      const req = createValidRequest();
      req.niceClasses = [{
        classNumber: 9,
        selectClassHeader: true,
      }];
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept multiple classes with mixed selection modes', () => {
      const req = createValidRequest();
      req.niceClasses = [
        { classNumber: 9, selectClassHeader: true },
        { classNumber: 35, terms: ['Werbung, Marketing und Verkaufsförderung'] },
        { classNumber: 42 },
      ];
      req.leadClass = 9;
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should reject non-array niceClasses', () => {
      const req = createValidRequest();
      req.niceClasses = { classNumber: 9 } as any;
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'niceClasses')).toBe(true);
    });

    it('should reject non-integer class number', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 9.5 }];
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field.includes('classNumber'))).toBe(true);
    });

    it('should accept all 45 Nice classes', () => {
      const req = createValidRequest();
      req.niceClasses = Array.from({ length: 45 }, (_, i) => ({ classNumber: i + 1 }));
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });
  });

  describe('Applicant Edge Cases', () => {
    it('should accept natural person with optional salutation', () => {
      const req = createValidRequest();
      req.applicant.salutation = 'Dr.';
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept natural person without salutation', () => {
      const req = createValidRequest();
      delete req.applicant.salutation;
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept legal entity without legalForm', () => {
      const req = createValidRequest();
      req.applicant = {
        type: ApplicantType.LEGAL,
        companyName: 'Test Company',
        address: {
          street: 'Teststr. 1',
          zip: '10115',
          city: 'Berlin',
          country: 'DE',
        },
      };
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept address with optional addressLine1', () => {
      const req = createValidRequest();
      req.applicant.address.addressLine1 = 'Gebäude A';
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept address with optional addressLine2 for natural persons', () => {
      const req = createValidRequest();
      req.applicant.address.addressLine1 = 'Gebäude A';
      req.applicant.address.addressLine2 = '3. Stock';
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should reject empty company name (whitespace only)', () => {
      const req = createValidRequest();
      req.applicant = {
        type: ApplicantType.LEGAL,
        companyName: '   ',
        address: {
          street: 'Teststr. 1',
          zip: '10115',
          city: 'Berlin',
          country: 'DE',
        },
      };
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'applicant.companyName')).toBe(true);
    });

    it('should reject empty lastName (whitespace only)', () => {
      const req = createValidRequest();
      req.applicant.lastName = '   ';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'applicant.lastName')).toBe(true);
    });
  });

  describe('Address Country Variations', () => {
    it('should accept Swiss postal codes', () => {
      const req = createValidRequest();
      req.applicant.address.country = 'CH';
      req.applicant.address.zip = '8001'; // Zürich
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept French postal codes', () => {
      const req = createValidRequest();
      req.applicant.address.country = 'FR';
      req.applicant.address.zip = '75001'; // Paris
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept US postal codes', () => {
      const req = createValidRequest();
      req.applicant.address.country = 'US';
      req.applicant.address.zip = '10001'; // New York
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should reject single-letter country code', () => {
      const req = createValidRequest();
      req.applicant.address.country = 'D';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'applicant.address.country')).toBe(true);
    });

    it('should reject numeric country code', () => {
      const req = createValidRequest();
      req.applicant.address.country = '49';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'applicant.address.country')).toBe(true);
    });

    it('should reject German zip with letters', () => {
      const req = createValidRequest();
      req.applicant.address.zip = '8033A';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'applicant.address.zip')).toBe(true);
    });

    it('should reject German zip with 6 digits', () => {
      const req = createValidRequest();
      req.applicant.address.zip = '803310';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'applicant.address.zip')).toBe(true);
    });
  });

  describe('Trademark Optional Fields', () => {
    it('should accept word mark with colorElements', () => {
      const req = createValidRequest();
      req.trademark.colorElements = ['rot', 'blau', 'weiß'];
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept word mark with hasNonLatinCharacters flag', () => {
      const req = createValidRequest();
      req.trademark.hasNonLatinCharacters = true;
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept word mark with description', () => {
      const req = createValidRequest();
      req.trademark.description = 'Eine Beschreibung der Marke';
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept figurative mark with all optional fields', () => {
      const req = createValidRequest();
      req.trademark = {
        type: TrademarkType.FIGURATIVE,
        imageData: Buffer.from('image-data'),
        imageMimeType: 'image/png',
        imageFileName: 'logo.png',
        colorElements: ['schwarz', 'gold'],
        hasNonLatinCharacters: false,
        description: 'Ein stilisiertes Logo',
      };
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });
  });

  describe('Email Edge Cases', () => {
    it('should accept email with numbers', () => {
      const req = createValidRequest();
      req.email = 'user123@example123.com';
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept email with dash in domain', () => {
      const req = createValidRequest();
      req.email = 'user@my-company.com';
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept email with underscore in local part', () => {
      const req = createValidRequest();
      req.email = 'user_name@example.com';
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should reject email with spaces', () => {
      const req = createValidRequest();
      req.email = 'user name@example.com';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
    });

    it('should reject email with multiple @', () => {
      const req = createValidRequest();
      req.email = 'user@@example.com';
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'email')).toBe(true);
    });
  });

  describe('SEPA Mandate Types', () => {
    it('should accept SEPA with single mandate type', () => {
      const req = createValidRequest();
      req.paymentMethod = PaymentMethod.SEPA_DIRECT_DEBIT;
      req.sepaDetails = {
        mandateReferenceNumber: 'A9530-12345',
        mandateType: SepaMandateType.SINGLE,
        copyFromApplicant: true,
      };
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should accept SEPA with permanent mandate type', () => {
      const req = createValidRequest();
      req.paymentMethod = PaymentMethod.SEPA_DIRECT_DEBIT;
      req.sepaDetails = {
        mandateReferenceNumber: 'A9530-67890',
        mandateType: SepaMandateType.PERMANENT,
        copyFromApplicant: true,
      };
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should reject SEPA with empty mandate reference', () => {
      const req = createValidRequest();
      req.paymentMethod = PaymentMethod.SEPA_DIRECT_DEBIT;
      req.sepaDetails = {
        mandateReferenceNumber: '   ',
        mandateType: SepaMandateType.PERMANENT,
        copyFromApplicant: true,
      };
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'sepaDetails.mandateReferenceNumber')).toBe(true);
    });
  });

  describe('Lead Class Validation', () => {
    it('should accept undefined lead class (defaults to first)', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 9 }, { classNumber: 35 }];
      delete req.leadClass;
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
    });

    it('should reject lead class 0', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 9 }];
      req.leadClass = 0;
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'leadClass')).toBe(true);
    });

    it('should reject lead class 46', () => {
      const req = createValidRequest();
      req.niceClasses = [{ classNumber: 9 }];
      req.leadClass = 46;
      const result = validateTrademarkRequest(req);
      expect(result.errors.some(e => e.field === 'leadClass')).toBe(true);
    });
  });

  describe('Complete Request Scenarios', () => {
    it('should accept complete natural person request with all optional fields', () => {
      const req = {
        applicant: {
          type: ApplicantType.NATURAL,
          salutation: 'Dr.',
          firstName: 'Max',
          lastName: 'Mustermann',
          nameSuffix: 'Jr.',
          address: {
            street: 'Musterstraße 123',
            addressLine1: 'Gebäude A',
            addressLine2: '3. Stock',
            zip: '80331',
            city: 'München',
            country: 'DE',
          },
        },
        sanctions: {
          hasRussianNationality: false,
          hasRussianResidence: false,
        },
        email: 'max.mustermann@example.com',
        trademark: {
          type: TrademarkType.WORD,
          text: 'TestBrand2024',
          colorElements: ['blau', 'weiß'],
          hasNonLatinCharacters: false,
          description: 'Ein modernes Markenzeichen',
        },
        niceClasses: [
          { classNumber: 9, terms: ['Anwendungssoftware', 'Spielsoftware'] },
          { classNumber: 42, selectClassHeader: true },
        ],
        leadClass: 9,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        senderName: 'Dr. Max Mustermann Jr.',
        internalReference: 'INT-2024-001',
      };
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept complete legal entity request', () => {
      const req = {
        applicant: {
          type: ApplicantType.LEGAL,
          companyName: 'Innovative Tech GmbH',
          legalForm: 'GmbH',
          address: {
            street: 'Innovationsweg 42',
            addressLine1: 'Technologiepark',
            zip: '10115',
            city: 'Berlin',
            country: 'DE',
          },
        },
        email: 'trademark@innovative-tech.de',
        trademark: {
          type: TrademarkType.FIGURATIVE,
          imageData: Buffer.from('fake-image-data'),
          imageMimeType: 'image/jpeg',
          imageFileName: 'company-logo.jpg',
        },
        niceClasses: [
          { classNumber: 9 },
          { classNumber: 35 },
          { classNumber: 42 },
        ],
        leadClass: 42,
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        senderName: 'Innovative Tech GmbH - Geschäftsführung',
      };
      const result = validateTrademarkRequest(req);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Validation Error Messages', () => {
    it('should provide meaningful error message for missing applicant', () => {
      const result = validateTrademarkRequest({
        email: 'test@test.com',
        trademark: { type: TrademarkType.WORD, text: 'Test' },
        niceClasses: [{ classNumber: 9 }],
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        senderName: 'Test',
      });
      const applicantError = result.errors.find(e => e.field === 'applicant');
      expect(applicantError).toBeDefined();
      expect(applicantError?.message).toContain('required');
    });

    it('should provide meaningful error message for invalid applicant type', () => {
      const result = validateTrademarkRequest({
        applicant: { type: 'corporate' as any },
        email: 'test@test.com',
        trademark: { type: TrademarkType.WORD, text: 'Test' },
        niceClasses: [{ classNumber: 9 }],
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        senderName: 'Test',
      });
      const typeError = result.errors.find(e => e.field === 'applicant.type');
      expect(typeError).toBeDefined();
      expect(typeError?.message).toContain('natural');
      expect(typeError?.message).toContain('legal');
    });
  });
});
