import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Icons from "../../../assets/icons";
import SelectedSearch from "../../constants/constantcomponents/SelectedSearch";
import SelectDateRange from "../../constants/constantcomponents/SelectDateRange";

const BookingsFilters = ({
  selectedPassengers,
  setSelectedPassengers,
  selectedVehicleTypes,
  setSelectedVehicleTypes,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  passengerList,
  vehicleList,
}) => {

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between w-full mb-4">
        <div className="flex flex-row flex-wrap gap-y-3 gap-x-2 items-center w-full">
          <div className="flex gap-2 ">
            <Link to="/dashboard/new-booking">
              <button
                title="Add New Booking"
                className="icon-box icon-box-primary"
              >
                <Icons.Plus size={17} />
              </button>
            </Link>

          </div>

          <div className="flex-1 min-w-45 lg:w-72 lg:flex-none">
            <SelectDateRange
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </div>
          <div className="w-full sm:w-64">
            <SelectedSearch
              selected={selectedPassengers}
              setSelected={setSelectedPassengers}
              statusList={passengerList}
              placeholder="Select Passenger"
              showCount={false}
            />
          </div>
          <div className="w-full sm:w-64">
            <SelectedSearch
              selected={selectedVehicleTypes}
              setSelected={setSelectedVehicleTypes}
              statusList={vehicleList}
              placeholder="Select Vehicle"
              showCount={false}
            />
          </div>

        </div>

      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">


      </div>
    </>
  );
};

export default BookingsFilters;