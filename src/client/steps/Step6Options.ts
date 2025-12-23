/**
 * Step6Options - Submit additional options (Sonstiges) including Priority Claims
 *
 * This step handles:
 * - Checkboxes: Accelerated examination, Certification mark, Licensing, Sale declaration
 * - Priority Claims: Foreign Priority (§34 MarkenG), Exhibition Priority (§35 MarkenG)
 *
 * Priority Date Validation Rules (enforced by DPMA server):
 * - Date cannot be in the future
 * - Date cannot be older than 6 months
 * - Format: dd.mm.yyyy (German format)
 */

import {
  TrademarkRegistrationRequest,
  DPMA_VIEW_IDS,
  PriorityClaim,
  ForeignPriorityClaim,
  ExhibitionPriorityClaim,
} from '../../types/dpma';
import { BaseStep } from './BaseStep';
import { AJAX_HEADERS, BASE_URL, createUrlEncodedBody } from '../http';

/** Field IDs for Step 6 main page */
const STEP6_FIELDS = {
  // Checkboxes
  ACCELERATED_EXAMINATION: 'acceleratedExamination:valueHolder_input',
  CERTIFICATION_MARK: 'mark-certification-chkbox:valueHolder_input',
  LICENSING_DECLARATION: 'mark-licenseIndicator-chkbox:valueHolder_input',
  SALE_DECLARATION: 'mark-dispositionIndicator-chkbox:valueHolder_input',

  // Priority buttons (on main Step 6 page)
  BTN_ADD_FOREIGN_PRIORITY: 'tm-priority-comp:btnCallAddPriority1AbroadOnlyFlow',
  BTN_ADD_EXHIBITION_PRIORITY: 'tm-priority-comp:btnCallAddPriority2Flow',
} as const;

/** Field IDs for Priority forms */
const PRIORITY_FIELDS = {
  // Form identifier
  FORM: 'priority:priority-editor-form',

  // Common fields (both priority types)
  DATE: 'priority:priorityDate:valueHolder_input',

  // Foreign Priority specific
  COUNTRY: 'priority:priorityCountry:valueHolder_input',
  APPLICATION_NUMBER: 'priority:appNum:valueHolder',

  // Exhibition Priority specific (note: typo in DPMA's field name)
  EXHIBITION_NAME: 'priority:exhibitonName:valueHolder',

  // Buttons
  BTN_CANCEL: 'priority:btnCancel',
  BTN_SUBMIT: 'priority:btnSubmit',
} as const;

export class Step6Options extends BaseStep {
  async execute(request: TrademarkRegistrationRequest): Promise<void> {
    this.logger.log('Step 6: Submitting additional options...');

    const { options } = request;

    // Step 1: Add priority claims if any
    if (options?.priorityClaims && options.priorityClaims.length > 0) {
      await this.addPriorityClaims(options.priorityClaims);
    }

    // Step 2: Submit main Step 6 form with checkbox options
    const fields: Record<string, string> = {};

    if (options) {
      if (options.acceleratedExamination) {
        fields[STEP6_FIELDS.ACCELERATED_EXAMINATION] = 'on';
        this.logger.log('Accelerated examination requested (+€200)');
      }
      if (options.certificationMark) {
        fields[STEP6_FIELDS.CERTIFICATION_MARK] = 'on';
        this.logger.log('Certification mark (Gewährleistungsmarke) requested');
      }
      if (options.licensingDeclaration) {
        fields[STEP6_FIELDS.LICENSING_DECLARATION] = 'on';
        this.logger.log('Licensing declaration requested');
      }
      if (options.saleDeclaration) {
        fields[STEP6_FIELDS.SALE_DECLARATION] = 'on';
        this.logger.log('Sale declaration requested');
      }
    }

    await this.submitStep(fields, DPMA_VIEW_IDS.STEP_6_TO_7);
    this.logger.log('Step 6 completed');
  }

  /**
   * Add all priority claims
   */
  private async addPriorityClaims(claims: PriorityClaim[]): Promise<void> {
    this.logger.log(`Adding ${claims.length} priority claim(s)...`);

    for (let i = 0; i < claims.length; i++) {
      const claim = claims[i];
      const claimIndex = i + 1;
      this.logger.log(`Processing priority claim ${claimIndex}/${claims.length}: ${claim.type}`);

      // Validate date before submission
      this.validatePriorityDate(claim.date);

      if (claim.type === 'foreign') {
        await this.addForeignPriority(claim, claimIndex);
      } else if (claim.type === 'exhibition') {
        await this.addExhibitionPriority(claim, claimIndex);
      }
    }

    this.logger.log('All priority claims added successfully');
  }

