import React from "react";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./layout/AuthLayout";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProtectedRoute from "./layout/ProtectedRoute";
import DashboardLayout from "./layout/DashboardLayout";
import Logout from "./components/dashboard/Logout";
import Dashboard from "./components/dashboard/home/Dashboard";
import { LoadingProvider } from "./components/common/LoadingProvider";
import EditProfile from "./components/dashboard/profile/EditProfile";
import BookingsList from "./components/dashboard/bookings/BookingsList";
import NewBooking from "./components/dashboard/bookings/NewBooking";
import WidgetMain from "./components/dashboard/widgetapi/WidgetMain";
import VehiclePricing from "./components/dashboard/pricing/VehiclePricing";
import WidgetAPI from "./components/dashboard/widgetapi/WidgetAPI";
import { ToastContainer } from "react-toastify";
import DistanceSlab from "./components/dashboard/pricing/DistanceSlab";
import ViewCompany from "./components/dashboard/companyaccount/ViewCompany";

const App = () => {
  return (
    <div>
      <LoadingProvider>
        <ToastContainer />
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/new-password" element={<ResetPassword />} />
          </Route>
          <Route path="/widget-form/*" element={<WidgetMain />} />
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route path="my-dashboard" index element={<Dashboard />} />
              <Route path="bookings/list" element={<BookingsList />} />
              <Route path="bookings/new" element={<NewBooking />} />

              {/* <Route path="view-company" element={<ViewCompany />} /> */}

              <Route path="settings/widget-api" element={<WidgetAPI />} />
              <Route path="pricing/vehicle" element={<VehiclePricing />} />
              <Route
                path="pricing/distance-slab"
                element={<DistanceSlab />}
              />

              <Route path="profile" element={<EditProfile />} />
              <Route path="logout" element={<Logout />} />
            </Route>
          </Route>
        </Routes>
      </LoadingProvider>
    </div>
  );
};

export default App;
