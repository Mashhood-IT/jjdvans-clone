import express from "express";
import { AutoComplete, Distance, Geocode, MapKey } from "../controllers/googleController.js";
const router = express.Router();

router.get("/autocomplete", AutoComplete); // get address autocomplete suggestions
router.get("/distance", Distance); // get distance between locations
router.get("/map-key", MapKey); // get google maps api key
router.get("/geocode", Geocode); // geocode address to coordinates

export default router;