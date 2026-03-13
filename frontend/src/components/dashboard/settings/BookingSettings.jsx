import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setCurrency } from "../../../redux/slice/currencySlice";

import {
  useGetBookingSettingQuery,
  useUpdateBookingSettingMutation,
} from "../../../redux/api/bookingSettingsApi";
import { useLoading } from "../../common/LoadingProvider";
import OutletHeading from "../../constants/constantcomponents/OutletHeading";
import SelectOption from "../../constants/constantcomponents/SelectOption";
import currencyOptions from "../../constants/constantcomponents/currencyOptions";

const CURRENCY_APPLICATION = ["All Bookings", "New Bookings Only"];

const TIME_UNITS_MIN = ["Hours", "Days"];

const BookingSettings = () => {
  const dispatch = useDispatch();
  const { showLoading, hideLoading } = useLoading();

  const [currency, setCurrencyState] = useState("GBP");
  const [currencyApplication, setCurrencyApplication] =
    useState("New Bookings Only");
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [stripeKeys, setStripeKeys] = useState({
    publishableKey: "",
    secretKey: "",
  });
  const [paypalKeys, setPaypalKeys] = useState({
    clientId: "",
    clientSecret: "",
  });
  const [advanceBookingMin, setAdvanceBookingMin] = useState({
    value: 12,
    unit: "Hours",
  });

  const { data, isLoading } = useGetBookingSettingQuery();
  const [updateBookingSetting] = useUpdateBookingSettingMutation();

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading]);

  useEffect(() => {
    const setting = data?.setting;
    if (!setting) return;


    if (Array.isArray(setting.currency) && setting.currency[0]?.value) {
      setCurrencyState(setting.currency[0].value);
      dispatch(setCurrency(setting.currency[0].value));
    }

    if (setting.currencyApplication) {
      setCurrencyApplication(setting.currencyApplication);
    }

    setGoogleApiKey(setting.googleApiKey || "");

    setStripeKeys({
      publishableKey: setting.stripeKeys?.publishableKey || "",
      secretKey: setting.stripeKeys?.secretKey || "",
    });
    setPaypalKeys({
      clientId: setting.paypalKeys?.clientId || "",
      clientSecret: setting.paypalKeys?.clientSecret || "",
    });

    if (setting.advanceBookingMin)
      setAdvanceBookingMin(setting.advanceBookingMin);

  }, [data, dispatch]);

  const handleUpdate = async () => {
    try {
      const selectedCurrency = currencyOptions.find(
        (opt) => opt.value === currency,
      ) || {
        label: "British Pound",
        value: "GBP",
        symbol: "£",
      };

      const payload = {
        currency: [
          {
            label: selectedCurrency.label,
            value: selectedCurrency.value,
            symbol: selectedCurrency.symbol,
          },
        ],
        currencyApplication: currencyApplication || "New Bookings Only",

        googleApiKey,
        stripeKeys,
        paypalKeys,

        advanceBookingMin: {
          value: Number(advanceBookingMin.value ?? 12),
          unit: TIME_UNITS_MIN.includes(advanceBookingMin.unit)
            ? advanceBookingMin.unit
            : "Hours",
        },
      };

      await updateBookingSetting(payload).unwrap();
      dispatch(setCurrency(currency));
      toast.success("Settings updated successfully!");
    } catch (err) {
      console.log(err)
      toast.error("Failed to update settings", err);
    }
  };

  const handleCurrencyChange = (e) => setCurrencyState(e.target.value);

  return (
    <>
      <div>
        <OutletHeading name="Booking Settings" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <SelectOption
            label="Currency"
            options={currencyOptions}
            value={currency}
            onChange={handleCurrencyChange}
          />
          <SelectOption
            label="Apply Currency To"
            options={CURRENCY_APPLICATION}
            value={currencyApplication}
            onChange={(e) => setCurrencyApplication(e.target.value)}
          />
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">
              Google Maps API key
            </label>
            <input
              type="text"
              className="w-full border border-(--light-gray) rounded px-2 sm:px-3 py-1 text-xs sm:text-sm"
              value={googleApiKey}
              onChange={(e) => setGoogleApiKey(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">
              Stripe Publishable Key
            </label>
            <input
              type="text"
              className="w-full border border-(--light-gray) rounded px-2 sm:px-3 py-1 text-xs sm:text-sm"
              value={stripeKeys.publishableKey}
              onChange={(e) =>
                setStripeKeys((p) => ({ ...p, publishableKey: e.target.value }))
              }
              placeholder="pk_test_..."
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">
              Stripe Secret Key
            </label>
            <input
              type="password"
              className="w-full border border-(--light-gray) rounded px-2 sm:px-3 py-1 text-xs sm:text-sm"
              value={stripeKeys.secretKey}
              onChange={(e) =>
                setStripeKeys((p) => ({ ...p, secretKey: e.target.value }))
              }
              placeholder="sk_test_..."
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">
              PayPal Client ID
            </label>
            <input
              type="text"
              className="w-full border border-(--light-gray) rounded px-2 sm:px-3 py-1 text-xs sm:text-sm"
              value={paypalKeys.clientId}
              onChange={(e) =>
                setPaypalKeys((p) => ({ ...p, clientId: e.target.value }))
              }
              placeholder="PayPal Client ID"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">
              PayPal Client Secret
            </label>
            <input
              type="password"
              className="w-full border border-(--light-gray) rounded px-2 sm:px-3 py-1 text-xs sm:text-sm"
              value={paypalKeys.clientSecret}
              onChange={(e) =>
                setPaypalKeys((p) => ({ ...p, clientSecret: e.target.value }))
              }
              placeholder="PayPal Client Secret"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium mb-1">
              Advance booking minimum
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                className="custom_input"
                value={advanceBookingMin.value}
                onChange={(e) =>
                  setAdvanceBookingMin((p) => ({ ...p, value: e.target.value }))
                }
              />
              <SelectOption
                options={TIME_UNITS_MIN}
                value={advanceBookingMin.unit}
                onChange={(e) =>
                  setAdvanceBookingMin((p) => ({ ...p, unit: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="md:col-span-3">
            <button
              className="btn btn-edit mt-3 sm:mt-4 px-6 sm:px-8 py-1.5 sm:py-2 text-xs sm:text-sm bg-(--indigo-color) text-(--white) rounded-lg hover:bg-(--dark-blue) transition-colors"
              onClick={handleUpdate}
            >
              Update Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingSettings;