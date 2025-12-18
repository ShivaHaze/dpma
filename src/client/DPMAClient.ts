/**
 * DPMA Client - Handles all HTTP communication with the DPMA website
 * Manages session state, form submissions, and document downloads
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as cheerio from 'cheerio';
import FormData from 'form-data';
import AdmZip from 'adm-zip';

import {
  DpmaSession,
  JsfTokens,
  TrademarkRegistrationRequest,
  TrademarkRegistrationResult,
  VersandResponse,
  DownloadedDocument,
  ApplicantType,
  TrademarkType,
  PaymentMethod,
  SanctionDeclaration,
  DPMA_VIEW_IDS,
  NaturalPersonApplicant,
  LegalEntityApplicant,
} from '../types/dpma';

/** Base URLs */
const BASE_URL = 'https://direkt.dpma.de';
const EDITOR_PATH = '/DpmaDirektWebEditoren';
const VERSAND_PATH = '/DpmaDirektWebVersand';

/** Request headers for AJAX calls */
const AJAX_HEADERS = {
  'faces-request': 'partial/ajax',
  'X-Requested-With': 'XMLHttpRequest',
  'Accept': 'application/xml, text/xml, */*; q=0.01',
};

/** Standard browser headers */
const BROWSER_HEADERS = {
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
  'sec-ch-ua': '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
};

export class DPMAClient {
  private client: AxiosInstance;
  private cookieJar: CookieJar;
  private session: DpmaSession | null = null;
  private debug: boolean;
  private lastResponseHtml: string = ''; // Store last response for dynamic field extraction
  private baseDir: string;
  private debugDir: string;
  private receiptsDir: string;

  constructor(options: { debug?: boolean; baseDir?: string } = {}) {
    this.debug = options.debug ?? false;
    this.baseDir = options.baseDir ?? process.cwd();
    this.debugDir = `${this.baseDir}/debug`;
    this.receiptsDir = `${this.baseDir}/receipts`;
    this.cookieJar = new CookieJar();

    // Create axios instance with cookie support
    this.client = wrapper(axios.create({
      baseURL: BASE_URL,
      jar: this.cookieJar,
      withCredentials: true,
      headers: BROWSER_HEADERS,
      maxRedirects: 0, // Handle redirects manually for better control
      validateStatus: (status) => status >= 200 && status < 400,
    }));
  }

  private log(message: string, data?: unknown): void {
    if (this.debug) {
      console.log(`[DPMAClient] ${message}`, data ?? '');
    }
  }

  /**
   * Ensure a directory exists, creating it if necessary
   */
  private ensureDir(dir: string): void {
    const fs = require('fs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * Save a debug file (only if debug mode is enabled)
   */
  private saveDebugFile(filename: string, content: string | Buffer): void {
    if (!this.debug) return;
    try {
      const fs = require('fs');
      this.ensureDir(this.debugDir);
      fs.writeFileSync(`${this.debugDir}/${filename}`, content);
      this.log(`Saved debug file: ${filename}`);
    } catch (e) { /* ignore */ }
  }

  /**
   * Save receipt document to receipts folder
   * Returns the file path where the receipt was saved
   */
  saveReceipt(aktenzeichen: string, document: DownloadedDocument): string {
    const fs = require('fs');
    this.ensureDir(this.receiptsDir);

    // Create filename from aktenzeichen (sanitize for filesystem)
    const safeAkz = aktenzeichen.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${safeAkz}_${document.filename}`;
    const filepath = `${this.receiptsDir}/${filename}`;

    fs.writeFileSync(filepath, document.data);
    this.log(`Saved receipt: ${filepath}`);

    return filepath;
  }

  /**
   * Extract JSF tokens from HTML response
   */
  private extractTokens(html: string, jfwidFallback?: string): JsfTokens {
    const $ = cheerio.load(html);

    // Extract ViewState - try multiple possible selectors
    let viewState = $('input[name="jakarta.faces.ViewState"]').val() as string;
    if (!viewState) {
      viewState = $('input[id$="ViewState"]').val() as string;
    }
    if (!viewState) {
      // Try to find in script tags or as data attribute
      const match = html.match(/jakarta\.faces\.ViewState['"]\s*(?:value|:)\s*['"]([^'"]+)/);
      if (match) {
        viewState = match[1];
      }
    }
    if (!viewState) {
      this.log('HTML content (first 2000 chars):', html.substring(0, 2000));
      throw new Error('Failed to extract jakarta.faces.ViewState from HTML');
    }

    // Extract ClientWindow (from hidden input or URL)
    // Note: ClientWindow INCLUDES the counter suffix (e.g., "uuid:0")
    let clientWindow = $('input[name="jakarta.faces.ClientWindow"]').val() as string;
    if (!clientWindow) {
      // Try data attribute on form
      clientWindow = $('form').attr('data-client-window') as string;
    }
    if (!clientWindow && jfwidFallback) {
      // Use fallback - include :0 if not already present
      clientWindow = jfwidFallback.includes(':') ? jfwidFallback : `${jfwidFallback}:0`;
    }
    if (!clientWindow && this.session?.jfwid) {
      // session.jfwid is base jfwid, add :0 for initial form
      clientWindow = `${this.session.jfwid}:0`;
    }
    if (!clientWindow) {
      throw new Error('Failed to extract jakarta.faces.ClientWindow');
    }

    // Extract PrimeFaces nonce - the nonce is added dynamically by JavaScript
    // It's passed to PrimeFaces.csp.init('...') in a script tag
    let primefacesNonce = '';

    // Method 1: Extract from PrimeFaces.csp.init() call
    const cspInitMatch = html.match(/PrimeFaces\.csp\.init\(['"]([^'"]+)['"]\)/);
    if (cspInitMatch) {
      primefacesNonce = cspInitMatch[1];
      this.log('Extracted nonce from PrimeFaces.csp.init():', primefacesNonce.substring(0, 20) + '...');
    }

    // Method 2: Try from hidden input (in case page structure changes)
    if (!primefacesNonce) {
      primefacesNonce = $('input[name="primefaces.nonce"]').val() as string || '';
    }

    // Method 3: Extract from script tag nonce attribute
    if (!primefacesNonce) {
      const scriptNonceMatch = html.match(/<script[^>]+nonce=["']([^"']+)["']/);
      if (scriptNonceMatch) {
        primefacesNonce = scriptNonceMatch[1];
        this.log('Extracted nonce from script tag attribute:', primefacesNonce.substring(0, 20) + '...');
      }
    }

    if (!primefacesNonce) {
      this.log('WARNING: primefaces.nonce not found in HTML');
      primefacesNonce = '';
    }

    return { viewState, clientWindow, primefacesNonce };
  }

  /**
   * Extract jfwid from URL or response
   */
  private extractJfwid(url: string): string {
    const match = url.match(/jfwid=([^&:]+(?::\d+)?)/);
    if (!match) {
      throw new Error(`Failed to extract jfwid from URL: ${url}`);
    }
    return match[1];
  }

  /**
   * Build the form URL with current session parameters
   * The jfwid in the URL must match the jakarta.faces.ClientWindow value
   */
  private buildFormUrl(): string {
    if (!this.session) {
      throw new Error('Session not initialized');
    }
    // Use the ClientWindow value which includes the correct counter suffix
    // The URL jfwid must match jakarta.faces.ClientWindow in the form data
    const clientWindow = this.session.tokens.clientWindow;
    return `${EDITOR_PATH}/w7005/w7005web.xhtml?jftfdi=&jffi=w7005&jfwid=${clientWindow}`;
  }

  /**
   * Create multipart form data with standard AJAX fields (for file uploads)
   */
  private createFormData(fields: Record<string, string>): FormData {
    const form = new FormData();

    // Add all fields
    for (const [key, value] of Object.entries(fields)) {
      form.append(key, value);
    }

    return form;
  }

  /**
   * Create URL-encoded body for form submissions (properly handles UTF-8)
   */
  private createUrlEncodedBody(fields: Record<string, string>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(fields)) {
      params.append(key, value);
    }
    return params.toString();
  }

  /**
   * Add standard AJAX navigation fields to form data
   */
  private addNavigationFields(
    fields: Record<string, string>,
    dpmaViewId: string
  ): Record<string, string> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    return {
      ...fields,
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': 'cmd-link-next',
      'jakarta.faces.partial.execute': 'editor-form',
      'jakarta.faces.partial.render': 'editor-form',
      'cmd-link-next': 'cmd-link-next',
      'dpmaViewId': dpmaViewId,
      'dpmaViewCheck': 'true',
      'editor-form': 'editor-form',
      'jakarta.faces.ViewState': this.session.tokens.viewState,
      'jakarta.faces.ClientWindow': this.session.tokens.clientWindow,
      'primefaces.nonce': this.session.tokens.primefacesNonce,
    };
  }

  /**
   * Submit a step and update session state
   */
  private async submitStep(
    fields: Record<string, string>,
    dpmaViewId: string
  ): Promise<string> {
    const allFields = this.addNavigationFields(fields, dpmaViewId);
    const body = this.createUrlEncodedBody(allFields);

    const url = this.buildFormUrl();
    this.log(`Submitting step to ${url} with dpmaViewId=${dpmaViewId}`);

    const response = await this.client.post(url, body, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${url}`,
      },
    });

    // Update step counter
    if (this.session) {
      this.session.stepCounter++;
    }

