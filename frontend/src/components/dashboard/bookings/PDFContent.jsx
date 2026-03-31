import React, { forwardRef } from "react";
import IMAGES from "../../../assets/images";

import { formatPhoneNumber } from "../../../utils/formatPhoneNumber";

const BASE_API_URL = import.meta.env.VITE_BASE_URL_BACKEND;
const PDFContent = forwardRef(
  ({ viewData = {}, companyData = {}, companyLogo = null }, ref) => {

    const logoSource = companyLogo || companyData?.profileImage;
    const isFullUrl = logoSource?.startsWith("http");
    const finalImageUrl = logoSource
      ? isFullUrl
        ? logoSource
        : `${BASE_API_URL}/${logoSource.replace(/\\/g, "/")}`
      : IMAGES.dashboardLargeLogo;

    const currencySymbol = viewData?.currency?.symbol || "£";

    const formatDateTime = (dateStr, hour, minute) => {
      if (!dateStr || hour == null || minute == null) return "N/A";
      const d = new Date(dateStr);
      d.setHours(Number(hour));
      d.setMinutes(Number(minute));
      d.setSeconds(0);
      return d.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const companyName =
      companyData?.superadminCompanyName ||
      companyData?.name ||
      "Flexible Budget Removals Limited";
    const companyPhone =
      companyData?.superadminCompanyPhoneNumber ||
      companyData?.phone ||
      "N/A";
    const companyEmail =
      companyData?.superadminCompanyEmail ||
      companyData?.email ||
      "N/A";
    const companyAddress =
      companyData?.superadminCompanyAddress ||
      companyData?.address ||
      "N/A";

    return (
      <>
        <div
          ref={ref}
          id="pdf-container"
          style={{
            padding: "20px",
            fontSize: "12px",
            width: "794px",
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: -1,
            opacity: 0,
            pointerEvents: "none",
            fontFamily: "Arial, sans-serif",
            color: "#000",
            backgroundColor: "#fff",
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <img
              src={finalImageUrl}
              alt="Company Logo"
              crossOrigin="anonymous"
              onError={(e) => (e.target.src = IMAGES.dashboardLargeLogo)}
              style={{ height: "80px", objectFit: "contain" }}
            />
          </div>

          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
              gap: "20px",
            }}
          >
            <div style={{ flex: "1 1 45%", minWidth: "260px", lineHeight: "1.5" }}>
              <p style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: "700", color: "#1f2937" }}>
                {companyName}
              </p>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#4b5563" }}>
                <strong>Address:</strong> {companyAddress}
              </p>
              <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#4b5563" }}>
                <strong>Phone:</strong> {formatPhoneNumber(companyPhone)}
              </p>
              <p style={{ margin: "0", fontSize: "12px", color: "#4b5563" }}>
                <strong>Email:</strong> {companyEmail}
              </p>
            </div>

            <div style={{ flex: "1 1 45%", minWidth: "260px", textAlign: "right", lineHeight: "1.5", marginBottom: '6px' }}>
              <h2
                style={{
                  margin: "0 0 20px 0",
                  fontSize: "19px",
                  fontWeight: "600",
                  color: "#1e3a8a",
                }}
              >
                Booking Confirmation
              </h2>
              <p>
                <strong style={{ color: "#111827" }}>Date & Time:</strong> &nbsp;
                {viewData.date && viewData.hour != null
                  ? formatDateTime(viewData.date, viewData.hour, viewData.minute)
                  : "N/A"}
              </p>
              <p>
                <strong style={{ color: "#111827" }}>Booking No.:</strong> {viewData?.bookingId || "N/A"}
              </p>
              <p>
                <strong style={{ color: "#111827" }}>Payment Type:</strong> &nbsp;{viewData?.paymentMethod || "Card Payment"}
              </p>
            </div>
          </div>

          <hr style={{ borderColor: "#e5e7eb", margin: "20px 0" }} />
          <div
            style={{
              display: "flex",
              gap: "20px",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                flex: "1 1 300px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#f9fafb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <h4
                style={{
                  fontSize: "16px",
                  marginBottom: "10px",
                  color: "#111827",
                }}
              >
                Journey
              </h4>
              <div style={{ marginBottom: "12px" }}>
                <h5
                  style={{
                    margin: "0 0 4px",
                    fontSize: "13px",
                    color: "#2563eb",
                  }}
                >
                  Pickup
                </h5>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#6b7280" }}>Address:</strong> &nbsp;
                  {viewData.pickup || "N/A"}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong style={{ color: "#6b7280" }}>Access / Floor:</strong>
                  &nbsp;
                  {viewData.pickupAccess || "STAIRS"} / Floor
                  {viewData.pickupFloorNo || 0}
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong style={{ color: "#6b7280" }}>Estimated Duration:</strong> &nbsp;
                  {(() => {
                    const totalMins = Number(viewData.estimatedDuration || 0) + Number(viewData.extraTime || 0);
                    const hours = Math.floor(totalMins / 60);
                    const mins = totalMins % 60;
                    return `${hours} hour${hours > 1 ? "s" : ""} ${mins > 0 ? mins + " mins" : ""}`;
                  })()} (including additional time)
                </p>

                <p style={{ margin: "4px 0" }}>
                  <strong style={{ color: "#6b7280" }}>Booking Type:</strong>
                  &nbsp;
                  {viewData?.bookingType === "piano_electronics"
                    ? "Piano/Electronics"
                    : viewData?.mode || viewData?.bookingType || "Standard"}
                </p>
              </div>
              <div>
                <h5
                  style={{
                    margin: "0 0 4px",
                    fontSize: "13px",
                    color: "#2563eb",
                  }}
                >
                  Drop Off
                </h5>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: "#6b7280" }}>Address:</strong> &nbsp;
                  {viewData.dropoff || "N/A"}
                </p>
                <p style={{ margin: "4px 0" }}>
                  <strong style={{ color: "#6b7280" }}>Access / Floor:</strong>
                  &nbsp;
                  {viewData.dropoffAccess || "STAIRS"} / Floor
                  {viewData.dropoffFloorNo || 0}
                </p>
                {viewData.additionalDropoff1 && (
                  <div style={{ margin: "8px 0 4px" }}>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "#6b7280" }}>Addl Drop 1:</strong>
                      &nbsp;{viewData.additionalDropoff1}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6b7280" }}>
                      • Access: {viewData.additionalDropoff1Access || 'STAIRS'} — Floor {viewData.additionalDropoff1FloorNo || 0}
                    </p>
                  </div>
                )}
                {viewData.additionalDropoff2 && (
                  <div style={{ margin: "8px 0 4px" }}>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "#6b7280" }}>Addl Drop 2:</strong>
                      &nbsp;{viewData.additionalDropoff2}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6b7280" }}>
                      • Access: {viewData.additionalDropoff2Access || 'STAIRS'} — Floor {viewData.additionalDropoff2FloorNo || 0}
                    </p>
                  </div>
                )}
                {viewData.additionalDropoff3 && (
                  <div style={{ margin: "8px 0 4px" }}>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "#6b7280" }}>Addl Drop 3:</strong>
                      &nbsp;{viewData.additionalDropoff3}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6b7280" }}>
                      • Access: {viewData.additionalDropoff3Access || 'STAIRS'} — Floor {viewData.additionalDropoff3FloorNo || 0}
                    </p>
                  </div>
                )}
                {viewData.additionalDropoff4 && (
                  <div style={{ margin: "8px 0 4px" }}>
                    <p style={{ margin: 0 }}>
                      <strong style={{ color: "#6b7280" }}>Addl Drop 4:</strong>
                      &nbsp;{viewData.additionalDropoff4}
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#6b7280" }}>
                      • Access: {viewData.additionalDropoff4Access || 'STAIRS'} — Floor {viewData.additionalDropoff4FloorNo || 0}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div
              style={{
                flex: "1 1 200px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "#f9fafb",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <h4
                style={{
                  fontSize: "16px",
                  marginBottom: "10px",
                  color: "#111827",
                }}
              >
                Vehicle Details
              </h4>
              <p style={{ margin: "4px 0" }}>
                <strong style={{ color: "#6b7280" }}>Vehicle:</strong> &nbsp;
                {viewData?.vehicle?.vehicleName || "N/A"}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong style={{ color: "#6b7280" }}>Passengers:</strong>{" "}
                {viewData?.passengerCount || 0}
              </p>
              <p style={{ margin: "4px 0" }}>
                <strong style={{ color: "#6b7280" }}>Crew:</strong> &nbsp;
                {viewData?.vehicle?.extraHelp?.label || "None"}
              </p>

              {viewData.inventoryItems && (
                <>
                  <hr style={{ borderColor: "#e5e7eb", margin: "20px 0" }} />
                  <h4 style={{ fontSize: "16px", marginBottom: "10px", color: "#111827" }}>Inventory</h4>
                  <p style={{ fontSize: "11px", color: "#111827", lineHeight: "1.5" }}>{viewData.inventoryItems}</p>
                </>
              )}

              <hr style={{ borderColor: "#e5e7eb", margin: "20px 0" }} />
              <h4 style={{ fontSize: "16px", marginBottom: "10px", color: "#111827" }}>Notes</h4>
              <p>{viewData.notes || "None"}</p>
            </div>
          </div>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "16px",
              backgroundColor: "#f9fafb",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <h4
              style={{
                fontSize: "16px",
                marginBottom: "10px",
                color: "#111827",
              }}
            >
              Passenger Details
            </h4>
            <p style={{ margin: "4px 0" }}>
              <strong style={{ color: "#6b7280" }}>Name:</strong>{" "}
              {viewData?.passenger?.name || "N/A"}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong style={{ color: "#6b7280" }}>Email:</strong>{" "}
              {viewData?.passenger?.email || "N/A"}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong style={{ color: "#6b7280" }}>Phone:</strong>
              {formatPhoneNumber(viewData?.passenger?.phone)}
            </p>
          </div>
          <div
            style={{
              marginTop: "10px",
              padding: "10px",
              borderRadius: "4px",
              textAlign: "right",
              width: "fit-content",
              marginLeft: "auto",
            }}
          >
            {(() => {
              const baseFare = Number(Math.round(viewData?.fareBreakdown?.baseFare).toFixed(2) ?? viewData?.fare ?? 0);
              const workersCharges = Number(viewData?.fareBreakdown?.workersCharges ?? viewData?.workersCharges ?? 0);
              const extraTimeFare = Number(viewData?.fareBreakdown?.extraTimeCharges ?? viewData?.additionalTimeFare ?? 0);
              const totalFare = Number(viewData?.fareBreakdown?.total ?? viewData?.totalPrice ?? baseFare + workersCharges + extraTimeFare);
              const displayBaseFare = baseFare + workersCharges;

              return (
                <>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#4b5563",
                      marginBottom: "4px",
                    }}
                  >
                    <strong>Base Fare:</strong> {currencySymbol}
                    {displayBaseFare.toFixed(2)}
                  </div>
                  {extraTimeFare > 0 && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#4b5563",
                        marginBottom: "4px",
                      }}
                    >
                      <strong>Additional Time Charges:</strong> {currencySymbol}
                      {extraTimeFare.toFixed(2)}
                    </div>
                  )}
                  {workersCharges > 0 && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#4b5563",
                        marginBottom: "4px",
                      }}
                    >
                      <strong>Crew/Porter Charges:</strong> {currencySymbol}
                      {workersCharges.toFixed(2)}
                    </div>
                  )}
                  <p
                    style={{
                      fontSize: "14px",
                      margin: "8px 0 0 0",
                      borderTop: "1px solid #d1d5db",
                      paddingTop: "5px",
                    }}
                  >
                    <strong style={{ fontWeight: "bold" }}>Total Fare:</strong>{" "}
                    {currencySymbol}
                    {totalFare.toFixed(2)}
                    &nbsp; GBP
                  </p>
                </>
              );
            })()}
            <div style={{ marginTop: "8px", borderTop: "1px dashed #e5e7eb", paddingTop: "8px" }}>
              <div style={{ fontSize: "11px", color: "#4b5563", marginBottom: "4px" }}>
                <strong>Deposit Paid (35%):</strong> {currencySymbol}
                {Number(viewData?.fareBreakdown?.depositPaid || (viewData?.totalPrice || viewData?.fare || 0) * 0.35).toFixed(2)}
              </div>
              <div style={{ fontSize: "11px", color: "#4b5563" }}>
                <strong>Remaining Balance (65%):</strong> {currencySymbol}
                {(Number(viewData?.totalPrice || viewData?.fare || 0) - Number(viewData?.fareBreakdown?.depositPaid || (viewData?.totalPrice || viewData?.fare || 0) * 0.35)).toFixed(2)}
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: "5%",
              backgroundColor: "#111827",
              color: "#d1d5db",
              padding: "20px",
              borderRadius: "8px",
              fontSize: "14px",
              lineHeight: "1.6",
              textAlign: "center",
            }}
          >
            <p style={{ textAlign: "center", marginBottom: "10px" }}>
              This order is subject to our &nbsp;
              <a
                href="#"
                style={{ color: "#2563eb", textDecoration: "underline" }}
              >
                Terms and Conditions
              </a>
              &nbsp; and &nbsp;
              <a
                href="#"
                style={{ color: "#2563eb", textDecoration: "underline" }}
              >
                Privacy Policy
              </a>
              &nbsp;.
            </p>
            <p style={{ paddingBottom: "2%" }}>
              © 2026 Flexible Budget Removals Limited. All rights reserved.
              <br />
              3, Witcombe Point, Yarnfield Square, London, SE15 5EJ <br />
            </p>
          </div>
        </div>
      </>
    );
  },
);

export default PDFContent;