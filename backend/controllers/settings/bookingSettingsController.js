import BookingSetting from "../../models/settings/bookingSettings.js";
import Booking from "../../models/bookings.js";


export const getBookingSetting = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        if (!companyId) {
            return res.status(400).json({ message: "Company ID not found" });
        }

        let setting = await BookingSetting.findOne({ companyId });

        if (!setting) {
            setting = await BookingSetting.create({
                companyId,
                currency: [{
                    label: "British Pound",
                    value: "GBP",
                    symbol: "£"
                }],
                currencyApplication: "New Bookings Only",
                googleApiKeys: {
                    browser: "",
                    server: "",
                },
                advanceBookingMin: {
                    value: 12,
                    unit: "Hours"
                },
            });
        }

        res.status(200).json({ setting });
    } catch (error) {
        console.error("Error fetching booking settings:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateBookingSetting = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        if (!companyId) {
            return res.status(400).json({ message: "Company ID not found" });
        }

        const {
            currency,
            currencyApplication,
            googleApiKeys,
            stripeKeys,
            paypalKeys,
            advanceBookingMin,
        } = req.body;

        if (currency && (!Array.isArray(currency) || currency.length === 0)) {
            return res.status(400).json({ message: "Currency must be a non-empty array" });
        }

        if (currencyApplication && !["All Bookings", "New Bookings Only"].includes(currencyApplication)) {
            return res.status(400).json({ message: "Invalid currency application value" });
        }

        if (advanceBookingMin) {
            if (advanceBookingMin.value < 0) {
                return res.status(400).json({ message: "Advance booking minimum must be non-negative" });
            }
            if (!["Hours", "Days"].includes(advanceBookingMin.unit)) {
                return res.status(400).json({ message: "Invalid time unit" });
            }
        }

        let setting = await BookingSetting.findOneAndUpdate(
            { companyId },
            {
                currency,
                currencyApplication,
                googleApiKeys,
                stripeKeys,
                paypalKeys,
                advanceBookingMin,
            },
            { new: true, upsert: true, runValidators: true }
        );

        if (currencyApplication === "All Bookings" && currency && currency.length > 0) {
            const newCurrency = currency[0];

            await Booking.updateMany(
                { companyId },
                {
                    $set: {
                        currency: {
                            value: newCurrency.value,
                            symbol: newCurrency.symbol
                        }
                    }
                }
            );

            console.log(`Updated currency for all bookings to ${newCurrency.value}`);
        }

        res.status(200).json({
            message: "Booking settings updated successfully",
            setting
        });
    } catch (error) {
        console.error("Error updating booking settings:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAdvanceBookingMinutes = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        if (!companyId) {
            return res.status(400).json({ message: "Company ID not found" });
        }

        const setting = await BookingSetting.findOne({ companyId });

        if (!setting) {
            return res.status(404).json({ message: "Booking settings not found" });
        }

        const { value, unit } = setting.advanceBookingMin;
        let minutes = value;

        if (unit === "Hours") {
            minutes = value * 60;
        } else if (unit === "Days") {
            minutes = value * 24 * 60;
        }

        res.status(200).json({ minutes, setting: setting.advanceBookingMin });
    } catch (error) {
        console.error("Error fetching advance booking minutes:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getPublicBookingSetting = async (req, res) => {
    try {
        const { companyId } = req.params;

        if (!companyId) {
            return res.status(400).json({ message: "Company ID not found" });
        }

        const setting = await BookingSetting.findOne({ companyId });

        if (!setting) {
            return res.status(404).json({ message: "Booking settings not found" });
        }

        res.status(200).json({ setting });
    } catch (error) {
        console.error("Error fetching public booking settings:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};