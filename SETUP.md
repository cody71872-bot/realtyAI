# RealtyAI — Complete Setup Guide

## Overview

RealtyAI is a turnkey AI automation system for real estate agents. It has three services:

1. **Lead Chatbot** — Floating chat bubble on the agent's website that captures leads
2. **Open House Automation** — QR code → visitor form → auto follow-up emails
3. **Listing Content Generator** — Property details → AI-generated Instagram captions, story scripts, newsletter intros

This guide walks you through getting it live from zero to selling.

---

## Step 1: Deploy to Railway (takes 5 minutes)

Railway is a hosting platform. It gives you a real URL (not localhost).

1. Go to **https://railway.app**
2. Click **"Start a New Project"** → **"Deploy from GitHub repo"**
3. Connect your GitHub account and select the `realtyAI` repository
4. Railway auto-detects our Dockerfile and deploys instantly
5. Once it deploys, you'll get a URL like `https://realtyai.up.railway.app`

> **Alternative:** If you prefer Render.com, our `render.yaml` is ready — just connect the repo there instead.

### Add Environment Variables

In Railway's dashboard, go to your project → **Variables** tab. Add every variable from below.

---

## Step 2: Set up Google Sheets (for storing leads)

1. Go to **https://console.cloud.google.com**
2. Create a new project (or use existing)
3. Enable the **Google Sheets API**
4. Go to **Credentials** → **Create Credentials** → **Service Account**
5. Name it "realtyai-service-account"
6. After creation, click the service account → **Keys** → **Add Key** → **JSON**
7. A JSON file downloads — this is your credentials file
8. Copy the entire contents of that JSON file — that's your `GOOGLE_CREDENTIALS_JSON` value
9. Create a Google Sheet with three tabs (sheets at the bottom):
   - **Leads** (columns: Name, Email, Phone, Type, Budget, Timeline, Timestamp)
   - **OpenHouse** (columns: Name, Email, Phone, RentOwn, Timeline, Timestamp)
   - **Content** (columns: Address, Beds, Baths, Price, Features, Caption, StoryScript, Newsletter, Timestamp)
10. Share the Google Sheet with the service account email (looks like `realtyai@your-project.iam.gserviceaccount.com`) — give it **Editor** access
11. Copy the spreadsheet ID from the URL: `https://docs.google.com/spreadsheets/d/THIS-IS-THE-ID/edit`

### Variables for this step:
```
GOOGLE_CREDENTIALS_JSON={"type":"service_account","project_id":"..."}  (the whole JSON you downloaded)
GOOGLE_SHEET_ID_LEADS=abc123...
GOOGLE_SHEET_ID_OPENHOUSE=abc123...  (can use same sheet ID for all three)
GOOGLE_SHEET_ID_CONTENT=abc123...    (can use same sheet ID for all three)
```

---

## Step 3: Set up SendGrid (for email notifications)

1. Go to **https://sendgrid.com** and sign up (free tier)
2. Go to **Settings** → **API Keys** → **Create API Key**
3. Choose **Full Access** and copy the key
4. Verify a sender email address in SendGrid (Settings → Sender Authentication)

### Variables for this step:
```
SENDGRID_API_KEY=SG.xxxxx...
SMTP_HOST=smtp.sendgrid.net  (keep default)
SMTP_PORT=587                 (keep default)
SMTP_USER=apikey              (keep default)
SMTP_PASS=SG.xxxxx...         (same as SENDGRID_API_KEY)
EMAIL_FROM=you@verified-sender.com
AGENT_EMAIL=you@yourdomain.com
AGENT_NAME=Jane Smith
```

---

## Step 4: Set up OpenAI (for content generation)

1. Go to **https://platform.openai.com**
2. Sign up and add a payment method
3. Go to **API Keys** → **Create new secret key**
4. Copy your key (starts with `sk-...`)

### Variable for this step:
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 5: Set up Stripe (for taking payments)

1. Go to **https://dashboard.stripe.com** and sign up
2. Go to **Products** → **Add Product** (create 3 products):
   - **Starter** — $150/month — Lead chatbot only
   - **Growth** — $350/month — Chatbot + Open House
   - **Pro** — $800/month — Chatbot + Open House + Content Generator
3. For each product, Stripe gives you a **Price ID** that looks like `price_abc123`
4. Under **Developers** → **Webhooks** → **Add endpoint**:
   - Endpoint URL: `https://your-railway-url.railway.app/api/billing/webhook`
   - Events to listen for: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`
5. Copy the **Webhook Signing Secret** (starts with `whsec_...`)
6. Get your **Secret Key** from Developers → API Keys

### Variables for this step:
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STARTER_PRICE_ID=price_abc123
GROWTH_PRICE_ID=price_def456
PRO_PRICE_ID=price_ghi789
DOMAIN=https://your-railway-url.railway.app
```

---

## Step 6: Set admin password

Pick a password to protect the admin dashboard.

### Variable:
```
ADMIN_PASSWORD=your-secure-password
```

---

## Step 7: Add ALL env vars to Railway

Go to Railway → your project → **Variables**. Paste them all in. Railway will auto-restart your app.

---

## Step 8: Verify everything works

Open these URLs in your browser:

| Page | URL | What you'll see |
|------|-----|-----------------|
| Health check | `https://your-url.railway.app/api/health` | `{"status":"ok"}` |
| Open House Form | `https://your-url.railway.app/openhouse/form` | Mobile-friendly sign-in form |
| Content Generator | `https://your-url.railway.app/content/form` | Property form to generate content |
| Admin Dashboard | `https://your-url.railway.app/admin` | Login with your admin password |
| Onboarding | `https://your-url.railway.app/onboarding?tier=pro` | Agent setup instructions |
| Chatbot Widget | `https://your-url.railway.app/widget/chatbot.js` | The JavaScript file (minified) |

Test the lead capture:
```bash
curl -X POST https://your-url.railway.app/api/chatbot/lead \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Lead","email":"test@example.com","phone":"555-0000","type":"buy","budget":"500k","timeline":"immediate"}'
```

Check your Google Sheet — the lead should appear. Check your email — you should get a notification.

---

## How to Sell It

### Pricing to charge agents:

| Tier | Price | Services |
|------|-------|----------|
| **Starter** | **$150/mo** | Chatbot lead capture only |
| **Growth** | **$350/mo** | Chatbot + Open House automation |
| **Pro** | **$800/mo** | Chatbot + Open House + Content Generator |

### Your pitch:
> "You know how leads slip through the cracks? I have a system that captures every website visitor, qualifies them automatically, and sends you their details before they leave the page. It also handles your open house sign-ins and generates your social media content. No setup, no work — just results."

### Where to find agents:
- Walk into local real estate offices and offer a 30-day free trial
- Join real estate Facebook groups and offer value
- Go to open houses and demo the QR code system to the agent
- Cold call/email brokerages — pitch as a team tool

### Your cost to run this:
| Service | Cost |
|---------|------|
| Railway hosting | ~$5-20/mo |
| SendGrid (free tier) | $0 (100 emails/day free) |
| OpenAI | ~$0.01 per content generation |
| Stripe | 2.9% + $0.30 per transaction |
| Google Sheets | Free |

At 10 Pro clients at $800/mo = **$8,000/mo revenue**. Your costs would be ~$50 + Stripe fees.