import React, { useState, useEffect, useRef, useMemo } from "react";
import WidgetStepHeader from "./widgetcomponents/WidgetStepHeader";
import FloorAccessibility from "./widgetcomponents/FloorAccessibility";
import Icons from "../../../assets/icons";
import { toast } from "react-toastify";
import { useGetPublicBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";

const WidgetInventory = ({ onContinue, items, setItems, googleMinutes: passedGoogleMinutes, roundedGoogleMinutes: passedRoundedMinutes }) => {
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
  const [pickupAccess, setPickupAccess] = useState("STAIRS");
  const [dropoffAccess, setDropoffAccess] = useState("STAIRS");
  const [estimatedHours, setEstimatedHours] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  const [additionalDropoffs, setAdditionalDropoffs] = useState([]);
  const [floorAccess, setFloorAccess] = useState({
    additionalDropoff1Floor: 0,
    additionalDropoff1Access: "STAIRS",
    additionalDropoff2Floor: 0,
    additionalDropoff2Access: "STAIRS",
    additionalDropoff3Floor: 0,
    additionalDropoff3Access: "STAIRS",
    additionalDropoff4Floor: 0,
    additionalDropoff4Access: "STAIRS",
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
  const { data: settingsData } = useGetPublicBookingSettingQuery(companyId, {
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

    // Pickup
    totalFloor += (pickupFloor || 0) * pricePerFloor;
    totalAccess += pickupAccess === "STAIRS" ? priceForStairs : priceForLift;

    // Dropoff
    totalFloor += (dropoffFloor || 0) * pricePerFloor;
    totalAccess += dropoffAccess === "STAIRS" ? priceForStairs : priceForLift;

    // Additional Dropoffs
    additionalDropoffs.forEach((ad) => {
      const floor = floorAccess[`additionalDropoff${ad.id}Floor`] || 0;
      const access = floorAccess[`additionalDropoff${ad.id}Access`] || "STAIRS";
      totalFloor += floor * pricePerFloor;
      totalAccess += access === "STAIRS" ? priceForStairs : priceForLift;
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

  const totalFare = useMemo(() => {
    const base = widgetPricing.baseFare || 0;
    const currentTotalMinutes = estimatedHours * 60 + estimatedMinutes;
    const totalTimeUnits = Math.ceil(currentTotalMinutes / 30);
    const extraHelpUnitPrice = widgetPricing.extraHelp?.unitPrice || 0;
    const totalExtraHelpCharge = totalTimeUnits * extraHelpUnitPrice;

    return base + additionalFare + floorCharges + accessTypeCharges + totalExtraHelpCharge;
  }, [widgetPricing.baseFare, additionalFare, floorCharges, accessTypeCharges, widgetPricing.extraHelp?.unitPrice, estimatedHours, estimatedMinutes]);

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
      const savedInventory = localStorage.getItem("widgetInventoryData");
      if (savedInventory) {
        try {
          const inv = JSON.parse(savedInventory);
          if (inv.pickupFloor !== undefined) setPickupFloor(inv.pickupFloor);
          if (inv.dropoffFloor !== undefined) setDropoffFloor(inv.dropoffFloor);
          if (inv.pickupAccess) setPickupAccess(inv.pickupAccess);
          if (inv.dropoffAccess) setDropoffAccess(inv.dropoffAccess);
          if (inv.estimatedHours !== undefined)
            setEstimatedHours(inv.estimatedHours);
          if (inv.estimatedMinutes !== undefined)
            setEstimatedMinutes(inv.estimatedMinutes);
          if (inv.ridingAlong !== undefined) setRidingAlong(inv.ridingAlong);
          if (inv.passengerCount !== undefined)
            setPassengerCount(inv.passengerCount);
          if (inv.items && Array.isArray(inv.items)) setItems(inv.items);
          if (inv.initialGoogleMinutes !== undefined)
            setInitialGoogleMinutes(inv.initialGoogleMinutes);
          if (inv.floorAccess)
            setFloorAccess((prev) => ({ ...prev, ...inv.floorAccess }));
          return;
        } catch (err) {
          console.error("Error parsing widgetInventoryData:", err);
        }
      }

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
          setEstimatedHours(Math.floor(roundedVal / 60));
          setEstimatedMinutes(roundedVal % 60);

          const ad = [
            { id: 1, address: data.additionalDropoff1 },
            { id: 2, address: data.additionalDropoff2 },
            { id: 3, address: data.additionalDropoff3 },
            { id: 4, address: data.additionalDropoff4 },
          ].filter((d) => d.address && d.address.trim() !== "");
          setAdditionalDropoffs(ad);
        } catch (err) {
          console.error("Error parsing bookingForm for duration:", err);
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

  const parseDurationToMinutes = (text) => {
    if (!text) return 0;
    let minutes = 0;

    const hourMatch = text.match(/(\d+)\s*hour/i);
    if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;

    const minMatch = text.match(/(\d+)\s*min/i);
    if (minMatch) minutes += parseInt(minMatch[1]);

    return minutes;
  };

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

    // Update the main totalPrice in localStorage
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
    <div ref={containerRef} className="px-4 md:px-8 2xl:max-w-7xl 2xl:mx-auto">
      <WidgetStepHeader
        step="3"
        title="Inventory & Requirements"
        description="Survey your moving scope and our availability"
      />

      <div className="bg-(--white) rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="widget-section-title text-(--dark-gray)">
            Item Inventory
          </h2>
          <button
            onClick={() => setShowItemInput(!showItemInput)}
            className="flex cursor-pointer items-center gap-2 px-3 py-1.5 bg-(--mate-color) text-(--white) rounded-lg hover:bg-(--dark-grey) transition-colors"
          >
            <Icons.Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>

        {showItemInput && (
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={currentItem}
                onChange={(e) => setCurrentItem(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter item name (press Enter to add)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleAddItem}
                className="px-4 py-2 cursor-pointer bg-(--dark-grey) text-(--white) rounded-lg hover:bg-(--dark-grey) transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowItemInput(false);
                  setCurrentItem("");
                }}
                className="px-4 cursor-pointer py-2 bg-(--light-gray) text-(--white) rounded-lg hover:bg-(--dark-grey) transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-3 bg-(--lightest-gray) border border-gray-200 rounded-lg"
              >
                <span className="widget-value-text-sm text-gray-900">
                  {item.name}
                </span>
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-600 cursor-pointer hover:text-red-800 transition-colors"
                >
                  <Icons.Minus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length === 0 && !showItemInput && (
          <div className="text-center py-8 text-gray-500">
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

      <div className="bg-(--white) rounded-lg shadow-sm p-6 mb-6">
        <h2 className="widget-section-title text-gray-900 mb-6">
          Travel Preference
        </h2>

        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="widget-value-text text-gray-900 mb-1">
              Riding along with the vehicle?
            </p>
            <p className="widget-description text-(--medium-grey)">
              Update passenger seating availability for truck cabin
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
            className={`relative cursor-pointer w-14 h-7 md:h-8 rounded-full transition-colors duration-300 ${ridingAlong ? "bg-gray-900" : "bg-gray-300"
              }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 md:w-6 md:h-6 bg-(--white) rounded-full shadow transition-transform duration-300 ${ridingAlong ? "translate-x-4 md:translate-x-6" : "translate-x-0"
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
                  <span className="widget-value-text-sm text-(--dark-grey)">
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
                  className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-(--lighter-gray) transition-colors ${passengerCount <= 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"} `}
                >
                  <Icons.Minus className="w-4 h-4 text-(--medium-grey)" />
                </button>
                <span className="widget-title text-gray-900 w-8 text-center">
                  {passengerCount}
                </span>
                <button
                  disabled={passengerCount >= totalSeats}
                  onClick={() =>
                    setPassengerCount(Math.min(totalSeats, passengerCount + 1))
                  }
                  className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-(--lighter-gray) transition-colors ${passengerCount >= totalSeats ? "opacity-30 cursor-not-allowed" : "cursor-pointer"} `}
                >
                  <Icons.Plus className="w-4 h-4 text-(--medium-grey)" />
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

      <div className="bg-gray-900 rounded-lg md:p-8 p-3 mb-6 relative">
        {(googleDurationText || googleDistanceText) && (
          <div className="flex items-center justify-center gap-4 mb-4">
            {googleDistanceText && (
              <span className="widget-meta-text text-gray-400 gap-1.5 flex items-center">
                <Icons.MapPin className="w-3 h-3" />
                Route: {googleDistanceText}
              </span>
            )}
            {googleDurationText && (
              <span className="widget-meta-text text-gray-400 gap-1.5 flex items-center">
                <Icons.Clock className="w-3 h-3" />
                Drive time: {googleDurationText}
              </span>
            )}
          </div>
        )}

        <div className="text-center mb-4">
          <p className="widget-label-small text-gray-400 mb-6">
            Estimated Duration
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

        <p className="widget-option-text text-center text-gray-400">
          Adjustments vary ±30-minute increments
        </p>

        <div className="mt-6 pt-6 border-t border-gray-700 space-y-3">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-sm">Base Fare</span>
            <span className="font-semibold text-(--white)">
              {currencySymbol} {(widgetPricing.baseFare || 0).toFixed(2)}
            </span>
          </div>

          {additionalFare > 0 && (
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-sm">Additional Time Charge</span>
              <span className="font-semibold text-(--white)">
                {currencySymbol} {additionalFare.toFixed(2)}
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

          {widgetPricing.extraHelp?.unitPrice > 0 && (
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-sm">Extra Men Charges ({Math.ceil((estimatedHours * 60 + estimatedMinutes) / 30)} × {currencySymbol}{widgetPricing.extraHelp.unitPrice})</span>
              <span className="font-semibold text-(--white)">
                {currencySymbol} {(Math.ceil((estimatedHours * 60 + estimatedMinutes) / 30) * widgetPricing.extraHelp.unitPrice).toFixed(2)}
              </span>
            </div>
          )}

          <div className="pt-3 border-t border-gray-700 flex justify-between items-center">
            <span className="text-gray-300 font-bold">Total Estimated Fare</span>
            <span className="text-2xl font-bold text-(--white)">
              {currencySymbol} {totalFare.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3">
        <button onClick={handleContinue} className="btn btn-primary">
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default WidgetInventory;