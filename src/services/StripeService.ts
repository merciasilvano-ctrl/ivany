import { createStripeCheckoutSession } from './api';

// Kept as "StripeService" for backwards compatibility in the UI.
// Internally this now uses PayJSR checkout URLs.
export class StripeService {
  static async initStripe(_stripePublishableKey?: string): Promise<null> {
    return null;
  }

  /**
   * Create a checkout session for a product
   */
  static async createCheckoutSession(
    amount: number,
    currency: string = 'usd',
    productName: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<{ sessionId: string; checkoutUrl: string }> {
    try {
      const response = await createStripeCheckoutSession(
        amount,
        currency,
        productName,
        successUrl,
        cancelUrl
      );
      return {
        sessionId: response.sessionId,
        checkoutUrl: response.checkoutUrl,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  static async redirectToCheckout(sessionIdOrCheckoutUrl: string): Promise<void> {
    if (!sessionIdOrCheckoutUrl) {
      throw new Error('Invalid checkout URL');
    }
    window.location.href = sessionIdOrCheckoutUrl;
  }
} 