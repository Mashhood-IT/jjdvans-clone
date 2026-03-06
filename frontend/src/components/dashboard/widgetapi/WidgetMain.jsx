import React, { useEffect, useState } from "react";
import { useNavigate, Routes, Route } from "react-router-dom";
import { toast } from "react-toastify";
import WidgetBooking from "./WidgetBooking";
import WidgetPaymentInformation from "./WidgetPaymentInformation";
import { useCreateBookingMutation, useUpdateBookingMutation } from "../../../redux/api/bookingApi";
import WidgetSuccess from "./widgetcomponents/WidgetSuccess";
import WidgetBookingInformation from "./WidgetBookingInformation";
import WidgetInventory from "./WidgetInventory";
import WidgetBookingDetails from "./WidgetBookingDetails";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const Breadcrumbs = () => {
  const location = useLocation();
  const sp = new URLSearchParams(location.search);
  const companyId = sp.get("company") || "";

  const steps = [
    { name: "Journey", path: "/widget-form", match: ["/widget-form", "/widget-form/widget-details"] },
    { name: "Vehicle", path: "/widget-form/widget-vehicle", match: ["/widget-form/widget-vehicle"] },
    { name: "Inventory", path: "/widget-form/widget-inventory", match: ["/widget-form/widget-inventory"] },
    { name: "Payment", path: "/widget-form/widget-payment", match: ["/widget-form/widget-payment"] },
  ];

  const currentPath = location.pathname.endsWith("/") ? location.pathname.slice(0, -1) : location.pathname;

  const currentStepIndex = steps.findIndex(step =>
    step.match.some(m => {
      const normalizedM = m.endsWith("/") ? m.slice(0, -1) : m;
      return normalizedM === currentPath;
    })
  );

  const getStepAvailability = (index) => {
    if (index === 0) return true;
    if (index === 1) return !!localStorage.getItem("bookingForm");
    if (index === 2) return !!localStorage.getItem("selectedVehicle");
    if (index === 3) return !!localStorage.getItem("widgetInventoryData");
    return false;
  };

  if (currentPath === "/widget-form/widget-success") return null;

  return (
    <nav className="flex items-center justify-center space-x-2 md:space-x-4 mb-8 px-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
      {steps.map((step, index) => {
        const isActive = index === currentStepIndex;
        const isAvailable = getStepAvailability(index);
        const isCompleted = index < currentStepIndex;

        return (
          <React.Fragment key={step.name}>
            <div className="flex items-center">
              {isAvailable && !isActive ? (
                <Link
                  to={`${step.path}?company=${companyId}`}
                  className="flex items-center widget-label-text text-gray-900 hover:text-(--main-color) transition-colors"
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] mr-2 ${isCompleted ? "bg-(--main-color) text-(--white)" : "border-2 border-gray-900 bg-(--white) text-gray-900"
                      }`}
                  >
                    {isCompleted ? "✓" : index + 1}
                  </span>
                  {step.name}
                </Link>
              ) : (
                <div
                  className={`flex items-center widget-label-text ${isActive ? "text-gray-900" : "text-gray-400"
                    }`}
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 rounded-full border-2 text-[10px] mr-2 transition-colors ${isActive
                      ? "border-gray-900 bg-gray-900 text-(--white)"
                      : "border-gray-300 bg-(--white) text-gray-400"
                      }`}
                  >
                    {index + 1}
                  </span>
                  {step.name}
                </div>
              )}
            </div>
            {index < steps.length - 1 && (
              <div className="w-4 md:w-8 h-px bg-gray-300 mx-1 md:mx-2" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

const WidgetMain = () => {
  const navigate = useNavigate();
  const [companyId, setCompanyId] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    booking: {},
    vehicle: {},
    payment: {},
    pricing: {},
    source: new URLSearchParams(window.location.search).get("source") || "widget",
    isEdit: new URLSearchParams(window.location.search).get("isEdit") === "true",
    bookingId: new URLSearchParams(window.location.search).get("bookingId"),
  });

  const [createBooking, { isLoading: isBookingLoading }] = useCreateBookingMutation();
  const [updateBooking, { isLoading: isUpdateLoading }] = useUpdateBookingMutation();

  const isLoading = isBookingLoading || isUpdateLoading;

  useEffect(() => {
    sessionStorage.setItem("widget_tab_open", "true");
  }, []);

  useEffect(() => {
    if (window.self !== window.top) {
      document.body.style.overflow = "hidden";
    }
  }, []);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      const height = document.body.scrollHeight;
      window.parent.postMessage({ type: "resizeWidget", height }, "*");
    });
    resizeObserver.observe(document.body);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    let sid = sp.get("session_id");

    if (
      sid === "%7BCHECKOUT_SESSION_ID%7D" ||
      sid === "{CHECKOUT_SESSION_ID}"
    ) {
      console.warn(
        "Stripe session_id placeholder was not replaced. Skipping booking creation.",
      );
      return;
    }

    if (!sid) return;

    toast.success("Payment Received");
    navigate("/widget-form/widget-success");
  }, [navigate]);

  const handleDataChange = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const handleBookingSubmission = async (finalPayload) => {
    try {
      const inventoryDataRaw = localStorage.getItem("widgetInventoryData");
      const inventoryData = inventoryDataRaw ? JSON.parse(inventoryDataRaw) : {};

      const pricingDataRaw = localStorage.getItem("widgetPricing");
      const pricingData = pricingDataRaw ? JSON.parse(pricingDataRaw) : {};

      const additionalFare = Number(inventoryData.additionalFare || 0);
      const workersCharges = Number(pricingData.extraHelp?.price || 0);
      const baseFare = Number(pricingData.baseFare || finalPayload.fare || 0);

      const totalPrice = baseFare + additionalFare + workersCharges;

      const bookingFormRaw = localStorage.getItem("bookingForm");
      const bookingFormData = bookingFormRaw ? JSON.parse(bookingFormRaw) : {};
      let distanceText = "";
      let durationText = "";
      if (
        bookingFormData.segments &&
        Array.isArray(bookingFormData.segments) &&
        bookingFormData.segments.length > 0
      ) {
        const totalMiles = bookingFormData.segments.reduce(
          (sum, seg) => sum + (seg.miles || 0),
          0,
        );
        distanceText = `${totalMiles.toFixed(2)} mi`;
        const totalSeconds = bookingFormData.segments.reduce(
          (sum, seg) => sum + (seg.durationValue || 0),
          0,
        );
        if (totalSeconds > 0) {
          const hours = Math.floor(totalSeconds / 3600);
          const mins = Math.round((totalSeconds % 3600) / 60);
          durationText =
            hours > 0 ? `${hours} hours ${mins} mins` : `${mins} mins`;
        } else {
          durationText = bookingFormData.segments
            .map((s) => s.durationText)
            .join(" + ");
        }
      }

      const rawAddedMinutes = Math.max(0, ((inventoryData.estimatedHours || 0) * 60 + (inventoryData.estimatedMinutes || 0)) - (inventoryData.initialGoogleMinutes || 0));
      const billableAddedMinutes = Math.ceil(rawAddedMinutes / 30) * 30;

      const normalizedPayload = {
        ...finalPayload,
        fare: baseFare,
        totalPrice: totalPrice,
        extras: {
          ...finalPayload.extras,
          extraTime: billableAddedMinutes.toString(),
          rideAlong: finalPayload.ridingAlong ? "Yes" : "No"
        },
        pickupFloorNo: inventoryData.pickupFloor || 0,
        dropoffFloorNo: inventoryData.dropoffFloor || 0,
        pickupAccess: inventoryData.pickupAccess || "STAIRS",
        dropoffAccess: inventoryData.dropoffAccess || "STAIRS",

        additionalDropoff1FloorNo: inventoryData.floorAccess?.additionalDropoff1Floor || 0,
        additionalDropoff1Access: inventoryData.floorAccess?.additionalDropoff1Access || "STAIRS",
        additionalDropoff2FloorNo: inventoryData.floorAccess?.additionalDropoff2Floor || 0,
        additionalDropoff2Access: inventoryData.floorAccess?.additionalDropoff2Access || "STAIRS",
        additionalDropoff3FloorNo: inventoryData.floorAccess?.additionalDropoff3Floor || 0,
        additionalDropoff3Access: inventoryData.floorAccess?.additionalDropoff3Access || "STAIRS",
        additionalDropoff4FloorNo: inventoryData.floorAccess?.additionalDropoff4Floor || 0,
        additionalDropoff4Access: inventoryData.floorAccess?.additionalDropoff4Access || "STAIRS",

        inventoryItems:
          inventoryData.items && Array.isArray(inventoryData.items)
            ? inventoryData.items.map((i) => i.name).join(", ")
            : "",
        estimatedDuration:
          (inventoryData.estimatedHours || 0) * 60 +
          (inventoryData.estimatedMinutes || 0),
        passengerCount: inventoryData.passengerCount,
        ridingAlong: inventoryData.ridingAlong || false,
        distanceText,
        durationText,
        extraTime: billableAddedMinutes.toString(),
      };

      let response;
      if (formData.isEdit && formData.bookingId) {
        response = await updateBooking({ id: formData.bookingId, ...normalizedPayload }).unwrap();
      } else {
        response = await createBooking(normalizedPayload).unwrap();
      }

      localStorage.removeItem("selectedVehicle");
      localStorage.removeItem("widgetPricing");
      localStorage.removeItem("widgetPaymentData");
      localStorage.removeItem("bookingForm");
      localStorage.removeItem("returnBookingForm");
      localStorage.removeItem("widgetInventoryData");

      localStorage.setItem("isWidgetFormFilled", "true");
      toast.success(response.message || (formData.isEdit ? "Booking Updated Successfully" : "Booking Request Received"));

      window.parent.postMessage({ type: "bookingSuccess" }, "*");

      navigate("/widget-form/widget-success");
    } catch (err) {
      console.error("Booking submission failed:", err);
      setError(
        err?.data?.message || "Failed to save booking. Please try again.",
      );
    }
  };

  useEffect(() => {
    const queryParam = new URLSearchParams(window.location.search);
    const company = queryParam.get("company");
    if (company) setCompanyId(company);
  }, []);
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-(--white) border border-red-200 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
          </div>

          <h2 className="widget-title text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="widget-text-sm text-gray-500 mb-6">{error}</p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setError("");
                localStorage.removeItem("bookingForm");
                localStorage.removeItem("returnBookingForm");
                localStorage.removeItem("selectedVehicle");
                localStorage.removeItem("widgetPaymentData");
                navigate("/widget-form");
              }}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-(--white) rounded-full widget-button-text transition"
            >
              Start Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full widget-button-text transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`w-full bg-transparent py-4 md:py-8`}>
      <div>
        <Breadcrumbs />
        <Routes>
          <Route
            index
            element={
              <WidgetBooking
                companyId={companyId}
                data={formData.booking}
                onSubmitSuccess={(data) => {
                  handleDataChange("booking", data);
                  navigate(`/widget-form/widget-details?company=${companyId}`);
                }}
                onChange={(data) => handleDataChange("booking", data)}
              />
            }
          />

          <Route
            path="widget-details"
            element={
              <WidgetBookingDetails
                companyId={companyId}
                data={formData.booking}
                onSubmitSuccess={(data) => {
                  handleDataChange("booking", data);
                  handleDataChange("pricing", {
                    dropOffPrice: data.dropOffPrice || 0,
                  });
                  navigate(`/widget-form/widget-vehicle?company=${companyId}`);
                }}
                onBack={() => {
                  navigate(`/widget-form?company=${companyId}`);
                }}
                onChange={(data) => handleDataChange("booking", data)}
              />
            }
          />

          <Route
            path="widget-vehicle"
            element={
              <WidgetBookingInformation
                companyId={companyId}
                totalPrice={formData.pricing.totalPrice}
                postcodePrice={formData.pricing.postcodePrice}
                dropOffPrice={formData.pricing.dropOffPrice}
                onNext={({ totalPrice, selectedCar }) => {
                  handleDataChange("pricing", {
                    totalPrice,
                    oneWayFare: selectedCar.oneWayFare,
                  });
                  handleDataChange("vehicle", selectedCar);
                  handleDataChange("booking", {
                    ...formData.booking,
                    vehicle: selectedCar,
                  });
                  navigate(
                    `/widget-form/widget-inventory?company=${companyId}`,
                  );
                }}
              />
            }
          />

          <Route
            path="widget-inventory"
            element={
              <WidgetInventory
                companyId={companyId}
                onContinue={() => {
                  navigate(`/widget-form/widget-payment?company=${companyId}`);
                }}
                onBack={() => {
                  navigate(`/widget-form/widget-vehicle?company=${companyId}`);
                }}
              />
            }
          />
          <Route
            path="widget-payment"
            element={
              <WidgetPaymentInformation
                companyId={companyId}
                loading={isLoading}
                fare={formData.pricing.totalPrice || 0}
                vehicle={{
                  ...formData.vehicle,
                  ...JSON.parse(
                    localStorage.getItem("selectedVehicle") || "{}",
                  ),
                }}
                booking={formData.booking}
                onBookNow={(bookingData) => {
                  const pricingDataRaw = localStorage.getItem("widgetPricing");
                  const pricingData = pricingDataRaw ? JSON.parse(pricingDataRaw) : {};

                  const inventoryDataRaw = localStorage.getItem(
                    "widgetInventoryData",
                  );
                  const inventoryData = inventoryDataRaw
                    ? JSON.parse(inventoryDataRaw)
                    : {};

                  const baseFare = Number(pricingData.baseFare || formData.pricing.totalPrice || 0);
                  const additionalFare = Number(inventoryData.additionalFare || 0);
                  const workersCharges = Number(pricingData.extraHelp?.price || 0);

                  const passengerDetails =
                    bookingData?.passengerDetails ||
                    bookingData?.passenger ||
                    {};
                  const voucher = bookingData?.voucher || "";
                  const paymentMethod =
                    bookingData?.paymentMethod || "Payment Link";
                  const selectedVehicle =
                    bookingData?.selectedVehicle ||
                    bookingData?.vehicle ||
                    formData.vehicle;

                  const childSeatCharges = bookingData?.childSeatCharges || 0;
                  const fareBreakdown = bookingData?.fareBreakdown || {};

                  if (!passengerDetails.email) {
                    console.error("Missing passenger email");
                    toast.error("Please provide passenger email");
                    return;
                  }

                  const finalPayload = {
                    companyId,
                    paymentMethod,
                    referrer: window.location.href,
                    fare: baseFare,
                    additionalTimeFare: additionalFare,
                    workersCharges: workersCharges,
                    childSeatCharges: childSeatCharges,
                    vehicle: selectedVehicle,
                    passenger: {
                      name: passengerDetails.name || "",
                      email: passengerDetails.email || "",
                      phone: passengerDetails.phone || "",
                    },
                    voucher: voucher || null,
                    voucherApplied: !!voucher,
                    fareBreakdown: fareBreakdown,
                    source: formData.source,
                    ...formData.booking,
                    currency: bookingData.currency,
                  };

                  handleDataChange("vehicle", selectedVehicle);
                  handleDataChange("payment", {
                    paymentMethod,
                    passengerDetails: passengerDetails,
                  });

                  handleBookingSubmission(finalPayload);
                }}
              />
            }
          />

          <Route
            path="widget-success"
            element={
              <WidgetSuccess formData={formData} companyId={companyId} />
            }
          />

          <Route
            path="widget-vehicle/widget-payment"
            element={
              <WidgetPaymentInformation
                companyId={companyId}
                loading={isLoading}
                fare={formData.pricing.totalPrice || 0}
                vehicle={formData.vehicle}
                booking={formData.booking}
                onBookNow={(bookingData) => {
                  const passengerDetails =
                    bookingData?.passengerDetails ||
                    bookingData?.passenger ||
                    {};
                  const voucher = bookingData?.voucher || "";
                  const paymentMethod =
                    bookingData?.paymentMethod || "Payment Link";
                  const selectedVehicle =
                    bookingData?.selectedVehicle ||
                    bookingData?.vehicle ||
                    formData.vehicle;
                  const fare =
                    bookingData?.fare || formData.pricing.totalPrice || 0;
                  const childSeatCharges = bookingData?.childSeatCharges || 0;

                  if (!passengerDetails.email) {
                    console.error("Missing passenger email in nested route");
                    toast.error("Please provide passenger email");
                    return;
                  }

                  const finalPayload = {
                    companyId,
                    paymentMethod,
                    referrer: window.location.href,
                    fare: fare,
                    vehicle: selectedVehicle,
                    passenger: {
                      name: passengerDetails.name || "",
                      email: passengerDetails.email || "",
                      phone: passengerDetails.phone || "",
                    },
                    voucher: voucher || null,
                    voucherApplied: !!voucher,
                    source: formData.source,
                    ...formData.booking,
                    currency: bookingData.currency,
                  };

                  handleDataChange("vehicle", selectedVehicle);
                  handleDataChange("payment", {
                    paymentMethod,
                    passengerDetails: passengerDetails,
                  });

                  handleBookingSubmission(finalPayload);
                }}
              />
            }
          />

          <Route
            path="*"
            element={
              <WidgetBooking
                companyId={companyId}
                data={formData.booking}
                onSubmitSuccess={(data) => {
                  handleDataChange("booking", data);
                  navigate(`/widget-form/widget-details?company=${companyId}`);
                }}
                onChange={(data) => handleDataChange("booking", data)}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default WidgetMain;