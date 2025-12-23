/**
 * Tests for LegalFormMapper utility
 */

import { mapLegalForm, LEGAL_FORM_MAP } from '../src/client/utils/LegalFormMapper';

describe('mapLegalForm', () => {
  describe('Common Legal Forms', () => {
    it('should map GmbH correctly', () => {
      expect(mapLegalForm('GmbH')).toBe('Gesellschaft mit beschränkter Haftung (GmbH)');
    });

    it('should map AG correctly', () => {
      expect(mapLegalForm('AG')).toBe('Aktiengesellschaft (AG)');
    });

    it('should map UG correctly', () => {
      expect(mapLegalForm('UG')).toBe('Unternehmergesellschaft, haftungsbeschränkt (UG)');
    });

    it('should map KG correctly', () => {
      expect(mapLegalForm('KG')).toBe('Kommanditgesellschaft (KG)');
    });

    it('should map both OHG and oHG', () => {
      expect(mapLegalForm('OHG')).toBe('Offene Handelsgesellschaft (oHG)');
      expect(mapLegalForm('oHG')).toBe('Offene Handelsgesellschaft (oHG)');
    });

    it('should map GbR correctly', () => {
      expect(mapLegalForm('GbR')).toBe('Gesellschaft bürgerlichen Rechts (GbR)');
    });

    it('should map eGbR correctly', () => {
      expect(mapLegalForm('eGbR')).toBe('eingetragene Gesellschaft bürgerlichen Rechts (eGbR)');
    });

    it('should map eG correctly', () => {
      expect(mapLegalForm('eG')).toBe('eingetragene Genossenschaft (eG)');
    });
  });

  describe('Vereins und Stiftungen', () => {
    it('should map eV correctly', () => {
      expect(mapLegalForm('eV')).toBe('eingetragener Verein (eV)');
    });

    it('should map e.V. correctly', () => {
      expect(mapLegalForm('e.V.')).toBe('eingetragener Verein (eV)');
    });

    it('should map Stiftung correctly', () => {
      expect(mapLegalForm('Stiftung')).toBe('Stiftung bürgerlichen Rechts');
    });
  });

  describe('European Forms', () => {
    it('should map SE correctly', () => {
      expect(mapLegalForm('SE')).toBe('europäische Gesellschaft (SE)');
    });
  });

  describe('Special Forms', () => {
    it('should map KGaA correctly', () => {
      expect(mapLegalForm('KGaA')).toBe('Kommanditgesellschaft auf Aktien (KGaA)');
    });

    it('should map PartG correctly', () => {
      expect(mapLegalForm('PartG')).toBe('Partnerschaftsgesellschaft (PartG)');
    });

    it('should map PartGmbB correctly', () => {
      expect(mapLegalForm('PartGmbB')).toBe('Partnerschaftsgesellschaft mit beschränkter Berufshaftung (PartGmbB)');
    });
  });

  describe('Unknown Forms', () => {
    it('should return input unchanged for unknown abbreviation', () => {
      expect(mapLegalForm('LLC')).toBe('LLC');
      expect(mapLegalForm('Inc.')).toBe('Inc.');
      expect(mapLegalForm('Ltd.')).toBe('Ltd.');
    });

    it('should return empty string for empty input', () => {
      expect(mapLegalForm('')).toBe('');
    });

    it('should handle full form as input', () => {
      const fullForm = 'Gesellschaft mit beschränkter Haftung (GmbH)';
      // If already full form, return as-is (not in map)
      expect(mapLegalForm(fullForm)).toBe(fullForm);
    });
  });

  describe('Case Sensitivity', () => {
    it('should be case-sensitive', () => {
      expect(mapLegalForm('gmbh')).toBe('gmbh'); // Not found, returned as-is
      expect(mapLegalForm('GMBH')).toBe('GMBH'); // Not found, returned as-is
      expect(mapLegalForm('GmbH')).toBe('Gesellschaft mit beschränkter Haftung (GmbH)');
    });
  });
});

describe('LEGAL_FORM_MAP', () => {
  it('should contain all common German legal forms', () => {
    const expectedForms = [
      'GmbH', 'AG', 'UG', 'KG', 'OHG', 'oHG', 'GbR', 'eGbR',
      'eG', 'eV', 'e.V.', 'SE', 'KGaA', 'PartG', 'PartGmbB', 'Stiftung'
    ];

    for (const form of expectedForms) {
      expect(form in LEGAL_FORM_MAP).toBe(true);
    }
  });

  it('should have 16 entries', () => {
    expect(Object.keys(LEGAL_FORM_MAP).length).toBe(16);
  });

  it('should have non-empty values', () => {
    for (const [key, value] of Object.entries(LEGAL_FORM_MAP)) {
      expect(value.length).toBeGreaterThan(0);
      expect(value.length).toBeGreaterThan(key.length); // Value is longer than abbreviation
    }
  });
});
