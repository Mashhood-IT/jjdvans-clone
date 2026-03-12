import mongoose from "mongoose";

const EMAIL_MAX = 254;
const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: EMAIL_MAX,
      validate: {
        validator: (v) => EMAIL_RE.test(v || ""),
        message: "Invalid email",
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    fullName: { type: String, trim: true, required: true },

    role: {
      type: String,
    },
    profileImage: { type: String, default: "" },
    superadminCompanyLogo: { type: String, default: "" },
    superadminCompanyName: { type: String, default: "" },
    superadminCompanyAddress: { type: String, default: "" },
    superadminCompanyPhoneNumber: { type: String, default: "" },
    superadminCompanyEmail: { type: String, default: "" },
    superadminCompanyWebsite: { type: String, default: "" },
    otpCode: { type: String, trim: true },
    otpExpiresAt: { type: Date },

    companyId: { type: mongoose.Schema.Types.ObjectId }
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);