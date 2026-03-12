import express from "express";
import { getUploader } from "../middleware/cloudinaryUpload.js";
import { protect } from "../middleware/authMiddleware.js";
import { login, updateProfile, sendOtpToEmail, resetPasswordWithOtp, getSuperadminInfo, refreshToken, resendLoginOtp, getMe, logout } from "../controllers/authController.js";

const router = express.Router();
const userUploader = getUploader("user");
const uploadfields = [{ name: "profileImage", maxCount: 1 }, { name: "superadminCompanyLogo", maxCount: 1 }];

router.post("/login", login);
router.post("/resend-otp", resendLoginOtp);
router.post("/logout", logout);
router.post("/refresh", refreshToken);
router.get("/me", protect, getMe);
router.put("/profile", protect, userUploader.fields(uploadfields), updateProfile);
router.post("/forgot-password", sendOtpToEmail);
router.post("/new-password", resetPasswordWithOtp);
router.get("/superadmin-info", getSuperadminInfo);

export default router;