    // Extract new tokens from response if available
    if (response.data && typeof response.data === 'string') {
      // Store the response HTML for dynamic field extraction
      this.lastResponseHtml = response.data;

      // Save step response for debugging
      const stepNum = this.session?.stepCounter || 0;
      this.saveDebugFile(`step${stepNum + 1}_response.xml`, response.data);

      // Check if this response is an error page - this is CRITICAL
      if (response.data.includes('error.xhtml') || response.data.includes('StatusCode: 500')) {
        const stepNum = (this.session?.stepCounter || 0) + 1;
        this.log(`FATAL ERROR: Step ${stepNum} response contains error page!`);
        this.log(`Check debug_step${stepNum}_response.xml for details`);

        // Extract error message if available
        const errorMatch = response.data.match(/ui-message-error[^>]*>([^<]+)/);
        if (errorMatch) {
          this.log(`Error message: ${errorMatch[1]}`);
        }

        // Extract page title for context
        const titleMatch = response.data.match(/<title>([^<]+)<\/title>/);
        if (titleMatch) {
          this.log(`Page title: ${titleMatch[1]}`);
        }

        throw new Error(`Step ${stepNum} failed: Server returned error page (dpmaViewId=${dpmaViewId}). Check debug_step${stepNum}_response.xml`);
      }

      try {
        // The AJAX response contains updated tokens in CDATA sections
        // Extract ViewState
        const viewStateMatch = response.data.match(/jakarta\.faces\.ViewState[^>]*>(?:<!\[CDATA\[)?([^<\]]+)/);
        if (viewStateMatch && this.session) {
          this.session.tokens.viewState = viewStateMatch[1];
        }

        // Extract ClientWindow - this is critical for URL construction
        // Format: <update id="j_id1:jakarta.faces.ClientWindow:0"><![CDATA[uuid:counter]]></update>
        const clientWindowMatch = response.data.match(/jakarta\.faces\.ClientWindow[^>]*>(?:<!\[CDATA\[)?([^<\]]+)/);
        if (clientWindowMatch && this.session) {
          this.session.tokens.clientWindow = clientWindowMatch[1];
          this.log(`Updated ClientWindow: ${clientWindowMatch[1]}`);
        }
      } catch {
        // Token extraction from AJAX response is optional
      }
    }

    return response.data;
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Initialize a new session with DPMA
   * This performs the initial navigation to get cookies and tokens
   */
  async initSession(): Promise<void> {
    this.log('Initializing session...');

    // Step 1: Load main page
    const mainPageResponse = await this.client.get(`${EDITOR_PATH}/index.xhtml`, {
      headers: BROWSER_HEADERS,
    });
    this.log('Loaded main page');

    // Step 2: Navigate to trademark start page
    // This will redirect to a URL with jfwid parameter
    let jfwid: string | null = null;

    // First request - expect 302 redirect
    const startPageResponse = await this.client.get(`${EDITOR_PATH}/w7005-start.xhtml`, {
      headers: {
        ...BROWSER_HEADERS,
        'Referer': `${BASE_URL}${EDITOR_PATH}/index.xhtml`,
      },
      maxRedirects: 0, // Don't follow automatically
      validateStatus: (status) => status === 200 || status === 302,
    });

    // Check if we got a redirect
    if (startPageResponse.status === 302) {
      const location = startPageResponse.headers.location as string;
      this.log('Redirect received from start page', location);

      // Try to extract jfwid from redirect location
      const jfwidMatch = location.match(/jfwid=([^&:]+(?::\d+)?)/);
      if (jfwidMatch) {
        jfwid = jfwidMatch[1];
        this.log('Extracted jfwid from redirect:', jfwid);

        // Follow the redirect manually
        await this.client.get(location.startsWith('http') ? location : `${BASE_URL}${location}`, {
          headers: {
            ...BROWSER_HEADERS,
            'Referer': `${BASE_URL}${EDITOR_PATH}/index.xhtml`,
          },
        });
      }
    }

    // If no redirect, try to extract from final URL or HTML content
    if (!jfwid) {
      // Try to extract from HTML content (hidden form fields or JavaScript)
      const htmlContent = startPageResponse.data as string;
      const jfwidInHtml = htmlContent.match(/jfwid[=:]([^&"'\s]+)/);
      if (jfwidInHtml) {
        jfwid = jfwidInHtml[1];
        this.log('Extracted jfwid from HTML:', jfwid);
      }
    }

    if (!jfwid) {
      throw new Error('Failed to extract jfwid from session initialization');
    }

    // The jfwid includes a server-assigned counter (e.g., "uuid:4")
    // We must use this exact value - the counter is NOT always 0!
    this.log(`Extracted jfwid: ${jfwid}`);

    // Step 3: Start the trademark application (navigate to web form)
    // Use the exact jfwid from the redirect - do NOT modify the counter
    const formUrl = `${EDITOR_PATH}/w7005/w7005web.xhtml?jftfdi=&jffi=w7005&jfwid=${jfwid}`;
    const formResponse = await this.client.get(formUrl, {
      headers: {
        ...BROWSER_HEADERS,
        'Referer': `${BASE_URL}${EDITOR_PATH}/w7005-start.xhtml?jfwid=${jfwid}`,
      },
    });

    // Debug: Log HTML content to understand structure
    const formHtml = formResponse.data as string;
    this.log('Form page received, length:', formHtml.length);

    // Check if we got the actual form page or an error/redirect page
    if (formHtml.includes('editor-form') || formHtml.includes('daf-applicant')) {
      this.log('Form page contains expected elements');
    } else {
      this.log('WARNING: Form page might not be the expected page');
      this.log('Page title:', formHtml.match(/<title>([^<]+)<\/title>/)?.[1] || 'unknown');
    }

    // Debug: Save HTML to file for inspection
    this.saveDebugFile('form.html', formHtml);

    // Extract tokens from the form page
    // Pass the full jfwid (with counter) as fallback for ClientWindow extraction
    const tokens = this.extractTokens(formHtml, jfwid);
    this.log('Extracted tokens', {
      viewState: tokens.viewState.substring(0, 20) + '...',
      clientWindow: tokens.clientWindow,
      nonce: tokens.primefacesNonce ? tokens.primefacesNonce.substring(0, 10) + '...' : '(empty)',
    });

    // Initialize session state
    // Store the base UUID (without counter) for reference, but ClientWindow in tokens has the full value
    const baseJfwid = jfwid.split(':')[0];
    this.session = {
      jfwid: baseJfwid,
      stepCounter: 0,
      tokens,
    };

    this.log('Session initialized successfully');
  }

  /**
   * Step 1: Submit applicant information (Anmelder)
   */
  async submitApplicant(request: TrademarkRegistrationRequest): Promise<void> {
    this.log('Step 1: Submitting applicant information...');

    const { applicant, sanctions } = request;
    const fields: Record<string, string> = {};

    if (applicant.type === ApplicantType.NATURAL) {
      const natural = applicant as NaturalPersonApplicant;
      fields['daf-applicant:addressEntityType'] = 'natural';
      if (natural.salutation) {
        fields['daf-applicant:namePrefix:valueHolder_input'] = natural.salutation;
      }
      fields['daf-applicant:lastName:valueHolder'] = natural.lastName;
      fields['daf-applicant:firstName:valueHolder'] = natural.firstName;
      if (natural.nameSuffix) {
        fields['daf-applicant:nameSuffix:valueHolder'] = natural.nameSuffix;
      }
      fields['daf-applicant:street:valueHolder'] = natural.address.street;
      if (natural.address.addressLine1) {
        fields['daf-applicant:addressLine1:valueHolder'] = natural.address.addressLine1;
      }
      if (natural.address.addressLine2) {
        fields['daf-applicant:addressLine2:valueHolder'] = natural.address.addressLine2;
      }
      fields['daf-applicant:zip:valueHolder'] = natural.address.zip;
      fields['daf-applicant:city:valueHolder'] = natural.address.city;
      fields['daf-applicant:country:valueHolder_input'] = natural.address.country;
    } else {
      const legal = applicant as LegalEntityApplicant;
      fields['daf-applicant:addressEntityType'] = 'legal';
      // For legal entities, company name goes into lastName field (Firmenname)
      fields['daf-applicant:lastName:valueHolder'] = legal.companyName;
      // Legal form goes into namePrefix field (Rechtsform/Gesellschaftsform)
      // This is an editable dropdown with TWO inputs: _input (select) and _editableInput (text)
      if (legal.legalForm) {
        // Map common abbreviations to full DPMA dropdown values
        const legalFormMap: Record<string, string> = {
          'GmbH': 'Gesellschaft mit beschränkter Haftung (GmbH)',
          'AG': 'Aktiengesellschaft (AG)',
          'UG': 'Unternehmergesellschaft, haftungsbeschränkt (UG)',
          'KG': 'Kommanditgesellschaft (KG)',
          'OHG': 'Offene Handelsgesellschaft (oHG)',
          'oHG': 'Offene Handelsgesellschaft (oHG)',
          'GbR': 'Gesellschaft bürgerlichen Rechts (GbR)',
          'eG': 'eingetragene Genossenschaft (eG)',
          'eV': 'eingetragener Verein (eV)',
          'e.V.': 'eingetragener Verein (eV)',
          'SE': 'europäische Gesellschaft (SE)',
          'KGaA': 'Kommanditgesellschaft auf Aktien (KGaA)',
          'PartG': 'Partnerschaftsgesellschaft (PartG)',
          'PartGmbB': 'Partnerschaftsgesellschaft mit beschränkter Berufshaftung (PartGmbB)',
        };
        const mappedForm = legalFormMap[legal.legalForm] || legal.legalForm;
        // Set both the hidden select AND the visible editable input
        fields['daf-applicant:namePrefix:valueHolder_input'] = mappedForm;
        fields['daf-applicant:namePrefix:valueHolder_editableInput'] = mappedForm;
      }
      fields['daf-applicant:street:valueHolder'] = legal.address.street;
      if (legal.address.addressLine1) {
        fields['daf-applicant:addressLine1:valueHolder'] = legal.address.addressLine1;
      }
      if (legal.address.addressLine2) {
        fields['daf-applicant:addressLine2:valueHolder'] = legal.address.addressLine2;
      }
      fields['daf-applicant:zip:valueHolder'] = legal.address.zip;
      fields['daf-applicant:city:valueHolder'] = legal.address.city;
      fields['daf-applicant:country:valueHolder_input'] = legal.address.country;
    }

    // Sanctions declaration
    fields['daf-applicant:daf-declaration:nationalitySanctionLine'] =
      sanctions.hasRussianNationality ? SanctionDeclaration.TRUE : SanctionDeclaration.FALSE;
    fields['daf-applicant:daf-declaration:residenceSanctionLine'] =
      sanctions.hasRussianResidence ? SanctionDeclaration.TRUE : SanctionDeclaration.FALSE;
    fields['daf-applicant:daf-declaration:evidenceProofCheckbox_input'] = 'on';
    fields['daf-applicant:daf-declaration:changesProofCheckbox_input'] = 'on';

    await this.submitStep(fields, DPMA_VIEW_IDS.STEP_1_TO_2);
    this.log('Step 1 completed');
  }

  /**
   * Step 2: Skip lawyer/law firm (Anwalt/Kanzlei)
   */
  async skipLawyer(): Promise<void> {
    this.log('Step 2: Skipping lawyer information...');
    await this.submitStep({}, DPMA_VIEW_IDS.STEP_2_TO_3);
    this.log('Step 2 completed');
  }

  /**
   * Step 3: Submit delivery address (Zustelladresse)
   *
   * This step uses the "Adresse übernehmen" dropdown to copy from the applicant.
   * This is the simplest and most reliable approach as discovered via Chrome DevTools.
   *
   * Supports two modes:
   * 1. If deliveryAddress is provided and copyFromApplicant is NOT true → use deliveryAddress (manual fill)
   * 2. Otherwise → copy from applicant via dropdown selection (recommended)
   */
  async submitDeliveryAddress(request: TrademarkRegistrationRequest): Promise<void> {
    this.log('Step 3: Submitting delivery address...');

    const { applicant, email, deliveryAddress } = request;

    // Determine if we should use a separate delivery address or copy from applicant
    const useDeliveryAddress = deliveryAddress && !deliveryAddress.copyFromApplicant;

    if (useDeliveryAddress) {
      // Manual fill mode - use provided delivery address
      await this.submitDeliveryAddressManual(request);
    } else {
      // Copy from applicant mode - use dropdown to auto-populate
      await this.submitDeliveryAddressFromApplicant(request);
    }

    this.log('Step 3 completed');
  }

  /**
   * Submit delivery address by copying from applicant via dropdown
   * This triggers the "Adresse übernehmen" dropdown to auto-populate fields
   */
  private async submitDeliveryAddressFromApplicant(request: TrademarkRegistrationRequest): Promise<void> {
    const { applicant, email } = request;

    // Construct the dropdown value based on applicant type
    // Format: "1 Anmelder {Name} " where Name is company name or last name
    // IMPORTANT: The DPMA dropdown values have a trailing space!
    let applicantName: string;
    if (applicant.type === ApplicantType.NATURAL) {
      const natural = applicant as NaturalPersonApplicant;
      applicantName = natural.lastName;
    } else {
      const legal = applicant as LegalEntityApplicant;
      applicantName = legal.companyName;
    }
    // Note the trailing space - this matches the DPMA dropdown option value exactly
    const dropdownValue = `1 Anmelder ${applicantName} `;

    this.log(`Step 3: Selecting applicant from dropdown: "${dropdownValue}"`);

    // Step 1: Trigger dropdown change to select the applicant
    // This auto-populates all address fields from the applicant data
    await this.triggerDeliveryAddressDropdown(dropdownValue);

    // Step 2: Submit the form with ALL fields
    // Even though dropdown auto-populates, we must include all fields in submission
    // because the form submission needs complete data
    const address = applicant.address;

    const fields: Record<string, string> = {
      'dpmaViewItemIndex': '0',
      'daf-correspondence:address-ref-combo-a:valueHolder_input': dropdownValue,
      'daf-correspondence:addressEntityType': applicant.type === ApplicantType.NATURAL ? 'natural' : 'legal',
      'daf-correspondence:street:valueHolder': address.street,
      'daf-correspondence:addressLine1:valueHolder': address.addressLine1 || '',
      'daf-correspondence:addressLine2:valueHolder': address.addressLine2 || '',
      'daf-correspondence:mailbox:valueHolder': '',
      'daf-correspondence:zip:valueHolder': address.zip,
      'daf-correspondence:city:valueHolder': address.city,
      'daf-correspondence:country:valueHolder_input': address.country, // ISO code like "DE"
      'daf-correspondence:phone:valueHolder': '',
      'daf-correspondence:fax:valueHolder': '',
      'daf-correspondence:email:valueHolder': email,
      'editorPanel_active': 'null',
    };

    // Add name fields based on entity type
    if (applicant.type === ApplicantType.NATURAL) {
      const natural = applicant as NaturalPersonApplicant;
      fields['daf-correspondence:lastName:valueHolder'] = natural.lastName;
      fields['daf-correspondence:firstName:valueHolder'] = natural.firstName;
      if (natural.salutation) {
        fields['daf-correspondence:namePrefix:valueHolder_input'] = natural.salutation;
        fields['daf-correspondence:namePrefix:valueHolder_editableInput'] = natural.salutation;
      } else {
        fields['daf-correspondence:namePrefix:valueHolder_focus'] = '';
        fields['daf-correspondence:namePrefix:valueHolder_input'] = '';
        fields['daf-correspondence:namePrefix:valueHolder_editableInput'] = ' ';
      }
      fields['daf-correspondence:nameSuffix:valueHolder'] = '';
    } else {
      const legal = applicant as LegalEntityApplicant;
      // For legal entity, company name goes into lastName field
      fields['daf-correspondence:lastName:valueHolder'] = legal.companyName;
      // Legal form goes into namePrefix editable dropdown
      if (legal.legalForm) {
        const legalFormMap: Record<string, string> = {
          'GmbH': 'Gesellschaft mit beschränkter Haftung (GmbH)',
          'AG': 'Aktiengesellschaft (AG)',
          'UG': 'Unternehmergesellschaft, haftungsbeschränkt (UG)',
          'KG': 'Kommanditgesellschaft (KG)',
          'OHG': 'Offene Handelsgesellschaft (oHG)',
          'oHG': 'Offene Handelsgesellschaft (oHG)',
          'GbR': 'Gesellschaft bürgerlichen Rechts (GbR)',
          'eG': 'eingetragene Genossenschaft (eG)',
          'eV': 'eingetragener Verein (eV)',
          'e.V.': 'eingetragener Verein (eV)',
          'SE': 'europäische Gesellschaft (SE)',
        };
        const mappedForm = legalFormMap[legal.legalForm] || legal.legalForm;
        fields['daf-correspondence:namePrefix:valueHolder_input'] = mappedForm;
        fields['daf-correspondence:namePrefix:valueHolder_editableInput'] = mappedForm;
      } else {
        fields['daf-correspondence:namePrefix:valueHolder_focus'] = '';
        fields['daf-correspondence:namePrefix:valueHolder_input'] = '';
        fields['daf-correspondence:namePrefix:valueHolder_editableInput'] = ' ';
      }
    }

    this.log(`Step 3: Using applicant address via dropdown (${applicant.type})`);
    await this.submitStep(fields, DPMA_VIEW_IDS.STEP_3_TO_4);
  }

  /**
   * Trigger the delivery address dropdown change to copy from applicant
   */
  private async triggerDeliveryAddressDropdown(dropdownValue: string): Promise<void> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    this.log(`Triggering delivery address dropdown with value: ${dropdownValue}`);

    const fields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': 'daf-correspondence:address-ref-combo-a:valueHolder',
      'jakarta.faces.behavior.event': 'change',
      'jakarta.faces.partial.execute': 'editor-form',
      'jakarta.faces.partial.render': 'editor-form',
      'daf-correspondence:address-ref-combo-a:valueHolder_input': dropdownValue,
      'editor-form': 'editor-form',
      'dpmaViewItemIndex': '0',
      'editorPanel_active': 'null',
      'jakarta.faces.ViewState': this.session.tokens.viewState,
      'jakarta.faces.ClientWindow': this.session.tokens.clientWindow,
      'primefaces.nonce': this.session.tokens.primefacesNonce,
    };

    const body = this.createUrlEncodedBody(fields);
    const url = this.buildFormUrl();

    const response = await this.client.post(url, body, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${url}`,
      },
    });

    // Update tokens from response
    if (response.data && typeof response.data === 'string') {
      this.lastResponseHtml = response.data;
      this.saveDebugFile('delivery_address_dropdown.xml', response.data);
      this.updateTokensFromResponse(response.data);
    }

    this.log('Delivery address dropdown change triggered successfully');
  }

  /**
   * Submit delivery address with manual field entry (for custom delivery addresses)
   *
   * IMPORTANT: Field names discovered via Chrome DevTools:
   * - For legal entities: Company name uses lastName field (same pattern as applicant)
   * - Legal form uses namePrefix editable dropdown (same pattern as applicant)
   */
  private async submitDeliveryAddressManual(request: TrademarkRegistrationRequest): Promise<void> {
    const { deliveryAddress } = request;

    if (!deliveryAddress) {
      throw new Error('deliveryAddress is required for manual mode');
    }

    const entityType = deliveryAddress.type;
    const address = deliveryAddress.address;
    const contactEmail = deliveryAddress.contact.email;
    const contactPhone = deliveryAddress.contact.telephone || '';
    const contactFax = deliveryAddress.contact.fax || '';

    // First, trigger a radio button change to set entity type (required for form to show correct fields)
    await this.triggerDeliveryAddressEntityTypeChange(entityType);

    // Build delivery address fields - must match browser exactly
    const fields: Record<string, string> = {
      'dpmaViewItemIndex': '0',
      'daf-correspondence:address-ref-combo-a:valueHolder_input': 'Neue Adresse',
      'daf-correspondence:addressEntityType': entityType === 'natural' ? 'natural' : 'legal',
      'daf-correspondence:street:valueHolder': address.street,
      'daf-correspondence:addressLine1:valueHolder': address.addressLine1 || '',
      'daf-correspondence:addressLine2:valueHolder': address.addressLine2 || '',
      'daf-correspondence:mailbox:valueHolder': '',
      'daf-correspondence:zip:valueHolder': address.zip,
      'daf-correspondence:city:valueHolder': address.city,
      'daf-correspondence:country:valueHolder_input': address.country,
      'daf-correspondence:phone:valueHolder': contactPhone,
      'daf-correspondence:fax:valueHolder': contactFax,
      'daf-correspondence:email:valueHolder': contactEmail,
      'editorPanel_active': 'null',
    };

    // Add name fields based on entity type
    // IMPORTANT: Field names are same structure as applicant form!
    if (entityType === 'natural') {
      // Natural person: lastName, firstName, optional salutation
      fields['daf-correspondence:lastName:valueHolder'] = deliveryAddress.lastName;
      fields['daf-correspondence:firstName:valueHolder'] = deliveryAddress.firstName || '';
      fields['daf-correspondence:nameSuffix:valueHolder'] = '';
      if (deliveryAddress.salutation) {
        fields['daf-correspondence:namePrefix:valueHolder_input'] = deliveryAddress.salutation;
        fields['daf-correspondence:namePrefix:valueHolder_editableInput'] = deliveryAddress.salutation;
      } else {
        fields['daf-correspondence:namePrefix:valueHolder_focus'] = '';
        fields['daf-correspondence:namePrefix:valueHolder_input'] = '';
        fields['daf-correspondence:namePrefix:valueHolder_editableInput'] = ' ';
      }
    } else {
      // Legal entity: Company name goes into lastName field (Firmenname)
      // Legal form goes into namePrefix editable dropdown (Rechtsform)
      fields['daf-correspondence:lastName:valueHolder'] = deliveryAddress.companyName || '';

      if (deliveryAddress.legalForm) {
        // Map common abbreviations to full DPMA dropdown values
        const legalFormMap: Record<string, string> = {
          'GmbH': 'Gesellschaft mit beschränkter Haftung (GmbH)',
          'AG': 'Aktiengesellschaft (AG)',
          'UG': 'Unternehmergesellschaft, haftungsbeschränkt (UG)',
          'KG': 'Kommanditgesellschaft (KG)',
          'OHG': 'Offene Handelsgesellschaft (oHG)',
          'oHG': 'Offene Handelsgesellschaft (oHG)',
          'GbR': 'Gesellschaft bürgerlichen Rechts (GbR)',
          'eG': 'eingetragene Genossenschaft (eG)',
          'eV': 'eingetragener Verein (eV)',
          'e.V.': 'eingetragener Verein (eV)',
          'SE': 'europäische Gesellschaft (SE)',
        };
        const mappedForm = legalFormMap[deliveryAddress.legalForm] || deliveryAddress.legalForm;
        fields['daf-correspondence:namePrefix:valueHolder_input'] = mappedForm;
        fields['daf-correspondence:namePrefix:valueHolder_editableInput'] = mappedForm;
      } else {
        fields['daf-correspondence:namePrefix:valueHolder_focus'] = '';
        fields['daf-correspondence:namePrefix:valueHolder_input'] = '';
        fields['daf-correspondence:namePrefix:valueHolder_editableInput'] = ' ';
      }
    }

    this.log(`Step 3: Using separate delivery address (${entityType})`);
    await this.submitStep(fields, DPMA_VIEW_IDS.STEP_3_TO_4);
  }

  /**
   * Trigger entity type change for delivery address form
   * This ensures the correct form fields are displayed
   */
  private async triggerDeliveryAddressEntityTypeChange(entityType: string): Promise<void> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    const radioValue = entityType === 'natural' ? 'natural' : 'legal';
    this.log(`Triggering delivery address entity type change: ${radioValue}`);

    const fields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': 'daf-correspondence:addressEntityType',
      'jakarta.faces.behavior.event': 'change',
      'jakarta.faces.partial.execute': 'editor-form',
      'jakarta.faces.partial.render': 'editor-form',
      'daf-correspondence:addressEntityType': radioValue,
      'daf-correspondence:address-ref-combo-a:valueHolder_input': 'Neue Adresse',
      'editor-form': 'editor-form',
      'dpmaViewItemIndex': '0',
      'editorPanel_active': 'null',
      'jakarta.faces.ViewState': this.session.tokens.viewState,
      'jakarta.faces.ClientWindow': this.session.tokens.clientWindow,
      'primefaces.nonce': this.session.tokens.primefacesNonce,
    };

    const body = this.createUrlEncodedBody(fields);
    const url = this.buildFormUrl();

    const response = await this.client.post(url, body, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${url}`,
      },
    });

    if (response.data && typeof response.data === 'string') {
      this.lastResponseHtml = response.data;
      this.saveDebugFile('delivery_entity_type_change.xml', response.data);
      this.updateTokensFromResponse(response.data);
    }

    this.log('Delivery address entity type change triggered successfully');
  }

  /**
   * Convert ISO country code to German display name
   */
  private getCountryDisplayName(countryCode: string): string {
    const countryMap: Record<string, string> = {
      'DE': 'Deutschland',
      'AT': 'Österreich',
      'CH': 'Schweiz',
      'FR': 'Frankreich',
      'IT': 'Italien',
      'ES': 'Spanien',
      'NL': 'Niederlande',
      'BE': 'Belgien',
      'PL': 'Polen',
      'GB': 'Großbritannien',
      'US': 'Vereinigte Staaten von Amerika',
    };
    return countryMap[countryCode] || countryCode;
  }

  /**
   * Trigger a PrimeFaces dropdown change event (required before form submission)
   * This simulates the browser behavior when selecting from a dropdown
   */
  private async triggerDropdownChange(
    dropdownId: string,
    value: string,
    additionalFields?: Record<string, string>
  ): Promise<void> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    this.log(`Triggering dropdown change for ${dropdownId} with value: ${value}`);

    const fields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': dropdownId,
      'jakarta.faces.behavior.event': 'change',
      'jakarta.faces.partial.execute': 'editor-form',
      'jakarta.faces.partial.render': 'editor-form',
      [`${dropdownId}_input`]: value,
      'editor-form': 'editor-form',
      'editorPanel_active': 'null',
      'jakarta.faces.ViewState': this.session.tokens.viewState,
      'jakarta.faces.ClientWindow': this.session.tokens.clientWindow,
      'primefaces.nonce': this.session.tokens.primefacesNonce,
      ...additionalFields,
    };

