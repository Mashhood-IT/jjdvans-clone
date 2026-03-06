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