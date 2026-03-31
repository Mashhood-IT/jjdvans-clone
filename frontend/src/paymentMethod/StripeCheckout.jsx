import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";

const StripeCheckout = ({ clientSecret, onPaymentSuccess, onPaymentError, totalPrice, currencySymbol, isProcessing, onBeforePayment, onProcessingChange }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [localProcessing, setLocalProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements || localProcessing) return;

        if (onBeforePayment && !onBeforePayment()) {
            return;
        }

        setLocalProcessing(true);
        onProcessingChange?.(true);
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
                await onPaymentSuccess(paymentIntent);
            } else {
                onPaymentError("Payment was not successful. Please try again.");
            }
        } catch (err) {
            console.error("Stripe Checkout Error:", err);
            onPaymentError("An unexpected error occurred during payment.");
        } finally {
            setLocalProcessing(false);
            onProcessingChange?.(false);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
                <div className="pt-6">
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={localProcessing || !stripe}
                            className={`btn ${localProcessing || !stripe
                                ? "btn-edit"
                                : "btn-success"
                                }`}
                        >
                            {localProcessing ? "Processing Payment..." : "Pay & Book Now"}
                        </button>
                    </div>

                </div>
            </div>
        </form>
    );
};

export default StripeCheckout