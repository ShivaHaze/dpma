/**
 * DPMA Trademark Registration API Types
 * Complete type definitions for the German Patent and Trademark Office automation
 */

// ============================================================================
// ENUMS
// ============================================================================

/** Applicant type - natural person or legal entity */
export enum ApplicantType {
  NATURAL = 'natural',
  LEGAL = 'legal'
}

/** Trademark type codes as used by DPMA */
export enum TrademarkType {
  WORD = 'word',                    // Wortmarke
  FIGURATIVE = 'figurative',        // Bildmarke
  COMBINED = 'combined',            // Wort-/Bildmarke (image upload only, no separate text field)
  THREE_DIMENSIONAL = '3d',         // Dreidimensionale Marke
  COLOR = 'color',                  // Farbmarke
  SOUND = 'sound',                  // Klangmarke
  POSITION = 'position',            // Positionsmarke
  PATTERN = 'pattern',              // Mustermarke
  MOTION = 'motion',                // Bewegungsmarke
  MULTIMEDIA = 'multimedia',        // Multimediamarke
  HOLOGRAM = 'hologram',            // Hologrammmarke
  THREAD = 'thread',                // Kennfadenmarke
  OTHER = 'other'                   // Sonstige Marke
}

/** SEPA mandate type */
export enum SepaMandateType {
  PERMANENT = 'permanent',          // Dauer-SEPA-Mandatsverwendung (all future fees auto-debited)
  SINGLE = 'single'                 // (Mehrfach-)Einzel-SEPA-Mandatsverwendung (only current fees)
}

/** Payment method */
export enum PaymentMethod {
  BANK_TRANSFER = 'UEBERWEISUNG',
  SEPA_DIRECT_DEBIT = 'SEPASDD'
}

/** Russia sanctions declaration values */
export enum SanctionDeclaration {
  FALSE = 'FALSE',
  TRUE = 'TRUE'
}

// ============================================================================
// INPUT TYPES (API Request)
// ============================================================================

/** Address information */
export interface Address {
  street: string;              // Straße, Hausnummer (Street + house number)
  addressLine1?: string;       // Adresszusatz 1 (Additional address line)
  addressLine2?: string;       // Adresszusatz 2 (Additional address line 2)
  zip: string;                 // Postleitzahl (Postal code)
  city: string;                // Ort (City)
  country: string;             // Land - ISO country code (e.g., 'DE')
}

/** Contact information for correspondence */
export interface ContactInfo {
  telephone?: string;          // Telefon (optional for applicant, required for delivery)
  fax?: string;                // Fax (optional)
  email: string;               // E-Mail (required)
}

/** Natural person applicant */
export interface NaturalPersonApplicant {
  type: ApplicantType.NATURAL;
  salutation?: string;         // Anrede/Titel (optional)
  firstName: string;           // Vorname
  lastName: string;            // Nachname
  nameSuffix?: string;         // Name suffix (optional)
  address: Address;
}

/** Legal entity applicant */
export interface LegalEntityApplicant {
  type: ApplicantType.LEGAL;
  companyName: string;         // Firma/Organisation
  legalForm?: string;          // Rechtsform (GmbH, AG, etc.)
  address: Address;
}

/** Union of applicant types */
export type Applicant = NaturalPersonApplicant | LegalEntityApplicant;

// ============================================================================
// REPRESENTATIVE / LAWYER (Step 2)
// ============================================================================

/** Representative (Lawyer/Law Firm) - Step 2 */
export interface Representative {
  /** Type of representative */
  type: ApplicantType;

  /** For natural person */
  salutation?: string;           // Anrede/Titel
  firstName?: string;            // Vorname
  lastName?: string;             // Nachname

  /** For legal entity */
  companyName?: string;          // Firma/Organisation
  legalForm?: string;            // Rechtsform

  /** Address */
  address: Address;

  /** Contact information */
  contact: ContactInfo;

  /** Lawyer registration ID (optional) */
  lawyerRegistrationId?: string; // Rechtsanwaltskammer-ID

  /** Internal reference (Geschäftszeichen) */
  internalReference?: string;
}

