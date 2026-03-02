import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    vehicleName: {
      type: String,
      required: true,
      trim: true,
    },
    passengerSeats: {
      type: Number,
      default: 0,
    },
    halfHourPrice: { type: Number, required: true },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    priority: {
      type: Number,
      default: 0,
    },
    priceType: {
      type: String,
      enum: ["Percentage", "Fixed"],
      default: "Percentage",
    },
    percentageIncrease: {
      type: Number,
      default: 0,
    },
    extraHelp: [
      {
        label: { type: String, required: true },
        price: { type: Number, default: 0 },
      },
    ],
    slabs: [
      {
        from: { type: Number, required: true },
        to: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Vehicle", vehicleSchema);
