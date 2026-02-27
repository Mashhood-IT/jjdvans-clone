import React, { useEffect, useState } from "react";
import Icons from "../../../../assets/icons";
import { toast } from "react-toastify";
import IMAGES from "../../../../assets/images";
import SelectOption from "../../../constants/constantcomponents/SelectOption";

const VehicleSelection = ({
  setSelectedVehicle,
  setVehicleExtras,
  editBookingData,
}) => {
  const [localSelectedVehicle, setLocalSelectedVehicle] = useState(null);
  const [open, setOpen] = useState(false);
  const [showChildSeats, setShowChildSeats] = useState(false);
  const [selections, setSelections] = useState({
    passenger: 0,
    childSeat: 0,
    babySeat: 0,
    carSeat: 0,
    boosterSeat: 0,
    handLuggage: 0,
    checkinLuggage: 0,
  });

  // const { data: vehicleOptions = [], isLoading } = useGetAllVehiclesQuery();

  const vehicleOptions = [
  {
    _id: "1",
    vehicleName: "Standard Saloon",
    passengers: 4,
    childSeat: 2,
    handLuggage: 2,
    checkinLuggage: 2,
    image: "",
    slabs: [],
  },
  {
    _id: "2",
    vehicleName: "Estate",
    passengers: 4,
    childSeat: 2,
    handLuggage: 3,
    checkinLuggage: 3,
    image: "",
    slabs: [],
  },
  {
    _id: "3",
    vehicleName: "MPV",
    passengers: 6,
    childSeat: 3,
    handLuggage: 4,
    checkinLuggage: 4,
    image: "",
    slabs: [],
  },
  {
    _id: "4",
    vehicleName: "8 Seater",
    passengers: 8,
    childSeat: 4,
    handLuggage: 6,
    checkinLuggage: 6,
    image: "",
    slabs: [],
  },
];
const isLoading = false;

  useEffect(() => {
    if (
      typeof setSelectedVehicle !== "function" ||
      typeof setVehicleExtras !== "function"
    ) {
      return;
    }

    if (vehicleOptions.length > 0) {
      let defaultVehicle = vehicleOptions[0];

      if (editBookingData?.vehicle?.vehicleName) {
        const matched = vehicleOptions.find(
          (v) => v.vehicleName === editBookingData.vehicle.vehicleName,
        );
        if (matched) defaultVehicle = matched;

        const extras = {
          passenger: editBookingData.vehicle.passenger ?? 0,
          childSeat: editBookingData.vehicle.childSeat ?? 0,
          babySeat: editBookingData.vehicle.babySeat ?? 0,
          carSeat: editBookingData.vehicle.carSeat ?? 0,
          boosterSeat: editBookingData.vehicle.boosterSeat ?? 0,
          handLuggage: editBookingData.vehicle.handLuggage ?? 0,
          checkinLuggage: editBookingData.vehicle.checkinLuggage ?? 0,
        };
        setSelections(extras);
        setVehicleExtras(extras);
      }

      setLocalSelectedVehicle(defaultVehicle);
      setSelectedVehicle(defaultVehicle);
    }
  }, [vehicleOptions, editBookingData, setSelectedVehicle, setVehicleExtras]);

  const toggleDropdown = () => setOpen((prev) => !prev);

  const selectVehicle = (vehicle) => {
    setLocalSelectedVehicle(vehicle);
    setSelectedVehicle(vehicle);
    updateMaxValues(vehicle);
    setOpen(false);
  };

  const updateMaxValues = () => {
    const reset = {
      passenger: 0,
      childSeat: 0,
      babySeat: 0,
      carSeat: 0,
      boosterSeat: 0,
      handLuggage: 0,
      checkinLuggage: 0,
    };
    setSelections(reset);
    setVehicleExtras(reset);
  };

  const handleSelectChange = (type, value) => {
    const parsedValue = parseInt(value);

    let updated = {
      ...selections,
      [type]: parsedValue,
    };

    if (type === "passenger") {
      const totalChildSeats =
        updated.babySeat + updated.carSeat + updated.boosterSeat;
      if (totalChildSeats >= parsedValue && parsedValue > 0) {
        updated.babySeat = 0;
        updated.carSeat = 0;
        updated.boosterSeat = 0;
        updated.childSeat = 0;
        toast.warning("Passengers reduced. Child seats have been reset.");
      }
    }

    if (["babySeat", "carSeat", "boosterSeat"].includes(type)) {
      const newTotal =
        (updated.babySeat || 0) +
        (updated.carSeat || 0) +
        (updated.boosterSeat || 0);

      if (newTotal >= selections.passenger && selections.passenger > 0) {
        toast.error(
          "Total child seats must be less than the number of passengers.",
        );
        return;
      }

      const maxAllowedTotal = localSelectedVehicle?.childSeat ?? 0;
      if (newTotal > maxAllowedTotal) {
        toast.error(
          `This vehicle only supports up to ${maxAllowedTotal} child seats in total.`,
        );
        return;
      }

      updated.childSeat = newTotal;
    }

    setSelections(updated);
    setVehicleExtras(updated);
  };

  const getRemainingChildSeats = (currentKey) => {
    const maxSeatsRaw = localSelectedVehicle?.childSeat ?? 0;

    const maxSeats = Number(maxSeatsRaw);

    if (!Number.isFinite(maxSeats) || maxSeats < 0) {
      return [{ value: 0, label: "0" }];
    }

    const baby = Number(selections.babySeat || 0);
    const car = Number(selections.carSeat || 0);
    const booster = Number(selections.boosterSeat || 0);

    const usedSeats =
      (currentKey !== "babySeat" ? baby : 0) +
      (currentKey !== "carSeat" ? car : 0) +
      (currentKey !== "boosterSeat" ? booster : 0);

    const remaining = Math.max(maxSeats - usedSeats, 0);

    return Array.from({ length: remaining + 1 }, (_, n) => ({
      value: n,
      label: n.toString(),
    }));
  };

  if (!isLoading && vehicleOptions.length === 0) {
    return (
      <div className="bg-(--white) shadow-lg rounded-2xl border border-(--lightest-gray) h-full flex flex-col">
        <div className="bg-(--mate-color) px-6 py-3 rounded-t-2xl">
          <h2 className="text-xl font-bold text-(--lightest-gray)">
            Vehicle Details
          </h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <img
            src={IMAGES.noCarFound}
            alt="No vehicles"
            className="w-20 h-20 opacity-70 mb-4"
          />
          <h3 className="text-lg font-semibold text-(--dark-gray)">
            No Vehicles Found
          </h3>
          <p className="text-(--dark-gray) mt-2 max-w-sm">
            There are no vehicles available yet. Please add vehicles in the
            system to proceed with booking.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-(--white) shadow-xl rounded-2xl border border-(--light-gray) overflow-hidden h-full">
        <div className="bg-(--mate-color) px-6 py-4">
          <h2 className="text-xl font-bold text-(--white)">
            Vehicle Details:-
          </h2>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div
              onClick={toggleDropdown}
              className="bg-(--lightest-gray) border-2 border-dashed border-(--light-gray) rounded-xl shadow-inner w-full h-44 flex items-center justify-center hover:border-(--main-color) hover:bg-(--lightest-gray) transition cursor-pointer"
            >
              {localSelectedVehicle?.image ? (
                <img
                  src={localSelectedVehicle.image}
                  alt={localSelectedVehicle?.vehicleName || "Vehicle"}
                  className="max-h-40 object-contain rounded-md"
                />
              ) : (
                <div className="flex flex-col items-center text-(--medium-grey)">
                  <img
                    src={IMAGES.noCarUploaded}
                    alt="No file"
                    className="w-12 h-12 mb-2 opacity-70"
                  />
                  <span className="text-sm font-medium">
                    No Vehicle Uploaded
                  </span>
                </div>
              )}
            </div>

            <div className="relative overflow-visible w-full">
              <button
                onClick={toggleDropdown}
                className="w-full cursor-pointer bg-(--mate-color) text-(--white) px-5 py-4 rounded-xl text-left shadow-md hover:shadow-lg hover:bg-(--mate-color) transition-all flex justify-between items-center"
              >
                <div className="flex flex-col w-full">
                  <div className="font-semibold text-sm flex justify-between items-center gap-2">
                    {localSelectedVehicle?.vehicleName || "Select a vehicle"}
                    <Icons.ChevronDown className="w-4 h-4 text-(--white)" />
                  </div>

                  <div className="grid grid-cols-4 gap-x-4 gap-y-2 text-xs text-(--light-gray) mt-3">
                    <span className="flex items-center gap-1">
                      <Icons.Users className="w-4 h-4" />
                      {localSelectedVehicle?.passengers ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.Baby className="w-4 h-4" />
                      {localSelectedVehicle?.childSeat ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.Briefcase className="w-4 h-4" />
                      {localSelectedVehicle?.handLuggage ?? 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icons.Luggage className="w-4 h-4" />
                      {localSelectedVehicle?.checkinLuggage ?? 0}
                    </span>
                  </div>
                </div>
              </button>

              {open && (
                <div className="absolute z-50 top-full mt-2 w-full bg-(--white) border border-(--light-gray) rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {vehicleOptions.map((vehicle, idx) => (
                    <button
                      key={vehicle._id || idx}
                      onClick={() => selectVehicle(vehicle)}
                      className="w-full cursor-pointer text-left px-4 py-3 hover:bg-(--lightest-blue) transition rounded-lg"
                    >
                      <div className="font-medium text-sm text-(--dark-gray)">
                        {vehicle.vehicleName}
                      </div>
                      <div className="grid grid-cols-4 gap-x-4 gap-y-2 mt-2 text-xs text-(--medium-grey)">
                        <span className="flex items-center gap-1">
                          <Icons.Users className="w-4 h-4" />
                          {vehicle.passengers}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Baby className="w-4 h-4" /> {vehicle.childSeat}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Briefcase className="w-4 h-4" />
                          {vehicle.handLuggage}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icons.Luggage className="w-4 h-4" />
                          {vehicle.checkinLuggage}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="w-full">
              <SelectOption
                label="No. of Passengers"
                options={[
                  ...Array((localSelectedVehicle?.passengers || 0) + 1).keys(),
                ].map((n) => ({
                  value: n,
                  label: n.toString(),
                }))}
                value={selections.passenger}
                onChange={(e) =>
                  handleSelectChange("passenger", e.target.value)
                }
              />
            </div>

            <div className="w-full">
              <SelectOption
                label="Hand Luggage"
                options={[
                  ...Array((localSelectedVehicle?.handLuggage || 0) + 1).keys(),
                ].map((n) => ({
                  value: n,
                  label: n.toString(),
                }))}
                value={selections.handLuggage}
                onChange={(e) =>
                  handleSelectChange("handLuggage", e.target.value)
                }
              />
            </div>

            <div className="w-full">
              <SelectOption
                label="Check-in Luggage"
                options={[
                  ...Array(
                    (localSelectedVehicle?.checkinLuggage || 0) + 1,
                  ).keys(),
                ].map((n) => ({
                  value: n,
                  label: n.toString(),
                }))}
                value={selections.checkinLuggage}
                onChange={(e) =>
                  handleSelectChange("checkinLuggage", e.target.value)
                }
              />
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default VehicleSelection;
