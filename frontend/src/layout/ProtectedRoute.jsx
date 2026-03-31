import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useGetCurrentUserQuery } from "../redux/api/userApi";
import { setUser } from "../redux/slice/authSlice";
import sidebarItems from "../components/constants/constantcomponents/sidebarItems";

const ProtectedRoute = () => {
  const dispatch = useDispatch();

  const location = useLocation();
  const currentPath = location.pathname;

  const { data: currentUser, isLoading, isError } = useGetCurrentUserQuery();

  useEffect(() => {
    if (currentUser) {
      dispatch(setUser(currentUser));
    }
  }, [currentUser, dispatch]);
  if (isLoading) return null;

  if (!currentUser) return <Navigate to="/login" replace />;

  const userRole = currentUser.role;

  const isAuthorized = (path) => {
    if (path === "/dashboard/my-dashboard" || path === "/dashboard/profile") return true;

    return sidebarItems.some((item) => {
      const hasRole = !item.roles || item.roles.length === 0 || item.roles.includes(userRole);
      const isMatch = path === item.route || path.startsWith(item.route + "/");
      if (hasRole && isMatch) return true;

      if (item.subTabs) {
        return item.subTabs.some((sub) => {
          const subHasRole = !sub.roles || sub.roles.length === 0 || sub.roles.includes(userRole);
          const subMatch = path === sub.route || path.startsWith(sub.route + "/");
          return subHasRole && subMatch;
        });
      }
      return false;
    });
  };

  if (!isAuthorized(currentPath) && currentPath !== "/dashboard/my-dashboard") {
    return <Navigate to="/dashboard/my-dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;