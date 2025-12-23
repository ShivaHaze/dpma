/**
 * Step4Trademark - Submit trademark information and handle image uploads
 *
 * Image Requirements (DPMA validation):
 * - Format: JPG only (.jpg) - PNG files will be converted but may have color shifts
 * - Minimum size: 945 pixels on at least ONE side (width OR height)
 * - Maximum size: 2835 x 2010 pixels
 *
 * Upload Process:
 * 1. Select trademark type from dropdown (triggers form change)
 * 2. Click "Bilddatei hinzufügen" (btnAddFigureFile) to open upload dialog
 * 3. Upload file via multipart/form-data to w7005-upload.xhtml
 * 4. Click "Übernehmen" (uploadViewApplyButton) to apply the upload
 * 5. Submit form with remaining fields (colors, non-Latin, etc.)
 */

import FormData from 'form-data';
import {
  TrademarkRegistrationRequest,
  TrademarkType,
  DPMA_VIEW_IDS,
} from '../../types/dpma';
import { BaseStep } from './BaseStep';
import { createUrlEncodedBody, AJAX_HEADERS, BASE_URL, EDITOR_PATH } from '../http';

// Image size constants from DPMA validation
const IMAGE_MIN_DIMENSION = 945; // pixels - at least one side must be >= 945px
const IMAGE_MAX_WIDTH = 2835; // pixels
const IMAGE_MAX_HEIGHT = 2010; // pixels

