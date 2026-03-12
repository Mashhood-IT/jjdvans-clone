import express from "express";
import { createVehicle, getAllVehicles, updateVehicle, deleteVehicle } from "../controllers/pricing/vehicleController.js";
import { getUploader } from "../middleware/cloudinaryUpload.js";

const router = express.Router();
const upload = getUploader("vehicles");

router.post("/create-vehicle", upload.single("image"), createVehicle);
router.get("/get-all-vehicles", getAllVehicles);
router.put("/update-vehicle/:id", upload.single("image"), updateVehicle);
router.delete("/delete-vehicle/:id", deleteVehicle);

export default router;
