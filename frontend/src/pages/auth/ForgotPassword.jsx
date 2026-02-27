import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSendForgotPasswordOtpMutation } from "../../redux/api/userApi";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const [sendOtp, { isLoading: isSending }] =
    useSendForgotPasswordOtpMutation();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Email is required");

    try {
      await sendOtp(email).unwrap();
      toast.success("OTP sent to your email");
      navigate("/new-password", { state: { email } });
    } catch (error) {
      toast.error(error?.data?.message || "Failed to send OTP");
    }
  };

  return (
    <>
      <form onSubmit={handleSendOtp} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="custom_input"
          />
        </div>
        <button
          disabled={isSending}
          type="submit"
          className="btn btn-success w-full"
        >
          {isSending ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </>
  );
};

export default ForgotPassword;