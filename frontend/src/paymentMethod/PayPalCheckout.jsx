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
    const [captureOrder, { isLoading: capturing }] = useCapturePayPalOrderMutation();

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

    if (cfgLoading) {
        return (
            <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
                Loading PayPal configuration...
            </div>
        );
    }

    if (cfgError) {
        const errMsg = cfgError?.data?.message || (typeof cfgError === "string" ? cfgError : JSON.stringify(cfgError));
        const isMissingCreds = errMsg.toLowerCase().includes("missing") || errMsg.toLowerCase().includes("not found");

        return (
            <div
                style={{
                    padding: 16,
                    border: "1px solid #e11",
                    color: "#a00",
                    borderRadius: 8,
                    backgroundColor: "#fff5f5",
                }}
            >
                <p style={{ fontWeight: "bold", margin: "0 0 8px 0" }}>
                    PayPal Configuration Error
                </p>
                <p style={{ fontSize: 13, margin: 0 }}>
                    {errMsg}
                </p>
                {isMissingCreds && (
                    <p style={{ fontSize: 12, marginTop: 8, color: "#666" }}>
                        Tip: Go to Dashboard &gt; Settings &gt; Payment Options to provide your PayPal Client ID and Secret.
                    </p>
                )}
            </div>
        );
    }

    if (!cfg?.clientId || !options) {
        return (
            <div
                style={{
                    padding: 16,
                    border: "1px solid #f90",
                    color: "#a60",
                    borderRadius: 8,
                    backgroundColor: "#fffbeb",
                }}
            >
                <p style={{ fontWeight: "bold", margin: "0 0 8px 0" }}>
                    PayPal Caution
                </p>
                <p style={{ fontSize: 13, margin: 0 }}>
                    PayPal client configuration is incomplete. Please ensure Client ID and Secret are set in the dashboard.
                </p>
            </div>
        );
    }

    const ccy = options.currency;
    const display = formatDisplay(ccy, amountNum);

    return (
        <PayPalScriptProvider options={options} key={options.currency}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ width: "100%", maxWidth: 300 }}>
                    <PayPalButtons
                        style={{
                            layout: "horizontal",
                            height: 40,
                            color: "gold",
                            shape: "rect",
                            label: "pay"
                        }}
                        disabled={disabled || creating || capturing || !isAmountValid}
                        forceReRender={[bookingId, ccy, display]}
                        createOrder={async () => {
                            if (!isAmountValid) {
                                onError(new Error("Amount must be greater than 0"));
                                throw new Error("Invalid amount");
                            }
                            try {
                                const res = await createOrder({
                                    companyId,
                                    bookingId,
                                    amount: amountNum,
                                    currency: cfg.currency || "GBP",
                                }).unwrap();

                                const orderId = res?.id;
                                if (!orderId) {
                                    throw new Error("Server did not return a valid PayPal order ID");
                                }
                                return orderId;
                            } catch (error) {
                                console.error("createOrder error:", error);
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
                                
                                if (res?.status === "COMPLETED") {
                                    onSuccess(res);
                                } else {
                                    throw new Error("Payment capture failed or was not completed");
                                }
                            } catch (error) {
                                console.error("captureOrder error:", error);
                                onError(error);
                            }
                        }}
                        onError={(err) => {
                            console.error("PayPalButtons error:", err);
                            onError(err);
                        }}
                        onCancel={() => onCancel()}
                    />
                </div>
                {!isAmountValid && (
                    <div style={{ fontSize: 12, color: "#b45309" }}>
                        Amount required: positive number &gt; 0
                    </div>
                )}
            </div>
        </PayPalScriptProvider>
    );
};

export default PayPalCheckout;