export class Step4Trademark extends BaseStep {
  async execute(request: TrademarkRegistrationRequest): Promise<void> {
    this.logger.log('Step 4: Submitting trademark information...');

    const { trademark } = request;

    // Determine the dropdown value based on trademark type
    let dropdownValue: string;
    let requiresImageUpload = false;

    switch (trademark.type) {
      case TrademarkType.WORD:
        dropdownValue = 'word';
        break;
      case TrademarkType.FIGURATIVE:
        // Bildmarke (pure image mark)
        dropdownValue = 'image';
        requiresImageUpload = true;
        break;
      case TrademarkType.COMBINED:
        // Wort-/Bildmarke (combined word/image mark)
        dropdownValue = 'figurative';
        requiresImageUpload = true;
        break;
      case TrademarkType.THREE_DIMENSIONAL:
        dropdownValue = 'feature3d';
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

    // Step 4a: First trigger the dropdown change event
    await this.triggerDropdownChange('markFeatureCombo:valueHolder', dropdownValue, {
      'dpmaViewItemIndex': '0',
    });

    // Step 4b: For image marks, upload the image file
    if (requiresImageUpload) {
      if (!('imageData' in trademark) || !trademark.imageData) {
        throw new Error(`Image data is required for ${trademark.type} trademark`);
      }
      await this.uploadImage(
        trademark.imageData,
        trademark.imageMimeType,
        trademark.imageFileName,
        dropdownValue
      );
    }

    // Step 4c: Submit the full form with the trademark data
    const fields: Record<string, string> = {
      'dpmaViewItemIndex': '0',
      'editorPanel_active': 'null',
      'markFeatureCombo:valueHolder_input': dropdownValue,
      'mark-docRefNumber:valueHolder': request.internalReference || '',
    };

    // For word marks only: add the verbal text field
    if (trademark.type === TrademarkType.WORD) {
      fields['mark-verbalText:valueHolder'] = trademark.text;
    }

    // For image marks: add color elements and non-Latin character options
    if (requiresImageUpload) {
      // Color elements checkbox and description
      // Note: "mark-blackwhite-chkbox" is misleadingly named - it means "has color elements" (NOT black/white only)
      if (trademark.colorElements && trademark.colorElements.length > 0) {
        fields['mark-blackwhite-chkbox:valueHolder_input'] = 'on';
        // Colors should be common names like "rot", "grün", "blau" - NOT RAL/Pantone codes
        // Include "schwarz" and "weiß" if black/white are part of the colored design
        fields['mark-colorClaimedText:valueHolder'] = trademark.colorElements.join(', ');
      }

      // Non-Latin characters checkbox
      if (trademark.hasNonLatinCharacters) {
        fields['mark-translation-chkbox:valueHolder_input'] = 'on';
      }
    }

    // Add trademark description if specified (only for image marks)
    // Description is submitted via a separate dialog page
    if (requiresImageUpload && trademark.description) {
      await this.addDescription(trademark.description);
    }

    await this.submitStep(fields, DPMA_VIEW_IDS.STEP_4_TO_5);
    this.logger.log('Step 4 completed');
  }

  /**
   * Add a trademark description via the description dialog
   *
   * The description dialog is a separate page (w7005-trademark-description.xhtml)
   * that requires its own form submission.
   *
   * Limits:
   * - Maximum 2000 characters OR 150 words
   *
   * Process:
   * 1. Click "Markenbeschreibung hinzufügen" (btnCallAddOrEditDescription) to open dialog
   * 2. Submit description via markDescForm
   */
  private async addDescription(description: string): Promise<void> {
    // Validate description length
    const MAX_CHARS = 2000;
    const MAX_WORDS = 150;
    const wordCount = description.trim().split(/\s+/).length;

    if (description.length > MAX_CHARS) {
      throw new Error(`Trademark description exceeds maximum length: ${description.length} chars (max ${MAX_CHARS})`);
    }
    if (wordCount > MAX_WORDS) {
      throw new Error(`Trademark description exceeds maximum words: ${wordCount} words (max ${MAX_WORDS})`);
    }

    this.logger.log(`Adding trademark description (${description.length} chars, ${wordCount} words)...`);

    const tokens = this.session.getTokens();

    // Step 1: Open the description dialog by clicking the button
    const openDialogFields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': 'btnCallAddOrEditDescription',
      'jakarta.faces.partial.execute': '@all',
      'jakarta.faces.partial.render': '@all',
      'btnCallAddOrEditDescription': 'btnCallAddOrEditDescription',
      'editor-form': 'editor-form',
      'dpmaViewItemIndex': '0',
      'editorPanel_active': 'null',
      'jakarta.faces.ViewState': tokens.viewState,
      'jakarta.faces.ClientWindow': tokens.clientWindow,
      'primefaces.nonce': tokens.primefacesNonce,
    };

    const formUrl = this.session.buildFormUrl();
    const openDialogBody = createUrlEncodedBody(openDialogFields);

    const openDialogResponse = await this.http.post(formUrl, openDialogBody, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${formUrl}`,
      },
    });

    // Extract tokens from response
    if (openDialogResponse.data && typeof openDialogResponse.data === 'string') {
      this.session.setLastResponse(openDialogResponse.data);
      this.logger.saveFile('description_dialog.xml', openDialogResponse.data);
      const updatedTokens = this.tokenExtractor.updateTokensFromResponse(
        openDialogResponse.data,
        this.session.getTokens()
      );
      this.session.setTokens(updatedTokens);
    }

    // Step 2: Submit the description via the description form
    const descTokens = this.session.getTokens();
    const descriptionUrl = `${EDITOR_PATH}/w7005/w7005-trademark-description.xhtml?jfwid=${descTokens.clientWindow}`;

    const descriptionFields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': 'btnSubmit',
      'jakarta.faces.partial.execute': 'markDescForm',
      'jakarta.faces.partial.render': 'markDescForm',
      'btnSubmit': 'btnSubmit',
      'dpmaValidateInput': 'true',
      'markDescForm': 'markDescForm',
      'mark-description:valueHolder': description,
      'jakarta.faces.ViewState': descTokens.viewState,
      'jakarta.faces.ClientWindow': descTokens.clientWindow,
      'primefaces.nonce': descTokens.primefacesNonce,
    };

    const descriptionBody = createUrlEncodedBody(descriptionFields);

    const descriptionResponse = await this.http.post(descriptionUrl, descriptionBody, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${formUrl}`,
      },
    });

    this.logger.saveFile('description_submit.xml', descriptionResponse.data);

    // Extract final tokens
    if (descriptionResponse.data && typeof descriptionResponse.data === 'string') {
      this.session.setLastResponse(descriptionResponse.data);
      const finalTokens = this.tokenExtractor.updateTokensFromResponse(
        descriptionResponse.data,
        this.session.getTokens()
      );
      this.session.setTokens(finalTokens);
    }

    this.logger.log('Trademark description added successfully');
  }

  /**
   * Upload an image file for image/combined trademarks
   *
   * Process:
   * 1. Click "Bilddatei hinzufügen" (btnAddFigureFile) to open upload dialog
   * 2. Upload file via multipart/form-data with PrimeFaces AJAX
   * 3. Click "Übernehmen" (uploadViewApplyButton) to apply the upload
   *
   * @param imageData - The image file data as a Buffer
   * @param mimeType - The MIME type of the image (will be sent as image/jpeg)
   * @param fileName - The filename (will be converted to .jpg if not already)
   * @param dropdownValue - The trademark type dropdown value (image, figurative, etc.)
   */
  private async uploadImage(
    imageData: Buffer,
    mimeType: string,
    fileName: string,
    dropdownValue: string
  ): Promise<void> {
    const tokens = this.session.getTokens();

    this.logger.log(`Uploading trademark image: ${fileName} (${mimeType}, ${imageData.length} bytes)`);

    // Validate file extension - DPMA only accepts JPG
    let uploadFileName = fileName;
    if (!fileName.toLowerCase().endsWith('.jpg') && !fileName.toLowerCase().endsWith('.jpeg')) {
      this.logger.log(`Warning: Converting filename extension to .jpg (DPMA only accepts JPG files)`);
      uploadFileName = fileName.replace(/\.[^.]+$/, '.jpg');
    }

    // Step 1: Navigate to the upload page by clicking "Bilddatei hinzufügen" button
    this.logger.log('Step 1: Opening upload dialog...');
    const uploadButtonFields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': 'btnAddFigureFile',
      'jakarta.faces.partial.execute': '@all',
      'jakarta.faces.partial.render': '@all',
      'btnAddFigureFile': 'btnAddFigureFile',
      'editor-form': 'editor-form',
      'dpmaViewItemIndex': '0',
      'markFeatureCombo:valueHolder_input': dropdownValue,
      'mark-docRefNumber:valueHolder': '',
      'editorPanel_active': 'null',
      'jakarta.faces.ViewState': tokens.viewState,
      'jakarta.faces.ClientWindow': tokens.clientWindow,
      'primefaces.nonce': tokens.primefacesNonce,
    };

    const formUrl = this.session.buildFormUrl();
    const uploadDialogBody = createUrlEncodedBody(uploadButtonFields);

    const uploadDialogResponse = await this.http.post(formUrl, uploadDialogBody, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${formUrl}`,
      },
    });

    // Extract tokens from response
    if (uploadDialogResponse.data && typeof uploadDialogResponse.data === 'string') {
      this.session.setLastResponse(uploadDialogResponse.data);
      this.logger.saveFile('upload_dialog.xml', uploadDialogResponse.data);
      const updatedTokens = this.tokenExtractor.updateTokensFromResponse(
        uploadDialogResponse.data,
        this.session.getTokens()
      );
      this.session.setTokens(updatedTokens);
    }

    // Step 2: Upload the actual file via multipart/form-data
    this.logger.log('Step 2: Uploading image file...');
    const currentTokens = this.session.getTokens();
    const uploadUrl = `${EDITOR_PATH}/w7005/w7005-upload.xhtml?jfwid=${currentTokens.clientWindow}`;

    // Create form data for file upload (PrimeFaces FileUpload format)
    const formData = new FormData();

    // Form identification
    formData.append('mainupload:webUpload', 'mainupload:webUpload');
    formData.append('mainupload:webUpload:screenSizeForCalculation', '1296');

    // Session tokens
    formData.append('jakarta.faces.ViewState', currentTokens.viewState);
    formData.append('jakarta.faces.ClientWindow', currentTokens.clientWindow);
    formData.append('primefaces.nonce', currentTokens.primefacesNonce);

    // AJAX parameters for PrimeFaces FileUpload
    formData.append('jakarta.faces.partial.ajax', 'true');
    formData.append('jakarta.faces.partial.execute', 'mainupload:webUpload:webFileUpload');
    formData.append('jakarta.faces.source', 'mainupload:webUpload:webFileUpload');
    formData.append('mainupload:webUpload:webFileUpload_totalFilesCount', '1');
    formData.append('jakarta.faces.partial.render', 'mainupload:webUpload mainupload:webUpload:messages');

    // The actual file
    formData.append('mainupload:webUpload:webFileUpload', imageData, {
      filename: uploadFileName,
      contentType: 'image/jpeg',
    });

    this.logger.log(`Uploading to ${uploadUrl}...`);

    const uploadResponse = await this.http.post(uploadUrl, formData, {
      headers: {
        ...formData.getHeaders(),
        'Faces-Request': 'partial/ajax',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': `${BASE_URL}${formUrl}`,
      },
    });

    this.logger.saveFile('upload_response.xml', uploadResponse.data);

    // Extract updated tokens and check for errors
    if (uploadResponse.data && typeof uploadResponse.data === 'string') {
      this.session.setLastResponse(uploadResponse.data);
      const updatedTokens = this.tokenExtractor.updateTokensFromResponse(
        uploadResponse.data,
        this.session.getTokens()
      );
      this.session.setTokens(updatedTokens);

      // Check for DPMA validation errors
      if (uploadResponse.data.includes('stateError') || uploadResponse.data.includes('Fehler')) {
        // Extract error message if possible
        const errorMatch = uploadResponse.data.match(/Die Größe.*?Pixel/);
        if (errorMatch) {
          throw new Error(`Image upload failed: ${errorMatch[0]}`);
        }
        throw new Error('Image upload failed: DPMA validation error (check image dimensions - min 945px on one side, max 2835x2010)');
      }

      // Check for success indicator
      if (!uploadResponse.data.includes('stateOk') && !uploadResponse.data.includes('pi-check')) {
        this.logger.log('Warning: Upload response does not contain success indicator');
      }
    }

    // Step 3: Apply the upload by clicking "Übernehmen" button
    this.logger.log('Step 3: Applying upload...');
    const applyTokens = this.session.getTokens();
    const applyFields: Record<string, string> = {
      'jakarta.faces.partial.ajax': 'true',
      'jakarta.faces.source': 'mainupload:webUpload:uploadViewApplyButton',
      'jakarta.faces.partial.execute': '@all',
      'jakarta.faces.partial.render': '@all',
      'mainupload:webUpload:uploadViewApplyButton': 'mainupload:webUpload:uploadViewApplyButton',
      'mainupload:webUpload': 'mainupload:webUpload',
      'mainupload:webUpload:screenSizeForCalculation': '1296',
      'jakarta.faces.ViewState': applyTokens.viewState,
      'jakarta.faces.ClientWindow': applyTokens.clientWindow,
      'primefaces.nonce': applyTokens.primefacesNonce,
    };

    const applyBody = createUrlEncodedBody(applyFields);
    const applyResponse = await this.http.post(uploadUrl, applyBody, {
      headers: {
        ...AJAX_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Referer': `${BASE_URL}${uploadUrl}`,
      },
    });

    this.logger.saveFile('upload_apply.xml', applyResponse.data);

    // Extract final tokens
    if (applyResponse.data && typeof applyResponse.data === 'string') {
      this.session.setLastResponse(applyResponse.data);
      const finalTokens = this.tokenExtractor.updateTokensFromResponse(
        applyResponse.data,
        this.session.getTokens()
      );
      this.session.setTokens(finalTokens);
    }

    this.logger.log('Image upload completed successfully');
  }
}
