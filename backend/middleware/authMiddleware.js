import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // 1. Allow widget-based public booking (no login required)
    if (
      req.path.includes("/create-booking") &&
      (req.body?.source === "widget" || req.query?.source === "widget")
    ) {
      // Allow booking creation without token
      req.user = {
        role: "widget-public",
        companyId: req.body.companyId || req.query.companyId || null,
      };
      return next();
    }

    // 2. Standard token-based protection for all other routes
    let token = req.cookies?.access_token;

    // Check for Authorization header (for mobile app)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // DEBUG LOG
    // console.error(`[Auth-Debug] ${req.method} ${req.path} - Headers:`, req.headers.authorization ? "Auth Header Present" : "No Auth Header", "Cookies:", req.cookies ? "Cookies Present" : "No Cookies");

    if (!token) {
      console.error(`[Auth-Failure] No token found for ${req.method} ${req.path}`);
      console.error(`[Auth-Failure] Cookies keys: ${Object.keys(req.cookies || {}).join(", ")}`);
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 3. Attach sanitized user info to request
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

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};

export const injectCompanyId = (req, res, next) => {
  if (req.user && req.user.companyId) {
    if (!req.body.companyId) {
      req.body.companyId = req.user.companyId;
    }
    if (!req.query.companyId) {
      req.query.companyId = req.user.companyId;
    }
  }
  next();
};

// old code
// Middleware to protect routes and ensure the user is authenticated
// export const protect = async (req, res, next) => {
//   try {
//     const token = req.cookies?.access_token;
//     if (!token) {
//       return res.status(401).json({ message: "Not authorized, no token" });
//     }
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }
//     req.user = {
//       _id: user._id.toString(),
//       email: user.email,
//       fullName: user.fullName,
//       role: user.role,
//       companyId: user.companyId?.toString() || decoded.companyId || null,
//       permissions: user.permissions || [],
//       profileImage: user.profileImage || "",
//       employeeNumber: user.employeeNumber || null,
//       superadminCompanyName: user.superadminCompanyName || "",
//       superadminCompanyAddress: user.superadminCompanyAddress || "",
//       superadminCompanyPhoneNumber: user.superadminCompanyPhoneNumber || "",
//       superadminCompanyEmail: user.superadminCompanyEmail || "",
//       superadminCompanyLogo: user.superadminCompanyLogo || "",
//     };
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Not authorized, token failed" });
//   }
// };

// export const requireApiKey = (req, res, next) => {
//   const apiKey = req.headers['x-api-key'];
//   console.log("received api key", apiKey);
//   console.log("expected api key", process.env.INTERNAL_API_KEY);
//   console.log("all headers", req.headers);
//   console.log("all cookies", req.cookies);

//   if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
//     return res.status(403).json({
//       message: "This endpoint requires API key authentication"
//     });
//   }
//   next();
// };