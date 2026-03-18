import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  useLazyGeocodeQuery,
  useLazySearchGooglePlacesQuery,
} from "../../../../redux/api/googleApi";
import Icons from "../../../../assets/icons";

const PrimaryForm = ({
  formData,
  setPickupCoords,
  setDropoffCoords,
  pickupSuggestions = [],
  dropOffs = [],
  setDropOffs,
  setPickupSuggestions,
  setDropOffSuggestions,
  dropOffSuggestions = [],
  activeDropIndex,
  setActiveDropIndex,
  handleChange,
  handleSubmit,
  setFormData,
  companyId,
}) => {

  const serviceDropdownRef = useRef(null);
  const serviceTimeoutRef = useRef(null);
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [isHoveringService, setIsHoveringService] = useState(false);

  const [triggerSearchAutocomplete] = useLazySearchGooglePlacesQuery();
  const [triggerGeocode] = useLazyGeocodeQuery();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target)) {
        setShowServiceDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const REMOVAL_BOOKING_TYPES = [
    { label: "House Removals", value: "House Removals" },
    { label: "Furniture & General Items", value: "Furniture & General Items" },
    { label: "Moving Flat or Apartment", value: "Moving Flat or Apartment" },
    { label: "Office Moves", value: "Office Moves" },
    { label: "Piano or Electronic Equipment", value: "Piano or Electronic Equipment" },
    { label: "Same-Day Delivery", value: "Same-Day Delivery" },
    { label: "Pickup from Store", value: "Pickup from Store" },
  ];

  const fetchSuggestions = async (query, setter) => {
    if (!query) return setter([]);
    try {
      const res = await triggerSearchAutocomplete({ input: query, companyId }).unwrap();
      const results = res.predictions.map((r) => ({
        place_id: r.place_id,
        name: r.name || r.structured_formatting?.main_text,
        formatted_address: r.formatted_address || r.description,
        source: r.source || (r.types?.includes("airport") ? "airport" : "location"),
        location: r.location || null,
      }));
      setter(results);
    } catch (err) {
      toast.error("Error fetching suggestions");
    }
  };

  const handlePickupChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, pickup: val });
    if (!val.trim()) setPickupCoords(null);
    if (val.length >= 3) fetchSuggestions(val, setPickupSuggestions);
    else setPickupSuggestions([]);
  };

  const handlePickupSelect = async (sug) => {
    const full = `${sug.name} - ${sug.formatted_address}`;
    setFormData((prev) => ({ ...prev, pickup: full }));
    setPickupSuggestions([]);

    if (sug.location) {
      setPickupCoords({
        lat: Number(sug.location.lat),
        lng: Number(sug.location.lng),
      });
    } else {
      try {
        const g = await triggerGeocode({ address: full, companyId }).unwrap();
        if (g?.location) {
          setPickupCoords({
            lat: Number(g.location.lat),
            lng: Number(g.location.lng),
          });
        }
      } catch (err) {
        toast.error("Error fetching pickup suggestions", err);

      }
    }
  };

  const handleDropOffChange = (idx, val) => {
    const updated = [...dropOffs];
    updated[idx] = val;
    setDropOffs(updated);
    setActiveDropIndex(idx);

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
      setDropoffCoords((prev) => ({
        ...prev,
        [idx]: { lat: Number(sug.location.lat), lng: Number(sug.location.lng) },
      }));
    } else {
      try {
        const g = await triggerGeocode({ address: full, companyId }).unwrap();
        if (g?.location) {
          setDropoffCoords((prev) => ({
            ...prev,
            [idx]: { lat: Number(g.location.lat), lng: Number(g.location.lng) },
          }));
        }
      } catch (err) {
        toast.error("Error fetching dropoff suggestions", err);

      }
    }
  };

  return (
    <div className="grid grid-cols-12 px-4 pt-12 lg:px-6">
      <form
        onSubmit={handleSubmit}
        className="col-span-12 lg:col-span-8 lg:col-start-3 bg-(--white) rounded-xl shadow-md border border-gray-200 overflow-visible"
      >
        <div className="bg-gray-900 rounded-t-xl px-5 py-3">
          <h2 className="text-white text-sm font-semibold tracking-wide uppercase">
            Journey Details
          </h2>
        </div>

        <div className=" lg:grid-cols-12 lg:col-start-1 gap-0">

          <div className="col-span-12 md:col-span-6 lg:col-span-6 lg:col-start-4 px-5 py-2.5
           relative" ref={serviceDropdownRef}
            onMouseEnter={() => {
              setIsHoveringService(true);
              clearTimeout(serviceTimeoutRef.current);
            }}
            onMouseLeave={() => {
              setIsHoveringService(false);
              serviceTimeoutRef.current = setTimeout(() => {
                setShowServiceDropdown(false);
              }, 2000);
            }}
          >
            <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 tracking-wide mb-1.5 mt-4">
              <Icons.Map size={17} />
              Service Type
            </label>

            <div
              className="custom_input flex items-center justify-between cursor-pointer bg-(--white)"
              onClick={() => {
                setShowServiceDropdown((prev) => {
                  const next = !prev;
                  if (next) {
                    clearTimeout(serviceTimeoutRef.current);
                    serviceTimeoutRef.current = setTimeout(() => {
                      if (!isHoveringService) setShowServiceDropdown(false);
                    }, 2000);
                  }
                  return next;
                });
              }}
            >
              <span className={`text-sm ${!formData.bookingType ? "text-gray-500" : "text-(--dark-black)"}`}>
                {formData.bookingType
                  ? REMOVAL_BOOKING_TYPES.find((opt) => opt.value === formData.bookingType)?.label
                  : "Select service…"}
              </span>
              <Icons.ChevronDown size={13} />
            </div>

            {showServiceDropdown && (
              <div className="absolute z-50 left-5 right-5 top-full -mt-2 bg-(--white) border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {REMOVAL_BOOKING_TYPES.map((opt) => (
                  <div
                    key={opt.value}
                    className={`px-3 py-2 cursor-pointer text-sm text-(--dark-gray) hover:bg-gray-50 transition-colors ${formData.bookingType === opt.value ? "bg-blue-50 font-medium" : ""}`}
                    onClick={() => {
                      handleChange({ target: { name: "bookingType", value: opt.value } });
                      setShowServiceDropdown(false);
                    }}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-6 lg:col-start-4 px-5 py-2.5 relative">
            <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 tracking-wide mb-1.5 mt-2">
              <Icons.MapPin size={17} />
              Pickup Address
            </label>
            <input
              type="text"
              name="pickup"
              placeholder="Enter pickup address"
              value={formData.pickup}
              onChange={handlePickupChange}
              className="custom_input text-sm"
            />
            {pickupSuggestions.length > 0 && (
              <ul className="absolute z-50 bg-(--white) border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto w-[calc(100%-2.5rem)] mt-1 left-5">
                <li
                  onClick={() => {
                    const val = (formData.pickup || "").trim();
                    setFormData((prev) => ({ ...prev, pickup: val }));
                    setPickupSuggestions([]);
                  }}
                  className="p-2 border-(--medium-grey) text-sm bg-blue-50 hover:bg-blue-100 cursor-pointer border-b transition-colors font-medium"
                >
                  ➕ Use: "{formData.pickup}"
                </li>
                {pickupSuggestions.map((sug, idx) => (
                  <li
                    key={idx}
                    onClick={() => handlePickupSelect(sug)}
                    className="p-2 border-(--medium-grey) text-sm hover:bg-(--lighter-gray) cursor-pointer border-b last:border-0 transition-colors"
                  >
                    {sug.name} – {sug.formatted_address}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-span-12 md:col-span-6 lg:col-span-6 lg:col-start-4 px-5 py-2.5 relative">
            <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 tracking-wide mb-1.5 mt-2">
              <Icons.MapPin size={17} />
              Drop-off Address
            </label>
            <input
              type="text"
              value={dropOffs[0]}
              placeholder="Enter drop-off address"
              onChange={(e) => handleDropOffChange(0, e.target.value)}
              className="custom_input text-sm"
            />
            {dropOffSuggestions.length > 0 && activeDropIndex === 0 && (
              <ul className="absolute z-50 bg-(--white) border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto w-[calc(100%-2.5rem)] mt-1 left-5">
                <li
                  onClick={async () => {
                    const val = (dropOffs[0] || "").trim();
                    if (!val) return;
                    setDropOffs([val, ...dropOffs.slice(1)]);
                    setDropOffSuggestions([]);
                    try {
                      const g = await triggerGeocode({ address: val, companyId }).unwrap();
                      if (g?.location) {
                        setDropoffCoords((prev) => ({
                          ...prev,
                          0: { lat: Number(g.location.lat), lng: Number(g.location.lng) },
                        }));
                      }
                    } catch { }
                  }}
                  className="p-2 bg-blue-50 hover:bg-blue-100 cursor-pointer border-b border-(--medium-grey) text-sm transition-colors font-medium"
                >
                  ➕ Use: "{dropOffs[0]}"
                </li>
                {dropOffSuggestions.map((sug, i) => (
                  <li
                    key={i}
                    onClick={() => handleDropOffSelect(0, sug)}
                    className="p-2 text-sm hover:bg-(--lighter-gray) cursor-pointer border-b border-(--medium-grey) last:border-0 transition-colors"
                  >
                    {sug.name} – {sug.formatted_address}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="px-5 py-2.5 flex items-center lg:justify-end mb-4">
            <button
              type="submit"
              className="btn btn-blue w-full lg:w-auto"
            >
              Get Free Quote
            </button>
          </div>

        </div>
      </form>
    </div>
  );

};

export default PrimaryForm;