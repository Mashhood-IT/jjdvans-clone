import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PrimaryForm from "./widgetcomponents/PrimaryForm";
import WidgetStepHeader from "./widgetcomponents/WidgetStepHeader";

const WidgetBooking = ({
  onSubmitSuccess,
  companyId: parentCompanyId,
  data,
}) => {
  const companyId =
    parentCompanyId ||
    new URLSearchParams(window.location.search).get("company") ||
    "";

  const [dropOffs, setDropOffs] = useState([""]);
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropOffSuggestions, setDropOffSuggestions] = useState([]);
  const [activeDropIndex, setActiveDropIndex] = useState(null);
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState({});

  const [formData, setFormData] = useState({
    pickup: "",
    bookingType: "",
    notes: "",
    internalNotes: "",
    date: "",
    hour: "",
    minute: "",
  });

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
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pickup || !dropOffs[0]?.trim()) {
      toast.error("Pickup and Drop Off are required.");
      return;
    }

    const payload = {
      ...formData,
      dropoff: dropOffs[0],
      additionalDropoff1: dropOffs[1] || null,
      additionalDropoff2: dropOffs[2] || null,
      additionalDropoff3: dropOffs[3] || null,
      additionalDropoff4: dropOffs[4] || null,
      companyId,
    };

    localStorage.setItem("bookingForm", JSON.stringify(payload));

    if (onSubmitSuccess) {
      onSubmitSuccess(payload);
    }
  };

  return (
    <>
      <PrimaryForm
        pickupCoords={pickupCoords}
        setPickupCoords={setPickupCoords}
        dropoffCoords={dropoffCoords}
        setDropoffCoords={setDropoffCoords}
        companyId={companyId}
        formData={formData}
        handleSubmit={handleSubmit}
        pickupSuggestions={pickupSuggestions}
        setPickupSuggestions={setPickupSuggestions}
        dropOffs={dropOffs}
        setDropOffs={setDropOffs}
        dropOffSuggestions={dropOffSuggestions}
        setDropOffSuggestions={setDropOffSuggestions}
        activeDropIndex={activeDropIndex}
        setActiveDropIndex={setActiveDropIndex}
        handleChange={handleChange}
        setFormData={setFormData}
      />
    </>
  );
};

export default WidgetBooking;