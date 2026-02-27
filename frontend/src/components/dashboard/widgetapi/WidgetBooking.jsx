import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrimaryForm from "./widgetcomponents/PrimaryForm";

const WidgetBooking = ({
  onSubmitSuccess,
  companyId: parentCompanyId,
  data,
}) => {
  const companyId =
    parentCompanyId ||
    new URLSearchParams(window.location.search).get("company") ||
    "";

  const hourlyPackages = [];
  const generalPricing = { minAdditionalDropOff: 5 };

  const [mode, setMode] = useState("Transfer");
  const [dropOffs, setDropOffs] = useState([""]);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropOffSuggestions, setDropOffSuggestions] = useState([]);
  const [activeDropIndex, setActiveDropIndex] = useState(null);
  const [selectedHourly, setSelectedHourly] = useState("");
  const [minAdditionalDropOff, setminAdditionalDropOff] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isReady, setIsReady] = useState(true);
  const [isCoverageValid, setIsCoverageValid] = useState(true);
  const [dropoffCoords, setDropoffCoords] = useState({});

  const formattedHourlyOptions = useMemo(() => {
    return hourlyPackages.map((pkg) => ({
      label: `${pkg.distance} miles ${pkg.hours} hours`,
      value: { distance: pkg.distance, hours: pkg.hours },
    }));
  }, [hourlyPackages]);


  useEffect(() => {
    if (formattedHourlyOptions.length) {
      setSelectedHourly(formattedHourlyOptions[0]);
      setFormData((prev) => ({
        ...prev,
        hourlyOption: formattedHourlyOptions[0],
        originalHourlyOption: formattedHourlyOptions[0],
      }));
    }
  }, [formattedHourlyOptions]);

  useEffect(() => {
    if (generalPricing && generalPricing.minAdditionalDropOff) {
      setminAdditionalDropOff(generalPricing.minAdditionalDropOff);
    }
  }, [generalPricing]);

  const [formData, setFormData] = useState({
    pickup: "",
    notes: "",
    internalNotes: "",
    date: "",
    hour: "",
    minute: "",
    hourlyOption: { value: { distance: 0, hours: 0 } },
    originalHourlyOption: { value: { distance: 0, hours: 0 } },
  });

  const extractPostcode = (text) => {
    const match = text?.match(/\b[A-Z]{1,2}\d{1,2}[A-Z]?\b/i);
    return match ? match[0].toUpperCase() : null;
  };

  const isRestricted = false;

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
      }
      if (parsed.mode) setMode(parsed.mode);
      if (parsed.hourlyOption) setSelectedHourly(parsed.hourlyOption);
    }
  }, []);

  const fetchSuggestions = async (query, setter) => {
    if (!query) return setter([]);
    setter([]);
  };

  const handlePickupChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, pickup: val }));
    if (val.length >= 3) fetchSuggestions(val, setPickupSuggestions);
    else setPickupSuggestions([]);
  };

  const handlePickupSelect = (sug) => {
    const full = `${sug.name} - ${sug.formatted_address}`;
    setFormData((prev) => ({ ...prev, pickup: full }));
    setPickupSuggestions([]);
  };

  const handleDropOffChange = (idx, val) => {
    const updated = [...dropOffs];
    updated[idx] = val;
    setDropOffs(updated);
    setActiveDropIndex(idx);
    if (val.length >= 3) fetchSuggestions(val, setDropOffSuggestions);
    else setDropOffSuggestions([]);
  };

  const handleDropOffSelect = (idx, sug) => {
    const full = `${sug.name} - ${sug.formatted_address}`;
    const updated = [...dropOffs];
    updated[idx] = full;
    setDropOffs(updated);
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

    if (!isCoverageValid) {
      toast.error("One or more locations are not covered by our company.");
      return;
    }

    if (isRestricted) {
      toast.error(
        "This booking date-time is restricted. Please select another slot.",
      );
      return;
    }

    if (!formData.pickup || dropOffs[0].trim() === "") {
      toast.error("Pickup and at least one Drop Off is required.");
      return;
    }

    if (!formData.date || formData.hour === "" || formData.minute === "") {
      toast.error("Please fill in date, hour, and minute.");
      return;
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
      direction: formData.direction || "One Way",
      mode,
      returnJourney: false,
      companyId,
      referrer: document.referrer,
      pickupPostcode,
      dropoffPostcode,
      totalPrice,
    };

    localStorage.setItem("bookingForm", JSON.stringify(payload));
    toast.success("Primary journey data saved!");

    if (onSubmitSuccess) {
      onSubmitSuccess({
        ...payload,
        mode,
        dropOffPrice: totalPrice,
      });
    }
  };

  return (
    <div>


      <PrimaryForm
        dropoffCoords={dropoffCoords}
        setDropoffCoords={setDropoffCoords}
        companyId={companyId}
        formData={formData}
        handleSubmit={handleSubmit}
        handlePickupChange={handlePickupChange}
        pickupSuggestions={pickupSuggestions}
        handlePickupSelect={handlePickupSelect}
        dropOffs={dropOffs}
        setDropOffs={setDropOffs}
        dropOffSuggestions={dropOffSuggestions}
        setPickupSuggestions={setPickupSuggestions}
        setDropOffSuggestions={setDropOffSuggestions}
        activeDropIndex={activeDropIndex}
        setActiveDropIndex={setActiveDropIndex}
        handleDropOffChange={handleDropOffChange}
        handleDropOffSelect={handleDropOffSelect}
        removeDropOff={removeDropOff}
        addDropOff={addDropOff}
        handleChange={handleChange}
        setMode={setMode}
        mode={mode}
        formattedHourlyOptions={formattedHourlyOptions}
        selectedHourly={selectedHourly}
        setSelectedHourly={setSelectedHourly}
        setFormData={setFormData}
        isCoverageValid={isCoverageValid}
        setIsCoverageValid={setIsCoverageValid}
      />
    </div>
  );
};

export default WidgetBooking;