/**
 * Tests for LevenshteinDistance utility functions
 */

import {
  levenshteinDistance,
  levenshteinSimilarity,
  normalizeForComparison,
  findBestMatches,
  findClosestMatch,
} from '../src/client/utils/LevenshteinDistance';

describe('levenshteinDistance', () => {
  describe('Basic Operations', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('should return length for comparison with empty string', () => {
      expect(levenshteinDistance('hello', '')).toBe(5);
      expect(levenshteinDistance('', 'hello')).toBe(5);
    });

    it('should return 0 for two empty strings', () => {
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('should handle null/undefined inputs', () => {
      expect(levenshteinDistance(null as any, 'test')).toBe(4);
      expect(levenshteinDistance('test', undefined as any)).toBe(4);
    });
  });

  describe('Single Character Operations', () => {
    it('should count insertion correctly', () => {
      expect(levenshteinDistance('cat', 'cats')).toBe(1);
    });

    it('should count deletion correctly', () => {
      expect(levenshteinDistance('cats', 'cat')).toBe(1);
    });

    it('should count substitution correctly', () => {
      expect(levenshteinDistance('cat', 'bat')).toBe(1);
    });
  });

  describe('Transposition (Damerau extension)', () => {
    it('should handle adjacent character swaps', () => {
      // Note: The current implementation uses standard Levenshtein
      // 'ab' -> 'ba' requires 2 substitutions in standard Levenshtein
      // Damerau-Levenshtein would count this as 1 (transposition)
      const distance = levenshteinDistance('ab', 'ba');
      expect(distance).toBe(2); // Standard Levenshtein behavior
    });

    it('should handle transposition in longer strings', () => {
      // 'hello' -> 'hlelo' requires 2 operations (swap 'e' and 'l')
      const distance = levenshteinDistance('hello', 'hlelo');
      expect(distance).toBeGreaterThanOrEqual(1);
      expect(distance).toBeLessThanOrEqual(2);
    });
  });

  describe('Complex Cases', () => {
    it('should calculate distance for completely different strings', () => {
      expect(levenshteinDistance('abc', 'xyz')).toBe(3);
    });

    it('should handle case sensitivity', () => {
      expect(levenshteinDistance('Hello', 'hello')).toBe(1);
    });

    it('should handle common typos', () => {
      // Transposition: 'wa' -> 'aw' is 2 in standard Levenshtein
      expect(levenshteinDistance('Software', 'Softawre')).toBeLessThanOrEqual(2);
      // Missing letter
      expect(levenshteinDistance('Software', 'Softwar')).toBe(1);
      // Wrong letter
      expect(levenshteinDistance('Software', 'Softwere')).toBe(1);
    });
  });

  describe('Early Termination (maxDistance)', () => {
    it('should return maxDistance + 1 when exceeded', () => {
      const result = levenshteinDistance('abc', 'xyz', 2);
      expect(result).toBe(3); // Distance is 3, which is > 2
    });

    it('should return actual distance when within limit', () => {
      const result = levenshteinDistance('cat', 'bat', 5);
      expect(result).toBe(1);
    });

    it('should skip computation for large length differences', () => {
      const result = levenshteinDistance('a', 'abcdefghij', 2);
      expect(result).toBe(3); // Returns maxDistance + 1 due to length difference
    });
  });

  describe('Space Optimization', () => {
    it('should handle long strings efficiently', () => {
      const a = 'a'.repeat(100);
      const b = 'b'.repeat(100);
      // Should not throw or timeout
      const result = levenshteinDistance(a, b);
      expect(result).toBe(100);
    });
  });
});

describe('levenshteinSimilarity', () => {
  it('should return 1.0 for identical strings', () => {
    expect(levenshteinSimilarity('hello', 'hello')).toBe(1.0);
  });

  it('should return 0 for empty vs non-empty string', () => {
    expect(levenshteinSimilarity('', 'hello')).toBe(0);
    expect(levenshteinSimilarity('hello', '')).toBe(0);
  });

  it('should return value between 0 and 1', () => {
    const result = levenshteinSimilarity('cat', 'bat');
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('should return higher score for similar strings', () => {
    const similar = levenshteinSimilarity('Software', 'Softwar');
    const different = levenshteinSimilarity('Software', 'Hardware');
    expect(similar).toBeGreaterThan(different);
  });

  it('should handle case normalization', () => {
    const result = levenshteinSimilarity('HELLO', 'hello', { normalize: true });
    expect(result).toBe(1.0);
  });

  it('should respect minSimilarity threshold', () => {
    const result = levenshteinSimilarity('abc', 'xyz', { minSimilarity: 0.8 });
    expect(result).toBe(0); // Below threshold returns 0
  });
});

describe('normalizeForComparison', () => {
  it('should convert to lowercase', () => {
    expect(normalizeForComparison('HELLO')).toBe('hello');
  });

  it('should normalize German umlauts', () => {
    expect(normalizeForComparison('Büro')).toBe('buero');
    expect(normalizeForComparison('Größe')).toBe('groesse');
    expect(normalizeForComparison('Müller')).toBe('mueller');
    expect(normalizeForComparison('Straße')).toBe('strasse');
  });

  it('should remove punctuation', () => {
    expect(normalizeForComparison('hello, world!')).toBe('hello world');
  });

  it('should collapse whitespace', () => {
    expect(normalizeForComparison('hello   world')).toBe('hello world');
    expect(normalizeForComparison('  hello  ')).toBe('hello');
  });

  it('should preserve hyphens within words', () => {
    expect(normalizeForComparison('Wort-Bildmarke')).toBe('wort-bildmarke');
  });

  it('should handle empty strings', () => {
    expect(normalizeForComparison('')).toBe('');
    expect(normalizeForComparison('   ')).toBe('');
  });

  it('should handle complex German text', () => {
    const input = 'Künstliche Intelligenz-Software';
    const expected = 'kuenstliche intelligenz-software';
    expect(normalizeForComparison(input)).toBe(expected);
  });
});

describe('findBestMatches', () => {
  const candidates = [
    'Software',
    'Anwendungssoftware',
    'Spielsoftware',
    'Betriebssysteme',
    'Hardware',
    'Firmware',
  ];

  it('should find exact matches first', () => {
    const results = findBestMatches('Software', candidates);
    expect(results[0].text).toBe('Software');
    expect(results[0].score).toBe(1.0);
  });

  it('should find close matches', () => {
    const results = findBestMatches('Softwar', candidates);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].text).toBe('Software');
  });

  it('should respect limit parameter', () => {
    const results = findBestMatches('software', candidates, { limit: 2 });
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('should respect minSimilarity threshold', () => {
    const results = findBestMatches('xyz', candidates, { minSimilarity: 0.8 });
    expect(results.length).toBe(0);
  });

  it('should return results sorted by score', () => {
    const results = findBestMatches('software', candidates, { limit: 10 });
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
    }
  });

  it('should include original index in results', () => {
    const results = findBestMatches('Software', candidates);
    expect(results[0].index).toBe(0); // 'Software' is at index 0
  });

  it('should handle empty query', () => {
    const results = findBestMatches('', candidates);
    expect(results.length).toBe(0);
  });

  it('should handle empty candidates', () => {
    const results = findBestMatches('test', []);
    expect(results.length).toBe(0);
  });

  it('should boost substring matches', () => {
    const results = findBestMatches('Anwendung', candidates);
    // 'Anwendungssoftware' should rank highly because query is substring
    expect(results.some(r => r.text === 'Anwendungssoftware')).toBe(true);
  });
});

describe('findClosestMatch', () => {
  const candidates = [
    'Software',
    'Anwendungssoftware',
    'Spielsoftware',
    'Hardware',
  ];

  it('should find exact match', () => {
    const result = findClosestMatch('Software', candidates);
    expect(result).not.toBeNull();
    expect(result!.text).toBe('Software');
    expect(result!.score).toBe(1.0);
  });

  it('should find close match', () => {
    const result = findClosestMatch('Softwar', candidates);
    expect(result).not.toBeNull();
    expect(result!.text).toBe('Software');
  });

  it('should return null when no match above threshold', () => {
    const result = findClosestMatch('xyz123', candidates, 0.9);
    expect(result).toBeNull();
  });

  it('should respect threshold parameter', () => {
    const result = findClosestMatch('Hard', candidates, 0.8);
    // 'Hard' vs 'Hardware' might not meet 0.8 threshold
    // If null, threshold works; if found, verify score
    if (result) {
      expect(result.score).toBeGreaterThanOrEqual(0.8);
    }
  });

  it('should stop searching at very good match', () => {
    // With score >= 0.95, should stop searching
    const result = findClosestMatch('Software', candidates);
    expect(result).not.toBeNull();
    expect(result!.score).toBeGreaterThanOrEqual(0.95);
  });

  it('should handle empty candidates', () => {
    const result = findClosestMatch('test', []);
    expect(result).toBeNull();
  });

  it('should handle German umlaut variations', () => {
    const germanCandidates = ['Büro', 'Geschäft', 'Größe'];
    const result = findClosestMatch('Buero', germanCandidates);
    expect(result).not.toBeNull();
    expect(result!.text).toBe('Büro');
  });
});

describe('Integration Tests', () => {
  describe('DPMA Term Matching Scenarios', () => {
    const dpmaTerms = [
      'Anwendungssoftware',
      'Spielsoftware',
      'Betriebssysteme',
      'IT-Dienstleistungen',
      'Künstliche Intelligenz-Software und maschinelle Lernsoftware',
      'Entwicklung, Programmierung und Implementierung von Software',
    ];

    it('should match common typo: Softawre -> Software', () => {
      const results = findBestMatches('Anwendungssoftawre', dpmaTerms);
      expect(results[0].text).toBe('Anwendungssoftware');
    });

    it('should match with missing characters', () => {
      const results = findBestMatches('Spielsoftwar', dpmaTerms);
      expect(results[0].text).toBe('Spielsoftware');
    });

    it('should match with umlaut variations', () => {
      const results = findBestMatches('Kuenstliche Intelligenz', dpmaTerms);
      const hasKI = results.some(r => r.text.includes('Künstliche'));
      expect(hasKI).toBe(true);
    });

    it('should match partial terms', () => {
      const results = findBestMatches('Entwicklung Software', dpmaTerms);
      const hasDev = results.some(r => r.text.includes('Entwicklung'));
      expect(hasDev).toBe(true);
    });

    it('should handle hyphenated terms', () => {
      const results = findBestMatches('IT Dienstleistungen', dpmaTerms);
      expect(results[0].text).toBe('IT-Dienstleistungen');
    });
  });
});
