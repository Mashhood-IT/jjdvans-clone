import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
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
import CompletedBookings from "./components/dashboard/bookings/CompletedBookings";
import NewBooking from "./components/dashboard/bookings/NewBooking";
import WidgetMain from "./components/dashboard/widgetapi/WidgetMain";
import VehiclePricing from "./components/dashboard/pricing/VehiclePricing";
import WidgetAPI from "./components/dashboard/widgetapi/WidgetAPI";
import DistanceSlab from "./components/dashboard/pricing/DistanceSlab";
import ViewCompany from "./components/dashboard/companyaccount/ViewCompany";
import CustomersList from "./components/dashboard/customers/CustomersList";
import BookingCalendar from "./components/dashboard/bookings/BookingCalendar";
import BookingSettings from "./components/dashboard/settings/BookingSettings";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const App = () => {
  return (
    <div>
      <LoadingProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
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
              <Route path="bookings/completed" element={<CompletedBookings />} />
              <Route path="new-booking" element={<NewBooking />} />
              <Route path="bookings/calendar" element={<BookingCalendar />} />

              <Route
                path="user-profiles/customers/list"
                element={<CustomersList />}
              />
              <Route path="view-company" element={<ViewCompany />} />

              <Route path="settings/widget-api" element={<WidgetAPI />} />
              <Route path="pricing/vehicle" element={<VehiclePricing />} />
              <Route path="pricing/distance-slab" element={<DistanceSlab />} />

              <Route path="settings/booking" element={<BookingSettings />} />

              <Route path="profile" element={<EditProfile />} />
              <Route path="logout" element={<Logout />} />
            </Route>
          </Route>
        </Routes>
        <ToastContainer position="top-center" autoClose={2000} />
      </LoadingProvider>
    </div>
  );
};

export default App;
