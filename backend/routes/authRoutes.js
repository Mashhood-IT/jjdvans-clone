import express from "express";
import { getUploader } from "../middleware/cloudinaryUpload.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import { login, updateProfile, sendOtpToEmail, resetPasswordWithOtp, getSuperadminInfo, refreshToken, resendLoginOtp, getMe, logout } from "../controllers/authController.js";

const router = express.Router();
const userUploader = getUploader("user");
const uploadfields = [ { name: "profileImage", maxCount: 1 }, { name: "superadminCompanyLogo", maxCount: 1 } ];

router.post("/login", login); //login
router.post("/resend-otp", resendLoginOtp); //resend otp
router.post("/logout", logout); //logout
router.post("/refresh", refreshToken); //refresh access token
router.get("/me", protect, authorize( "superadmin", "clientadmin", "staffmember", "customer", "driver", "associateadmin","demo" ), getMe); //get logged in user details
router.put("/profile", protect, userUploader.fields(uploadfields), updateProfile); //update profile
router.post("/forgot-password", sendOtpToEmail); //send otp to email for forgot password
router.post("/new-password", resetPasswordWithOtp); //reset password with otp
router.get("/superadmin-info", getSuperadminInfo); //get superadmin info for login page

export default router;