/** Delivery address configuration (Step 3) */
export interface DeliveryAddress {
  /** Copy address from applicant */
  copyFromApplicant?: boolean;

  /** Type of recipient */
  type: ApplicantType;

  /** For natural person */
  salutation?: string;           // Anrede/Titel
  firstName?: string;            // Vorname
  lastName: string;              // Nachname (required)

  /** For legal entity */
  companyName?: string;          // Firma/Organisation
  legalForm?: string;            // Rechtsform

  /** Address */
  address: Address;

  /** Contact (email required) */
  contact: ContactInfo;
}

/** Russia sanctions declaration */
export interface SanctionsDeclaration {
  hasRussianNationality: boolean;
  hasRussianResidence: boolean;
}

/** Common trademark fields that apply to all trademark types */
export interface TrademarkCommonFields {
  /** Color elements in the trademark (Farbangabe) */
  colorElements?: string[];

  /** Contains non-Latin characters (nicht-lateinische Zeichen) */
  hasNonLatinCharacters?: boolean;

  /** Trademark description (Beschreibung der Marke) */
  description?: string;
}

/** Word trademark */
export interface WordTrademark extends TrademarkCommonFields {
  type: TrademarkType.WORD;
  text: string;                // The trademark text (Markendarstellung)
}

/** Image trademark (Bildmarke) */
export interface ImageTrademark extends TrademarkCommonFields {
  type: TrademarkType.FIGURATIVE;
  imageData: Buffer;           // Image file data
  imageMimeType: string;       // e.g., 'image/png', 'image/jpeg'
  imageFileName: string;       // Original filename
}

/**
 * Combined word/image trademark (Wort-/Bildmarke)
 * NOTE: DPMA form only has image upload for combined marks, no separate text field.
 * The text is embedded in the image itself.
 */
export interface CombinedTrademark extends TrademarkCommonFields {
  type: TrademarkType.COMBINED;
  imageData: Buffer;           // Image file data (contains both word and image)
  imageMimeType: string;       // e.g., 'image/png', 'image/jpeg'
  imageFileName: string;       // Original filename
}

/** 3D trademark */
export interface ThreeDimensionalTrademark extends TrademarkCommonFields {
  type: TrademarkType.THREE_DIMENSIONAL;
  imageData: Buffer;           // Image/representation file data
  imageMimeType: string;
  imageFileName: string;
}

/** Color trademark */
export interface ColorTrademark extends TrademarkCommonFields {
  type: TrademarkType.COLOR;
  imageData?: Buffer;          // Optional image representation
  imageMimeType?: string;
  imageFileName?: string;
}

/** Sound trademark */
export interface SoundTrademark extends TrademarkCommonFields {
  type: TrademarkType.SOUND;
  soundData: Buffer;           // Audio file data
  soundMimeType: string;       // e.g., 'audio/mpeg'
  soundFileName: string;
}

/** Thread mark (Kennfadenmarke) */
export interface ThreadTrademark extends TrademarkCommonFields {
  type: TrademarkType.THREAD;
  imageData: Buffer;           // Image representation
  imageMimeType: string;
  imageFileName: string;
}

/** Other trademark types (Position, Pattern, Motion, Multimedia, Hologram, Other) */
export interface OtherTrademark extends TrademarkCommonFields {
  type: TrademarkType.POSITION | TrademarkType.PATTERN | TrademarkType.MOTION |
        TrademarkType.MULTIMEDIA | TrademarkType.HOLOGRAM | TrademarkType.OTHER;
  imageData?: Buffer;          // Image/media data
  imageMimeType?: string;
  imageFileName?: string;
}

/** Union of trademark types */
export type Trademark =
  | WordTrademark
  | ImageTrademark
  | CombinedTrademark
  | ThreeDimensionalTrademark
  | ColorTrademark
  | SoundTrademark
  | ThreadTrademark
  | OtherTrademark;

/** Nice classification selection */
export interface NiceClassSelection {
  classNumber: number;         // 1-45

