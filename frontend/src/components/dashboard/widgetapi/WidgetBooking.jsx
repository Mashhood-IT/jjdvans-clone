import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import PrimaryForm from "./widgetcomponents/PrimaryForm";

const WidgetBooking = ({
  onSubmitSuccess,
  companyId: parentCompanyId,
  isEdit: isEditProp,
  bookingId: bookingIdProp,
}) => {
  const isEdit = isEditProp || new URLSearchParams(window.location.search).get("isEdit") === "true";
  const bookingId = bookingIdProp || new URLSearchParams(window.location.search).get("bookingId") || "";
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
    date: "",
    hour: "",
    minute: "",
  });

useEffect(() => {
    const isEdit = new URLSearchParams(window.location.search).get("isEdit") === "true";
    
    if (isEdit) {
      const timer = setTimeout(() => {
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
      }, 100); 
      
      return () => clearTimeout(timer);
    }
    
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
    const requiredFields = ["bookingType", "pickup"];
    for (const field of requiredFields) {
      if (!formData[field]?.toString().trim()) {
        toast.error(`${field} is required`)
        return
      }
    }

    if (!dropOffs[0]?.trim()) {
      toast.error("Drop off is required.");
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