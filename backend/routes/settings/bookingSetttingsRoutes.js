import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { getAdvanceBookingMinutes, getBookingSetting, updateBookingSetting, getPublicBookingSetting } from "../../controllers/settings/bookingSettingsController.js";

const router = express.Router();

router.get("/get-booking-setting", protect, getBookingSetting);

router.post("/update-booking-setting", protect, updateBookingSetting);

router.post("/advance-booking-minutes", protect, getAdvanceBookingMinutes);

router.get("/public/:companyId", getPublicBookingSetting);

export default router;