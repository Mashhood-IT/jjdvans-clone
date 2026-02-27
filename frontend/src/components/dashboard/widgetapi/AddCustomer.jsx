import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Icons from "../../../assets/icons";
import UsePasswordToggle from "../../../hooks/UsePasswordToggle";
import { useCreateCustomerViaWidgetMutation } from "../../../redux/api/adminApi";
import { useLocation, useNavigate } from "react-router-dom";

const AddCustomer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedEmail = location.state?.email || "";
  const passedCompanyId = location.state?.companyId || "";
  const [createCustomer] = useCreateCustomerViaWidgetMutation();

  const {
    type: passwordType,
    visible: passwordVisible,
    toggleVisibility,
  } = UsePasswordToggle();

  const [formData, setFormData] = useState({
    fullName: "",
    email: passedEmail,
    password: "",
  });

  const handleSave = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (!passedCompanyId) {
      toast.error("Company ID is missing. Please contact support.");
      return;
    }

    try {
      const payload = {
        ...formData,
        companyId: passedCompanyId,
      };

      await createCustomer(payload).unwrap();

      toast.success("Customer created successfully!");

      setTimeout(() => {
        window.open(`https://mtldispatch.com/login`, "_blank");
        navigate("/widget-form");
      }, 1000);
    } catch (err) {
      toast.error(err?.data?.message || "Failed to create customer");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-(--light-green)">
      <div className="w-full max-w-lg bg-(--white) rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-(--dark-grey) mb-3">
          Add Customer Account
        </h2>

        <p className="text-center text-[15px] text-(--dark-grey) mb-6 leading-relaxed">
          Create your account to access our&nbsp;
          <span className="font-semibold text-(--dark-green)">
            Customer Portal
          </span>
          ,<br />
          where you can easily view and manage all your bookings. If you would
          like to log in to your dashboard, please&nbsp;
          <span className="font-semibold text-(--dark-green)">
            <a
              href={`${import.meta.env.VITE_BASE_URL_FRONTEND}/login`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-(--dark-sky)"
            >
              click here
            </a>
          </span>
          .
        </p>

        <label className="block text-sm font-medium text-(--dark-grey) mb-1">
          Full Name
        </label>
        <input
          type="text"
          placeholder="Enter your full name"
          className="custom_input mb-4 w-full"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
        />

        <label className="block text-sm font-medium text-(--dark-grey) mb-1">
          Email Address
        </label>
        <input
          type="email"
          placeholder="Enter your email"
          className={`custom_input mb-4 w-full ${
            passedEmail ? "bg-(--lightest-gray) cursor-not-allowed" : ""
          }`}
          disabled={!!passedEmail}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <label className="block text-sm font-medium text-(--dark-grey) mb-1">
          Password
        </label>
        <div className="relative mb-6">
          <input
            type={passwordType}
            placeholder="Create a password"
            className="custom_input w-full"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />
          <span
            className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-(--medium-grey)"
            onClick={toggleVisibility}
          >
            {passwordVisible ? (
              <Icons.EyeOff size={18} />
            ) : (
              <Icons.Eye size={18} />
            )}
          </span>
        </div>

        <div className="flex justify-end">
          <button
            className="btn bg-(--success-color) hover:bg-(--dark-green) text-(--white) w-full sm:w-auto rounded-md transition duration-200"
            onClick={handleSave}
          >
            Create Customer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomer;