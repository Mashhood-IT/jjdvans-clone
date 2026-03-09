import Vehicle from "../../models/pricing/Vehicle.js";

export const createVehicle = async (req, res) => {
    try {
        const {
            vehicleName,
            passengerSeats,
            halfHourPrice,
            description,
            priority,
            priceType,
            percentageIncrease,
        } = req.body;

        const slabs = req.body.slabs ? JSON.parse(req.body.slabs) : [];
        const extraHelp = req.body.extraHelp ? JSON.parse(req.body.extraHelp) : [];
        let image = req.body.existingImage || "";
        if (req.file) {
            image = req.file.path;
        }

        const vehicle = new Vehicle({
            vehicleName,
            passengerSeats: Number(passengerSeats || 0),
            halfHourPrice,
            description,
            priority: Number(priority || 0),
            priceType: priceType || "Percentage",
            percentageIncrease: Number(percentageIncrease || 0),
            slabs,
            extraHelp,
            image,
        });

        const savedVehicle = await vehicle.save();
        res.status(201).json({
            message: "Vehicle created successfully",
            data: savedVehicle,
        });
    } catch (error) {
        console.error("Create vehicle error:", error);
        res.status(500).json({ message: "Failed to create vehicle", error: error.message });
    }
};

export const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find().sort({ priority: 1 });
        res.status(200).json({ data: vehicles });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch vehicles", error: error.message });
    }
};

export const updateVehicle = async (req, res) => {
    const { id } = req.params;
    try {
        const {
            vehicleName,
            passengerSeats,
            description,
            priority,
            halfHourPrice,
            priceType,
            percentageIncrease,
            existingImage,
        } = req.body;

        const slabs = req.body.slabs ? JSON.parse(req.body.slabs) : undefined;
        const extraHelp = req.body.extraHelp ? JSON.parse(req.body.extraHelp) : undefined;

        const updatedData = {
            vehicleName,
            passengerSeats: passengerSeats !== undefined ? Number(passengerSeats) : undefined,
            description,
            halfHourPrice,
            priority: priority !== undefined ? Number(priority) : undefined,
            priceType,
            percentageIncrease: percentageIncrease !== undefined ? Number(percentageIncrease) : undefined,
            slabs,
            extraHelp,
        };

        if (req.file) {
            updatedData.image = req.file.path;
        } else if (existingImage) {
            updatedData.image = existingImage;
        }


        Object.keys(updatedData).forEach(key => {
            if (updatedData[key] === undefined) {
                delete updatedData[key];
            }
        });

        const updatedVehicle = await Vehicle.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedVehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        res.status(200).json({
            message: "Vehicle updated successfully",
            data: updatedVehicle,
        });
    } catch (error) {
        console.error("Update vehicle error:", error);
        res.status(500).json({ message: "Failed to update vehicle", error: error.message });
    }
};

export const deleteVehicle = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedVehicle = await Vehicle.findByIdAndDelete(id);
        if (!deletedVehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        res.status(200).json({ message: "Vehicle deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete vehicle", error: error.message });
    }
};
