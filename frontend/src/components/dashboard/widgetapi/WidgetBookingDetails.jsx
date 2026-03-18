import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import SecondaryForm from "./widgetcomponents/SecondaryForm";
import { useGetPublicBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";

const WidgetBookingDetails = ({
    onSubmitSuccess,
    onBack,
    companyId: parentCompanyId,
    data,
    isEdit: isEditProp,
    bookingId: bookingIdProp,
}) => {
    const isEdit = isEditProp || new URLSearchParams(window.location.search).get("isEdit") === "true";
    const bookingId = bookingIdProp || new URLSearchParams(window.location.search).get("bookingId") || "";
    const companyId =
        parentCompanyId ||
        new URLSearchParams(window.location.search).get("company") ||
        "";

    const { data: settingsData } = useGetPublicBookingSettingQuery(companyId, {
        skip: !companyId
    });

    const generalPricing = { minAdditionalDropOff: 5 };

    const [dropOffs, setDropOffs] = useState([""]);
    const [dropOffSuggestions, setDropOffSuggestions] = useState([]);
    const [activeDropIndex, setActiveDropIndex] = useState(null);
    const [minAdditionalDropOff, setminAdditionalDropOff] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [pickupCoords, setPickupCoords] = useState(null);
    const [pickupSuggestions, setPickupSuggestions] = useState([]);
    const [dropoffCoords, setDropoffCoords] = useState({});

    const [formData, setFormData] = useState({
        pickup: "",
        notes: "",
        date: "",
        hour: "",
        minute: "",
    });

    const extractPostcode = (text) => {
        const match = text?.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/i);
        return match ? match[0].toUpperCase() : null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    useEffect(() => {
        const savedData = localStorage.getItem("bookingForm");
        if (savedData) {
            const parsed = JSON.parse(savedData);
            setFormData((prev) => ({
                ...prev,
                ...parsed,
            }));
            const restoredDropOffs = [
                parsed.dropoff,
                parsed.additionalDropoff1,
                parsed.additionalDropoff2,
                parsed.additionalDropoff3,
                parsed.additionalDropoff4,
            ].filter(Boolean);

            if (restoredDropOffs.length > 0) {
                setDropOffs(restoredDropOffs);
            } else {
                setDropOffs([""]);
            }
        }
    }, []);

    useEffect(() => {
        if (generalPricing && generalPricing.minAdditionalDropOff) {
            setminAdditionalDropOff(generalPricing.minAdditionalDropOff);
        }
    }, [generalPricing]);

    const handleDropOffChange = (idx, val) => {
        const updated = [...dropOffs];
        updated[idx] = val;
        setDropOffs(updated);
        setActiveDropIndex(idx);
    };

    const handleDropOffSelect = (idx, sug) => {
        const full = `${sug.name} - ${sug.formatted_address}`;
        const updated = [...dropOffs];
        updated[idx] = full;
        setDropOffs(updated);
        setDropOffSuggestions([]);
    };

    const handlePickupSelect = (sug) => {
        const full = `${sug.name} - ${sug.formatted_address}`;
        setFormData((prev) => ({
            ...prev,
            pickup: full,
        }));
        setPickupSuggestions([]);
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
        setDropOffs(updated);

        setDropoffCoords((prev) => {
            const updatedCoords = { ...prev };
            delete updatedCoords[index];
            const reindexed = {};
            Object.keys(updatedCoords).forEach((key) => {
                const numericKey = Number(key);
                const newIndex = numericKey > index ? numericKey - 1 : numericKey;
                reindexed[newIndex] = updatedCoords[key];
            });
            return reindexed;
        });
    };

    const calculateminAdditionalDropOff = () => {
        const additionalDropoffsCount = dropOffs.length - 1;
        return additionalDropoffsCount * minAdditionalDropOff;
    };

    useEffect(() => {
        const additionalDropOffPrice = calculateminAdditionalDropOff();
        setTotalPrice(additionalDropOffPrice);
    }, [dropOffs, minAdditionalDropOff]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.date === "" || formData.hour === "" || formData.minute === "") {
            toast.error("Please select a date and time.");
            return;
        }
        if (!formData.pickup || !dropOffs[0]?.trim()) {
            toast.error("Pickup and at least one Drop Off is required.");
            return;
        }

        if (settingsData?.setting?.advanceBookingMin) {
            const { value, unit } = settingsData.setting.advanceBookingMin;
            const bookingDateTime = new Date(formData.date);
            bookingDateTime.setHours(Number(formData.hour));
            bookingDateTime.setMinutes(Number(formData.minute));
            bookingDateTime.setSeconds(0);
            bookingDateTime.setMilliseconds(0);

            const now = new Date();
            const diffInMs = bookingDateTime.getTime() - now.getTime();
            const diffInMinutes = diffInMs / (1000 * 60);
            let minRequiredMinutes = value;
            if (unit === "Hours") {
                minRequiredMinutes = value * 60;
            } else if (unit === "Days") {
                minRequiredMinutes = value * 24 * 60;
            }

            if (diffInMinutes < minRequiredMinutes) {
                toast.error(`Bookings must be made at least ${value} ${unit.toLowerCase()} in advance.`);
                return;
            }
        }

        const pickupPostcode = extractPostcode(formData.pickup);
        const dropoffPostcode = extractPostcode(dropOffs[0]);

        const payload = {
            ...formData,
            dropoff: dropOffs[0],
            additionalDropoff1: dropOffs[1] || null,
            additionalDropoff2: dropOffs[2] || null,
            additionalDropoff3: dropOffs[3] || null,
            additionalDropoff4: dropOffs[4] || null,
            companyId,
            referrer: document.referrer,
            pickupPostcode,
            dropoffPostcode,
            totalPrice,
        };

        localStorage.setItem("bookingForm", JSON.stringify(payload));

        if (onSubmitSuccess) {
            onSubmitSuccess({
                ...payload,
                dropOffPrice: totalPrice,
            });
        }
    };

    return (
        <>
            <SecondaryForm
                pickupCoords={pickupCoords}
                setPickupCoords={setPickupCoords}
                dropoffCoords={dropoffCoords}
                setDropoffCoords={setDropoffCoords}
                companyId={companyId}
                formData={formData}
                handleSubmit={handleSubmit}
                dropOffs={dropOffs}
                setDropOffs={setDropOffs}
                dropOffSuggestions={dropOffSuggestions}
                setDropOffSuggestions={setDropOffSuggestions}
                activeDropIndex={activeDropIndex}
                setActiveDropIndex={setActiveDropIndex}
                handleDropOffChange={handleDropOffChange}
                handleDropOffSelect={handleDropOffSelect}
                pickupSuggestions={pickupSuggestions}
                setPickupSuggestions={setPickupSuggestions}
                handlePickupSelect={handlePickupSelect}
                removeDropOff={removeDropOff}
                addDropOff={addDropOff}
                handleChange={handleChange}
                setFormData={setFormData}
                onBack={onBack}
            />
        </>
    );
};

export default WidgetBookingDetails;