import Stripe from "stripe";
import BookingSetting from "../models/settings/bookingSettings.js";

export const createPaymentIntent = async (req, res) => {
    try {
        const { amount, currency, companyId } = req.body;

        if (!amount || !currency || !companyId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: amount, currency, or companyId",
            });
        }

        // Fetch Stripe keys for this company
        const settings = await BookingSetting.findOne({ companyId });
        if (!settings || !settings.stripeKeys || !settings.stripeKeys.secretKey) {
            return res.status(404).json({
                success: false,
                message: "Stripe is not configured for this company",
            });
        }

        const stripe = new Stripe(settings.stripeKeys.secretKey);

        // Create PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents
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

// PayPal Helper: Get Access Token
const getPayPalAccessToken = async (clientId, clientSecret) => {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
        method: "POST",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    const data = await response.json();
    return data.access_token;
};

export const getPayPalConfig = async (req, res) => {
    try {
        const { companyId } = req.query;
        if (!companyId) {
            return res.status(400).json({ success: false, message: "Company ID is required" });
        }

        const settings = await BookingSetting.findOne({ companyId });
        if (!settings || !settings.paypalKeys || !settings.paypalKeys.clientId) {
            return res.status(404).json({ success: false, message: "PayPal is not configured" });
        }

        res.status(200).json({
            success: true,
            clientId: settings.paypalKeys.clientId,
            currency: settings.currency?.[0]?.value || "GBP",
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createPayPalOrder = async (req, res) => {
    try {
        const { amount, currency, companyId } = req.body;

        const settings = await BookingSetting.findOne({ companyId });
        if (!settings || !settings.paypalKeys || !settings.paypalKeys.clientId) {
            return res.status(404).json({ success: false, message: "PayPal is not configured" });
        }

        const accessToken = await getPayPalAccessToken(
            settings.paypalKeys.clientId,
            settings.paypalKeys.clientSecret
        );

        const response = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: currency.toUpperCase(),
                            value: amount.toString(),
                        },
                    },
                ],
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("PayPal API Error:", data);
            return res.status(response.status).json({
                success: false,
                message: data.message || "PayPal order creation failed",
                details: data
            });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("PayPal Create Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const capturePayPalOrder = async (req, res) => {
    try {
        const { orderID, companyId } = req.body;

        const settings = await BookingSetting.findOne({ companyId });
        if (!settings || !settings.paypalKeys || !settings.paypalKeys.clientId) {
            return res.status(404).json({ success: false, message: "PayPal is not configured" });
        }

        const accessToken = await getPayPalAccessToken(
            settings.paypalKeys.clientId,
            settings.paypalKeys.clientSecret
        );

        const response = await fetch(
            `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("PayPal Capture API Error:", data);
            return res.status(response.status).json({
                success: false,
                message: data.message || "PayPal order capture failed",
                details: data
            });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("PayPal Capture Order Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};