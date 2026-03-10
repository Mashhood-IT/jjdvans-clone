import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useGetBookingByIdQuery } from "../../../redux/api/bookingApi";

const NewBooking = ({ onClose, editBookingData }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const isEdit = !!editBookingData?._id;
  const [isSeededFromDb, setIsSeededFromDb] = useState(!isEdit);

  const { data: existingBooking, isLoading: isBookingLoading } = useGetBookingByIdQuery(
    editBookingData?._id,
    { skip: !isEdit }
  );

  useEffect(() => {
    if (!isEdit || !existingBooking || isSeededFromDb) return;

    const b = existingBooking;

    const bookingForm = {
      pickup: b.pickup || "",
      dropoff: b.dropoff || "",
      additionalDropoff1: b.additionalDropoff1 || null,
      additionalDropoff2: b.additionalDropoff2 || null,
      additionalDropoff3: b.additionalDropoff3 || null,
      additionalDropoff4: b.additionalDropoff4 || null,
      bookingType: b.bookingType || "",
      notes: b.notes || "",
      date: b.date || "",
      hour: b.hour ?? "",
      minute: b.minute ?? "",
      companyId: b.companyId || companyId,
      distanceText: b.distanceText || "",
      durationText: b.durationText || "",
    };
    localStorage.setItem("bookingForm", JSON.stringify(bookingForm));

    if (b.vehicle) {
      localStorage.setItem("selectedVehicle", JSON.stringify(b.vehicle));
    }

    const inventoryData = {
      pickupFloor: b.pickupFloorNo || 0,
      dropoffFloor: b.dropoffFloorNo || 0,
      pickupAccess: b.pickupAccess || "STAIRS",
      dropoffAccess: b.dropoffAccess || "STAIRS",
      passengerCount: b.passengerCount || 0,
      ridingAlong: b.ridingAlong || false,
      estimatedHours: Math.floor((b.estimatedDuration || 0) / 60),
      estimatedMinutes: (b.estimatedDuration || 0) % 60,
      additionalFare: b.additionalTimeFare || 0,
      items: b.inventoryItems
        ? b.inventoryItems.split(", ").map((name) => ({ name }))
        : [],
      floorAccess: {
        additionalDropoff1Floor: b.additionalDropoff1FloorNo || 0,
        additionalDropoff1Access: b.additionalDropoff1Access || "STAIRS",
        additionalDropoff2Floor: b.additionalDropoff2FloorNo || 0,
        additionalDropoff2Access: b.additionalDropoff2Access || "STAIRS",
        additionalDropoff3Floor: b.additionalDropoff3FloorNo || 0,
        additionalDropoff3Access: b.additionalDropoff3Access || "STAIRS",
        additionalDropoff4Floor: b.additionalDropoff4FloorNo || 0,
        additionalDropoff4Access: b.additionalDropoff4Access || "STAIRS",
      },
    };
    localStorage.setItem("widgetInventoryData", JSON.stringify(inventoryData));

    // 4. widgetPricing — pricing breakdown
    const pricingData = {
      baseFare: b.fare || 0,
      extraHelp: { price: b.workersCharges || 0 },
    };
    localStorage.setItem("widgetPricing", JSON.stringify(pricingData));

    // 5. widgetPaymentData — payment info
    const paymentData = {
      paymentMethod: b.paymentMethod || "Cash",
      passengerDetails: b.passenger || {},
    };
    localStorage.setItem("widgetPaymentData", JSON.stringify(paymentData));

    setIsSeededFromDb(true);
  }, [isEdit, existingBooking, companyId, isSeededFromDb]);

  // Clean up localStorage on unmount
  useEffect(() => {
    return () => {
      if (isEdit) {
        localStorage.removeItem("bookingForm");
        localStorage.removeItem("selectedVehicle");
        localStorage.removeItem("widgetInventoryData");
        localStorage.removeItem("widgetPricing");
        localStorage.removeItem("widgetPaymentData");
      }
    };
  }, [isEdit]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "resizeWidget") {
        if (iframeRef.current) {
          iframeRef.current.style.height = `${event.data.height}px`;
          setLoading(false);
        }
      }
      if (event.data && event.data.type === "bookingSuccess") {
        onClose?.();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onClose]);

  const widgetUrl = `/widget-form?company=${companyId}&source=admin${isEdit ? `&isEdit=true&bookingId=${editBookingData._id}` : ""}`;

  // Wait for booking data to be fetched and seeded into localStorage before rendering iframe
  if (isEdit && (isBookingLoading || !isSeededFromDb)) {
    return (
      <div className="w-full relative" style={{ minHeight: "600px" }}>
        <div className="absolute inset-0 flex items-center justify-center bg-(--white) z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-(--white) z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={widgetUrl}
        className="w-full border-none transition-all duration-300"
        style={{ minHeight: "600px"}}
        title="Booking Widget"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default NewBooking;