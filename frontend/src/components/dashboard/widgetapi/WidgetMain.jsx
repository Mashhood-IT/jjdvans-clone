import React, { useEffect, useState } from "react";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import WidgetBooking from "./WidgetBooking";
import WidgetPaymentInformation from "./WidgetPaymentInformation";
import {
  useCreateBookingMutation,
  useUpdateBookingMutation,
} from "../../../redux/api/bookingApi";
import WidgetSuccess from "./widgetcomponents/WidgetSuccess";
import WidgetBookingInformation from "./WidgetBookingInformation";
import WidgetInventory from "./WidgetInventory";
import WidgetBookingDetails from "./WidgetBookingDetails";
import Icons from "../../../assets/icons";

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "auto",
  });

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
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
    source:
      new URLSearchParams(window.location.search).get("source") || "widget",
    isEdit:
      new URLSearchParams(window.location.search).get("isEdit") === "true",
    bookingId: new URLSearchParams(window.location.search).get("bookingId"),
  });
  const [items, setItems] = useState([]);

  const [createBooking, { isLoading: isBookingLoading }] =
    useCreateBookingMutation();
  const [updateBooking, { isLoading: isUpdateLoading }] =
    useUpdateBookingMutation();

  const isLoading = isBookingLoading || isUpdateLoading;

  useEffect(() => {
    sessionStorage.setItem("widget_tab_open", "true");
  }, []);

  useEffect(() => {
    scrollToTop();
  }, [location.pathname]);

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

  useEffect(() => {
    try {
      const bookingRaw = localStorage.getItem("bookingForm");
      const pricingRaw = localStorage.getItem("widgetPricing");
      const vehicleRaw = localStorage.getItem("selectedVehicle");
      const paymentRaw = localStorage.getItem("widgetPaymentData");

      const storedBooking = bookingRaw ? JSON.parse(bookingRaw) : {};
      const storedPricing = pricingRaw ? JSON.parse(pricingRaw) : {};
      const storedVehicle = vehicleRaw ? JSON.parse(vehicleRaw) : {};
      const storedPayment = paymentRaw ? JSON.parse(paymentRaw) : {};

      setFormData((prev) => ({
        ...prev,
        booking:
          storedBooking && Object.keys(storedBooking).length > 0
            ? storedBooking
            : prev.booking,
        vehicle:
          storedVehicle && Object.keys(storedVehicle).length > 0
            ? storedVehicle
            : prev.vehicle,
        pricing: {
          ...prev.pricing,
          ...(storedPricing && Object.keys(storedPricing).length > 0
            ? {
              totalPrice: storedPricing.totalPrice ?? prev.pricing.totalPrice,
              baseFare: storedPricing.baseFare ?? prev.pricing.baseFare,
              postcodePrice:
                storedPricing.postcodePrice ?? prev.pricing.postcodePrice,
              dropOffPrice:
                storedPricing.dropOffPrice ?? prev.pricing.dropOffPrice,
            }
            : {}),
        },
        payment: {
          ...prev.payment,
          ...(storedPayment &&
            (storedPayment.passengerDetails || storedPayment.formData)
            ? {
              paymentMethod:
                storedPayment.formData?.paymentMethod ??
                prev.payment.paymentMethod,
              passengerDetails:
                storedPayment.passengerDetails ??
                prev.payment.passengerDetails,
            }
            : {}),
        },
      }));
    } catch (e) {
      console.error("Failed to hydrate widget form state from storage:", e);
    }
  }, []);

  useEffect(() => {
    try {
      const pathname = window.location.pathname;
      const search = window.location.search;
      if (pathname.startsWith("/widget-form")) {
        localStorage.setItem("widgetLastPath", `${pathname}${search}`);
      }
    } catch (e) {
      console.error("Failed to store widget last path:", e);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    try {
      const pathname = window.location.pathname;
      const search = window.location.search;
      const isBaseWidgetPath =
        pathname === "/widget-form" || pathname === "/widget-form/";

      if (!isBaseWidgetPath) return;

      const lastPath = localStorage.getItem("widgetLastPath");
      if (lastPath && lastPath !== `${pathname}${search}`) {
        navigate(lastPath, { replace: true });
      }
    } catch (e) {
      console.error("Failed to restore widget last path:", e);
    }
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
      const inventoryData = inventoryDataRaw
        ? JSON.parse(inventoryDataRaw)
        : {};

      const pricingDataRaw = localStorage.getItem("widgetPricing");
      const pricingData = pricingDataRaw ? JSON.parse(pricingDataRaw) : {};

      const additionalFare = Number(inventoryData.additionalFare || 0);
      const floorCharges = Number(inventoryData.floorCharges || 0);
      const accessTypeCharges = Number(inventoryData.accessTypeCharges || 0);
      const workersCharges = Number(pricingData.extraHelp?.price || 0);
      const baseFare = Number(pricingData.baseFare || finalPayload.fare || 0);

      const totalPrice = baseFare + additionalFare + floorCharges + accessTypeCharges + workersCharges;

      const bookingFormRaw = localStorage.getItem("bookingForm");
      const bookingFormData = bookingFormRaw ? JSON.parse(bookingFormRaw) : {};

      const distanceText = bookingFormData.distanceText || "";
      const durationText = bookingFormData.durationText || "";

      const rawAddedMinutes = Math.max(
        0,
        (inventoryData.estimatedHours || 0) * 60 +
        (inventoryData.estimatedMinutes || 0) -
        (inventoryData.initialGoogleMinutes || 0),
      );
      const billableAddedMinutes = Math.ceil(rawAddedMinutes / 30) * 30;

      const normalizedPayload = {
        ...finalPayload,
        fare: baseFare,
        totalPrice: totalPrice,
        extras: {
          ...finalPayload.extras,
          extraTime: billableAddedMinutes.toString(),
          rideAlong: finalPayload.ridingAlong ? "Yes" : "No",
        },
        pickupFloorNo: inventoryData.pickupFloor || 0,
        dropoffFloorNo: inventoryData.dropoffFloor || 0,
        pickupAccess: inventoryData.pickupAccess || "STAIRS",
        dropoffAccess: inventoryData.dropoffAccess || "STAIRS",

        additionalDropoff1FloorNo:
          inventoryData.floorAccess?.additionalDropoff1Floor || 0,
        additionalDropoff1Access:
          inventoryData.floorAccess?.additionalDropoff1Access || "STAIRS",
        additionalDropoff2FloorNo:
          inventoryData.floorAccess?.additionalDropoff2Floor || 0,
        additionalDropoff2Access:
          inventoryData.floorAccess?.additionalDropoff2Access || "STAIRS",
        additionalDropoff3FloorNo:
          inventoryData.floorAccess?.additionalDropoff3Floor || 0,
        additionalDropoff3Access:
          inventoryData.floorAccess?.additionalDropoff3Access || "STAIRS",
        additionalDropoff4FloorNo:
          inventoryData.floorAccess?.additionalDropoff4Floor || 0,
        additionalDropoff4Access:
          inventoryData.floorAccess?.additionalDropoff4Access || "STAIRS",

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
        response = await updateBooking({
          id: formData.bookingId,
          ...normalizedPayload,
        }).unwrap();
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

      if (!formData.isEdit) {
        toast.success(response.message || "Booking Request Received");
      }

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
        <div className="bg-(--white) border border-(--medium-red) rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-(--light-red) rounded-full p-4">
              <Icons.AlertCircle className="h-10 w-10 text-(--primary-dark-red)" />
            </div>
          </div>

          <h2 className="widget-title text-(--dark-grey) mb-2">
            Something went wrong
          </h2>
          <p className="widget-text-sm text-(--dark-grey) mb-6">{error}</p>

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
              className="px-6 py-2.5 bg-(--primary-dark-red) text-(--white) rounded-full widget-button-text transition"
            >
              Start Again
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 bg-(--light-gray) hover:bg-(--medium-grey) text-(--dark-grey) rounded-full widget-button-text transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  const getStepUrl = (path) => {
    const params = new URLSearchParams();
    params.set("company", companyId);
    if (formData.isEdit) {
      params.set("isEdit", "true");
      if (formData.bookingId) {
        params.set("bookingId", formData.bookingId);
      }
    }
    return `${path}?${params.toString()}`;
  };

  return (
    <div className={`w-full h-fit bg-transparent`}>
      <div>
        <Routes>
          <Route
            index
            element={
              <WidgetBooking
                companyId={companyId}
                isEdit={formData.isEdit}
                bookingId={formData.bookingId}
                data={formData.booking}
                onSubmitSuccess={(data) => {
                  handleDataChange("booking", data);
                  navigate(getStepUrl("/widget-form/widget-details"));
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
                isEdit={formData.isEdit}
                bookingId={formData.bookingId}
                data={formData.booking}
                onSubmitSuccess={(data) => {
                  handleDataChange("booking", data);
                  handleDataChange("pricing", {
                    dropOffPrice: data.dropOffPrice || 0,
                  });
                  navigate(getStepUrl("/widget-form/widget-vehicle"));
                }}
                onBack={() => {
                  navigate(getStepUrl("/widget-form"));
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
                isEdit={formData.isEdit}
                bookingId={formData.bookingId}
                data={formData.booking}
                totalPrice={formData.pricing.totalPrice}
                postcodePrice={formData.pricing.postcodePrice}
                dropOffPrice={formData.pricing.dropOffPrice}
                onNext={({ totalPrice, selectedCar, bookingData }) => {
                  handleDataChange("pricing", {
                    totalPrice,
                    oneWayFare: selectedCar.oneWayFare,
                  });
                  handleDataChange("vehicle", selectedCar);
                  handleDataChange("booking", {
                    ...formData.booking,
                    ...bookingData,
                    vehicle: selectedCar,
                  });
                  navigate(getStepUrl("/widget-form/widget-inventory"));
                }}
                onBack={() => {
                  navigate(getStepUrl("/widget-form/widget-details"));
                }}
              />
            }
          />

          <Route
            path="widget-inventory"
            element={
              <WidgetInventory
                items={items}
                setItems={setItems}
                companyId={companyId}
                isEdit={formData.isEdit}
                bookingId={formData.bookingId}
                onContinue={() => {
                  navigate(getStepUrl("/widget-form/widget-payment"));
                }}
                onBack={() => {
                  navigate(getStepUrl("/widget-form/widget-vehicle"));
                }}
              />
            }
          />
          <Route
            path="widget-payment"
            element={
              <WidgetPaymentInformation
                companyId={companyId}
                isEdit={formData.isEdit}
                bookingId={formData.bookingId}
                loading={isLoading}
                fare={formData.pricing.totalPrice || 0}
                vehicle={{
                  ...formData.vehicle,
                  ...JSON.parse(
                    localStorage.getItem("selectedVehicle") || "{}",
                  ),
                }}
                booking={formData.booking}
                onBack={() => {
                  navigate(getStepUrl("/widget-form/widget-inventory"));
                }}
                onBookNow={(bookingData) => {
                  const pricingDataRaw = localStorage.getItem("widgetPricing");
                  const pricingData = pricingDataRaw
                    ? JSON.parse(pricingDataRaw)
                    : {};

                  const inventoryDataRaw = localStorage.getItem(
                    "widgetInventoryData",
                  );
                  const inventoryData = inventoryDataRaw
                    ? JSON.parse(inventoryDataRaw)
                    : {};

                  const baseFare = Number(
                    pricingData.baseFare || formData.pricing.totalPrice || 0,
                  );
                  const additionalFare = Number(
                    inventoryData.additionalFare || 0,
                  );
                  const workersCharges = Number(
                    pricingData.extraHelp?.price || 0,
                  );

                  const passengerDetails =
                    bookingData?.passengerDetails ||
                    bookingData?.passenger ||
                    {};
                  const voucher = bookingData?.voucher || "";
                  const paymentMethod =
                    bookingData?.paymentMethod || "Payment Link";
                  const selectedVehicle = {
                    ...(bookingData?.selectedVehicle || bookingData?.vehicle || formData.vehicle),
                    extraHelp: pricingData.extraHelp || null
                  };

                  const childSeatCharges = bookingData?.childSeatCharges || 0;
                  const fareBreakdown = bookingData?.fareBreakdown || {};

                  if (!passengerDetails.email || !passengerDetails.name || !passengerDetails.phone) {
                    console.error("Missing passenger details");
                    toast.error("Please provide passenger details");
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

          {/* 
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
                  const selectedVehicle = {
                    ...(bookingData?.selectedVehicle || bookingData?.vehicle || formData.vehicle),
                    extraHelp: JSON.parse(localStorage.getItem("widgetPricing") || "{}").extraHelp || null
                  };
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
          */}

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
