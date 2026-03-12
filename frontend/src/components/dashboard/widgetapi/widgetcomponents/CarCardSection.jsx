import React, { useState, useEffect } from "react";
import IMAGES from "../../../../assets/images";

const CarCardSection = ({
  carList,
  selectedCarId,
  onSelect,
  onBook,
  onHelpSelect,
  currencySymbol = "$",
  savedExtraHelpPrice = null,
  googleMinutes = 0,
  roundedGoogleMinutes = 0,
}) => {
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    const defaults = { ...selectedOptions };
    let changed = false;

    carList.forEach((car) => {
      if (
        car._id === selectedCarId &&
        savedExtraHelpPrice !== null &&
        savedExtraHelpPrice !== undefined
      ) {
        return;
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
        onHelpSelect?.(defaults[selectedCarId]);
      }
    }
  }, [carList, selectedCarId, savedExtraHelpPrice]);

  const handleHelpChange = (carId, option) => {
    const newOptions = {
      ...selectedOptions,
      [carId]: option,
    };
    setSelectedOptions(newOptions);

    if (carId === selectedCarId) {
      onHelpSelect?.(option);
    }
  };

  const handleCarSelect = (carId) => {
    onSelect(carId);
    if (selectedOptions[carId]) {
      onHelpSelect?.(selectedOptions[carId]);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {carList.map((car) => {
        const {
          _id,
          vehicleName = "Unnamed Vehicle",
          description = "",
          passengerSeats = 0,
          price: basePrice = 0,
        } = car;

        const validImage = car.image || car.profilecarimg || IMAGES.profilecarimg;
        const isSelected = selectedCarId === _id;

        const helpOptions = car.extraHelp?.length
          ? car.extraHelp.map((h, i) => ({ id: `help-${_id}-${i}`, label: h.label, price: h.price }))
          : [
            { id: `help-${_id}-self`, label: "Self Load", price: 0 },
            { id: `help-${_id}-driver`, label: "Driver help", price: 20 },
            { id: `help-${_id}-2men`, label: "2 Men Team", price: 50 },
            { id: `help-${_id}-3men`, label: "3 Men Team", price: 100 },
          ];

        let activeOption = selectedOptions[_id];
        if (
          _id === selectedCarId &&
          savedExtraHelpPrice !== null &&
          savedExtraHelpPrice !== undefined
        ) {
          const matchByPrice = helpOptions.find(
            (opt) => Number(opt.price) === Number(savedExtraHelpPrice)
          );
          if (matchByPrice) {
            activeOption = matchByPrice;
          }
        }

        if (!activeOption) {
          activeOption =
            helpOptions[0] || {
              id: `help-${_id}-self`,
              label: "Self Load",
              price: 0,
            };
        }

        const durationUnits = Math.ceil(roundedGoogleMinutes / 30);
        const fullDurationCharge = durationUnits * (car.halfHourPrice || 0);
        const currentTotalPrice = basePrice + fullDurationCharge + (activeOption?.price || 0);

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
                  <h3 className="widget-title text-gray-900">
                    {vehicleName}
                  </h3>
                  <div className="flex gap-3 mt-1.5 widget-meta-text text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className="w-1 h-1 rounded-full bg-gray-300" /> {passengerSeats} Seats
                    </span>

                  </div>
                </div>
                <div className="text-right">
                  <div className="widget-price-large text-(--main-color)">
                    {currencySymbol} {Math.round(currentTotalPrice)}
                  </div>
                  <p className="widget-label-tiny mt-0.5">Total Fare</p>
                </div>
              </div>

              <div className="my-2">
                <p className="widget-description">
                  {description || "Great for small apartments, studio moves, or picking up large furniture items."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="widget-label-tiny flex items-center gap-2">
                  <span className="w-4 h-px bg-gray-200" /> Who's helping with the move?
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
                    onBook();
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