import Booking from "../models/bookings.js";

export const createBooking = async (req, res) => {
    try {
        const bookingData = req.body;
        const generateNextBookingId = async () => {
            const lastBooking = await Booking.findOne()
                .sort({ bookingId: -1 })
                .limit(1);
            return lastBooking?.bookingId
                ? (parseInt(lastBooking.bookingId, 10) + 1).toString()
                : "50301";
        };

        const bookingId = await generateNextBookingId();
        bookingData.bookingId = bookingId

        const newBooking = new Booking(bookingData);
        await newBooking.save();

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
            error: error.message,
        });
    }
};

export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, bookings });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching bookings",
            error: error.message,
        });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }
        res.status(200).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const booking = await Booking.findByIdAndUpdate(id, updateData, { new: true });
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            booking,
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};

export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByIdAndDelete(id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
        });

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            success: false,
            error: error.message,
        });
    }
};