import express from "express";
import { AutoComplete, Distance, Geocode, MapKey } from "../controllers/googleController.js";
const router = express.Router();

router.get("/autocomplete", AutoComplete);
router.get("/distance", Distance);
router.get("/map-key", MapKey);
router.get("/geocode", Geocode);

export default router;