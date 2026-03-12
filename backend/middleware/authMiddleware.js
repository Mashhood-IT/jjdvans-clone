import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    if (
      req.path.includes("/create-booking") &&
      (req.body?.source === "widget" || req.query?.source === "widget")
    ) {
      req.user = {
        role: "widget-public",
        companyId: req.body.companyId || req.query.companyId || null,
      };
      return next();
    }

    let token = req.cookies?.access_token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      _id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      companyId: user.companyId?.toString() || decoded.companyId || null,
      permissions: user.permissions || [],
      profileImage: user.profileImage || "",
      employeeNumber: user.employeeNumber || null,
      superadminCompanyName: user.superadminCompanyName || "",
      superadminCompanyAddress: user.superadminCompanyAddress || "",
      superadminCompanyPhoneNumber: user.superadminCompanyPhoneNumber || "",
      superadminCompanyEmail: user.superadminCompanyEmail || "",
      superadminCompanyLogo: user.superadminCompanyLogo || "",
    };

    next();
  } catch (err) {
    console.error("JWT auth error:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};