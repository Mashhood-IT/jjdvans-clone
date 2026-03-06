import fetch from "node-fetch";
import { google } from "googleapis";
import BookingSetting from "../models/settings/bookingSettings.js";

const getGoogleKeys = async (companyId) => {
  let serverKey = process.env.GOOGLE_API_KEY || "";
  let browserKey = process.env.GOOGLE_API_KEY || "";

  if (companyId) {
    try {
      const settings = await BookingSetting.findOne({ companyId });
      if (settings && settings.googleApiKeys) {
        if (settings.googleApiKeys.server) serverKey = settings.googleApiKeys.server;
        if (settings.googleApiKeys.browser) browserKey = settings.googleApiKeys.browser;
      }
    } catch (err) {
      console.error("Error fetching Google keys from DB:", err);
    }
  }

  return { server: serverKey, browser: browserKey };
};

const airportTerminals = {
  heathrow: [
    {
      name: "London Heathrow Airport (LHR), Terminal 1",
      formatted_address:
        "Heathrow Airport, Terminal 1, Cessna Rd, Longford, Hounslow TW6 1AH, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 2",
      formatted_address:
        "Heathrow Airport, Terminal 2, Cessna Rd, Longford, Hounslow TW6 1AH, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 3",
      formatted_address:
        "Heathrow Airport, Terminal 3, Cessna Rd, Longford, Hounslow TW6 1AH, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 4",
      formatted_address:
        "Heathrow Airport, Terminal 4, Stratford Rd, Hounslow TW6 3XA, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 5",
      formatted_address: "Heathrow Airport, Terminal 5, Longford TW6 2GA, UK",
    },
  ],
  lhr: [
    {
      name: "London Heathrow Airport (LHR), Terminal 1",
      formatted_address:
        "Heathrow Airport, Terminal 1, Cessna Rd, Longford, Hounslow TW6 1AH, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 2",
      formatted_address:
        "Heathrow Airport, Terminal 2, Cessna Rd, Longford, Hounslow TW6 1AH, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 3",
      formatted_address:
        "Heathrow Airport, Terminal 3, Cessna Rd, Longford, Hounslow TW6 1AH, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 4",
      formatted_address:
        "Heathrow Airport, Terminal 4, Stratford Rd, Hounslow TW6 3XA, UK",
    },
    {
      name: "London Heathrow Airport (LHR), Terminal 5",
      formatted_address: "Heathrow Airport, Terminal 5, Longford TW6 2GA, UK",
    },
  ],

  // Gatwick (LGW)
  gatwick: [
    {
      name: "London Gatwick Airport (LGW), North Terminal",
      formatted_address: "Gatwick Airport, North Terminal, Horley RH6 0NP, UK",
    },
    {
      name: "London Gatwick Airport (LGW), South Terminal",
      formatted_address: "Gatwick Airport, South Terminal, Horley RH6 0NP, UK",
    },
  ],
  lgw: [
    {
      name: "London Gatwick Airport (LGW), North Terminal",
      formatted_address: "Gatwick Airport, North Terminal, Horley RH6 0NP, UK",
    },
    {
      name: "London Gatwick Airport (LGW), South Terminal",
      formatted_address: "Gatwick Airport, South Terminal, Horley RH6 0NP, UK",
    },
  ],

  // Stansted (STN)
  stansted: [
    {
      name: "London Stansted Airport (STN), Main Terminal",
      formatted_address:
        "Stansted Airport, Bassingbourn Rd, Stansted CM24 1QW, UK",
    },
  ],
  stn: [
    {
      name: "London Stansted Airport (STN), Main Terminal",
      formatted_address:
        "Stansted Airport, Bassingbourn Rd, Stansted CM24 1QW, UK",
    },
  ],

  // Luton (LTN)
  luton: [
    {
      name: "London Luton Airport (LTN), Main Terminal",
      formatted_address: "Luton Airport, Airport Way, Luton LU2 9LY, UK",
    },
  ],
  ltn: [
    {
      name: "London Luton Airport (LTN), Main Terminal",
      formatted_address: "Luton Airport, Airport Way, Luton LU2 9LY, UK",
    },
  ],

  // City Airport (LCY)
  city: [
    {
      name: "London City Airport (LCY), Main Terminal",
      formatted_address: "City Airport, Hartmann Rd, London E16 2PX, UK",
    },
  ],
  lcy: [
    {
      name: "London City Airport (LCY), Main Terminal",
      formatted_address: "City Airport, Hartmann Rd, London E16 2PX, UK",
    },
  ],

  // Manchester (MAN)
  manchester: [
    {
      name: "Manchester Airport (MAN), Terminal 1",
      formatted_address:
        "Manchester Airport, Terminal 1, Manchester M90 1QX, UK",
    },
    {
      name: "Manchester Airport (MAN), Terminal 2",
      formatted_address:
        "Manchester Airport, Terminal 2, Manchester M90 1QX, UK",
    },
    {
      name: "Manchester Airport (MAN), Terminal 3",
      formatted_address:
        "Manchester Airport, Terminal 3, Manchester M90 1QX, UK",
    },
  ],
  man: [
    {
      name: "Manchester Airport (MAN), Terminal 1",
      formatted_address:
        "Manchester Airport, Terminal 1, Manchester M90 1QX, UK",
    },
    {
      name: "Manchester Airport (MAN), Terminal 2",
      formatted_address:
        "Manchester Airport, Terminal 2, Manchester M90 1QX, UK",
    },
    {
      name: "Manchester Airport (MAN), Terminal 3",
      formatted_address:
        "Manchester Airport, Terminal 3, Manchester M90 1QX, UK",
    },
  ],

  // Birmingham (BHX)
  birmingham: [
    {
      name: "Birmingham Airport (BHX), Main Terminal",
      formatted_address: "Birmingham Airport, Birmingham B26 3QJ, UK",
    },
  ],
  bhx: [
    {
      name: "Birmingham Airport (BHX), Main Terminal",
      formatted_address: "Birmingham Airport, Birmingham B26 3QJ, UK",
    },
  ],

  // Edinburgh (EDI)
  edinburgh: [
    {
      name: "Edinburgh Airport (EDI), Main Terminal",
      formatted_address: "Edinburgh Airport, Edinburgh EH12 9DN, UK",
    },
  ],
  edi: [
    {
      name: "Edinburgh Airport (EDI), Main Terminal",
      formatted_address: "Edinburgh Airport, Edinburgh EH12 9DN, UK",
    },
  ],

  // Glasgow (GLA)
  glasgow: [
    {
      name: "Glasgow Airport (GLA), Main Terminal",
      formatted_address: "Glasgow Airport, Paisley PA3 2SW, UK",
    },
  ],
  gla: [
    {
      name: "Glasgow Airport (GLA), Main Terminal",
      formatted_address: "Glasgow Airport, Paisley PA3 2SW, UK",
    },
  ],

  // Bristol (BRS)
  bristol: [
    {
      name: "Bristol Airport (BRS), Main Terminal",
      formatted_address: "Bristol Airport, Bristol BS48 3DY, UK",
    },
  ],
  brs: [
    {
      name: "Bristol Airport (BRS), Main Terminal",
      formatted_address: "Bristol Airport, Bristol BS48 3DY, UK",
    },
  ],

  // Belfast (BFS/BHD)
  belfast: [
    {
      name: "Belfast International Airport (BFS), Main Terminal",
      formatted_address: "Belfast International Airport, Crumlin BT29 4AB, UK",
    },
    {
      name: "Belfast City Airport (BHD), Main Terminal",
      formatted_address:
        "George Best Belfast City Airport, Belfast BT3 9JH, UK",
    },
  ],
  bfs: [
    {
      name: "Belfast International Airport (BFS), Main Terminal",
      formatted_address: "Belfast International Airport, Crumlin BT29 4AB, UK",
    },
  ],
  bhd: [
    {
      name: "Belfast City Airport (BHD), Main Terminal",
      formatted_address:
        "George Best Belfast City Airport, Belfast BT3 9JH, UK",
    },
  ],

  // Leeds (LBA)
  leeds: [
    {
      name: "Leeds Bradford Airport (LBA), Main Terminal",
      formatted_address: "Leeds Bradford Airport, Leeds LS19 7TU, UK",
    },
  ],
  lba: [
    {
      name: "Leeds Bradford Airport (LBA), Main Terminal",
      formatted_address: "Leeds Bradford Airport, Leeds LS19 7TU, UK",
    },
  ],

  // East Midlands (EMA)
  eastmidlands: [
    {
      name: "East Midlands Airport (EMA), Main Terminal",
      formatted_address: "East Midlands Airport, Derby DE74 2SA, UK",
    },
  ],
  ema: [
    {
      name: "East Midlands Airport (EMA), Main Terminal",
      formatted_address: "East Midlands Airport, Derby DE74 2SA, UK",
    },
  ],

  // Newcastle (NCL)
  newcastle: [
    {
      name: "Newcastle Airport (NCL), Main Terminal",
      formatted_address:
        "Newcastle International Airport, Newcastle upon Tyne NE13 8BZ, UK",
    },
  ],
  ncl: [
    {
      name: "Newcastle Airport (NCL), Main Terminal",
      formatted_address:
        "Newcastle International Airport, Newcastle upon Tyne NE13 8BZ, UK",
    },
  ],
};

