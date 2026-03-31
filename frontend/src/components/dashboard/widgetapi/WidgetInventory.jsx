import React, { useState, useEffect, useRef, useMemo } from "react";
import FloorAccessibility from "./widgetcomponents/FloorAccessibility";
import Icons from "../../../assets/icons";
import { toast } from "react-toastify";
import { useGetPublicBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";
import { formatMinutesToHM } from "../../../utils/durationHelper";

const WidgetInventory = ({ onContinue, onBack, items, setItems, googleMinutes: passedGoogleMinutes, roundedGoogleMinutes: passedRoundedMinutes }) => {
  const containerRef = useRef(null);
  const selectedVehicle = JSON.parse(
    localStorage.getItem("selectedVehicle") || "{}",
  );
  const widgetPricing = JSON.parse(
    localStorage.getItem("widgetPricing") || "{}",
  );
  const totalSeats = selectedVehicle.passengerSeats || 0;
  const [pickupFloor, setPickupFloor] = useState(0);
  const [dropoffFloor, setDropoffFloor] = useState(0);
  const [pickupAccess, setPickupAccess] = useState(null);
  const [dropoffAccess, setDropoffAccess] = useState(null);
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  const [additionalDropoffs, setAdditionalDropoffs] = useState([]);
  const [floorAccess, setFloorAccess] = useState({
    additionalDropoff1Floor: 0,
    additionalDropoff1Access: null,
    additionalDropoff2Floor: 0,
    additionalDropoff2Access: null,
    additionalDropoff3Floor: 0,
    additionalDropoff3Access: null,
    additionalDropoff4Floor: 0,
    additionalDropoff4Access: null,
  });
  const [ridingAlong, setRidingAlong] = useState(false);
  const [passengerCount, setPassengerCount] = useState(0);
  const [showItemInput, setShowItemInput] = useState(false);
  const [currentItem, setCurrentItem] = useState("");
  const [googleDurationText, setGoogleDurationText] = useState(null);
  const [googleDistanceText, setGoogleDistanceText] = useState(null);
  const [initialGoogleMinutes, setInitialGoogleMinutes] = useState(0);
  const [additionalFare, setAdditionalFare] = useState(0);
  const [primaryPickupAddress, setPrimaryPickupAddress] = useState("");
  const [primaryDropoffAddress, setPrimaryDropoffAddress] = useState("");

  const companyId =
    new URLSearchParams(window.location.search).get("company") || "";
  const { data: settingsData, isLoading: isSettingsLoading } = useGetPublicBookingSettingQuery(companyId, {
    skip: !companyId,
  });


  const currencySymbol = settingsData?.setting?.currency?.[0]?.symbol || "£";

  const { floorCharges, accessTypeCharges } = useMemo(() => {
    if (!settingsData?.setting) return { floorCharges: 0, accessTypeCharges: 0 };
    const {
      pricePerFloor = 0,
      priceForStairs = 0,
      priceForLift = 0,
    } = settingsData.setting;

    let totalFloor = 0;
    let totalAccess = 0;

    const getAccessPrice = (floor, access) => {
      if (!floor || floor <= 0) return 0;
      if (access === "STAIRS") return priceForStairs;
      if (access === "LIFT") return priceForLift;
      return 0;
    };

    const getFloorPrice = (floor, access) => {
      if (!floor || floor <= 0) return 0;
      if (access === "LIFT") return 0;
      return floor * pricePerFloor;
    };

    totalFloor += getFloorPrice(pickupFloor, pickupAccess);
    totalAccess += getAccessPrice(pickupFloor, pickupAccess);

    totalFloor += getFloorPrice(dropoffFloor, dropoffAccess);
    totalAccess += getAccessPrice(dropoffFloor, dropoffAccess);

    additionalDropoffs.forEach((ad) => {
      const floor = floorAccess[`additionalDropoff${ad.id}Floor`] || 0;
      const access = floorAccess[`additionalDropoff${ad.id}Access`];
      totalFloor += getFloorPrice(floor, access);
      totalAccess += getAccessPrice(floor, access);
    });

    return { floorCharges: totalFloor, accessTypeCharges: totalAccess };
  }, [
    pickupFloor,
    dropoffFloor,
    pickupAccess,
    dropoffAccess,
    floorAccess,
    additionalDropoffs,
    settingsData,
  ]);

  const { totalFare, displayBaseFare, displayAdditionalFare } = useMemo(() => {
    const base = widgetPricing.baseFare || 0;
    const initialTimeUnits = Math.ceil(initialGoogleMinutes / 30);
    const extraHelpUnitPrice = widgetPricing.extraHelp?.unitPrice || 0;
    const initialExtraHelpCharge = initialTimeUnits * extraHelpUnitPrice;

    const dBaseFare = base + initialExtraHelpCharge;

    const currentTotalMinutes = estimatedHours * 60 + estimatedMinutes;
    const addedMinutes = currentTotalMinutes - initialGoogleMinutes;
    const addedTimeUnits = addedMinutes > 0 ? Math.ceil(addedMinutes / 30) : 0;

    const addedVehicleCharge = addedTimeUnits * (selectedVehicle.halfHourPrice || 0);
    const addedExtraHelpCharge = addedTimeUnits * extraHelpUnitPrice;

    const dAdditionalFare = addedVehicleCharge + addedExtraHelpCharge;

    return {
      totalFare: dBaseFare + dAdditionalFare + (floorCharges || 0) + (accessTypeCharges || 0),
      displayBaseFare: dBaseFare,
      displayAdditionalFare: dAdditionalFare
    };
  }, [widgetPricing.baseFare, initialGoogleMinutes, estimatedHours, estimatedMinutes, widgetPricing.extraHelp?.unitPrice, selectedVehicle.halfHourPrice, floorCharges, accessTypeCharges]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const isEdit =
      new URLSearchParams(window.location.search).get("isEdit") === "true";

    const delay = isEdit ? 200 : 0;

    const timer = setTimeout(() => {
      const bookingForm = localStorage.getItem("bookingForm");
      if (bookingForm) {
        try {
          const data = JSON.parse(bookingForm);
          if (data.pickup) setPrimaryPickupAddress(data.pickup);
          if (data.dropoff) setPrimaryDropoffAddress(data.dropoff);
          if (data.distanceText) {
            setGoogleDistanceText(data.distanceText);
          } else if (data.segments?.length > 0) {
            const totalMiles = data.segments.reduce((sum, seg) => sum + (seg.miles || 0), 0);
            setGoogleDistanceText(`${totalMiles.toFixed(2)} mi`);
          }

          if (data.durationText) {
            setGoogleDurationText(data.durationText);
          } else if (data.segments?.length > 0) {
            const combinedDuration = data.segments.map((s) => s.durationText).join(" + ");
            setGoogleDurationText(combinedDuration);
          }

          const roundedVal = data.roundedGoogleMinutes || passedRoundedMinutes || 120;
          setInitialGoogleMinutes(roundedVal);
          const hm = formatMinutesToHM(roundedVal);
          setEstimatedHours(hm.hours);
          setEstimatedMinutes(hm.minutes);

          const ad = [
            { id: 1, address: data.additionalDropoff1 },
            { id: 2, address: data.additionalDropoff2 },
            { id: 3, address: data.additionalDropoff3 },
            { id: 4, address: data.additionalDropoff4 },
          ].filter((d) => d.address && d.address.trim() !== "");
          setAdditionalDropoffs(ad);
        } catch (err) {
          console.error("Error parsing bookingForm:", err);
        }
      }

      const savedInventory = localStorage.getItem("widgetInventoryData");
      if (savedInventory) {
        try {
          const inv = JSON.parse(savedInventory);
          if (inv.pickupFloor !== undefined) setPickupFloor(inv.pickupFloor);
          if (inv.dropoffFloor !== undefined) setDropoffFloor(inv.dropoffFloor);
          if (inv.pickupAccess) setPickupAccess(inv.pickupAccess);
          if (inv.dropoffAccess) setDropoffAccess(inv.dropoffAccess);

          const currentBookingForm = JSON.parse(localStorage.getItem("bookingForm") || "{}");
          const routeMinutes = currentBookingForm.roundedGoogleMinutes || passedRoundedMinutes || 120;

          if (inv.initialGoogleMinutes === routeMinutes) {
            if (inv.estimatedHours !== undefined)
              setEstimatedHours(inv.estimatedHours);
            if (inv.estimatedMinutes !== undefined)
              setEstimatedMinutes(inv.estimatedMinutes);
          }

          if (inv.ridingAlong !== undefined) setRidingAlong(inv.ridingAlong);
          if (inv.passengerCount !== undefined)
            setPassengerCount(inv.passengerCount);
          if (inv.items && Array.isArray(inv.items)) setItems(inv.items);

          setInitialGoogleMinutes(routeMinutes);

          if (inv.floorAccess)
            setFloorAccess((prev) => ({ ...prev, ...inv.floorAccess }));
        } catch (err) {
          console.error("Error parsing widgetInventoryData:", err);
        }
      }
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (passengerCount > totalSeats && totalSeats > 0) {
      setPassengerCount(totalSeats);
    }
  }, [totalSeats]);
  useEffect(() => {
    const currentTotalMinutes = estimatedHours * 60 + estimatedMinutes;
    const addedMinutes = currentTotalMinutes - initialGoogleMinutes;

    if (addedMinutes > 0) {
      const halfHourIncrements = Math.ceil(addedMinutes / 30);
      const calculatedFare =
        halfHourIncrements * (selectedVehicle.halfHourPrice || 0);
      setAdditionalFare(calculatedFare);
    } else {
      setAdditionalFare(0);
    }
  }, [
    estimatedHours,
    estimatedMinutes,
    initialGoogleMinutes,
    selectedVehicle.halfHourPrice,
  ]);

  useEffect(() => {
    if (initialGoogleMinutes === 0) return;

    const inventoryData = {
      pickupFloor,
      dropoffFloor,
      pickupAccess,
      dropoffAccess,
      estimatedHours,
      estimatedMinutes,
      ridingAlong,
      passengerCount,
      items,
      initialGoogleMinutes,
      additionalFare,
      floorCharges,
      accessTypeCharges,
      floorAccess,
    };
    localStorage.setItem("widgetInventoryData", JSON.stringify(inventoryData));
  }, [
    pickupFloor,
    dropoffFloor,
    pickupAccess,
    dropoffAccess,
    estimatedHours,
    estimatedMinutes,
    ridingAlong,
    passengerCount,
    items,
    initialGoogleMinutes,
    additionalFare,
    floorCharges,
    accessTypeCharges,
    floorAccess,
  ]);

  const adjustDuration = (increment) => {
    let totalMinutes = estimatedHours * 60 + estimatedMinutes;
    totalMinutes += increment ? 30 : -30;

    const googleMin = Math.max(120, Math.ceil(initialGoogleMinutes / 30) * 30);
    if (totalMinutes < googleMin) totalMinutes = googleMin;

    setEstimatedHours(Math.floor(totalMinutes / 60));
    setEstimatedMinutes(totalMinutes % 60);
  };

  const handleContinue = () => {
    if (items.length === 0) {
      toast.error("Add items in inventory");
      if (containerRef.current) {
        containerRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      return;
    }
    const inventoryData = {
      pickupFloor,
      dropoffFloor,
      pickupAccess,
      dropoffAccess,
      estimatedHours,
      estimatedMinutes,
      ridingAlong,
      passengerCount,
      items,
      initialGoogleMinutes,
      additionalFare,
      floorCharges,
      accessTypeCharges,
      floorAccess,
    };
    localStorage.setItem("widgetInventoryData", JSON.stringify(inventoryData));

    const wp = JSON.parse(localStorage.getItem("widgetPricing") || "{}");
    wp.totalPrice = totalFare;
    if (wp.extraHelp) {
      const currentTotalMinutes = estimatedHours * 60 + estimatedMinutes;
      const totalTimeUnits = Math.ceil(currentTotalMinutes / 30);
      wp.extraHelp.price = totalTimeUnits * (wp.extraHelp.unitPrice || 0);
    }
    localStorage.setItem("widgetPricing", JSON.stringify(wp));

    if (onContinue) {
      onContinue();
    }
  };
  const handleAddItem = () => {
    if (currentItem.trim()) {
      setItems([...items, { id: Date.now(), name: currentItem.trim() }]);
      setCurrentItem("");
      setShowItemInput(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddItem();
    }
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <div ref={containerRef} className="px-2 md:px-8 pb-8 md:mt-8 mt-6 relative">
      <div className="mb-6">
        <button
          onClick={onBack}
          className="btn btn-blue"
        >
          Go Back
        </button>
      </div>
      <div className="mb-3">
        <h1 className="text-2xl font-bold mb-2 text-(--dark-gray)">
          Inventory & Requirements
        </h1>
        <p className="widget-description leading-relaxed text-gray-600">
          Survey your moving scope and our availability.
        </p>
      </div>

      <div className="bg-(--lightest-gray) rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="widget-section-title text-(--dark-gray)">
            Item Inventory
          </h2>
          <button
            onClick={() => setShowItemInput(!showItemInput)}
            className="btn btn-blue"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {showItemInput && (
          <div className="mb-4">
            <div className="flex flex-wrap sm:flex-nowrap gap-2">
              <input
                type="text"
                value={currentItem}
                onChange={(e) => setCurrentItem(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter item name (press Enter to add)"
                className="flex-1 min-w-[150px] px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddItem}
                  className="btn btn-success flex-1 sm:flex-none"
                >
                  <Icons.Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setShowItemInput(false);
                    setCurrentItem("");
                  }}
                  className="btn btn-back flex-1 sm:flex-none"
                >
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-2 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <div key={item.id} className="flex gap-2">
                <div className="flex w-6 items-center justify-center text-sm font-medium text-gray-900">
                  {index + 1}.
                </div>

                <div className="flex-1 flex items-center px-4 py-2 bg-(--lightest-gray) border border-gray-200 rounded-md">
                  <span className="widget-value-text-sm text-gray-900">
                    {item.name}
                  </span>
                </div>

                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="btn btn-cancel"
                >
                  <Icons.Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && !showItemInput && (
          <div className="text-center text-gray-500">
            <p className="widget-description">
              No items added yet. Click "Add Item" to get started.
            </p>
          </div>
        )}
      </div>


      <FloorAccessibility
        pickupFloor={pickupFloor}
        setPickupFloor={setPickupFloor}
        pickupAccess={pickupAccess}
        setPickupAccess={setPickupAccess}
        dropoffFloor={dropoffFloor}
        setDropoffFloor={setDropoffFloor}
        dropoffAccess={dropoffAccess}
        setDropoffAccess={setDropoffAccess}
        primaryPickupAddress={primaryPickupAddress}
        primaryDropoffAddress={primaryDropoffAddress}
        additionalDropoffs={additionalDropoffs}
        floorAccess={floorAccess}
        setFloorAccess={setFloorAccess}
        pricePerFloor={settingsData?.setting?.pricePerFloor}
        priceForStairs={settingsData?.setting?.priceForStairs}
        priceForLift={settingsData?.setting?.priceForLift}
        currencySymbol={currencySymbol}
      />

      <div className="bg-(--lightest-gray) rounded-lg shadow-sm p-6 mb-6">
        <h2 className="widget-section-title text-gray-900 mb-6">
          Travel Preference
        </h2>

        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="md:widget-value-text-sm widget-value-text-sm text-(--dark-grey) mb-1">
              Riding along with the vehicle?
            </p>
            <p className="widget-description text-(--medium-grey)">
              It’s free to ride-along to your destination

            </p>
          </div>
          <button
            onClick={() => {
              if (!ridingAlong) {
                setRidingAlong(true);
              } else {
                setRidingAlong(false);
                setPassengerCount(0);
              }
            }}
            className={`relative cursor-pointer md:w-14 w-20 h-7 md:h-8 rounded-full transition-colors duration-300 ${ridingAlong ? "bg-gray-900" : "bg-gray-300"
              }`}
          >
            <span
              className={`absolute top-1 left-1  w-5 h-5 md:w-6 md:h-6 bg-(--white) rounded-full shadow transition-transform duration-300 ${ridingAlong ? "translate-x-9 md:translate-x-6" : "translate-x-0"
                }`}
            />
          </button>
        </div>

        {ridingAlong && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Icons.User className="w-5 h-5 text-(--medium-grey)" />
                <div>
                  <span className="widget-value-text-xs text-(--dark-grey)">
                    Passenger Count
                  </span>
                  <p className="widget-label-tiny leading-none mt-1">
                    Max {totalSeats} seats available
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  disabled={passengerCount <= 0}
                  onClick={() =>
                    setPassengerCount(Math.max(0, passengerCount - 1))
                  }
                  className={`w-8 h-8 flex items-center justify-center border border-(--medium-grey) rounded-lg hover:bg-(--lighter-gray) transition-colors ${passengerCount <= 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"} `}
                >
                  <Icons.Minus className="w-4 h-4 text-(--dark-grey)" />
                </button>
                <span className="widget-title text-gray-900 w-8 text-center">
                  {passengerCount}
                </span>
                <button
                  disabled={passengerCount >= totalSeats}
                  onClick={() =>
                    setPassengerCount(Math.min(totalSeats, passengerCount + 1))
                  }
                  className={`w-8 h-8 flex items-center justify-center border border-(--dark-grey) rounded-lg hover:bg-(--lighter-gray) transition-colors ${passengerCount >= totalSeats ? "opacity-30 cursor-not-allowed" : "cursor-pointer"} `}
                >
                  <Icons.Plus className="w-4 h-4 text-(--dark-grey)" />
                </button>
              </div>
            </div>
            {totalSeats === 0 && (
              <p className="widget-label-tiny italic text-rose-500 mt-2">
                * This vehicle does not support passenger ride-along.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-900 grid grid-cols-12 rounded-lg md:p-8 p-3 mb-6 relative">

        <div className="md:col-span-6 col-span-12 lg:border-r lg:border-(--lighter-gray)">
          {(googleDurationText || googleDistanceText) && (
            <div className="flex md:flex-row flex-col items-center justify-center gap-4 mb-4">
              {googleDistanceText && (
                <span className="widget-meta-text text-gray-400 gap-1.5 flex items-center">
                  <Icons.MapPin className="w-3 h-3" />
                  Route: {googleDistanceText}
                </span>
              )}
              {googleDurationText && (
                <span className="widget-meta-text text-gray-400 gap-1.5 flex items-center">
                  <Icons.Clock className="w-3 h-3" />
                  Time Booked: {googleDurationText}
                </span>
              )}
            </div>
          )}

          <div className="text-center mb-4">
            <p className="text-xs text-gray-400 mb-6">
              Total Hours Booked
            </p>

            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                onClick={() => adjustDuration(false)}
                className="md:w-12 w-8 cursor-pointer md:h-12 h-8 flex items-center justify-center border-2 border-gray-700 rounded-full hover:border-gray-500 transition-colors"
              >
                <Icons.Minus className="w-5 h-5 text-(--white)" />
              </button>

              <div className="flex items-center gap-2">
                <span className="widget-value-large text-6xl text-(--white) tabular-nums">
                  {String(estimatedHours).padStart(2, "0")}
                </span>
                <span className="widget-value-large text-6xl text-(--white)">
                  :
                </span>
                <span className="widget-value-large text-6xl text-(--white) tabular-nums">
                  {String(estimatedMinutes).padStart(2, "0")}
                </span>
              </div>

              <button
                onClick={() => adjustDuration(true)}
                className="md:w-12 w-8 cursor-pointer md:h-12 h-8 flex items-center justify-center border-2 border-gray-700 rounded-full hover:border-gray-500 transition-colors"
              >
                <Icons.Plus className="w-5 h-5 text-(--white)" />
              </button>
            </div>

            <p className="widget-label-small text-gray-500 mb-4">
              Hours : Minutes
            </p>
          </div>

          <p className="text-sm text-center text-gray-400">
            Click (+) to add extra time
          </p>
          <p className="widget-option-text text-center mt-2 px-2 text-gray-400">
            Non booked time will cost {currencySymbol}{(Math.round(((selectedVehicle?.halfHourPrice || 0) + (widgetPricing.extraHelp?.unitPrice || 0)) * 1.05)).toFixed(2)} per half hour. Book in advance your total time and Save up to 5%
          </p>
        </div>
        <div className="md:col-span-6 col-span-12 md:pl-12 pl-0 md:mt-0 mt-8">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-sm">Base Fare</span>
              <span className="font-semibold text-(--white)">
                {currencySymbol} {Math.round(displayBaseFare).toFixed(2)}
              </span>
            </div>

            {displayAdditionalFare > 0 && (
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-sm">Additional Time Charge</span>
                <span className="font-semibold text-(--white)">
                  {currencySymbol} {displayAdditionalFare.toFixed(2)}
                </span>
              </div>
            )}

            {floorCharges > 0 && (
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-sm">Floor Level Charges</span>
                <span className="font-semibold text-(--white)">
                  {currencySymbol} {floorCharges.toFixed(2)}
                </span>
              </div>
            )}

            {accessTypeCharges > 0 && (
              <div className="flex justify-between items-center text-gray-400">
                <span className="text-sm">Access Type Charges (Lift/Stairs)</span>
                <span className="font-semibold text-(--white)">
                  {currencySymbol} {accessTypeCharges.toFixed(2)}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-gray-700 flex justify-between items-center">
              <span className="text-gray-300 font-bold">Total Fare</span>
              <span className="text-2xl font-bold text-(--white)">
                {currencySymbol} {Math.round(Number(totalFare)).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3">

        <button onClick={handleContinue} className="btn btn-blue">
          Continue
        </button>
      </div>
    </div>
  );
};

export default WidgetInventory;