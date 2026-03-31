import { getPaypalClient, paypal } from "../utils/paypalClient.js";
import BookingSetting from "../models/settings/bookingSettings.js";
import Stripe from "stripe";

const DEFAULT_CCY = "GBP";

export const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency, companyId } = req.body;

        if (!amount || !currency || !companyId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: amount, currency, or companyId",
            });
        }

        const settings = await BookingSetting.findOne({ companyId });
        if (!settings || !settings.stripeKeys || !settings.stripeKeys.secretKey) {
            return res.status(404).json({
                success: false,
                message: "Stripe is not configured for this company",
            });
        }

        const stripe = new Stripe(settings.stripeKeys.secretKey);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            metadata: { companyId },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
            publishableKey: settings.stripeKeys.publishableKey,
        });
    } catch (error) {
        console.error("Stripe Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment intent",
            error: error.message,
        });
    }
};

export const getPayPalConfig = async (req, res) => {
    try {
        const { companyId } = req.query;
        if (!companyId) {
            return res.status(400).json({ success: false, message: "Company ID is required" });
        }

        const settings = await BookingSetting.findOne({ companyId });
        const paypalKeys = settings?.paypalKeys || {};

        if (!paypalKeys.clientId || !paypalKeys.clientSecret) {
            return res.status(400).json({ 
                success: false, 
                message: "PayPal configuration (Client ID or Secret) missing for this company",
                isConfigured: false
            });
        }

        res.status(200).json({
            success: true,
            clientId: paypalKeys.clientId,
            currency: paypalKeys.currency || settings.currency?.[0]?.value || DEFAULT_CCY,
            mode: paypalKeys.mode || "sandbox",
            isConfigured: true
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPayPalOrder = async (req, res) => {
    try {
        const { amount, currency, companyId, bookingId } = req.body;

        if (!companyId) {
            return res.status(400).json({ success: false, message: "Company ID is required" });
        }

        const settings = await BookingSetting.findOne({ companyId });
        const paypalKeys = settings?.paypalKeys || {};

        if (!paypalKeys.clientId || !paypalKeys.clientSecret) {
            return res.status(400).json({ 
                success: false, 
                message: "PayPal credentials (Client ID or Secret) are missing for this company. Please add them in the dashboard." 
            });
        }

        const client = getPaypalClient({
            clientId: paypalKeys.clientId,
            clientSecret: paypalKeys.clientSecret,
            mode: paypalKeys.mode || "sandbox"
        });

        const request = new paypal.orders.OrdersCreateRequest();
        request.prefer("return=representation");
        request.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    reference_id: String(bookingId || "temp"),
                    amount: {
                        currency_code: (currency || paypalKeys.currency || DEFAULT_CCY).toUpperCase(),
                        value: Number(amount || 0).toFixed(2),
                    },
                    description: `Booking payment for company: ${companyId}`,
                },
            ],
            application_context: {
                user_action: "PAY_NOW",
            },
        });

        const response = await client.execute(request);
        res.status(200).json({ id: response.result.id, status: response.result.status });
    } catch (error) {
        console.error("PayPal Create Order Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to create PayPal order", 
            error: error.message 
        });
    }
};

export const capturePayPalOrder = async (req, res) => {
    try {
        const { orderID, companyId } = req.body;

        if (!orderID || !companyId) {
            return res.status(400).json({ success: false, message: "Order ID and Company ID are required" });
        }

        const settings = await BookingSetting.findOne({ companyId });
        const paypalKeys = settings?.paypalKeys || {};

        if (!paypalKeys.clientId || !paypalKeys.clientSecret) {
            return res.status(400).json({ 
                success: false, 
                message: "PayPal credentials (Client ID or Secret) are missing for this company." 
            });
        }

        const client = getPaypalClient({
            clientId: paypalKeys.clientId,
            clientSecret: paypalKeys.clientSecret,
            mode: paypalKeys.mode || "sandbox"
        });

        const request = new paypal.orders.OrdersCaptureRequest(orderID);
        request.requestBody({});
        
        const capture = await client.execute(request);
        res.status(200).json(capture.result);
    } catch (error) {
        console.error("PayPal Capture Order Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to capture PayPal order", 
            error: error.message 
        });
    }
};