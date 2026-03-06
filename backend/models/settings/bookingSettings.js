import mongoose from "mongoose";

const CurrencySchema = new mongoose.Schema({
    label: {
        type: String,
        required: true,
        default: "British Pound"
    },
    value: {
        type: String,
        required: true,
        default: "GBP"
    },
    symbol: {
        type: String,
        required: true,
        default: "£"
    }
}, { _id: false });

const GoogleApiKeysSchema = new mongoose.Schema({
    browser: {
        type: String,
        default: ""
    },
    server: {
        type: String,
        default: ""
    },
}, { _id: false });

const StripeKeysSchema = new mongoose.Schema({
    publishableKey: {
        type: String,
        default: ""
    },
    secretKey: {
        type: String,
        default: ""
    },
}, { _id: false });

const AdvanceBookingMinSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true,
        default: 12,
        min: 0
    },
    unit: {
        type: String,
        enum: ["Hours", "Days"],
        default: "Hours"
    }
}, { _id: false });

const BookingSettingSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        unique: true
    },

    currency: {
        type: [CurrencySchema],
        default: [{
            label: "British Pound",
            value: "GBP",
            symbol: "£"
        }]
    },

    currencyApplication: {
        type: String,
        enum: ["All Bookings", "New Bookings Only"],
        default: "New Bookings Only"
    },

    googleApiKeys: {
        type: GoogleApiKeysSchema,
        default: () => ({})
    },

    stripeKeys: {
        type: StripeKeysSchema,
        default: () => ({})
    },

    advanceBookingMin: {
        type: AdvanceBookingMinSchema,
        default: () => ({
            value: 12,
            unit: "Hours"
        })
    },

}, { timestamps: true });

const BookingSetting = mongoose.model("BookingSetting", BookingSettingSchema);

export default BookingSetting;