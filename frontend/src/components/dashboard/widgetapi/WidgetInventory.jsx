import React, { useState, useEffect } from "react";
import { Plus, Minus, Clock, User, ArrowLeft } from "lucide-react";

const WidgetInventory = ({ companyId, onContinue, onBack }) => {
    const selectedVehicle = JSON.parse(localStorage.getItem("selectedVehicle") || "{}");
    const totalSeats = selectedVehicle.passengerSeats || 0;

    const [pickupFloor, setPickupFloor] = useState(0);
    const [dropoffFloor, setDropoffFloor] = useState(2);
    const [pickupAccess, setPickupAccess] = useState("LIFT");
    const [dropoffAccess, setDropoffAccess] = useState("STAIRS");
    const [estimatedHours, setEstimatedHours] = useState(4);
    const [estimatedMinutes, setEstimatedMinutes] = useState(30);
    const [ridingAlong, setRidingAlong] = useState(true);
    const [passengerCount, setPassengerCount] = useState(1);

    useEffect(() => {
        if (passengerCount > totalSeats) {
            setPassengerCount(totalSeats);
        }
    }, [totalSeats]);
    const [items, setItems] = useState([]);
    const [showItemInput, setShowItemInput] = useState(false);
    const [currentItem, setCurrentItem] = useState("");

    const adjustDuration = (increment) => {
        let totalMinutes = estimatedHours * 60 + estimatedMinutes;
        totalMinutes += increment ? 30 : -30;
        if (totalMinutes < 0) totalMinutes = 0;
        setEstimatedHours(Math.floor(totalMinutes / 60));
        setEstimatedMinutes(totalMinutes % 60);
    };

    const handleContinue = () => {
        // Save inventory data to localStorage
        const inventoryData = {
            pickupFloor,
            dropoffFloor,
            pickupAccess,
            dropoffAccess,
            estimatedHours,
            estimatedMinutes,
            ridingAlong,
            passengerCount,
        };
        localStorage.setItem("widgetInventoryData", JSON.stringify(inventoryData));

        // Navigate to payment
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
        setItems(items.filter(item => item.id !== id));
    };
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className=" mb-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 btn btn-edit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back to Vehicle Selection</span>
                    </button>


                </div>
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Inventory & Requirements
                    </h1>
                </div>

                <p className="text-gray-600 mb-8">
                    Step 3: Survey your moving scope and our availability
                </p>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Item Inventory</h2>
                        <button
                            onClick={() => setShowItemInput(!showItemInput)}
                            className="flex cursor-pointer items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add Item</span>
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
                                    className="px-4 py-2 cursor-pointer bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Add
                                </button>
                                <button
                                    onClick={() => {
                                        setShowItemInput(false);
                                        setCurrentItem("");
                                    }}
                                    className="px-4 cursor-pointer py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
                                    className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg"
                                >
                                    <span className="text-gray-900 font-medium">{item.name}</span>
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        className="text-red-600 cursor-pointer hover:text-red-800 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {items.length === 0 && !showItemInput && (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">No items added yet. Click "Add Item" to get started.</p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Floor & Accessibility</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                    Pickup Location
                                </span>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-2">Floor Level</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setPickupFloor(Math.max(0, pickupFloor - 1))}
                                        className="w-10 h-10 cursor-pointer flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Minus className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <div className="flex-1 text-center">
                                        <span className="text-2xl font-bold text-gray-900">{pickupFloor}</span>
                                    </div>
                                    <button
                                        onClick={() => setPickupFloor(pickupFloor + 1)}
                                        className="w-10 h-10 cursor-pointer flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Access Type</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPickupAccess("LIFT")}
                                        className={`flex-1 cursor-pointer px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${pickupAccess === "LIFT"
                                            ? "bg-gray-900 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        LIFT
                                    </button>
                                    <button
                                        onClick={() => setPickupAccess("STAIRS")}
                                        className={`flex-1 cursor-pointer px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${pickupAccess === "STAIRS"
                                            ? "bg-gray-900 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        STAIRS
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Drop-off Location */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-4 h-4 text-gray-600" />
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                                    Drop-off Location
                                </span>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm text-gray-600 mb-2">Floor Level</label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setDropoffFloor(Math.max(0, dropoffFloor - 1))}
                                        className="w-10 cursor-pointer h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Minus className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <div className="flex-1 text-center">
                                        <span className="text-2xl font-bold text-gray-900">{dropoffFloor}</span>
                                    </div>
                                    <button
                                        onClick={() => setDropoffFloor(dropoffFloor + 1)}
                                        className="w-10 cursor-pointer h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-600 mb-2">Access Type</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setDropoffAccess("LIFT")}
                                        className={`flex-1 cursor-pointer  px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${dropoffAccess === "LIFT"
                                            ? "bg-gray-900 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        LIFT
                                    </button>
                                    <button
                                        onClick={() => setDropoffAccess("STAIRS")}
                                        className={`flex-1 cursor-pointer px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${dropoffAccess === "STAIRS"
                                            ? "bg-gray-900 text-white"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        STAIRS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estimated Duration Section */}
                <div className="bg-gray-900 rounded-lg md:p-8 p-3 mb-6 relative overflow-hidden">
                    <div className="text-center mb-4">
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-6">
                            Estimated Duration
                        </p>

                        <div className="flex items-center justify-center gap-6 mb-6">
                            <button
                                onClick={() => adjustDuration(false)}
                                className="md:w-12 w-8 cursor-pointer md:h-12 h-8 flex items-center justify-center border-2 border-gray-700 rounded-full hover:border-gray-500 transition-colors"
                            >
                                <Minus className="w-5 h-5 text-white" />
                            </button>

                            <div className="flex items-center gap-2">
                                <span className="text-6xl font-bold text-white tabular-nums">
                                    {String(estimatedHours).padStart(2, "0")}
                                </span>
                                <span className="text-6xl font-bold text-white">:</span>
                                <span className="text-6xl font-bold text-white tabular-nums">
                                    {String(estimatedMinutes).padStart(2, "0")}
                                </span>
                            </div>

                            <button
                                onClick={() => adjustDuration(true)}
                                className="md:w-12 w-8 cursor-pointer md:h-12 h-8 flex items-center justify-center border-2 border-gray-700 rounded-full hover:border-gray-500 transition-colors"
                            >
                                <Plus className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        <p className="text-gray-500 text-xs uppercase tracking-wide mb-4">
                            Hours : Minutes
                        </p>
                    </div>

                    <p className="text-center text-gray-400 text-xs">
                        Adjustments vary ±30-minute increments
                    </p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Travel Preference</h2>

                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="font-semibold text-gray-900 mb-1">
                                Riding along with the vehicle?
                            </p>
                            <p className="text-sm text-gray-600">
                                Update passenger seating availability for truck cabin
                            </p>
                        </div>
                        <button
                            onClick={() => setRidingAlong(!ridingAlong)}
                            className={`
    relative
    w-14 h-7
     md:h-8
    rounded-full
    transition-colors duration-300
    ${ridingAlong ? "bg-gray-900" : "bg-gray-300"}
  `}
                        >
                            <span
                                className={`
      absolute
      top-1
      left-1
      w-5 h-5
      md:w-6 md:h-6
      bg-white
      rounded-full
      shadow
      transition-transform duration-300
      ${ridingAlong ? "translate-x-4 md:translate-x-6" : "translate-x-0"}
    `}
                            />
                        </button>
                    </div>

                    {ridingAlong && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <User className="w-5 h-5 text-gray-600" />
                                    <div>
                                        <span className="font-medium text-gray-900">Passenger Count</span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">
                                            Max {totalSeats} seats available
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        disabled={passengerCount <= 0}
                                        onClick={() => setPassengerCount(Math.max(0, passengerCount - 1))}
                                        className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${passengerCount <= 0 ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                                    >
                                        <Minus className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <span className="text-xl font-bold text-gray-900 w-8 text-center">
                                        {passengerCount}
                                    </span>
                                    <button
                                        disabled={passengerCount >= totalSeats}
                                        onClick={() => setPassengerCount(Math.min(totalSeats, passengerCount + 1))}
                                        className={`w-8 h-8 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors ${passengerCount >= totalSeats ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                                    >
                                        <Plus className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                            {totalSeats === 0 && (
                                <p className="text-[10px] text-rose-500 font-bold italic mt-2">
                                    * This vehicle does not support passenger ride-along.
                                </p>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-end">
                    <button onClick={handleContinue} className="btn btn-primary">Continue to Payment</button>
                </div>
            </div>
        </div>
    );
};

export default WidgetInventory;