// CONTROLLERS
export const AutoComplete = async (req, res) => {
  try {
    const queryRaw = req.query.input || "";
    const query = queryRaw.toLowerCase().replace(/[\s,-]+/g, "");
    let localResults = [];
    const matchedKey = Object.keys(airportTerminals).find((key) => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, "");
      return query.includes(normalizedKey) || normalizedKey.includes(query);
    });
    if (matchedKey) {
      localResults = (airportTerminals[matchedKey] || []).map((item) => {
        return {
          place_id: null,
          name: item.name,
          formatted_address: item.formatted_address,
          source: "airport-local",
          location: item.location || null,
        };
      });
    }
    const companyId = req.query.companyId;
    const keys = await getGoogleKeys(companyId);

    const autocompleteUrl =
      `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
      `?input=${encodeURIComponent(queryRaw)}` +
      `&components=country:gb` +
      `&key=${keys.server}`;
    const autocompleteResponse = await fetch(autocompleteUrl);
    const autocompleteData = await autocompleteResponse.json();
    const predictions = Array.isArray(autocompleteData?.predictions)
      ? autocompleteData.predictions.slice(0, 7)
      : [];
    const googleResults = await Promise.all(
      predictions.map(async (prediction) => {
        try {
          const placeId = prediction.place_id;
          const detailsUrl =
            `https://maps.googleapis.com/maps/api/place/details/json` +
            `?place_id=${placeId}` +
            `&fields=name,formatted_address,geometry,types` +
            `&key=${keys.server}`;
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();
          const result =
            detailsData?.status === "OK" ? detailsData.result : null;
          const name =
            result?.name || prediction.structured_formatting?.main_text || "";
          const fullAddress =
            result?.formatted_address || prediction.description || "";
          const loc = result?.geometry?.location || null;
          return {
            place_id: placeId,
            name,
            formatted_address: fullAddress,
            source:
              Array.isArray(result?.types) && result.types.includes("airport")
                ? "airport-google"
                : "location",
            location: loc,
          };
        } catch (e) {
          return {
            place_id: prediction.place_id,
            name: prediction.structured_formatting?.main_text || "",
            formatted_address: prediction.description || "",
            source: (prediction.types || []).includes("airport")
              ? "airport-google"
              : "location",
            location: null,
            routeWarnings: null,
          };
        }
      })
    );
    const mergedResults = [...localResults, ...googleResults];
    return res.json({ predictions: mergedResults });
  } catch (error) {
    console.error("AutoComplete Error:", error);
    res.status(500).json({ error: "Failed to fetch autocomplete data." });
  }
};

