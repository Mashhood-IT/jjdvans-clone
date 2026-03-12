import mongoose from "mongoose"

const VehicleSchema = new mongoose.Schema({
    img: String,
    vehicleName: String,
    passenger: Number,
    maxSeats: Number,
    description: String
}, { _id: false })

const PassengerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
}, { _id: false })

const CurrencySchema = new mongoose.Schema({
    symbol: String,
    value: String
}, { _id: false })

const BookingSchema = new mongoose.Schema({
    bookingId: {
        type: String,
        required: true
    },
    bookingType: {
        type: String,
    },
    companyId: String,
    date: String,
    hour: Number,
    minute: Number,
    pickup: String,
    dropoff: String,

    additionalDropoff1: String,
    additionalDropoff2: String,
    additionalDropoff3: String,
    additionalDropoff4: String,

    distance: Number,
    duration: Number,
    distanceText: String,
    durationText: String,

    dropoffFloorNo: Number,
    pickupFloorNo: Number,

    additionalDropoff1FloorNo: Number,
    additionalDropoff1Access: {
        type: String,
        enum: ["STAIRS", "LIFT"],
        default: "STAIRS",
    },
    additionalDropoff2FloorNo: Number,
    additionalDropoff2Access: {
        type: String,
        enum: ["STAIRS", "LIFT"],
        default: "STAIRS",
    },
    additionalDropoff3FloorNo: Number,
    additionalDropoff3Access: {
        type: String,
        enum: ["STAIRS", "LIFT"],
        default: "STAIRS",
    },
    additionalDropoff4FloorNo: Number,
    additionalDropoff4Access: {
        type: String,
        enum: ["STAIRS", "LIFT"],
        default: "STAIRS",
    },

    notes: String,

    pickupAccess: {
        type: String,
        enum: ["STAIRS", "LIFT"],
        default: "STAIRS",
    },
    dropoffAccess: {
        type: String,
        enum: ["STAIRS", "LIFT"],
        default: "STAIRS",
    },
    inventoryItems: String,

    fare: Number,
    additionalTimeFare: Number,
    workersCharges: Number,
    totalPrice: Number,
    paymentMethod: String,
    passenger: PassengerSchema,
    status: {
        type: String,
        enum: ["New", "Completed", "Deleted"],
        default: "New"
    },

    ridingAlong: Boolean,
    passengerCount: Number,
    estimatedDuration: Number,

    vehicle: VehicleSchema,
    currency: CurrencySchema,
    extraTime: String,
    source: {
        type: String,
        enum: ["widget", "admin"],
        default: "widget"
    }

}, { timestamps: true })

const Booking = mongoose.model("Booking", BookingSchema)
export default Booking