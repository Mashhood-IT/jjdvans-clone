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

    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return "N/A";

    const hh = String(hour).padStart(2, "0");
    const min = String(minute).padStart(2, "0");

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

  const baseFareValue = Number(Math.round(booking?.fareBreakdown?.baseFare ?? 0));
  const workersChargesValue = Number(Math.round(booking?.fareBreakdown?.workersCharges ?? 0));
  const additionalTimeValue = Number(Math.round(booking?.fareBreakdown?.extraTimeCharges ?? 0));
  const totalFareValue = Number(
    Math.round(booking?.fareBreakdown?.total ??
      (baseFareValue + additionalTimeValue + workersChargesValue))
  );
  const displayBaseFare = baseFareValue + workersChargesValue;

  const logoUrl = companyData?.superadminCompanyLogo || companyData?.logo || "";
  const companyName = companyData?.superadminCompanyName || companyData?.name || "MTL Dispatch";
  const companyEmail = companyData?.superadminCompanyEmail || companyData?.email || "";
  const companyPhone = companyData?.superadminCompanyPhoneNumber || companyData?.phone || "";
  const companyAddress = companyData?.superadminCompanyAddress || companyData?.address || "";

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
    @media only screen and (max-width: 480px) {
      .responsive-table { width: 100% !important; }
      .responsive-column { display: block !important; width: 100% !important; padding: 0 0 20px 0 !important; }
      .responsive-spacer { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#ffffff;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding:24px 32px;background-color:#07384d;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="30%" align="left" style="vertical-align:middle;">
                    ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="height:80px;display:block;" />` : ""}
                  </td>
                  <td width="70%" align="right" style="vertical-align:middle;text-align:right;">
                    <h1 style="color:#ffffff;font-size:20px;margin:0;font-weight:700;white-space:nowrap;">${companyName}</h1>
                    ${companyEmail ? `<p style="margin:4px 0 0 0;"><span style="color:#ffffff;text-decoration:none;font-size:13px;">${companyEmail}</span></p>` : ""}
                    ${companyPhone ? `<p style="color:rgba(255,255,255,0.7);font-size:13px;margin:2px 0 0 0;">${companyPhone}</p>` : ""}
                    ${companyAddress ? `<p style="color:rgba(255,255,255,0.7);font-size:13px;margin:2px 0 0 0;">${companyAddress}</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px;border-bottom:1px solid #e5e7eb;">
              <div style="text-align:right;margin-bottom:16px;">
                <span style="background-color:#07384d;color:#ffffff;padding:4px 12px;font-size:12px;font-weight:500;letter-spacing:1px;border-radius:4px;">${title}</span>
              </div>
              <h2 style="font-size:18px;margin:0 0 8px 0;">${type === 'admin' ? 'Admin' : (booking?.passenger?.name || 'Valued Customer')},</h2>
              <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0;">${subtitle}</p>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;background-color:#f9fafb;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" style="padding-right:10px;">
                    <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px 0;">Reference</p>
                    <p style="font-size:14px;font-weight:500;margin:0;">#${booking.bookingId}</p>
                  </td>
                  <td width="33%" style="padding:0 10px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                    <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px 0;">Date</p>
                    <p style="font-size:14px;font-weight:500;margin:0;">${formatDate(booking.createdAt)}</p>
                  </td>
                  <td width="33%" style="padding-left:10px;text-align:right;">
                    <p style="color:#6b7280;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 4px 0;">Pickup Time</p>
                    <p style="font-size:14px;font-weight:500;margin:0;">${pickupTime.split(' ')[1] || 'N/A'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 32px 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" class="responsive-table">
                <tr>
                  <td width="48%" valign="top" class="responsive-column" style="border-right:1px solid #e5e7eb;padding-right:15px;">
                    <p style="color:#1f2937;font-size:13px;font-weight:700;margin:0 0 12px 0;text-transform:uppercase;">Pickup Location</p>
                    <p style="color:#4b5563;font-size:13px;line-height:1.5;margin:0;">
                      ${booking.pickup}
                      ${booking.pickupDoorNumber ? `<br><span style="font-size:11px;color:#9ca3af;">Door: ${booking.pickupDoorNumber}</span>` : ""}
                      <br><span style="font-size:11px;color:#9ca3af;">${booking.pickupAccess} • Floor ${booking.pickupFloorNo || 0}</span>
                    </p>
                  </td>

                  <td width="4%" class="responsive-spacer">&nbsp;</td>

                  <td width="48%" valign="top" class="responsive-column">
                    <p style="color:#1f2937;font-size:13px;font-weight:700;margin:0 0 12px 0;text-transform:uppercase;">Drop Off Location(s)</p>
                    <div style="margin:0;">
                      ${[booking.dropoff, booking.additionalDropoff1, booking.additionalDropoff2, booking.additionalDropoff3, booking.additionalDropoff4]
      .filter(Boolean)
      .map((addr, idx) => {
        const access = idx === 0 ? booking.dropoffAccess : booking[`additionalDropoff${idx}Access`];
        const floor = idx === 0 ? booking.dropoffFloorNo : booking[`additionalDropoff${idx}FloorNo`];
        return `
                        <p style="color:#4b5563;font-size:13px;line-height:1.4;margin:0 0 8px 0;">
                          <strong>${idx === 0 ? 'Main' : `Stop ${idx}`}:</strong> ${addr}
                          <br><span style="font-size:11px;color:#9ca3af;">${access || 'STAIRS'} • Floor ${floor || 0}</span>
                        </p>
                      `;
      }).join("")}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:12px 32px 32px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" class="responsive-table">
                <tr>
<td width="48%" class="responsive-column" valign="top" style="padding-right:15px;padding-top:12px;">
                    <h3 style="font-size:16px;margin:0;font-weight:500;">Payment &amp; Fare Breakdown</h3>
                  </td>
                  <td width="4%" class="responsive-spacer">&nbsp;</td>

                  <td width="48%" valign="top" class="responsive-column">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e5e7eb;padding-top:24px;">
                      <tr>
                        <td style="padding:6px 0;color:#64748b;font-size:13px;">Base Fare</td>
                        <td style="padding:6px 0;text-align:right;color:#1e293b;font-size:13px;font-weight:600;">${currencySymbol}${displayBaseFare.toFixed(2)}</td>
                      </tr>
                      ${additionalTimeValue > 0 ? `
                      <tr>
                        <td style="padding:6px 0;color:#64748b;font-size:13px;">Additional Time</td>
                        <td style="padding:6px 0;text-align:right;color:#1e293b;font-size:13px;font-weight:600;">+${currencySymbol}${additionalTimeValue.toFixed(2)}</td>
                      </tr>` : ""}
                      ${type === 'admin' && workersChargesValue > 0 ? `
                      <tr>
                        <td style="padding:6px 0;color:#64748b;font-size:13px;">Extra Men Charges</td>
                        <td style="padding:6px 0;text-align:right;color:#1e293b;font-size:13px;font-weight:600;">+${currencySymbol}${workersChargesValue.toFixed(2)}</td>
                      </tr>` : ""}
                      <tr>
                        <td style="padding:12px 0 6px 0;color:#1e293b;font-size:15px;font-weight:700;border-top:2px solid #e2e8f0;">Total Fare</td>
                        <td style="padding:12px 0 6px 0;text-align:right;color:#1e293b;font-size:18px;font-weight:500;border-top:2px solid #e2e8f0;">${currencySymbol}${Number(totalFareValue).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;color:#64748b;font-size:12px;">Payment Method</td>
                        <td style="padding:4px 0;text-align:right;color:#64748b;font-size:12px;">${booking.paymentMethod}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
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