  /**
   * Add a foreign priority claim (Ausländische Priorität - §34 MarkenG)
   */
  private async addForeignPriority(claim: ForeignPriorityClaim, claimIndex: number): Promise<void> {
    this.logger.log(`Adding foreign priority: ${claim.country}, ${claim.date}, ${claim.applicationNumber}`);

    // Step 1: Click the "Add Foreign Priority" button to navigate to the priority page
    await this.clickPriorityButton(STEP6_FIELDS.BTN_ADD_FOREIGN_PRIORITY, `foreign_${claimIndex}`);

    // Step 2: Submit the foreign priority form
    const germanDate = this.formatDateToGerman(claim.date);
    const fields: Record<string, string> = {
      [PRIORITY_FIELDS.DATE]: germanDate,
      [PRIORITY_FIELDS.COUNTRY]: claim.country,
      [PRIORITY_FIELDS.APPLICATION_NUMBER]: claim.applicationNumber,
    };

    await this.submitPriorityForm(fields, `foreign_${claimIndex}`);
    this.logger.log('Foreign priority claim added successfully');
  }

  /**
   * Add an exhibition priority claim (Ausstellungspriorität - §35 MarkenG)
   */
  private async addExhibitionPriority(claim: ExhibitionPriorityClaim, claimIndex: number): Promise<void> {
    this.logger.log(`Adding exhibition priority: ${claim.exhibitionName}, ${claim.date}`);

    // Step 1: Click the "Add Exhibition Priority" button to navigate to the priority page
    await this.clickPriorityButton(STEP6_FIELDS.BTN_ADD_EXHIBITION_PRIORITY, `exhibition_${claimIndex}`);

    // Step 2: Submit the exhibition priority form
    const germanDate = this.formatDateToGerman(claim.date);
    const fields: Record<string, string> = {
      [PRIORITY_FIELDS.DATE]: germanDate,
      [PRIORITY_FIELDS.EXHIBITION_NAME]: claim.exhibitionName,
    };

    await this.submitPriorityForm(fields, `exhibition_${claimIndex}`);
    this.logger.log('Exhibition priority claim added successfully');
  }

  /**
   * Click a priority button to navigate to the priority form page
   * @param buttonId The button element ID to click
   * @param debugLabel Label for debug file naming (e.g., "foreign_1", "exhibition_2")
   */
  private async clickPriorityButton(buttonId: string, debugLabel: string): Promise<void> {
    const tokens = this.session.getTokens();

    this.logger.log(`Clicking priority button: ${buttonId}`);

    const fields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': buttonId,
      'jakarta.faces.partial.execute': '@all',
      'jakarta.faces.partial.render': 'editor-form',
      [buttonId]: buttonId,
      'editor-form': 'editor-form',
      'editorPanel_active': 'null',
      'jakarta.faces.ViewState': tokens.viewState,
      'jakarta.faces.ClientWindow': tokens.clientWindow,
      'primefaces.nonce': tokens.primefacesNonce,
    };

    const body = createUrlEncodedBody(fields);
    const url = this.session.buildFormUrl();

