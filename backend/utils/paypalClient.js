import paypal from '@paypal/checkout-server-sdk';

export function getPaypalClient(credentials = {}) {
  const clientId = credentials.clientId || process.env.PAYPAL_CLIENT_ID;
  const clientSecret = credentials.clientSecret || process.env.PAYPAL_CLIENT_SECRET;
  const mode = credentials.mode || process.env.PAYPAL_MODE || "sandbox";

  const env =
    mode === "live"
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);

  return new paypal.core.PayPalHttpClient(env);
}

export { paypal };
