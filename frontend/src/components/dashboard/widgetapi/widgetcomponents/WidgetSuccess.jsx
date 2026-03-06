import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Icons from "../../../../assets/icons";

const WidgetSuccess = ({ formData, companyId }) => {
  const navigate = useNavigate();

  const paymentMethod = formData?.payment?.paymentMethod || "";
  const isPaymentLink = paymentMethod === "Payment Link";

  return (
    <div className="flex items-center justify-center">
      <div className="bg-(--white) p-10 rounded-2xl shadow-xl text-center max-w-md w-full border border-(--light-green)">
        <h2 className="widget-success-title text-(--success-color)">
          Booking Confirmed!
        </h2>
        <p className="mt-4 text-(--dark-grey) widget-base-text">
          Thank you for choosing us. We've received your booking and will
          contact you shortly.
        </p>

        {/* ── Payment Link notice ── */}
        {isPaymentLink && (
          <div className="mt-4 bg-(--light-yellow) border border-(--medium-yellow) rounded-xl p-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Icons.Mail className="h-5 w-5 text-(--dark-yellow)" />
              <p className="text-(--dark-yellow) widget-value-text-sm">
                Payment Link Sent!
              </p>
            </div>
            <p className="text-(--dark-yellow) widget-text-sm">
              A payment link has been sent to your email. Please check your
              inbox and complete the payment to confirm your booking.
            </p>
          </div>
        )}

        {!isPaymentLink && (
          <p className="mt-2 text-(--dark-grey) widget-base-text">
            You can now view your customer portal below.
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/widget-form">
            <button className="px-6 py-3 text-(--white) bg-(--success-color) hover:bg-(--dark-green) rounded-full widget-button-text transition">
              Return to Home
            </button>
          </Link>
          <button
            onClick={() =>
              navigate("/add-customer", {
                state: {
                  email: formData?.payment?.passengerDetails?.email || "",
                  companyId,
                },
              })
            }
            className="px-6 py-3 text-(--white) bg-(--main-color) hover:bg-(--dark-sky) rounded-full widget-button-text transition"
          >
            View Your Portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default WidgetSuccess;