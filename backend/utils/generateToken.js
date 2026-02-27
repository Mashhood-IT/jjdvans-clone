import jwt from "jsonwebtoken";

export const generateAccessToken = (id, role, companyId) => {
  return jwt.sign({ id, role, companyId }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

export const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d", 
  });
};