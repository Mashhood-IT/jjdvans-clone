import React, { useState, useEffect } from "react";
import IMAGES from "../../../../assets/images";
import Icons from "../../../../assets/icons";
import { formatMinutesToHM } from "../../../../utils/durationHelper";

const CarCardSection = ({
  carList,
  selectedCarId,
  onSelect,
  onBook,
  onHelpSelect,
  currencySymbol = "$",
  savedExtraHelpPrice = null,
  savedExtraHelpLabel = null,
  roundedGoogleMinutes = 0,
}) => {
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    const defaults = { ...selectedOptions };
    let changed = false;
    const durationUnits = Math.ceil(roundedGoogleMinutes / 30);

    carList.forEach((car) => {
      const isSelected = car._id === selectedCarId;

      if (
        isSelected &&
        (savedExtraHelpPrice !== null || savedExtraHelpLabel)
      ) {
        const carHelpOptions = car.extraHelp?.length
          ? car.extraHelp.map((h, i) => ({ id: `help-${car._id}-${i}`, label: h.label, price: h.price }))
          : [
            { id: `help-${car._id}-self`, label: "Self Load", price: 0 },
            { id: `help-${car._id}-driver`, label: "Driver help", price: 20 },
            { id: `help-${car._id}-2men`, label: "2 Men Team", price: 50 },
            { id: `help-${car._id}-3men`, label: "3 Men Team", price: 100 },
          ];

        let match = null;
        if (savedExtraHelpLabel) {
          match = carHelpOptions.find(opt =>
            opt.label?.toLowerCase() === savedExtraHelpLabel.toLowerCase()
          );
        }

        if (!match && savedExtraHelpPrice !== null) {
          match = carHelpOptions.find(opt =>
            Math.round(opt.price * durationUnits) === Math.round(savedExtraHelpPrice)
          );
        }

        if (match) {
          if (!defaults[car._id] || defaults[car._id].label !== match.label) {
            defaults[car._id] = match;
            changed = true;
          }
        }
      }

      if (!defaults[car._id]) {
        const firstOption = car.extraHelp?.[0]
          ? { ...car.extraHelp[0], id: `help-${car._id}-0` }
          : {
            id: `help-${car._id}-self`,
            label: "Self Load (I will do it myself)",
            price: 0,
          };

        defaults[car._id] = firstOption;
        changed = true;
      }
    });

    if (changed) {
      setSelectedOptions(defaults);
      if (selectedCarId && defaults[selectedCarId]) {
        const opt = defaults[selectedCarId];
        onHelpSelect?.({ ...opt, totalPrice: opt.price * durationUnits, unitPrice: opt.price });
      }
    }
  }, [carList, selectedCarId, savedExtraHelpPrice, savedExtraHelpLabel, roundedGoogleMinutes]);

  const handleHelpChange = (carId, option) => {
    const newOptions = {
      ...selectedOptions,
      [carId]: option,
    };
    setSelectedOptions(newOptions);
    if (carId !== selectedCarId) {
      onSelect(carId);
    }

    const durationUnits = Math.ceil(roundedGoogleMinutes / 30);
    const totalPrice = option.price * durationUnits;
    onHelpSelect?.({ ...option, totalPrice, unitPrice: option.price });
  };

  const handleCarSelect = (carId) => {
    onSelect(carId);
    if (selectedOptions[carId]) {
      const option = selectedOptions[carId];
      const durationUnits = Math.ceil(roundedGoogleMinutes / 30);
      const totalPrice = option.price * durationUnits;
      onHelpSelect?.({ ...option, totalPrice, unitPrice: option.price });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {carList.map((car) => {
        const {
          _id,
          vehicleName = "Unnamed Vehicle",
          description = "",
          price: basePrice = 0,
        } = car;

        const validImage = car.image || car.profilecarimg || IMAGES.dummyVan;
        const isSelected = selectedCarId === _id;

        const helpOptions = car.extraHelp?.length
          ? car.extraHelp.map((h, i) => ({ id: `help-${_id}-${i}`, label: h.label, price: h.price }))
          : [
            { id: `help-${_id}-self`, label: "Self Load", price: 0 },
            { id: `help-${_id}-driver`, label: "Driver help", price: 20 },
            { id: `help-${_id}-2men`, label: "2 Men Team", price: 50 },
            { id: `help-${_id}-3men`, label: "3 Men Team", price: 100 },
          ];

        if (!_id) return null;
        const activeOption = selectedOptions[_id] || helpOptions[0] || {
          id: `help-${_id}-self`,
          label: "Self Load",
          price: 0,
        };
        const durationUnits = Math.ceil(roundedGoogleMinutes / 30);

        const fullDurationCharge = durationUnits * (car.halfHourPrice || 0);
        const totalExtraHelpPrice = durationUnits * (activeOption?.price || 0);
        const currentTotalPrice = basePrice + fullDurationCharge + totalExtraHelpPrice;

        return (
          <div
            key={_id}
            className={`group rounded-2xl transition-all duration-300 border-2 bg-(--white) flex flex-col ${isSelected
              ? "border-(--main-color) shadow-xl ring-1 ring-(--main-color)/20 scale-[1.02]"
              : "border-gray-100 hover:border-gray-200 hover:shadow-lg"
              }`}
            onClick={() => handleCarSelect(_id)}
          >
            <div className="bg-(--lighter-gray)/50 p-4 flex items-center justify-center relative border-b border-gray-100 aspect-video">
              <img
                src={validImage}
                alt={vehicleName}
                className="object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                onError={(e) => (e.currentTarget.src = "/placeholder-car.png")}
              />
              <div className="absolute top-4 left-4">
                {car.quantity && (
                  <div className="text-left">
                    <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-(--lighter-blue) text-(--navy-blue)">
                      Available Drivers: {car.quantity}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute top-4 right-4">
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isSelected ? "bg-(--main-color) text-(--white)" : "bg-gray-100 text-gray-500"
                  }`}>
                  {isSelected ? "Selected" : "Available"}
                </div>
              </div>
            </div>

            <div className="p-4 flex flex-col grow">
              <div className="flex justify-between items-start mb-2 min-h-12.5">
                <div>
                  <h3 className="widget-title text-(--dark-grey)">
                    {vehicleName}
                  </h3>
                  <div className="flex md:mt-0 mt-1 items-center space-x-2">
                    <span className="text-xs font-semibold text-(--medium-grey) tracking-wider">
                      Booked Hours:
                    </span>
                    <p className="text-xs font-bold text-(--dark-grey)">
                      {(() => {
                        const { hours, minutes } = formatMinutesToHM(roundedGoogleMinutes);
                        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
                      })()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-(--main-color)">
                    {currencySymbol} {Math.round(Number(currentTotalPrice)).toFixed(2)}
                  </div>
                  <p className="md:mt-0 mt-1 text-(--medium-grey) text-xs mt-0.5">Min. 2 hours</p>
                </div>
              </div>

              <div className="my-2">
                <p className="widget-description">
                  {description || "Great for small apartments, studio moves, or picking up large furniture items."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="widget-label-tiny flex items-center gap-2">
                  Who's helping with the move?
                </h4>
                <div className={`grid gap-2 ${helpOptions.length === 1 ? "grid-cols-1 max-w-50 mx-auto" : "grid-cols-2"}`} onClick={(e) => e.stopPropagation()}>
                  {helpOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex flex-col items-center justify-center p-1.5 rounded-lg border-2 transition-all cursor-pointer text-center ${activeOption.id === option.id
                        ? "border-(--main-color) bg-(--main-color)/5 text-(--main-color)"
                        : "border-gray-100 hover:border-gray-200 bg-(--white)"
                        }`}
                    >
                      <input
                        type="radio"
                        name={`help-${_id}`}
                        className="hidden"
                        checked={activeOption.id === option.id}
                        onChange={() => handleHelpChange(_id, option)}
                      />
                      <span className="widget-option-text flex items-center justify-center">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4 flex justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCarSelect(_id);
                    onBook(_id, activeOption);
                  }}
                  className={`btn ${isSelected
                    ? "btn-success"
                    : "btn-back"
                    }`}
                >
                  {isSelected ? "Continue Booking" : "Select & Book"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CarCardSection;