    const response = await this.http.post(url, body, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${url}`,
      },
    });

    // Update tokens and session state
    if (response.data && typeof response.data === 'string') {
      this.session.setLastResponse(response.data);
      this.logger.saveFile(`priority_${debugLabel}_button_click.xml`, response.data);

      // Verify we navigated to the priority form
      if (!response.data.includes('priority:priority-editor-form') &&
          !response.data.includes('priority:priorityDate')) {
        throw new Error(`Failed to navigate to priority form. Button ${buttonId} may not have worked.`);
      }

      const updatedTokens = this.tokenExtractor.updateTokensFromResponse(
        response.data,
        this.session.getTokens()
      );
      this.session.setTokens(updatedTokens);
    }

    this.logger.log('Priority button clicked, navigated to priority form');
  }

  /**
   * Submit the priority form (works for both foreign and exhibition priority)
   * @param priorityFields The form fields specific to the priority type
   * @param debugLabel Label for debug file naming (e.g., "foreign_1", "exhibition_2")
   */
  private async submitPriorityForm(priorityFields: Record<string, string>, debugLabel: string): Promise<void> {
    const tokens = this.session.getTokens();

    this.logger.log('Submitting priority form...');

    const fields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': PRIORITY_FIELDS.BTN_SUBMIT,
      'jakarta.faces.partial.execute': PRIORITY_FIELDS.FORM,
      'jakarta.faces.partial.render': PRIORITY_FIELDS.FORM,
      [PRIORITY_FIELDS.BTN_SUBMIT]: PRIORITY_FIELDS.BTN_SUBMIT,
      [PRIORITY_FIELDS.FORM]: PRIORITY_FIELDS.FORM,
      'dpmaValidateInput': 'true',
      ...priorityFields,
      'jakarta.faces.ViewState': tokens.viewState,
      'jakarta.faces.ClientWindow': tokens.clientWindow,
      'primefaces.nonce': tokens.primefacesNonce,
    };

    const body = createUrlEncodedBody(fields);
    const url = this.session.buildFormUrl();

    const response = await this.http.post(url, body, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${url}`,
      },
    });

    // Check for validation errors and verify success
    if (response.data && typeof response.data === 'string') {
      this.session.setLastResponse(response.data);
      this.logger.saveFile(`priority_${debugLabel}_submit.xml`, response.data);

      // Check for common error messages
      if (response.data.includes('darf nicht in der Zukunft liegen')) {
        throw new Error('Priority date validation failed: Date cannot be in the future');
      }
      if (response.data.includes('nicht älter als')) {
        throw new Error('Priority date validation failed: Date cannot be older than 6 months');
      }
      if (response.data.includes('ui-message-error')) {
        const errorMatch = response.data.match(/ui-message-error[^>]*>([^<]+)/);
        const errorMsg = errorMatch ? errorMatch[1] : 'Unknown validation error';
        throw new Error(`Priority form validation failed: ${errorMsg}`);
      }

      // Verify we returned to Step 6 main page (should see priorities table or add buttons)
      if (!response.data.includes('tm-priority-comp:priorities-table') &&
          !response.data.includes('tm-priority-comp:btnCallAddPriority')) {
        this.logger.log('WARNING: Could not verify return to Step 6 main page after priority submission');
      }

      // Update tokens
      const updatedTokens = this.tokenExtractor.updateTokensFromResponse(
        response.data,
        this.session.getTokens()
      );
      this.session.setTokens(updatedTokens);
    }

    this.logger.log('Priority form submitted successfully');
  }

  /**
   * Convert ISO date string (YYYY-MM-DD) to German format (dd.mm.yyyy)
   */
  private formatDateToGerman(isoDate: string): string {
    // Handle ISO format: YYYY-MM-DD
    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) {
      const [, year, month, day] = match;
      return `${day}.${month}.${year}`;
    }

    // If already in German format, return as-is
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(isoDate)) {
      return isoDate;
    }

    throw new Error(`Invalid date format: ${isoDate}. Expected ISO format (YYYY-MM-DD) or German format (dd.mm.yyyy)`);
  }

  /**
   * Validate priority date against DPMA rules:
   * 1. Date cannot be in the future
   * 2. Date cannot be older than 6 months
   *
   * Uses timezone-safe date parsing to avoid issues with local timezone offsets.
   */
  private validatePriorityDate(isoDate: string): void {
    // Parse ISO date string (YYYY-MM-DD) without timezone conversion
    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      throw new Error(`Invalid priority date format: ${isoDate}. Expected ISO format (YYYY-MM-DD).`);
    }

    const [, yearStr, monthStr, dayStr] = match;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // JS months are 0-indexed
    const day = parseInt(dayStr, 10);

    // Create date at noon UTC to avoid any timezone boundary issues
    const date = new Date(Date.UTC(year, month, day, 12, 0, 0));

    // Get today at noon UTC for comparison
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 12, 0, 0));

    // Check 1: Date cannot be in the future
    if (date > today) {
      throw new Error(
        `Priority date ${isoDate} is in the future. DPMA requires priority dates to be in the past.`
      );
    }

    // Check 2: Date cannot be older than 6 months
    const sixMonthsAgo = new Date(today);
    sixMonthsAgo.setUTCMonth(sixMonthsAgo.getUTCMonth() - 6);

    if (date < sixMonthsAgo) {
      throw new Error(
        `Priority date ${isoDate} is older than 6 months. DPMA requires priority claims within 6 months of the original filing/exhibition date.`
      );
    }

    this.logger.log(`Priority date ${isoDate} validated successfully`);
  }
}
