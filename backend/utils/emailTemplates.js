export const generateBookingEmailHTML = (booking, companyData = null, type = "passenger", updatedFields = []) => {
  const formatDateTime = (dateStr, hour, minute) => {
    if (!dateStr || hour === null || minute === null) return "N/A";

    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return "N/A";

    const hh = String(hour).padStart(2, "0");
    const min = String(minute).padStart(2, "0");

    return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year} ${hh}:${min}`;
  };

  const isUpdated = (field) => updatedFields.includes(field);
  const updatedMark = (field) => isUpdated(field) ? '<span style="color: #ef4444; font-size: 11px; font-weight: bold; margin-left: 4px;">(Updated)</span>' : '';


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

  const title = type === "admin" ? "New Booking Notification" : (updatedFields.length > 0 ? "Booking Updated" : "Booking Confirmation");
  const subtitle = type === "admin"
    ? `A new booking has been placed (#${booking.bookingId})`
    : (updatedFields.length > 0
      ? `Your booking (#${booking.bookingId}) has been updated. Please see the updated details below.`
      : `Thank you for booking (#${booking.bookingId}) with us! Your trip details are listed below.`);

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
@media screen and (max-width: 730px) {
  .responsive-table {
    width: 100% !important;
    display: block !important; /* Make table itself block */
  }
  .reverse-mobile {
    display: block !important; /* NOT flex — just block-stack the cells */
    width: 100% !important;
  }
  .responsive-column {
    display: block !important;
    width: 100% !important;
    padding: 0 !important;
    margin-bottom: 20px !important;
    box-sizing: border-box !important;
    float: none !important;
  }
  .no-border-mobile {
    border-left: none !important;
    padding-left: 0 !important;
  }
}
  </style>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background-color:#ffffff;color:#111827;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f9fafb;padding:10px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e5e7eb;box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding:20px 32px;background-color:#ffffff;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" class="responsive-table">
  <tr class="reverse-mobile">
    <td width="65%" align="left" valign="middle" class="responsive-column">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        ${logoUrl ? `<td valign="middle" style="padding-right:12px;"><img src="${logoUrl}" alt="Logo" style="height:45px;display:block;" /></td>` : ""}
                        <td valign="middle">
                          <h1 style="font-size:16px;margin:0;font-weight:700;color:#07384d;text-transform:uppercase;letter-spacing:0.03em;line-height:1.2;">${companyName}</h1>
                        </td>
                      </tr>
                    </table>
                  </td>
<td width="35%" align="right" valign="middle" class="responsive-column" style="color:#4b5563;font-size:10px;line-height:1.8;">
                    <p style="margin:0;">${companyPhone}</p>
                    <p style="margin:0;">${companyEmail}</p>
                    ${companyAddress ? `<p style="margin:0;">${companyAddress}</p>` : ""}
                  </td>
                </tr>
              </table>
              <div style="margin-top:15px;border-bottom:3px double #07384d;"></div>
            </td>
          </tr>

          <!-- Row 1: Booking Details (Right Aligned) -->
          <tr>
            <td style="padding:0px 32px 10px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="40%">&nbsp;</td>
                  <td width="60%" align="right" valign="top">
                    <div style="color:#000000;font-size:11px;line-height:1.4;">
                      <p style="margin:0;font-weight:600;font-size:12px;color:#000000;">Booking no. — #${booking.bookingId}</p>
                      <p style="margin:3px 0;"><span style="color:#000000;font-weight:500;">Booking Type —</span> ${booking.bookingType || 'Standard'}${updatedMark('bookingType')}</p>
                      <p style="margin:3px 0;"><span style="color:#000000;font-weight:500;">Pickup Date:</span> ${formatDate(booking.date)}${updatedMark('date')}</p>
                      <p style="margin:3px 0;"><span style="color:#000000;font-weight:500;">Pickup Time:</span> ${pickupTime.split(' ')[1] || 'N/A'}${updatedMark('hour') || updatedMark('minute')}</p>
                      <p style="margin:3px 0;"><span style="color:#000000;font-weight:500;">Estimated Duration:</span> 
                        ${(() => {
      const totalMins = Number(booking.estimatedDuration || 0) + Number(booking.extraTime || 0);
      const hours = Math.floor(totalMins / 60);
      const mins = totalMins % 60;
      return `${hours} hour${hours > 1 ? "s" : ""} ${mins > 0 ? mins + " mins" : ""}`;
    })()} (including additional time)${updatedMark('estimatedDuration') || updatedMark('extraTime')}
                      </p>
                      <p style="margin:3px 0;"><span style="color:#000000;font-weight:500;">Payment Method:</span> ${booking.paymentMethod}${updatedMark('paymentMethod')}</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Row 2: Salutation (Left Aligned) -->
          <tr>
            <td style="padding:0px 32px 20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="60%" valign="top">
                    <p style="font-size:12px;color:#111827;margin:0;white-space:nowrap;">Dear <strong>${type === "admin" ? (companyData?.superadminName || "Admin") : (booking.passenger?.name || "Valued Customer")}</strong>,</p>
                    <p style="font-size:11px;color:#4b5563;margin:8px 0 0 0;line-height:1.5;">${type === "admin" ? "A new booking has been received with the following details:" : "We are pleased to confirm your order as per the details below:"}</p>
                  </td>
                  <td width="40%">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Trip Details (Light BG) -->
          <tr>
            <td style="padding:10px 32px 30px 32px;">
              <div style="background-color:#f9fafb;padding:24px;border-radius:4px;border:1px solid #f3f4f6;">
                <h3 style="font-size:14px;color:#07384d;margin:0 0 16px 0;border-bottom:1px solid #e5e7eb;padding-bottom:12px;font-weight:700;">Trip Details</h3>
                
                <table width="100%" cellpadding="0" cellspacing="0" border="0" class="responsive-table">
               <tr class="reverse-mobile">

  <!-- FIRST in HTML = shown FIRST on mobile (Pickup/Dropoff Locations) -->
  <td class="responsive-column" width="50%" valign="top" style="padding-right:20px;">
    <div style="margin-bottom:25px;">
      <p style="font-size:11px;color:#4b5563;font-weight:700;margin:0 0 8px 0;">Pickup Location</p>
      <p style="font-size:11px;color:#111827;margin:0;line-height:1.5;">${booking.pickup}${updatedMark('pickup')}</p>
      <p style="font-size:10px;color:#6b7280;margin:5px 0 0 0;">• Access: ${booking.pickupAccess || 'STAIRS'}${updatedMark('pickupAccess')} — Floor ${booking.pickupFloorNo || 0}${updatedMark('pickupFloorNo')}</p>
    </div>

    <div>
      <p style="font-size:11px;color:#4b5563;font-weight:700;margin:0 0 8px 0;">Drop-off Locations</p>
      <ul style="margin:0;padding:0 0 0 14px;font-size:11px;color:#111827;line-height:1.7;">
        <li>${booking.dropoff}${updatedMark('dropoff')}
          <br><span style="font-size:10px;color:#6b7280;">• Access: ${booking.dropoffAccess || 'STAIRS'}${updatedMark('dropoffAccess')} — Floor ${booking.dropoffFloorNo || 0}${updatedMark('dropoffFloorNo')}</span>
        </li>
        ${[1, 2, 3, 4].filter(i => booking[`additionalDropoff${i}`]).map(i => `
          <li style="margin-top:8px;">${booking[`additionalDropoff${i}`]}${updatedMark(`additionalDropoff${i}`)}
            <br><span style="font-size:10px;color:#6b7280;">• Access: ${booking[`additionalDropoff${i}Access`] || 'STAIRS'}${updatedMark(`additionalDropoff${i}Access`)} — Floor ${booking[`additionalDropoff${i}FloorNo`] || 0}${updatedMark(`additionalDropoff${i}FloorNo`)}</span>
          </li>
        `).join("")}
      </ul>
    </div>
  </td>

  <!-- SECOND in HTML = shown SECOND on mobile (Passenger, Vehicle, Inventory) -->
  <td class="responsive-column no-border-mobile" width="50%" valign="top" style="padding-left:20px;border-left:1px solid #e5e7eb;">
    <div style="margin-bottom:25px;">
      <p style="font-size:11px;color:#4b5563;font-weight:700;margin:0 0 8px 0;">Passenger Details</p>
      <ul style="margin:0;padding:0 0 0 14px;font-size:11px;color:#111827;line-height:1.7;">
        <li>Name: ${booking.passenger?.name || 'N/A'}${updatedMark('passengerName')}</li>
        <li>Email: ${booking.passenger?.email || 'N/A'}${updatedMark('passengerEmail')}</li>
        <li>Phone: +${booking.passenger?.phone || 'N/A'}${updatedMark('passengerPhone')}</li>
      </ul>
    </div>

    <div style="margin-bottom:25px;">
      <p style="font-size:11px;color:#4b5563;font-weight:700;margin:0 0 8px 0;">Vehicle & Assistance</p>
      <ul style="margin:0;padding:0 0 0 14px;font-size:11px;color:#111827;line-height:1.7;">
        <li>Vehicle Type: ${booking.vehicle?.vehicleName || 'N/A'}${updatedMark('vehicle')}</li>
        <li>Passengers: ${booking.passengerCount || 0}${updatedMark('passengerCount')}</li>
        <li>Crew: ${booking.vehicle?.extraHelp?.label || 'None'}${updatedMark('crew')}</li>
      </ul>
    </div>

    ${booking.inventoryItems ? `
    <div>
      <p style="font-size:11px;color:#4b5563;font-weight:700;margin:0 0 8px 0;">Inventory</p>
      <p style="font-size:11px;color:#111827;margin:0;line-height:1.5;">${booking.inventoryItems}${updatedMark('inventoryItems')}</p>
    </div>` : ""}
  </td>

</tr>
                </table>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:0 32px 30px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="50%" valign="top" style="padding-right:15px;">
                    ${booking.notes ? `
                    <div style="background-color:#ffffff;padding:0;">
                      <p style="font-size:11px;color:#4b5563;font-weight:700;margin:0 0 8px 0;">Notes</p>
                      <div style="font-size:11px;color:#111827;line-height:1.5;white-space:pre-wrap;">${booking.notes}${updatedMark('notes')}</div>
                    </div>` : ""}
                  </td>
                  
                  <td width="50%" valign="top" style="padding-left:15px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #b2cdd6;border-radius:4px;overflow:hidden;">
                      <tr>
<td style="padding:10px 15px;color:#000000;font-size:12px;font-weight:700;text-align:start;border-bottom:1px solid #e5e7eb;">
  Price Breakdown
</td>                      </tr>
                      <tr>
                        <td style="padding:0;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <tr style="border-bottom:1px solid #e5e7eb;">
                              <td style="padding:10px 15px;font-size:11px;color:#4b5563;border-right:1px solid #e5e7eb;">Base Fare</td>
                              <td width="30%" style="padding:10px 15px;font-size:11px;color:#111827;text-align:right;font-weight:600;">${currencySymbol}${displayBaseFare.toFixed(2)}</td>
                            </tr>
                            ${additionalTimeValue > 0 ? `
                            <tr style="border-bottom:1px solid #e5e7eb;">
                              <td style="padding:10px 15px;font-size:11px;color:#4b5563;border-right:1px solid #e5e7eb;">Additional Time Charges</td>
                              <td style="padding:10px 15px;font-size:11px;color:#111827;text-align:right;font-weight:600;">${currencySymbol}${additionalTimeValue.toFixed(2)}</td>
                            </tr>` : ""}
                            ${type === 'admin' && workersChargesValue > 0 ? `
                            <tr style="border-bottom:1px solid #e5e7eb;">
                              <td style="padding:10px 15px;font-size:11px;color:#4b5563;border-right:1px solid #e5e7eb;">Crew/Porter Charges</td>
                              <td style="padding:10px 15px;font-size:11px;color:#111827;text-align:right;font-weight:600;">${currencySymbol}${workersChargesValue.toFixed(2)}</td>
                            </tr>` : ""}
                            <tr style="background-color:#f9fafb;">
                              <td style="padding:12px 15px;font-size:12px;color:#000000;font-weight:600;border-right:1px solid #e5e7eb;">TOTAL</td>
                              <td style="padding:12px 15px;font-size:13px;color:#000000;font-weight:600;text-align:right;">${currencySymbol}${Number(totalFareValue).toFixed(2)}${updatedMark('fareBreakdown')}</td>
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
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};
