import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-phone-input-2/lib/style.css";
import Icons from "../../../assets/icons";

const WidgetPaymentInformation = ({
  fare,
  onBookNow,
  vehicle = {},
  booking = {},
  loading = false,
}) => {
  const [passengerDetails, setPassengerDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });
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

  const bookingSettingData = {
    setting: {
      currency: [{ symbol: "£", value: "GBP" }]
    }
  };

  const paymentOptionsResp = {
    data: {
      paymentOptions: [
        { paymentMethod: "cash", isLive: true, customName: "Cash" },
        { paymentMethod: "stripe", isLive: true, customName: "Stripe, Card" }
      ]
    }
  };

  const enabledPaymentOptions = useMemo(() => {
    return (
      paymentOptionsResp?.data?.paymentOptions?.filter((po) => po.isLive) ?? []
    );
  }, [paymentOptionsResp]);

  const PAYMENT_METHOD_UI_MAP = {
    cash: { label: "Cash", value: "Cash" },
    invoice: { label: "Invoice", value: "Invoice" },
    stripe: { label: "Stripe, Card", value: "Stripe, Card" },
    banktransfer: { label: "Bank Transfer", value: "Bank Transfer" },
    paypal: { label: "Paypal", value: "Paypal" },
    paymentlink: { label: "Payment Link", value: "Payment Link" },
  };

  const enabledOptions = useMemo(() => {
    return enabledPaymentOptions.map((po) => {
      const key = po.paymentMethod.toLowerCase();
      const customName = po.customName;

      return {
        label:
          customName || PAYMENT_METHOD_UI_MAP[key]?.label || po.paymentMethod,
        value: PAYMENT_METHOD_UI_MAP[key]?.value || po.paymentMethod,
      };
    });
  }, [enabledPaymentOptions]);

  const childSeatUnitPrice = useMemo(() => {
    return generalPricing?.childSeatPrice || 10.0;
  }, [generalPricing]);

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

  useEffect(() => {
    if (!enabledOptions || enabledOptions.length === 0) return;

    const currentMethodExists = enabledOptions.some(
      (opt) => opt.value === formData.paymentMethod,
    );

    if (!formData.paymentMethod || !currentMethodExists) {
      const autoSelect = enabledOptions[0]?.value;
      if (autoSelect) {
        setFormData((prev) => ({
          ...prev,
          paymentMethod: autoSelect,
        }));
      }
    }
  }, [enabledOptions, formData.paymentMethod]);


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
      currencySymbol: pricingData.currencySymbol || "£"
    };
  }, [formData.childSeat, childSeatUnitPrice]);

  const finalFare = pricingInfo.total;

  const onBookNowClick = () => {
    if (!formData.paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }


    const bookingData = {
      passengerDetails: passengerDetails,
      passenger: passengerDetails,
      fare: finalFare,
      childSeats: Number(formData.childSeat) || 0,
      paymentMethod: formData.paymentMethod,
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
    };

    onBookNow?.(bookingData);

    localStorage.removeItem("selectedVehicle");
    localStorage.removeItem("widgetPricing");
    localStorage.removeItem("widgetPaymentData");
    localStorage.removeItem("returnBookingForm");
    localStorage.removeItem("isWidgetFormFilled");
  };

  return (
    <div className="bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-semibold">
                  01
                </div>
                <h2 className="text-xl font-bold text-gray-900">Client Profile</h2>
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
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
                    className="w-full px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div className="col-span-6">
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>

                <div className="mt-4 col-span-6">
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
                    className="w-full px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
                <div className="mt-4 col-span-6">
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                    Phone
                  </label>
                  <input
                    type="number"
                    value={passengerDetails.phone}
                    onChange={(e) =>
                      setPassengerDetails({
                        ...passengerDetails,
                        phone: e.target.value,
                      })
                    }
                    placeholder="john.doe@corporate.com"
                    className="w-full px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-semibold">
                  02
                </div>
                <h2 className="text-xl font-bold text-gray-900">Service Requirements</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                    Moving Date
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={
                        booking?.date
                          ? new Date(booking.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                          : ""
                      }
                      readOnly
                      className="w-full pl-10 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                    />
                    <Icons.Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div>
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
                    <div key={idx}>
                      <label className="block text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">
                        {idx === 0 ? "Destination Address" : `Additional Drop-off ${idx}`}
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
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Price Estimate</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Original Fare</span>
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
                  {currencySymbol}
                  {finalFare?.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center justify-center">
                <button
                  onClick={onBookNowClick}
                  disabled={loading}
                  className={`btn btn-back mb-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? "PROCESSING..." : "SECURE BOOKING"}
                  {!loading && <Icons.ArrowRight className="w-5 h-5" />}
                </button>
              </div>


              <div className="mt-6 rounded-lg overflow-hidden">
                <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.1317876843673!2d-0.2659298230151974!3d51.529142609114196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e6ca0a23249c9f9%3A0xff8c140d933157ec!2sRegent%20Business%20Strategies%20Limited!5e0!3m2!1sen!2s!4v1772031383444!5m2!1sen!2s" width="600" height="200" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                <div className="bg-gray-900 text-white px-4 py-2 text-center text-sm font-medium">
                  • LIVE ROUTE PREVIEW
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WidgetPaymentInformation;