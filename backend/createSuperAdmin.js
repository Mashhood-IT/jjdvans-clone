import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "./models/User.js";

const createSuperAdmin = async () => {
  const email = process.env.SUPERADMINEMAIL;
  const password = process.env.SUPERADMINPSW;
  if (!password) {
    throw new Error("SUPERADMINPSW is not defined in .env file");
  }

  const existing = await User.findOne({ email });
  if (!existing) {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      email,
      fullName: "Super Admin",
      password: hashed,
      role: "superadmin",
      companyId: new mongoose.Types.ObjectId(),
      superadminCompanyName:
        process.env.SUPERADMIN_COMPANY_NAME || "Flexible Budget Removals Limited",
      superadminCompanyAddress:
        process.env.SUPERADMIN_COMPANY_ADDRESS ||
        " Witcombe Point, Yarnfield Square, London, SE15 5EJ",
      superadminCompanyLogo:
        "https://res.cloudinary.com/dyiadnfvr/image/upload/v1768302954/MTL-BOOKING-APP/user/newlogo-removebg-preview.png.png",
      superadminCompanyPhoneNumber:
        process.env.SUPERADMIN_COMPANY_PHONE || "+447930844247",
      superadminCompanyEmail:
        process.env.SUPERADMIN_COMPANY_EMAIL || "megatransfer22@gmail.com",
      superadminCompanyWebsite:
        process.env.SUPERADMIN_COMPANY_WEBSITE ||
        "https://jjdvans-clone.netlify.app/dashboard/my-dashboard",
    });
  }
};

export default createSuperAdmin;