  /**
   * Specific term names to select (optional)
   * Examples: ["Software", "Anwendungssoftware", "Betriebssysteme"]
   *
   * Terms are searched and matched by their exact German name as shown in the DPMA form.
   * If empty/undefined, selects the class header (all terms in the class).
   *
   * Common terms for popular classes:
   * - Class 9 (Software/Electronics): "Software", "Anwendungssoftware", "Spielsoftware",
   *   "Künstliche Intelligenz-Software und maschinelle Lernsoftware", "Betriebssysteme"
   * - Class 35 (Business): "Werbung, Marketing und Verkaufsförderung"
   * - Class 42 (IT Services): "IT-Dienstleistungen", "Entwicklung, Programmierung und Implementierung von Software",
   *   "Hosting-Dienste, Software as a Service [SaaS] und Vermietung von Software"
   */
  terms?: string[];

  /**
   * If true, selects the class header (Gruppentitel) which includes ALL terms in that class.
   * This is useful when you want broad protection for an entire Nice class.
   * Defaults to true when terms array is empty/undefined.
   */
  selectClassHeader?: boolean;
}

/** Foreign priority claim (Ausländische Priorität) - §34 MarkenG */
export interface ForeignPriorityClaim {
  type: 'foreign';
  date: string;                // Datum (ISO date string) - required
  country: string;             // Land (Country code) - required
  applicationNumber: string;   // Aktenzeichen (File number) - required
}

/** Exhibition priority claim (Austellungspriorität) - §35 MarkenG */
export interface ExhibitionPriorityClaim {
  type: 'exhibition';
  date: string;                // Datum (ISO date string) - required
  exhibitionName: string;      // Austellungsname - required
}

/** Union type for priority claims */
export type PriorityClaim = ForeignPriorityClaim | ExhibitionPriorityClaim;

/** SEPA contact person for direct debit - Natural Person */
export interface SepaContactNaturalPerson {
  type: ApplicantType.NATURAL;
  salutation?: string;           // Anrede/Titel
  lastName: string;              // Nachname (required)
  firstName?: string;            // Vorname
  address: Address;
  telephone: string;             // Telefon (required)
  fax?: string;                  // Fax (optional)
  email: string;                 // E-Mail (required)
}

/** SEPA contact person for direct debit - Legal Entity */
export interface SepaContactLegalEntity {
  type: ApplicantType.LEGAL;
  legalForm?: string;            // Rechtsform/Gesellschaftsform
  companyName: string;           // Firmenname (required)
  address: Address;
  telephone: string;             // Telefon (required)
  fax?: string;                  // Fax (optional)
  email: string;                 // E-Mail (required)
}

/** Union type for SEPA contact */
export type SepaContact = SepaContactNaturalPerson | SepaContactLegalEntity;

/**
 * SEPA direct debit details (required if payment method is SEPA_DIRECT_DEBIT)
 * NOTE: Requires a valid SEPA mandate (A9530 form) to be on file with DPMA
 */
export interface SepaDetails {
  /** Mandate reference number (Mandatsreferenznummer) - required */
  mandateReferenceNumber: string;

  /** Mandate type - permanent or single use */
  mandateType: SepaMandateType;

  /** Copy contact from applicant address */
  copyFromApplicant?: boolean;

  /** Contact person for SEPA (required if not copying from applicant) */
  contact?: SepaContact;
}

/** Additional options for Step 6 */
export interface AdditionalOptions {
  acceleratedExamination?: boolean;    // Beschleunigte Prüfung (+€200)
  certificationMark?: boolean;         // Gewährleistungsmarke
  licensingDeclaration?: boolean;      // Lizenzierung
  saleDeclaration?: boolean;           // Veräußerung
  priorityClaims?: PriorityClaim[];
}

/** Complete trademark registration request */
export interface TrademarkRegistrationRequest {
  // =========================================================================
  // Step 1: Applicant (Anmelder)
  // =========================================================================

  /** Applicant information */
  applicant: Applicant;

  /**
   * Russia sanctions declaration - ONLY required for Natural Person applicants.
   * Legal Entity applicants do NOT have sanctions declaration fields on the DPMA form.
   * This field is optional because legal entities don't need it.
   */
  sanctions?: SanctionsDeclaration;

