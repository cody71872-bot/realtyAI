/**
 * Stripe billing service
 * Lazily initializes Stripe to avoid crashing the server when env vars aren't set.
 */
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
}

const PRICE_IDS = {
  starter: process.env.STARTER_PRICE_ID,
  growth: process.env.GROWTH_PRICE_ID,
  pro: process.env.PRO_PRICE_ID,
};

/**
 * Create a Stripe checkout session for a subscription
 * @param {string} tier - 'starter', 'growth', or 'pro'
 * @param {string} customerEmail 
 * @param {string} successUrl 
 * @param {string} cancelUrl 
 * @returns {Promise<Object>} - The checkout session object
 */
async function createCheckoutSession(tier, customerEmail, successUrl, cancelUrl) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe not configured (STRIPE_SECRET_KEY missing)');

  const priceId = PRICE_IDS[tier];
  if (!priceId) {
    throw new Error(`Invalid tier: ${tier}. Set ${tier.toUpperCase()}_PRICE_ID in env.`);
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: customerEmail,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
  });
  return session;
}

/**
 * Verify and handle Stripe webhooks
 * @param {Object} req - Express request object with rawBody
 */
function handleWebhook(req) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe not configured');

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  return stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
}

/**
 * Cancel a subscription at the end of the current period
 */
async function cancelSubscription(subscriptionId) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe not configured');

  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Get subscription status for a customer
 * @param {string} subscriptionId 
 * @returns {Promise<Object>} - Full subscription object
 */
async function getSubscriptionStatus(subscriptionId) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe not configured');

  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Create a Stripe customer portal session
 * @param {string} customerId 
 * @param {string} returnUrl 
 * @returns {Promise<Object>}
 */
async function createPortalSession(customerId, returnUrl) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe not configured');

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session;
}

module.exports = {
  createCheckoutSession,
  handleWebhook,
  cancelSubscription,
  getSubscriptionStatus,
  createPortalSession
};