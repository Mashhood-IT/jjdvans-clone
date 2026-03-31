import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import googleRoutes from "./routes/googleRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import bookingSettingsRoutes from "./routes/settings/bookingSetttingsRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import createSuperAdmin from "./createSuperAdmin.js";

dotenv.config();
const PORT = process.env.PORT || 5002;

await connectDB();

const allowedOriginsRaw = process.env.BASE_URL_FRONTEND || "";
const origins = allowedOriginsRaw
  .split(",")
  .map((o) => o.trim().replace(/\/$/, ""));
const systemTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
process.env.CRON_TIMEZONE = systemTZ;

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, "");
      const isAllowed = origins.some((o) => {
        const normalizedO = o.replace(/\/$/, "");
        return (
          normalizedOrigin === normalizedO ||
          normalizedOrigin.startsWith(normalizedO)
        );
      });

      if (isAllowed) {
        return callback(null, true);
      }

      console.error(
        `[CORS-Blocked] Allowed: "${allowedOriginsRaw}", Received: "${origin}"`,
      );
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/pricing", vehicleRoutes);
app.use("/api/settings", bookingSettingsRoutes);
app.use("/api/payment", paymentRoutes);

app.use(errorHandler);

app.listen(PORT, async () => {
  console.log("SERVER STARTED SUCCESSFULLY");
  try {
    await createSuperAdmin();
    console.log("Superadmin created/verified");
  } catch (err) {
    console.error("Error initializing services:", err);
  }
});
