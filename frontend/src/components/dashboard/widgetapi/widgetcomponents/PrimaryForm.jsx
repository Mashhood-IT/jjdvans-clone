import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import SelectOption from "../../../constants/constantcomponents/SelectOption";
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
    <div className="flex items-center justify-center lg:p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-(--white) rounded-2xl shadow-lg pt-5 px-3 pb-3 border border-gray-200"
      >
        <div className="grid grid-cols-12 gap-4 items-end">
          <div className="col-span-12 md:col-span-3 relative md:border-r md:border-gray-300 md:pr-4">
            <div className="relative">
              <div className="flex items-center gap-x-1 text-gray-400">
                <Icons.Map size={15} />
                <span className="widget-label-text text-(--dark-grey)">Service Type</span>
              </div>
              <select
                name="bookingType"
                value={formData.bookingType || ""}
                onChange={handleChange}
                className="w-full pl-2 pr-4 py-3 focus:outline-none focus:border-transparent appearance-none bg-(--white) text-(--medium-grey)"
              >
                <option value="">Select service</option>
                {REMOVAL_BOOKING_TYPES.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="col-span-12 md:col-span-3 relative md:border-r md:border-gray-300 md:px-4">
            <div>
              <div className="flex items-center gap-x-1 text-gray-400">
                <Icons.MapPin size={15} />
                <span className="widget-label-text text-(--dark-grey)">Pickup Address</span>
              </div>
              <input
                type="text"
                name="pickup"
                placeholder="Enter Pickup Address"
                value={formData.pickup}
                onChange={handlePickupChange}
                className="w-full pl-2 pr-4 py-3 focus:outline-none focus:border-transparent text-(--dark-gray)"
              />
              {pickupSuggestions.length > 0 && (
                <ul className="absolute z-50 bg-(--white) border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto w-full mt-2 left-0 right-0">               <li
                  onClick={() => {
                    const val = (formData.pickup || "").trim();
                    setFormData((prev) => ({ ...prev, pickup: val }));
                    setPickupSuggestions([]);
                  }}
                  className="p-3 text-sm bg-blue-50 hover:bg-blue-100 cursor-pointer border-b transition-colors font-medium"
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
              <div className="flex items-center gap-x-1 text-gray-400">
                <Icons.MapPin size={15} />
                <span className="widget-label-text text-(--dark-grey)">Drop-off Address</span>
              </div>
              <input
                type="text"
                value={dropOffs[0]}
                placeholder="Enter Drop Off Address"
                onChange={(e) => handleDropOffChange(0, e.target.value)}
                className="w-full pl-2 pr-4 py-3 focus:outline-none focus:border-transparent text-(--dark-gray)"
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