/**
 * Nice Classification Types for DPMA Trademark Registration
 *
 * The Nice Classification is an international classification of goods and services
 * applied for the registration of marks. It was established by the Nice Agreement (1957).
 *
 * Version: 12th Edition 2023 (Oct 2025) - as used by DPMA
 * Total classes: 45 (Classes 1-34: Goods, Classes 35-45: Services)
 * Total items: ~70,000 goods and services
 */

/**
 * Nice Classification class number (1-45)
 */
export type NiceClassNumber =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40
  | 41 | 42 | 43 | 44 | 45;

/**
 * Category type: Goods (1-34) or Services (35-45)
 */
export type NiceCategory = 'goods' | 'services';

/**
 * Individual term/item within a Nice class
 */
export interface NiceTerm {
  /** Unique identifier for the term (if available from DPMA) */
  id?: string;
  /** German term description */
  termDE: string;
  /** English term description (optional) */
  termEN?: string;
  /** Base number in Nice classification (e.g., "010001") */
  baseNumber?: string;
}

/**
 * Group title (Gruppentitel/Oberbegriff) - subcategory within a class
 */
export interface NiceGroupTitle {
  /** German group title */
  titleDE: string;
  /** English group title (optional) */
  titleEN?: string;
  /** Number of terms in this group */
  termCount: number;
  /** Individual terms (lazy-loaded, may be empty initially) */
  terms?: NiceTerm[];
}

/**
 * Complete Nice Classification class
 */
export interface NiceClass {
  /** Class number (1-45) */
  classNumber: NiceClassNumber;
  /** Formatted class code (e.g., "KL.01", "KL.35") */
  classCode: string;
  /** Category: goods or services */
  category: NiceCategory;
  /** Short description in German (as shown in DPMA dropdown) */
  shortDescriptionDE: string;
  /** Short description in English */
  shortDescriptionEN: string;
  /** Full official class heading in German */
  fullDescriptionDE: string;
  /** Full official class heading in English */
  fullDescriptionEN: string;
  /** Group titles (Oberbegriffe) - subcategories */
  groupTitles?: NiceGroupTitle[];
}

/**
 * Selection of Nice classes for trademark application
 */
export interface NiceClassSelection {
  /** Selected class number */
  classNumber: NiceClassNumber;
  /** Selected terms within this class */
  selectedTerms: string[];
  /** Whether entire class is selected (all group titles) */
  entireClass?: boolean;
}

/**
 * Lead class suggestion (Leitklassenvorschlag)
 * The primary class that best represents the trademark's main purpose
 */
export interface LeadClassSuggestion {
  /** The suggested lead class number */
  classNumber: NiceClassNumber;
  /** Reason for suggestion (optional) */
  reason?: string;
}

/**
 * Complete WDVZ (Waren- und Dienstleistungsverzeichnis) for API submission
 */
export interface GoodsAndServicesSelection {
  /** All selected Nice classes with their terms */
  selections: NiceClassSelection[];
  /** Lead class suggestion (required by DPMA) */
  leadClass: NiceClassNumber;
  /** Total number of selected classes */
  totalClasses: number;
  /** Total number of selected terms */
  totalTerms: number;
}

/**
 * Form field names for Step 5 (WDVZ)
 */
export const WDVZ_FORM_FIELDS = {
  /** Lead class dropdown */
  leadClassSelect: 'daf-wdvz:leadClass_input',
  /** Search input */
  searchInput: 'daf-wdvz:search',
  /** Search button */
  searchButton: 'daf-wdvz:searchBtn',
} as const;

/**
 * Helper function to format class number as DPMA code
 */
export function formatClassCode(classNumber: NiceClassNumber): string {
  return `KL.${classNumber.toString().padStart(2, '0')}`;
}

/**
 * Helper function to determine if a class is goods or services
 */
export function getClassCategory(classNumber: NiceClassNumber): NiceCategory {
  return classNumber <= 34 ? 'goods' : 'services';
}

/**
 * Helper function to validate Nice class number
 */
export function isValidNiceClass(num: number): num is NiceClassNumber {
  return Number.isInteger(num) && num >= 1 && num <= 45;
}
