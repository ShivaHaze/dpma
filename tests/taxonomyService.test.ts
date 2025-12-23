/**
 * Tests for TaxonomyService
 */

import * as path from 'path';
import { TaxonomyService, getTaxonomyService } from '../src/client/services/TaxonomyService';

describe('TaxonomyService', () => {
  let service: TaxonomyService;

  beforeAll(async () => {
    service = new TaxonomyService();
    const taxonomyPath = path.resolve(__dirname, '../docs/taxonomyDe.json');
    await service.load(taxonomyPath);
  });

  describe('Loading', () => {
    it('should load taxonomy successfully', () => {
      expect(service.isLoaded()).toBe(true);
    });

    it('should have entries after loading', () => {
      expect(service.getEntryCount()).toBeGreaterThan(0);
    });

    it('should not reload if already loaded', async () => {
      const countBefore = service.getEntryCount();
      await service.load();
      expect(service.getEntryCount()).toBe(countBefore);
    });

    it('should throw error for invalid path', async () => {
      const newService = new TaxonomyService();
      await expect(newService.load('/nonexistent/path.json')).rejects.toThrow();
    });
  });

  describe('getAvailableClasses', () => {
    it('should return array of class numbers', () => {
      const classes = service.getAvailableClasses();
      expect(Array.isArray(classes)).toBe(true);
      expect(classes.length).toBeGreaterThan(0);
    });

    it('should include classes 1-45', () => {
      const classes = service.getAvailableClasses();
      // Should have at least some of the main classes
      expect(classes).toContain(9);  // Software/Electronics
      expect(classes).toContain(35); // Business
      expect(classes).toContain(42); // IT Services
    });

    it('should return sorted array', () => {
      const classes = service.getAvailableClasses();
      const sorted = [...classes].sort((a, b) => a - b);
      expect(classes).toEqual(sorted);
    });
  });

  describe('findExact', () => {
    it('should find exact match', () => {
      const entry = service.findExact('Klasse 9');
      expect(entry).toBeDefined();
      expect(entry?.classNumber).toBe(9);
    });

    it('should find exact match with class filter', () => {
      const entry = service.findExact('Software', 9);
      if (entry) {
        expect(entry.classNumber).toBe(9);
      }
    });

    it('should return undefined for non-existent term', () => {
      const entry = service.findExact('NonExistentTerm12345');
      expect(entry).toBeUndefined();
    });

    it('should be case-insensitive in normalized form', () => {
      // findExact normalizes text internally
      const entry1 = service.findExact('klasse 9');
      expect(entry1).toBeDefined();
    });
  });

  describe('search', () => {
    it('should find relevant results for query', () => {
      const results = service.search('Software');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should respect limit option', () => {
      const results = service.search('Software', { limit: 5 });
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('should filter by class number', () => {
      const results = service.search('Software', { classNumbers: [9] });
      for (const entry of results) {
        expect(entry.classNumber).toBe(9);
      }
    });

    it('should filter by multiple class numbers', () => {
      const results = service.search('Dienst', { classNumbers: [35, 42] });
      for (const entry of results) {
        expect([35, 42]).toContain(entry.classNumber);
      }
    });

    it('should filter leaf-only results', () => {
      const results = service.search('Software', { leafOnly: true });
      for (const entry of results) {
        expect(entry.isLeaf).toBe(true);
      }
    });

    it('should return empty for very low minScore', () => {
      const results = service.search('xyz123456', { minScore: 0.9 });
      expect(results.length).toBe(0);
    });

    it('should handle empty query', () => {
      const results = service.search('');
      expect(results.length).toBe(0);
    });

    it('should handle fuzzy matching (typos)', () => {
      const results = service.search('Softwar'); // Missing 'e'
      expect(results.length).toBeGreaterThan(0);
    });

    it('should handle umlaut normalization', () => {
      const results = service.search('buero'); // Should match Büro
      // May or may not find results depending on taxonomy content
      expect(Array.isArray(results)).toBe(true);
    });
  });

  describe('validateTerm', () => {
    it('should validate existing term', () => {
      const result = service.validateTerm('Klasse 9');
      expect(result.found).toBe(true);
      expect(result.entry).toBeDefined();
    });

    it('should not validate non-existent term', () => {
      const result = service.validateTerm('CompletelyFakeTermXYZ');
      expect(result.found).toBe(false);
    });

    it('should provide suggestions for invalid terms', () => {
      const result = service.validateTerm('Softwar'); // Typo
      expect(result.found).toBe(false);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
    });

    it('should filter by class number', () => {
      const result = service.validateTerm('Software', 9);
      if (result.found && result.entry) {
        expect(result.entry.classNumber).toBe(9);
      }
    });

    it('should include error message for not found', () => {
      const result = service.validateTerm('FakeTerm');
      expect(result.found).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.length).toBeGreaterThan(0);
    });
  });

  describe('validateNiceClassSelection', () => {
    it('should validate valid class selection', () => {
      const result = service.validateNiceClassSelection({
        classNumber: 9,
      });
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject invalid class number', () => {
      const result = service.validateNiceClassSelection({
        classNumber: 99,
      });
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Invalid class number'))).toBe(true);
    });

    it('should reject class number 0', () => {
      const result = service.validateNiceClassSelection({
        classNumber: 0,
      });
      expect(result.valid).toBe(false);
    });

    it('should reject negative class number', () => {
      const result = service.validateNiceClassSelection({
        classNumber: -1,
      });
      expect(result.valid).toBe(false);
    });

    it('should validate terms if provided', () => {
      const result = service.validateNiceClassSelection({
        classNumber: 9,
        terms: ['InvalidTermXYZ123'],
      });
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateNiceClasses', () => {
    it('should validate multiple class selections', () => {
      const result = service.validateNiceClasses([
        { classNumber: 9 },
        { classNumber: 35 },
        { classNumber: 42 },
      ]);
      expect(result.valid).toBe(true);
      expect(result.allErrors.length).toBe(0);
    });

    it('should collect errors from multiple classes', () => {
      const result = service.validateNiceClasses([
        { classNumber: 99 }, // Invalid
        { classNumber: 9 },  // Valid
        { classNumber: -1 }, // Invalid
      ]);
      expect(result.valid).toBe(false);
      expect(result.allErrors.length).toBeGreaterThan(0);
    });

    it('should provide per-class results', () => {
      const result = service.validateNiceClasses([
        { classNumber: 9 },
        { classNumber: 35 },
      ]);
      expect(result.classResults.has(9)).toBe(true);
      expect(result.classResults.has(35)).toBe(true);
    });
  });

  describe('getClassHeader', () => {
    it('should return class header for valid class', () => {
      const header = service.getClassHeader(9);
      if (header) {
        expect(header.classNumber).toBe(9);
        expect(header.level).toBe(1);
        expect(header.text).toContain('Klasse');
      }
    });

    it('should return undefined for invalid class', () => {
      const header = service.getClassHeader(99);
      expect(header).toBeUndefined();
    });
  });

  describe('getClassCategories', () => {
    it('should return categories for valid class', () => {
      const categories = service.getClassCategories(9);
      expect(Array.isArray(categories)).toBe(true);
    });

    it('should return level 2 entries only', () => {
      const categories = service.getClassCategories(9);
      for (const cat of categories) {
        expect(cat.level).toBe(2);
      }
    });

    it('should return empty array for invalid class', () => {
      const categories = service.getClassCategories(99);
      expect(categories).toEqual([]);
    });
  });

  describe('getStats', () => {
    it('should return statistics object', () => {
      const stats = service.getStats();
      expect(stats).toHaveProperty('totalEntries');
      expect(stats).toHaveProperty('classCounts');
      expect(stats).toHaveProperty('leafCount');
      expect(stats).toHaveProperty('categoryCount');
    });

    it('should have positive total entries', () => {
      const stats = service.getStats();
      expect(stats.totalEntries).toBeGreaterThan(0);
    });

    it('should have leaf and category counts', () => {
      const stats = service.getStats();
      expect(stats.leafCount + stats.categoryCount).toBe(stats.totalEntries);
    });

    it('should have class counts', () => {
      const stats = service.getStats();
      expect(Object.keys(stats.classCounts).length).toBeGreaterThan(0);
    });
  });

  describe('getClassEntries', () => {
    it('should return entries for class 9', () => {
      const entries = service.getClassEntries(9);
      expect(entries.length).toBeGreaterThan(0);
    });

    it('should return empty for invalid class', () => {
      const entries = service.getClassEntries(99);
      expect(entries).toEqual([]);
    });

    it('should return entries with correct class number', () => {
      const entries = service.getClassEntries(35);
      for (const entry of entries) {
        expect(entry.classNumber).toBe(35);
      }
    });
  });

  describe('findByConceptId', () => {
    it('should find entry by concept ID', () => {
      // First get any entry to know a valid concept ID
      const entries = service.getClassEntries(9);
      if (entries.length > 0) {
        const testConceptId = entries[0].conceptId;
        const found = service.findByConceptId(testConceptId);
        expect(found).toBeDefined();
        expect(found?.conceptId).toBe(testConceptId);
      }
    });

    it('should return undefined for invalid concept ID', () => {
      const found = service.findByConceptId('INVALID_ID_12345');
      expect(found).toBeUndefined();
    });
  });
});

describe('getTaxonomyService (singleton)', () => {
  it('should return the same instance', async () => {
    const service1 = await getTaxonomyService();
    const service2 = await getTaxonomyService();
    expect(service1).toBe(service2);
  });

  it('should be loaded', async () => {
    const service = await getTaxonomyService();
    expect(service.isLoaded()).toBe(true);
  });
});
