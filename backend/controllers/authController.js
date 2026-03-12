import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";

import sendEmail from "../sendEmail.js";
import { otpEmailTemplate } from "../utils/user/otpEmailTemplate.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";

dotenv.config();

export const genOtp = () => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });


    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const forwarded = req.headers["x-forwarded-for"];
    const rawIp = forwarded || req.socket.remoteAddress || "";
    const ip = rawIp.includes("::ffff:") ? rawIp.split("::ffff:")[1] : rawIp;

    await handleSuccessfulLogin(
      user,
      res,
      "Login successful (OTP disabled)."
    );
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

async function handleSuccessfulLogin(
  user,
  res,
  message = "Login successful",
) {

  await user.save();

  const accessToken = generateAccessToken(user._id, user.role, user.companyId);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 1 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  const responseData = {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    profileImage: user.profileImage || null,
    companyId: user.companyId || null,
    superadminCompanyLogo: user.superadminCompanyLogo || "",
    superadminCompanyName: user.superadminCompanyName || "",
    superadminCompanyAddress: user.superadminCompanyAddress || "",
    superadminCompanyPhoneNumber: user.superadminCompanyPhoneNumber || "",
    superadminCompanyEmail: user.superadminCompanyEmail || "",
    superadminCompanyWebsite: user.superadminCompanyWebsite || "",
    message,

  };
  res.json(responseData);
}

export const resendLoginOtp = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    if (user.status === "Active" && !user.verification) {
      return res.status(400).json({
        message: "User is already verified. No OTP needed.",
      });
    }
    if (user.verification && user.verification.attempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Please try again later.",
      });
    }
    const otp = genOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    user.verification = {
      otpHash,
      otpExpiresAt,
      attempts: 0,
    };
    await user.save();
    try {
      await sendEmail(user.email, "Your OTP Code", {
        title: "Verify Your Account",
        subtitle: "Use this OTP to verify your login:",
        data: { "One-Time Password": otp, "Expires In": "2 minutes" },
      });
    } catch (emailError) {
      return res.status(500).json({
        message: "Failed to send OTP email. Please try again later.",
      });
    }
    return res.status(200).json({
      message: "OTP has been resent to your email.",
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while resending OTP.",
    });
  }
};

export const logout = (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.clearCookie("refresh_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully" });
};

export const refreshToken = async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json({ message: "No refresh token" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });
    res.cookie(
      "access_token",
      generateAccessToken(user._id, user.role, user.companyId),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      }
    );
    return res.json({ message: "Access token refreshed" });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const getMe = (req, res) => {
  const u = req.user;
  if (!u) {
    return res.status(401).json({ message: "Not authorized" });
  }
  res.json({
    _id: u._id || null,
    email: u.email || "",
    fullName: u.fullName || "",
    role: u.role || "",
    companyId: u.companyId || null,
    profileImage: u.profileImage || "",
    employeeNumber: u.employeeNumber || null,
    superadminCompanyName: u.superadminCompanyName || "",
    superadminCompanyAddress: u.superadminCompanyAddress || "",
    superadminCompanyPhoneNumber: u.superadminCompanyPhoneNumber || "",
    superadminCompanyEmail: u.superadminCompanyEmail || "",
    superadminCompanyLogo: u.superadminCompanyLogo || "",
  });
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(
      req.body.currentPassword,
      user.password
    );
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const updatedFields = {};

    if (req.body.email && req.body.email !== user.email) {
      user.email = req.body.email;
      updatedFields.email = req.body.email;
    }

    if (req.body.fullName && req.body.fullName !== user.fullName) {
      user.fullName = req.body.fullName;
      updatedFields.fullName = req.body.fullName;
    }

    if (updatedFields.fullName) {
      const newFullName = updatedFields.fullName.trim();
    }

    if (req.body.phone && req.body.phone !== user.phone) {
      user.phone = req.body.phone;
      updatedFields.phone = req.body.phone;
    }

    if (req.body.newPassword) {
      user.password = await bcrypt.hash(req.body.newPassword, 10);
    }

    if (req.files?.profileImage?.[0]?.path) {
      user.profileImage = req.files.profileImage[0].path;
    }

    if (req.files?.superadminCompanyLogo?.[0]?.path) {
      user.superadminCompanyLogo = req.files.superadminCompanyLogo[0].path;
    }

    if (user.role === "superadmin") {
      user.superadminCompanyName =
        req.body.superadminCompanyName || user.superadminCompanyName;
      user.superadminCompanyAddress =
        req.body.superadminCompanyAddress || user.superadminCompanyAddress;
      user.superadminCompanyPhoneNumber =
        req.body.superadminCompanyPhoneNumber ||
        user.superadminCompanyPhoneNumber;
      user.superadminCompanyEmail =
        req.body.superadminCompanyEmail || user.superadminCompanyEmail;
    }

    await user.save();

    res.json({
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      profileImage: user.profileImage,
      vatnumber: user.vatnumber || null,
      superadminCompanyLogo: user.superadminCompanyLogo || "",
      superadminCompanyName: user.superadminCompanyName || "",
      superadminCompanyAddress: user.superadminCompanyAddress || "",
      superadminCompanyPhoneNumber: user.superadminCompanyPhoneNumber || "",
      superadminCompanyEmail: user.superadminCompanyEmail || "",
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const sendOtpToEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailNorm = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailNorm });

    if (!user) {
      return res.status(200).json({
        message: "If an account exists with this email, OTP has been sent.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 2 * 60 * 1000);

    user.otpCode = otp;
    user.otpExpiresAt = expires;
    await user.save();

    const htmlTemplate = otpEmailTemplate({ otp });

    try {
      await sendEmail(emailNorm, "Password Reset OTP", {
        title: "Password Reset Request",
        subtitle: "Use the following OTP to reset your password:",
        data: {
          "One-Time Password": otp,
          "Expires In": "2 minutes",
        },
        html: htmlTemplate,
      });

      return res.status(200).json({
        message: "OTP sent successfully to your email",
        emailSent: true,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);

      if (process.env.NODE_ENV === "development") {
        return res.status(200).json({
          message: "Email service failed, but here's your OTP (dev mode only):",
          otp: otp,
          emailSent: false,
        });
      }

      return res.status(500).json({
        message: "Failed to send email. Please try again later.",
      });
    }
  } catch (error) {
    console.error("Error in sendOtpToEmail:", error);
    return res.status(500).json({
      message: "Server error sending OTP",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    let { email, otp, newPassword } = req.body;

    email = email.trim().toLowerCase();

    otp = otp.toString().trim();

    const user = await User.findOne({
      email: email,
      otpCode: otp,
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "Expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();

    return res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error resetting password" });
  }
};

export const getSuperadminInfo = async (req, res) => {
  try {
    const superadmin = await User.findOne({ role: "superadmin" }).select(
      "superadminCompanyLogo superadminCompanyName superadminCompanyAddress superadminCompanyPhoneNumber superadminCompanyEmail superadminCompanyWebsite"
    );
    if (!superadmin) {
      return res.status(404).json({ message: "Superadmin not found" });
    }
    res.json(superadmin);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};