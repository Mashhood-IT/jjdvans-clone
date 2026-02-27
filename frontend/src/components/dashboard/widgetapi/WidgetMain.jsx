import React, { useCallback, useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  Routes,
  Route,
} from "react-router-dom";
import { toast } from "react-toastify";
import WidgetBooking from "./WidgetBooking";
import WidgetPaymentInformation from "./WidgetPaymentInformation";
import { useCreateBookingMutation } from "../../../redux/api/bookingApi";
import WidgetSuccess from "./widgetcomponents/WidgetSuccess";
import { useDispatch, useSelector } from "react-redux";
import WidgetBookingInformation from "./WidgetBookingInformation";
import WidgetInventory from "./WidgetInventory";
// import {
//   selectThemeHistory,
//   setSelectedThemeId,
//   setThemeColors,
//   setThemeHistory,
// } from "../../../redux/slices/themeSlice"; // Removed Theme Slice
// import {
//   useFetchPublicThemeHistoryQuery,
// } from "../../../redux/api/themeApi"; // Removed Theme API
// import { skipToken } from "@reduxjs/toolkit/query";

const applyThemeVars = (theme) => {
  if (!theme) return;
  const root = document.documentElement;

  const mapping = {
    bg: "widgetBg",
    text: "widgetText",
    primary: "widgetPrimary",
    hover: "widgetHover",
    active: "widgetActive",
    border: "widgetBorder",
    btnBg: "widgetBtnBg",
    btnText: "widgetBtnText",
  };

  Object.entries(theme).forEach(([key, value]) => {
    const cssVarName = mapping[key] || key;
    root.style.setProperty(`--${cssVarName}`, value);
  });
};

const WidgetMain = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [companyId, setCompanyId] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    booking: {},
    vehicle: {},
    payment: {},
    pricing: {},
  });

  // Static Dashboard Theme (based on dashboard.jsx style)
  // const dashboardTheme = {
  //   bg: "#ffffff",
  //   text: "#000000",
  //   primary: "#07384d",
  //   hover: "#01f5fe",
  //   active: "#064f7c",
  //   border: "#cecece",
  //   btnBg: "#07384d",
  //   btnText: "#ffffff",
  // };

  // const history = useSelector(selectThemeHistory);
  // const [sendPaymentLink] = useSendPaymentLinkMutation();
  const [createBooking, { isLoading: isBookingLoading }] = useCreateBookingMutation();
  // const { data: historyRes, isSuccess: isHistorySuccess } =
  //   useFetchPublicThemeHistoryQuery(companyId ? companyId : skipToken);

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

    if (sid === "%7BCHECKOUT_SESSION_ID%7D" || sid === "{CHECKOUT_SESSION_ID}") {
      console.warn("Stripe session_id placeholder was not replaced. Skipping booking creation.");
      return;
    }

    if (!sid) return;

    toast.success("Payment Received");
    navigate("/widget-form/widget-success");
  }, [navigate]);

  const applyThemeToDOM = useCallback((themeColors) => {
    applyThemeVars(themeColors);
  }, []);


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

      const normalizedPayload = {
        ...finalPayload,
        pickupFloorNo: inventoryData.pickupFloor || 0,
        dropoffFloorNo: inventoryData.dropoffFloor || 0,
        accessType: (inventoryData.pickupAccess === "LIFT" || inventoryData.dropoffAccess === "LIFT")
          ? "Lift"
          : "Stairs",
        inventoryItems: inventoryData.items ? inventoryData.items.map(i => i.name).join(", ") : "",
        estimatedDuration: (inventoryData.estimatedHours || 0) * 60 + (inventoryData.estimatedMinutes || 0),
        passengerCount: inventoryData.passengerCount || 1,
        ridingAlong: inventoryData.ridingAlong || false,
      };

      console.log("Real Booking Submission (Normalized):", normalizedPayload);
      const response = await createBooking(normalizedPayload).unwrap();
      console.log("Booking result:", response);

      localStorage.removeItem("selectedVehicle");
      localStorage.removeItem("widgetPricing");
      localStorage.removeItem("widgetPaymentData");
      localStorage.removeItem("bookingForm");
      localStorage.removeItem("returnBookingForm");
      localStorage.removeItem("widgetInventoryData");

      localStorage.setItem("isWidgetFormFilled", "true");
      toast.success(response.message || "Booking Request Received");
      navigate("/widget-form/widget-success");
    } catch (err) {
      console.error("Booking submission failed:", err);
      setError(err?.data?.message || "Failed to save booking. Please try again.");
    }
  };

  useEffect(() => {
    const company = "68c957910b4cb85264e6ef87";
    if (company) setCompanyId(company);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white border border-red-200 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {error}
          </p>

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
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium text-sm transition"
            >
              Start Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium text-sm transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`w-full bg-transparent  ${location.pathname === "/widget-form/widget-success" ? "py-32 px-4" : location.pathname === "/widget-form/widget-payment" ? "py-0" : "py-6 px-4"
        }`}
    >
      {location.pathname === "/widget-form" && (
        <>
          <div className="text-center mb-5">
            <h1 className="text-3xl uppercase font-extrabold text-(--widgetText) drop-shadow-sm">
              Move Smarter. Move Stress-Free
            </h1>
          </div>
        </>
      )}

      <div className="w-full mx-auto">
        <Routes>
          <Route
            index
            element={
              <WidgetBooking
                companyId={companyId}
                data={formData.booking}
                onSubmitSuccess={(data) => {
                  handleDataChange("booking", data);
                  handleDataChange("pricing", {
                    dropOffPrice: data.dropOffPrice || 0,
                  });
                  navigate(`/widget-form/widget-vehicle?company=${companyId}`);
                }}
                onChange={(data) => handleDataChange("booking", data)}
                onCheckedPriceFound={(matchedPrice) =>
                  handleDataChange("pricing", matchedPrice)
                }
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
                onNext={({
                  totalPrice,
                  selectedCar,
                }) => {
                  handleDataChange("pricing", {
                    totalPrice,
                    oneWayFare: selectedCar.oneWayFare,
                  });
                  handleDataChange("vehicle", selectedCar);
                  handleDataChange("booking", {
                    ...formData.booking,
                    vehicle: selectedCar,
                  });
                  navigate(`/widget-form/widget-inventory?company=${companyId}`);
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
                loading={isBookingLoading}
                fare={formData.pricing.totalPrice || 0}
                vehicle={{
                  ...formData.vehicle,
                  ...JSON.parse(
                    localStorage.getItem("selectedVehicle") || "{}",
                  ),
                }}
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
                    fare: fare,
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
                    ...formData.booking,
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
                loading={isBookingLoading}
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
                    ...formData.booking,
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
                  navigate(`/widget-form/widget-vehicle?company=${companyId}`);
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