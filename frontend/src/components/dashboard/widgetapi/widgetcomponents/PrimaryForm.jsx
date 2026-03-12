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
      } catch { }
    }
  };

  return (
    <div className="flex items-center justify-center lg:p-4 w-full px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-(--white) rounded-2xl shadow-lg pt-5 px-3 pb-3 border border-gray-200 w-full max-w-6xl"
      >
        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-12 md:col-span-3 relative md:border-r md:border-gray-300 md:pr-4">
            <div
              className="relative"
              ref={serviceDropdownRef}
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
            >           <div className="flex items-center gap-x-1 text-(--black) font-bold">
                <Icons.Map size={15} />
                <span>Service Type</span>
              </div>
              <div
                className="w-full pl-2 pr-4 py-3 cursor-pointer text-(--dark-gray) bg-(--white)"
                onClick={() => {
                  setShowServiceDropdown((prev) => {
                    const next = !prev;

                    if (next) {
                      clearTimeout(serviceTimeoutRef.current);
                      serviceTimeoutRef.current = setTimeout(() => {
                        if (!isHoveringService) {
                          setShowServiceDropdown(false);
                        }
                      }, 2000);
                    }

                    return next;
                  });
                }}              >
                {formData.bookingType
                  ? REMOVAL_BOOKING_TYPES.find(opt => opt.value === formData.bookingType)?.label
                  : "Select service"}
              </div>

              {showServiceDropdown && (
                <div className="absolute z-50 w-full bg-(--white) border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {REMOVAL_BOOKING_TYPES.map(opt => (
                    <div
                      key={opt.value}
                      className="px-2.5 py-1 cursor-pointer text-(--dark-gray) hover:bg-gray-100 transition-colors"
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
          </div>
          <div className="col-span-12 md:col-span-3 relative md:border-r md:border-gray-300 md:px-4">
            <div>
              <div className="flex items-center gap-x-1 text-(--black) font-bold">
                <Icons.MapPin size={15} />
                <span>Pickup Address</span>
              </div>
              <input
                type="text"
                name="pickup"
                placeholder="Enter Pickup Address"
                value={formData.pickup}
                onChange={handlePickupChange}
                className="w-full pl-2 pr-4 py-3 focus:outline-none placeholder:text-(--dark-gray) text-(--dark-gray)"
              />
              {pickupSuggestions.length > 0 && (
                <ul className="absolute z-50 bg-(--white) border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto w-full mt-2 left-0 right-0">               <li
                  onClick={() => {
                    const val = (formData.pickup || "").trim();
                    setFormData((prev) => ({ ...prev, pickup: val }));
                    setPickupSuggestions([]);
                  }}
                  className="p-3 text-sm bg-blue-50 hover:bg-blue-100 cursor-pointer border-b transition-colors"
                >
                  ➕ Use: "{formData.pickup}"
                </li>
                  {pickupSuggestions.map((sug, idx) => (
                    <li
                      key={idx}
                      onClick={() => handlePickupSelect(sug)}
                      className="p-3 text-sm hover:bg-(--lighter-gray) cursor-pointer border-b last:border-0 transition-colors"
                    >
                      {sug.name} - {sug.formatted_address}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-span-12 md:col-span-3 relative md:pl-4">
            <div>
              <div className="flex items-center gap-x-1 text-(--black) font-bold">
                <Icons.MapPin size={15} />
                <span>Drop-off Address</span>
              </div>
              <input
                type="text"
                value={dropOffs[0]}
                placeholder="Enter Drop Off Address"
                onChange={(e) => handleDropOffChange(0, e.target.value)}
                className="w-full pl-2 pr-4 py-3 focus:outline-none placeholder:text-(--dark-gray) text-(--dark-gray)"
              />
              {dropOffSuggestions.length > 0 && activeDropIndex === 0 && (
                <ul className="absolute z-50 bg-(--white) border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto w-full mt-2">
                  <li
                    onClick={async () => {
                      const val = (dropOffs[0] || "").trim();
                      if (!val) return;
                      setDropOffs([val, ...dropOffs.slice(1)]);
                      setDropOffSuggestions([]);
                      try {
                        const g = await triggerGeocode({ address: val, companyId }).unwrap();
                        if (g?.location) {
                          setDropoffCoords(prev => ({ ...prev, 0: { lat: Number(g.location.lat), lng: Number(g.location.lng) } }));
                        }
                      } catch { }
                    }}
                    className="p-3 bg-blue-50 hover:bg-blue-100 cursor-pointer border-b text-sm transition-colors font-medium"
                  >
                    ➕ Use: "{dropOffs[0]}"
                  </li>
                  {dropOffSuggestions.map((sug, i) => (
                    <li
                      key={i}
                      onClick={() => handleDropOffSelect(0, sug)}
                      className="p-3 text-sm hover:bg-(--lighter-gray) cursor-pointer border-b last:border-0 transition-colors"
                    >
                      {sug.name} - {sug.formatted_address}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <button
              type="submit"
              className="w-full cursor-pointer bg-gray-900 hover:bg-gray-800 text-(--white) font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Check prices
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PrimaryForm;