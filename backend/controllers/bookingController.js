import Booking from "../models/bookings.js";

export const createBooking = async (req, res) => {
    try {
        const bookingData = req.body;
        console.log("Incoming Booking Data:", JSON.stringify(bookingData, null, 2));

        const newBooking = new Booking(bookingData);
        await newBooking.save();

        console.log("Booking saved successfully with ID:", newBooking._id);

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: newBooking,
        });
    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({
            success: false,
            message: "Server error while creating booking",
            error: error.message
        });
    }
};
