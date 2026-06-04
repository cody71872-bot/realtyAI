const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Service modules built by Integrations Engineer
const sheetsService = require('./services/sheets');
const emailService = require('./services/email');
const contentGenService = require('./services/contentGen');
const stripeService = require('./services/stripe');
const storeService = require('./services/store');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chatbot Lead Endpoint
app.post('/api/chatbot/lead', async (req, res) => {
  const { name, email, phone, type, budget, timeline } = req.body;
  console.log('Received chatbot lead:', { name, email, phone, type, budget, timeline });

  // Basic validation
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    // Save to in-memory store
    storeService.addLead(req.body);

    // Append to Google Sheets
    await sheetsService.appendLead(req.body);
    
    // Send email notification to agent
    await emailService.sendAgentNotification(req.body);

    res.status(201).json({ 
      message: 'Lead captured successfully',
      lead: { name, email }
    });
  } catch (error) {
    console.error('Error processing chatbot lead:', error);
    res.status(500).json({ error: 'Failed to process lead' });
  }
});

// Open House Register Endpoint
app.post('/api/openhouse/register', async (req, res) => {
  const { name, email, phone, currentStatus, timeline } = req.body;
  console.log('Received open house registration:', { name, email, phone, currentStatus, timeline });

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Map form data to service expected fields
  const visitorData = {
    ...req.body,
    rentOrOwn: currentStatus // sheets.js and email.js expect rentOrOwn
  };

  try {
    // Save to in-memory store
    storeService.addVisitor(visitorData);

    // Append to Google Sheets
    await sheetsService.appendOpenHouse(visitorData);
    
    // Send notification to agent
    await emailService.sendAgentOpenHouseNotification(visitorData);
    
    // Send follow-up email to visitor
    await emailService.sendVisitorFollowUp(visitorData, process.env.AGENT_NAME || "Your Agent");

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error processing open house registration:', error);
    res.status(500).json({ error: 'Failed to process registration' });
  }
});

// Content Generate Endpoint
app.post('/api/content/generate', async (req, res) => {
  const { address, beds, baths, price, features } = req.body;
  console.log('Content generation request:', { address, beds, baths, price, features });

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  // Map form data to service expected fields
  const propertyData = {
    address,
    bedrooms: beds,
    bathrooms: baths,
    price,
    features
  };

  try {
    // Generate content using OpenAI
    const generatedContent = await contentGenService.generateListingContent(propertyData);
    
    // Save to in-memory store
    storeService.addContent({ ...propertyData, ...generatedContent });

    // Append generated content to Google Sheets for record keeping
    await sheetsService.appendContent({ 
      ...propertyData, 
      ...generatedContent 
    });

    res.json(generatedContent);
  } catch (error) {
    console.error('Error generating content:', error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

// Admin Dashboard Routes
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'dashboard.html'));
});

app.get('/onboarding', (req, res) => {
  res.sendFile(path.join(__dirname, 'onboarding', 'index.html'));
});

app.get('/api/admin/leads', (req, res) => {
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(storeService.getLeads());
});

app.get('/api/admin/visitors', (req, res) => {
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(storeService.getVisitors());
});

app.get('/api/admin/content', (req, res) => {
  if (req.headers['x-admin-password'] !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json(storeService.getContent());
});

// Static File Routes for Forms
app.get('/openhouse/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'openhouse', 'form.html'));
});

app.get('/content/form', (req, res) => {
  res.sendFile(path.join(__dirname, 'content-gen', 'form.html'));
});

// Serve the widget script
app.get('/widget/chatbot.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'chatbot', 'widget.js'));
});

// Serve the widget CSS
app.get('/widget/chatbot.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'chatbot', 'widget.css'));
});

app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  req.rawBody = req.body;
  let event;
  try {
    event = stripeService.constructEvent(req.rawBody, req.headers['stripe-signature']);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Checkout session completed:', event.data.object.id);
      break;
    case 'invoice.paid':
      console.log('Invoice paid:', event.data.object.id);
      break;
    case 'customer.subscription.deleted':
      console.log('Subscription deleted:', event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

app.post('/api/billing/create-checkout', async (req, res) => {
  const { customerEmail, tier } = req.body;
  const domain = process.env.DOMAIN || 'http://localhost:3000';
  const successUrl = `${domain}/onboarding?tier=${tier}`;
  const cancelUrl = domain;

  try {
    const session = await stripeService.createCheckoutSession(tier, customerEmail, successUrl, cancelUrl);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/billing/portal', async (req, res) => {
  const { customerId, returnUrl } = req.query;
  const finalReturnUrl = returnUrl || process.env.DOMAIN || 'http://localhost:3000';
  try {
    const session = await stripeService.createPortalSession(customerId, finalReturnUrl);
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/billing/status/:subscriptionId', async (req, res) => {
  const { subscriptionId } = req.params;
  try {
    const subscription = await stripeService.getSubscriptionStatus(subscriptionId);
    res.json({ status: subscription.status });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
