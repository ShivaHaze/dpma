/**
 * TaxonomyService - Nice classification taxonomy validation and lookup
 *
 * Provides pre-validation of Nice class terms against the official DPMA taxonomy
 * before submitting to the live form. This prevents invalid submissions and
 * enables helpful error messages with suggestions.
 *
 * Uses Damerau-Levenshtein distance for fuzzy matching, which handles:
 * - Typos (Softawre → Software)
 * - Missing letters (Softwar → Software)
 * - Transpositions (Softwrae → Software)
 * - German umlauts (Buero → Büro)
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  TaxonomyItem,
  TaxonomyEntry,
  TaxonomyValidationResult,
  TaxonomySearchOptions,
  NiceClassSelection,
} from '../../types/dpma';
import {
  levenshteinSimilarity,
  normalizeForComparison,
} from '../utils/LevenshteinDistance';

/**
 * Normalize text for search matching (simple version for indexing)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\säöüß]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate similarity score between query and target using Levenshtein
 * with additional boosting for substring matches
 */
function calculateSimilarity(query: string, target: string): number {
  const normalizedQuery = normalizeForComparison(query);
  const normalizedTarget = normalizeForComparison(target);

  // Exact match
  if (normalizedQuery === normalizedTarget) return 1.0;

  // Calculate Levenshtein similarity
  let score = levenshteinSimilarity(normalizedQuery, normalizedTarget, {
    minSimilarity: 0.2,
    normalize: false, // Already normalized
  });

  // Boost for substring matches (important for partial searches like "software")
  if (normalizedTarget.includes(normalizedQuery)) {
    // Query is contained in target - strong match
    const containmentBoost = 0.3 * (normalizedQuery.length / normalizedTarget.length);
    score = Math.min(1.0, score + containmentBoost);
  } else if (normalizedQuery.includes(normalizedTarget)) {
    // Target is contained in query - moderate boost
    score = Math.min(1.0, score + 0.1);
  }

  // Word-based boosting for multi-word queries
  const queryWords = normalizedQuery.split(' ').filter(w => w.length > 2);
  const targetWords = normalizedTarget.split(' ').filter(w => w.length > 2);

  if (queryWords.length > 0 && targetWords.length > 0) {
    let wordMatches = 0;
    for (const qw of queryWords) {
      for (const tw of targetWords) {
        // Check if words are similar (Levenshtein)
        const wordSim = levenshteinSimilarity(qw, tw, { minSimilarity: 0.7, normalize: false });
        if (wordSim >= 0.7) {
          wordMatches++;
          break;
        }
      }
    }
    // Boost based on word matches
    const wordBoost = 0.1 * (wordMatches / queryWords.length);
    score = Math.min(1.0, score + wordBoost);
  }

  return score;
}

export class TaxonomyService {
  private entries: TaxonomyEntry[] = [];
  private textIndex: Map<string, TaxonomyEntry[]> = new Map();
  private conceptIndex: Map<string, TaxonomyEntry> = new Map();
  private classIndex: Map<number, TaxonomyEntry[]> = new Map();
  private loaded: boolean = false;

