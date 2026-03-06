import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
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
    companyId,
    pickupSuggestions,
    setPickupSuggestions,
    handlePickupSelect,
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
                    const res = await triggerGeocode({ address: formData.pickup, companyId }).unwrap();
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
                                const res = await triggerGeocode({ address: addr, companyId }).unwrap();
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

    const handlePickupChangeLocal = (e) => {
        const val = e.target.value;
        handleChange(e);

        if (!val.trim()) {
            setPickupCoords(null);
        }

        if (val.length >= 3) {
            fetchSuggestions(val, setPickupSuggestions);
        } else {
            setPickupSuggestions([]);
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
                const g = await triggerGeocode({ address: full, companyId }).unwrap();
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
                className="md:col-span-6 col-span-12 bg-linear-to-br from-(--white) via-(--lightest-gray) to-(--lighter-gray) border border-(--light-gray) rounded-2xl shadow-lg px-6 pt-3 pb-6 text-base text-(--dark-grey) transition duration-300 hover:shadow-xl"
            >
                <div>
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-(--dark-gray) mb-2">Booking Details</h2>
                            <div className="h-1 w-12 bg-(--widgetBtnBg) rounded-full"></div>
                        </div>
                        <button
                            type="button"
                            onClick={onBack}
                            className="btn btn-back"
                        >
                            ← Go Back
                        </button>
                    </div>

                    <div className="space-y-4 mb-6 transition-all duration-300">
                        <div className="flex gap-6 items-center justify-center" >
                            <div className="relative group w-full">
                                <label className="block text-xs font-medium text-(--dark-gray) mb-1">
                                    Pickup Address
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="pickup"
                                        value={formData.pickup}
                                        placeholder="Pickup Address"
                                        onChange={handlePickupChangeLocal}
                                        className="custom_input w-full"
                                    />
                                    {pickupSuggestions.length > 0 && (
                                        <ul className="absolute z-60 bg-(--white) border rounded-xl shadow-2xl max-h-40 overflow-y-auto w-full top-full left-0 mt-1">
                                            {pickupSuggestions.map((sug, i) => (
                                                <li
                                                    key={i}
                                                    onClick={() => handlePickupSelect(sug)}
                                                    className="p-2 text-xs hover:bg-(--lightest-gray) cursor-pointer border-b last:border-0"
                                                >
                                                    {sug.name} - {sug.formatted_address}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                            <div className="relative group w-full">
                                <label className="block text-xs font-medium text-(--dark-gray) mb-1">
                                    Dropoff Address
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={dropOffs[0]}
                                        placeholder="Dropoff Address"
                                        onChange={(e) => handleDropOffChange(0, e.target.value)}
                                        className="custom_input w-full"
                                    />
                                    {dropOffSuggestions.length > 0 && activeDropIndex === 0 && (
                                        <ul className="absolute z-60 bg-(--white) border rounded-xl shadow-2xl max-h-40 overflow-y-auto w-full top-full left-0 mt-1">
                                            {dropOffSuggestions.map((sug, i) => (
                                                <li
                                                    key={i}
                                                    onClick={() => handleDropOffSelect(0, sug)}
                                                    className="p-2 text-xs hover:bg-(--lightest-gray) cursor-pointer border-b last:border-0"
                                                >
                                                    {sug.name} - {sug.formatted_address}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Additional Drop Offs */}
                        {dropOffs.map((val, idx) => {
                            if (idx === 0) return null;
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
                            <label className="block text-[10px] font-medium text-(--dark-gray) tracking-wider mb-1">Date</label>
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
                            <label className="block text-[10px] font-medium text-(--dark-gray)  tracking-wider mb-1">Time</label>
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
                            <label className="block text-[10px] font-medium text-(--dark-gray) tracking-wider mb-1">Minute</label>
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

                    <div className="flex items-center pt-2">
                        <button
                            type="submit"
                            className="btn btn-primary"
                        >
                            BOOK NOW
                        </button>
                    </div>
                </div>
            </form>

            <div className="md:col-span-6 col-span-12">
                <LocationMap
                    pickup={formData.pickup}
                    dropoffs={dropOffs}
                    pickupCoords={pickupCoords}
                    dropoffCoords={dropoffCoords}
                    companyId={companyId}
                />
            </div>
        </div>
    );
};

export default SecondaryForm;