import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";

const StripeCheckout = ({ clientSecret, onPaymentSuccess, onPaymentError, totalPrice, currencySymbol, isProcessing }) => {
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
                <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
                <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-500 text-sm">Amount to Pay</span>
                        <span className="text-xl font-bold text-gray-900">{currencySymbol}{Math.round(Number(totalPrice)).toFixed(2)}</span>
                    </div>
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