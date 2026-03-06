import express from "express";
import {
    createPaymentIntent,
    getPayPalConfig,
    createPayPalOrder,
    capturePayPalOrder
} from "../controllers/paymentController.js";

const router = express.Router();

router.post("/create-intent", createPaymentIntent);
router.get("/paypal-config", getPayPalConfig);
router.post("/paypal-create-order", createPayPalOrder);
router.post("/paypal-capture-order", capturePayPalOrder);

export default router;
