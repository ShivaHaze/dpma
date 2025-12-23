/**
 * LevenshteinDistance - High-performance string similarity algorithm
 *
 * Implements Damerau-Levenshtein distance with optimizations:
 * 1. Single-row space optimization: O(min(m,n)) space instead of O(m*n)
 * 2. Early termination: Stop computation when distance exceeds threshold
 * 3. Length-based pruning: Skip comparison if length difference exceeds threshold
 * 4. Transposition support: 'ab' → 'ba' counts as 1 edit, not 2
 * 5. Unicode-aware: Properly handles German umlauts and special characters
 *
 * Performance characteristics:
 * - Time: O(m*n) worst case, often much faster with early termination
 * - Space: O(min(m,n)) - uses single row instead of full matrix
 */

/**
 * Calculate the Damerau-Levenshtein distance between two strings
 *
 * Operations counted (each costs 1):
 * - Insertion: add a character
 * - Deletion: remove a character
 * - Substitution: replace a character
 * - Transposition: swap two adjacent characters
 *
 * @param a - First string
 * @param b - Second string
 * @param maxDistance - Optional maximum distance threshold for early termination
 * @returns The edit distance, or maxDistance + 1 if exceeded
 */
export function levenshteinDistance(
  a: string,
  b: string,
  maxDistance: number = Infinity
): number {
  // Normalize inputs
  const strA = a || '';
  const strB = b || '';

  // Quick equality check
  if (strA === strB) return 0;

  const lenA = strA.length;
  const lenB = strB.length;

  // Empty string cases
  if (lenA === 0) return Math.min(lenB, maxDistance + 1);
  if (lenB === 0) return Math.min(lenA, maxDistance + 1);

  // Length-based pruning: if difference exceeds max, no need to compute
  if (Math.abs(lenA - lenB) > maxDistance) {
    return maxDistance + 1;
  }

  // Ensure a is the shorter string for space optimization
  let shorter = strA;
  let longer = strB;
  let shorterLen = lenA;
  let longerLen = lenB;

  if (lenA > lenB) {
    shorter = strB;
    longer = strA;
    shorterLen = lenB;
    longerLen = lenA;
  }

  // Single row optimization: we only need the previous row
  // Plus one extra for Damerau transposition check
  const currentRow = new Array<number>(shorterLen + 1);
  const previousRow = new Array<number>(shorterLen + 1);
  const transpositionRow = new Array<number>(shorterLen + 1);

  // Initialize first row
  for (let j = 0; j <= shorterLen; j++) {
    previousRow[j] = j;
  }

  // Fill the virtual matrix row by row
  for (let i = 1; i <= longerLen; i++) {
    // Initialize transposition row from two rows back
    for (let j = 0; j <= shorterLen; j++) {
      transpositionRow[j] = previousRow[j];
    }

    currentRow[0] = i;
    const longerChar = longer[i - 1];

    // Track minimum value in this row for early termination
    let rowMin = i;

    for (let j = 1; j <= shorterLen; j++) {
      const shorterChar = shorter[j - 1];

      // Cost is 0 if characters match, 1 otherwise
      const cost = longerChar === shorterChar ? 0 : 1;

      // Standard Levenshtein operations
      const insertion = currentRow[j - 1] + 1;
      const deletion = previousRow[j] + 1;
      const substitution = previousRow[j - 1] + cost;

      let minCost = Math.min(insertion, deletion, substitution);

      // Damerau extension: check for transposition
      // Can only transpose if we have at least 2 chars in both strings
      if (i > 1 && j > 1) {
        const prevLongerChar = longer[i - 2];
        const prevShorterChar = shorter[j - 2];

        // Transposition: swap adjacent characters
        if (longerChar === prevShorterChar && prevLongerChar === shorterChar) {
          const transposition = transpositionRow[j - 2] + cost;
          minCost = Math.min(minCost, transposition);
        }
      }

      currentRow[j] = minCost;
      rowMin = Math.min(rowMin, minCost);
    }

    // Early termination: if minimum in this row exceeds threshold, no point continuing
    if (rowMin > maxDistance) {
      return maxDistance + 1;
    }

    // Swap rows: current becomes previous for next iteration
    for (let j = 0; j <= shorterLen; j++) {
      previousRow[j] = currentRow[j];
    }
  }

  return currentRow[shorterLen];
}

/**
 * Calculate normalized similarity score between two strings
 *
 * @param a - First string
 * @param b - Second string
 * @param options - Scoring options
 * @returns Similarity score between 0 (completely different) and 1 (identical)
 */
