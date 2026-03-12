import Booking from "../models/bookings.js";
import sendEmail from "../sendEmail.js";

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
    const booking = await Booking.findByIdAndUpdate(id, updateData, {
      new: true,
    });
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

const generateBookingEmailHTML = (booking, companyData = null) => {
  const formatDateTime = (dateStr, hour, minute) => {
    if (dateStr == null || hour == null || minute == null) return "N/A";
    const date = new Date(dateStr);
    date.setHours(Number(hour));
    date.setMinutes(Number(minute));
    date.setSeconds(0);
    date.setMilliseconds(0);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hh}:${min}`;
  };

  const pickupTime =
    booking?.date && booking?.hour !== undefined
      ? formatDateTime(booking.date, booking.hour, booking.minute)
      : "N/A";

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Booking Confirmation</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;padding:15px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:650px;background-color:#ffffff;border-radius:6px;">
          
          <!-- Header -->
          <tr>
            <td style="padding:20px;background-color:#1f2937;border-radius:6px 6px 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  ${companyData?.superadminCompanyLogo
      ? `
                  <td style="width:50px;vertical-align:middle;padding-right:12px;">
                    <img src="${companyData.superadminCompanyLogo}" alt="Logo" style="width:50px;height:50px;object-fit:contain;display:block;" />
                  </td>
                  `
      : ""
    }
                  <td style="vertical-align:middle;">
                    <div style="color:#ffffff;font-size:18px;font-weight:700;margin:0;">${companyData?.superadminCompanyName || "Booking Confirmation"}</div>
                    ${companyData?.superadminCompanyPhoneNumber ||
      companyData?.superadminCompanyEmail
      ? `
                    <div style="color:rgba(255,255,255,0.8);font-size:12px;margin:4px 0 0 0;">
                      ${companyData?.superadminCompanyPhoneNumber || ""} ${companyData?.superadminCompanyPhoneNumber && companyData?.superadminCompanyEmail ? "•" : ""} ${companyData?.superadminCompanyEmail || ""}
                    </div>
                    `
      : ""
    }
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Booking Info Banner -->
          <tr>
            <td style="padding:15px 20px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:14px;color:#111827;font-weight:600;">
                    #${booking?.bookingId || "N/A"}
                  </td>
                  <td style="text-align:right;font-size:12px;color:#6b7280;">
                    ${formatDate(booking?.createdAt)}
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="font-size:12px;color:#6b7280;padding-top:4px;">
                    ${booking?.bookingType || "N/A"} • ${booking?.paymentMethod || "N/A"}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:20px;">
              
              <!-- Pick Up & Drop Off -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:6px;margin-bottom:15px;">
                <tr>
                  <td style="padding:15px;border-bottom:1px solid #e5e7eb;">
                    <div style="font-size:13px;color:#111827;font-weight:600;margin-bottom:8px;">🚗 Pick Up</div>
                    <div style="font-size:12px;color:#374151;margin-bottom:4px;"><strong>Time:</strong> ${pickupTime}</div>
                    <div style="font-size:12px;color:#374151;margin-bottom:4px;"><strong>Address:</strong> ${booking?.pickup || "N/A"}</div>
                    ${booking?.pickupDoorNumber ? `<div style="font-size:12px;color:#374151;margin-bottom:4px;"><strong>Door:</strong> ${booking.pickupDoorNumber}</div>` : ""}
                    <div style="font-size:12px;color:#374151;"><strong>Access:</strong> ${booking?.pickupAccess || "STAIRS"} • Floor ${booking?.pickupFloorNo || 0}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:15px;">
                    <div style="font-size:13px;color:#111827;font-weight:600;margin-bottom:8px;">📍 Drop Off</div>
                    ${[0, 1, 2, 3, 4]
      .map((idx) => {
        const dropMap = [
          booking?.dropoff,
          booking?.additionalDropoff1,
          booking?.additionalDropoff2,
          booking?.additionalDropoff3,
          booking?.additionalDropoff4,
        ];
        const drop = dropMap[idx];
        if (!drop) return "";

        const accessField =
          idx === 0
            ? "dropoffAccess"
            : `additionalDropoff${idx}Access`;
        const floorField =
          idx === 0
            ? "dropoffFloorNo"
            : `additionalDropoff${idx}FloorNo`;

        return `
                        <div style="margin-bottom:${idx === 4 || !dropMap[idx + 1] ? "0" : "10px"};padding-bottom:${idx === 4 || !dropMap[idx + 1] ? "0" : "10px"};${idx === 4 || !dropMap[idx + 1] ? "" : "border-bottom:1px solid #f3f4f6;"}">
                          <div style="font-size:12px;color:#374151;margin-bottom:4px;"><strong>${idx === 0 ? "Main" : `Stop ${idx}`}:</strong> ${drop}</div>
                          ${booking?.[accessField] ? `<div style="font-size:12px;color:#374151;"><strong>Access:</strong> ${booking[accessField]} • Floor ${booking[floorField] || 0}</div>` : ""}
                        </div>
                        `;
      })
      .join("")}
                  </td>
                </tr>
              </table>

              <!-- Passenger & Vehicle -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:6px;margin-bottom:15px;">
                <tr>
                  <td style="padding:15px;border-bottom:1px solid #e5e7eb;">
                    <div style="font-size:13px;color:#111827;font-weight:600;margin-bottom:8px;">👤 Passenger</div>
                    <div style="font-size:12px;color:#374151;margin-bottom:4px;"><strong>Name:</strong> ${booking?.passenger?.name || "N/A"}</div>
                    <div style="font-size:12px;color:#374151;margin-bottom:4px;"><strong>Email:</strong> ${booking?.passenger?.email || "N/A"}</div>
                    <div style="font-size:12px;color:#374151;"><strong>Phone:</strong> ${booking?.passenger?.phone || "N/A"}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:15px;">
                    <div style="font-size:13px;color:#111827;font-weight:600;margin-bottom:8px;">🚙 Vehicle</div>
                    <div style="font-size:12px;color:#374151;margin-bottom:4px;"><strong>Type:</strong> ${booking?.vehicle?.vehicleName || "N/A"}</div>
                    <div style="font-size:12px;color:#374151;"><strong>Passengers:</strong> ${booking?.passengerCount || 0} • <strong>Luggage:</strong> ${booking?.inventoryItems || 0}</div>
                  </td>
                </tr>
              </table>

              <!-- Journey Details (if exists) -->
              ${booking?.notes ||
      booking?.extraTime ||
      booking?.durationText ||
      booking?.distanceText
      ? `
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:15px;">
                <tr>
                  <td style="padding:15px;">
                    <div style="font-size:13px;color:#111827;font-weight:600;margin-bottom:8px;">ℹ️ Journey Info</div>
                    ${booking?.notes ? `<div style="font-size:12px;color:#374151;margin-bottom:4px;"><strong>Notes:</strong> ${booking.notes}</div>` : ""}
                    ${booking?.durationText ? `<div style="font-size:12px;color:#374151;margin-bottom:4px;"><strong>Duration:</strong> ${booking.durationText} (Est: ${booking?.estimatedDuration || 0} mins)</div>` : ""}
                    ${booking?.distanceText ? `<div style="font-size:12px;color:#374151;margin-bottom:4px;"><strong>Distance:</strong> ${booking.distanceText}</div>` : ""}
                    ${booking?.extraTime && Number(booking.extraTime) > 0 ? `<div style="font-size:12px;color:#374151;"><strong>Extra Time:</strong> ${booking.extraTime} mins</div>` : ""}
                  </td>
                </tr>
              </table>
              `
      : ""
    }

              <!-- Fare -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#1f2937;border-radius:6px;">
                <tr>
                  <td style="padding:20px;">
                    ${booking?.fare ||
      booking?.additionalTimeFare ||
      booking?.workersCharges
      ? `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.1);">
                      ${booking?.fare
        ? `
                      <tr>
                        <td style="font-size:12px;color:rgba(255,255,255,0.7);padding:3px 0;">Base Fare</td>
                        <td style="text-align:right;font-size:12px;color:rgba(255,255,255,0.7);padding:3px 0;">$${Number(booking.fare).toFixed(2)}</td>
                      </tr>
                      `
        : ""
      }
                      ${booking?.additionalTimeFare > 0
        ? `
                      <tr>
                        <td style="font-size:12px;color:rgba(255,255,255,0.7);padding:3px 0;">Additional Time</td>
                        <td style="text-align:right;font-size:12px;color:rgba(255,255,255,0.7);padding:3px 0;">+$${Number(booking.additionalTimeFare).toFixed(2)}</td>
                      </tr>
                      `
        : ""
      }
                      ${booking?.workersCharges > 0
        ? `
                      <tr>
                        <td style="font-size:12px;color:rgba(255,255,255,0.7);padding:3px 0;">Extra Men</td>
                        <td style="text-align:right;font-size:12px;color:rgba(255,255,255,0.7);padding:3px 0;">+$${Number(booking.workersCharges).toFixed(2)}</td>
                      </tr>
                      `
        : ""
      }
                    </table>
                    `
      : ""
    }
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="font-size:16px;color:#ffffff;font-weight:600;">Total Fare</td>
                        <td style="text-align:right;font-size:24px;color:#ffffff;font-weight:700;">$${Number(booking?.totalPrice || booking?.fare || 0).toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px;text-align:center;background-color:#f9fafb;border-radius:0 0 6px 6px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#6b7280;">This is an automated email. Please do not reply.</p>
              ${companyData?.superadminCompanyEmail
      ? `
              <p style="margin:8px 0 0 0;font-size:11px;color:#6b7280;">
                Contact: <a href="mailto:${companyData.superadminCompanyEmail}" style="color:#111827;text-decoration:none;font-weight:600;">${companyData.superadminCompanyEmail}</a>
              </p>
              `
      : ""
    }
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

export const sendBookingDetailsEmail = async (req, res) => {
  try {
    const { bookingId, email } = req.body;

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
      name: req.user?.superadminCompanyName || "",
      address: req.user?.superadminCompanyAddress || "",
      phone: req.user?.superadminCompanyPhoneNumber || "",
      email: req.user?.superadminCompanyEmail || "",
      logo: req.user?.superadminCompanyLogo || "",
    };

    const html = generateBookingEmailHTML(booking, companyData);
    await sendEmail(email, `Booking Details #${booking.bookingId}`, {
      html,
      fromName: "MTL Dispatch",
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