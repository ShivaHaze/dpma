/**
 * Tests for CountryMapper utility
 */

import { getCountryDisplayName, COUNTRY_MAP } from '../src/client/utils/CountryMapper';

describe('getCountryDisplayName', () => {
  describe('Common Countries', () => {
    it('should map DE to Deutschland', () => {
      expect(getCountryDisplayName('DE')).toBe('Deutschland');
    });

    it('should map AT to Österreich', () => {
      expect(getCountryDisplayName('AT')).toBe('Österreich');
    });

    it('should map CH to Schweiz', () => {
      expect(getCountryDisplayName('CH')).toBe('Schweiz');
    });

    it('should map FR to Frankreich', () => {
      expect(getCountryDisplayName('FR')).toBe('Frankreich');
    });

    it('should map IT to Italien', () => {
      expect(getCountryDisplayName('IT')).toBe('Italien');
    });

    it('should map ES to Spanien', () => {
      expect(getCountryDisplayName('ES')).toBe('Spanien');
    });

    it('should map NL to Niederlande', () => {
      expect(getCountryDisplayName('NL')).toBe('Niederlande');
    });

    it('should map BE to Belgien', () => {
      expect(getCountryDisplayName('BE')).toBe('Belgien');
    });

    it('should map PL to Polen', () => {
      expect(getCountryDisplayName('PL')).toBe('Polen');
    });

    it('should map GB to Großbritannien', () => {
      expect(getCountryDisplayName('GB')).toBe('Großbritannien');
    });

    it('should map US to Vereinigte Staaten von Amerika', () => {
      expect(getCountryDisplayName('US')).toBe('Vereinigte Staaten von Amerika');
    });
  });

  describe('Unknown Countries', () => {
    it('should return input unchanged for unknown country code', () => {
      expect(getCountryDisplayName('JP')).toBe('JP');
      expect(getCountryDisplayName('CN')).toBe('CN');
      expect(getCountryDisplayName('AU')).toBe('AU');
    });

    it('should return empty string for empty input', () => {
      expect(getCountryDisplayName('')).toBe('');
    });

    it('should return lowercase input unchanged', () => {
      expect(getCountryDisplayName('de')).toBe('de');
      expect(getCountryDisplayName('at')).toBe('at');
    });

    it('should return mixed case input unchanged', () => {
      expect(getCountryDisplayName('De')).toBe('De');
      expect(getCountryDisplayName('At')).toBe('At');
    });

    it('should return invalid codes unchanged', () => {
      expect(getCountryDisplayName('DEU')).toBe('DEU');
      expect(getCountryDisplayName('GERMANY')).toBe('GERMANY');
      expect(getCountryDisplayName('1')).toBe('1');
    });
  });

  describe('Case Sensitivity', () => {
    it('should be case-sensitive (only uppercase works)', () => {
      expect(getCountryDisplayName('DE')).toBe('Deutschland');
      expect(getCountryDisplayName('de')).toBe('de');
      expect(getCountryDisplayName('De')).toBe('De');
      expect(getCountryDisplayName('dE')).toBe('dE');
    });
  });
});

describe('COUNTRY_MAP', () => {
  it('should contain all documented countries', () => {
    const expectedCountries = ['DE', 'AT', 'CH', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'GB', 'US'];

    for (const country of expectedCountries) {
      expect(country in COUNTRY_MAP).toBe(true);
    }
  });

  it('should have 11 entries', () => {
    expect(Object.keys(COUNTRY_MAP).length).toBe(11);
  });

  it('should have non-empty German names as values', () => {
    for (const [code, name] of Object.entries(COUNTRY_MAP)) {
      expect(name.length).toBeGreaterThan(0);
      expect(code.length).toBe(2); // ISO country codes are 2 chars
      expect(code).toBe(code.toUpperCase()); // Should be uppercase
    }
  });

  it('should have unique German names', () => {
    const names = Object.values(COUNTRY_MAP);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('should only contain uppercase country codes', () => {
    for (const code of Object.keys(COUNTRY_MAP)) {
      expect(code).toMatch(/^[A-Z]{2}$/);
    }
  });
});