  // =========================================================================
  // Step 2: Representative/Lawyer (Anwalt/Kanzlei) - Optional
  // =========================================================================

  /** Legal representative(s) - optional */
  representatives?: Representative[];

  // =========================================================================
  // Step 3: Delivery Address (Zustelladresse)
  // =========================================================================

  /** Delivery address for correspondence */
  deliveryAddress?: DeliveryAddress;

  /** Email address for correspondence (required) */
  email: string;

  // =========================================================================
  // Step 4: Trademark (Marke)
  // =========================================================================

  /** The trademark to register */
  trademark: Trademark;

  // =========================================================================
  // Step 5: Nice Classification (WDVZ)
  // =========================================================================

  /** Nice classification classes to register (1-45) */
  niceClasses: NiceClassSelection[];

  /** Lead class suggestion (Leitklassenvorschlag) - defaults to first class */
  leadClass?: number;

  // =========================================================================
  // Step 6: Additional Options (Sonstiges)
  // =========================================================================

  /** Additional options */
  options?: AdditionalOptions;

  // =========================================================================
  // Step 7: Payment (Zahlung)
  // =========================================================================

  /** Payment method */
  paymentMethod: PaymentMethod;

  /** SEPA details (required if paymentMethod is SEPA_DIRECT_DEBIT) */
  sepaDetails?: SepaDetails;

  // =========================================================================
  // Step 8: Summary/Submission (Zusammenfassung)
  // =========================================================================

  /** Sender's full name for final submission (Vor- und Nachname des Absenders) */
  senderName: string;

  // =========================================================================
  // Internal/Optional
  // =========================================================================

  /** Internal document reference (optional) */
  internalReference?: string;
}

// ============================================================================
// OUTPUT TYPES (API Response)
// ============================================================================

/** Fee breakdown */
export interface FeeItem {
  code: string;                // e.g., '331000'
  description: string;         // e.g., 'Anmeldeverfahren - bei elektronischer Anmeldung'
  amount: number;              // e.g., 290.00
}

/** Payment information */
export interface PaymentInfo {
  method: PaymentMethod;
  totalAmount: number;
  currency: string;
  bankDetails?: {
    recipient: string;
    iban: string;
    bic: string;
    reference: string;         // Aktenzeichen as payment reference
  };
}

/** Downloaded document */
export interface DownloadedDocument {
  filename: string;
  data: Buffer;
  mimeType: string;
}

/** Successful registration result */
export interface TrademarkRegistrationSuccess {
  success: true;

  /** Official file number (Aktenzeichen) - CRITICAL */
  aktenzeichen: string;

  /** Document reference number (DRN) - CRITICAL */
  drn: string;

  /** Internal transaction ID */
  transactionId: string;

  /** Submission timestamp */
  submissionTime: string;

  /** Fee information */
  fees: FeeItem[];

  /** Payment details */
  payment: PaymentInfo;

  /** All downloaded receipt documents (extracted from ZIP) */
  receiptDocuments?: DownloadedDocument[];

  /** File path where ZIP archive was saved */
  receiptFilePath?: string;
}

/** Failed registration result */
export interface TrademarkRegistrationFailure {
  success: false;

  /** Error code */
  errorCode: string;

  /** Human-readable error message */
  errorMessage: string;

  /** Detailed validation errors (if any) */
  validationErrors?: Array<{
    field: string;
    message: string;
  }>;

  /** Step where the error occurred */
  failedAtStep?: number;
}

/** Union type for registration result */
export type TrademarkRegistrationResult =
  | TrademarkRegistrationSuccess
  | TrademarkRegistrationFailure;

// ============================================================================
// INTERNAL TYPES (Session Management)
// ============================================================================

/** JSF session tokens extracted from HTML */
export interface JsfTokens {
  viewState: string;
  clientWindow: string;
  primefacesNonce: string;
}

/** Session state */
export interface DpmaSession {
  /** JSF Window ID (jfwid) */
  jfwid: string;

