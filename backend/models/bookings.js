import mongoose from "mongoose"

const VehicleSchema = new mongoose.Schema({
    img: String,
    vehicleName: String,
    passenger: Number,
    description: String
}, { _id: false })

const ExtrasSchema = new mongoose.Schema({
    rideAlong: String,
    extraTime: String,


}, { _id: false })
const PassengerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
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
    totalPrice: Number,
    paymentMethod: String,
    passenger: PassengerSchema,

    ridingAlong: Boolean,
    passengerCount: Number,
    estimatedDuration: Number,

    vehicle: VehicleSchema,
    extras: ExtrasSchema,

}, { timestamps: true })

const Booking = mongoose.model("Booking", BookingSchema)
export default Booking
