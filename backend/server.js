import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
// import pricingRoutes from "./routes/pricingRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import createSuperAdmin from "./createSuperAdmin.js";

dotenv.config();

await connectDB();

const allowedOrigins = process.env.BASE_URL_FRONTEND
const systemTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
process.env.CRON_TIMEZONE = systemTZ;

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.warn(`CORS blocked for origin: ${origin}`);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/auth", authRoutes);
// app.use("/api/pricing", pricingRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/pricing", vehicleRoutes);
// app.use("/api/notification", NotificationRoutes);

app.use(errorHandler);

const PORT = 5000;

app.listen(PORT, async () => {
  console.log("SERVER STARTED SUCCESSFULLY");
  try {
    await createSuperAdmin();
    console.log("Superadmin created/verified");

  } catch (err) {
    console.error("Error initializing services:", err);
  }
});