  /** Current step counter */
  stepCounter: number;

  /** JSF tokens */
  tokens: JsfTokens;

  /** Encrypted transaction ID (after final submit) */
  encryptedTransactionId?: string;
}

// ============================================================================
// NICE CLASSIFICATION TAXONOMY TYPES
// ============================================================================

/**
 * Raw taxonomy item from taxonomyDe.json
 * Represents a node in the Nice classification hierarchy
 */
export interface TaxonomyItem {
  /** German term/category name */
  Text: string;
  /** Nice class number (1-45), 0 for root nodes */
  ClassNumber: number;
  /** Unique concept identifier */
  ConceptId: string;
  /** Hierarchy level (0=root, 1=class, 2+=subcategory) */
  Level: number;
  /** Child items (null for leaf nodes) */
  Items: TaxonomyItem[] | null;
  /** Total number of leaf terms under this node */
  ItemsSize: number;
}

/**
 * Flattened taxonomy entry for indexed lookup
 */
export interface TaxonomyEntry {
  /** The term text (German) */
  text: string;
  /** Normalized text for search (lowercase, no special chars) */
  normalizedText: string;
  /** Nice class number (1-45) */
  classNumber: number;
  /** Unique concept ID */
  conceptId: string;
  /** Hierarchy level */
  level: number;
  /** Full path from root (e.g., ["Klasse 9", "Software", "Anwendungssoftware"]) */
  path: string[];
  /** Number of sub-terms (0 for leaf nodes) */
  childCount: number;
  /** Whether this is a selectable leaf term */
  isLeaf: boolean;
}

/**
 * Result from taxonomy validation
 */
export interface TaxonomyValidationResult {
  /** Whether the term was found */
  found: boolean;
  /** The matched entry (if found) */
  entry?: TaxonomyEntry;
  /** Suggested alternatives (if not found or partial match) */
  suggestions?: TaxonomyEntry[];
  /** Error message if validation failed */
  error?: string;
}

/**
 * Search options for taxonomy lookup
 */
export interface TaxonomySearchOptions {
  /** Limit results to specific Nice class(es) */
  classNumbers?: number[];
  /** Only return leaf nodes (actual selectable terms) */
  leafOnly?: boolean;
  /** Maximum number of results */
  limit?: number;
  /** Minimum match score (0-1) for fuzzy search */
  minScore?: number;
}

/** DPMA Versand API response */
export interface VersandResponse {
  validationResult: {
    state: 'ok' | 'error';
    userMessage: string | null;
    validationMessageList: Array<{
      message: string;
      severity: string;
    }>;
  };
  drn: string;
  akz: string;
  transactionId: string;
  transactionType: string;
  status: 'VERSAND_SUCCESS' | 'VERSAND_ERROR';
  creationTime: string;
}

/** dpmaViewId values for navigation */
export const DPMA_VIEW_IDS = {
  STEP_1_TO_2: 'agents',           // Anmelder → Anwalt/Kanzlei
  STEP_2_TO_3: 'correspondence',   // Anwalt/Kanzlei → Zustelladresse (discovered via Chrome DevTools)
  STEP_3_TO_4: 'trademark',        // Zustelladresse → Marke (discovered via Chrome DevTools)
  STEP_4_TO_5: 'wdvz',             // Marke → WDVZ
  STEP_5_TO_6: 'priorities',       // WDVZ → Sonstiges
  STEP_6_TO_7: 'payment',          // Sonstiges → Zahlung
  STEP_7_TO_8: 'submit',           // Zahlung → Zusammenfassung
} as const;

/** Country codes with German names */
export const COUNTRY_CODES: Record<string, string> = {
  'DE': 'Deutschland',
  'AT': 'Österreich',
  'CH': 'Schweiz',
  'FR': 'Frankreich',
  'IT': 'Italien',
  'ES': 'Spanien',
  'NL': 'Niederlande',
  'BE': 'Belgien',
  'PL': 'Polen',
  'GB': 'Vereinigtes Königreich',
  'US': 'Vereinigte Staaten',
  // Add more as needed
};
