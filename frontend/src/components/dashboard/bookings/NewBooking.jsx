import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

// import FareSection from "./createBooking/FareSection";
import JourneyCard from "./createBooking/JourneyCard";
import PassengerDetails from "./createBooking/PassengerDetails";

import "react-toastify/dist/ReactToastify.css";
import VehicleSelection from "./createBooking/VehicleSelection";
import OutletHeading from "../../constants/constantcomponents/OutletHeading";

const NewBooking = ({ editBookingData = null, onClose, copyMode }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const userRole = user?.role || "";

  const isEditing = !!editBookingData?._id && !editBookingData?.__copyMode;
  const [mode, setMode] = useState("Transfer");
  const [selectedHourly, setSelectedHourly] = useState(null);
  const [hasChangedPrimaryLocations, setHasChangedPrimaryLocations] =
    useState(false);
  const [hasChangedReturnLocations, setHasChangedReturnLocations] =
    useState(false);

  const [originalPrimaryLocations, setOriginalPrimaryLocations] =
    useState(null);
  const [originalReturnLocations, setOriginalReturnLocations] = useState(null);
  const [emailNotify, setEmailNotify] = useState({
    admin: false,
    customer: false,
  });
  const [coverageUnlocked, setCoverageUnlocked] = useState(false);
  const [isFareManuallyEdited, setIsFareManuallyEdited] = useState({
    journey: false,
    return: false,
  });
  const [isCoverageValid, setIsCoverageValid] = useState(true);
  const [isCoverageValidReturn, setIsCoverageValidReturn] = useState(true);
  const [returnJourneyToggle, setreturnJourneyToggle] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleExtras, setVehicleExtras] = useState({
    passenger: 0,
    childSeat: 0,
    babySeat: 0,
    carSeat: 0,
    boosterSeat: 0,
    handLuggage: 0,
    checkinLuggage: 0,
  });
  const [passengerDetails, setPassengerDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [primaryJourneyData, setPrimaryJourneyData] = useState({
    pickup: "",
    date: "",
    hour: "",
    minute: "",
  });
  const [returnJourneyData, setReturnJourneyData] = useState({
    pickup: "",
    date: "",
    hour: "",
    minute: "",
  });
  const [dropOffs1, setDropOffs1] = useState([""]);
  const [dropOffs2, setDropOffs2] = useState([""]);
  const [pickupType1, setPickupType1] = useState(null);
  const [pickupType2, setPickupType2] = useState(null);
  const [dropOffTypes1, setDropOffTypes1] = useState({});
  const [dropOffTypes2, setDropOffTypes2] = useState({});
  const [localEditData, setLocalEditData] = useState(null);

  const TABS = ["Transfer"];

  const primaryFare = 0;
  const primaryFareMode = "mileage";
  const hourlyError = "";
  const primaryDistanceText = "";
  const primaryDurationText = "";

  const returnFare = 0;
  const returnFareMode = "mileage";
  const returnDistanceText = "";
  const returnDurationText = "";

  const [fareDetails, setFareDetails] = useState({
    paymentMethod: "",
    cardPaymentReference: "",
    paymentGateway: "",
    journeyFare: "",
    driverFare: "",
    returnJourneyFare: "",
    returnDriverFare: "",
    emailNotifications: { admin: false, customer: false },
    appNotifications: { customer: false },
  });

  const checkPrimaryLocationsChanged = () => {
    if (!originalPrimaryLocations) return false;

    return (
      originalPrimaryLocations.pickup !== primaryJourneyData.pickup ||
      JSON.stringify(originalPrimaryLocations.dropOffs) !==
        JSON.stringify(dropOffs1)
    );
  };

  const checkReturnLocationsChanged = () => {
    if (!originalReturnLocations) return false;

    return (
      originalReturnLocations.pickup !== returnJourneyData.pickup ||
      JSON.stringify(originalReturnLocations.dropOffs) !==
        JSON.stringify(dropOffs2)
    );
  };

  // useEffect(() => {
  //   if (customerByVat?.paymentOptionsInvoice) {
  //     setFareDetails((prevDetails) => ({
  //       ...prevDetails,
  //       paymentMethod: customerByVat.paymentOptionsInvoice,
  //     }));
  //   }
  // }, [customerByVat]);

  useEffect(() => {
    if (originalPrimaryLocations) {
      const hasChanged = checkPrimaryLocationsChanged();
      setHasChangedPrimaryLocations(hasChanged);
      if (hasChanged) {
        setIsFareManuallyEdited((prev) => ({ ...prev, journey: false }));
      }
    }
  }, [primaryJourneyData.pickup, dropOffs1]);

  useEffect(() => {
    if ((returnJourneyData.pickup, dropOffs2)) {
      const hasChanged = checkReturnLocationsChanged();
      setHasChangedReturnLocations(hasChanged);
      if (hasChanged) {
        setIsFareManuallyEdited((prev) => ({ ...prev, return: false }));
      }
    }
  }, [returnJourneyData.pickup, dropOffs2]);

  useEffect(() => {
    setIsFareManuallyEdited({ journey: false, return: false });
  }, [selectedVehicle, mode, selectedHourly]);

  useEffect(() => {
    const hasPrimaryPickup = !!primaryJourneyData.pickup?.trim();
    const hasPrimaryDropoff = dropOffs1.some((d) => d?.trim());
    const hasReturnPickup =
      returnJourneyToggle && !!returnJourneyData.pickup?.trim();
    const hasReturnDropoff =
      returnJourneyToggle && dropOffs2.some((d) => d?.trim());

    if (
      !hasPrimaryPickup &&
      !hasPrimaryDropoff &&
      !hasReturnPickup &&
      !hasReturnDropoff
    ) {
      setCoverageUnlocked(false);
    }
  }, [
    primaryJourneyData.pickup,
    dropOffs1,
    returnJourneyData.pickup,
    dropOffs2,
    returnJourneyToggle,
  ]);

  useEffect(() => {
    if (!editBookingData) return;

    const cloned = JSON.parse(JSON.stringify(editBookingData));
    setLocalEditData(cloned);

    const isReturnJourneyEdit = cloned.__editReturn || cloned.__copyReturn;
    setreturnJourneyToggle(isReturnJourneyEdit);

    const journeyData = isReturnJourneyEdit
      ? cloned.returnJourney || {}
      : cloned.primaryJourney || {};

    const dropOffList = [
      journeyData.dropoff || "",
      journeyData.additionalDropoff1 || "",
      journeyData.additionalDropoff2 || "",
      journeyData.additionalDropoff3 || "",
      journeyData.additionalDropoff4 || "",
    ].filter(Boolean);

    const dynamicDropFields = Object.fromEntries(
      dropOffList.map((_, idx) => [
        `dropoffDoorNumber${idx}`,
        journeyData[`dropoffDoorNumber${idx}`] || "",
      ]),
    );

    const dynamicTerminalFields = Object.fromEntries(
      dropOffList.map((_, idx) => [
        `dropoff_terminal_${idx}`,
        journeyData[`dropoff_terminal_${idx}`] || "",
      ]),
    );

    const journeyState = {
      pickup: journeyData.pickup || "",
      dropoff: journeyData.dropoff || "",
      date: journeyData.date?.slice(0, 10) || "",
      hour: journeyData.hour?.toString().padStart(2, "0") || "",
      minute: journeyData.minute?.toString().padStart(2, "0") || "",
      notes: journeyData.notes || "",
      internalNotes: journeyData.internalNotes || "",
      arrivefrom: journeyData.arrivefrom || "",
      flightNumber: journeyData.flightNumber || "",
      pickmeAfter: journeyData.pickmeAfter || "",
      fare: journeyData.fare || "",
      pickupDoorNumber: journeyData.pickupDoorNumber || "",
      terminal: journeyData.terminal || "",
      distanceText: journeyData.distanceText || "",
      durationText: journeyData.durationText || "",
      flightArrival: journeyData.flightArrival
        ? {
            scheduled: journeyData.flightArrival.scheduled || null,
            estimated: journeyData.flightArrival.estimated || null,
          }
        : null,
      flightOrigin: journeyData.flightOrigin || "",
      flightDestination: journeyData.flightDestination || "",
      ...dynamicDropFields,
      ...dynamicTerminalFields,
    };

    if (isReturnJourneyEdit) {
      setReturnJourneyData(journeyState);
      setDropOffs2(dropOffList);
      setOriginalReturnLocations({
        pickup: journeyState.pickup,
        dropOffs: [...dropOffList],
      });
    } else {
      setPrimaryJourneyData(journeyState);
      setDropOffs1(dropOffList);
      setOriginalPrimaryLocations({
        pickup: journeyState.pickup,
        dropOffs: [...dropOffList],
      });
    }

    if (cloned.returnJourney && !isReturnJourneyEdit) {
      const returnDropOffList = [
        cloned.returnJourney.dropoff || "",
        cloned.returnJourney.additionalDropoff1 || "",
        cloned.returnJourney.additionalDropoff2 || "",
        cloned.returnJourney.additionalDropoff3 || "",
        cloned.returnJourney.additionalDropoff4 || "",
      ].filter(Boolean);

      const dynamicDropFieldsReturn = Object.fromEntries(
        returnDropOffList.map((_, idx) => [
          `dropoffDoorNumber${idx}`,
          cloned.returnJourney[`dropoffDoorNumber${idx}`] || "",
        ]),
      );

      const dynamicTerminalFieldsReturn = Object.fromEntries(
        returnDropOffList.map((_, idx) => [
          `dropoff_terminal_${idx}`,
          cloned.returnJourney[`dropoff_terminal_${idx}`] || "",
        ]),
      );

      const returnJourneyState = {
        pickup: cloned.returnJourney.pickup || "",
        dropoff: cloned.returnJourney.dropoff || "",
        date: cloned.returnJourney.date?.slice(0, 10) || "",
        hour: cloned.returnJourney.hour?.toString().padStart(2, "0") || "",
        minute: cloned.returnJourney.minute?.toString().padStart(2, "0") || "",
        notes: cloned.returnJourney.notes || "",
        internalNotes: cloned.returnJourney.internalNotes || "",
        arrivefrom: cloned.returnJourney.arrivefrom || "",
        flightNumber: cloned.returnJourney.flightNumber || "",
        pickmeAfter: cloned.returnJourney.pickmeAfter || "",
        fare: cloned.returnJourney.fare || "",
        pickupDoorNumber: cloned.returnJourney.pickupDoorNumber || "",
        terminal: cloned.returnJourney.terminal || "",
        distanceText: cloned.returnJourney.distanceText || "",
        durationText: cloned.returnJourney.durationText || "",
        flightArrival: cloned.returnJourney.flightArrival
          ? {
              scheduled: cloned.returnJourney.flightArrival.scheduled || null,
              estimated: cloned.returnJourney.flightArrival.estimated || null,
            }
          : null,
        flightOrigin: cloned.returnJourney.flightOrigin || "",
        flightDestination: cloned.returnJourney.flightDestination || "",
        ...dynamicDropFieldsReturn,
        ...dynamicTerminalFieldsReturn,
      };

      setReturnJourneyData(returnJourneyState);
      setDropOffs2(returnDropOffList);
      setOriginalReturnLocations({
        pickup: returnJourneyState.pickup,
        dropOffs: [...returnDropOffList],
      });
    }

    setPassengerDetails({
      name: cloned.passenger?.name || "",
      email: cloned.passenger?.email || "",
      phone: cloned.passenger?.phone || "",
    });

    setSelectedVehicle(cloned.vehicle || null);

    setVehicleExtras({
      passenger: cloned.vehicle?.passenger || 0,
      childSeat: cloned.vehicle?.childSeat || 0,
      babySeat: cloned.vehicle?.babySeat || 0,
      carSeat: cloned.vehicle?.carSeat || 0,
      boosterSeat: cloned.vehicle?.boosterSeat || 0,
      handLuggage: cloned.vehicle?.handLuggage || 0,
      checkinLuggage: cloned.vehicle?.checkinLuggage || 0,
    });

    setFareDetails((prev) => ({
      ...prev,
      paymentMethod: cloned.paymentMethod || "",
      cardPaymentReference: cloned.cardPaymentReference || "",
      paymentGateway: cloned.paymentGateway || "",
      journeyFare: cloned.journeyFare ?? "",
      driverFare: cloned.driverFare || 0,
      returnJourneyFare: cloned.returnJourneyFare,
      returnDriverFare: cloned.returnDriverFare || 0,
      emailNotifications: {
        admin: cloned?.emailNotifications?.admin || false,
        customer: cloned?.emailNotifications?.customer || false,
      },
      appNotifications: {
        customer: cloned?.appNotifications?.customer || false,
      },
    }));

    if (cloned.mode) setMode(cloned.mode);
  }, [editBookingData]);

  const handlePrimaryJourneyDataChange = (newData) => {
    setPrimaryJourneyData(newData);
  };

  const handleReturnJourneyDataChange = (newData) => {
    setReturnJourneyData(newData);
  };

  const handleDropOffs1Change = (newDropOffs) => {
    setDropOffs1(newDropOffs);
  };

  const handleDropOffs2Change = (newDropOffs) => {
    setDropOffs2(newDropOffs);
  };

  const getDisplayPrimaryFare = () => {
    if (isFareManuallyEdited.journey) {
      return parseFloat(fareDetails.journeyFare) || 0;
    }

    if (
      isEditing &&
      !hasChangedPrimaryLocations &&
      selectedVehicle?.vehicleName === editBookingData?.vehicle?.vehicleName
    ) {
      return parseFloat(fareDetails.journeyFare) || 0;
    }

    return Number(primaryFare || fareDetails.journeyFare || 0);
  };

  const getDisplayReturnFare = () => {
    if (!returnJourneyToggle) return 0;

    if (isFareManuallyEdited.return) {
      return parseFloat(fareDetails.returnJourneyFare) || 0;
    }

    if (
      isEditing &&
      !hasChangedReturnLocations &&
      selectedVehicle?.vehicleName === editBookingData?.vehicle?.vehicleName
    ) {
      return parseFloat(fareDetails.returnJourneyFare) || 0;
    }

    return Number(returnFare || fareDetails.returnJourneyFare || 0);
  };

  const finalPrimaryFare = getDisplayPrimaryFare();
  const finalReturnFare = getDisplayReturnFare();

  const validateReturnJourneyTime = (primaryJourney, returnJourney) => {
    if (!primaryJourney.date || !returnJourney.date) return true;
    if (primaryJourney.hour === "" || primaryJourney.minute === "") return true;
    if (returnJourney.hour === "" || returnJourney.minute === "") return true;

    const primaryDateTime = new Date(
      `${primaryJourney.date}T${String(primaryJourney.hour).padStart(
        2,
        "0",
      )}:${String(primaryJourney.minute).padStart(2, "0")}:00`,
    );

    const returnDateTime = new Date(
      `${returnJourney.date}T${String(returnJourney.hour).padStart(
        2,
        "0",
      )}:${String(returnJourney.minute).padStart(2, "0")}:00`,
    );

    if (returnDateTime <= primaryDateTime) {
      toast.error(
        "Return journey must be scheduled after the primary journey!",
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (!isCoverageValid || (returnJourneyToggle && !isCoverageValidReturn)) {
    //   toast.error("One or more locations are not covered by our company.");
    //   return;
    // }

    // if (userRole === "customer") {
    //   // Only enforce booking restriction if date + hour + minute are provided (avoid blocking when time is not yet selected)
    //   const primaryHasDateTime =
    //     primaryJourneyData?.date &&
    //     primaryJourneyData.hour !== undefined &&
    //     primaryJourneyData.hour !== null &&
    //     String(primaryJourneyData.hour) !== "" &&
    //     primaryJourneyData.minute !== undefined &&
    //     primaryJourneyData.minute !== null &&
    //     String(primaryJourneyData.minute) !== "";

    //   if (returnJourneyToggle) {
    //     const returnHasDateTime =
    //       returnJourneyData?.date &&
    //       returnJourneyData.hour !== undefined &&
    //       returnJourneyData.hour !== null &&
    //       String(returnJourneyData.hour) !== "" &&
    //       returnJourneyData.minute !== undefined &&
    //       returnJourneyData.minute !== null &&
    //       String(returnJourneyData.minute) !== "";

    //   }
    // }

    // let errorMessages = [];
    // if (!isEditing) {
    //   if (!primaryJourneyData?.pickup?.trim()) {
    //     errorMessages.push("Primary journey pickup location is required");
    //   }

    //   if (!dropOffs1[0]?.trim()) {
    //     errorMessages.push("Primary journey dropoff location is required");
    //   }

    //   if (!primaryJourneyData?.date) {
    //     errorMessages.push("Primary journey date is required");
    //   }

    //   if (!primaryJourneyData?.hour) {
    //     errorMessages.push("Primary journey hour is required");
    //   }

    //   if (!primaryJourneyData?.minute) {
    //     errorMessages.push("Primary journey minute is required");
    //   }
    // }

    // if (returnJourneyToggle) {
    //   if (!returnJourneyData?.pickup?.trim()) {
    //     errorMessages.push("Return journey pickup location is required");
    //   }

    //   if (!dropOffs2[0]?.trim()) {
    //     errorMessages.push("Return journey dropoff location is required");
    //   }

    //   if (!returnJourneyData?.date) {
    //     errorMessages.push("Return journey date is required");
    //   }

    //   if (!returnJourneyData?.hour) {
    //     errorMessages.push("Return journey hour is required");
    //   }

    //   if (!returnJourneyData?.minute) {
    //     errorMessages.push("Return journey minute is required");
    //   }
    // }

    // if (!selectedVehicle) {
    //   errorMessages.push("Please select a vehicle");
    // }

    // if (vehicleExtras?.passenger === 0 || !vehicleExtras?.passenger) {
    //   errorMessages.push(
    //     "Please select number of passengers from the dropdown"
    //   );
    // }

    // if (!passengerDetails?.name?.trim()) {
    //   errorMessages.push("Passenger name is required");
    // }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!passengerDetails?.email?.trim()) {
    //   errorMessages.push("Passenger email is required");
    // } else if (!emailRegex.test(passengerDetails.email)) {
    //   errorMessages.push("Please enter a valid email address");
    // }

    // const phoneDigits = passengerDetails?.phone?.replace(/\D/g, "") || "";
    // if (!passengerDetails?.phone?.trim()) {
    //   errorMessages.push("Passenger phone number is required");
    // } else if (phoneDigits.length < 10) {
    //   errorMessages.push(
    //     "Please enter a valid phone number (at least 10 digits)"
    //   );
    // }

    // if (!fareDetails?.paymentMethod) {
    //   errorMessages.push("Payment method is required");
    // }
    // if (!isEditing) {
    //   if (!finalPrimaryFare || finalPrimaryFare <= 0) {
    //     errorMessages.push("Please enter a valid journey fare amount");
    //   }
    // }

    // if (returnJourneyToggle) {
    //   if (!finalReturnFare || finalReturnFare <= 0) {
    //     errorMessages.push("Please enter a valid return journey fare amount");
    //   }
    // }
    // if (parseFloat(fareDetails.driverFare) > finalPrimaryFare) {
    //   errorMessages.push(
    //     "Driver fare cannot be greater than the  journey fare"
    //   );
    // }
    // if (returnJourneyToggle) {
    //   if (parseFloat(fareDetails.returnDriverFare) > finalReturnFare) {
    //     errorMessages.push(
    //       "Driver fare cannot be greater than the  journey fare"
    //     );
    //   }
    // }

    // if (errorMessages.length > 0) {
    //   toast.error(errorMessages[0]);
    //   if (errorMessages.length > 1) {
    //     console.warn("All validation errors:", errorMessages);
    //   }
    //   return;
    // }

    // const isReturnJourney =
    //   !!editBookingData?.__editReturn || !!editBookingData?.__copyReturn;

    // if (!companyId) {
    //   return toast.error("Missing company ID");
    // }

    // if (isReturnJourney) {
    //   if (!returnJourneyData?.pickup || !dropOffs2[0]) {
    //     return toast.error("Missing return journey fields");
    //   }
    // } else {
    //   if (!primaryJourneyData?.pickup || !dropOffs1[0]) {
    //     return toast.error("Missing primary journey fields");
    //   }
    // }

    // const buildDynamicFields = (dropOffs, journeyData) => {
    //   const dynamic = {};
    //   dropOffs.forEach((_, i) => {
    //     dynamic[`dropoffDoorNumber${i}`] =
    //       journeyData?.[`dropoffDoorNumber${i}`] || "";
    //     dynamic[`dropoff_terminal_${i}`] =
    //       journeyData?.[`dropoff_terminal_${i}`] || "";
    //   });
    //   return dynamic;
    // };

    // const dynamicFields1 = buildDynamicFields(dropOffs1, primaryJourneyData);
    // const dynamicFields2 = buildDynamicFields(dropOffs2, returnJourneyData);

    // const vehicleData = {
    //   vehicleName: selectedVehicle?.vehicleName || "",
    //   ...vehicleExtras,
    // };

    // const mapPaymentMethodForBooking = (method) => {
    //   if (!method && method !== "") return "Cash";
    //   const m = String(method).trim();
    //   const lower = m.toLowerCase();
    //   if (lower === "stripe" || lower === "card" || lower === "card, bank") return "Card, Bank";
    //   if (lower === "paypal" || lower === "paypal") return "Paypal";
    //   if (lower === "cash" || lower === "cash") return "Cash";
    //   if (lower === "invoice" || lower === "invoice") return "Invoice";
    //   if (lower === "paymentlink" || lower === "payment link") return "Payment Link";
    //   // If already one of the allowed display values, return as-is (case-sensitive as used across UI)
    //   const allowed = ["Cash", "Card, Bank", "Payment Link", "Invoice", "Paypal"];
    //   if (allowed.includes(m)) return m;
    //   return m;
    // };

    // const paymentFields = {
    //   paymentMethod: fareDetails.paymentMethod,
    //   cardPaymentReference: fareDetails.cardPaymentReference,
    //   paymentGateway: fareDetails.paymentGateway,
    //   journeyFare: finalPrimaryFare,
    //   driverFare: parseFloat(fareDetails.driverFare),
    //   returnJourneyFare: finalReturnFare,
    //   returnDriverFare: parseFloat(fareDetails.returnDriverFare) || 0,
    //   emailNotifications: {
    //     admin: !!fareDetails?.emailNotifications?.admin,
    //     customer: !!fareDetails?.emailNotifications?.customer,
    //   },
    //   appNotifications: {
    //     customer: !!fareDetails?.appNotifications?.customer,
    //   },
    // };

    // const basePayload = {
    //   mode,
    //   companyId,
    //   referrer: filteredCompanyId?.website || "manual",
    //   vehicle: vehicleData,
    //   passenger: passengerDetails,
    //   paymentMethod: mapPaymentMethodForBooking(paymentFields.paymentMethod),
    //   cardPaymentReference: paymentFields.cardPaymentReference,
    //   paymentGateway: paymentFields.paymentGateway,
    //   emailNotifications: paymentFields.emailNotifications,
    //   appNotifications: paymentFields.appNotifications,
    //   PassengerEmail: emailNotify.customer ? passengerDetails.email : null,
    //   ClientAdminEmail: emailNotify.admin ? userEmail : null,
    // };

    // try {
    //   if (isEditing) {
    //     const isAirportAddress = (address = "") =>
    //       address.toLowerCase().includes("airport");
    //     if (!isAirportAddress(primaryJourneyData.pickup)) {
    //       delete primaryJourneyData.pickmeAfter;
    //       delete primaryJourneyData.flightNumber;
    //       delete primaryJourneyData.arrivefrom;
    //     } else {
    //       delete primaryJourneyData.pickupDoorNumber;
    //     }
    //     if (returnJourneyToggle && dropOffs2[0]) {
    //       if (!isAirportAddress(returnJourneyData.pickup)) {
    //         delete returnJourneyData.pickmeAfter;
    //         delete returnJourneyData.flightNumber;
    //         delete returnJourneyData.arrivefrom;
    //       } else {
    //         delete returnJourneyData.pickupDoorNumber;
    //       }
    //     }

    //     const updatePayload = {
    //       ...basePayload,
    //       journeyFare: paymentFields.journeyFare,
    //       driverFare: paymentFields.driverFare,
    //       returnJourneyFare: paymentFields.returnJourneyFare,
    //       returnDriverFare: paymentFields.returnDriverFare,
    //     };

    //     if (isReturnJourney) {
    //       updatePayload.returnJourney = {
    //         ...returnJourneyData,
    //         dropoff: dropOffs2[0],
    //         additionalDropoff1: dropOffs2[1] || null,
    //         additionalDropoff2: dropOffs2[2] || null,
    //         additionalDropoff3: dropOffs2[3] || null,
    //         additionalDropoff4: dropOffs2[4] || null,
    //         hourlyOption:
    //           mode === "Hourly" && selectedHourly
    //             ? selectedHourly
    //             : null,
    //         fare: paymentFields.returnJourneyFare,
    //         flightArrival: returnJourneyData.flightArrival || null,
    //         ...dynamicFields2,
    //       };
    //       updatePayload.returnJourneyToggle = true;
    //     } else {
    //       updatePayload.primaryJourney = {
    //         ...primaryJourneyData,
    //         dropoff: dropOffs1[0],
    //         additionalDropoff1: dropOffs1[1] || null,
    //         additionalDropoff2: dropOffs1[2] || null,
    //         additionalDropoff3: dropOffs1[3] || null,
    //         additionalDropoff4: dropOffs1[4] || null,
    //         hourlyOption:
    //           mode === "Hourly" && selectedHourly
    //             ? selectedHourly
    //             : null,
    //         fare: paymentFields.journeyFare,
    //         flightArrival: primaryJourneyData.flightArrival || null,
    //         ...dynamicFields1,
    //       };
    //     }

    //     await updateBooking({
    //       id: editBookingData._id,
    //       updatedData: { bookingData: updatePayload },
    //     }).unwrap();

    //     toast.success(
    //       `${isReturnJourney ? "Return" : "Primary"
    //       } booking updated successfully`
    //     );
    //     navigate("/dashboard/bookings/list");
    //   } else {
    //     const paymentMethodToUse = fareDetails.paymentMethod;

    //     const primaryPayload = {
    //       ...basePayload,
    //       journeyFare: finalPrimaryFare,
    //       driverFare: parseFloat(fareDetails.driverFare) || 0,
    //       primaryJourney: {
    //         ...primaryJourneyData,
    //         dropoff: dropOffs1[0],
    //         additionalDropoff1: dropOffs1[1] || null,
    //         additionalDropoff2: dropOffs1[2] || null,
    //         additionalDropoff3: dropOffs1[3] || null,
    //         additionalDropoff4: dropOffs1[4] || null,
    //         distanceText: primaryDistanceText,
    //         durationText: primaryDurationText,
    //         hourlyOption:
    //           mode === "Hourly" && selectedHourly
    //             ? selectedHourly
    //             : null,
    //         fare: finalPrimaryFare,
    //         ...dynamicFields1,
    //         paymentMethod: paymentMethodToUse,
    //       },
    //     };

    //     await createBooking(primaryPayload).unwrap();
    //     toast.success("Primary booking created successfully");

    //     if (returnJourneyToggle && dropOffs2[0]) {
    //       const returnPayload = {
    //         ...basePayload,
    //         returnJourneyFare: finalReturnFare || 0,
    //         returnDriverFare: parseFloat(fareDetails.returnDriverFare) || 0,
    //         returnJourney: {
    //           ...returnJourneyData,
    //           dropoff: dropOffs2[0],
    //           additionalDropoff1: dropOffs2[1] || null,
    //           additionalDropoff2: dropOffs2[2] || null,
    //           additionalDropoff3: dropOffs2[3] || null,
    //           additionalDropoff4: dropOffs2[4] || null,
    //           distanceText: returnDistanceText,
    //           durationText: returnDurationText,
    //           hourlyOption:
    //             mode === "Hourly" && selectedHourly
    //               ? selectedHourly
    //               : null,
    //           fare: finalReturnFare,
    //           ...dynamicFields2,
    //         },
    //         returnJourneyToggle: true,
    //       };
    //       delete returnPayload.primaryJourney;
    //       await createBooking(returnPayload).unwrap();
    //       toast.success("Return journey booking created successfully");
    //     }

    //     navigate("/dashboard/bookings/list");
    //   }
    //   onClose?.();
    // } catch (err) {
    //   console.error(err);
    //   toast.error("Booking operation failed.", err);
    // }
  };

  useEffect(() => {
    if (
      returnJourneyToggle &&
      primaryJourneyData.date &&
      primaryJourneyData.hour !== "" &&
      primaryJourneyData.minute !== "" &&
      returnJourneyData.date &&
      returnJourneyData.hour !== "" &&
      returnJourneyData.minute !== ""
    ) {
      validateReturnJourneyTime(primaryJourneyData, returnJourneyData);
    }
  }, [
    returnJourneyToggle,
    primaryJourneyData.date,
    primaryJourneyData.hour,
    primaryJourneyData.minute,
    returnJourneyData.date,
    returnJourneyData.hour,
    returnJourneyData.minute,
  ]);

  useEffect(() => {
    if (returnJourneyToggle && primaryJourneyData.pickup && dropOffs1[0]) {
      const primaryPickup = primaryJourneyData.pickup;
      const primaryDropoff = dropOffs1[0] || "";
      const primaryPickupIsAirport = primaryPickup
        .toLowerCase()
        .includes("airport");
      const primaryDropoffIsAirport = primaryDropoff
        .toLowerCase()
        .includes("airport");

      setReturnJourneyData((prev) => ({
        ...prev,
        pickup: primaryDropoff,
        pickupDoorNumber: "",
        arrivefrom: "",
        pickmeAfter: "",
        flightNumber: "",
        dropoffDoorNumber0: "",
        dropoff_terminal_0: "",
        ...(primaryDropoffIsAirport
          ? { arrivefrom: primaryJourneyData.dropoff_terminal_0 || "" }
          : { pickupDoorNumber: primaryJourneyData.dropoffDoorNumber0 || "" }),
        ...(primaryPickupIsAirport
          ? {
              dropoff_terminal_0: primaryJourneyData.terminal || "",
            }
          : { dropoffDoorNumber0: primaryJourneyData.pickupDoorNumber || "" }),
      }));

      setDropOffs2([primaryPickup]);
      setPickupType2(primaryDropoffIsAirport ? "airport" : "location");
      setDropOffTypes2((prev) => ({
        ...prev,
        0: primaryPickupIsAirport ? "airport" : "location",
      }));
    }
  }, [returnJourneyToggle, primaryJourneyData, dropOffs1]);

  return (
    <>
      {!editBookingData && <OutletHeading name="New Booking" />}

      <div className="w-full flex flex-col items-center gap-4 sm:gap-6 px-4 sm:px-6 lg:px-0">
        <div
          className={`w-full ${
            returnJourneyToggle ? "lg:max-w-6xl gap-4 sm:gap-4" : "lg:max-w-4xl"
          } ${(isEditing || copyMode) && "sm:px-6 md:px-8"} flex flex-col lg:flex-row`}
        >
          <JourneyCard
            title="Journey 1"
            isEditMode={!!editBookingData?._id}
            journeyData={primaryJourneyData}
            setJourneyData={handlePrimaryJourneyDataChange}
            dropOffs={dropOffs1}
            setDropOffs={handleDropOffs1Change}
            editBookingData={localEditData}
            fare={finalPrimaryFare}
            pricingMode={primaryFareMode}
            selectedVehicle={selectedVehicle}
            mode={mode}
            pickupType={pickupType1}
            setPickupType={setPickupType1}
            dropOffTypes={dropOffTypes1}
            setDropOffTypes={setDropOffTypes1}
            userRole={userRole}
            companyId={companyId}
            coverageUnlocked={coverageUnlocked}
            setCoverageUnlocked={setCoverageUnlocked}
            isCoverageValid={isCoverageValid}
            setIsCoverageValid={setIsCoverageValid}
          />
        </div>
        <div className="flex items-center mt-3 mb-4 sm:mt-4 sm:mb-5 md:mt-6 md:mb-6 gap-2 sm:gap-3 px-4 sm:px-0">
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer relative">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={returnJourneyToggle}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setreturnJourneyToggle(checked);

                  if (checked && primaryJourneyData.pickup && dropOffs1[0]) {
                    const primaryPickup = primaryJourneyData.pickup;
                    const primaryDropoff = dropOffs1[0] || "";

                    const primaryPickupIsAirport = primaryPickup
                      .toLowerCase()
                      .includes("airport");
                    const primaryDropoffIsAirport = primaryDropoff
                      .toLowerCase()
                      .includes("airport");

                    setReturnJourneyData((prev) => ({
                      ...prev,
                      pickup: primaryDropoff,
                      pickupDoorNumber: "",
                      arrivefrom: "",
                      pickmeAfter: "",
                      flightNumber: "",
                      dropoffDoorNumber0: "",
                      dropoff_terminal_0: "",
                      ...(primaryDropoffIsAirport
                        ? {
                            arrivefrom:
                              primaryJourneyData.dropoff_terminal_0 || "",
                          }
                        : {
                            pickupDoorNumber:
                              primaryJourneyData.dropoffDoorNumber0 || "",
                          }),
                      ...(primaryPickupIsAirport
                        ? {
                            dropoff_terminal_0:
                              primaryJourneyData.terminal ||
                              primaryJourneyData.arrivefrom ||
                              "",
                          }
                        : {
                            dropoffDoorNumber0:
                              primaryJourneyData.pickupDoorNumber || "",
                          }),
                    }));

                    setDropOffs2([primaryPickup]);
                    setPickupType2(
                      primaryDropoffIsAirport ? "airport" : "location",
                    );
                    setDropOffTypes2((prev) => ({
                      ...prev,
                      0: primaryPickupIsAirport ? "airport" : "location",
                    }));

                    toast.success("Locations swapped for return journey");
                  }
                }}
              />
            </label>
          </div>
        </div>
      </div>
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 md:gap-6 px-4 sm:px-6 lg:px-0 ${
          editBookingData?._id || editBookingData?.__copyMode
            ? "lg:px-6 pb-6"
            : ""
        }`}
      >
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-4 sm:gap-5 md:gap-6">
          <VehicleSelection
            setSelectedVehicle={setSelectedVehicle}
            setVehicleExtras={setVehicleExtras}
            editBookingData={editBookingData}
          />
        </div>
        <div className="col-span-1 lg:col-span-6">
          <div className="bg-(--white) shadow-md sm:shadow-lg rounded-xl sm:rounded-2xl border border-(--light-gray) h-full">
            <div className="bg-(--mate-color) px-4 sm:px-5 md:px-6 rounded-t-xl sm:rounded-t-2xl py-4 sm:py-4">
              <h2 className="text-xl sm:text-lg md:text-xl font-bold text-(--lightest-gray)">
                Passenger & Fare Details:-
              </h2>
            </div>
            <div className="p-4 sm:p-5 md:p-6">
              <PassengerDetails
                passengerDetails={passengerDetails}
                setPassengerDetails={setPassengerDetails}
              />
              <hr className="mb-3 mt-5 border-(--light-gray)" />
              {/* <FareSection
                companyId={companyId}
                returnJourneyToggle={returnJourneyToggle}
                fareDetails={fareDetails}
                setFareDetails={setFareDetails}
                calculatedJourneyFare={finalPrimaryFare}
                calculatedReturnFare={finalReturnFare}
                fare={finalPrimaryFare}
                onFareManuallyEdited={(type) => {
                  if (type === "journey") {
                    setHasChangedPrimaryLocations(true);
                    setIsFareManuallyEdited((prev) => ({ ...prev, journey: true }));
                  }
                  if (type === "return") {
                    setHasChangedReturnLocations(true);
                    setIsFareManuallyEdited((prev) => ({ ...prev, return: true }));
                  }
                }}
                handleSubmit={handleSubmit}
                editBookingData={editBookingData}
                userRole={userRole}
                vatnumber={vatnumber}
                isFetching={isFetching}
                error={error}
                customerByVat={customerByVat}
              /> */}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-6 sm:mt-8 md:mt-10 lg:mt-12 px-4 pb-6">
        <button
          onClick={handleSubmit}
          className="btn btn-primary px-6 sm:px-8 py-3 sm:py-2 text-sm sm:text-base"
        >
          {editBookingData && editBookingData._id
            ? "Update Booking"
            : "Submit Booking"}
        </button>
      </div>
    </>
  );
};

export default NewBooking;
