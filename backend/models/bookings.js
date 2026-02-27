import mongoose from "mongoose"

const VehicleSchema = new mongoose.Schema({
    img: String,
    vehicleName: String,
    passenger: Number,
    description: String
})

const ExtrasSchema = new mongoose.Schema({
    rideAlong: String,
    extraTime: String,


})
const PassengerSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
})

const BookingSchema = new mongoose.Schema({
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

    pickupPostcode: String,
    dropoffPostcode: String,

    distance: Number,
    duration: Number,
    distanceText: String,
    durationText: String,

    dropoffFloorNo: Number,
    pickupFloorNo: Number,
    notes: String,

    accessType: {
        type: String,
        enum: ["Stairs", "Lift"],
        default: "Stairs",
    },
    inventoryItems: String,

    fare: Number,
    totalPrice: Number,
    paymentMethod: String,
    passenger: PassengerSchema,

    voucher: String,
    voucherApplied: Boolean,
    ridingAlong: Boolean,
    passengerCount: Number,
    estimatedDuration: Number,

    vehicle: VehicleSchema,
    extras: ExtrasSchema,

}, { timestamps: true })

const Booking = mongoose.model("Booking", BookingSchema)
export default Booking
