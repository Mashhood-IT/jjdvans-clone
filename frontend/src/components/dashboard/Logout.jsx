import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { useLogoutUserMutation } from "../../redux/api/userApi";
import { clearUser } from "../../redux/slice/authSlice";

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [logoutUser, { isLoading }] = useLogoutUserMutation();

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
      dispatch(clearUser());
      toast.success("Successfully logged out.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error("Logout failed. Try again.");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="flex justify-center sm:py-55 py-35 px-4">
      <div className="bg-(--white) shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-center text-xl font-semibold text-(--dark-gray) mb-6">
          Are you sure you want to logout?
        </h2>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full bg-(--primary-dark-red) hover:bg-(--deep-red) text-(--white) font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? "Logging out..." : "Yes, Logout"}
          </button>

          <button
            onClick={handleCancel}
            className="w-full bg-(--light-gray) hover:bg-(--light-gray) text-(--dark-black) font-medium py-2 px-4 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
