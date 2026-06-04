const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
  const priceId = PRICE_IDS[tier];
  if (!priceId) {
    throw new Error(`Invalid tier: ${tier}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer_email: customerEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return session;
}

/**
 * Create a Stripe customer portal session
 * @param {string} customerId 
 * @param {string} returnUrl 
 * @returns {Promise<Object>} - The portal session object
 */
async function createPortalSession(customerId, returnUrl) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session;
}

/**
 * Verify Stripe webhook signature
 * @param {Buffer} rawBody 
 * @param {string} signature 
 * @returns {Object} - The verified Stripe event
 */
function constructEvent(rawBody, signature) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
}

/**
 * Get subscription details
 * @param {string} subscriptionId 
 * @returns {Promise<Object>}
 */
async function getSubscriptionStatus(subscriptionId) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Cancel a subscription at period end
 * @param {string} subscriptionId 
 * @returns {Promise<Object>}
 */
async function cancelSubscription(subscriptionId) {
  return await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

module.exports = {
  createCheckoutSession,
  createPortalSession,
  constructEvent,
  getSubscriptionStatus,
  cancelSubscription,
  PRICE_IDS,
  stripe
};
