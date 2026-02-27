import React, { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import Icons from "../../../../assets/icons";
import SelectOption from "../../../constants/constantcomponents/SelectOption";

const JourneyCard = ({
  title,
  journeyData,
  setJourneyData,
  dropOffs,
  setDropOffs,
  fare,
  isEditMode,
  pickupType,
  setPickupType,
  dropOffTypes,
  setDropOffTypes,
  userRole,
  companyId,
  coverageUnlocked,
  setCoverageUnlocked,
  isCoverageValid,
  setIsCoverageValid,
}) => {
  const inputRef = useRef(null);

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropOffSuggestions, setDropOffSuggestions] = useState([]);
  const [activeDropIndex, setActiveDropIndex] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState({});

  const triggerGeocode = null;

  useEffect(() => {
    if (!isEditMode) return;
    if (journeyData.pickup && !pickupType) {
      const lowerPickup = journeyData.pickup.toLowerCase();
      if (lowerPickup.includes("airport")) {
        setPickupType("airport");
      } else {
        setPickupType("location");
      }
    }

    dropOffs.forEach((val, idx) => {
      if (val && !dropOffTypes[idx]) {
        const lower = val.toLowerCase();
        setDropOffTypes((prev) => ({
          ...prev,
          [idx]: lower.includes("airport") ? "airport" : "location",
        }));
      }
    });
  }, [journeyData.pickup, dropOffs]);

  const checkCoverage = async () => true;

  const validateAllLocations = async () => {
    setIsCoverageValid?.(true);
  };

  const fetchSuggestions = async (query, setter) => {};

  // const handlePickupChange = (e) => {
  //   const val = e.target.value;
  //   setJourneyData({ ...journeyData, pickup: val });
  //   setIsCoverageValid?.(true);
  //   if (!val.trim()) {
  //     setPickupCoords(null);
  //   }
  //   if (val.length >= 3) fetchSuggestions(val, setPickupSuggestions);
  //   else setPickupSuggestions([]);
  // };

  const handlePickupSelect = async (sug) => {
    const full = `${sug.name} - ${sug.formatted_address}`;
    const coords = sug.location
      ? { lat: Number(sug.location.lat), lng: Number(sug.location.lng) }
      : null;

    const ok = await checkCoverage("pickup", coords, true);
    if (!ok) {
    }

    setJourneyData((prev) => ({ ...prev, pickup: full }));
    setPickupType(sug.source);
    setPickupCoords(coords);
    setPickupSuggestions([]);
    validateAllLocations(coords, dropoffCoords);
  };

  // const handleDropOffChange = (idx, val) => {
  //   const updated = [...dropOffs];
  //   updated[idx] = val;
  //   setDropOffs(updated);
  //   setActiveDropIndex(idx);
  //   setIsCoverageValid?.(true);
  //   if (!val.trim()) {
  //     setDropoffCoords((prev) => {
  //       const next = { ...prev };
  //       delete next[idx];
  //       return next;
  //     });
  //   }
  //   if (val.length >= 3) fetchSuggestions(val, setDropOffSuggestions);
  //   else setDropOffSuggestions([]);
  // };

  const handleDropOffSelect = async (idx, sug) => {
    const full = `${sug.name} - ${sug.formatted_address}`;
    const coords = sug.location
      ? { lat: Number(sug.location.lat), lng: Number(sug.location.lng) }
      : null;

    const ok = await checkCoverage("dropoff", coords, true);
    if (!ok) {
    }

    const updated = [...dropOffs];
    updated[idx] = full;
    setDropOffs(updated);
    setDropOffTypes((prev) => ({ ...prev, [idx]: sug.source }));
    setDropoffCoords((prev) => {
      const newDropCoords = { ...prev, [idx]: coords };
      validateAllLocations(pickupCoords, newDropCoords);
      return newDropCoords;
    });
    setDropOffSuggestions([]);
  };

  const addDropOff = () => {
    if (dropOffs.length >= 5) {
      toast.warning("Maximum 5 drop-offs allowed.");
      return;
    }
    setDropOffs([...dropOffs, ""]);
  };

  const removeDropOff = (index) => {
    const updated = [...dropOffs];
    updated.splice(index, 1);
    const types = { ...dropOffTypes };
    delete types[index];
    setDropOffs(updated);
    setDropOffTypes(types);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJourneyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.();
      inputRef.current.focus();
    }
  };

  return (
    <>
      <div className="w-full flex justify-center">
        <div className="w-full max-w-4xl bg-(--white) shadow-lg rounded-2xl border border-(--light-gray) overflow-hidden">
          <div className="flex justify-between items-center gap-2 px-4 py-3 bg-(--mate-color) rounded-t-xl border-b border-(--light-gray)">
            <h2 className="text-xl font-bold text-(--white) whitespace-nowrap">
              {title}:-
            </h2>
            <div className="flex flex-col items-end">
              <span className="inline-block notranslate px-4 py-1.5 text-base font-semibold text-(--white) border border-(--white) rounded-md bg-transparent">
                Fare: $
                {(() => {
                  if (fare === undefined || fare === null || fare === "") {
                    return "0.00";
                  }

                  const numFare = Number(fare);
                  if (isNaN(numFare) || !isFinite(numFare)) {
                    return "0.00";
                  }

                  return numFare.toFixed(2);
                })()}
              </span>
            </div>
          </div>
          <div className="px-4 sm:px-6 pb-6 pt-2">
            <div className="mb-4">
              <div className="flex flex-col mt-4 sm:flex-row gap-x-3 items-end">
                <div className="flex flex-col w-full">
                  <label className="text-xs font-medium text-(--dark-gray) mb-1">
                    Pick Up Date & Time
                  </label>
                  <input
                    type="date"
                    name="date"
                    ref={inputRef}
                    className="custom_input w-full"
                    value={journeyData.date?.slice(0, 10) || ""}
                    onChange={handleChange}
                    onClick={handleClick}
                  />
                </div>
                <div className="flex gap-2 w-full lg:mt-0 mt-3 sm:w-1/2">
                  <div className="flex flex-col w-36 ">
                    <SelectOption
                      label="Hour"
                      name="hour"
                      options={[...Array(24).keys()].map((h) => ({
                        value: h.toString().padStart(2, "0"),
                        label: h.toString().padStart(2, "0"),
                      }))}
                      value={
                        journeyData.hour === "" ||
                        journeyData.hour === undefined
                          ? ""
                          : journeyData.hour.toString().padStart(2, "0")
                      }
                      onChange={(e) =>
                        handleChange({
                          target: {
                            name: "hour",
                            value: e.target.value.padStart(2, "0"),
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex flex-col w-36">
                    <SelectOption
                      label="Minute"
                      name="minute"
                      options={Array.from({ length: 12 }, (_, i) => i * 5).map(
                        (m) => ({
                          value: m.toString().padStart(2, "0"),
                          label: m.toString().padStart(2, "0"),
                        }),
                      )}
                      value={
                        journeyData.minute === "" ||
                        journeyData.minute === undefined
                          ? ""
                          : journeyData.minute.toString().padStart(2, "0")
                      }
                      onChange={(e) =>
                        handleChange({
                          target: {
                            name: "minute",
                            value: e.target.value.padStart(2, "0"),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="relative mb-4">
                <label className="block text-xs mt-4 font-medium text-(--dark-gray) mb-1">
                  Pick Up
                </label>
                <input
                  type="text"
                  name="pickup"
                  placeholder="Pickup Location"
                  value={journeyData.pickup}
                  // onChange={handlePickupChange}
                  onBlur={async () => {
                    if (userRole !== "customer") return;
                    if (!journeyData.pickup?.trim()) return;

                    let coords = pickupCoords;

                    if (!coords) {
                      try {
                        const g = await triggerGeocode(
                          journeyData.pickup,
                        ).unwrap();
                        if (g?.location) {
                          coords = {
                            lat: Number(g.location.lat),
                            lng: Number(g.location.lng),
                          };
                          setPickupCoords(coords);
                        }
                      } catch {}
                    }

                    if (coords) {
                      validateAllLocations(coords, dropoffCoords);
                    }
                  }}
                  className="custom_input w-full"
                />

                {pickupSuggestions.length > 0 && (
                  <ul className="absolute z-20 bg-(--white) border rounded shadow max-h-40 overflow-y-auto w-full">
                    <li
                      onClick={async () => {
                        const val = (journeyData.pickup || "").trim();
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
                          validateAllLocations(coords, dropoffCoords);
                        }

                        setJourneyData((prev) => ({ ...prev, pickup: val }));
                        if (val.toLowerCase().includes("airport")) {
                          setPickupType("airport");
                        } else {
                          setPickupType("location");
                        }
                        setPickupCoords(coords);
                        setPickupSuggestions([]);
                      }}
                      className="p-2 text-xs sm:text-sm bg-(--lightest-blue) hover:bg-(--lighter-blue) cursor-pointer border-b"
                    >
                      ➕ Use: "{journeyData.pickup}"
                    </li>

                    {pickupSuggestions.map((sug, idx) => (
                      <li
                        key={idx}
                        onClick={() => handlePickupSelect(sug)}
                        className="p-2 text-xs sm:text-sm hover:bg-(--lightest-gray) cursor-pointer"
                      >
                        {sug.name} - {sug.formatted_address}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {pickupType?.toLowerCase()?.includes("location") && (
                <input
                  name="pickupDoorNumber"
                  placeholder="Pickup Door No."
                  className="custom_input mb-4 w-full"
                  value={journeyData.pickupDoorNumber || ""}
                  onChange={handleChange}
                />
              )}
              {pickupType?.toLowerCase().includes("airport") && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <input
                    name="flightNumber"
                    placeholder="Flight No."
                    value={journeyData.flightNumber || ""}
                    onChange={handleChange}
                    className="custom_input"
                  />
                  {/* Arriving From with Arrow Icon */}
                  {journeyData.arrivefrom?.includes("|") ? (
                    <div className="flex items-center gap-2 border rounded px-3 py-2 bg-white custom_input">
                      <span className="font-medium text-gray-700">
                        {journeyData.arrivefrom.split("|")[0]}
                      </span>
                      <Icons.ArrowRight
                        size={18}
                        className="text-blue-600 shrink-0"
                      />
                      <span className="font-medium text-gray-700">
                        {journeyData.arrivefrom.split("|")[1]}
                      </span>
                    </div>
                  ) : (
                    <input
                      name="arrivefrom"
                      placeholder="Arriving From"
                      value={journeyData.arrivefrom || ""}
                      onChange={handleChange}
                      className="custom_input"
                    />
                  )}
                  <input
                    name="pickmeAfter"
                    placeholder="Pick Me After"
                    value={journeyData.pickmeAfter || ""}
                    onChange={handleChange}
                    className="custom_input"
                  />
                </div>
              )}
              <div className="space-y-4">
                {dropOffs.length >= 1 && (
                  <div>
                    <label className="block text-xs font-medium text-(--dark-gray) mb-1">
                      Drop Off 1
                    </label>
                    <div className="relative flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                      <input
                        type="text"
                        value={dropOffs[0]}
                        placeholder="Drop Off 1"
                        // onChange={(e) => handleDropOffChange(0, e.target.value)}
                        onBlur={async () => {
                          if (userRole !== "customer") return;
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
                            } catch {}
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
                      {dropOffTypes[0]?.toLowerCase()?.includes("airport") && (
                        <input
                          name="dropoff_terminal_0"
                          value={journeyData["dropoff_terminal_0"] || ""}
                          placeholder="Terminal No."
                          className="custom_input w-full"
                          onChange={handleChange}
                        />
                      )}
                      {dropOffTypes[0]?.toLowerCase()?.includes("location") && (
                        <input
                          name="dropoffDoorNumber0"
                          value={journeyData["dropoffDoorNumber0"] || ""}
                          placeholder="Drop Off Door No."
                          className="custom_input w-full"
                          onChange={handleChange}
                        />
                      )}
                    </div>
                  </div>
                )}
                {dropOffs.length >= 2 && (
                  <div className="flex items-start gap-2 flex-wrap">
                    {dropOffs.length < 5 ? (
                      <div className="w-35 shrink-0">
                        <button
                          type="button"
                          onClick={addDropOff}
                          className="btn btn-back w-full mt-6"
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
                            className={`relative flex sm:items-center gap-2 ${
                              dropOffs.length < 4 ? "mb-4" : ""
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
                                if (userRole !== "customer") return;
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
                                  } catch {}
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
                            {dropOffTypes[idx]
                              ?.toLowerCase()
                              ?.includes("airport") && (
                              <input
                                name={`dropoff_terminal_${idx}`}
                                value={
                                  journeyData[`dropoff_terminal_${idx}`] || ""
                                }
                                placeholder="Terminal No."
                                className="custom_input w-full"
                                onChange={handleChange}
                              />
                            )}
                            {dropOffTypes[idx]
                              ?.toLowerCase()
                              ?.includes("location") && (
                              <input
                                name={`dropoffDoorNumber${idx}`}
                                value={
                                  journeyData[`dropoffDoorNumber${idx}`] || ""
                                }
                                placeholder="Drop Off Door No."
                                className="custom_input w-full"
                                onChange={handleChange}
                              />
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
                            className={`relative flex sm:items-center gap-2 ${
                              dropOffs.length < 4 ? "mb-4" : ""
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
                                if (userRole !== "customer") return;
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
                                  } catch {}
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
                            {dropOffTypes[idx]
                              ?.toLowerCase()
                              ?.includes("airport") && (
                              <input
                                name={`dropoff_terminal_${idx}`}
                                value={
                                  journeyData[`dropoff_terminal_${idx}`] || ""
                                }
                                placeholder="Terminal No."
                                className="custom_input w-full"
                                onChange={handleChange}
                              />
                            )}
                            {dropOffTypes[idx]
                              ?.toLowerCase()
                              ?.includes("location") && (
                              <input
                                name={`dropoffDoorNumber${idx}`}
                                value={
                                  journeyData[`dropoffDoorNumber${idx}`] || ""
                                }
                                placeholder="Drop Off Door No."
                                className="custom_input w-full"
                                onChange={handleChange}
                              />
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
                )}

                {dropOffs.length >= 4 && (
                  <div className="flex items-start gap-2 flex-wrap">
                    {dropOffs.slice(3, 5).map((val, arrayIdx) => {
                      const idx = arrayIdx + 3;
                      return (
                        <div key={idx} className="flex-1 min-w-62.5">
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
                                if (userRole !== "customer") return;
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
                                  } catch {}
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
                            {dropOffTypes[idx]
                              ?.toLowerCase()
                              ?.includes("airport") && (
                              <input
                                name={`dropoff_terminal_${idx}`}
                                value={
                                  journeyData[`dropoff_terminal_${idx}`] || ""
                                }
                                placeholder="Terminal No."
                                className="custom_input w-full"
                                onChange={handleChange}
                              />
                            )}
                            {dropOffTypes[idx]
                              ?.toLowerCase()
                              ?.includes("location") && (
                              <input
                                name={`dropoffDoorNumber${idx}`}
                                value={
                                  journeyData[`dropoffDoorNumber${idx}`] || ""
                                }
                                placeholder="Drop Off Door No."
                                className="custom_input w-full"
                                onChange={handleChange}
                              />
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
                )}
                {dropOffs.length === 1 && (
                  <button
                    type="button"
                    onClick={addDropOff}
                    className="btn btn-back mb-5"
                  >
                    + Add Drop Off
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <textarea
                  name="notes"
                  placeholder="Notes"
                  rows="2"
                  className="custom_input my-2 w-full"
                  value={journeyData.notes}
                  onChange={handleChange}
                />
                <textarea
                  name="internalNotes"
                  placeholder="Internal Notes"
                  rows="2"
                  className="custom_input w-full"
                  value={journeyData.internalNotes}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JourneyCard;