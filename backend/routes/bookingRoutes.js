import express from "express";
import { createBooking, getAllBookings, updateBooking, deleteBooking, getBookingById } from "../controllers/bookingController.js";

const router = express.Router();

router.post("/create-booking", createBooking);
router.get("/get-all-bookings", getAllBookings);
router.get("/:id", getBookingById);
router.patch("/:id", updateBooking);
router.delete("/:id", deleteBooking);

export default router;
