import Booking from "../models/bookings.js";
import User from "../models/User.js";
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

    // Send Confirmation Emails
    try {
      const superadmin = await User.findOne({ companyId: bookingData.companyId, role: "superadmin" });
      if (superadmin) {
        const companyData = {
          superadminCompanyName: superadmin.superadminCompanyName,
          superadminCompanyLogo: superadmin.superadminCompanyLogo,
          superadminCompanyEmail: superadmin.superadminCompanyEmail,
          superadminCompanyPhoneNumber: superadmin.superadminCompanyPhoneNumber,
          superadminCompanyAddress: superadmin.superadminCompanyAddress,
        };

        const passengerHtml = generateBookingEmailHTML(newBooking, companyData, "passenger");
        const adminHtml = generateBookingEmailHTML(newBooking, companyData, "admin");

        // Email to Passenger
        await sendEmail(newBooking.passenger.email, `Booking Confirmation #${newBooking.bookingId}`, {
          html: passengerHtml,
          fromName: companyData.superadminCompanyName || "Booking Confirmation",
        });

        // Email to Admin
        if (superadmin.email) {
          await sendEmail(superadmin.email, `New Booking Received #${newBooking.bookingId}`, {
            html: adminHtml,
            fromName: "Booking System",
          });
        }
      }
    } catch (emailError) {
      console.error("Email notification error:", emailError);
      // We don't fail the request if email fails, but we log it
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

const generateBookingEmailHTML = (booking, companyData = null, type = "passenger") => {
  const formatDateTime = (dateStr, hour, minute) => {
    if (!dateStr || hour === null || minute === null) return "N/A";

    // dateStr is typically YYYY-MM-DD from <input type="date">
    // Constructing new Date(YYYY, MM-1, DD) uses local time
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return "N/A";

    const hh = String(hour).padStart(2, "0");
    const min = String(minute).padStart(2, "0");

    // Return formatted string directly to avoid Date object timezone manipulation
    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year} ${hh}:${min}`;
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

  const title = type === "admin" ? "New Booking Notification" : "Booking Confirmation";
  const subtitle = type === "admin"
    ? `A new booking has been placed (#${booking.bookingId})`
    : `Thank you for booking with us! Your trip details are listed below.`;

  const currencySymbol = booking?.currency?.symbol || "£";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    .details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .details-label { color: #6b7280; font-size: 13px; }
    .details-value { color: #111827; font-size: 13px; font-weight: 600; text-align: right; }
  </style>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#ffffff;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding:32px;background-color:#1f2937;text-align:center;">
              ${companyData?.superadminCompanyLogo
      ? `<img src="${companyData.superadminCompanyLogo}" alt="Logo" style="height:60px;margin-bottom:16px;display:inline-block;" />`
      : ""
    }
              <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700;">${companyData?.superadminCompanyName || "MTL Dispatch"}</h1>
              <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:8px 0 0 0;">${title}</p>
            </td>
          </tr>

          <!-- Welcome Section -->
          <tr>
            <td style="padding:32px;border-bottom:1px solid #e5e7eb;">
              <h2 style="font-size:18px;margin:0 0 12px 0;">Hello ${type === 'admin' ? 'Admin' : (booking?.passenger?.name || 'Valued Customer')},</h2>
              <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0;">${subtitle}</p>
            </td>
          </tr>

          <!-- Journey Highlights -->
          <tr>
            <td style="padding:32px;background-color:#f9fafb;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" style="padding-right:10px;">
                    <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px 0;">Reference</p>
                    <p style="font-size:14px;font-weight:700;margin:0;">#${booking.bookingId}</p>
                  </td>
                  <td width="33%" style="padding:0 10px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                    <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px 0;">Date</p>
                    <p style="font-size:14px;font-weight:700;margin:0;">${formatDate(booking.createdAt)}</p>
                  </td>
                  <td width="33%" style="padding-left:10px;text-align:right;">
                    <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px 0;">Pickup Time</p>
                    <p style="font-size:14px;font-weight:700;margin:0;">${pickupTime.split(' ')[1] || 'N/A'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Addressing Details -->
          <tr>
            <td style="padding:32px;">
              <div style="margin-bottom:24px;">
                <p style="color:#1f2937;font-size:14px;font-weight:700;margin:0 0-12px 0; border-left:4px solid #1f2937; padding-left:12px;">PICKUP LOCATION</p>
                <p style="color:#4b5563;font-size:14px;line-height:1.5;margin:16px 0 0 16px;">
                  ${booking.pickup}
                  ${booking.pickupDoorNumber ? `<br><span style="font-size:12px;color:#9ca3af;">Door: ${booking.pickupDoorNumber}</span>` : ""}
                  <br><span style="font-size:12px;color:#9ca3af;">${booking.pickupAccess} • Floor ${booking.pickupFloorNo || 0}</span>
                </p>
              </div>

              <div style="margin-bottom:24px;">
                <p style="color:#1f2937;font-size:14px;font-weight:700;margin:0 0-12px 0; border-left:4px solid #3b82f6; padding-left:12px;">DROP OFF LOCATION(S)</p>
                <div style="margin:16px 0 0 16px;">
                  ${[booking.dropoff, booking.additionalDropoff1, booking.additionalDropoff2, booking.additionalDropoff3, booking.additionalDropoff4]
      .filter(Boolean)
      .map((addr, idx) => {
        const access = idx === 0 ? booking.dropoffAccess : booking[`additionalDropoff${idx}Access`];
        const floor = idx === 0 ? booking.dropoffFloorNo : booking[`additionalDropoff${idx}FloorNo`];
        return `
                        <p style="color:#4b5563;font-size:14px;line-height:1.5;margin:0 0 12px 0;">
                          <strong>${idx === 0 ? 'Main' : `Stop ${idx}`}:</strong> ${addr}
                          <br><span style="font-size:12px;color:#9ca3af;">${access || 'STAIRS'} • Floor ${floor || 0}</span>
                        </p>
                      `;
      }).join("")}
                </div>
              </div>
            </td>
          </tr>

          <!-- Payment Breakdown -->
          <tr>
            <td style="padding:32px;background-color:#f8fafc;">
              <h3 style="font-size:16px;margin:0 0 16px 0;font-weight:700;">Payment & Fare Breakdown</h3>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                   <td style="padding:8px 0;color:#64748b;font-size:14px;">Base Fare</td>
                   <td style="padding:8px 0;text-align:right;color:#1e293b;font-size:14px;font-weight:600;">${currencySymbol}${Number(booking.fare || 0).toFixed(2)}</td>
                </tr>
                ${booking.additionalTimeFare > 0 ? `
                <tr>
                   <td style="padding:8px 0;color:#64748b;font-size:14px;">Additional Time</td>
                   <td style="padding:8px 0;text-align:right;color:#1e293b;font-size:14px;font-weight:600;">+${currencySymbol}${Number(booking.additionalTimeFare).toFixed(2)}</td>
                </tr>` : ""}
                ${booking.workersCharges > 0 ? `
                <tr>
                   <td style="padding:8px 0;color:#64748b;font-size:14px;">Extra Men Charges</td>
                   <td style="padding:8px 0;text-align:right;color:#1e293b;font-size:14px;font-weight:600;">+${currencySymbol}${Number(booking.workersCharges).toFixed(2)}</td>
                </tr>` : ""}
                <tr>
                   <td style="padding:16px 0 8px 0;color:#1e293b;font-size:18px;font-weight:700;border-top:2px solid #e2e8f0;">Total Fare</td>
                   <td style="padding:16px 0 8px 0;text-align:right;color:#1e293b;font-size:22px;font-weight:800;border-top:2px solid #e2e8f0;">${currencySymbol}${Number(booking.totalPrice || booking.fare).toFixed(2)}</td>
                </tr>
                <tr>
                   <td style="padding:4px 0;color:#64748b;font-size:12px;">Payment Method</td>
                   <td style="padding:4px 0;text-align:right;color:#64748b;font-size:12px;">${booking.paymentMethod}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact Footer -->
          <tr>
            <td style="padding:32px;text-align:center;font-size:13px;color:#94a3b8;">
              <p style="margin:0 0 8px 0;">${companyData?.superadminCompanyName || ""}</p>
              ${companyData?.superadminCompanyAddress ? `<p style="margin:0 0 8px 0;">${companyData.superadminCompanyAddress}</p>` : ""}
              <p style="margin:0;">
                ${companyData?.superadminCompanyPhoneNumber ? `<span style="padding:0 8px;">${companyData.superadminCompanyPhoneNumber}</span>` : ""}
                ${companyData?.superadminCompanyEmail ? `<span style="padding:0 8px;border-left:1px solid #e2e8f0;"><a href="mailto:${companyData.superadminCompanyEmail}" style="color:#3b82f6;text-decoration:none;">${companyData.superadminCompanyEmail}</a></span>` : ""}
              </p>
              <div style="margin-top:24px;padding-top:24px;border-top:1px solid #f1f5f9;">
                <p style="margin:0;font-size:11px;">This is an automated message. Please do not reply directly to this email.</p>
              </div>
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

    const html = generateBookingEmailHTML(booking, companyData, "passenger");
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