  /**
   * Load taxonomy from the JSON file
   * Can be called with a custom path or uses the default src/data/taxonomyDe.json
   */
  async load(taxonomyPath?: string): Promise<void> {
    if (this.loaded) return;

    const filePath = taxonomyPath || path.resolve(__dirname, '../../data/taxonomyDe.json');

    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const root: TaxonomyItem = JSON.parse(data);
      this.buildIndex(root);
      this.loaded = true;
    } catch (error: any) {
      throw new Error(`Failed to load taxonomy: ${error.message}`);
    }
  }

  /**
   * Build search indices from the taxonomy tree
   */
  private buildIndex(root: TaxonomyItem): void {
    const traverse = (item: TaxonomyItem, currentPath: string[]): void => {
      // Skip the very top-level root nodes (Level 0 with generic names)
      if (item.Level === 0 && (item.Text === 'Begriffe' || item.Text.startsWith('Sämtliche'))) {
        if (item.Items) {
          for (const child of item.Items) {
            traverse(child, currentPath);
          }
        }
        return;
      }

      const entry: TaxonomyEntry = {
        text: item.Text,
        normalizedText: normalizeText(item.Text),
        classNumber: item.ClassNumber,
        conceptId: item.ConceptId,
        level: item.Level,
        path: [...currentPath, item.Text],
        childCount: item.ItemsSize,
        isLeaf: item.Items === null,
      };

      this.entries.push(entry);

      // Index by normalized text (multiple entries can have same text in different classes)
      const normalizedKey = entry.normalizedText;
      if (!this.textIndex.has(normalizedKey)) {
        this.textIndex.set(normalizedKey, []);
      }
      this.textIndex.get(normalizedKey)!.push(entry);

      // Index by concept ID (unique)
      this.conceptIndex.set(item.ConceptId, entry);

      // Index by class number
      if (item.ClassNumber > 0) {
        if (!this.classIndex.has(item.ClassNumber)) {
          this.classIndex.set(item.ClassNumber, []);
        }
        this.classIndex.get(item.ClassNumber)!.push(entry);
      }

      // Recurse into children
      if (item.Items) {
        for (const child of item.Items) {
          traverse(child, entry.path);
        }
      }
    };

    traverse(root, []);
  }

  /**
   * Check if taxonomy is loaded
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get total number of indexed entries
   */
  getEntryCount(): number {
    return this.entries.length;
  }

  /**
   * Get all available Nice class numbers (1-45)
   */
  getAvailableClasses(): number[] {
    return Array.from(this.classIndex.keys()).sort((a, b) => a - b);
  }

  /**
   * Get entries for a specific Nice class
   */
  getClassEntries(classNumber: number): TaxonomyEntry[] {
    return this.classIndex.get(classNumber) || [];
  }

  /**
   * Find an entry by exact text match
   */
  findExact(text: string, classNumber?: number): TaxonomyEntry | undefined {
    const normalized = normalizeText(text);
    const matches = this.textIndex.get(normalized) || [];

    if (classNumber !== undefined) {
      return matches.find(e => e.classNumber === classNumber);
    }

    return matches[0];
  }

  /**
   * Find an entry by concept ID
   */
  findByConceptId(conceptId: string): TaxonomyEntry | undefined {
    return this.conceptIndex.get(conceptId);
  }

  /**
   * Search for entries matching a query
   */
  search(query: string, options: TaxonomySearchOptions = {}): TaxonomyEntry[] {
    const {
      classNumbers,
      leafOnly = false,
      limit = 20,
      minScore = 0.3,
    } = options;

    const normalizedQuery = normalizeText(query);

    // Filter candidates
    let candidates = this.entries;

    if (classNumbers && classNumbers.length > 0) {
      candidates = candidates.filter(e => classNumbers.includes(e.classNumber));
    }

    if (leafOnly) {
      candidates = candidates.filter(e => e.isLeaf);
    }

    // Score and sort
    const scored = candidates
      .map(entry => ({
        entry,
        score: calculateSimilarity(normalizedQuery, entry.text),
      }))
      .filter(({ score }) => score >= minScore)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(({ entry }) => entry);
  }

  /**
   * Validate a single term
   */
  validateTerm(term: string, classNumber?: number): TaxonomyValidationResult {
    // Try exact match first
    const exact = this.findExact(term, classNumber);
    if (exact) {
      return { found: true, entry: exact };
    }

    // Search for suggestions
    const suggestions = this.search(term, {
      classNumbers: classNumber ? [classNumber] : undefined,
      limit: 5,
      minScore: 0.4,
    });

    return {
      found: false,
      suggestions,
      error: suggestions.length > 0
        ? `Term "${term}" not found. Did you mean one of: ${suggestions.map(s => `"${s.text}"`).join(', ')}?`
        : `Term "${term}" not found in taxonomy.`,
    };
  }

  /**
   * Validate a NiceClassSelection object
   * Returns validation results for all terms
   */
  validateNiceClassSelection(selection: NiceClassSelection): {
    valid: boolean;
    results: Map<string, TaxonomyValidationResult>;
    errors: string[];
  } {
    const results = new Map<string, TaxonomyValidationResult>();
    const errors: string[] = [];

    // Validate class number
    if (selection.classNumber < 1 || selection.classNumber > 45) {
      errors.push(`Invalid class number: ${selection.classNumber}. Must be 1-45.`);
    }

    // Validate terms if provided
    if (selection.terms && selection.terms.length > 0) {
      for (const term of selection.terms) {
        const result = this.validateTerm(term, selection.classNumber);
        results.set(term, result);

        if (!result.found) {
          errors.push(result.error || `Term "${term}" not found.`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      results,
      errors,
    };
  }

  /**
   * Validate multiple NiceClassSelection objects
   */
  validateNiceClasses(selections: NiceClassSelection[]): {
    valid: boolean;
    classResults: Map<number, { valid: boolean; errors: string[] }>;
    allErrors: string[];
  } {
    const classResults = new Map<number, { valid: boolean; errors: string[] }>();
    const allErrors: string[] = [];

    for (const selection of selections) {
      const { valid, errors } = this.validateNiceClassSelection(selection);
      classResults.set(selection.classNumber, { valid, errors });

      if (!valid) {
        allErrors.push(...errors.map(e => `Class ${selection.classNumber}: ${e}`));
      }
    }

    return {
      valid: allErrors.length === 0,
      classResults,
      allErrors,
    };
  }

  /**
   * Get the class header entry for a Nice class
   * The class header is the top-level entry like "Klasse 9"
   */
  getClassHeader(classNumber: number): TaxonomyEntry | undefined {
    const entries = this.classIndex.get(classNumber);
    if (!entries) return undefined;

    // Find the entry with level 1 (class level)
    return entries.find(e => e.level === 1 && e.text.startsWith('Klasse'));
  }

  /**
   * Get main categories for a Nice class (level 2 entries)
   */
  getClassCategories(classNumber: number): TaxonomyEntry[] {
    const entries = this.classIndex.get(classNumber);
    if (!entries) return [];

    return entries.filter(e => e.level === 2);
  }

  /**
   * Get statistics about the loaded taxonomy
   */
  getStats(): {
    totalEntries: number;
    classCounts: Record<number, number>;
    leafCount: number;
    categoryCount: number;
  } {
    const classCounts: Record<number, number> = {};
    let leafCount = 0;
    let categoryCount = 0;

    for (const entry of this.entries) {
      if (entry.classNumber > 0) {
        classCounts[entry.classNumber] = (classCounts[entry.classNumber] || 0) + 1;
      }
      if (entry.isLeaf) {
        leafCount++;
      } else {
        categoryCount++;
      }
    }

    return {
      totalEntries: this.entries.length,
      classCounts,
      leafCount,
      categoryCount,
    };
  }
}

// Singleton instance for convenience
let defaultInstance: TaxonomyService | null = null;

/**
 * Get or create the default TaxonomyService instance
 */
export async function getTaxonomyService(): Promise<TaxonomyService> {
  if (!defaultInstance) {
    defaultInstance = new TaxonomyService();
    await defaultInstance.load();
  }
  return defaultInstance;
}
