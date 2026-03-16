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
  isEdit = false,
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
    paymentMethod: "",
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
    }
  }, [booking]);

  useEffect(() => {
    const dataToSave = {
      passengerDetails,
      formData,
      selectedCountry,
    };
    localStorage.setItem("widgetPaymentData", JSON.stringify(dataToSave));
  }, [passengerDetails, formData, selectedCountry]);

  const pricingInfo = useMemo(() => {
    const pricingDataRaw = localStorage.getItem("widgetPricing");
    const pricingData = pricingDataRaw ? JSON.parse(pricingDataRaw) : {};

    const inventoryDataRaw = localStorage.getItem("widgetInventoryData");
    const inventoryData = inventoryDataRaw ? JSON.parse(inventoryDataRaw) : {};

    const baseFare = Number(pricingData.baseFare || 0);
    const extraHelpUnitPrice = Number(pricingData.extraHelp?.unitPrice || 0);
    const extraTimeCharges = Number(inventoryData.additionalFare || 0);

    const totalMinutes = (inventoryData.estimatedHours || 0) * 60 + (inventoryData.estimatedMinutes || 0);
    const totalTimeUnits = Math.ceil(totalMinutes / 30);
    const workersCharges = totalTimeUnits * extraHelpUnitPrice;

    const floorCharges = Number(inventoryData.floorCharges || 0);
    const accessTypeCharges = Number(inventoryData.accessTypeCharges || 0);

    const childSeatCount = parseIntSafe(formData.childSeat || "0");
    const childSeatTotal = childSeatCount * childSeatUnitPrice;

    const total = baseFare + workersCharges + extraTimeCharges + floorCharges + accessTypeCharges + childSeatTotal;
    const depositAmount = total * 0.35;

    return {
      baseFare,
      workersCharges,
      extraTimeCharges,
      floorCharges,
      accessTypeCharges,
      childSeatTotal,
      total,
      depositAmount,
      currencySymbol: pricingData.currencySymbol || currencySymbol
    };
  }, [formData.childSeat, childSeatUnitPrice, currencySymbol]);

  const finalFare = pricingInfo.total;

  useEffect(() => {
    if (formData.paymentMethod === "Stripe" && !clientSecret) {
      const initStripe = async () => {
        try {
          const res = await createPaymentIntent({
            amount: pricingInfo.depositAmount,
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
      if (bookingSettingData?.setting?.stripeKeys?.enabled) {
        initStripe();
      }
    }
  }, [formData.paymentMethod, finalFare, companyId, currencySetting.value, clientSecret, createPaymentIntent, bookingSettingData?.setting?.stripeKeys?.enabled]);

  useEffect(() => {
    if (bookingSettingData?.setting) {
      const allowedMethods = [];
      if (bookingSettingData.setting.stripeKeys?.publishableKey) allowedMethods.push("Stripe");
      if (bookingSettingData.setting.paypalKeys?.clientId) allowedMethods.push("Paypal");

      // If we're in edit mode, allow a manual/direct update without payment
      if (isEdit) {
        allowedMethods.unshift("Manual Update");
      }

      if (allowedMethods.length > 0 && (!formData.paymentMethod || !allowedMethods.includes(formData.paymentMethod))) {
        // Only auto-select if no valid method is selected
        setFormData(prev => ({ ...prev, paymentMethod: allowedMethods[0] }));
      }
    }
  }, [bookingSettingData, formData.paymentMethod, isEdit]);

  const onBookNowClick = async (paymentData) => {
    if (!paymentData.paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    const bookingData = {
      ...booking,
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
        floorCharges: pricingInfo.floorCharges,
        accessTypeCharges: pricingInfo.accessTypeCharges,
        childSeatCharges: pricingInfo.childSeatTotal,
        total: pricingInfo.total,
        depositPaid: pricingInfo.depositAmount,
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
    <div className="px-4 md:px-8">
      <WidgetStepHeader
        step="4"
        title="Complete Your Booking"
        description="Verify your relocation details and passenger requirements to finalize your professional service estimate."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-(--white) rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-(--dark-black) text-(--white) widget-value-text-sm">
                01
              </div>
              <h2 className="widget-title text-(--dark-black)">Client Profile</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block widget-label-small text-(--dark-grey) mb-2">
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
                <label className="block widget-label-small text-(--dark-grey) mb-2">
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
                <label className="block widget-label-small text-(--dark-grey) mb-2">
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
                  inputClass="custom_input !w-full"
                />
              </div>
            </div>
          </div>
          <div className="bg-(--white) rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-(--dark-black) text-(--white) widget-value-text-sm">
                02
              </div>
              <h2 className="widget-title text-(--dark-black)">Service Requirements</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block widget-label-small text-(--dark-grey) mb-2">
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
                        : "N/A"
                    }
                    readOnly
                    className="custom_input cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <label className="block widget-label-small text-(--dark-grey) mb-2">
                  Moving Time
                </label>
                <div>
                  <input
                    type="text"
                    value={
                      booking?.hour !== undefined && booking?.minute !== undefined && booking?.hour !== "" && booking?.minute !== ""
                        ? `${String(booking.hour).padStart(2, "0")}:${String(booking.minute).padStart(2, "0")}`
                        : "N/A"
                    }
                    readOnly
                    className="custom_input cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="md:col-span-1">
                <label className="block widget-label-small text-(--dark-grey) mb-2">
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
                    <label className="block widget-label-small text-(--dark-grey) mb-2">
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
            <h3 className="widget-title text-(--dark-black) mb-6">Price Estimate</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between widget-description">
                <span className="text-(--dark-grey)">Base Fare</span>
                <span className="widget-value-text-sm text-(--dark-black)">
                  {pricingInfo.currencySymbol}
                  {Math.round(pricingInfo.baseFare)}
                </span>
              </div>
              {pricingInfo.workersCharges > 0 && (
                <div className="flex justify-between widget-description">
                  <span className="text-(--dark-grey)">Extra Men Charges ({Math.ceil(((localStorage.getItem("widgetInventoryData") ? JSON.parse(localStorage.getItem("widgetInventoryData")).estimatedHours : 0) * 60 + (localStorage.getItem("widgetInventoryData") ? JSON.parse(localStorage.getItem("widgetInventoryData")).estimatedMinutes : 0)) / 30)} × {pricingInfo.currencySymbol}{Math.round(pricingInfo.workersCharges / Math.ceil(((localStorage.getItem("widgetInventoryData") ? JSON.parse(localStorage.getItem("widgetInventoryData")).estimatedHours : 0) * 60 + (localStorage.getItem("widgetInventoryData") ? JSON.parse(localStorage.getItem("widgetInventoryData")).estimatedMinutes : 0)) / 30))})</span>
                  <span className="widget-value-text-sm text-(--dark-black)">
                    +{pricingInfo.currencySymbol}
                    {pricingInfo.workersCharges.toFixed(2)}
                  </span>
                </div>
              )}
              {pricingInfo.extraTimeCharges > 0 && (
                <div className="flex justify-between widget-description">
                  <span className="text-(--dark-grey)">Extra Time</span>
                  <span className="widget-value-text-sm text-(--dark-black)">
                    +{pricingInfo.currencySymbol}
                    {pricingInfo.extraTimeCharges.toFixed(2)}
                  </span>
                </div>
              )}
              {pricingInfo.floorCharges > 0 && (
                <div className="flex justify-between widget-description">
                  <span className="text-(--dark-grey)">Floor Level</span>
                  <span className="widget-value-text-sm text-(--dark-black)">
                    +{pricingInfo.currencySymbol}
                    {pricingInfo.floorCharges.toFixed(2)}
                  </span>
                </div>
              )}
              {pricingInfo.accessTypeCharges > 0 && (
                <div className="flex justify-between widget-description">
                  <span className="text-(--dark-grey)">Access (Lift/Stairs)</span>
                  <span className="widget-value-text-sm text-(--dark-black)">
                    +{pricingInfo.currencySymbol}
                    {pricingInfo.accessTypeCharges.toFixed(2)}
                  </span>
                </div>
              )}
              {pricingInfo.childSeatTotal > 0 && (
                <div className="flex justify-between widget-description">
                  <span className="text-(--medium-grey)">Child Seats</span>
                  <span className="widget-value-text text-(--dark-black)">
                    +{pricingInfo.currencySymbol}
                    {pricingInfo.childSeatTotal.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-(--light-gray) pt-4 mb-3">
              <div className="flex justify-between items-center">
                <span className="widget-label-small text-(--dark-grey)">Total Estimated Fare</span>
                <span className="widget-price-sm text-(--dark-black)">
                  {pricingInfo.currencySymbol}
                  {Math.round(pricingInfo.total)}
                </span>
              </div>
            </div>

            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 mb-6 group transition-all duration-300 hover:bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-600">Deposit at booking (35%)</span>
                <span className="widget-value-text-sm text-(--dark-black)">
                  {pricingInfo.currencySymbol}
                  {Math.round(pricingInfo.depositAmount)}
                </span>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-4">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5" />
                  <p className="text-[12px] text-gray-500 leading-tight">
                    Pay <strong>35% deposit</strong> now via card to secure your professional transit
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
                  <p className="text-[12px] text-gray-500 leading-tight">
                    The remaining <strong>65% balance</strong> is settled directly with your driver
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5" />
                  <p className="text-[12px] text-gray-500 leading-tight">
                    Secure, encrypted payments with instant confirmation
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              {(() => {
                const options = [];
                // Check for keys as there is no 'enabled' field in schema
                if (bookingSettingData?.setting?.stripeKeys?.publishableKey) {
                  options.push({ label: "Stripe", value: "Stripe" });
                }
                if (bookingSettingData?.setting?.paypalKeys?.clientId) {
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
                    totalPrice={pricingInfo.depositAmount}
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
                    amount={pricingInfo.depositAmount}
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
                <div className="p-4 bg-(--light-red) border border-(--light-red) widget-error-text rounded-xl animate-in fade-in duration-300">
                  {stripeError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetPaymentInformation;