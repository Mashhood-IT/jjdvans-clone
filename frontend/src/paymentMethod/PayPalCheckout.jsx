import React, { useMemo } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import {
  useGetPayPalConfigQuery,
  useCreatePayPalOrderMutation,
  useCapturePayPalOrderMutation,
} from "../redux/api/paymentApi";
import currencyOptions from "../components/constants/constantcomponents/currencyOptions";

const SYMBOL_MAP = Object.freeze(
  currencyOptions.reduce(
    (acc, c) => {
      acc[(c.value || "").toUpperCase()] = c.symbol || "";
      return acc;
    },
    { MYR: "RM", PLN: "zł", HUF: "Ft", CZK: "Kč", ILS: "₪", MXN: "MX$" }
  )
);
const symbolFor = (ccy) => SYMBOL_MAP[(ccy || "").toUpperCase()] ?? "";
const ZERO_DEC = new Set(["JPY", "TWD", "HUF"]);
const formatDisplay = (ccy, val) =>
  ZERO_DEC.has(String(ccy).toUpperCase())
    ? String(Math.max(Number(val) || 0, 0) | 0)
    : Math.max(Number(val) || 0, 0).toFixed(2);

const PayPalCheckout = ({
  bookingId,
  amount,
  onSuccess = () => { },
  onError = () => { },
  onCancel = () => { },
  disabled = false,
  companyId,
}) => {
  const {
    data: cfg,
    isLoading: cfgLoading,
    error: cfgError,
  } = useGetPayPalConfigQuery(companyId, { skip: !companyId });
  const [createOrder, { isLoading: creating }] = useCreatePayPalOrderMutation();
  const [captureOrder, { isLoading: capturing }] =
    useCapturePayPalOrderMutation();
  const amountNum = Number(amount);
  const isAmountValid = Number.isFinite(amountNum) && amountNum > 0;
  const options = useMemo(() => {
    if (!cfg?.clientId) return null;
    return {
      "client-id": cfg.clientId,
      currency: (cfg.currency || "GBP").toUpperCase(),
      intent: "capture",
      components: "buttons",
    };
  }, [cfg]);

  if (cfgLoading)
    return (
      <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
        Loading PayPal configuration...
      </div>
    );
  if (cfgError)
    return (
      <div
        style={{
          padding: 16,
          border: "1px solid #e11",
          color: "#a00",
          borderRadius: 8,
        }}
      >
        PayPal configuration error: &nbsp;
        {typeof cfgError === "string" ? cfgError : JSON.stringify(cfgError)}
      </div>
    );
  if (!cfg?.clientId || !options)
    return (
      <div
        style={{
          padding: 16,
          border: "1px solid #f90",
          color: "#a60",
          borderRadius: 8,
        }}
      >
        PayPal client configuration missing.
      </div>
    );

  const ccy = options.currency;
  const display = formatDisplay(ccy, amountNum);
  const ccySymbol = symbolFor(ccy);

  return (
    <PayPalScriptProvider options={options} key={options.currency}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h4 style={{ margin: 0 }}>
          Pay {ccySymbol}
          {display} {ccySymbol ? "" : ccy}
        </h4>

        <div style={{ width: 260, minWidth: 220 }}>
          <PayPalButtons
            style={{
              layout: "horizontal",
              height: 40,
              color: "gold",
              shape: "rect",
            }}
            disabled={disabled || creating || capturing || !isAmountValid}
            forceReRender={[bookingId, ccy, display]}
            createOrder={async () => {
              try {
                const res = await createOrder({
                  companyId,
                  amount: amountNum,
                  currency: cfg.currency || "GBP",
                }).unwrap();
                if (!res?.orderId)
                  throw new Error("Server did not return orderId");
                return res.orderId;
              } catch (error) {
                onError(error);
                throw error;
              }
            }}
            onApprove={async (data) => {
              try {
                const res = await captureOrder({
                  orderID: data.orderID,
                  companyId,
                }).unwrap();
                res?.status === "COMPLETED"
                  ? onSuccess(res)
                  : onError(new Error("Payment capture failed"));
              } catch (error) {
                onError(error);
              }
            }}
            onError={(err) => onError(err)}
            onCancel={() => onCancel()}
          />
        </div>
      </div>
      {!isAmountValid && (
        <div style={{ marginTop: 8, fontSize: 12, color: "#b45309" }}>
          Amount required: positive number &gt; 0
        </div>
      )}
    </PayPalScriptProvider>
  );
};
export default PayPalCheckout;
