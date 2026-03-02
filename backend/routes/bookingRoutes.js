import express from "express";
import { createBooking, getAllBookings, updateBookingStatus } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create-booking", createBooking);
router.get("/get-all-bookings", getAllBookings);
router.patch("/:id", updateBookingStatus);

export default router;
