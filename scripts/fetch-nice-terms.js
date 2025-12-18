/**
 * Script to fetch ALL Nice Classification terms from WIPO NCLPub
 * and save them to JSON and TypeScript files
 *
 * Run with: node scripts/fetch-nice-terms.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://nclpub.wipo.int/enfr/';
const VERSION = '20260101';
const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

const allTerms = {
  goods: [],
  services: [],
  metadata: {
    fetchDate: new Date().toISOString(),
    source: 'WIPO NCLPub',
    version: VERSION,
    url: BASE_URL
  }
};

function fetchPage(letter, classtype) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}?notion=alphabetical&lang=en&menulang=en&version=${VERSION}&pagination=no&gors=&letter=${letter}&classtype=${classtype}`;

    const req = https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function parseTerms(html) {
  const terms = [];

  // Pattern to match table rows with class, term, and basic number
  // Structure: <tr ...><td>...class number...</td><td>...term...</td><td>...basic number...</td></tr>

  // First, find all table rows
  const rowRegex = /<tr[^>]*data-ri="[^"]*"[^>]*role="row"[^>]*>([\s\S]*?)<\/tr>/gi;

  let rowMatch;
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowContent = rowMatch[1];

    // Extract class number from label
    const classMatch = rowContent.match(/<label[^>]*class="ui-outputlabel[^"]*"[^>]*>(\d+)<\/label>/);

    // Extract term - it's plain text after "<!-- row record -->" in the second td
    const termMatch = rowContent.match(/<td[^>]*role="gridcell"[^>]*>\s*(?:<!--[^>]*-->)?\s*([^<]+)<\/td>/);

    // Extract basic number from label in third td
    const basicMatch = rowContent.match(/<label[^>]*>(\d{6})<\/label>/);

    if (classMatch && basicMatch) {
      // Get the term - it's between the class td and basic number td
      const tdMatches = rowContent.match(/<td[^>]*role="gridcell"[^>]*>([\s\S]*?)<\/td>/g);
      if (tdMatches && tdMatches.length >= 2) {
        // Second td contains the term
        let term = tdMatches[1]
          .replace(/<[^>]+>/g, '')  // Remove HTML tags
          .replace(/<!--[^>]*-->/g, '')  // Remove comments
          .trim();

        if (term) {
          terms.push({
            term: term,
            classNumber: parseInt(classMatch[1], 10),
            basicNumber: basicMatch[1]
          });
        }
      }
    }
  }

  return terms;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllTerms() {
  console.log('Fetching Nice Classification terms from WIPO NCLPub...');
  console.log(`Version: ${VERSION}`);
  console.log('');

  // Fetch goods (classes 1-34)
  console.log('=== GOODS (Classes 1-34) ===');
  for (const letter of LETTERS) {
    process.stdout.write(`  ${letter.toUpperCase()}: `);
    try {
      const html = await fetchPage(letter, 'goods');
      const terms = parseTerms(html);
      allTerms.goods.push(...terms);
      console.log(`${terms.length} terms`);
    } catch (err) {
      console.log(`ERROR - ${err.message}`);
    }
    await sleep(300); // Be nice to the server
  }
  console.log(`  Total goods: ${allTerms.goods.length}`);

  // Fetch services (classes 35-45)
  console.log('');
  console.log('=== SERVICES (Classes 35-45) ===');
  for (const letter of LETTERS) {
    process.stdout.write(`  ${letter.toUpperCase()}: `);
    try {
      const html = await fetchPage(letter, 'services');
      const terms = parseTerms(html);
      allTerms.services.push(...terms);
      console.log(`${terms.length} terms`);
    } catch (err) {
      console.log(`ERROR - ${err.message}`);
    }
    await sleep(300);
  }
  console.log(`  Total services: ${allTerms.services.length}`);

  // Summary
  const totalTerms = allTerms.goods.length + allTerms.services.length;
  console.log('');
  console.log('=== SUMMARY ===');
  console.log(`  Goods terms:    ${allTerms.goods.length}`);
  console.log(`  Services terms: ${allTerms.services.length}`);
  console.log(`  TOTAL:          ${totalTerms}`);

  if (totalTerms === 0) {
    console.log('');
    console.log('ERROR: No terms were parsed! The HTML structure may have changed.');
    console.log('Check the WIPO website manually.');
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '..', 'src', 'data');
  fs.mkdirSync(outputDir, { recursive: true });

  // Save to JSON
  const jsonPath = path.join(outputDir, 'nice-terms-complete.json');
  fs.writeFileSync(jsonPath, JSON.stringify(allTerms, null, 2));
  console.log('');
  console.log(`Saved JSON to: ${jsonPath}`);

  // Generate TypeScript file
  const tsPath = path.join(outputDir, 'nice-terms-complete.ts');
  const tsContent = `/**
 * Nice Classification Terms - Complete Database
 *
 * AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
 *
 * Source: WIPO NCLPub (${BASE_URL})
 * Version: ${VERSION}
 * Generated: ${new Date().toISOString()}
 *
 * Total Terms: ${totalTerms}
 * - Goods (Classes 1-34): ${allTerms.goods.length} terms
 * - Services (Classes 35-45): ${allTerms.services.length} terms
 */

export interface NiceTerm {
  /** Term description in English */
  term: string;
  /** Nice Classification class number (1-45) */
  classNumber: number;
  /** Basic number (unique identifier) */
  basicNumber: string;
}

/**
 * All goods terms (Classes 1-34)
 */
export const NICE_GOODS_TERMS: NiceTerm[] = ${JSON.stringify(allTerms.goods, null, 2)};

/**
 * All services terms (Classes 35-45)
 */
export const NICE_SERVICES_TERMS: NiceTerm[] = ${JSON.stringify(allTerms.services, null, 2)};

/**
 * Combined array of all terms
 */
export const ALL_NICE_TERMS: NiceTerm[] = [...NICE_GOODS_TERMS, ...NICE_SERVICES_TERMS];

/**
 * Search terms by keyword (case-insensitive)
 */
export function searchTerms(keyword: string): NiceTerm[] {
  const lower = keyword.toLowerCase();
  return ALL_NICE_TERMS.filter(t => t.term.toLowerCase().includes(lower));
}

/**
 * Get all terms for a specific class
 */
export function getTermsByClass(classNumber: number): NiceTerm[] {
  return ALL_NICE_TERMS.filter(t => t.classNumber === classNumber);
}

/**
 * Get term by basic number
 */
export function getTermByBasicNumber(basicNumber: string): NiceTerm | undefined {
  return ALL_NICE_TERMS.find(t => t.basicNumber === basicNumber);
}

/**
 * Total number of terms
 */
export const TOTAL_TERMS = ${totalTerms};
`;

  fs.writeFileSync(tsPath, tsContent);
  console.log(`Saved TypeScript to: ${tsPath}`);
  console.log('');
  console.log('Done!');
}

// Run
fetchAllTerms().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