export function levenshteinSimilarity(
  a: string,
  b: string,
  options: {
    /** Minimum similarity to consider (for early termination) */
    minSimilarity?: number;
    /** Whether to normalize strings before comparison */
    normalize?: boolean;
  } = {}
): number {
  const { minSimilarity = 0, normalize = true } = options;

  let strA = a || '';
  let strB = b || '';

  // Normalize if requested
  if (normalize) {
    strA = normalizeForComparison(strA);
    strB = normalizeForComparison(strB);
  }

  // Identical strings
  if (strA === strB) return 1.0;

  // Empty string handling
  if (strA.length === 0 || strB.length === 0) {
    return 0;
  }

  const maxLen = Math.max(strA.length, strB.length);

  // Calculate max distance threshold from min similarity
  // similarity = 1 - (distance / maxLen)
  // distance = maxLen * (1 - similarity)
  const maxDistance = minSimilarity > 0
    ? Math.floor(maxLen * (1 - minSimilarity))
    : Infinity;

  const distance = levenshteinDistance(strA, strB, maxDistance);

  // If distance exceeded threshold, similarity is below minimum
  if (distance > maxDistance) {
    return minSimilarity > 0 ? 0 : 1 - distance / maxLen;
  }

  return 1 - distance / maxLen;
}

/**
 * Normalize a string for comparison
 * - Lowercase
 * - Normalize German umlauts (ä→ae, ö→oe, ü→ue, ß→ss)
 * - Remove punctuation and extra whitespace
 */
export function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    // Normalize German umlauts to ASCII equivalents
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    // Remove punctuation except hyphens within words
    .replace(/[^\w\s-]/g, ' ')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Find best matches from a list of candidates
 *
 * @param query - The search query
 * @param candidates - Array of candidate strings
 * @param options - Search options
 * @returns Sorted array of matches with scores
 */
export function findBestMatches(
  query: string,
  candidates: string[],
  options: {
    /** Maximum number of results */
    limit?: number;
    /** Minimum similarity score (0-1) */
    minSimilarity?: number;
    /** Whether to normalize strings */
    normalize?: boolean;
  } = {}
): Array<{ text: string; score: number; index: number }> {
  const { limit = 10, minSimilarity = 0.3, normalize = true } = options;

  const normalizedQuery = normalize ? normalizeForComparison(query) : query;

  const results: Array<{ text: string; score: number; index: number }> = [];

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    const normalizedCandidate = normalize
      ? normalizeForComparison(candidate)
      : candidate;

    // Quick prefix check for potential matches
    // This is a fast pre-filter before expensive Levenshtein
    const queryWords = normalizedQuery.split(' ');
    const candidateWords = normalizedCandidate.split(' ');

    // Check if any query word is a prefix of any candidate word (fast path)
    let hasPotentialMatch = false;
    for (const qw of queryWords) {
      if (qw.length < 2) continue;
      for (const cw of candidateWords) {
        if (cw.startsWith(qw) || qw.startsWith(cw)) {
          hasPotentialMatch = true;
          break;
        }
      }
      if (hasPotentialMatch) break;
    }

    // Calculate full similarity
    const score = levenshteinSimilarity(normalizedQuery, normalizedCandidate, {
      minSimilarity: hasPotentialMatch ? minSimilarity * 0.8 : minSimilarity,
      normalize: false, // Already normalized
    });

    // Boost score for substring matches
    let adjustedScore = score;
    if (normalizedCandidate.includes(normalizedQuery)) {
      adjustedScore = Math.min(1, score + 0.2);
    } else if (normalizedQuery.includes(normalizedCandidate)) {
      adjustedScore = Math.min(1, score + 0.1);
    }

    if (adjustedScore >= minSimilarity) {
      results.push({ text: candidate, score: adjustedScore, index: i });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}

/**
 * Check if a string is "close enough" to any candidate
 * Fast path for validation - stops at first match above threshold
 *
 * @param query - The query string
 * @param candidates - Array of valid strings
 * @param threshold - Minimum similarity (default 0.8)
 * @returns The best matching candidate, or null if none match
 */
export function findClosestMatch(
  query: string,
  candidates: string[],
  threshold: number = 0.8
): { text: string; score: number } | null {
  const normalizedQuery = normalizeForComparison(query);

  let bestMatch: { text: string; score: number } | null = null;
  let bestScore = threshold;

  for (const candidate of candidates) {
    const normalizedCandidate = normalizeForComparison(candidate);

    // Exact match fast path
    if (normalizedQuery === normalizedCandidate) {
      return { text: candidate, score: 1.0 };
    }

    const score = levenshteinSimilarity(normalizedQuery, normalizedCandidate, {
      minSimilarity: bestScore,
      normalize: false,
    });

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { text: candidate, score };

      // If we found a very good match, stop searching
      if (score >= 0.95) break;
    }
  }

  return bestMatch;
}
