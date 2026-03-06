import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import { useGetPublicBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";
import SelectOption from "../../constants/constantcomponents/SelectOption";
import { useCreatePaymentIntentMutation } from "../../../redux/api/paymentApi";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
} from "@stripe/react-stripe-js";
import StripeCheckout from "../../../paymentMethod/StripeCheckout";
import PayPalCheckout from "../../../paymentMethod/PayPalCheckout";
import WidgetStepHeader from './widgetcomponents/WidgetStepHeader';

const WidgetPaymentInformation = ({
  companyId,
  onBookNow,
  vehicle = {},
  booking = {},
  loading = false,
}) => {
  const [passengerDetails, setPassengerDetails] = useState({
    email: "",
    phone: "",
  });
  const { data: bookingSettingData } = useGetPublicBookingSettingQuery(companyId, {
    skip: !companyId
  });

  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const [stripePromise, setStripePromise] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [isProcessingStripe, setIsProcessingStripe] = useState(false);
  const [stripeError, setStripeError] = useState(null);

  const [formData, setFormData] = useState({
    passenger: "",
    childSeat: "",
    babySeat: "",
    carSeat: "",
    boosterSeat: "",
    paymentMethod: "Cash",
  });

  const [localVehicle, setLocalVehicle] = useState(vehicle);
  const [selectedCountry, setSelectedCountry] = useState("gb");

  const generalPricing = {
    childSeatPrice: 10,
    paymentMethodSurcharges: [],
    cardPaymentAmount: 5
  };

  const childSeatUnitPrice = useMemo(() => {
    return generalPricing?.childSeatPrice || 10.0;
  }, [generalPricing]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const loadInitialData = () => {
      const savedFormData = localStorage.getItem("widgetPaymentData");
      if (savedFormData) {
        try {
          const parsed = JSON.parse(savedFormData);

          setPassengerDetails((prev) => ({
            ...prev,
            ...(parsed.passengerDetails || {}),
          }));

          setFormData((prev) => ({
            ...prev,
            ...(parsed.formData || {}),
          }));

          if (parsed.selectedCountry)
            setSelectedCountry(parsed.selectedCountry);
        } catch (err) {
          console.error("Error loading payment data:", err);
        }
      }

      const savedVehicle = localStorage.getItem("selectedVehicle");
      if (savedVehicle) {
        try {
          const parsed = JSON.parse(savedVehicle);

          setLocalVehicle((prev) => ({
            ...prev,
            image: parsed.image || vehicle.image,
            vehicleName: parsed.vehicleName || vehicle.vehicleName,
            passenger: parsed.passenger || vehicle.passenger || 0,
            childSeat: parsed.childSeat || vehicle.childSeat || 0,
            babySeat: parsed.babySeat || vehicle.babySeat || 0,
            carSeat: parsed.carSeat || vehicle.carSeat || 0,
            boosterSeat: parsed.boosterSeat || vehicle.boosterSeat || 0,
            checkinLuggage:
              parsed.checkinLuggage || vehicle.checkinLuggage || 0,
            maxPassenger: parsed.maxPassenger || vehicle.passengers || 0,
          }));

          setFormData((prev) => ({
            ...prev,
            passenger: String(parsed.passenger || vehicle.passenger || "0"),
          }));
        } catch (err) {
          console.error("Error parsing selectedVehicle:", err);
        }
      }
    };

    loadInitialData();
  }, [vehicle]);



  const currencySetting = bookingSettingData?.setting?.currency?.[0] || {};
  const currencySymbol = currencySetting?.symbol || "£";

  const [journeyDateTime, setJourneyDateTime] = useState(null);

  const parseIntSafe = (val) => {
    const parsed = parseInt(val);
    return !isNaN(parsed) && parsed >= 0 ? parsed : 0;
  };

  useEffect(() => {
    const bookingHasFullTime =
      booking &&
      booking.date &&
      booking.hour !== undefined &&
      booking.hour !== null &&
      booking.minute !== undefined &&
      booking.minute !== null;

    let effectiveBooking = null;

    if (bookingHasFullTime) {
      effectiveBooking = booking;
    } else {
      try {
        const raw = localStorage.getItem("bookingForm");
        effectiveBooking = raw ? JSON.parse(raw) : {};
      } catch (e) {
        effectiveBooking = {};
      }
    }

    const hasDate = !!effectiveBooking?.date;
    const hourVal =
      effectiveBooking?.hour !== undefined && effectiveBooking?.hour !== null
        ? Number(effectiveBooking.hour)
        : NaN;
    const minuteVal =
      effectiveBooking?.minute !== undefined &&
        effectiveBooking?.minute !== null
        ? Number(effectiveBooking.minute)
        : NaN;

    const hasHour = !isNaN(hourVal);
    const hasMinute = !isNaN(minuteVal);

    if (hasDate && hasHour && hasMinute) {
      const dt = new Date(effectiveBooking.date);
      dt.setHours(hourVal);
      dt.setMinutes(minuteVal);
      setJourneyDateTime(dt);
    } else {
      setJourneyDateTime(null);
    }
  }, [booking]);

  useEffect(() => {
    const dataToSave = {
      passengerDetails,
      formData,
      selectedCountry,
    };
    localStorage.setItem("widgetPaymentData", JSON.stringify(dataToSave));
  }, [passengerDetails, formData]);

  const pricingInfo = useMemo(() => {
    const pricingDataRaw = localStorage.getItem("widgetPricing");
    const pricingData = pricingDataRaw ? JSON.parse(pricingDataRaw) : {};

    const inventoryDataRaw = localStorage.getItem("widgetInventoryData");
    const inventoryData = inventoryDataRaw ? JSON.parse(inventoryDataRaw) : {};

    const baseFare = Number(pricingData.baseFare || 0);
    const workersCharges = Number(pricingData.extraHelp?.price || 0);
    const extraTimeCharges = Number(inventoryData.additionalFare || 0);

    const childSeatCount = parseIntSafe(formData.childSeat || "0");
    const childSeatTotal = childSeatCount * childSeatUnitPrice;

    const total = baseFare + workersCharges + extraTimeCharges + childSeatTotal;

    return {
      baseFare,
      workersCharges,
      extraTimeCharges,
      childSeatTotal,
      total,
      currencySymbol: pricingData.currencySymbol || currencySymbol
    };
  }, [formData.childSeat, childSeatUnitPrice]);

  const finalFare = pricingInfo.total;

  useEffect(() => {
    if (formData.paymentMethod === "Stripe" && !clientSecret) {
      const initStripe = async () => {
        try {
          const res = await createPaymentIntent({
            amount: finalFare,
            currency: currencySetting.value || "GBP",
            companyId,
          }).unwrap();

          if (res.publishableKey) {
            setStripePromise(loadStripe(res.publishableKey));
          }
          if (res.clientSecret) {
            setClientSecret(res.clientSecret);
          }
        } catch (err) {
          console.error("Failed to init Stripe", err);
          setStripeError("Could not initialize Stripe payment. Please try another method.");
        }
      };
      // Only attempt to init Stripe if it is actually enabled
      if (bookingSettingData?.setting?.stripeKeys?.enabled) {
        initStripe();
      }
    }
  }, [formData.paymentMethod, finalFare, companyId, currencySetting.value, clientSecret, createPaymentIntent, bookingSettingData?.setting?.stripeKeys?.enabled]);

  // Safety check to ensure the chosen payment method is valid according to current settings
  useEffect(() => {
    if (bookingSettingData?.setting) {
      const allowedMethods = ["Cash"];
      if (bookingSettingData.setting.stripeKeys?.enabled) allowedMethods.push("Stripe");
      if (bookingSettingData.setting.paypalKeys?.enabled) allowedMethods.push("Paypal");

      if (!allowedMethods.includes(formData.paymentMethod)) {
        setFormData(prev => ({ ...prev, paymentMethod: "Cash" }));
      }
    }
  }, [bookingSettingData, formData.paymentMethod]);

  const onBookNowClick = async (paymentData) => {
    if (!paymentData.paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    const bookingData = {
      passengerDetails: passengerDetails,
      passenger: passengerDetails,
      fare: finalFare,
      childSeats: Number(formData.childSeat) || 0,
      paymentMethod: paymentData.paymentMethod,
      selectedVehicle: {
        vehicleName: vehicle.vehicleName || localVehicle.vehicleName,
        passenger: Number(formData.passenger) || 0,
      },
      fareBreakdown: {
        baseFare: pricingInfo.baseFare,
        workersCharges: pricingInfo.workersCharges,
        extraTimeCharges: pricingInfo.extraTimeCharges,
        childSeatCharges: pricingInfo.childSeatTotal,
        total: pricingInfo.total,
      },
      currency: {
        symbol: currencySymbol,
        value: currencySetting?.value || "GBP"
      }
    };

    await onBookNow?.(bookingData);

    localStorage.removeItem("selectedVehicle");
    localStorage.removeItem("widgetPricing");
    localStorage.removeItem("widgetPaymentData");
    localStorage.removeItem("returnBookingForm");
    localStorage.removeItem("isWidgetFormFilled");
  };

  const handleBookNow = async () => {
    if (!formData.paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    if (formData.paymentMethod !== "Stripe") {
      await onBookNowClick(formData);
    }
  };

  return (
    <div className="px-4 md:px-8 2xl:max-w-7xl 2xl:mx-auto">
      <WidgetStepHeader
        step="4"
        title="Complete Your Booking"
        description="Verify your relocation details and passenger requirements to finalize your professional service estimate."
      />


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-(--white) rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-(--white) widget-value-text-sm">
                01
              </div>
              <h2 className="widget-title text-gray-900">Client Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block widget-label-small text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={passengerDetails.name}
                  onChange={(e) =>
                    setPassengerDetails({
                      ...passengerDetails,
                      name: e.target.value,
                    })
                  }
                  placeholder="John"
                  className="custom_input"
                />
              </div>

              <div>
                <label className="block widget-label-small text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={passengerDetails.email}
                  onChange={(e) =>
                    setPassengerDetails({
                      ...passengerDetails,
                      email: e.target.value,
                    })
                  }
                  placeholder="john.doe@corporate.com"
                  className="custom_input"
                />
              </div>
              <div>
                <label className="block widget-label-small text-gray-700 mb-2">
                  Phone
                </label>

                <PhoneInput
                  country={"gb"}
                  value={passengerDetails.phone}
                  onChange={(phone) =>
                    setPassengerDetails({
                      ...passengerDetails,
                      phone: phone,
                    })
                  }
                  inputClass="custom_input"
                  containerClass="w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-(--white) rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-(--white) widget-value-text-sm">
                02
              </div>
              <h2 className="widget-title text-gray-900">Service Requirements</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block widget-label-small text-gray-700 mb-2">
                  Moving Date
                </label>
                <div>
                  <input
                    type="text"
                    value={
                      booking?.date
                        ? new Date(booking.date).toLocaleDateString("en-GB", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                        : ""
                    }
                    readOnly
                    className="custom_input cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block widget-label-small text-gray-700 mb-2">
                  Moving Time
                </label>
                <div>
                  <input
                    type="text"
                    value={
                      booking?.hour !== undefined && booking?.minute !== undefined
                        ? `${String(booking.hour).padStart(2, "0")} : ${String(booking.minute).padStart(2, "0")}`
                        : ""
                    }
                    readOnly
                    className="custom_input cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block widget-label-small text-gray-700 mb-2">
                  Pickup Address
                </label>
                <div>
                  <input
                    type="text"
                    value={booking?.pickup || ""}
                    placeholder="Pickup Address"
                    readOnly
                    className="custom_input cursor-not-allowed"
                  />
                </div>
              </div>

              {[
                booking?.dropoff,
                booking?.additionalDropoff1,
                booking?.additionalDropoff2,
                booking?.additionalDropoff3,
                booking?.additionalDropoff4,
              ]
                .filter(Boolean)
                .map((dropoff, idx) => (
                  <div key={idx} className="md:col-span-1">
                    <label className="block widget-label-small text-gray-700 mb-2">
                      {idx === 0 ? "DROPOFF ADDRESS" : `Additional Drop-off ${idx}`}
                    </label>
                    <div>
                      <input
                        type="text"
                        value={dropoff}
                        placeholder="Drop-off Address"
                        readOnly
                        className="custom_input cursor-not-allowed"
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-(--white) rounded-lg shadow-sm p-6 sticky top-8">
            <h3 className="widget-title text-gray-900 mb-6">Price Estimate</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between widget-description">
                <span className="text-gray-600">Base Fare</span>
                <span className="widget-value-text text-gray-900">
                  {pricingInfo.currencySymbol}
                  {pricingInfo.baseFare.toFixed(2)}
                </span>
              </div>
              {pricingInfo.workersCharges > 0 && (
                <div className="flex justify-between widget-description">
                  <span className="text-gray-600">Extra Workers</span>
                  <span className="widget-value-text text-gray-900">
                    +{pricingInfo.currencySymbol}
                    {pricingInfo.workersCharges.toFixed(2)}
                  </span>
                </div>
              )}
              {pricingInfo.extraTimeCharges > 0 && (
                <div className="flex justify-between widget-description">
                  <span className="text-gray-600">Extra Time</span>
                  <span className="widget-value-text text-gray-900">
                    +{pricingInfo.currencySymbol}
                    {pricingInfo.extraTimeCharges.toFixed(2)}
                  </span>
                </div>
              )}
              {pricingInfo.childSeatTotal > 0 && (
                <div className="flex justify-between widget-description">
                  <span className="text-gray-600">Child Seats</span>
                  <span className="widget-value-text text-gray-900">
                    +{pricingInfo.currencySymbol}
                    {pricingInfo.childSeatTotal.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="widget-price-large text-3xl text-gray-900">
                {pricingInfo.currencySymbol}
                {finalFare?.toFixed(2)}
              </div>
            </div>
            <div className="mt-8 space-y-4">
              {(() => {
                const options = [{ label: "Cash", value: "Cash" }];
                if (bookingSettingData?.setting?.stripeKeys?.enabled) {
                  options.push({ label: "Stripe", value: "Stripe" });
                }
                if (bookingSettingData?.setting?.paypalKeys?.enabled) {
                  options.push({ label: "Paypal", value: "Paypal" });
                }

                return (
                  <SelectOption
                    label="Choose Payment Option"
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))
                    }
                    options={options}
                  />
                );
              })()}

              {formData.paymentMethod === "Stripe" && stripePromise && clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: "stripe",
                      variables: {
                        colorPrimary: "#1f2937",
                        borderRadius: "12px",
                      },
                    },
                  }}
                >
                  <StripeCheckout
                    clientSecret={clientSecret}
                    totalPrice={finalFare}
                    currencySymbol={currencySymbol}
                    isProcessing={isProcessingStripe}
                    onPaymentError={(msg) => setStripeError(msg)}
                    onPaymentSuccess={() => onBookNowClick(formData)}
                  />
                </Elements>
              )}

              {formData.paymentMethod === "Paypal" && (
                <div className="mt-4">
                  <PayPalCheckout
                    companyId={companyId}
                    amount={finalFare}
                    bookingId={booking?._id || "new-booking"}
                    onSuccess={() => onBookNowClick(formData)}
                    onError={(err) => {
                      console.error("PayPal Error:", err);
                      toast.error("PayPal payment failed. Please try again.");
                    }}
                  />
                </div>
              )}

              {stripeError && (
                <div className="p-4 bg-red-50 border border-red-100 widget-error-text rounded-xl animate-in fade-in duration-300">
                  {stripeError}
                </div>
              )}

              {formData.paymentMethod !== "Stripe" && formData.paymentMethod !== "Paypal" && (
                <button
                  onClick={handleBookNow}
                  className="btn btn-back w-full mt-4"
                >
                  Book Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetPaymentInformation;