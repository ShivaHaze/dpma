# DPMA Trademark Registration API

Automated German trademark registration via the DPMA (Deutsches Patent- und Markenamt) online portal.

## Overview

This API automates the complete trademark registration process with the German Patent and Trademark Office (DPMA). It handles:

- Session management and CSRF token handling
- Multi-step form submission (8 steps)
- Nice classification selection
- Payment method configuration
- Receipt document download

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (with debug logging)
npm run dev

# Or build and run production
npm run build
npm start
```

Server runs on `http://localhost:3000` by default.

## API Reference

### Health Check

```http
GET /health
```

Returns server status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-18T12:00:00.000Z"
}
```

### Register Trademark

```http
POST /api/trademark/register
Content-Type: application/json
```

Submits a trademark registration to DPMA.

## Request Format

### Complete Example (Natural Person)

```bash
curl -X POST http://localhost:3000/api/trademark/register \
  -H "Content-Type: application/json" \
  -d '{
    "applicant": {
      "type": "natural",
      "salutation": "Herr",
      "firstName": "Max",
      "lastName": "Mustermann",
      "address": {
        "street": "Musterstraße",
        "houseNumber": "123",
        "zip": "80331",
        "city": "München",
        "country": "DE"
      }
    },
    "email": "max@example.com",
    "sanctions": {
      "declaration": "NONE",
      "hasRussianNationality": false,
      "hasRussianResidence": false
    },
    "trademark": {
      "type": "word",
      "text": "MyBrandName"
    },
    "niceClasses": [
      { "classNumber": 9 },
      { "classNumber": 42 }
    ],
    "paymentMethod": "UEBERWEISUNG"
  }'
```

### Complete Example (Legal Entity / Company)

```bash
curl -X POST http://localhost:3000/api/trademark/register \
  -H "Content-Type: application/json" \
  -d '{
    "applicant": {
      "type": "legal",
      "companyName": "Muster GmbH",
      "legalForm": "GmbH",
      "address": {
        "street": "Industriestraße",
        "houseNumber": "45",
        "zip": "10115",
        "city": "Berlin",
        "country": "DE"
      }
    },
    "email": "legal@muster-gmbh.de",
    "sanctions": {
      "declaration": "NONE",
      "hasRussianNationality": false,
      "hasRussianResidence": false
    },
    "trademark": {
      "type": "word",
      "text": "MusterBrand"
    },
    "niceClasses": [
      { "classNumber": 35 }
    ],
    "paymentMethod": "UEBERWEISUNG"
  }'
```

## Request Schema

### Root Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `applicant` | object | Yes | Applicant information (see below) |
| `email` | string | Yes | Contact email for correspondence |
| `sanctions` | object | Yes | EU sanctions declaration (see below) |
| `trademark` | object | Yes | Trademark details (see below) |
| `niceClasses` | array | Yes | At least one Nice class (see below) |
| `leadClass` | number | No | Lead class number (defaults to first class) |
| `paymentMethod` | string | Yes | `"UEBERWEISUNG"` (bank transfer) or `"SEPA_LASTSCHRIFT"` |
| `sepaDetails` | object | Conditional | Required if paymentMethod is `"SEPA_LASTSCHRIFT"` |
| `options` | object | No | Additional options (see below) |
| `internalReference` | string | No | Your internal reference number |

### Applicant Object

#### Natural Person (`type: "natural"`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"natural"` |
| `salutation` | string | No | `"Herr"`, `"Frau"`, or empty |
| `firstName` | string | Yes | First name |
| `lastName` | string | Yes | Last name |
| `address` | object | Yes | Address object (see below) |

#### Legal Entity (`type: "legal"`)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Must be `"legal"` |
| `companyName` | string | Yes | Company name |
| `legalForm` | string | No | Legal form (GmbH, AG, etc.) |
| `address` | object | Yes | Address object (see below) |

### Address Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `street` | string | Yes | Street name |
| `houseNumber` | string | Yes | House/building number |
| `zip` | string | Yes | Postal code (5 digits for Germany) |
| `city` | string | Yes | City name |
| `country` | string | Yes | ISO 3166-1 alpha-2 code (e.g., `"DE"`, `"AT"`, `"CH"`) |
| `addressLine1` | string | No | Additional address line |
| `addressLine2` | string | No | Additional address line |

### Sanctions Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `declaration` | string | No | `"NONE"` (default) |
| `hasRussianNationality` | boolean | Yes | Must be `false` to proceed |
| `hasRussianResidence` | boolean | Yes | Must be `false` to proceed |

### Trademark Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | `"word"`, `"figurative"`, or `"combined"` |
| `text` | string | Conditional | Required for `"word"` and `"combined"` types |
| `imageData` | Buffer | Conditional | Required for `"figurative"` and `"combined"` types |
| `imageMimeType` | string | Conditional | MIME type of image (e.g., `"image/png"`) |
| `imageFileName` | string | Conditional | Original filename of image |

### Nice Classes Array

Each element in the array:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `classNumber` | number | Yes | Class number (1-45) |
| `terms` | string[] | No | Specific terms within the class |

