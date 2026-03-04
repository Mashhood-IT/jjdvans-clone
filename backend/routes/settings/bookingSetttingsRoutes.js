import express from "express";
import {
    getBookingSetting,
    updateBookingSetting,
    getAdvanceBookingMinutes
} from "../controllers/settings/bookingSettingsController.js";
import { protect } from "../../middleware/authMiddleware.js";

const router = express.Router();

router.get("/get-booking-setting", protect, getBookingSetting);

router.put("/update-booking-setting", protect, updateBookingSetting);

router.get("/advance-booking-minutes", protect, getAdvanceBookingMinutes);

export default router;