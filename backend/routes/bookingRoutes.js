import express from "express";
import { createBooking, getAllBookings, updateBooking, deleteBooking, getBookingById, sendBookingDetailsEmail, updatBookingStatus } from "../controllers/bookingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-booking", createBooking);
router.get("/get-all-bookings", getAllBookings);
router.get("/:id", getBookingById);
router.patch("/:id", updateBooking);
router.patch("/update-booking-status", updatBookingStatus);
router.delete("/:id", deleteBooking);
router.post("/send-booking-email", protect, sendBookingDetailsEmail);

export default router;
