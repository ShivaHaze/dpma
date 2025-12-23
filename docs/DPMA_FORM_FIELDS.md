# DPMA Trademark Registration Form - Complete Field Documentation

This document contains the exact field IDs, names, and options for each step of the DPMA trademark registration form at `https://direkt.dpma.de/DpmaDirektWebEditoren/`.

**IMPORTANT**: This documentation is derived from direct analysis of the live DPMA website using Chrome DevTools. All field IDs and names are exact - do not guess or modify.

**Last Updated**: 2025-12-23

---

## Table of Contents

1. [Step 1: Anmelder (Applicant)](#step-1-anmelder-applicant)
2. [Step 2: Anwalt/Kanzlei (Representative)](#step-2-anwaltkanzlei-representative)
3. [Step 3: Zustelladresse (Delivery Address)](#step-3-zustelladresse-delivery-address)
4. [Step 4: Marke (Trademark)](#step-4-marke-trademark)
5. [Step 5: WDVZ - Nice Classes](#step-5-wdvz---nice-classes) *(To be documented separately)*
6. [Step 6: Sonstiges (Additional Options)](#step-6-sonstiges-additional-options)
7. [Step 7: Zahlung (Payment)](#step-7-zahlung-payment)
8. [Step 8: Zusammenfassung (Summary)](#step-8-zusammenfassung-summary)

---

## Step 1: Anmelder (Applicant)

**URL Pattern**: `/DpmaDirektWebEditoren/w7005/w7005web.xhtml?jftfdi=&jffi=w7005&jfwid={SESSION_ID}`

**Page Title**: "DPMADirektWeb | Markenanmeldung - Anmelder"

**dpmaViewId for navigation to Step 2**: `agents`

### Entity Type Selection (Radio Buttons)

| Field ID | Name | Value | Description |
|----------|------|-------|-------------|
| `daf-applicant:addressEntityType:0` | `daf-applicant:addressEntityType` | `natural` | Natürliche Person/Privatperson |
| `daf-applicant:addressEntityType:1` | `daf-applicant:addressEntityType` | `legal` | Juristische Person/Personengesellschaft |

---

### Form Fields - Natural Person (Natürliche Person)

When `addressEntityType` = `natural`:

| Field ID | Name | Type | Required | Description |
|----------|------|------|----------|-------------|
| `daf-applicant:namePrefix:valueHolder_input` | `daf-applicant:namePrefix:valueHolder_input` | select | No | Anrede/Titel (Salutation) |
| `daf-applicant:namePrefix:valueHolder_editableInput` | `daf-applicant:namePrefix:valueHolder_editableInput` | text | No | Anrede/Titel (editable text) |
| `daf-applicant:nameSuffix:valueHolder` | `daf-applicant:nameSuffix:valueHolder` | text | No | Sonstige Namenszusätze |
| `daf-applicant:lastName:valueHolder` | `daf-applicant:lastName:valueHolder` | text | **Yes** | Nachname |
| `daf-applicant:firstName:valueHolder` | `daf-applicant:firstName:valueHolder` | text | **Yes** | Vorname |
| `daf-applicant:street:valueHolder` | `daf-applicant:street:valueHolder` | text | **Yes** | Straße, Hausnummer |
| `daf-applicant:addressLine1:valueHolder` | `daf-applicant:addressLine1:valueHolder` | text | No | Zusätzliche Adresszeile |
| `daf-applicant:addressLine2:valueHolder` | `daf-applicant:addressLine2:valueHolder` | text | No | Zusätzliche Adresszeile 2 |
| `daf-applicant:zip:valueHolder` | `daf-applicant:zip:valueHolder` | text | **Yes** | Postleitzahl |
| `daf-applicant:city:valueHolder` | `daf-applicant:city:valueHolder` | text | **Yes** | Ort |
| `daf-applicant:country:valueHolder_input` | `daf-applicant:country:valueHolder_input` | select | **Yes** | Land |

#### Anrede/Titel Options (Natural Person)

| Value | Display Text |
|-------|--------------|
| *(empty)* | *(blank)* |
| `Frau` | Frau |
| `Herr` | Herr |
| `Dr.` | Dr. |
| `Prof. Dr.` | Prof. Dr. |

---

### Form Fields - Legal Entity (Juristische Person)

When `addressEntityType` = `legal`:

| Field ID | Name | Type | Required | Description |
|----------|------|------|----------|-------------|
| `daf-applicant:namePrefix:valueHolder_input` | `daf-applicant:namePrefix:valueHolder_input` | select | No | Rechtsform/Gesellschaftsform |
| `daf-applicant:namePrefix:valueHolder_editableInput` | `daf-applicant:namePrefix:valueHolder_editableInput` | text | No | Rechtsform (editable text) |
| `daf-applicant:lastName:valueHolder` | `daf-applicant:lastName:valueHolder` | text | **Yes** | Firmenname (Company Name) |
| `daf-applicant:street:valueHolder` | `daf-applicant:street:valueHolder` | text | **Yes** | Straße, Hausnummer |
| `daf-applicant:addressLine1:valueHolder` | `daf-applicant:addressLine1:valueHolder` | text | No | Adresszusatz |
| `daf-applicant:zip:valueHolder` | `daf-applicant:zip:valueHolder` | text | **Yes** | Postleitzahl |
| `daf-applicant:city:valueHolder` | `daf-applicant:city:valueHolder` | text | **Yes** | Ort |
| `daf-applicant:country:valueHolder_input` | `daf-applicant:country:valueHolder_input` | select | **Yes** | Land |

**IMPORTANT - Fields NOT present for Legal Entity:**
- `daf-applicant:firstName:valueHolder` (Vorname) - NOT present
- `daf-applicant:nameSuffix:valueHolder` (Sonstige Namenszusätze) - NOT present
- `daf-applicant:addressLine2:valueHolder` (Zusätzliche Adresszeile 2) - NOT present
- **ALL Russia Sanctions Declaration fields** - NOT present (sanctions only apply to natural persons)

#### Rechtsform/Gesellschaftsform Options (Legal Entity)

| Value | Display Text |
|-------|--------------|
| *(empty)* | *(blank)* |
| `Aktiengesellschaft (AG)` | Aktiengesellschaft (AG) |
| `eingetragene Genossenschaft (eG)` | eingetragene Genossenschaft (eG) |
| `eingetragene Gesellschaft bürgerlichen Rechts (eGbR)` | eingetragene Gesellschaft bürgerlichen Rechts (eGbR) |
| `eingetragener Verein (eV)` | eingetragener Verein (eV) |
| `europäische Gesellschaft (SE)` | europäische Gesellschaft (SE) |
| `Gesellschaft bürgerlichen Rechts (GbR)` | Gesellschaft bürgerlichen Rechts (GbR) |
| `Gesellschaft mit beschränkter Haftung (GmbH)` | Gesellschaft mit beschränkter Haftung (GmbH) |
| `Kommanditgesellschaft (KG)` | Kommanditgesellschaft (KG) |
| `Kommanditgesellschaft auf Aktien (KGaA)` | Kommanditgesellschaft auf Aktien (KGaA) |
| `Offene Handelsgesellschaft (oHG)` | Offene Handelsgesellschaft (oHG) |
| `Partnerschaftsgesellschaft (PartG)` | Partnerschaftsgesellschaft (PartG) |
| `Partnerschaftsgesellschaft mit beschränkter Berufshaftung (PartGmbB)` | Partnerschaftsgesellschaft mit beschränkter Berufshaftung (PartGmbB) |
| `Stiftung bürgerlichen Rechts` | Stiftung bürgerlichen Rechts |
| `Unternehmergesellschaft, haftungsbeschränkt (UG)` | Unternehmergesellschaft, haftungsbeschränkt (UG) |
| `Andere Rechtsform/Gesellschaftsform` | Andere Rechtsform/Gesellschaftsform |

---

### Land (Country) Options

Full list of country codes and German display names:

| Value | Display Text |
|-------|--------------|
| *(empty)* | *(blank)* |
| `DE` | Deutschland |
| `AT` | Österreich |
| `CH` | Schweiz |
| `AF` | Afghanistan |
| `AL` | Albanien |
| `DZ` | Algerien |
| `AD` | Andorra |
| `AO` | Angola |
| `AI` | Anguilla |
| `AG` | Antigua und Barbuda |
| `AR` | Argentinien |
| `AM` | Armenien |
| `AW` | Aruba |
| `AZ` | Aserbaidschan |
| `AU` | Australien |
| `BS` | Bahamas |
| `BH` | Bahrain |
| `BD` | Bangladesch |
| `BB` | Barbados |
| `BE` | Belgien |
| `BZ` | Belize |
| `BJ` | Benin |
| `BM` | Bermuda |
| `BT` | Bhutan |
| `BO` | Bolivien |
| `BA` | Bosnien und Herzegowina |
| `BW` | Botsuana |
| `BV` | Bouvetinsel |
| `BR` | Brasilien |
| `VG` | Britische Jungferninseln |
| `BN` | Brunei Darussalam |
| `BG` | Bulgarien |
| `BF` | Burkina Faso |
| `BI` | Burundi |
| `CL` | Chile |
| `CN` | China |
| `CK` | Cookinseln |
| `CR` | Costa Rica |
| `CI` | Cote d´Ivoire |
| `LA` | Demokratische Volksrepublik Laos |
| `DM` | Dominica |
| `DO` | Dominikanische Republik |
| `DJ` | Dschibuti |
| `DK` | Dänemark |
| `EC` | Ecuador |
| `SV` | El Salvador |
| `ER` | Eritrea |
| `EE` | Estland |
| `FK` | Falklandinseln (Malvinen) |
| `FJ` | Fidschi |
| `FI` | Finnland |
| `FR` | Frankreich |
| `MK` | Frühere jugoslawische Republik Mazdedonien |
| `FO` | Färöer |
| `GA` | Gabun |
| `GM` | Gambia |
| `GE` | Georgien |
| `GH` | Ghana |
| `GI` | Gibraltar |
| `GD` | Grenada |
| `GR` | Griechenland |
| `GB` | Großbritannien |
| `GL` | Grönland |
| `GT` | Guatemala |
| `GG` | Guernsey |
| `GN` | Guinea |
| `GW` | Guinea-Bissau |
| `GY` | Guyana |
| `HT` | Haiti |
| `VA` | Heiliger Stuhl / Vatikan |
| `HN` | Honduras |
| `HK` | Hongkong, Sonderverw.Region der VR China |
| `IN` | Indien |
| `ID` | Indonesien |
| `IQ` | Irak |
| `IR` | Iran, Islamische Republik |
| `IE` | Irland |
| `IS` | Island |
| `IM` | Isle of Man |
| `IL` | Israel |
| `IT` | Italien |
| `JM` | Jamaika |
| `JP` | Japan |
| `YE` | Jemen |
| `JE` | Jersey |
| `JO` | Jordanien |
| `KY` | Kaiman-Inseln |
| `KH` | Kambodscha |
| `CM` | Kamerun |
| `CA` | Kanada |
| `CV` | Kap Verde |
| `KZ` | Kasachstan |
| `QA` | Katar |
| `KE` | Kenia |
| `KG` | Kirgisistan |
| `KI` | Kiribati |
| `CO` | Kolumbien |
| `KM` | Komoren |
| `CG` | Kongo |
| `CD` | Kongo, Demokratische Republik |
| `KP` | Korea, Demokratische Volksrepublik |
| `KR` | Korea, Republik |
| `HR` | Kroatien |
| `CU` | Kuba |
| `KW` | Kuwait |
| `LS` | Lesotho |
| `LV` | Lettland |
| `LB` | Libanon |
| `LR` | Liberia |
| `LY` | Libysch-Arabische Dschamahirija |
| `LI` | Liechtenstein |
| `LT` | Litauen |
| `LU` | Luxemburg |
| `MO` | Macau |
| `MG` | Madagaskar |
| `MW` | Malawi |
| `MY` | Malaysia |
| `MV` | Malediven |
| `ML` | Mali |
| `MT` | Malta |
| `MA` | Marokko |
| `MH` | Marschallinseln |
| `MR` | Mauretanien |
| `MU` | Mauritius |
| `MX` | Mexiko |
| `MD` | Moldau, Republik |
| `MC` | Monaco |
| `MN` | Mongolei |
| `ME` | Montenegro |
| `MS` | Montserrat |
| `MZ` | Mosambik |
| `MM` | Myanmar |
| `NA` | Namibia |
| `NR` | Nauru |
| `NP` | Nepal |
| `NZ` | Neuseeland |
| `NI` | Nicaragua |
| `NL` | Niederlande |
| `AN` | Niederländische Antillen |
| `NE` | Niger |
| `NG` | Nigeria |
| `NO` | Norwegen |
| `MP` | Nördliche Marianen |
| `OM` | Oman |
| `PK` | Pakistan |
| `PW` | Palau |
| `PA` | Panama |
| `PG` | Papua-Neuguinea |
| `PY` | Paraguay |
| `PE` | Peru |
| `PH` | Philippinen |
| `PL` | Polen |
| `PT` | Portugal |
| `RW` | Ruanda |
| `RO` | Rumänien |
| `RU` | Russische Föderation |
| `SB` | Salomonen |
| `ZM` | Sambia |
| `WS` | Samoa |
| `SM` | San Marino |
| `ST` | Sao Tome und Principe |
| `SA` | Saudi-Arabien |
| `SE` | Schweden |
| `SN` | Senegal |
| `RS` | Serbien |
| `SC` | Seychellen |
| `SL` | Sierra Leone |
| `ZW` | Simbabwe |
| `SG` | Singapur |
| `SK` | Slowakei |
| `SI` | Slowenien |
| `SO` | Somalia |
| `ES` | Spanien |
| `LK` | Sri Lanka |
| `SH` | St. Helena |
| `KN` | St. Kitts und Nevis |
| `LC` | St. Lucia |
| `VC` | St. Vincent und die Grenadinen |
| `SD` | Sudan |
| `SR` | Suriname |
| `SZ` | Swasiland |
| `SY` | Syrien, Arabische Republik |
| `ZA` | Südafrika |
| `GS` | Südgeorgien u. Süd-Sandwich-Inseln |
| `TJ` | Tadschikistan |
| `TW` | Taiwan, chinesische Provinz |
| `TZ` | Tansania, Vereinigte Republik |
| `TH` | Thailand |
| `TL` | Timor-Leste |
| `TG` | Togo |
| `TO` | Tonga |
| `TT` | Trinidad und Tobago |
| `TD` | Tschad |
| `CZ` | Tschechische Republik |
| `TN` | Tunesien |
| `TM` | Turkmenistan |
| `TC` | Turks- und Caicosinseln |
| `TV` | Tuvalu |
| `TR` | Türkei |
| `UG` | Uganda |
| `UA` | Ukraine |
| `HU` | Ungarn |
| `UY` | Uruguay |
| `UZ` | Usbekistan |
| `VU` | Vanuatu |
| `VE` | Venezuela |
| `AE` | Vereinigte Arabische Emirate |
| `US` | Vereinigte Staaten von Amerika |
| `VN` | Vietnam |
| `BY` | Weißrussland (Belarus) |
| `EH` | Westsahara |
| `CF` | Zentralafrikanische Republik |
| `CY` | Zypern |
| `EG` | Ägypten |
| `GQ` | Äquatorialguinea |
| `ET` | Äthiopien |

---

### Russia Sanctions Declaration (Natural Person ONLY)

**IMPORTANT**: These fields appear ONLY for Natural Person (`addressEntityType` = `natural`). They are NOT shown for Legal Entity applicants.

| Field ID | Name | Value | Description |
|----------|------|-------|-------------|
| `daf-applicant:daf-declaration:nationalitySanctionLine:0` | `daf-applicant:daf-declaration:nationalitySanctionLine` | `FALSE` | "Ich bin russische/r Staatsangehörige/r" - Nein |
| `daf-applicant:daf-declaration:nationalitySanctionLine:1` | `daf-applicant:daf-declaration:nationalitySanctionLine` | `TRUE` | "Ich bin russische/r Staatsangehörige/r" - Ja |
| `daf-applicant:daf-declaration:residenceSanctionLine:0` | `daf-applicant:daf-declaration:residenceSanctionLine` | `FALSE` | "Ich habe einen Wohnsitz in Russland" - Nein |
| `daf-applicant:daf-declaration:residenceSanctionLine:1` | `daf-applicant:daf-declaration:residenceSanctionLine` | `TRUE` | "Ich habe einen Wohnsitz in Russland" - Ja |
| `daf-applicant:daf-declaration:evidenceProofCheckbox_input` | `daf-applicant:daf-declaration:evidenceProofCheckbox_input` | `on` | Evidence proof acknowledgment (checkbox) |
| `daf-applicant:daf-declaration:changesProofCheckbox_input` | `daf-applicant:daf-declaration:changesProofCheckbox_input` | `on` | Changes notification acknowledgment (checkbox) |

---

### Navigation Button

| Button | Action |
|--------|--------|
| "Weiteren Anmelder hinzufügen" | Add additional applicant (creates Anmelder 02, 03, etc.) |
| "Weiter" | Proceed to Step 2 (triggers AJAX with dpmaViewId=`agents`) |

---

### JSF Hidden Fields (Session Management)

| Field Name | Description |
|------------|-------------|
| `jakarta.faces.ViewState` | JSF ViewState token (changes with each request) |
| `jakarta.faces.ClientWindow` | JSF ClientWindow (format: `{UUID}:{counter}`) |
| `primefaces.nonce` | PrimeFaces CSRF nonce |
| `editor-form` | Form identifier (value: `editor-form`) |
| `editorPanel_active` | Active panel tracking |

---

## Step 2: Anwalt/Kanzlei (Representative)

**Page Title**: "DPMADirektWeb | Markenanmeldung - Anwalt/Kanzlei"

**dpmaViewId for navigation to Step 3**: `deliveryAddress`

### ⚠️ IMPLEMENTATION NOTE: THIS STEP IS ALWAYS SKIPPED

**Our implementation ALWAYS skips this step by clicking "Weiter" without adding any lawyer/representative.**

The `Step2Lawyer.ts` class simply submits an empty form to proceed to Step 3:
```typescript
await this.submitStep({}, DPMA_VIEW_IDS.STEP_2_TO_3);
```

A lawyer/representative is only legally required for applicants without residence/establishment in Germany. Our API assumes applicants have German residence and therefore does not support adding representatives.

---

### Reference: Available Form Fields (NOT USED)

The following documents the form fields that WOULD be available if a lawyer were to be added. These are documented for reference only - **our implementation never fills these fields**.

### Initial View (No Representative Added)

When first entering Step 2, the page shows only:
- Informational text about when representation is required
- Button: "Anwalt/Kanzlei hinzufügen" (Add Lawyer/Law Firm)
- Navigation: "Zurück", "Weiter"

### Entity Type Selection (Radio Buttons)

| Field ID | Name | Value | Description |
|----------|------|-------|-------------|
| `daf-agent:addressEntityType:0` | `daf-agent:addressEntityType` | `natural` | Natürliche Person/Privatperson (Individual Lawyer) |
| `daf-agent:addressEntityType:1` | `daf-agent:addressEntityType` | `legal` | Juristische Person/Personengesellschaft (Law Firm) |

---

### Form Fields - Natural Person (Individual Lawyer)

When `addressEntityType` = `natural`:

| Field ID | Name | Type | Required | Description |
|----------|------|------|----------|-------------|
| `daf-agent:namePrefix:valueHolder_input` | `daf-agent:namePrefix:valueHolder_input` | select | No | Anrede/Titel (Salutation) |
| `daf-agent:namePrefix:valueHolder_editableInput` | `daf-agent:namePrefix:valueHolder_editableInput` | text | No | Anrede/Titel (editable text) |
| `daf-agent:nameSuffix:valueHolder` | `daf-agent:nameSuffix:valueHolder` | text | No | Sonstige Namenszusätze |
| `daf-agent:lastName:valueHolder` | `daf-agent:lastName:valueHolder` | text | **Yes** | Nachname |
| `daf-agent:firstName:valueHolder` | `daf-agent:firstName:valueHolder` | text | No | Vorname |
| `daf-agent:street:valueHolder` | `daf-agent:street:valueHolder` | text | No | Straße, Hausnummer |
| `daf-agent:addressLine1:valueHolder` | `daf-agent:addressLine1:valueHolder` | text | No | Zusätzliche Adresszeile |
| `daf-agent:addressLine2:valueHolder` | `daf-agent:addressLine2:valueHolder` | text | No | Zusätzliche Adresszeile 2 |
| `daf-agent:mailbox:valueHolder` | `daf-agent:mailbox:valueHolder` | text | No | Postfach |
| `daf-agent:zip:valueHolder` | `daf-agent:zip:valueHolder` | text | **Yes** | Postleitzahl |
| `daf-agent:city:valueHolder` | `daf-agent:city:valueHolder` | text | **Yes** | Ort |
| `daf-agent:country:valueHolder_input` | `daf-agent:country:valueHolder_input` | select | **Yes** | Land |
| `daf-agent:phone:valueHolder` | `daf-agent:phone:valueHolder` | text | No | Telefon |
| `daf-agent:fax:valueHolder` | `daf-agent:fax:valueHolder` | text | No | Fax |
| `daf-agent:email:valueHolder` | `daf-agent:email:valueHolder` | text | No | E-Mail |

#### Anrede/Titel Options (Natural Person - Lawyer)

| Value | Display Text |
|-------|--------------|
| *(empty)* | *(blank)* |
| `Frau` | Frau |
| `Herr` | Herr |
| `Dr.` | Dr. |
| `Prof. Dr.` | Prof. Dr. |

---

### Form Fields - Legal Entity (Law Firm)

When `addressEntityType` = `legal`:

| Field ID | Name | Type | Required | Description |
|----------|------|------|----------|-------------|
| `daf-agent:namePrefix:valueHolder_input` | `daf-agent:namePrefix:valueHolder_input` | select | No | Rechtsform/Gesellschaftsform |
| `daf-agent:namePrefix:valueHolder_editableInput` | `daf-agent:namePrefix:valueHolder_editableInput` | text | No | Rechtsform (editable text) |
| `daf-agent:lastName:valueHolder` | `daf-agent:lastName:valueHolder` | text | **Yes** | Kanzleiname (Law Firm Name) |
| `daf-agent:street:valueHolder` | `daf-agent:street:valueHolder` | text | No | Straße, Hausnummer |
| `daf-agent:addressLine1:valueHolder` | `daf-agent:addressLine1:valueHolder` | text | No | Zusätzliche Adresszeile |
| `daf-agent:mailbox:valueHolder` | `daf-agent:mailbox:valueHolder` | text | No | Postfach |
| `daf-agent:zip:valueHolder` | `daf-agent:zip:valueHolder` | text | **Yes** | Postleitzahl |
| `daf-agent:city:valueHolder` | `daf-agent:city:valueHolder` | text | **Yes** | Ort |
| `daf-agent:country:valueHolder_input` | `daf-agent:country:valueHolder_input` | select | **Yes** | Land |
| `daf-agent:phone:valueHolder` | `daf-agent:phone:valueHolder` | text | No | Telefon |
| `daf-agent:fax:valueHolder` | `daf-agent:fax:valueHolder` | text | No | Fax |
| `daf-agent:email:valueHolder` | `daf-agent:email:valueHolder` | text | No | E-Mail |

**Note**: For Legal Entity, the `firstName`, `nameSuffix`, and `addressLine2` fields are NOT present in the form.

#### Rechtsform/Gesellschaftsform Options (Law Firm)

Same options as Step 1 Legal Entity - see [Rechtsform Options](#rechtsformgesellschaftsform-options-legal-entity).

---

### Land (Country) Options

The country dropdown uses the same options as Step 1, but with a **reduced list** (32 countries instead of full list). Uses ISO country codes as values.

---

### Vollmacht (Power of Attorney)

The "Vollmacht" button allows uploading a power of attorney document. This opens a file upload dialog.

---

### Action Buttons

| Button ID | Text | Action |
|-----------|------|--------|
| `daf-agent:btnAddApplicant` | "Anwalt/Kanzlei hinzufügen" | Add a new representative form |
| *(within form)* | "Hinzufügen" | Add the entered representative to the list |
| *(within form)* | "Ansicht" | View the selected representative |
| *(within form)* | "Entfernen" | Remove the selected representative |
| `cmd-link-prev` | "Zurück" | Go back to Step 1 |
| *(within form)* | "Übernehmen" | Apply changes to representative |
| `cmd-link-next` | "Weiter" | Proceed to Step 3 |

---

## Step 3: Zustelladresse (Delivery Address)

**Page Title**: "DPMADirektWeb | Markenanmeldung - Zustelladresse"

**dpmaViewId for navigation to Step 4**: `trademark`

**IMPORTANT**: This step specifies where DPMA correspondence will be sent. Can copy address from applicant(s) or enter a new one.

### Address Copy Dropdown

| Field ID | Type | Description |
|----------|------|-------------|
| `daf-correspondence:address-ref-combo-a:valueHolder_input` | select | Adresse übernehmen (Copy address from) |

#### Address Copy Options

| Value | Display Text | Description |
|-------|--------------|-------------|
| *(empty)* | *(blank)* | No selection |
| `Neue Adresse` | Neue Adresse | Enter a new address |
| `1 Anmelder {Name}` | 1 Anmelder {Name} | Copy from Applicant 01 (dynamic) |
| `2 Anmelder {Name}` | 2 Anmelder {Name} | Copy from Applicant 02 (if exists) |
| `1 Vertreter {Name}` | 1 Vertreter {Name} | Copy from Representative 01 (if exists) |

**Note**: The options are dynamically populated based on entered applicants and representatives.

---

### Entity Type Selection (Radio Buttons)

| Field ID | Name | Value | Description |
|----------|------|-------|-------------|
| `daf-correspondence:addressEntityType:0` | `daf-correspondence:addressEntityType` | `natural` | Natürliche Person/Privatperson |
| `daf-correspondence:addressEntityType:1` | `daf-correspondence:addressEntityType` | `legal` | Juristische Person/Personengesellschaft |

---

### Form Fields - Natural Person

When `addressEntityType` = `natural`:

| Field ID | Name | Type | Required | Description |
|----------|------|------|----------|-------------|
| `daf-correspondence:namePrefix:valueHolder_input` | `daf-correspondence:namePrefix:valueHolder_input` | select | No | Anrede/Titel (Salutation) |
| `daf-correspondence:namePrefix:valueHolder_editableInput` | `daf-correspondence:namePrefix:valueHolder_editableInput` | text | No | Anrede/Titel (editable text) |
| `daf-correspondence:nameSuffix:valueHolder` | `daf-correspondence:nameSuffix:valueHolder` | text | No | Sonstige Namenszusätze |
| `daf-correspondence:lastName:valueHolder` | `daf-correspondence:lastName:valueHolder` | text | **Yes** | Nachname |
| `daf-correspondence:firstName:valueHolder` | `daf-correspondence:firstName:valueHolder` | text | No | Vorname |
| `daf-correspondence:street:valueHolder` | `daf-correspondence:street:valueHolder` | text | No* | Straße, Hausnummer |
| `daf-correspondence:addressLine1:valueHolder` | `daf-correspondence:addressLine1:valueHolder` | text | No | Zusätzliche Adresszeile |
| `daf-correspondence:addressLine2:valueHolder` | `daf-correspondence:addressLine2:valueHolder` | text | No | Zusätzliche Adresszeile 2 |
| `daf-correspondence:mailbox:valueHolder` | `daf-correspondence:mailbox:valueHolder` | text | No* | Postfach |
| `daf-correspondence:zip:valueHolder` | `daf-correspondence:zip:valueHolder` | text | **Yes** | Postleitzahl |
| `daf-correspondence:city:valueHolder` | `daf-correspondence:city:valueHolder` | text | **Yes** | Ort |
| `daf-correspondence:country:valueHolder_input` | `daf-correspondence:country:valueHolder_input` | select | **Yes** | Land |
| `daf-correspondence:phone:valueHolder` | `daf-correspondence:phone:valueHolder` | text | No | Telefon |
| `daf-correspondence:fax:valueHolder` | `daf-correspondence:fax:valueHolder` | text | No | Fax |
| `daf-correspondence:email:valueHolder` | `daf-correspondence:email:valueHolder` | text | **Yes** | E-Mail |

**Note***: Either `street` OR `mailbox` must be provided (not both required, but at least one).

**Note**: E-Mail is REQUIRED in Step 3, unlike Steps 1 and 2.

#### Anrede/Titel Options

Same options as Step 1 - see [Anrede/Titel Options](#anredetitel-options-natural-person).

---

### Form Fields - Legal Entity

When `addressEntityType` = `legal`:

| Field ID | Name | Type | Required | Description |
|----------|------|------|----------|-------------|
| `daf-correspondence:namePrefix:valueHolder_input` | `daf-correspondence:namePrefix:valueHolder_input` | select | No | Rechtsform/Gesellschaftsform |
| `daf-correspondence:namePrefix:valueHolder_editableInput` | `daf-correspondence:namePrefix:valueHolder_editableInput` | text | No | Rechtsform (editable text) |
| `daf-correspondence:lastName:valueHolder` | `daf-correspondence:lastName:valueHolder` | text | **Yes** | Firmenname |
| `daf-correspondence:street:valueHolder` | `daf-correspondence:street:valueHolder` | text | No* | Straße, Hausnummer |
| `daf-correspondence:addressLine1:valueHolder` | `daf-correspondence:addressLine1:valueHolder` | text | No | Adresszusatz |
| `daf-correspondence:mailbox:valueHolder` | `daf-correspondence:mailbox:valueHolder` | text | No* | Postfach |
| `daf-correspondence:zip:valueHolder` | `daf-correspondence:zip:valueHolder` | text | **Yes** | Postleitzahl |
| `daf-correspondence:city:valueHolder` | `daf-correspondence:city:valueHolder` | text | **Yes** | Ort |
| `daf-correspondence:country:valueHolder_input` | `daf-correspondence:country:valueHolder_input` | select | **Yes** | Land |
| `daf-correspondence:phone:valueHolder` | `daf-correspondence:phone:valueHolder` | text | No | Telefon |
| `daf-correspondence:fax:valueHolder` | `daf-correspondence:fax:valueHolder` | text | No | Fax |
| `daf-correspondence:email:valueHolder` | `daf-correspondence:email:valueHolder` | text | **Yes** | E-Mail |

**IMPORTANT - Fields NOT present for Legal Entity:**
- `daf-correspondence:firstName:valueHolder` (Vorname) - NOT present
- `daf-correspondence:nameSuffix:valueHolder` (Sonstige Namenszusätze) - NOT present
- `daf-correspondence:addressLine2:valueHolder` (Zusätzliche Adresszeile 2) - NOT present

**Note**: The label for `addressLine1` is "Adresszusatz" for Legal Entity (vs "Zusätzliche Adresszeile" for Natural Person).

---

### Navigation Buttons

| Button ID | Text | Action |
|-----------|------|--------|
| `cmd-link-prev` | "Zurück" | Go back to Step 2 |
| `cmd-link-next` | "Weiter" | Proceed to Step 4 |

---

## Step 4: Marke (Trademark)

**Page Title**: "DPMADirektWeb | Markenanmeldung - Marke"

**dpmaViewId for navigation to Step 5**: `niceClasses`

### Markenform (Trademark Type) Dropdown

| Field ID | Type | Description |
|----------|------|-------------|
| `markFeatureCombo:valueHolder_input` | select | Markenform (Trademark type) - REQUIRED |

#### Markenform Options

| Value | Display Text | Description |
|-------|--------------|-------------|
| *(empty)* | *(blank)* | No selection |
| `word` | Wortmarke | Word mark (text only) |
| `image` | Bildmarke | Image mark (pure image, no text) |
| `figurative` | Wort-/Bildmarke | Combined word/image mark |
| `feature3d` | Dreidimensionale Marke | 3D mark |
| `farbmarke` | Farbmarke | Color mark |
| `sound` | Klangmarke | Sound mark |
| `positionsmarke` | Positionsmarke | Position mark |
| `tracer` | Kennfadenmarke | Tracer thread mark |
| `mustermarke` | Mustermarke | Pattern mark |
| `bewegungsmarke` | Bewegungsmarke | Motion mark |
| `multimediamarke` | Multimediamarke | Multimedia mark |
| `hologrammmarke` | Hologrammmarke | Hologram mark |
| `other` | Sonstige Marke | Other mark type |

---

### Common Fields (All Trademark Types)

| Field ID | Type | Required | Description |
|----------|------|----------|-------------|
| `mark-docRefNumber:valueHolder` | text | No | Internes Aktenzeichen (Internal reference number) |
| `btnCallAddOrEditDescription` | button | - | Markenbeschreibung hinzufügen (Add trademark description) |

---

### Trademark Description Dialog (Markenbeschreibung)

**Available for**: Bildmarke, Wort-/Bildmarke, and other image-based marks
**URL**: `/DpmaDirektWebEditoren/w7005/w7005-trademark-description.xhtml?jfwid={clientWindow}`
**Form ID**: `markDescForm`

This dialog allows adding an optional description for the trademark.

#### Opening the Dialog

Click the `btnCallAddOrEditDescription` button to open the description dialog page.

#### Description Form Fields

| Field ID | Type | Required | Description |
|----------|------|----------|-------------|
| `mark-description:valueHolder` | textarea | No | Trademark description text |

#### Description Limits

| Limit Type | Value |
|------------|-------|
| Maximum characters | 2000 |
| Maximum words | 150 |

**Note**: Either limit applies - if the description exceeds 2000 characters OR 150 words, it will be rejected.

#### Dialog Buttons

| Button ID | Text | Purpose |
|-----------|------|---------|
| `btnCancel` | Abbrechen | Cancel and close dialog |
| `btnSubmit` | Übernehmen | Submit description and return to form |

#### Form Submission (Technical Details)

The description form uses PrimeFaces AJAX submission:

| Field Name | Value |
|------------|-------|
| `jakarta.faces.partial.ajax` | `true` |
| `jakarta.faces.source` | `btnSubmit` |
| `jakarta.faces.partial.execute` | `markDescForm` |
| `jakarta.faces.partial.render` | `markDescForm` |
| `btnSubmit` | `btnSubmit` |
| `dpmaValidateInput` | `true` |
| `markDescForm` | `markDescForm` |
| `mark-description:valueHolder` | *(description text)* |
| `jakarta.faces.ViewState` | *(session token)* |
| `jakarta.faces.ClientWindow` | *(client window ID)* |
| `primefaces.nonce` | *(CSRF nonce)* |

---

### Type-Specific Fields

#### Wortmarke (Word Mark) - value: `word`

| Field ID | Type | Required | Description |
|----------|------|----------|-------------|
| `mark-verbalText:valueHolder` | text | **Yes** | Markendarstellung (Trademark text representation) |

**Note**: For Wortmarke, only enter the actual trademark text. No explanations or descriptions.

---

#### Bildmarke (Image Mark) - value: `image`

| Field ID | Type | Required | Description |
|----------|------|----------|-------------|
| `btnAddFigureFile` | button | - | Bilddatei hinzufügen (Add image file) - opens upload dialog |
| `mark-blackwhite-chkbox:valueHolder_input` | checkbox | No | Farbelemente (Color elements claimed) |
| `mark-colorClaimedText:valueHolder` | textarea | No* | Color description (enabled when checkbox checked) |
| `mark-translation-chkbox:valueHolder_input` | checkbox | No | Die Markendarstellung enthält nichtlateinische Schriftzeichen |

**Note***: When `mark-blackwhite-chkbox` is checked, provide color names (e.g., "rot", "grün", "blau") - NOT technical codes like RAL. Include "schwarz" and "weiß" if black/white are part of the design.

**Image Requirements** (DPMA Validation):
- **Format**: JPG only (`.jpg` extension)
- **Minimum size**: 945 pixels on at least ONE side (width OR height)
- **Maximum size**: 2835 x 2010 pixels
- **Note**: PNG files will be converted to JPG and may have color shifts in background

**Image Upload Error Example**:
```
Die Größe 244 x 320 liegt nicht im erlaubten Bereich.
Maximal 2835 x 2010 Pixel, mindestens 945 Pixel in der Breite oder 945 Pixel in der Höhe
```

##### Image Upload Process (Technical Details)

The image upload follows a 3-step PrimeFaces AJAX workflow:

**Step 1: Open Upload Dialog**
- Click `btnAddFigureFile` button
- This navigates to `/DpmaDirektWebEditoren/w7005/w7005-upload.xhtml`

**Step 2: Upload File via Multipart Form**
- URL: `/DpmaDirektWebEditoren/w7005/w7005-upload.xhtml?jfwid={clientWindow}`
- Method: `POST`
- Content-Type: `multipart/form-data`
- Required form fields:

| Field Name | Value |
|------------|-------|
| `mainupload:webUpload` | `mainupload:webUpload` |
| `mainupload:webUpload:screenSizeForCalculation` | `1296` |
| `jakarta.faces.ViewState` | *(session token)* |
| `jakarta.faces.ClientWindow` | *(client window ID)* |
| `primefaces.nonce` | *(CSRF nonce)* |
| `jakarta.faces.partial.ajax` | `true` |
| `jakarta.faces.partial.execute` | `mainupload:webUpload:webFileUpload` |
| `jakarta.faces.source` | `mainupload:webUpload:webFileUpload` |
| `mainupload:webUpload:webFileUpload_totalFilesCount` | `1` |
| `jakarta.faces.partial.render` | `mainupload:webUpload mainupload:webUpload:messages` |
| `mainupload:webUpload:webFileUpload` | *(file data with filename header)* |

**Step 3: Apply Upload**
- Click `mainupload:webUpload:uploadViewApplyButton` button
- This confirms the upload and returns to the trademark form

##### Upload Dialog Buttons

| Button ID | Text | Purpose |
|-----------|------|---------|
| `mainupload:webUpload:webUploadButton` | Hochladen... | Opens file picker (disabled after file selected) |
| `mainupload:webUpload:uploadViewCancelButton` | Abbrechen | Cancel upload and return |
| `mainupload:webUpload:uploadViewApplyButton` | Übernehmen | Apply/confirm the uploaded file |
| `mainupload:webUpload:uploadedFileDataTable:0:deleteFileButton` | Löschen | Delete uploaded file |

##### After Successful Upload

Once an image is uploaded, the form shows:
- **Thumbnail preview** of the image
- New management buttons:

| Button ID | Text | Purpose |
|-----------|------|---------|
| `btnEditMarkFile` | Anlage ändern | Change/replace the attachment |
| `btnDeleteMarkFile` | Anlage entfernen | Remove the attachment |
| `btnShowMarkFilePreview` | Anlage ansehen | View the attachment |

---

#### Wort-/Bildmarke (Combined Word/Image Mark) - value: `figurative`

**Uses identical fields and upload process as Bildmarke** - same image requirements, same upload workflow, same checkboxes for color elements and non-Latin characters.

| Field ID | Type | Required | Description |
|----------|------|----------|-------------|
| `btnAddFigureFile` | button | - | Bilddatei hinzufügen (Add image file) |
| `mark-blackwhite-chkbox:valueHolder_input` | checkbox | No | Farbelemente (Color elements claimed) |
| `mark-colorClaimedText:valueHolder` | textarea | No* | Color description |
| `mark-translation-chkbox:valueHolder_input` | checkbox | No | Non-Latin characters flag |

See [Bildmarke Image Upload Process](#image-upload-process-technical-details) for upload details.

---

#### Dreidimensionale Marke (3D Mark) - value: `feature3d`

Same fields as Bildmarke - uses image file upload.

---

#### Farbmarke (Color Mark) - value: `farbmarke`

| Field ID | Type | Required | Description |
|----------|------|----------|-------------|
| `btnAddFigureFile` | button | - | Bilddatei hinzufügen (Add image file) |
| `mark-blackwhite-chkbox:valueHolder_input` | checkbox | No | Farbelemente (Color elements) |
| `mark-colorClaimedText:valueHolder` | textarea | No* | Color description with RAL/Pantone/HKS codes |

**Note**: For Farbmarke, the color description asks for technical color codes (RAL, Pantone, HKS), unlike other mark types.

---

#### Klangmarke (Sound Mark) - value: `sound`

| Field ID | Type | Required | Description |
|----------|------|----------|-------------|
| `btnAddFigureFile` | button | - | Bilddatei hinzufügen (Add image file - e.g., musical notation) |
| `btnAddAudioFile` | button | - | Audiodatei hinzufügen (Add audio file) |
| `mark-translation-chkbox:valueHolder_input` | checkbox | No | Die Markendarstellung enthält nichtlateinische Schriftzeichen |

**Note**: Sound marks can include both an image (e.g., sheet music) AND an audio file.

---

#### Positionsmarke (Position Mark) - value: `positionsmarke`

Same fields as Bildmarke - uses image file upload.

---

#### Kennfadenmarke (Tracer Thread Mark) - value: `tracer`

Same fields as Bildmarke - uses image file upload.

---

#### Mustermarke (Pattern Mark) - value: `mustermarke`

Same fields as Bildmarke - uses image file upload.

---

#### Bewegungsmarke (Motion Mark) - value: `bewegungsmarke`

Same fields as Bildmarke - uses image file upload.

---

#### Multimediamarke (Multimedia Mark) - value: `multimediamarke`

Same fields as Bildmarke - uses image file upload.

---

#### Hologrammmarke (Hologram Mark) - value: `hologrammmarke`

Same fields as Bildmarke - uses image file upload.

---

#### Sonstige Marke (Other Mark) - value: `other`

Same fields as Bildmarke - uses image file upload.

---

### File Upload Buttons

| Button ID | Text | Purpose |
|-----------|------|---------|
| `btnAddFigureFile` | Bilddatei hinzufügen | Upload image file (JPG, converted PNG) |
| `btnAddAudioFile` | Audiodatei hinzufügen | Upload audio file (only for Klangmarke) |

---

### Navigation Buttons

| Button ID | Text | Action |
|-----------|------|--------|
| `cmd-link-left` | Zurück | Go back to Step 3 |
| `cmd-link-next` | Weiter | Proceed to Step 5 (WDVZ) |

---

## Step 5: WDVZ - Nice Classes (Waren und Dienstleistungen)

**Page Title**: "DPMADirektWeb | Markenanmeldung - Waren und Dienstleistungen"

**dpmaViewId for navigation to Step 6**: `priorities`

This step allows selection of goods and services (Nice Classification) for the trademark. The DPMA database contains approximately **70,000 items** across **45 Nice classes**.

### Implementation Overview

The Nice classification step is the most complex step in the form. It involves:

1. **Category tree navigation** - Expanding/collapsing hierarchical categories
2. **Search functionality** - Finding specific terms across all classes
3. **Checkbox selection** - Selecting individual terms or entire categories
4. **Lead class selection** - Choosing the primary class for the application

### Taxonomy Data Structure

The Nice classification is stored locally in `src/data/taxonomyDe.json` with the following structure:

```json
{
  "Text": "Begriffe",
  "ClassNumber": 0,
  "ConceptId": "0",
  "Level": 0,
  "Items": [
    {
      "Text": "Sämtliche Waren",
      "ClassNumber": 0,
      "Items": [
        {
          "Text": "Klasse 9",
          "ClassNumber": 9,
          "ConceptId": "1529143",
          "Level": 1,
          "Items": [
            {
              "Text": "Software",
              "ClassNumber": 9,
              "ConceptId": "1528632",
              "Level": 3,
              "Items": [...],
              "ItemsSize": 68
            }
          ],
          "ItemsSize": 5929
        }
      ]
    }
  ]
}
```

#### Taxonomy Fields

| Field | Type | Description |
|-------|------|-------------|
| `Text` | string | German term/category name |
| `ClassNumber` | number | Nice class (1-45), or 0 for root nodes |
| `ConceptId` | string | Unique DPMA identifier |
| `Level` | number | Hierarchy depth (0=root, 1=class, 2+=subcategory) |
| `Items` | array/null | Child nodes, or null for leaf terms |
| `ItemsSize` | number | Total leaf terms under this node |

#### Hierarchy Levels

| Level | Description | Example |
|-------|-------------|---------|
| 0 | Root containers | "Begriffe", "Sämtliche Waren" |
| 1 | Nice classes | "Klasse 9", "Klasse 42" |
| 2 | Main categories | "Software", "IT-Dienstleistungen" |
| 3+ | Subcategories | "Anwendungssoftware", "Spielsoftware" |
| Leaf | Individual terms | (Items = null) |

### TaxonomyService

The `TaxonomyService` class provides pre-validation and lookup capabilities:

```typescript
import { TaxonomyService, getTaxonomyService } from '../services';

const taxonomy = await getTaxonomyService();

// Validate a term
const result = taxonomy.validateTerm('Software', 9);
// { found: true, entry: { text: 'Software', classNumber: 9, ... } }

// Search for terms
const matches = taxonomy.search('künstliche intelligenz', { classNumbers: [9] });
// Returns matching entries with similarity scores

// Get class categories
const categories = taxonomy.getClassCategories(9);
// Returns level-2 entries for Class 9
```

### AJAX Interaction Patterns

Step 5 uses PrimeFaces AJAX for all interactions. Here are the key patterns:

#### 1. Expanding a Class Tree Node

```http
POST /DpmaDirektWebEditoren/w7005/w7005web.xhtml?jfwid={SESSION_ID}
Content-Type: application/x-www-form-urlencoded

jakarta.faces.partial.ajax=true
jakarta.faces.source=tmclassEditorGt:tmclassNode_9:iconExpandedState
jakarta.faces.partial.execute=tmclassEditorGt:tmclassNode_9:iconExpandedState
jakarta.faces.partial.render=tmclassEditorGt
jakarta.faces.behavior.event=action
tmclassEditorGt:tmclassNode_9:iconExpandedState=tmclassEditorGt:tmclassNode_9:iconExpandedState
editor-form=editor-form
jakarta.faces.ViewState={VIEW_STATE}
jakarta.faces.ClientWindow={CLIENT_WINDOW}
primefaces.nonce={NONCE}
```

#### 2. Searching for Terms

```http
POST /DpmaDirektWebEditoren/w7005/w7005web.xhtml?jfwid={SESSION_ID}
Content-Type: application/x-www-form-urlencoded

jakarta.faces.partial.ajax=true
jakarta.faces.source=tmclassEditorGt:searchWDVZ
jakarta.faces.partial.execute=tmclassEditorGt
jakarta.faces.partial.render=tmclassEditorGt:nodeTreeAndTermView
tmclassEditorGt:searchWDVZ=tmclassEditorGt:searchWDVZ
tmclassEditorGt:tmClassEditorCenterSearchPhrase=Software
editor-form=editor-form
jakarta.faces.ViewState={VIEW_STATE}
jakarta.faces.ClientWindow={CLIENT_WINDOW}
primefaces.nonce={NONCE}
```

#### 3. Selecting a Checkbox

```http
POST /DpmaDirektWebEditoren/w7005/w7005web.xhtml?jfwid={SESSION_ID}
Content-Type: application/x-www-form-urlencoded

jakarta.faces.partial.ajax=true
jakarta.faces.source=tmclassEditorGt:tmclassNode_9:j_idt2281:selectBox
jakarta.faces.behavior.event=change
jakarta.faces.partial.execute=tmclassEditorGt:tmclassNode_9:j_idt2281:selectBox
jakarta.faces.partial.render=tmclassEditorGt:tmclassNode_9:j_idt2281:selectBox @(.termViewCol) @(.tmClassEditorSelected) @(.leadingClassCombo) @(.hintSelectGroup)
tmclassEditorGt:tmclassNode_9:j_idt2281:selectBox_input=on
editor-form=editor-form
jakarta.faces.ViewState={VIEW_STATE}
jakarta.faces.ClientWindow={CLIENT_WINDOW}
primefaces.nonce={NONCE}
```

### Checkbox ID Pattern

Checkbox IDs follow this pattern:
```
tmclassEditorGt:tmclassNode_{CLASS_NUMBER}:{DYNAMIC_ID}:selectBox_input
```

- `{CLASS_NUMBER}` - Nice class number (1-45)
- `{DYNAMIC_ID}` - JSF-generated identifier (e.g., `j_idt2281`)

The dynamic ID changes between sessions, so checkboxes must be discovered by:
1. Expanding the class tree
2. Parsing the response for checkbox elements
3. Matching by term title attribute

### Finding Checkboxes in Response

Checkboxes are identified by parsing the AJAX response HTML:

```html
<a id="tmclassEditorGt:tmclassNode_9:j_idt2281:termViewLink"
   title="Software"
   class="termViewLink">Software</a>
```

The checkbox ID is derived from the link ID:
- Link: `tmclassEditorGt:tmclassNode_9:j_idt2281:termViewLink`
- Checkbox: `tmclassEditorGt:tmclassNode_9:j_idt2281:selectBox_input`

---

### Page Structure

The page has three main sections:
1. **Search Section** - Search for specific goods/services
2. **Class Tree Section** - Browse hierarchical Nice classification
3. **Selection Section** - View selected items and lead class

---

### Search Functionality

| Field ID | Type | Description |
|----------|------|-------------|
| *(search textbox)* | textbox | Search field for finding goods/services |
| *(search button)* | button | "Suchen" - Execute search |

**Search Behavior**:
- Search term matches across all 45 classes
- Results show "(X Treffer)" = number of matches per category
- Results maintain hierarchical tree structure
- Only classes/categories with matches are displayed

**Version Info**: "10th Edition Nov 2013_12th Edition 2023 (Oct 2025)"

---

### Class Tree Structure

The Nice Classification is displayed as a hierarchical tree:

```
KL.XX: Class Name (X Treffer/Begriffe)
├── Subcategory 1 (X Begriffe)
│   ├── Sub-subcategory (X Begriffe)
│   │   └── Individual terms...
│   └── Individual terms...
└── Subcategory 2 (X Begriffe)
    └── Individual terms...
```

#### Tree Navigation Elements

| Element | Type | Description |
|---------|------|-------------|
| `ui-button` (expand) | button | Expand/collapse a category |
| *(checkbox)* | checkbox | Select entire category or individual term |
| *(link)* | link | Category/term name with term count |

---

### Nice Classes Overview (KL.01 - KL.45)

| Class | German Name | Description |
|-------|-------------|-------------|
| KL.01 | Chemische Erzeugnisse; Dünger | Chemicals, fertilizers |
| KL.02 | Farben; Firnisse; Lacke | Paints, varnishes, lacquers |
| KL.03 | Putzmittel; Kosmetik; Parfüms | Cleaning products, cosmetics, perfumes |
| KL.04 | Techn. Öle/Fette; Brennstoffe | Industrial oils/greases, fuels |
| KL.05 | Pharmazeutika; Verbände | Pharmaceuticals, bandages |
| KL.06 | Baumaterial aus Metall | Metal building materials |
| KL.07 | Maschinen und Motoren | Machines and motors |
| KL.08 | Handwerkzeuge; Messer | Hand tools, knives |
| KL.09 | Elektronik; Computer; Optik | Electronics, computers, optics, **SOFTWARE** |
| KL.10 | Medizinische Geräte | Medical devices |
| KL.11 | Heizung/Lüftung/Sanitäranlagen | HVAC, sanitary installations |
| KL.12 | Fahrzeuge | Vehicles |
| KL.13 | Waffen | Weapons |
| KL.14 | Schmuck und Uhren | Jewelry and watches |
| KL.15 | Musikinstrumente | Musical instruments |
| KL.16 | Büro-, Schreib-, Papierwaren | Office supplies, stationery |
| KL.17 | Isoliermaterial/Halbfabrikate | Insulation materials, semi-finished goods |
| KL.18 | Lederwaren; Gepäck; Taschen | Leather goods, luggage, bags |
| KL.19 | Baumaterial nicht aus Metall | Non-metal building materials |
| KL.20 | Möbel; Einrichtungsgegenstände | Furniture, furnishings |
| KL.21 | Haushaltswaren; Putzzeug | Household goods, cleaning tools |
| KL.22 | Seile; Zelte; Planen; Segel | Ropes, tents, tarps, sails |
| KL.23 | Garne und Fäden | Yarns and threads |
| KL.24 | Textilwaren; Decken | Textiles, blankets |
| KL.25 | Kleidung/Schuhe/Kopfbedeckung | Clothing, shoes, headwear |
| KL.26 | Kurzwaren; Haarschmuck | Haberdashery, hair accessories |
| KL.27 | Bodenbeläge; Matten; Tapeten | Floor coverings, mats, wallpaper |
| KL.28 | Spiele; Sportartikel | Games, sports equipment |
| KL.29 | Fleisch-/Fisch-/Milchwaren | Meat, fish, dairy products |
| KL.30 | Teig-/Süßwaren; Kaffee; Tee | Pastry, sweets, coffee, tea |
| KL.31 | Frisches Obst/Gemüse; Futter | Fresh fruits/vegetables, animal feed |
| KL.32 | Alkoholfreie Getränke; Biere | Non-alcoholic beverages, beers |
| KL.33 | Alkoholische Getränke | Alcoholic beverages |
| KL.34 | Tabak; Raucherartikel | Tobacco, smoking articles |
| KL.35 | Werbung/Verwaltung/Büro | Advertising, management, office (SERVICES) |
| KL.36 | Finanz-, Immobilienwesen | Finance, real estate |
| KL.37 | Bau-, Reparaturarbeiten | Construction, repair work |
| KL.38 | Telekommunikation | Telecommunications |
| KL.39 | Reisen; Transport; Lagerung | Travel, transport, storage |
| KL.40 | Materialbearbeitung; Druck | Material processing, printing |
| KL.41 | Bildung/Kultur/Freizeit/Sport | Education, culture, leisure, sports |
| KL.42 | Forschung/technolog. Dienste | Research, technological services, **IT SERVICES** |
| KL.43 | Beherbergung und Verpflegung | Accommodation and catering |
| KL.44 | Gesundheit; Landwirtschaft | Health, agriculture |
| KL.45 | Recht; persönliche Dienste | Legal, personal services |

**Note**: Classes 01-34 are **Goods** (Waren), Classes 35-45 are **Services** (Dienstleistungen).

---

### Selection Counter

| Field | Description |
|-------|-------------|
| "Klassen" count | Number of Nice classes with selected items |
| "Begriffe" count | Total number of selected terms |
| "Auswahl löschen" button | Clear all selections |

---

### Lead Class (Leitklassenvorschlag)

The lead class is the **primary Nice class** for the trademark application. It determines the main classification area and affects how the trademark is searched and categorized by DPMA.

#### Form Field Details

| Field ID | Type | Value Format | Required |
|----------|------|--------------|----------|
| `tmclassEditorGt:leadingClassCombo_input` | hidden input | Class number only (e.g., `"42"`) | **Yes** (when multiple classes selected) |
| `tmclassEditorGt:leadingClassCombo_label` | display | Display text (e.g., `"Klasse 42"`) | - |

#### Dropdown Behavior

The dropdown is a PrimeFaces combo box with these characteristics:

1. **Options are dynamically populated** - Only shows classes that have been selected in the form
2. **First option is empty** - `" "` (space) - represents no selection
3. **Subsequent options** - Format: `"Klasse {number}"` for each selected class

**Example dropdown when classes 42 and 45 are selected:**
| Value | Display Text |
|-------|--------------|
| *(empty)* | `" "` |
| `42` | `Klasse 42` |
| `45` | `Klasse 45` |

#### Technical Implementation

The hidden `_input` field stores **just the number** (e.g., `"42"`), not the display text (`"Klasse 42"`). PrimeFaces handles the conversion automatically.

```typescript
// Correct - send just the number
fields['tmclassEditorGt:leadingClassCombo_input'] = '42';

// WRONG - do not send display text
// fields['tmclassEditorGt:leadingClassCombo_input'] = 'Klasse 42';
```

#### API Validation Rules

The `leadClass` field in the API request:

1. **Type**: `number` (optional)
2. **Range**: Must be between 1 and 45
3. **Constraint**: Must be one of the selected Nice classes
4. **Default**: If not provided, defaults to the first selected class

```typescript
// API request example
{
  "niceClasses": [
    { "classNumber": 42, "terms": ["IT-Dienstleistungen"] },
    { "classNumber": 45, "terms": ["Rechtsberatung"] }
  ],
  "leadClass": 42  // Optional - defaults to 42 (first selected)
}
```

#### Validation Error Messages

| Condition | Error Message |
|-----------|---------------|
| leadClass < 1 or > 45 | "Lead class must be between 1 and 45" |
| leadClass not in selected classes | "Lead class must be one of the selected Nice classes" |

---

### Common Software-Related Categories (KL.09 & KL.42)

For software trademarks, the most relevant categories are:

**KL.09 - Herunterladbare und aufgezeichnete Daten**:
- Software (general - ~692 terms)
- Spielsoftware (game software)
- Anwendungssoftware (application software)
- Kommunikations- und Netzwerksoftware
- Software für die Daten- und Dateiverwaltung
- Künstliche Intelligenz-Software und maschinelle Lernsoftware
- System- und Systemunterstützungssoftware sowie Firmware
- Webanwendungen und Serversoftware

**KL.42 - IT-Dienstleistungen**:
- Entwicklung, Programmierung und Implementierung von Software
- Hosting-Dienste, Software as a Service [SaaS]
- IT-Beratungs-, -Auskunfts- und -Informationsdienstleistungen
- IT-Sicherheits-, -Schutz- und -Instandsetzungsdienste

---

### Tabs

| Tab | Description |
|-----|-------------|
| "Klassenübersicht" | View complete class overview |
| "Export des Bearbeitungsstandes" | Export current state |
| "PDF-Vorschau" | PDF preview |

---

### Navigation Buttons

| Button ID | Text | Action |
|-----------|------|--------|
| `cmd-link-prev` | "Zurück" | Go back to Step 4 |
| `cmd-link-next` | "Weiter" | Proceed to Step 6 |

---

### Fee Implications

| Classes | Base Fee |
|---------|----------|
| 1-3 classes | Included in base registration fee (€290) |
| 4+ classes | Additional €100 per class beyond 3 |

---

## Step 6: Sonstiges (Additional Options)

**Page Title**: "DPMADirektWeb | Markenanmeldung - Sonstiges"

**dpmaViewId for navigation to Step 7**: `payment`

This step handles additional trademark options and **priority claims** (Ausländische Priorität and Ausstellungspriorität).

---

### Additional Options Fields (Checkboxes)

All checkbox fields in Step 6 are **optional**.

| Field ID | Type | Description | Fee Impact |
|----------|------|-------------|------------|
| `acceleratedExamination:valueHolder_input` | checkbox | Beschleunigte Prüfung (Accelerated examination) | +€200 |
| `mark-certification-chkbox:valueHolder_input` | checkbox | Gewährleistungsmarke (§§ 106a ff. MarkenG) - Certification mark | Higher fees |
| `mark-licenseIndicator-chkbox:valueHolder_input` | checkbox | Lizenzbereitschaftserklärung (§ 42c MarkenV) - Licensing declaration | - |
| `mark-dispositionIndicator-chkbox:valueHolder_input` | checkbox | Veräußerungsbereitschaftserklärung (§ 42c MarkenV) - Sale declaration | - |

**Note**: Gewährleistungsmarke (Certification mark) requires a trademark regulation (Markensatzung) and incurs higher registration fees.

---

### Priority Claims (Prioritätsansprüche)

Priority claims allow you to claim an earlier filing date from a foreign application or exhibition. Both types have a **6-month time limit**.

#### Priority Buttons (Main Step 6 Page)

| Button ID | Text | Opens |
|-----------|------|-------|
| `tm-priority-comp:btnCallAddPriority1AbroadOnlyFlow` | Hinzufügen - Ausländische Priorität | Foreign Priority form |
| `tm-priority-comp:btnCallAddPriority2Flow` | Hinzufügen - Austellungspriorität | Exhibition Priority form |

#### Priority Table (shows added claims)

| Element ID | Purpose |
|------------|---------|
| `tm-priority-comp:priorities-table` | Table showing added priority claims |
| `tm-priority-comp:priorities-table:{index}:editPriorityFlow` | Edit link for priority at index |
| `tm-priority-comp:priorities-table:{index}:deletePriority` | Delete link for priority at index |

---

### Foreign Priority (Ausländische Priorität) - §34 MarkenG

**Page Title**: "DPMADirektWeb | Prioritäten"

**URL Pattern**: Same form URL, page changes via AJAX

If the trademark was already filed abroad and there are international treaties with the foreign country, you can claim the filing date priority within 6 months (Paris Convention).

#### Form Fields

| Field ID | Type | Required | Description |
|----------|------|----------|-------------|
| `priority:priorityDate:valueHolder_input` | date picker | **Yes** | Priority date (Datum) - Format: dd.mm.yyyy |
| `priority:priorityCountry:valueHolder_input` | select | **Yes** | Country (Land) - 224 country options |
| `priority:appNum:valueHolder` | text | **Yes** | Application number (Aktenzeichen) |

#### Form & Button IDs

| Element ID | Purpose |
|------------|---------|
| `priority:priority-editor-form` | Form identifier |
| `priority:btnCancel` | Cancel button (Abbrechen) |
| `priority:btnSubmit` | Submit button (Hinzufügen) |

#### Country Options (224 countries)

Common country codes for foreign priority claims:

| Value | Display Text | Notes |
|-------|--------------|-------|
| `DE` | Deutschland | (Rarely used for foreign priority) |
| `US` | Vereinigte Staaten von Amerika | |
| `GB` | Großbritannien | |
| `FR` | Frankreich | |
| `CH` | Schweiz | |
| `AT` | Österreich | |
| `JP` | Japan | |
| `CN` | China | |
| `KR` | Korea, Republik | |
| `EM` | EM Amt der Europäischen Union für geistiges Eigentum (EUIPO) | EU trademark |
| `WO` | WIPO (Madrid System) | International registration |
| ... | (220+ more countries) | |

---

### Exhibition Priority (Ausstellungspriorität) - §35 MarkenG

**Page Title**: "DPMADirektWeb | Prioritäten"

If goods/services were shown under the trademark at an officially recognized exhibition within the last 6 months, you can claim that exhibition date as priority.

#### Form Fields

| Field ID | Type | Required | Description |
|----------|------|----------|-------------|
| `priority:priorityDate:valueHolder_input` | date picker | **Yes** | Exhibition date (Datum) - Format: dd.mm.yyyy |
| `priority:exhibitonName:valueHolder` | text | **Yes** | Exhibition name (Ausstellungsname) - **Note: typo in DPMA field name** |

#### Form & Button IDs

| Element ID | Purpose |
|------------|---------|
| `priority:priority-editor-form` | Form identifier |
| `priority:btnCancel` | Cancel button (Abbrechen) |
| `priority:btnSubmit` | Submit button (Hinzufügen) |

**Note**: The exhibition must be one officially recognized by the German Federal Ministry of Justice (published in Bundesanzeiger).

---

### Date Picker Configuration

The date picker is a PrimeFaces calendar widget with these settings:

| Setting | Value |
|---------|-------|
| Date Format | `dd.mm.yy` (German: 23.12.2025) |
| Locale | German |
| First Day | Monday (1) |
| Selection Mode | Single |

---

### Date Validation Rules

The DPMA server enforces these validation rules for priority dates:

| Rule | Error Message (German) | Error Message (English) |
|------|------------------------|------------------------|
| No future dates | "Das angegebene Datum darf nicht in der Zukunft liegen." | Date cannot be in the future |
| Max 6 months old | "Das Prioritätsdatum sollte nicht älter als '6' Monate sein." | Priority date cannot be older than 6 months |

**Implementation Note**: Our API validates dates client-side before submission to prevent unnecessary server round-trips.

---

### Important Notes

1. **Proof Required**: "Die Nachweise für die Prioritäten müssen schriftlich nachgereicht werden." (Priority proofs must be submitted in writing later - you will be notified by DPMA after fee payment)

2. **Multiple Claims**: You can add multiple priority claims (both foreign and exhibition).

3. **Time Limit**: Both priority types have a strict 6-month deadline from the original filing/exhibition date.

---

### Navigation Buttons

| Button ID | Text | Action |
|-----------|------|--------|
| `cmd-link-prev` | Zurück | Go back to Step 5 |
| `cmd-link-next` | Weiter | Proceed to Step 7 |

---

## Step 7: Zahlung (Payment)

**Page Title**: "DPMADirektWeb | Markenanmeldung - Zahlung"

**dpmaViewId for navigation to Step 8**: `submit`

### Payment Method Selection

| Field ID | Type | Description |
|----------|------|-------------|
| `paymentForm:paymentTypeSelectOneRadio` | radio | Payment method selection |

#### Payment Method Options

| Value | Display Text | Description |
|-------|--------------|-------------|
| `UEBERWEISUNG` | Überweisung | Bank transfer |
| `SEPASDD` | SEPA-Lastschrift | SEPA direct debit |

---

### Fee Calculation Display

The page displays the calculated fees based on:
- Base fee for trademark registration
- Number of Nice classes (more than 3 classes incurs additional fees)
- Any additional services selected

---

### SEPA Direct Debit Fields

If `SEPASDD` is selected, additional SEPA fields may be required:

| Field ID | Type | Description |
|----------|------|-------------|
| TBD | text | Mandatsreferenznummer (Mandate reference number) |
| TBD | text | IBAN |

**Note**: SEPA direct debit requires a pre-registered mandate with DPMA.

---

### Navigation Buttons

| Button ID | Text | Action |
|-----------|------|--------|
| `cmd-link-prev` | Zurück | Go back to Step 6 |
| `cmd-link-next` | Weiter | Proceed to Step 8 |

---

## Step 8: Zusammenfassung (Summary)

**Page Title**: "DPMADirektWeb | Markenanmeldung - Zusammenfassung"

**This is the final step** - clicking submit will send the trademark application to DPMA.

### Summary Display

Step 8 displays a summary of all entered information for review:
- Applicant details
- Representative details (if any)
- Delivery address
- Trademark information
- Nice classes and goods/services
- Additional options
- Payment method and calculated fees

---

### Confirmation Fields

| Field ID | Type | Required | Description |
|----------|------|----------|-------------|
| `chBoxConfirmText_input` | checkbox | **Yes** | Confirmation that all information is correct |
| `applicantNameTextField:valueHolder` | text | **Yes** | Sender name (applicant name for confirmation) |

---

### PDF Preview

Before submitting, users can generate a PDF preview of the application.

---

### Submit Button

| Button ID | Text | Action |
|-----------|------|--------|
| `btnSubmitRegistration` | Anmeldung absenden | Submit the trademark application |

**IMPORTANT**: This button triggers the final submission. After clicking:
1. The application is sent to DPMA
2. A transaction ID is returned
3. The user is redirected to the Versand (confirmation) page

---

### Response After Submission

After successful submission, the response contains:
- `transactionId` - Encrypted transaction ID for tracking
- Redirect to `/DpmaDirektWebVersand/flowReturn.xhtml` with the transaction ID

---

### Navigation Buttons

| Button ID | Text | Action |
|-----------|------|--------|
| `cmd-link-prev` | Zurück | Go back to Step 7 |
| `btnSubmitRegistration` | Anmeldung absenden | Final submission |

---

## JSF Session Fields (All Steps)

These hidden fields are required for all form submissions:

| Field Name | Description |
|------------|-------------|
| `jakarta.faces.ViewState` | JSF ViewState token (changes with each request) |
| `jakarta.faces.ClientWindow` | JSF ClientWindow (format: `{UUID}:{counter}`) |
| `primefaces.nonce` | PrimeFaces CSRF nonce |
| `editor-form` | Form identifier (value: `editor-form`) |
| `editorPanel_active` | Active panel tracking |

---

## dpmaViewId Values Summary

| Navigation | dpmaViewId Value |
|------------|------------------|
| Step 1 → Step 2 | `agents` |
| Step 2 → Step 3 | `correspondence` |
| Step 3 → Step 4 | `trademark` |
| Step 4 → Step 5 | `wdvz` |
| Step 5 → Step 6 | `priorities` |
| Step 6 → Step 7 | `payment` |
| Step 7 → Step 8 | `submit` |
