import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import WidgetStepHeader from "./widgetcomponents/WidgetStepHeader";
import FloorAccessibility from "./widgetcomponents/FloorAccessibility";
import Icons from "../../../assets/icons";

const WidgetInventory = ({ onContinue }) => {
  const selectedVehicle = JSON.parse(
    localStorage.getItem("selectedVehicle") || "{}",
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
  const [items, setItems] = useState([]);
  const [showItemInput, setShowItemInput] = useState(false);
  const [currentItem, setCurrentItem] = useState("");

  const [googleDurationText, setGoogleDurationText] = useState(null);
  const [googleDistanceText, setGoogleDistanceText] = useState(null);
  const [initialGoogleMinutes, setInitialGoogleMinutes] = useState(0);
  const [additionalFare, setAdditionalFare] = useState(0);
  const [primaryPickupAddress, setPrimaryPickupAddress] = useState("");
  const [primaryDropoffAddress, setPrimaryDropoffAddress] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
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
        let totalMinutes = 0;

        if (
          data.segments &&
          Array.isArray(data.segments) &&
          data.segments.length > 0
        ) {
          const combinedDuration = data.segments
            .map((s) => s.durationText)
            .join(" + ");
          setGoogleDurationText(combinedDuration);

          data.segments.forEach((seg) => {
            totalMinutes += parseDurationToMinutes(seg.durationText);
          });

          const totalMiles = data.segments.reduce(
            (sum, seg) => sum + (seg.miles || 0),
            0,
          );
          setGoogleDistanceText(`${totalMiles.toFixed(1)} mi`);
        } else if (data.durationText) {
          setGoogleDurationText(data.durationText);
          totalMinutes = parseDurationToMinutes(data.durationText);
        }

        if (totalMinutes > 0) {
          const rawGoogleMinutes = totalMinutes;
          setInitialGoogleMinutes(rawGoogleMinutes);

          totalMinutes = Math.max(120, Math.ceil(totalMinutes / 30) * 30);

          setEstimatedHours(Math.floor(totalMinutes / 60));
          setEstimatedMinutes(totalMinutes % 60);
        }

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

    // Minimum time frame will always be 2 hours (120 minutes)
    // Also shouldn't go below what Google estimated (rounded up)
    const googleMin = Math.max(120, Math.ceil(initialGoogleMinutes / 30) * 30);
    if (totalMinutes < googleMin) totalMinutes = googleMin;

    setEstimatedHours(Math.floor(totalMinutes / 60));
    setEstimatedMinutes(totalMinutes % 60);
  };

  const handleContinue = () => {
    if (items.length === 0) {
      toast.error("Please add at least one item to your inventory before continuing.");
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
      floorAccess,
    };
    localStorage.setItem("widgetInventoryData", JSON.stringify(inventoryData));

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
    <div className="px-4 md:px-8 2xl:max-w-7xl 2xl:mx-auto">

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
                className="px-4 py-2 cursor-pointer bg-(--light-gray) text-(--white) rounded-lg hover:bg-(--dark-grey) transition-colors"
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
                <span className="widget-value-text-sm text-gray-900">{item.name}</span>
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
      />

      <div className="bg-gray-900 rounded-lg md:p-8 p-3 mb-6 relative overflow-hidden">
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
              <span className="widget-value-large text-6xl text-(--white)">:</span>
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

        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="widget-description text-gray-400 text-center">
            Additional time charges
          </p>
          <p className="widget-price-large text-(--white) text-center">
            £{additionalFare.toFixed(2)}
          </p>
        </div>
      </div>

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

      <div className="flex justify-end">
        <button onClick={handleContinue} className="btn btn-primary">
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default WidgetInventory;