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
  const [stripeKeys, setStripeKeys] = useState({
    publishableKey: "",
    secretKey: "",
    webhookUrl: "",
    webhookEvents: "",
    webhookSigningSecret: "",
  });
  const [paypalKeys, setPaypalKeys] = useState({
    clientId: "",
    clientSecret: "",
    mode: "sandbox",
    currency: "GBP",
  });

  const [focusedField, setFocusedField] = useState(null);

  const maskKey = (key) => {
    if (!key) return "";
    if (key.length <= 15) return ".......";
    return key.slice(0, 10) + "......." + key.slice(-4);
  };

  const [editStates, setEditStates] = useState({
    stripePublishable: false,
    stripeSecret: false,
    stripeWebhookSigningSecret: false,
    paypalClientId: false,
    paypalSecret: false,
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

    setStripeKeys({
      publishableKey: setting.stripeKeys?.publishableKey || "",
      secretKey: setting.stripeKeys?.secretKey || "",
      webhookUrl: setting.stripeKeys?.webhookUrl || "",
      webhookEvents: setting.stripeKeys?.webhookEvents || "",
      webhookSigningSecret: setting.stripeKeys?.webhookSigningSecret || "",
    });
    setPaypalKeys({
      clientId: setting.paypalKeys?.clientId || "",
      clientSecret: setting.paypalKeys?.clientSecret || "",
      mode: setting.paypalKeys?.mode || "sandbox",
      currency: setting.paypalKeys?.currency || "GBP",
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

      const filterMaskedKeys = (keys, originalKeys) => {
        return Object.keys(keys).reduce((acc, k) => {
          if (typeof keys[k] === "string" && keys[k].includes(".......")) {
            acc[k] = originalKeys?.[k] || "";
          } else {
            acc[k] = keys[k];
          }
          return acc;
        }, {});
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

        stripeKeys: filterMaskedKeys(stripeKeys, data?.setting?.stripeKeys),
        paypalKeys: filterMaskedKeys(paypalKeys, data?.setting?.paypalKeys),

        advanceBookingMin: {
          value: Number(advanceBookingMin.value ?? 12),
          unit: TIME_UNITS_MIN.includes(advanceBookingMin.unit)
            ? advanceBookingMin.unit
            : "Hours",
        },
      };

      await updateBookingSetting(payload).unwrap();

      setEditStates({
        stripePublishable: false,
        stripeSecret: false,
        stripeWebhookSigningSecret: false,
        paypalClientId: false,
        paypalSecret: false,
      });

      dispatch(setCurrency(currency));
      toast.success("Settings updated successfully!");
    } catch (err) {
      console.log(err)
      toast.error("Failed to update settings");
    }
  };

  const handleCurrencyChange = (e) => setCurrencyState(e.target.value);

  return (
    <>
      <div className="booking-settings-container">
        <OutletHeading name="Booking Settings" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-(--white) p-4 rounded-lg border border-(--light-gray) shadow-sm">
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-(--white) p-5 rounded-lg border border-(--light-gray) shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-(--dark-gray) border-b border-(--light-gray) pb-2 mb-4">Stripe Configuration</h3>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 flex justify-between">
                  Stripe Publishable Key <span className="text-red-500 text-[10px] font-bold"> </span>
                </label>
                <input
                  type="text"
                  className="w-full border border-(--light-gray) rounded px-3 py-1.5 text-xs sm:text-sm"
                  value={editStates.stripePublishable ? stripeKeys.publishableKey : maskKey(stripeKeys.publishableKey)}
                  onFocus={() => {
                    setFocusedField("stripePublishable");
                  }}
                  onBlur={() => {
                    setFocusedField(null);
                    setEditStates(p => ({ ...p, stripePublishable: false }));
                  }}
                  onKeyDown={(e) => {
                    if (!editStates.stripePublishable && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                      setStripeKeys(p => ({ ...p, publishableKey: "" }));
                      setEditStates(p => ({ ...p, stripePublishable: true }));
                    }
                  }}
                  onPaste={(e) => {
                    if (!editStates.stripePublishable) {
                      setStripeKeys(p => ({ ...p, publishableKey: "" }));
                      setEditStates(p => ({ ...p, stripePublishable: true }));
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!editStates.stripePublishable && val.includes(".......")) return;
                    setStripeKeys((p) => ({ ...p, publishableKey: val }));
                    if (!editStates.stripePublishable) setEditStates(p => ({ ...p, stripePublishable: true }));
                  }}
                  placeholder="pk_test_..."
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 flex justify-between">
                  Stripe Secret Key <span className="text-red-500 text-[10px] font-bold"> </span>
                </label>
                <input
                  type="text"
                  className="w-full border border-(--light-gray) rounded px-3 py-1.5 text-xs sm:text-sm"
                  value={editStates.stripeSecret ? stripeKeys.secretKey : maskKey(stripeKeys.secretKey)}
                  onFocus={() => setFocusedField("stripeSecret")}
                  onBlur={() => {
                    setFocusedField(null);
                    setEditStates(p => ({ ...p, stripeSecret: false }));
                  }}
                  onKeyDown={(e) => {
                    if (!editStates.stripeSecret && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                      setStripeKeys(p => ({ ...p, secretKey: "" }));
                      setEditStates(p => ({ ...p, stripeSecret: true }));
                    }
                  }}
                  onPaste={(e) => {
                    if (!editStates.stripeSecret) {
                      setStripeKeys(p => ({ ...p, secretKey: "" }));
                      setEditStates(p => ({ ...p, stripeSecret: true }));
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!editStates.stripeSecret && val.includes(".......")) return;
                    setStripeKeys((p) => ({ ...p, secretKey: val }));
                    if (!editStates.stripeSecret) setEditStates(p => ({ ...p, stripeSecret: true }));
                  }}
                  placeholder="sk_test_..."
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Webhook Endpoint URL
                </label>
                <input
                  type="text"
                  className="w-full border border-(--light-gray) rounded px-3 py-1.5 text-xs sm:text-sm"
                  value={stripeKeys.webhookUrl}
                  onChange={(e) => setStripeKeys(p => ({ ...p, webhookUrl: e.target.value }))}
                  placeholder="https://your-site.com/webhook"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Webhook Events
                </label>
                <input
                  type="text"
                  className="w-full border border-(--light-gray) rounded px-3 py-1.5 text-xs sm:text-sm"
                  value={stripeKeys.webhookEvents}
                  onChange={(e) => setStripeKeys(p => ({ ...p, webhookEvents: e.target.value }))}
                  placeholder="checkout.session.completed, ..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Webhook Signing Secret
                </label>
                <input
                  type="text"
                  className="w-full border border-(--light-gray) rounded px-3 py-1.5 text-xs sm:text-sm"
                  value={editStates.stripeWebhookSigningSecret ? stripeKeys.webhookSigningSecret : maskKey(stripeKeys.webhookSigningSecret)}
                  onFocus={() => setFocusedField("stripeWebhookSigningSecret")}
                  onBlur={() => {
                    setFocusedField(null);
                    setEditStates(p => ({ ...p, stripeWebhookSigningSecret: false }));
                  }}
                  onKeyDown={(e) => {
                    if (!editStates.stripeWebhookSigningSecret && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                      setStripeKeys(p => ({ ...p, webhookSigningSecret: "" }));
                      setEditStates(p => ({ ...p, stripeWebhookSigningSecret: true }));
                    }
                  }}
                  onPaste={() => {
                    if (!editStates.stripeWebhookSigningSecret) {
                      setStripeKeys(p => ({ ...p, webhookSigningSecret: "" }));
                      setEditStates(p => ({ ...p, stripeWebhookSigningSecret: true }));
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!editStates.stripeWebhookSigningSecret && val.includes(".......")) return;
                    setStripeKeys((p) => ({ ...p, webhookSigningSecret: val }));
                    if (!editStates.stripeWebhookSigningSecret) setEditStates(p => ({ ...p, stripeWebhookSigningSecret: true }));
                  }}
                  placeholder="whsec_..."
                />
              </div>
            </div>
          </div>

          <div className="bg-(--white) p-5 rounded-lg border border-(--light-gray) shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-(--dark-gray) border-b border-(--light-gray) pb-2 mb-4">PayPal Configuration</h3>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 flex justify-between">
                  PayPal Client ID {!paypalKeys.clientId && <span className="text-red-500 text-[10px] font-bold">Required</span>}
                </label>
                <input
                  type="text"
                  className={`w-full border rounded px-3 py-1.5 text-xs sm:text-sm ${!paypalKeys.clientId ? "border-red-300" : "border-(--light-gray)"}`}
                  value={editStates.paypalClientId ? paypalKeys.clientId : maskKey(paypalKeys.clientId)}
                  onFocus={() => setFocusedField("paypalClientId")}
                  onBlur={() => {
                    setFocusedField(null);
                    setEditStates(p => ({ ...p, paypalClientId: false }));
                  }}
                  onKeyDown={(e) => {
                    if (!editStates.paypalClientId && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                      setPaypalKeys(p => ({ ...p, clientId: "" }));
                      setEditStates(p => ({ ...p, paypalClientId: true }));
                    }
                  }}
                  onPaste={() => {
                    if (!editStates.paypalClientId) {
                      setPaypalKeys(p => ({ ...p, clientId: "" }));
                      setEditStates(p => ({ ...p, paypalClientId: true }));
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!editStates.paypalClientId && val.includes(".......")) return;
                    setPaypalKeys((p) => ({ ...p, clientId: val }));
                    if (!editStates.paypalClientId) setEditStates(p => ({ ...p, paypalClientId: true }));
                  }}
                  placeholder="Enter PayPal Client ID"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1 flex justify-between">
                  PayPal Client Secret {!paypalKeys.clientSecret && <span className="text-red-500 text-[10px] font-bold">Required</span>}
                </label>
                <input
                  type="text"
                  className={`w-full border rounded px-3 py-1.5 text-xs sm:text-sm ${!paypalKeys.clientSecret ? "border-red-300" : "border-(--light-gray)"}`}
                  value={editStates.paypalSecret ? paypalKeys.clientSecret : maskKey(paypalKeys.clientSecret)}
                  onFocus={() => setFocusedField("paypalSecret")}
                  onBlur={() => {
                    setFocusedField(null);
                    setEditStates(p => ({ ...p, paypalSecret: false }));
                  }}
                  onKeyDown={(e) => {
                    if (!editStates.paypalSecret && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
                      setPaypalKeys(p => ({ ...p, clientSecret: "" }));
                      setEditStates(p => ({ ...p, paypalSecret: true }));
                    }
                  }}
                  onPaste={() => {
                    if (!editStates.paypalSecret) {
                      setPaypalKeys(p => ({ ...p, clientSecret: "" }));
                      setEditStates(p => ({ ...p, paypalSecret: true }));
                    }
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!editStates.paypalSecret && val.includes(".......")) return;
                    setPaypalKeys((p) => ({ ...p, clientSecret: val }));
                    if (!editStates.paypalSecret) setEditStates(p => ({ ...p, paypalSecret: true }));
                  }}
                  placeholder="Enter PayPal Client Secret"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Mode</label>
                <input
                  type="text"
                  className="w-full border border-(--light-gray) rounded px-3 py-1.5 text-xs sm:text-sm"
                  value={paypalKeys.mode}
                  onChange={(e) => setPaypalKeys(p => ({ ...p, mode: e.target.value }))}
                  placeholder="sandbox or live"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">Currency</label>
                <input
                  type="text"
                  className="w-full border border-(--light-gray) rounded px-3 py-1.5 text-xs sm:text-sm"
                  value={paypalKeys.currency}
                  onChange={(e) => setPaypalKeys(p => ({ ...p, currency: e.target.value }))}
                  placeholder="GBP"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            className="btn btn-edit min-w-[150px]"
            onClick={handleUpdate}
          >
            Update Settings
          </button>
        </div>
      </div>
    </>
  );
};

export default BookingSettings;