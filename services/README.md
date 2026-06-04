# RealtyAI Services

This directory contains the core integration services for the RealtyAI platform.

## Services

### 1. Google Sheets (`sheets.js`)
Handles appending data to Google Sheets for leads, open house visitors, and generated content.

**Required Env Vars:**
- `GOOGLE_SERVICE_ACCOUNT_PATH` or `GOOGLE_CREDENTIALS_JSON`: Authentication for Google APIs.
- `GOOGLE_SHEET_ID_LEADS`: The ID of the spreadsheet for leads.
- `GOOGLE_SHEET_ID_OPENHOUSE`: The ID of the spreadsheet for open house visitors.
- `GOOGLE_SHEET_ID_CONTENT`: The ID of the spreadsheet for generated content.
*(Alternatively, `GOOGLE_SHEET_ID` can be used as a fallback for all three).*

**Functions:**
- `appendLead(leadData)`
- `appendOpenHouse(visitorData)`
- `appendContent(contentData)`

---

### 2. Email Service (`email.js`)
Handles sending notification emails to agents and follow-up emails to visitors using Nodemailer and SendGrid.

**Required Env Vars:**
- `SENDGRID_API_KEY` (or `SMTP_PASS`): For SMTP authentication.
- `SMTP_USER`: Default is `apikey`.
- `EMAIL_FROM`: The sender email address.
- `AGENT_EMAIL`: The email address where agent notifications are sent.

**Functions:**
- `sendAgentNotification(leadData)`
- `sendVisitorFollowUp(visitorData, agentName)`
- `sendAgentOpenHouseNotification(visitorData)`

---

### 3. Content Generation Service (`contentGen.js`)
Uses OpenAI's GPT-4 to generate social media and newsletter content based on property details.

**Required Env Vars:**
- `OPENAI_API_KEY`: For OpenAI API access.

**Functions:**
- `generateListingContent(propertyData)`: Returns `{ caption, storyScript, newsletterIntro }`.

---

### 4. Stripe Billing Service (`stripe.js`)
Handles Stripe subscription checkout sessions, customer portal, and webhooks.

**Required Env Vars:**
- `STRIPE_SECRET_KEY`: Stripe API secret key.
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret.
- `STARTER_PRICE_ID`: Stripe Price ID for the Starter tier ($150).
- `GROWTH_PRICE_ID`: Stripe Price ID for the Growth tier ($350).
- `PRO_PRICE_ID`: Stripe Price ID for the Pro tier ($800).
- `DOMAIN`: The base URL for success/cancel redirects.

**Functions:**
- `createCheckoutSession(customerEmail, priceId)`
- `handleWebhook(req)`
- `cancelSubscription(subscriptionId)`
- `getSubscriptionStatus(subscriptionId)`
- `getSubscriptionStatusByCustomer(customerId)`
- `getCustomerPortalSession(customerId)`

## Usage

```javascript
const sheets = require('./services/sheets');
const email = require('./services/email');
const contentGen = require('./services/contentGen');
const stripe = require('./services/stripe');
```
