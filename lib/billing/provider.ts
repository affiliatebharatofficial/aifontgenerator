export interface CheckoutSessionOptions {
  userId: string;
  planSlug: string;
  redirectUrl?: string;
}

export interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  error?: string;
}

export interface PaymentProvider {
  name: string;
  isConfigured: boolean;
  createCheckoutSession(options: CheckoutSessionOptions): Promise<CheckoutResult>;
  verifyWebhookSignature(payload: string, signature: string): Promise<boolean>;
}

/**
 * Noop Payment Provider for Launch Mode (Free Launch Edition)
 */
export class NoopPaymentProvider implements PaymentProvider {
  name = 'Noop (Free Launch)';
  isConfigured = false;

  async createCheckoutSession(): Promise<CheckoutResult> {
    return {
      success: false,
      error: 'Billing is not configured for initial free launch edition.',
    };
  }

  async verifyWebhookSignature(): Promise<boolean> {
    return false;
  }
}

/**
 * Canonical billing provider instance (defaults to Noop for free launch)
 */
export const defaultPaymentProvider: PaymentProvider = new NoopPaymentProvider();