    const body = this.createUrlEncodedBody(fields);
    const url = this.buildFormUrl();

    const response = await this.client.post(url, body, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${url}`,
      },
    });

    // Update tokens from response
    if (response.data && typeof response.data === 'string') {
      this.lastResponseHtml = response.data;

      // Save debug output
      this.saveDebugFile('dropdown_change.xml', response.data);

      // Extract updated tokens
      const viewStateMatch = response.data.match(/jakarta\.faces\.ViewState[^>]*>(?:<!\[CDATA\[)?([^<\]]+)/);
      if (viewStateMatch && this.session) {
        this.session.tokens.viewState = viewStateMatch[1];
      }

      const clientWindowMatch = response.data.match(/jakarta\.faces\.ClientWindow[^>]*>(?:<!\[CDATA\[)?([^<\]]+)/);
      if (clientWindowMatch && this.session) {
        this.session.tokens.clientWindow = clientWindowMatch[1];
        this.log(`Updated ClientWindow after dropdown change: ${clientWindowMatch[1]}`);
      }

      // Extract new nonce if present
      const nonceMatch = response.data.match(/PrimeFaces\.csp\.init\(['"]([^'"]+)['"]\)/);
      if (nonceMatch && this.session) {
        this.session.tokens.primefacesNonce = nonceMatch[1];
        this.log(`Updated nonce after dropdown change: ${nonceMatch[1]}`);
      }
    }

    this.log('Dropdown change event triggered successfully');
  }

  /**
   * Upload an image file for image/combined trademarks
   *
   * This method handles the PrimeFaces file upload mechanism:
   * 1. Navigate to the upload page by clicking "Bilddatei hinzufügen" button
   * 2. POST the image file via multipart/form-data
   * 3. Confirm the upload
   */
  private async uploadTrademarkImage(imageData: Buffer, mimeType: string, fileName: string): Promise<void> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    this.log(`Uploading trademark image: ${fileName} (${mimeType}, ${imageData.length} bytes)`);

    // Step 1: Navigate to the upload page by triggering the upload button
    // This is done via AJAX call that opens the upload dialog
    const uploadButtonFields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': 'editor-form:mark-image:markAttachmentsPanelAdd',
      'jakarta.faces.partial.execute': '@all',
      'jakarta.faces.partial.render': '@all',
      'editor-form:mark-image:markAttachmentsPanelAdd': 'editor-form:mark-image:markAttachmentsPanelAdd',
      'editor-form': 'editor-form',
      'dpmaViewItemIndex': '0',
      'jakarta.faces.ViewState': this.session.tokens.viewState,
      'jakarta.faces.ClientWindow': this.session.tokens.clientWindow,
      'primefaces.nonce': this.session.tokens.primefacesNonce,
    };

    const uploadDialogUrl = this.buildFormUrl();
    const uploadDialogBody = this.createUrlEncodedBody(uploadButtonFields);

    const uploadDialogResponse = await this.client.post(uploadDialogUrl, uploadDialogBody, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${uploadDialogUrl}`,
      },
    });

    // Extract tokens from response
    if (uploadDialogResponse.data && typeof uploadDialogResponse.data === 'string') {
      this.lastResponseHtml = uploadDialogResponse.data;
      this.saveDebugFile('upload_dialog.xml', uploadDialogResponse.data);
      this.updateTokensFromResponse(uploadDialogResponse.data);
    }

    // Step 2: Upload the actual file via multipart/form-data
    // The upload endpoint is w7005-upload.xhtml
    // IMPORTANT: Use full ClientWindow value (with counter suffix), not base jfwid
    const uploadUrl = `${EDITOR_PATH}/w7005/w7005-upload.xhtml?jfwid=${this.session.tokens.clientWindow}`;

    // Create form data for file upload
    const formData = new FormData();
    formData.append('mainupload:webUpload', 'mainupload:webUpload');
    formData.append('mainupload:webUpload:screenSizeForCalculation', '1296');
    formData.append('jakarta.faces.ViewState', this.session.tokens.viewState);
    formData.append('jakarta.faces.ClientWindow', this.session.tokens.clientWindow);
    formData.append('primefaces.nonce', this.session.tokens.primefacesNonce);

    // Ensure the file is a JPG (DPMA only accepts .jpg)
    let uploadBuffer = imageData;
    let uploadFileName = fileName;
    if (!fileName.toLowerCase().endsWith('.jpg') && !fileName.toLowerCase().endsWith('.jpeg')) {
      // If not a JPG, assume it's been converted and just rename
      uploadFileName = fileName.replace(/\.[^.]+$/, '.jpg');
    }

    formData.append('mainupload:webUpload:webFileUpload_input', uploadBuffer, {
      filename: uploadFileName,
      contentType: 'image/jpeg',
    });

    this.log(`Uploading to ${uploadUrl}...`);

    const uploadResponse = await this.client.post(uploadUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'Referer': `${BASE_URL}${uploadUrl}`,
      },
    });

    this.saveDebugFile('upload_response.html', uploadResponse.data);

    // Extract updated tokens from the upload response
    if (uploadResponse.data && typeof uploadResponse.data === 'string') {
      this.lastResponseHtml = uploadResponse.data;
      this.updateTokensFromResponse(uploadResponse.data);

      // Check for upload errors
      if (uploadResponse.data.includes('Fehler') || uploadResponse.data.includes('error')) {
        this.log('Warning: Upload response may contain errors');
      }
    }

    this.log('Image upload completed successfully');
  }

  /**
   * Helper to update tokens from AJAX/HTML response
   */
  private updateTokensFromResponse(responseData: string): void {
    if (!this.session) return;

    // Extract ViewState
    const viewStateMatch = responseData.match(/jakarta\.faces\.ViewState[^>]*>(?:<!\[CDATA\[)?([^<\]]+)/);
    if (viewStateMatch) {
      this.session.tokens.viewState = viewStateMatch[1];
    }

    // Extract ClientWindow
    const clientWindowMatch = responseData.match(/jakarta\.faces\.ClientWindow[^>]*>(?:<!\[CDATA\[)?([^<\]]+)/);
    if (clientWindowMatch) {
      this.session.tokens.clientWindow = clientWindowMatch[1];
    }

    // Extract nonce
    const nonceMatch = responseData.match(/PrimeFaces\.csp\.init\(['"]([^'"]+)['"]\)/);
    if (nonceMatch) {
      this.session.tokens.primefacesNonce = nonceMatch[1];
    }
  }

  /**
   * Step 4: Submit trademark information (Marke)
   *
   * IMPORTANT: PrimeFaces dropdowns require a change event to be triggered
   * before the form can properly validate. We must:
   * 1. First trigger the dropdown change event (simulates selecting from dropdown)
   * 2. For image marks: upload the image file
   * 3. Then submit the full form with the trademark data
   */
  async submitTrademark(request: TrademarkRegistrationRequest): Promise<void> {
    this.log('Step 4: Submitting trademark information...');

    const { trademark } = request;

    // Determine the dropdown value based on trademark type
    let dropdownValue: string;
    let requiresImageUpload = false;

    switch (trademark.type) {
      case TrademarkType.WORD:
        dropdownValue = 'word';
        break;
      case TrademarkType.FIGURATIVE:
        dropdownValue = 'image';
        requiresImageUpload = true;
        break;
      case TrademarkType.COMBINED:
        dropdownValue = 'figurative';
        requiresImageUpload = true;
        break;
      case TrademarkType.THREE_DIMENSIONAL:
        dropdownValue = 'spatial';
        requiresImageUpload = true;
        break;
      case TrademarkType.COLOR:
        throw new Error('Color trademark not yet implemented');
      case TrademarkType.SOUND:
        throw new Error('Sound trademark not yet implemented');
      case TrademarkType.POSITION:
        throw new Error('Position trademark not yet implemented');
      case TrademarkType.PATTERN:
        throw new Error('Pattern trademark not yet implemented');
      case TrademarkType.MOTION:
        throw new Error('Motion trademark not yet implemented');
      case TrademarkType.MULTIMEDIA:
        throw new Error('Multimedia trademark not yet implemented');
      case TrademarkType.HOLOGRAM:
        throw new Error('Hologram trademark not yet implemented');
      case TrademarkType.THREAD:
        throw new Error('Thread trademark (Kennfadenmarke) not yet implemented');
      case TrademarkType.OTHER:
        throw new Error('Other trademark type not yet implemented');
    }

    // STEP 4a: First trigger the dropdown change event
    // This is CRITICAL - PrimeFaces needs this to properly register the selection
    await this.triggerDropdownChange('markFeatureCombo:valueHolder', dropdownValue, {
      'dpmaViewItemIndex': '0',
    });

    // STEP 4b: For image marks, upload the image file
    if (requiresImageUpload) {
      if (!('imageData' in trademark) || !trademark.imageData) {
        throw new Error(`Image data is required for ${trademark.type} trademark`);
      }
      await this.uploadTrademarkImage(
        trademark.imageData,
        trademark.imageMimeType,
        trademark.imageFileName
      );
    }

    // STEP 4c: Now submit the full form with the trademark data
    const trademarkText = trademark.type === TrademarkType.WORD ? trademark.text : '';
    const fields: Record<string, string> = {
      'dpmaViewItemIndex': '0',
      'editorPanel_active': 'null',
      'markFeatureCombo:valueHolder_input': dropdownValue,
      'mark-verbalText:valueHolder': trademarkText,
      'mark-docRefNumber:valueHolder': request.internalReference || '',
    };

    // Add color elements if specified
    if (trademark.colorElements && trademark.colorElements.length > 0) {
      fields['mark-colorElementsHiddenCheckbox_input'] = 'on';
      fields['mark-colorElements:valueHolder'] = trademark.colorElements.join(', ');
    }

    // Add non-Latin characters flag if specified
    if (trademark.hasNonLatinCharacters) {
      fields['mark-nonLatinCharactersCheckBox_input'] = 'on';
    }

    // Add trademark description if specified
    if (trademark.description) {
      fields['mark-description:valueHolder'] = trademark.description;
    }

    await this.submitStep(fields, DPMA_VIEW_IDS.STEP_4_TO_5);
    this.log('Step 4 completed');
  }

  /**
   * Trigger a Nice class checkbox change event via AJAX
   * This is CRITICAL - the checkbox selection must trigger an AJAX call
   * to register the selection and populate the lead class dropdown
   */
  private async triggerCheckboxChange(checkboxId: string): Promise<void> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    // The checkbox ID format is: tmclassEditorGt:tmclassNode_9:j_idt2281:selectBox_input
    // But for the change event source, we need: tmclassEditorGt:tmclassNode_9:j_idt2281:selectBox
    const selectBoxId = checkboxId.replace('_input', '');

    this.log(`Triggering checkbox change for ${selectBoxId}`);

    const fields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': selectBoxId,
      'jakarta.faces.behavior.event': 'change',
      'jakarta.faces.partial.execute': selectBoxId,
      'jakarta.faces.partial.render': `${selectBoxId} @(.termViewCol) @(.tmClassEditorSelected) @(.leadingClassCombo) @(.hintSelectGroup)`,
      [checkboxId]: 'on',
      'editor-form': 'editor-form',
      'jakarta.faces.ViewState': this.session.tokens.viewState,
      'jakarta.faces.ClientWindow': this.session.tokens.clientWindow,
      'primefaces.nonce': this.session.tokens.primefacesNonce,
    };

    const body = this.createUrlEncodedBody(fields);
    const url = this.buildFormUrl();

    const response = await this.client.post(url, body, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${url}`,
      },
    });

    // Update tokens from response
    if (response.data && typeof response.data === 'string') {
      this.lastResponseHtml = response.data;

      // Save debug output
      this.saveDebugFile('checkbox_change.xml', response.data);

      // Extract updated tokens
      const viewStateMatch = response.data.match(/jakarta\.faces\.ViewState[^>]*>(?:<!\[CDATA\[)?([^<\]]+)/);
      if (viewStateMatch && this.session) {
        this.session.tokens.viewState = viewStateMatch[1];
      }

      const clientWindowMatch = response.data.match(/jakarta\.faces\.ClientWindow[^>]*>(?:<!\[CDATA\[)?([^<\]]+)/);
      if (clientWindowMatch && this.session) {
        this.session.tokens.clientWindow = clientWindowMatch[1];
      }

      // Extract new nonce if present
      const nonceMatch = response.data.match(/PrimeFaces\.csp\.init\(['"]([^'"]+)['"]\)/);
      if (nonceMatch && this.session) {
        this.session.tokens.primefacesNonce = nonceMatch[1];
      }
    }

    this.log('Checkbox change event triggered successfully');
  }

  /**
   * Step 5: Submit Nice classification (WDVZ - Waren und Dienstleistungen)
   *
   * This is complex because Nice class checkboxes have dynamic IDs.
   * We need to:
   * 1. Expand each class to load its subcategories
   * 2. Find the checkbox IDs from the AJAX response
   * 3. TRIGGER CHECKBOX CHANGE EVENTS (this populates the lead class dropdown!)
   * 4. Submit the form with lead class selected
   */
  async submitNiceClasses(request: TrademarkRegistrationRequest): Promise<void> {
    this.log('Step 5: Submitting Nice classification...');

    const { niceClasses, leadClass } = request;

    if (!this.session) {
      throw new Error('Session not initialized');
    }

    // Set lead class (defaults to first selected class)
    const effectiveLeadClass = leadClass ?? niceClasses[0]?.classNumber ?? 9;

    // Collect all checkbox IDs
    const selectedCheckboxIds: string[] = [];

    // Process each Nice class selection
    for (const niceClass of niceClasses) {
      const classNum = niceClass.classNumber;
      const hasSpecificTerms = niceClass.terms && niceClass.terms.length > 0;
      const selectHeader = niceClass.selectClassHeader ?? !hasSpecificTerms;

      this.log(`Processing Nice class ${classNum}...`);
      this.log(`  - Has specific terms: ${hasSpecificTerms}`);
      this.log(`  - Select class header: ${selectHeader}`);

      try {
        if (hasSpecificTerms) {
          // ========================================================
          // TERM-BASED SELECTION: Search and select specific terms
          // ========================================================
          this.log(`Selecting ${niceClass.terms!.length} specific terms for class ${classNum}...`);

          const termCheckboxIds = await this.selectNiceTermsBySearch(niceClass.terms!);
          selectedCheckboxIds.push(...termCheckboxIds);

          this.log(`Successfully selected ${termCheckboxIds.length}/${niceClass.terms!.length} terms`);
        }

        if (selectHeader || !hasSpecificTerms) {
          // ========================================================
          // CLASS HEADER SELECTION: Select the entire class header
          // ========================================================
          this.log(`Selecting class header for class ${classNum}...`);

          // Step 1: Expand the class tree to load subcategories
          const expandResponse = await this.expandNiceClass(classNum);

          // Step 2: Parse the response to find checkbox IDs
          const checkboxId = this.findFirstCheckboxId(expandResponse, classNum);

          if (checkboxId) {
            this.log(`Found checkbox for class ${classNum}: ${checkboxId}`);
            selectedCheckboxIds.push(checkboxId);

            // CRITICAL: Trigger the checkbox change event!
            // This registers the selection server-side and populates the lead class dropdown
            await this.triggerCheckboxChange(checkboxId);
          } else {
            this.log(`Warning: Could not find checkbox for class ${classNum}, trying alternative method...`);

            // Alternative: Try to select at class level (group header)
            const classCheckboxId = await this.findClassLevelCheckbox(classNum);
            if (classCheckboxId) {
              selectedCheckboxIds.push(classCheckboxId);
              await this.triggerCheckboxChange(classCheckboxId);
              this.log(`Using class-level checkbox: ${classCheckboxId}`);
            } else {
              this.log(`Warning: No checkbox found for class ${classNum}`);
            }
          }
        }
      } catch (error: any) {
        this.log(`Error processing class ${classNum}: ${error.message}`);
        // Continue with other classes
      }
    }

    // Build the final form fields - include all selected checkboxes
    const fields: Record<string, string> = {};
    for (const checkboxId of selectedCheckboxIds) {
      fields[checkboxId] = 'on';
    }
    fields['tmclassEditorGt:leadingClassCombo_input'] = String(effectiveLeadClass);

    this.log(`Submitting Nice classes with ${selectedCheckboxIds.length} selections`);
    this.log('Selected checkboxes:', selectedCheckboxIds);

    await this.submitStep(fields, DPMA_VIEW_IDS.STEP_5_TO_6);
    this.log('Step 5 completed');
  }

  /**
   * Expand a Nice class tree node to load its subcategories
   */
  private async expandNiceClass(classNumber: number): Promise<string> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    const url = this.buildFormUrl();

    // PrimeFaces tree expand request - use correct button ID discovered from live form
    const expandButtonId = `tmclassEditorGt:tmclassNode_${classNumber}:iconExpandedState`;
    const expandFields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': expandButtonId,
      'jakarta.faces.partial.execute': expandButtonId,
      'jakarta.faces.partial.render': 'tmclassEditorGt',
      'jakarta.faces.behavior.event': 'action',
      [expandButtonId]: expandButtonId,
      'editor-form': 'editor-form',
      'jakarta.faces.ViewState': this.session.tokens.viewState,
      'jakarta.faces.ClientWindow': this.session.tokens.clientWindow,
      'primefaces.nonce': this.session.tokens.primefacesNonce,
    };

    const body = this.createUrlEncodedBody(expandFields);

    const response = await this.client.post(url, body, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${url}`,
      },
    });

    // Update ViewState if present in response
    if (response.data && typeof response.data === 'string') {
      const viewStateMatch = response.data.match(/jakarta\.faces\.ViewState[^>]*>(?:<!\[CDATA\[)?([^<\]]+)/);
      if (viewStateMatch) {
        this.session.tokens.viewState = viewStateMatch[1];
      }
    }

    return response.data;
  }

  /**
   * Find the first checkbox ID from an expanded class response
   */
  private findFirstCheckboxId(htmlResponse: string, classNumber: number): string | null {
    // Look for checkbox input patterns in the AJAX response
    // Pattern: tmclassEditorGt:tmclassNode_X:j_idtNNN:selectBox_input
    const patterns = [
      // Standard checkbox pattern
      new RegExp(`(tmclassEditorGt:tmclassNode_${classNumber}:[^:]+:selectBox_input)`, 'g'),
      // Alternative pattern with different structure
      new RegExp(`(tmclassEditorGt:[^"']*tmclassNode[^"']*${classNumber}[^"']*selectBox[^"']*)`, 'g'),
      // Input name pattern
      new RegExp(`name="(tmclassEditorGt:[^"]*:selectBox_input)"`, 'g'),
    ];

    for (const pattern of patterns) {
      const matches = htmlResponse.match(pattern);
      if (matches && matches.length > 0) {
        // Clean up the match - extract just the field name
        let fieldName = matches[0];
        if (fieldName.startsWith('name="')) {
          fieldName = fieldName.replace('name="', '').replace('"', '');
        }
        return fieldName;
      }
    }

    // Also try to find any ui-chkbox elements with IDs
    const checkboxIdPattern = /id="([^"]*tmclassNode[^"]*checkbox[^"]*)"/gi;
    const idMatches = htmlResponse.match(checkboxIdPattern);
    if (idMatches && idMatches.length > 0) {
      // Convert the ID to an input name
      const id = idMatches[0].replace('id="', '').replace('"', '');
      // PrimeFaces convention: checkbox input is usually ID + "_input"
      return id.replace('_checkbox', ':selectBox_input');
    }

    return null;
  }

  /**
   * Try to find a class-level checkbox (selects the entire class header)
   */
  private async findClassLevelCheckbox(classNumber: number): Promise<string | null> {
    // The class-level selection might use a different pattern
    // Try common patterns for selecting an entire class
    const possibleIds = [
      `tmclassEditorGt:tmclassNode_${classNumber}:selectBox_input`,
      `tmclassEditorGt:tmclassEditorTree:${classNumber - 1}:selectBox_input`,
      `tmclassEditorGt:classSelect_${classNumber}_input`,
    ];

    // For now, return the most likely pattern
    // In production, we'd need to parse the actual page HTML
    return possibleIds[0];
  }

  /**
   * Search for Nice class terms using the DPMA search functionality
   * This allows finding terms by name rather than relying on dynamic IDs
   */
  private async searchNiceTerms(searchQuery: string): Promise<string> {
    if (!this.session) {
      throw new Error('Session not initialized');
    }

    const url = this.buildFormUrl();

    // Search request - discovered via Chrome DevTools network capture
    // The correct source is tmclassEditorGt:searchWDVZ (NOT tmClassEditorCenterSearchButton)
    const searchFields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': 'tmclassEditorGt:searchWDVZ',
      'jakarta.faces.partial.execute': 'tmclassEditorGt',
      'jakarta.faces.partial.render': 'tmclassEditorGt:nodeTreeAndTermView',
      'tmclassEditorGt:searchWDVZ': 'tmclassEditorGt:searchWDVZ',
      'editor-form': 'editor-form',
      'tmclassEditorGt:tmClassEditorCenterSearchPhrase': searchQuery,
      'tmclassEditorGt:j_idt932_active': 'null',
      'editorPanel_active': 'null',
      'jakarta.faces.ViewState': this.session.tokens.viewState,
      'jakarta.faces.ClientWindow': this.session.tokens.clientWindow,
      'primefaces.nonce': this.session.tokens.primefacesNonce,
    };

    const body = this.createUrlEncodedBody(searchFields);

    this.log(`Searching Nice terms for: "${searchQuery}"`);

    const response = await this.client.post(url, body, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${url}`,
      },
    });

    // Update ViewState if present in response
    if (response.data && typeof response.data === 'string') {
      const viewStateMatch = response.data.match(/jakarta\.faces\.ViewState[^>]*>(?:<!\[CDATA\[)?([^<\]]+)/);
      if (viewStateMatch) {
        this.session.tokens.viewState = viewStateMatch[1];
      }

      // Debug: Save search response
      if (this.debug) {
        this.saveDebugFile(`search_${searchQuery.replace(/[^a-zA-Z0-9]/g, '_')}.xml`, response.data);
      }
    }

    return response.data;
  }

  /**
   * Find checkbox IDs matching specific term names from the AJAX response
   * Returns a map of term name -> checkbox ID
   *
   * DPMA HTML Structure discovered via Chrome DevTools:
   * - Links have: id="tmclassEditorGt:...:termViewLink" title="Term Name"
   * - Checkbox ID is: same prefix with selectBox_input instead of termViewLink
   * Example:
   *   Link: id="tmclassEditorGt:tmclassNode_9:j_idt2344:j_idt7316:j_idt8952:termViewLink" title="Anwendungssoftware"
   *   Checkbox: name="tmclassEditorGt:tmclassNode_9:j_idt2344:j_idt7316:j_idt8952:selectBox_input"
   */
  private findCheckboxesByTermNames(htmlResponse: string, termNames: string[]): Map<string, string> {
    const results = new Map<string, string>();

    // Primary pattern: Find links with termViewLink in ID and title attribute
    // id="(prefix):termViewLink"... title="Term Name"
    const termViewLinkPattern = /id="(tmclassEditorGt:[^"]+):termViewLink"[^>]*title="([^"]+)"/g;

    let match;
    while ((match = termViewLinkPattern.exec(htmlResponse)) !== null) {
      const prefix = match[1];
      const title = match[2];

      // Check if this title matches any of the requested terms
      for (const termName of termNames) {
        if (title === termName || title.startsWith(termName)) {
          // Derive checkbox ID from the prefix
          const checkboxId = `${prefix}:selectBox_input`;
          results.set(termName, checkboxId);
          this.log(`Found checkbox for term "${termName}": ${checkboxId}`);
          break;
        }
      }
    }

    // Alternative pattern: Sometimes the title might be escaped or have different attribute order
    // title="Term Name"... id="(prefix):termViewLink"
    const altPattern = /title="([^"]+)"[^>]*id="(tmclassEditorGt:[^"]+):termViewLink"/g;
    while ((match = altPattern.exec(htmlResponse)) !== null) {
      const title = match[1];
      const prefix = match[2];

      for (const termName of termNames) {
        if (!results.has(termName) && (title === termName || title.startsWith(termName))) {
          const checkboxId = `${prefix}:selectBox_input`;
          results.set(termName, checkboxId);
          this.log(`Found checkbox (alt) for term "${termName}": ${checkboxId}`);
          break;
        }
      }
    }

    // Debug: Log what we found in the response if no results
    if (results.size === 0 && termNames.length > 0) {
      this.log('DEBUG: No term checkboxes found. Looking for termViewLink patterns...');
      const debugPattern = /id="(tmclassEditorGt:[^"]+:termViewLink)"[^>]*title="([^"]{0,50})"/g;
      let count = 0;
      while ((match = debugPattern.exec(htmlResponse)) !== null && count < 5) {
        this.log(`  Found link: ${match[1]} -> "${match[2]}"`);
        count++;
      }
    }

    return results;
  }

  /**
   * Select Nice class terms by searching for them and triggering checkbox selection
   * This is the main method for term-based selection
   */
  private async selectNiceTermsBySearch(terms: string[]): Promise<string[]> {
    const selectedCheckboxIds: string[] = [];

    // Group terms that might be found with a single search
    // For efficiency, we batch similar terms
    for (const term of terms) {
      this.log(`Searching for term: "${term}"...`);

      try {
        // Search for the term
        const searchResponse = await this.searchNiceTerms(term);

        // Find the checkbox ID matching this term
        const checkboxMap = this.findCheckboxesByTermNames(searchResponse, [term]);

        if (checkboxMap.has(term)) {
          const checkboxId = checkboxMap.get(term)!;
          selectedCheckboxIds.push(checkboxId);

          // Trigger the checkbox selection
          await this.triggerCheckboxChange(checkboxId);
          this.log(`Selected term "${term}" with checkbox: ${checkboxId}`);
        } else {
          this.log(`Warning: Could not find checkbox for term "${term}"`);

          // Try a partial match - expand the class and look for the term
          const partialMatch = this.findPartialMatchCheckbox(searchResponse, term);
          if (partialMatch) {
            selectedCheckboxIds.push(partialMatch);
            await this.triggerCheckboxChange(partialMatch);
            this.log(`Selected term "${term}" with partial match: ${partialMatch}`);
          }
        }
      } catch (error: any) {
        this.log(`Error selecting term "${term}": ${error.message}`);
      }
    }

    return selectedCheckboxIds;
  }

  /**
   * Try to find a checkbox by partial term match in the response
   * Uses termViewLink pattern to find links and derive checkbox IDs
   */
  private findPartialMatchCheckbox(htmlResponse: string, termName: string): string | null {
    // Normalize the term name for matching
    const normalizedTerm = termName.toLowerCase();

    // Look for termViewLink with title containing the term
    const pattern = /id="(tmclassEditorGt:[^"]+):termViewLink"[^>]*title="([^"]+)"/g;

    let match;
    while ((match = pattern.exec(htmlResponse)) !== null) {
      const prefix = match[1];
      const title = match[2].toLowerCase();

      if (title.includes(normalizedTerm)) {
        // Derive checkbox ID from prefix
        return `${prefix}:selectBox_input`;
      }
    }

    return null;
  }

  /**
   * Extract dynamic JSF field IDs from HTML response
   * These are fields like j_idt9679:j_idt9684:itemsPanel_active that change per session
   *
   * Example HTML structure from DPMA:
   * <input id="j_idt9679:j_idt9684:itemsPanel_active" name="j_idt9679:j_idt9684:itemsPanel_active" type="hidden" autocomplete="off" value="-1">
   */
  private extractDynamicFields(html: string): Record<string, string> {
    const dynamicFields: Record<string, string> = {};

    // Pattern 1: Match the exact format seen in Chrome DevTools
    // <input id="..." name="j_idt...:itemsPanel_active" type="hidden" ... value="...">
    const exactPattern = /id="(j_idt\d+[^"]*:itemsPanel_active)"[^>]*name="([^"]+)"[^>]*value="([^"]*)"/g;
    let match;
    while ((match = exactPattern.exec(html)) !== null) {
      const fieldName = match[2];
      const fieldValue = match[3] || '-1';
      dynamicFields[fieldName] = fieldValue;
      this.log(`Found dynamic field (exact): ${fieldName} = ${fieldValue}`);
    }

    // Pattern 2: Match with name first, then value (different attribute order)
    const nameFirstPattern = /name="(j_idt\d+[^"]*:itemsPanel_active)"[^>]*value="([^"]*)"/g;
    while ((match = nameFirstPattern.exec(html)) !== null) {
      const fieldName = match[1];
      const fieldValue = match[2] || '-1';
      if (!dynamicFields[fieldName]) {
        dynamicFields[fieldName] = fieldValue;
        this.log(`Found dynamic field (nameFirst): ${fieldName} = ${fieldValue}`);
      }
    }

    // Pattern 3: Match with value before name (another possible order)
    const valueFirstPattern = /value="([^"]*)"[^>]*name="(j_idt\d+[^"]*:itemsPanel_active)"/g;
    while ((match = valueFirstPattern.exec(html)) !== null) {
      const fieldName = match[2];
      const fieldValue = match[1] || '-1';
      if (!dynamicFields[fieldName]) {
        dynamicFields[fieldName] = fieldValue;
        this.log(`Found dynamic field (valueFirst): ${fieldName} = ${fieldValue}`);
      }
    }

    // Pattern 4: Look in CDATA sections (JSF AJAX responses wrap content in CDATA)
    const cdataPattern = /<!\[CDATA\[[\s\S]*?(?:name|id)="(j_idt\d+[^"]*:itemsPanel_active)"[^>]*value="([^"]*)"/g;
    while ((match = cdataPattern.exec(html)) !== null) {
      const fieldName = match[1];
      const fieldValue = match[2] || '-1';
      if (!dynamicFields[fieldName]) {
        dynamicFields[fieldName] = fieldValue;
        this.log(`Found dynamic field (CDATA): ${fieldName} = ${fieldValue}`);
      }
    }

    // If no itemsPanel_active fields found, log warning but don't fail
    if (Object.keys(dynamicFields).length === 0) {
      this.log('WARNING: No dynamic j_idt*:itemsPanel_active fields found in response');
      // Debug: Log first 1000 chars containing j_idt pattern
      const jidtMatches = html.match(/j_idt\d+[^"']*/g);
      if (jidtMatches) {
        this.log('Found j_idt patterns:', jidtMatches.slice(0, 10).join(', '));
      }
    }

    return dynamicFields;
  }

  /**
   * Step 6: Submit additional options (Sonstiges)
   */
  async submitOptions(request: TrademarkRegistrationRequest): Promise<void> {
    this.log('Step 6: Submitting additional options...');

    const fields: Record<string, string> = {};
    const { options } = request;

    if (options) {
      if (options.acceleratedExamination) {
        fields['acceleratedExamination:valueHolder_input'] = 'on';
        this.log('Accelerated examination requested');
      }
      if (options.certificationMark) {
        fields['mark-certification-chkbox:valueHolder_input'] = 'on';
        this.log('Certification mark requested');
      }
      if (options.licensingDeclaration) {
        fields['mark-licenseIndicator-chkbox:valueHolder_input'] = 'on';
        this.log('Licensing declaration requested');
      }
      if (options.saleDeclaration) {
        fields['mark-dispositionIndicator-chkbox:valueHolder_input'] = 'on';
        this.log('Sale declaration requested');
      }
    }

    await this.submitStep(fields, DPMA_VIEW_IDS.STEP_6_TO_7);
    this.log('Step 6 completed');
  }

  /**
   * Step 7: Submit payment method (Zahlung)
   * This navigates to Step 8 (summary page) where the final submission form is rendered
   */
  async submitPayment(request: TrademarkRegistrationRequest): Promise<void> {
    this.log('Step 7: Submitting payment information...');

    const fields: Record<string, string> = {
      'paymentForm:paymentTypeSelectOneRadio': request.paymentMethod,
    };

    if (request.paymentMethod === PaymentMethod.SEPA_DIRECT_DEBIT && request.sepaDetails) {
      // SEPA fields - exact names TBD
      this.log('SEPA details provided (field names TBD)');
    }

    const responseHtml = await this.submitStep(fields, DPMA_VIEW_IDS.STEP_7_TO_8);
    this.log('Step 7 completed');

    // Debug: Save Step 7 response (which should be Step 8 page)
    this.saveDebugFile('step7_payment_response.xml', responseHtml);
    if (this.debug) {
      this.log('Step 7 response length:', responseHtml.length);
      if (responseHtml.includes('itemsPanel')) {
        this.log('Step 7 response CONTAINS "itemsPanel"');
      } else {
        this.log('Step 7 response does NOT contain "itemsPanel"');
      }
    }
  }

  /**
   * Step 8: Final submission (Zusammenfassung)
   * Returns the encrypted transaction ID for the Versand service
   */
  async submitFinal(request: TrademarkRegistrationRequest): Promise<string> {
    this.log('Step 8: Final submission...');

    if (!this.session) {
      throw new Error('Session not initialized');
    }

    // Get the sender name for confirmation
    let senderName: string;
    if (request.applicant.type === ApplicantType.NATURAL) {
      const natural = request.applicant as NaturalPersonApplicant;
      senderName = `${natural.firstName} ${natural.lastName}`;
    } else {
      const legal = request.applicant as LegalEntityApplicant;
      senderName = legal.companyName;
    }

    const fields: Record<string, string> = {
      'chBoxConfirmText_input': 'on',
      'applicantNameTextField:valueHolder': senderName,
    };

    // Extract dynamic JSF field IDs from the Step 7 response (summary page HTML)
    // These are fields like j_idt9679:j_idt9684:itemsPanel_active that change per session
    const dynamicFields = this.extractDynamicFields(this.lastResponseHtml);
    this.log(`Extracted ${Object.keys(dynamicFields).length} dynamic fields from Step 7 response`);

    // Build the final submission request
    // Field names discovered via Chrome DevTools MCP walkthrough
    const allFields = {
      ...fields,
      ...dynamicFields, // Include the dynamic JSF fields
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': 'btnSubmitRegistration',
      'jakarta.faces.partial.execute': '@all',
      'jakarta.faces.partial.render': 'editor-form',
      'btnSubmitRegistration': 'btnSubmitRegistration',
      'editor-form': 'editor-form',
      'editorPanel_active': 'null',
      'jakarta.faces.ViewState': this.session.tokens.viewState,
      'jakarta.faces.ClientWindow': this.session.tokens.clientWindow,
      'primefaces.nonce': this.session.tokens.primefacesNonce,
    };

    const body = this.createUrlEncodedBody(allFields);
    const url = this.buildFormUrl();

    this.log('Sending final submission...');

    // This request will redirect to the Versand service
    // Note: With maxRedirects: 0 and validateStatus accepting 302,
    // the redirect will be returned as a normal response, NOT thrown as error
    const response = await this.client.post(url, body, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${url}`,
      },
      maxRedirects: 0,
    });

    // Check if we got a 302 redirect (this is the expected path)
    if (response.status === 302) {
      const location = response.headers.location as string;
      this.log('Redirect received (302)', location);

      const match = location.match(/transactionId=([^&]+)/);
      if (match) {
        const encryptedTransactionId = decodeURIComponent(match[1]);
        this.session.encryptedTransactionId = encryptedTransactionId;
        this.log('Extracted encrypted transaction ID from redirect');
        return encryptedTransactionId;
      }
      throw new Error('302 redirect received but no transactionId in location header');
    }

    // If not a redirect, check for transaction ID in response body
    // This can happen if the response contains a JavaScript redirect or meta refresh
    if (typeof response.data === 'string') {
      // Look for transactionId in various formats
      const patterns = [
        /transactionId=([^&"'\s]+)/,
        /transactionId['"]\s*:\s*['"]([^'"]+)/,
        /flowReturn\.xhtml\?[^"']*transactionId=([^&"']+)/,
      ];

      for (const pattern of patterns) {
        const match = response.data.match(pattern);
        if (match) {
          const encryptedTransactionId = decodeURIComponent(match[1]);
          this.session.encryptedTransactionId = encryptedTransactionId;
          this.log('Extracted encrypted transaction ID from response body');
          return encryptedTransactionId;
        }
      }
    }

    this.log('Response status:', response.status);
    this.log('Response headers:', response.headers);
    this.log('Response data (first 500 chars):', typeof response.data === 'string' ? response.data.substring(0, 500) : response.data);

    // Save full response for debugging
    if (typeof response.data === 'string') {
      this.saveDebugFile('step8_final_response.xml', response.data);

      if (this.debug) {
        // Check for validation errors in the response
        if (response.data.includes('ui-message-error') || response.data.includes('ui-messages-error')) {
          this.log('VALIDATION ERRORS DETECTED in response');
          const errorMatch = response.data.match(/ui-message-error[^>]*>([^<]+)/g);
          if (errorMatch) {
            this.log('Error messages:', errorMatch);
          }
        }

        // Check if the page title indicates we're still on the form
        const titleMatch = response.data.match(/<title>([^<]+)<\/title>/);
        if (titleMatch) {
          this.log('Page title:', titleMatch[1]);
        }
      }
    }

    throw new Error(`Failed to get transaction ID from final submission (status: ${response.status})`);
  }

  /**
   * Complete the submission via the Versand service
   */
  async completeVersand(encryptedTransactionId: string): Promise<VersandResponse> {
    this.log('Completing submission via Versand service...');

    // Step 1: Load the Versand page (Vue.js app)
    const versandUrl = `${VERSAND_PATH}/index.html?flowId=w7005&transactionId=${encodeURIComponent(encryptedTransactionId)}`;
    await this.client.get(versandUrl, {
      headers: {
        ...BROWSER_HEADERS,
        'Referer': `${BASE_URL}${EDITOR_PATH}/flowReturn.xhtml`,
      },
    });

    // Step 2: POST to complete the submission (empty body!)
    const submitUrl = `${VERSAND_PATH}/versand?flowId=w7005&transactionId=${encodeURIComponent(encryptedTransactionId)}`;
    const response = await this.client.post(submitUrl, '', {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Length': '0',
        'Origin': BASE_URL,
        'Referer': `${BASE_URL}${versandUrl}`,
      },
    });

    const versandResponse = response.data as VersandResponse;
    this.log('Versand response', versandResponse);

    if (versandResponse.status !== 'VERSAND_SUCCESS') {
      throw new Error(`Versand failed: ${versandResponse.validationResult?.userMessage || 'Unknown error'}`);
    }

    return versandResponse;
  }

  /**
   * Download the receipt documents (returns raw ZIP and extracted documents)
   */
  async downloadDocuments(encryptedTransactionId: string): Promise<{
    zipData: Buffer;
    documents: DownloadedDocument[];
  }> {
    this.log('Downloading receipt documents...');

    const downloadUrl = `${VERSAND_PATH}/versand/anlagen?encryptedTransactionId=${encodeURIComponent(encryptedTransactionId)}`;
    const response = await this.client.get(downloadUrl, {
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Referer': `${BASE_URL}${VERSAND_PATH}/index.html`,
      },
      responseType: 'arraybuffer',
    });

    const zipData = Buffer.from(response.data);
    const documents: DownloadedDocument[] = [];

    // Extract individual files from the ZIP for API response
    try {
      const zip = new AdmZip(zipData);
      const entries = zip.getEntries();

      for (const entry of entries) {
        if (!entry.isDirectory) {
          documents.push({
            filename: entry.entryName,
            data: entry.getData(),
            mimeType: entry.entryName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
          });
          this.log(`Extracted document: ${entry.entryName}`);
        }
      }
    } catch (error) {
      this.log('Failed to extract ZIP contents');
    }

    return { zipData, documents };
  }

  /**
   * Save the complete ZIP file to the receipts folder
   */
  saveReceiptZip(aktenzeichen: string, zipData: Buffer): string {
    const fs = require('fs');
    this.ensureDir(this.receiptsDir);
    const safeAkz = aktenzeichen.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${safeAkz}_documents.zip`;
    const filepath = `${this.receiptsDir}/${filename}`;
    fs.writeFileSync(filepath, zipData);
    this.log(`Saved ZIP archive: ${filepath}`);
    return filepath;
  }

  /**
   * Execute the complete trademark registration process
   */
  async registerTrademark(request: TrademarkRegistrationRequest): Promise<TrademarkRegistrationResult> {
    try {
      // Initialize session
      await this.initSession();

      // Step 1: Applicant
      await this.submitApplicant(request);

      // Step 2: Skip Lawyer
      await this.skipLawyer();

      // Step 3: Delivery Address
      await this.submitDeliveryAddress(request);

      // Step 4: Trademark
      await this.submitTrademark(request);

      // Step 5: Nice Classes
      await this.submitNiceClasses(request);

      // Step 6: Options
      await this.submitOptions(request);

      // Step 7: Payment
      await this.submitPayment(request);

      // Step 8: Final Submit
      const encryptedTransactionId = await this.submitFinal(request);

      // Complete via Versand service
      const versandResponse = await this.completeVersand(encryptedTransactionId);

      // Download documents (ZIP archive)
      const { zipData, documents } = await this.downloadDocuments(encryptedTransactionId);

      // Save the complete ZIP archive to dedicated folder
      let receiptFilePath: string | undefined;
      if (zipData.length > 0) {
        receiptFilePath = this.saveReceiptZip(versandResponse.akz, zipData);
        this.log(`ZIP archive saved to: ${receiptFilePath}`);
      }

      // Build success response
      return {
        success: true,
        aktenzeichen: versandResponse.akz,
        drn: versandResponse.drn,
        transactionId: versandResponse.transactionId,
        submissionTime: versandResponse.creationTime,
        fees: [
          {
            code: '331000',
            description: 'Anmeldeverfahren - bei elektronischer Anmeldung',
            amount: 290.00,
          },
        ],
        payment: {
          method: request.paymentMethod,
          totalAmount: 290.00,
          currency: 'EUR',
          bankDetails: request.paymentMethod === PaymentMethod.BANK_TRANSFER ? {
            recipient: 'Bundeskasse',
            iban: 'DE84 7000 0000 0070 0010 54',
            bic: 'MARKDEF1700',
            reference: versandResponse.akz,
          } : undefined,
        },
        receiptDocuments: documents, // All extracted documents
        receiptFilePath, // Path to saved ZIP file
      };

    } catch (error: any) {
      this.log('Registration failed', error);

      return {
        success: false,
        errorCode: error.code || 'UNKNOWN_ERROR',
        errorMessage: error.message || 'An unknown error occurred',
        failedAtStep: this.session?.stepCounter,
      };
    }
  }
}
