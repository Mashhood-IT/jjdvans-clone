import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Icons from "../../../../assets/icons";
import SelectOption from "../../../constants/constantcomponents/SelectOption";

import {
  useLazyGeocodeQuery,
  useLazySearchGooglePlacesQuery,
} from "../../../../redux/api/googleApi";
import LocationMap from "./LocationMap";

const PrimaryForm = ({
  formData,
  dropoffCoords,
  setDropoffCoords,
  pickupSuggestions = [],
  dropOffs = [],
  setDropOffs,
  setPickupSuggestions,
  setDropOffSuggestions,
  dropOffSuggestions = [],
  activeDropIndex,
  setActiveDropIndex,
  removeDropOff,
  addDropOff,
  handleChange,
  setMode,
  mode,
  handleSubmit,
  formattedHourlyOptions = [],
  selectedHourly,
  setSelectedHourly,
  setFormData,
  companyId,
  isCoverageValid,
  setIsCoverageValid,
}) => {
  const bookingSettingData = {
    setting: {
      hourlyPackage: true,
      advanceBookingMin: { value: 30, unit: "minutes" }
    }
  };

  const [pickupCoords, setPickupCoords] = useState(null);
  const [triggerSearchAutocomplete] = useLazySearchGooglePlacesQuery();
  const [triggerGeocode] = useLazyGeocodeQuery();



  const REMOVAL_BOOKING_TYPES = [
    { label: "House Removals", value: "house_removals" },
    { label: "Furniture & General Items", value: "furniture" },
    { label: "Moving Flat or Apartment", value: "flat_apartment" },
    { label: "Office Moves", value: "office_moves" },
    { label: "Piano or Electronic Equipment", value: "piano_electronics" },
    { label: "Same-Day Delivery", value: "same_day" },
    { label: "Pickup from Store", value: "pickup_store" },
  ];

  const hourlyEnabled = !!(
    bookingSettingData?.setting?.hourlyPackage ??
    bookingSettingData?.setting?.hourLyPackage
  );

  const handleChangeWithValidation = (e) => {
    const { name, value } = e.target;
    handleChange(e);
  };

  useEffect(() => {
    if (!hourlyEnabled && mode === "Hourly") {
      setMode("Transfer");
      setSelectedHourly?.(null);
    }
  }, [hourlyEnabled, mode, setMode, setSelectedHourly]);


  const handlePickupChange = (e) => {
    const val = e.target.value;

    setFormData({ ...formData, pickup: val });

    if (!val.trim()) {
      setPickupCoords(null);
    }
    setIsCoverageValid?.(true);

    if (val.length >= 3) {
      fetchSuggestions(val, setPickupSuggestions);
    } else {
      setPickupSuggestions([]);
    }
  };

  const checkCoverage = async (scope, coords, silent = false) => {
    return true;
  };

  const validateAllLocations = async () => {
    setIsCoverageValid?.(true);
  };

  const fetchSuggestions = async (query, setter) => {
    if (!query) return setter([]);
    try {
      const res = await triggerSearchAutocomplete(query).unwrap();
      const results = res.predictions.map((r) => ({
        place_id: r.place_id,
        name: r.name || r.structured_formatting?.main_text,
        formatted_address: r.formatted_address || r.description,
        source:
          r.source || (r.types?.includes("airport") ? "airport" : "location"),
        location: r.location || null,
      }));
      setter(results);
    } catch (err) {
      toast.error("Error while fetching suggestions")
      console.log("error in fetching suggestions", err)
    }
  };

  const handlePickupSelect = async (sug) => {

    const full = `${sug.name} - ${sug.formatted_address}`;
    setFormData((prev) => ({ ...prev, pickup: full }));
    setPickupSuggestions([]);

    // Set coordinates from suggestion
    if (sug.location) {
      const coords = {
        lat: Number(sug.location.lat),
        lng: Number(sug.location.lng)
      };
      setPickupCoords(coords);
    } else {
      try {
        const g = await triggerGeocode(full).unwrap();
        if (g?.location) {
          const coords = {
            lat: Number(g.location.lat),
            lng: Number(g.location.lng)
          };
          setPickupCoords(coords);
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      }
    }

    validateAllLocations();
  };

  const handleDropOffChange = (idx, val) => {
    const updated = [...dropOffs];
    updated[idx] = val;
    setDropOffs(updated);
    setActiveDropIndex(idx);
    setIsCoverageValid?.(true);

    if (!val.trim()) {
      setDropoffCoords((prev) => {
        const copy = { ...prev };
        delete copy[idx];
        return copy;
      });
    }

    if (val.length >= 3) {
      fetchSuggestions(val, setDropOffSuggestions);
    } else {
      setDropOffSuggestions([]);
    }
  };

  const handleDropOffSelect = async (idx, sug) => {

    const full = `${sug.name} - ${sug.formatted_address}`;
    const updated = [...dropOffs];
    updated[idx] = full;
    setDropOffs(updated);
    setDropOffSuggestions([]);

    if (sug.location) {
      const coords = {
        lat: Number(sug.location.lat),
        lng: Number(sug.location.lng)
      };
      setDropoffCoords((prev) => ({
        ...prev,
        [idx]: coords
      }));
    } else {
      try {
        const g = await triggerGeocode(full).unwrap();
        if (g?.location) {
          const coords = {
            lat: Number(g.location.lat),
            lng: Number(g.location.lng)
          };
          setDropoffCoords((prev) => ({
            ...prev,
            [idx]: coords
          }));
        }
      } catch (err) {
        console.error('Geocoding error:', err);
      }
    }

    validateAllLocations();
  };

  return (
    <>

      <div className="grid grid-cols-12 gap-6">

        <form
          onSubmit={handleSubmit}
          className="2xl:col-span-4 col-span-6 2xl:col-start-3 col-start-1 bg-linear-to-br from-(--white) via-(--lightest-gray) to-(--lighter-gray) border border-(--light-gray) rounded-2xl shadow-lg px-6 pt-3 pb-6 text-base text-(--dark-grey) transition duration-300 hover:shadow-xl"
        >
          <div className="mb-4 mt-4">
            <SelectOption
              label="Booking Type"
              name="bookingType"
              value={formData.bookingType || ""}
              options={REMOVAL_BOOKING_TYPES}
              onChange={handleChange}
            />
          </div >
          <div className="relative mb-4 mt-4">
            <label className="block text-xs font-medium text-(--dark-gray) mb-1" >Pickup</label>
            <input
              type="text"
              name="pickup"
              placeholder="Pickup Location"
              value={formData.pickup}
              onChange={handlePickupChange}
              onBlur={validateAllLocations}
              className="custom_input w-full"
            />
            {pickupSuggestions.length > 0 && (
              <ul className="absolute z-20 bg-(--white) border rounded shadow max-h-40 overflow-y-auto w-full">
                <li
                  onClick={async () => {
                    const val = (formData.pickup || "").trim();
                    setFormData((prev) => ({ ...prev, pickup: val }));
                    setPickupSuggestions([]);
                    validateAllLocations();
                  }}
                  className="p-2 text-xs sm:text-sm bg-(--lightes-blue) hover:bg-(--lightest-blue) cursor-pointer border-b"
                >
                  ➕ Use: "{formData.pickup}"
                </li>

                {pickupSuggestions.map((sug, idx) => (
                  <li
                    key={idx}
                    onClick={() => handlePickupSelect(sug)}
                    className="p-2 text-xs sm:text-sm hover:bg-(--lighter-gray) cursor-pointer"
                  >
                    {sug.name} - {sug.formatted_address}
                  </li>
                ))}
              </ul>
            )}
          </div>


          {
            dropOffs.length >= 1 && (
              <div>
                <label className="block text-xs font-medium text-(--dark-gray) mb-1">
                  Drop Off 1
                </label>
                <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                  <input
                    type="text"
                    value={dropOffs[0]}
                    placeholder="Drop Off 1"
                    onChange={(e) => handleDropOffChange(0, e.target.value)}
                    onBlur={async () => {
                      const coords = dropoffCoords[0] || null;

                      let finalCoords = coords;
                      if (!finalCoords && dropOffs[0]?.trim()) {
                        try {
                          const g = await triggerGeocode(
                            dropOffs[0],
                          ).unwrap();
                          if (g?.location) {
                            finalCoords = {
                              lat: Number(g.location.lat),
                              lng: Number(g.location.lng),
                            };
                            setDropoffCoords((prev) => ({
                              ...prev,
                              0: finalCoords,
                            }));
                          }
                        } catch { }
                      }

                      if (finalCoords) {
                        validateAllLocations(pickupCoords, {
                          ...dropoffCoords,
                          0: finalCoords,
                        });
                      }
                    }}
                    className="custom_input w-full"
                  />
                  {dropOffSuggestions.length > 0 &&
                    activeDropIndex === 0 && (
                      <ul className="absolute z-30 bg-(--white) border rounded shadow max-h-40 overflow-y-auto w-full top-full left-0 mt-1">
                        <li
                          onClick={async () => {
                            const val = (dropOffs[0] || "").trim();
                            if (!val) return;

                            let coords = null;
                            try {
                              const g = await triggerGeocode(val).unwrap();
                              if (
                                g?.location &&
                                Number.isFinite(g.location.lat) &&
                                Number.isFinite(g.location.lng)
                              ) {
                                coords = {
                                  lat: Number(g.location.lat),
                                  lng: Number(g.location.lng),
                                };
                              }
                            } catch (err) {
                              toast.error(err);
                            }
                            if (coords) {
                              const ok = await checkCoverage(
                                "dropoff",
                                coords,
                              );
                              if (!ok) {
                                const updated = [...dropOffs];
                                updated[idx] = "";
                                setDropOffs(updated);
                                setDropoffCoords((prev) => ({
                                  ...prev,
                                  [idx]: null,
                                }));
                                return;
                              }
                            }

                            const updated = [...dropOffs];
                            updated[0] = val;
                            setDropOffs(updated);

                            setDropOffTypes((prev) => ({
                              ...prev,
                              [0]: "location",
                            }));
                            setDropoffCoords((prev) => ({
                              ...prev,
                              [0]: coords,
                            }));
                            setDropOffSuggestions([]);
                          }}
                          className="p-2 bg-(--lightest-blue) hover:bg-(--lighter-blue) cursor-pointer border-b text-xs"
                        >
                          ➕ Use: "{dropOffs[0]}"
                        </li>
                        {dropOffSuggestions.map((sug, i) => (
                          <li
                            key={i}
                            onClick={() => handleDropOffSelect(0, sug)}
                            className="p-2 text-xs hover:bg-(--lightest-gray) cursor-pointer"
                          >
                            {sug.name} - {sug.formatted_address}
                          </li>
                        ))}
                      </ul>
                    )}

                </div>
              </div>
            )
          }
          {
            dropOffs.length >= 2 && (
              <div className="flex items-start gap-2 flex-wrap">
                {dropOffs.length < 5 ? (
                  <div className="w-35 shrink-0">
                    <button
                      type="button"
                      onClick={addDropOff}
                      className="btn btn-primary"
                    >
                      Add Drop Off
                    </button>
                  </div>
                ) : null}

                {dropOffs.slice(1, 2).map((val, arrayIdx) => {
                  const idx = arrayIdx + 1;
                  return (
                    <div key={idx} className="flex-1 min-w-50">
                      <label className="block text-xs font-medium text-(--dark-gray) mb-1">
                        Drop Off 2
                      </label>
                      <div
                        className={`relative flex sm:items-center gap-2 ${dropOffs.length < 4 ? "mb-4" : ""
                          }`}
                      >
                        <input
                          type="text"
                          value={val}
                          placeholder="Drop Off 2"
                          onChange={(e) =>
                            handleDropOffChange(idx, e.target.value)
                          }
                          onBlur={async () => {
                            const coords = dropoffCoords[idx] || null;

                            let finalCoords = coords;
                            if (!finalCoords && dropOffs[idx]?.trim()) {
                              try {
                                const g = await triggerGeocode(
                                  dropOffs[idx],
                                ).unwrap();
                                if (g?.location) {
                                  finalCoords = {
                                    lat: Number(g.location.lat),
                                    lng: Number(g.location.lng),
                                  };
                                  setDropoffCoords((prev) => ({
                                    ...prev,
                                    [idx]: finalCoords,
                                  }));
                                }
                              } catch { }
                            }

                            if (finalCoords) {
                              validateAllLocations(pickupCoords, {
                                ...dropoffCoords,
                                [idx]: finalCoords,
                              });
                            }
                          }}
                          className="custom_input w-full"
                        />
                        {dropOffSuggestions.length > 0 &&
                          activeDropIndex === idx && (
                            <ul className="absolute z-30 bg-(--white) border rounded shadow max-h-40 overflow-y-auto w-full top-full left-0 mt-1">
                              <li
                                onClick={async () => {
                                  const val = (dropOffs[idx] || "").trim();
                                  if (!val) return;

                                  let coords = null;
                                  try {
                                    const g =
                                      await triggerGeocode(val).unwrap();
                                    if (
                                      g?.location &&
                                      Number.isFinite(g.location.lat) &&
                                      Number.isFinite(g.location.lng)
                                    ) {
                                      coords = {
                                        lat: Number(g.location.lat),
                                        lng: Number(g.location.lng),
                                      };
                                    }
                                  } catch (err) {
                                    toast.error(err);
                                  }
                                  if (coords) {
                                    validateAllLocations(pickupCoords, {
                                      ...dropoffCoords,
                                      [idx]: coords,
                                    });
                                  }

                                  const updated = [...dropOffs];
                                  updated[idx] = val;
                                  setDropOffs(updated);

                                  setDropOffTypes((prev) => ({
                                    ...prev,
                                    [idx]: "location",
                                  }));
                                  setDropoffCoords((prev) => ({
                                    ...prev,
                                    [idx]: coords,
                                  }));
                                  setDropOffSuggestions([]);
                                }}
                                className="p-2 bg-(--lightest-blue) hover:bg-(--lighter-blue) cursor-pointer border-b text-xs"
                              >
                                ➕ Use: "{dropOffs[idx]}"
                              </li>

                              {dropOffSuggestions.map((sug, i) => (
                                <li
                                  key={i}
                                  onClick={() =>
                                    handleDropOffSelect(idx, sug)
                                  }
                                  className="p-2 text-xs hover:bg-(--lightest-gray) cursor-pointer"
                                >
                                  {sug.name} - {sug.formatted_address}
                                </li>
                              ))}
                            </ul>
                          )}

                        <button
                          type="button"
                          onClick={() => removeDropOff(idx)}
                          className="btn btn-cancel text-sm px-3 py-1 w-fit sm:w-auto"
                        >
                          &minus;
                        </button>
                      </div>
                    </div>
                  );
                })}
                {dropOffs.slice(2, 3).map((val, arrayIdx) => {
                  const idx = arrayIdx + 2;
                  return (
                    <div key={idx} className="flex-1 min-w-50">
                      <label className="block text-xs font-medium text-(--dark-gray) mb-1">
                        Drop Off 3
                      </label>
                      <div
                        className={`relative flex sm:items-center gap-2 ${dropOffs.length < 4 ? "mb-4" : ""
                          }`}
                      >
                        <input
                          type="text"
                          value={val}
                          placeholder="Drop Off 3"
                          onChange={(e) =>
                            handleDropOffChange(idx, e.target.value)
                          }
                          onBlur={async () => {
                            const coords = dropoffCoords[idx] || null;

                            let finalCoords = coords;
                            if (!finalCoords && dropOffs[idx]?.trim()) {
                              try {
                                const g = await triggerGeocode(
                                  dropOffs[idx],
                                ).unwrap();
                                if (g?.location) {
                                  finalCoords = {
                                    lat: Number(g.location.lat),
                                    lng: Number(g.location.lng),
                                  };
                                  setDropoffCoords((prev) => ({
                                    ...prev,
                                    [idx]: finalCoords,
                                  }));
                                }
                              } catch { }
                            }

                            if (finalCoords) {
                              validateAllLocations(pickupCoords, {
                                ...dropoffCoords,
                                [idx]: finalCoords,
                              });
                            }
                          }}
                          className="custom_input w-full"
                        />
                        {dropOffSuggestions.length > 0 &&
                          activeDropIndex === idx && (
                            <ul className="absolute z-30 bg-(--white) border rounded shadow max-h-40 overflow-y-auto w-full top-full left-0 mt-1">
                              <li
                                onClick={async () => {
                                  const val = (dropOffs[idx] || "").trim();
                                  if (!val) return;

                                  let coords = null;
                                  try {
                                    const g =
                                      await triggerGeocode(val).unwrap();
                                    if (
                                      g?.location &&
                                      Number.isFinite(g.location.lat) &&
                                      Number.isFinite(g.location.lng)
                                    ) {
                                      coords = {
                                        lat: Number(g.location.lat),
                                        lng: Number(g.location.lng),
                                      };
                                    }
                                  } catch (err) {
                                    toast.error(err);
                                  }

                                  if (coords) {
                                    validateAllLocations(pickupCoords, {
                                      ...dropoffCoords,
                                      [idx]: coords,
                                    });
                                  }

                                  const updated = [...dropOffs];
                                  updated[idx] = val;
                                  setDropOffs(updated);

                                  setDropOffTypes((prev) => ({
                                    ...prev,
                                    [idx]: "location",
                                  }));

                                  setDropoffCoords((prev) => ({
                                    ...prev,
                                    [idx]: coords,
                                  }));

                                  setDropOffSuggestions([]);
                                }}
                                className="p-2 bg-(--lightest-blue) hover:bg-(--lighter-blue) cursor-pointer border-b text-xs"
                              >
                                ➕ Use: "{dropOffs[idx]}"
                              </li>
                              {dropOffSuggestions.map((sug, i) => (
                                <li
                                  key={i}
                                  onClick={() =>
                                    handleDropOffSelect(idx, sug)
                                  }
                                  className="p-2 text-xs hover:bg-(--lightest-gray) cursor-pointer"
                                >
                                  {sug.name} - {sug.formatted_address}
                                </li>
                              ))}
                            </ul>
                          )}

                        <button
                          type="button"
                          onClick={() => removeDropOff(idx)}
                          className="btn btn-cancel text-sm px-3 py-1 w-fit sm:w-auto"
                        >
                          &minus;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }

          {
            dropOffs.length >= 4 && (
              <div className="flex items-start gap-2 flex-wrap">
                {dropOffs.slice(3, 5).map((val, arrayIdx) => {
                  const idx = arrayIdx + 3;
                  return (
                    <div key={idx} className="flex-1 mt-4 min-w-62.5">
                      <label className="block text-xs font-medium text-(--dark-gray) mb-1">
                        {`Drop Off ${idx + 1}`}
                      </label>
                      <div className="relative flex sm:items-center gap-2 mb-4">
                        <input
                          type="text"
                          value={val}
                          placeholder={`Drop Off ${idx + 1}`}
                          onChange={(e) =>
                            handleDropOffChange(idx, e.target.value)
                          }
                          onBlur={async () => {
                            const coords = dropoffCoords[idx] || null;

                            let finalCoords = coords;
                            if (!finalCoords && dropOffs[idx]?.trim()) {
                              try {
                                const g = await triggerGeocode(
                                  dropOffs[idx],
                                ).unwrap();
                                if (g?.location) {
                                  finalCoords = {
                                    lat: Number(g.location.lat),
                                    lng: Number(g.location.lng),
                                  };
                                  setDropoffCoords((prev) => ({
                                    ...prev,
                                    [idx]: finalCoords,
                                  }));
                                }
                              } catch { }
                            }

                            if (finalCoords) {
                              validateAllLocations(pickupCoords, {
                                ...dropoffCoords,
                                [idx]: finalCoords,
                              });
                            }
                          }}
                          className="custom_input w-full"
                        />
                        {dropOffSuggestions.length > 0 &&
                          activeDropIndex === idx && (
                            <ul className="absolute z-30 bg-(--white) border rounded shadow max-h-40 overflow-y-auto w-full top-full left-0 mt-1">
                              <li
                                onClick={async () => {
                                  if (coords) {
                                    validateAllLocations(pickupCoords, {
                                      ...dropoffCoords,
                                      [idx]: coords,
                                    });
                                  }
                                }}
                                className="p-2 bg-(--lightest-blue) hover:bg-(--lighter-blue) cursor-pointer border-b text-xs"
                              >
                                ➕ Use: "{dropOffs[idx]}"
                              </li>
                              {dropOffSuggestions.map((sug, i) => (
                                <li
                                  key={i}
                                  onClick={() =>
                                    handleDropOffSelect(idx, sug)
                                  }
                                  className="p-2 text-xs hover:bg-(--lightest-gray) cursor-pointer"
                                >
                                  {sug.name} - {sug.formatted_address}
                                </li>
                              ))}
                            </ul>
                          )}

                        <button
                          type="button"
                          onClick={() => removeDropOff(idx)}
                          className="btn btn-cancel text-sm px-3 py-1 w-fit sm:w-auto"
                        >
                          &minus;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          }
          {
            dropOffs.length === 1 && (
              <button
                type="button"
                onClick={addDropOff}
                className="btn btn-primary mb-5"
              >
                Add Drop Off
              </button>
            )
          }
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <div className="relative">
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChangeWithValidation}
                className="
            custom_input w-full 
            [&::-webkit-calendar-picker-indicator]:opacity-0 
            [&::-webkit-calendar-picker-indicator]:absolute 
            [&::-webkit-calendar-picker-indicator]:right-0 
            [&::-webkit-calendar-picker-indicator]:inset-y-0
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
            [&::-webkit-calendar-picker-indicator]:w-full"
              />

              <Icons.ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-(--dark-grey) pointer-events-none"
              />
            </div>
            <select
              name="hour"
              value={formData.hour}
              onChange={handleChangeWithValidation}
              className="custom_input"
            >
              <option value="">HH</option>
              {[...Array(24).keys()].map((h) => (
                <option key={h} value={h}>
                  {h.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
            <select
              name="minute"
              value={formData.minute}
              onChange={handleChangeWithValidation}
              className="custom_input"
            >
              <option value="">MM</option>

              {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                <option key={m} value={m.toString().padStart(2, "0")}>
                  {m.toString().padStart(2, "0")}
                </option>
              ))}
            </select>
          </div>
          <textarea
            name="notes"
            placeholder="Notes"
            className="custom_input mt-4"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
          />
          <div className="text-right mt-3">
            <button
              type="submit"
              className="btn btn-primary cursor-pointer text-sm bg-(--widgetBtnBg) px-5 py-1.5 rounded-md"
            >
              BOOK NOW
            </button>
          </div>
        </form>



        <div className="2xl:col-span-4 col-span-6">
          <LocationMap
            pickup={formData.pickup}
            dropoffs={dropOffs}
            pickupCoords={pickupCoords}
            dropoffCoords={dropoffCoords}
          />
        </div>
      </div>
    </>
  );
};

export default PrimaryForm;