### Options Object (Optional)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `acceleratedExamination` | boolean | false | Request accelerated examination (+€200) |
| `certificationMark` | boolean | false | Register as certification mark |
| `licensingDeclaration` | boolean | false | Include licensing willingness declaration |
| `saleDeclaration` | boolean | false | Include sale willingness declaration |

### SEPA Details Object (Required for SEPA payment)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `iban` | string | Yes | Bank account IBAN |
| `bic` | string | Yes | Bank BIC/SWIFT code |
| `accountHolder` | string | Yes | Account holder name |

## Response Format

### Success Response (HTTP 201)

```json
{
  "success": true,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-18T12:41:05.000Z",
  "data": {
    "aktenzeichen": "302025261416.4",
    "drn": "2025121812410513WA",
    "transactionId": "20251218124058138",
    "submissionTime": "2025-12-18T12:41:05.250297138",
    "fees": [
      {
        "code": "331000",
        "description": "Anmeldeverfahren - bei elektronischer Anmeldung",
        "amount": 290
      }
    ],
    "payment": {
      "method": "UEBERWEISUNG",
      "totalAmount": 290,
      "currency": "EUR",
      "bankDetails": {
        "recipient": "Bundeskasse",
        "iban": "DE84 7000 0000 0070 0010 54",
        "bic": "MARKDEF1700",
        "reference": "302025261416.4"
      }
    },
    "receipt": {
      "filename": "W7005-01.PDF",
      "mimeType": "application/octet-stream",
      "dataBase64": "JVBERi0xLjQK..."
    },
    "receiptFilePath": "/path/to/receipts/302025261416_4_W7005-01.PDF"
  }
}
```

#### Response Fields

| Field | Description |
|-------|-------------|
| `aktenzeichen` | Official DPMA file reference number |
| `drn` | Document reference number |
| `transactionId` | DPMA transaction identifier |
| `submissionTime` | ISO 8601 timestamp of submission |
| `fees` | Array of applicable fees |
| `payment.bankDetails` | Bank transfer details (use `aktenzeichen` as reference!) |
| `receipt` | Base64-encoded PDF receipt |
| `receiptFilePath` | Local file path where receipt PDF was saved |

### Error Response (HTTP 400/500)

```json
{
  "success": false,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-12-18T12:00:00.000Z",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "applicant.address.zip", "message": "Invalid German postal code" }
    ]
  }
}
```

#### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed (check `details` array) |
| `SESSION_ERROR` | Failed to establish session with DPMA |
| `SUBMISSION_ERROR` | Form submission failed |
| `UNKNOWN_ERROR` | Unexpected error occurred |

## Fees

| Description | Amount |
|-------------|--------|
| Base fee (1-3 classes, electronic filing) | €290 |
| Each additional class (4+) | €100 |
| Accelerated examination (optional) | €200 |

## Nice Classification Reference

The Nice Classification divides goods and services into 45 classes:

### Goods (Classes 1-34)

| Class | Description |
|-------|-------------|
| 9 | Electronics, software, apps, computers |
| 25 | Clothing, footwear, headgear |
| 28 | Games, toys, sporting goods |
| 30 | Coffee, tea, pastry, confectionery |

### Services (Classes 35-45)

| Class | Description |
|-------|-------------|
| 35 | Advertising, business management, retail |
| 41 | Education, entertainment, sports |
| 42 | IT services, software development, SaaS |
| 43 | Restaurant, hotel, catering services |

## File Structure

```
dpma/
├── src/
│   ├── index.ts              # Application entry point
│   ├── api/
│   │   └── server.ts         # Express server & routes
│   ├── client/
│   │   └── DPMAClient.ts     # DPMA HTTP client
│   ├── types/
│   │   └── dpma.ts           # TypeScript type definitions
│   └── validation/
│       └── validateRequest.ts # Request validation
├── receipts/                  # Downloaded receipt PDFs (auto-created)
├── debug/                     # Debug files when DEBUG=true (auto-created)
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `DEBUG` | `false` | Enable debug logging and file output |
| `NODE_ENV` | `development` | Environment mode |

## Important Notes

1. **Real Submissions**: This API submits REAL trademark applications to DPMA. Each submission incurs real fees (minimum €290).

2. **Payment Deadline**: After submission, payment must be made within **3 months** using the provided bank details and the `aktenzeichen` as payment reference. Failure to pay results in automatic withdrawal of the application.

3. **Receipt Storage**: Receipt PDFs are automatically saved to the `receipts/` folder with the format `{aktenzeichen}_{filename}.pdf`.

4. **Debug Mode**: When `DEBUG=true`, detailed logs are output and response XMLs are saved to the `debug/` folder for troubleshooting.

5. **Nice Classes**: The API currently selects the first available term group for each Nice class. For specific term selection within classes, additional development may be needed.

6. **Image Trademarks**: File upload for figurative/combined marks is partially implemented. Word marks (`type: "word"`) are fully supported.

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Type checking
npx tsc --noEmit
```

## License

Private/Internal Use
