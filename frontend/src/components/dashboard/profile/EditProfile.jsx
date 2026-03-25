import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";

import Icons from "../../../assets/icons";
import IMAGES from "../../../assets/images";

import { useUpdateUserProfileMutation } from "../../../redux/api/userApi";

import UsePasswordToggle from "../../../hooks/UsePasswordToggle";
import { setUser } from "../../../redux/slice/authSlice";
import OutletHeading from "../../constants/constantcomponents/OutletHeading";

const EditProfile = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [companyLogoPreview, setCompanyLogoPreview] = useState(null);
  const [form, setForm] = useState({
    email: "",
    name: "",
    newPassword: "",
    currentPassword: "",
    superadminCompanyLogo: "",
    superadminCompanyName: "",
    superadminCompanyAddress: "",
    superadminCompanyPhoneNumber: "",
    superadminCompanyEmail: "",
  });
  const [profileImg, setProfileImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const [superadminLogoFile, setSuperadminLogoFile] = useState(null);

  const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();
  const {
    type: newPasswordType,
    visible: newPasswordVisible,
    toggleVisibility: toggleNewPassword,
  } = UsePasswordToggle();

  const {
    type: currentPasswordType,
    visible: currentPasswordVisible,
    toggleVisibility: toggleCurrentPassword,
  } = UsePasswordToggle();

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || "",
        name: user.fullName || "",
        newPassword: "",
        currentPassword: "",
        superadminCompanyName: user.superadminCompanyName || "",
        superadminCompanyLogo: user.superadminCompanyLogo || "",
        superadminCompanyAddress: user.superadminCompanyAddress || "",
        superadminCompanyPhoneNumber: user.superadminCompanyPhoneNumber || "",
        superadminCompanyEmail: user.superadminCompanyEmail || "",
      });
      if (user.profileImage) {
        setPreview(user.profileImage);
      }
      if (user.superadminCompanyLogo) {
        setCompanyLogoPreview(user.superadminCompanyLogo);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImg(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("fullName", form.name);
      formData.append("newPassword", form.newPassword);
      formData.append("currentPassword", form.currentPassword);
      if (profileImg) formData.append("profileImage", profileImg);
      if (user?.role === "superadmin") {
        formData.append("superadminCompanyName", form.superadminCompanyName);
        if (superadminLogoFile) {
          formData.append("superadminCompanyLogo", superadminLogoFile);
        }
        formData.append(
          "superadminCompanyAddress",
          form.superadminCompanyAddress,
        );
        formData.append(
          "superadminCompanyPhoneNumber",
          form.superadminCompanyPhoneNumber,
        );
        formData.append("superadminCompanyEmail", form.superadminCompanyEmail);
      }
      const updatedUser = await updateProfile(formData).unwrap();
      dispatch(setUser({ ...user, ...updatedUser }));
      setPreview(updatedUser.profileImage);

      if (updatedUser.superadminCompanyLogo) {
        setCompanyLogoPreview(updatedUser.superadminCompanyLogo);
      }
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error?.data?.message || "Something went wrong.");
    }
  };

  const handleSuperadminLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSuperadminLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanyLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    if (user) {
      setForm({
        email: user.email || "",
        name: user.fullName || "",
        newPassword: "",
        currentPassword: "",
        superadminCompanyName: user.superadminCompanyName || "",
        superadminCompanyLogo: user.superadminCompanyLogo || "",
        superadminCompanyAddress: user.superadminCompanyAddress || "",
        superadminCompanyPhoneNumber: user.superadminCompanyPhoneNumber || "",
        superadminCompanyEmail: user.superadminCompanyEmail || "",
      });
      setProfileImg(null);
      setSuperadminLogoFile(null);
      setPreview(user.profileImage || null);
      setCompanyLogoPreview(user.superadminCompanyLogo || null);
    }
  };

  return (
    <>
      <OutletHeading name="Profile Update" />
      <div className="flex flex-wrap justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
        <div className="inline-flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-(--sky-color) border-2 border-dashed border-(--dark-sky) rounded-xl shadow-sm">
          <div className="flex flex-col items-center">
            <img
              src={preview || IMAGES.dummyImg}
              alt="Profile-Preview"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-(--dark-sky) shadow-md"
            />
            <label
              htmlFor="profile-upload"
              className="btn btn-edit mt-3 cursor-pointer text-xs sm:text-sm px-4 sm:px-6"
            >
              Upload Profile Image
            </label>

            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
        {user?.role === "superadmin" && (
          <div className="inline-flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-(--lightest-blue) border-2 border-dashed border-(--main-color) rounded-xl shadow-sm">
            <div className="flex flex-col items-center">
              <img
                src={companyLogoPreview || IMAGES.dummyImg}
                alt="Company-Logo-Preview"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border border-(--main-color) shadow-md"
              />
              <label
                htmlFor="company-logo-upload"
                className="btn btn-edit mt-3 cursor-pointer text-xs sm:text-sm px-4 sm:px-6"
              >
                Upload Company Logo
              </label>
              <input
                id="company-logo-upload"
                type="file"
                accept="image/*"
                onChange={handleSuperadminLogoChange}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mt-4 sm:mt-5 md:mt-6"
      >
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={user?.role !== "superadmin"}
            className={`custom_input ${user?.role !== "superadmin"
              ? "bg-(--lightest-gray) text-(--medium-grey) cursor-not-allowed"
              : ""
              }`}
          />
          {user?.role !== "superadmin" && (
            <p className="text-(--primary-dark-red) text-xs sm:text-sm mt-1">
              Only admin can change the email.
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="custom_input"
          />
        </div>
        {user?.role === "superadmin" && (
          <>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="superadminCompanyName"
                value={form.superadminCompanyName}
                onChange={handleChange}
                className="custom_input "
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
                Company Address
              </label>
              <input
                type="text"
                name="superadminCompanyAddress"
                value={form.superadminCompanyAddress}
                onChange={handleChange}
                className="custom_input"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
                Company Phone
              </label>
              <input
                type="text"
                name="superadminCompanyPhoneNumber"
                value={form.superadminCompanyPhoneNumber}
                onChange={handleChange}
                className="custom_input"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">
                Company Email
              </label>
              <input
                type="email"
                name="superadminCompanyEmail"
                value={form.superadminCompanyEmail}
                onChange={handleChange}
                className="custom_input "
              />
            </div>
          </>
        )}
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">New Password</label>
          <div className="relative">
            <input
              type={newPasswordType}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              className="custom_input"
            />
            <span
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-(--medium-grey)"
              onClick={toggleNewPassword}
            >
              {newPasswordVisible ? (
                <Icons.EyeOff size={18} />
              ) : (
                <Icons.Eye size={18} />
              )}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-xs sm:text-sm font-medium mb-1">
            Current Password
          </label>
          <div className="relative">
            <input
              type={currentPasswordType}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              required
              className="custom_input"
            />
            <span
              className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer text-(--medium-grey)"
              onClick={toggleCurrentPassword}
            >
              {currentPasswordVisible ? (
                <Icons.EyeOff size={18} />
              ) : (
                <Icons.Eye size={18} />
              )}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 col-span-1 md:col-span-2">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-cancel"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className={`btn btn-success ${isUpdating ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {isUpdating ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
    </>
  );
};

export default EditProfile;