import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useGetBookingByIdQuery } from "../../../redux/api/bookingApi";
import { useGetAllVehiclesQuery } from "../../../redux/api/vehicleApi";
import { useLoading } from "../../common/LoadingProvider";
import { toast } from "react-toastify";

const NewBooking = ({ onClose, editBookingData }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const iframeRef = useRef(null);
  const { showLoading, hideLoading } = useLoading();

  const [loading, setLoading] = useState(true);
  const isEdit = !!editBookingData?._id;
  const [isSeededFromDb, setIsSeededFromDb] = useState(!isEdit);

  const { data: existingBooking, isLoading: isBookingLoading } =
    useGetBookingByIdQuery(editBookingData?._id, { skip: !isEdit, refetchOnMountOrArgChange: true });

  const { data: vehicleList } = useGetAllVehiclesQuery(undefined, { skip: !isEdit });

  useEffect(() => {
    if (!isEdit || !existingBooking || isSeededFromDb || !vehicleList) return;
    localStorage.removeItem("bookingForm");
    localStorage.removeItem("selectedVehicle");
    localStorage.removeItem("widgetInventoryData");
    localStorage.removeItem("widgetPricing");
    localStorage.removeItem("widgetPaymentData");

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
      passengerCount: b.passengerCount || "",
      roundedGoogleMinutes: b.estimatedDuration || 120,
    };
    localStorage.setItem("bookingForm", JSON.stringify(bookingForm));

    if (b.vehicle) {
      const vehicles = Array.isArray(vehicleList) ? vehicleList : (vehicleList?.data || []);
      const matchedVehicle = vehicles.find(
        (v) => v.vehicleName && v.vehicleName === b.vehicle.vehicleName
      );

      const fullVehicle = {
        ...b.vehicle,
        ...(matchedVehicle ? {
          id: matchedVehicle._id,
          vehicleName: matchedVehicle.vehicleName,
          image: matchedVehicle.image || b.vehicle.image,
          passengerSeats: matchedVehicle.passengerSeats || 0,
          maxSeats: matchedVehicle.passengerSeats || 0,
          halfHourPrice: matchedVehicle.halfHourPrice || 0,
        } : {}),
      };

      localStorage.setItem("selectedVehicle", JSON.stringify(fullVehicle));
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

    const pricingData = {
      baseFare: b.fare || 0,
      extraHelp: b.vehicle?.extraHelp ? {
        label: b.vehicle.extraHelp.label || "Self Load",
        price: b.workersCharges || 0,
        unitPrice: b.vehicle.extraHelp.unitPrice || b.vehicle.extraHelp.price || 0
      } : {
        label: "Self Load",
        price: b.workersCharges || 0,
        unitPrice: 0
      },
    };
    localStorage.setItem("widgetPricing", JSON.stringify(pricingData));

    const paymentData = {
      paymentMethod: b.paymentMethod || "Cash",
      passengerDetails: b.passenger || {},
    };
    localStorage.setItem("widgetPaymentData", JSON.stringify(paymentData));

    setIsSeededFromDb(true);
  }, [isEdit, existingBooking, companyId, isSeededFromDb, vehicleList]);

  useEffect(() => {
    if (isEdit && (isBookingLoading || !isSeededFromDb)) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isEdit, isBookingLoading, isSeededFromDb, showLoading, hideLoading]);

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
        if (isEdit) {
          toast.success("Booking Updated Successfully");
        }
        onClose?.();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onClose]);

  const widgetUrl = `/widget-form?company=${companyId}&source=admin${isEdit ? `&isEdit=true&bookingId=${editBookingData._id}` : ""}`;

  return (
    <div className="w-full">
      <iframe
        ref={iframeRef}
        src={widgetUrl}
        className="w-full border-none transition-all duration-300"
        style={{ minHeight: "600px" }}
        title="Booking Widget"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default NewBooking;