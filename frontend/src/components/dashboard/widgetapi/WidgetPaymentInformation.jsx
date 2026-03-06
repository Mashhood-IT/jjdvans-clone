import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import Icons from "../../../assets/icons";
import { useGetPublicBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";
import SelectOption from "../../constants/constantcomponents/SelectOption";
import { useCreatePaymentIntentMutation } from "../../../redux/api/paymentApi";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const StripeCheckoutForm = ({ clientSecret, onPaymentSuccess, onPaymentError, totalPrice, currencySymbol, isProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [localProcessing, setLocalProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || localProcessing) return;

    setLocalProcessing(true);
    onPaymentError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onPaymentError(submitError.message);
        setLocalProcessing(false);
        return;
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: window.location.origin + window.location.pathname,
        },
        redirect: "if_required",
      });

      if (error) {
        onPaymentError(error.message);
        setLocalProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        await onPaymentSuccess();
      } else {
        onPaymentError("Payment was not successful. Please try again.");
      }
    } catch (err) {
      console.error("Stripe Checkout Error:", err);
      onPaymentError("An unexpected error occurred during payment.");
    } finally {
      setLocalProcessing(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          Secure Card Payment
        </h3>

        <PaymentElement id="payment-element" options={{ layout: "tabs" }} />

        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 text-sm">Amount to Pay</span>
            <span className="text-xl font-bold text-gray-900">{currencySymbol}{totalPrice}</span>
          </div>

          <button
            type="submit"
            disabled={localProcessing || !stripe}
            className={`btn w-full ${localProcessing || !stripe
              ? "btn-edit"
              : "btn-success"
              }`}
          >
            {localProcessing ? "Processing Payment..." : "Pay & Book Now"}
          </button>

        </div>
      </div>
    </form>
  );
};

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
  // const companyId = new URLSearchParams(window.location.search).get("company") || ""; // Removed as companyId is now a prop
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
            amount: finalFare, // Use finalFare for amount
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
      initStripe();
    }
  }, [formData.paymentMethod, finalFare, companyId, currencySetting.value, clientSecret, createPaymentIntent]); // Added clientSecret and createPaymentIntent to dependencies

  const onBookNowClick = async (paymentData) => { // Renamed from onBookNowClick to handleBookNow
    // This is the original booking logic, now called by handleBookNow
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

    await onBookNow?.(bookingData); // Ensure onBookNow is awaited

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

    // Stripe is handled by StripeCheckoutForm internally
    if (formData.paymentMethod !== "Stripe") {
      await onBookNowClick(formData);
    }
  };

  return (
    <div className="md:px-12 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <span>BOOKING</span>
          <span>/</span>
          <span className="font-medium">PASSENGER & FARE DETAILS</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Complete Your Booking
        </h1>
        <p className="text-gray-600">
          Verify your relocation details and passenger requirements to finalize your
          professional service estimate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-(--white) rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-(--white) text-sm font-semibold">
                01
              </div>
              <h2 className="text-xl font-bold text-gray-900">Client Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
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
                  className="w-full px-4 py-1.5 bg-(--lighter-gray) border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
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
                  className="w-full px-4 py-1.5 bg-(--lighter-gray) border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
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
                  inputClass="!w-full !py-1.5 !bg-(--lighter-gray) !border !border-gray-200 !rounded-lg"
                  containerClass="w-full"
                />
              </div>
            </div>
          </div>

          <div className="bg-(--white) rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-(--white) text-sm font-semibold">
                02
              </div>
              <h2 className="text-xl font-bold text-gray-900">Service Requirements</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Moving Date
                </label>
                <div className="relative">
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
                    className="w-full pl-10 pr-4 py-1.5 bg-(--lighter-gray) border border-gray-200 rounded-lg focus:outline-none"
                  />
                  <Icons.Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Moving Time
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={
                      booking?.hour !== undefined && booking?.minute !== undefined
                        ? `${String(booking.hour).padStart(2, "0")} : ${String(booking.minute).padStart(2, "0")}`
                        : ""
                    }
                    readOnly
                    className="w-full pl-10 pr-4 py-1.5 bg-(--lighter-gray) border border-gray-200 rounded-lg focus:outline-none"
                  />
                  <Icons.Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                  Pickup Address
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={booking?.pickup || ""}
                    placeholder="Pickup Address"
                    readOnly
                    className="w-full pl-10 pr-4 py-1.5 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed text-gray-500"
                  />
                  <Icons.MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
                    <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                      {idx === 0 ? "DROPOFF ADDRESS" : `Additional Drop-off ${idx}`}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={dropoff}
                        placeholder="Drop-off Address"
                        readOnly
                        className="w-full pl-10 pr-4 py-1.5 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed text-gray-500"
                      />
                      <Icons.Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-(--white) rounded-lg shadow-sm p-6 sticky top-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Price Estimate</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Fare</span>
                <span className="font-medium text-gray-900">
                  {pricingInfo.currencySymbol}
                  {pricingInfo.baseFare.toFixed(2)}
                </span>
              </div>
              {pricingInfo.workersCharges > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Extra Workers</span>
                  <span className="font-medium text-gray-900">
                    +{pricingInfo.currencySymbol}
                    {pricingInfo.workersCharges.toFixed(2)}
                  </span>
                </div>
              )}
              {pricingInfo.extraTimeCharges > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Extra Time</span>
                  <span className="font-medium text-gray-900">
                    +{pricingInfo.currencySymbol}
                    {pricingInfo.extraTimeCharges.toFixed(2)}
                  </span>
                </div>
              )}
              {pricingInfo.childSeatTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Child Seats</span>
                  <span className="font-medium text-gray-900">
                    +{pricingInfo.currencySymbol}
                    {pricingInfo.childSeatTotal.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="text-3xl font-bold text-gray-900">
                {pricingInfo.currencySymbol}
                {finalFare?.toFixed(2)}
              </div>
            </div>
            <div className="mt-8 space-y-4">
              <SelectOption
                label="Choose Payment Option"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, paymentMethod: e.target.value }))
                }
                options={[
                  { label: "Cash", value: "Cash" },
                  { label: "Stripe", value: "Stripe" },
                  { label: "Paypal", value: "Paypal" },
                ]}
              />

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
                  <StripeCheckoutForm
                    clientSecret={clientSecret}
                    totalPrice={finalFare}
                    currencySymbol={currencySymbol}
                    isProcessing={isProcessingStripe}
                    onPaymentError={(msg) => setStripeError(msg)}
                    onPaymentSuccess={() => onBookNowClick(formData)}
                  />
                </Elements>
              )}

              {stripeError && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl animate-in fade-in duration-300">
                  {stripeError}
                </div>
              )}

              {formData.paymentMethod !== "Stripe" && (
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