import React from "react";
import Icons from "../assets/icons";
import { useSelector } from "react-redux";
import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useGetSuperadminInfoQuery } from "../redux/api/userApi";

const AuthLayout = () => {
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const currentPath = location.pathname;

  const { data: superadminInfo, isLoading } = useGetSuperadminInfoQuery();

  if (user && currentPath === "/login") {
    return <Navigate to="/dashboard/my-dashboard" replace />;
  }

  let title = "Welcome";
  if (location.pathname === "/login") title = "Dashboard Login";
  if (location.pathname === "/verify-otp") title = "Verify OTP";
  else if (location.pathname === "/forgot-password") title = "Forgot Password";
  else if (location.pathname === "/new-password") title = "Reset Password";

  return (
    <>
      <div className="min-h-screen bg-(--lightest-gray) flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-(--white) p-8 rounded-xl shadow-lg">
          <h2 className="text-center text-2xl font-bold mb-6 text-(--dark-gray)">
            {title}
          </h2>
          <Outlet />
          <div className="text-center mt-6">
            <div className="flex items-center justify-center gap-2 text-(--dark-gray)">
              <Icons.CarFront className="w-5 h-5" />
              <span className="text-xl font-semibold uppercase">
                {isLoading
                  ? "Loading..."
                  : "Flexible Budget Removals Limited"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;