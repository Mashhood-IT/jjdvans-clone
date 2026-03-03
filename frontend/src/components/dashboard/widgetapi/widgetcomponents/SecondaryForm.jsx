import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Icons from "../../../../assets/icons";
import {
    useLazyGeocodeQuery,
    useLazySearchGooglePlacesQuery,
} from "../../../../redux/api/googleApi";
import LocationMap from "./LocationMap";

const SecondaryForm = ({
    formData,
    pickupCoords,
    setPickupCoords,
    dropoffCoords,
    setDropoffCoords,
    dropOffs = [],
    setDropOffs,
    setDropOffSuggestions,
    dropOffSuggestions = [],
    activeDropIndex,
    setActiveDropIndex,
    removeDropOff,
    addDropOff,
    handleChange,
    handleSubmit,
    onBack,
    setFormData,
}) => {
    const [triggerSearchAutocomplete] = useLazySearchGooglePlacesQuery();
    const [triggerGeocode] = useLazyGeocodeQuery();

    const handleChangeWithValidation = (e) => {
        handleChange(e);
    };

    useEffect(() => {
        const restoreMarkers = async () => {
            if (formData?.pickup && !pickupCoords) {
                try {
                    const res = await triggerGeocode(formData.pickup).unwrap();
                    if (res?.location) {
                        setPickupCoords({
                            lat: Number(res.location.lat),
                            lng: Number(res.location.lng),
                        });
                    }
                } catch (err) { }
            }

            if (dropOffs && dropOffs.length > 0) {
                dropOffs.forEach((addr, idx) => {
                    if (addr && !dropoffCoords[idx]) {
                        (async () => {
                            try {
                                const res = await triggerGeocode(addr).unwrap();
                                if (res?.location) {
                                    setDropoffCoords((prev) => ({
                                        ...prev,
                                        [idx]: {
                                            lat: Number(res.location.lat),
                                            lng: Number(res.location.lng),
                                        },
                                    }));
                                }
                            } catch { }
                        })();
                    }
                });
            }
        };

        restoreMarkers();
    }, [triggerGeocode, formData?.pickup, JSON.stringify(dropOffs)]);

    const fetchSuggestions = async (query, setter) => {
        if (!query) return setter([]);
        try {
            const res = await triggerSearchAutocomplete(query).unwrap();
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
            const coords = {
                lat: Number(sug.location.lat),
                lng: Number(sug.location.lng),
            };
            setDropoffCoords((prev) => ({
                ...prev,
                [idx]: coords,
            }));
        } else {
            try {
                const g = await triggerGeocode(full).unwrap();
                if (g?.location) {
                    const coords = {
                        lat: Number(g.location.lat),
                        lng: Number(g.location.lng),
                    };
                    setDropoffCoords((prev) => ({
                        ...prev,
                        [idx]: coords,
                    }));
                }
            } catch { }
        }
    };

    return (
        <div className="grid grid-cols-12 p-7 gap-6">
            <form
                onSubmit={handleSubmit}
                className="2xl:col-span-4 md:col-span-6 col-span-12 2xl:col-start-3 col-start-1 bg-linear-to-br from-(--white) via-(--lightest-gray) to-(--lighter-gray) border border-(--light-gray) rounded-2xl shadow-lg px-6 pt-3 pb-6 text-base text-(--dark-grey) transition duration-300 hover:shadow-xl"
            >
                <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-(--dark-gray) mb-2">Booking Details</h2>
                            <div className="h-1 w-12 bg-(--widgetBtnBg) rounded-full"></div>
                        </div>
                        <button
                            type="button"
                            onClick={onBack}
                            className="text-xs cursor-pointer font-semibold text-(--widgetBtnBg) hover:underline flex items-center gap-1"
                        >
                            ← Change Pickup/Initial Dropoff
                        </button>
                    </div>

                    <div className="space-y-4 mb-6">
                        {dropOffs.map((val, idx) => {
                            if (idx === 0) return null; // Step 1 handles first dropoff
                            return (
                                <div key={idx} className="relative group">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-medium text-(--dark-gray)">
                                            Additional Drop Off {idx}
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => removeDropOff(idx)}
                                            className="text-red-500 cursor-pointer hover:text-red-700 text-lg leading-none"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={val}
                                            placeholder={`Drop Off ${idx + 1}`}
                                            onChange={(e) => handleDropOffChange(idx, e.target.value)}
                                            className="custom_input w-full"
                                        />
                                        {dropOffSuggestions.length > 0 && activeDropIndex === idx && (
                                            <ul className="absolute z-60 bg-(--white) border rounded-xl shadow-2xl max-h-40 overflow-y-auto w-full top-full left-0 mt-1">
                                                {dropOffSuggestions.map((sug, i) => (
                                                    <li
                                                        key={i}
                                                        onClick={() => handleDropOffSelect(idx, sug)}
                                                        className="p-2 text-xs hover:bg-(--lightest-gray) cursor-pointer border-b last:border-0"
                                                    >
                                                        {sug.name} - {sug.formatted_address}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {dropOffs.length < 5 && (
                            <button
                                type="button"
                                onClick={addDropOff}
                                className="flex items-center cursor-pointer gap-2 text-sm font-medium text-(--widgetBtnBg) hover:brightness-110 transition-all"
                            >
                                <span className="flex items-center justify-center w-5 h-5 rounded-full border border-(--widgetBtnBg) text-xs">+</span>
                                Add Another Drop Off
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="relative">
                            <label className="block text-[10px] font-bold text-(--dark-gray) uppercase tracking-wider mb-1">Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChangeWithValidation}
                                    className="custom_input w-full pr-1 px-3 appearance-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-(--dark-gray) uppercase tracking-wider mb-1">Hour</label>
                            <select
                                name="hour"
                                value={formData.hour}
                                onChange={handleChangeWithValidation}
                                className="custom_input w-full"
                            >
                                <option value="">HH</option>
                                {[...Array(24).keys()].map((h) => (
                                    <option key={h} value={h}>
                                        {h.toString().padStart(2, "0")}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-(--dark-gray) uppercase tracking-wider mb-1">Minute</label>
                            <select
                                name="minute"
                                value={formData.minute}
                                onChange={handleChangeWithValidation}
                                className="custom_input w-full"
                            >
                                <option value="">MM</option>
                                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                                    <option key={m} value={m.toString().padStart(2, "0")}>
                                        {m.toString().padStart(2, "0")}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-medium text-(--dark-gray) mb-1">Additional Notes</label>
                        <textarea
                            name="notes"
                            placeholder="Any special instructions for the driver?"
                            className="custom_input w-full resize-none"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                        />
                    </div>

                    <div className="flex items-center justify-end pt-2">
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            BOOK NOW
                        </button>
                    </div>
                </div>
            </form>

            <div className="2xl:col-span-4 md:col-span-6 col-span-12">
                <LocationMap
                    pickup={formData.pickup}
                    dropoffs={dropOffs}
                    pickupCoords={pickupCoords}
                    dropoffCoords={dropoffCoords}
                />
            </div>
        </div>
    );
};

export default SecondaryForm;