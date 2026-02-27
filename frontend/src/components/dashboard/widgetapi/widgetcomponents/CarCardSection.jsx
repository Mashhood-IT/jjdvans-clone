import React, { useState, useEffect } from "react";
import IMAGES from "../../../../assets/images";

const CarCardSection = ({
  carList,
  selectedCarId,
  onSelect,
  onBook,
  onHelpSelect,
  currencySymbol = "$",
}) => {
  const [selectedOptions, setSelectedOptions] = useState({});

  // Initialize defaults: Select the first help option for each car if not already selected
  useEffect(() => {
    const defaults = { ...selectedOptions };
    let changed = false;
    carList.forEach((car) => {
      if (!defaults[car._id]) {
        // Find if vehicle has predefined extraHelp, else fallback to dummy defaults
        const firstOption = car.extraHelp?.[0] ? 
          { ...car.extraHelp[0], id: `help-${car._id}-0` } : 
          { id: `help-${car._id}-self`, label: "No I will do it myself. Selfload", price: 0 };
        
        defaults[car._id] = firstOption;
        changed = true;
      }
    });
    if (changed) {
      setSelectedOptions(defaults);
      // If we have a selected car, notify parent of its default help price
      if (selectedCarId && defaults[selectedCarId]) {
        onHelpSelect?.(defaults[selectedCarId]);
      }
    }
  }, [carList, selectedCarId]);

  const handleHelpChange = (carId, option) => {
    const newOptions = {
      ...selectedOptions,
      [carId]: option,
    };
    setSelectedOptions(newOptions);
    
    // Only notify parent if this is the currently selected car
    if (carId === selectedCarId) {
      onHelpSelect?.(option);
    }
  };

  const handleCarSelect = (carId) => {
    onSelect(carId);
    // When switching cars, notify parent of this car's selected help price
    if (selectedOptions[carId]) {
      onHelpSelect?.(selectedOptions[carId]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {carList.map((car) => {
        const {
          _id,
          vehicleName = "Unnamed Vehicle",
          description = "",
          passengers = 0,
          checkinLuggage = 0,
          price: basePrice = 0,
        } = car;

        const activeOption = selectedOptions[_id] || (car.extraHelp?.[0] ? { ...car.extraHelp[0], id: `help-${_id}-0` } : { label: "Standard", price: 0, id: `help-${_id}-0` });
        const currentTotalPrice = basePrice + (activeOption.price || 0);

        const validImage = car.image || car.profilecarimg || IMAGES.profilecarimg;
        const isSelected = selectedCarId === _id;

        const helpOptions = car.extraHelp?.length
          ? car.extraHelp.map((h, i) => ({ id: `help-${_id}-${i}`, label: h.label, price: h.price }))
          : [
            { id: `help-${_id}-self`, label: "No I will do it myself. Selfload", price: 0 },
            { id: `help-${_id}-driver`, label: "Driver help. I will help the driver with heavy item(s)", price: 20 },
            { id: `help-${_id}-2men`, label: "2 Men Team. I don’t need to lift a finger", price: 50 },
            { id: `help-${_id}-3men`, label: "3 Men Team. I am the boss, bring me the red carpet", price: 100 },
          ];

        return (
          <div
            key={_id}
            className={`group rounded-2xl transition-all duration-300 overflow-hidden border-2 bg-white ${isSelected
              ? "border-(--main-color) shadow-xl ring-1 ring-(--main-color)/20"
              : "border-gray-100 hover:border-gray-200 hover:shadow-lg"
              }`}
            onClick={() => handleCarSelect(_id)}
          >
            <div className="grid grid-cols-1 md:grid-cols-12">
              <div className="md:col-span-4 bg-gray-50/50 p-6 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-gray-100">
                <img
                  src={validImage}
                  alt={vehicleName}
                  className="w-full h-40 object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => (e.currentTarget.src = "/placeholder-car.png")}
                />
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isSelected ? "bg-(--main-color) text-white" : "bg-gray-100 text-gray-500"
                    }`}>
                    {isSelected ? "Selected" : "Available"}
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                      {vehicleName}
                    </h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        {passengers} Seats
                      </span>
                      <span className="flex items-center gap-1.5">
                        {checkinLuggage} Bags
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-black text-(--main-color)">
                      {currencySymbol}{currentTotalPrice.toFixed(2)}
                    </span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Total Price</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100 italic">
                    {description || "Great for small apartments, studio moves, or picking up large furniture items. Professional service guaranteed."}
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">
                    Service Level
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" onClick={(e) => e.stopPropagation()}>
                    {helpOptions.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center justify-center p-2.5 rounded-xl border-2 transition-all cursor-pointer ${activeOption.id === option.id
                          ? "border-(--main-color) bg-(--main-color)/5 text-(--main-color) ring-2 ring-(--main-color)/10"
                          : "border-gray-100 hover:border-gray-200 bg-white"
                          }`}
                      >
                        <input
                          type="radio"
                          name={`help-${_id}`}
                          className="hidden"
                          checked={activeOption.id === option.id}
                          onChange={() => handleHelpChange(_id, option)}
                        />
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-[11px] font-bold whitespace-nowrap">{option.label}</span>
                          {option.price > 0 && (
                            <span className="text-[9px] font-black text-(--main-color)">+{currencySymbol}{option.price}</span>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCarSelect(_id);
                      onBook();
                    }}
                    className={`btn ${isSelected
                      ? " btn-success"
                      : "btn-back"
                      }`}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CarCardSection;