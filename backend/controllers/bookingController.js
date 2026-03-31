import Booking from "../models/bookings.js";
import User from "../models/User.js";
import sendEmail from "../sendEmail.js";
import { generateBookingEmailHTML } from "../utils/emailTemplates.js";

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
    bookingData.bookingId = bookingId;

    if (bookingData.paymentMethod === "Paypal" && !bookingData.paypalCaptureId) {
      return res.status(400).json({
        success: false,
        message: "PayPal payment confirmation is required for this booking.",
      });
    }

    if (bookingData.paymentMethod === "Stripe" && !bookingData.stripeSessionId) {
      return res.status(400).json({
        success: false,
        message: "Stripe payment confirmation is required for this booking.",
      });
    }

    const newBooking = new Booking(bookingData);
    await newBooking.save();

    try {
      const superadmin = await User.findOne({ companyId: bookingData.companyId, role: "superadmin" });
      if (superadmin) {
        const companyData = {
          superadminName: superadmin.fullName,
          superadminCompanyName: superadmin.superadminCompanyName,
          superadminCompanyLogo: superadmin.superadminCompanyLogo,
          superadminCompanyEmail: superadmin.superadminCompanyEmail,
          superadminCompanyPhoneNumber: superadmin.superadminCompanyPhoneNumber,
          superadminCompanyAddress: superadmin.superadminCompanyAddress,
        };

        const passengerHtml = generateBookingEmailHTML(newBooking, companyData, "passenger");
        const adminHtml = generateBookingEmailHTML(newBooking, companyData, "admin");

        await sendEmail(newBooking.passenger.email, `Booking Confirmation #${newBooking.bookingId}`, {
          html: passengerHtml,
          fromName: companyData.superadminCompanyName || "Booking Confirmation",
        });

        if (superadmin.email) {
          await sendEmail(superadmin.email, `New Booking Received #${newBooking.bookingId}`, {
            html: adminHtml,
            fromName: "Booking System",
          });
        }
      }
    } catch (emailError) {
      console.error("Email notification error:", emailError);
    }

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
        message: "Booking not found",
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

export const updatBookingStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
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

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const oldBooking = await Booking.findById(id).lean();
    if (!oldBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const booking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    const isDifferent = (oldVal, newVal) => {
      if (newVal === undefined) return false;
      if (oldVal === newVal) return false;
      if (typeof oldVal !== 'object' && typeof newVal !== 'object') {
        return String(oldVal || '').trim() !== String(newVal || '').trim();
      }
      return false;
    };

    const changedFields = [];
    const fieldsToTrack = [
      "pickup", "dropoff", "date", "hour", "minute",
      "pickupDoorNumber", "pickupAccess", "pickupFloorNo",
      "dropoffAccess", "dropoffFloorNo", "paymentMethod", "bookingType",
      "notes", "estimatedDuration", "extraTime", "passengerCount", "inventoryItems", "source"
    ];

    fieldsToTrack.forEach(field => {
      if (isDifferent(oldBooking[field], updateData[field])) {
        changedFields.push(field);
      }
    });

    if (updateData.vehicle && updateData.vehicle.vehicleName !== oldBooking.vehicle?.vehicleName) {
      changedFields.push("vehicle");
    }

    if (updateData.vehicle?.extraHelp?.label !== oldBooking.vehicle?.extraHelp?.label) {
      changedFields.push("crew");
    }

    if (updateData.fareBreakdown) {
      const oldTotal = Number(oldBooking.fareBreakdown?.total || 0).toFixed(2);
      const newTotal = Number(updateData.fareBreakdown?.total || 0).toFixed(2);
      if (oldTotal !== newTotal) {
        changedFields.push("fareBreakdown");
      }
    }

    if (isDifferent(oldBooking.passenger?.name, updateData.passenger?.name)) changedFields.push("passengerName");
    if (isDifferent(oldBooking.passenger?.email, updateData.passenger?.email)) changedFields.push("passengerEmail");
    if (isDifferent(oldBooking.passenger?.phone, updateData.passenger?.phone)) changedFields.push("passengerPhone");

    for (let i = 1; i <= 4; i++) {
      const addrField = `additionalDropoff${i}`;
      const accessField = `additionalDropoff${i}Access`;
      const floorField = `additionalDropoff${i}FloorNo`;
      if (isDifferent(oldBooking[addrField], updateData[addrField])) changedFields.push(addrField);
      if (isDifferent(oldBooking[accessField], updateData[accessField])) changedFields.push(accessField);
      if (isDifferent(oldBooking[floorField], updateData[floorField])) changedFields.push(floorField);
    }

    if (changedFields.length > 0) {
      try {
        const superadmin = await User.findOne({ companyId: booking.companyId, role: "superadmin" });
        if (superadmin) {
          const companyData = {
            superadminName: superadmin.fullName,
            superadminCompanyName: superadmin.superadminCompanyName,
            superadminCompanyLogo: superadmin.superadminCompanyLogo,
            superadminCompanyEmail: superadmin.superadminCompanyEmail,
            superadminCompanyPhoneNumber: superadmin.superadminCompanyPhoneNumber,
            superadminCompanyAddress: superadmin.superadminCompanyAddress,
          };

          const passengerHtml = generateBookingEmailHTML(booking, companyData, "passenger", changedFields);

          await sendEmail(booking.passenger.email, `Booking Updated #${booking.bookingId}`, {
            html: passengerHtml,
            fromName: companyData.superadminCompanyName || "Booking Update",
          });
        }
      } catch (emailError) {
        console.error("Email notification error on update:", emailError);
      }
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
        message: "Booking not found",
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

export const sendBookingDetailsEmail = async (req, res) => {
  try {
    const { bookingId, email, type } = req.body;

    if (!bookingId || !email) {
      return res.status(400).json({
        success: false,
        message: "bookingId and email are required",
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("vehicle")
      .lean();

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const companyData = {
      superadminName: req.user?.fullName || "",
      name: req.user?.superadminCompanyName || "",
      address: req.user?.superadminCompanyAddress || "",
      phone: req.user?.superadminCompanyPhoneNumber || "",
      email: req.user?.superadminCompanyEmail || "",
      logo: req.user?.superadminCompanyLogo || "",
    };

    const emailType = type || "passenger";
    const html = generateBookingEmailHTML(booking, companyData, emailType);
    await sendEmail(email, `Booking Details #${booking.bookingId}`, {
      html,
      fromName: "Flexible Budget Removals Limited",
    });

    res.json({
      success: true,
      message: "Booking email sent successfully",
    });
  } catch (error) {
    console.error("sendBookingDetailsEmail error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send booking email",
    });
  }
};