export const Distance = async (req, res) => {
  try {
    const { origin, destination, avoid } = req.query;

    if (!origin || !destination) {
      return res
        .status(400)
        .json({ error: "Origin and destination are required" });
    }

    let avoidQuery = "";
    if (avoid && avoid.trim() !== "") {
      avoidQuery = `&avoid=${encodeURIComponent(avoid)}`;
    }

    const companyId = req.query.companyId;
    const keys = await getGoogleKeys(companyId);

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${encodeURIComponent(
      origin
    )}&destinations=${encodeURIComponent(destination)}${avoidQuery}&key=${keys.server
      }`;

    const response = await fetch(url);
    const data = await response.json();

    const element = data?.rows?.[0]?.elements?.[0];

    if (!element || element.status !== "OK") {
      return res
        .status(400)
        .json({ error: "Invalid distance matrix response", details: element });
    }

    const distanceText = element.distance?.text || null;
    const distanceValue = element.distance?.value || null;
    const durationText = element.duration?.text || null;
    const durationValue = element.duration?.value || null;

    res.json({
      distanceText,
      distanceValue,
      durationText,
      durationValue,
      avoidRoutes: avoidQuery || "",
      routeWarnings: null,
    });
  } catch (error) {
    console.error("Distance Error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch distance data", details: error.message });
  }
};

export const MapKey = async (req, res) => {
  try {
    const companyId = req.query.companyId;
    const keys = await getGoogleKeys(companyId);
    return res.json({ mapKey: keys.browser });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve map key" });
  }
}

export const Geocode = async (req, res) => {
  try {
    const address = req.query.address;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    const companyId = req.query.companyId;
    const keys = await getGoogleKeys(companyId);

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${keys.server}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" || !data.results?.length) {
      return res.status(400).json({ error: "Failed to geocode address" });
    }

    const location = data.results[0].geometry.location;
    const formattedAddress = data.results[0].formatted_address;

    res.json({
      location,
      formatted_address: formattedAddress,
      routeWarnings: null,
    });
  } catch (error) {
    console.error("Geocode Error:", error);
    res.status(500).json({ error: "Failed to geocode address" });
  }
}