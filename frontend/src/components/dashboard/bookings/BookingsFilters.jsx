import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Icons from "../../../assets/icons";
import { useSelector } from "react-redux";

import SelectedSearch from "../../constants/constantcomponents/SelectedSearch";
import SelectDateRange from "../../constants/constantcomponents/SelectDateRange";

const BookingsFilters = ({
  futureCount,
  selectedDrivers,
  setSelectedDrivers,
  selectedPassengers,
  setSelectedPassengers,
  selectedVehicleTypes,
  setSelectedVehicleTypes,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  showDiv,
  setShowDiv,
  setShowColumnModal,
  setShowKeyboardModal,
  passengerList,
  vehicleList,
}) => {
  const user = useSelector((state) => state.auth.user);

  const driverListForFilter = [
    { label: "John Doe", value: "d1" },
    { label: "Ali Khan", value: "d2" },
    { label: "Sarah Ahmed", value: "d3" },
    { label: "Michael Smith", value: "d4" },
  ];

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between w-full mb-4">
        <div className="flex flex-row flex-wrap gap-y-3 gap-x-2 items-center w-full">
          <div className="flex gap-2 order-1">
            <Link to="/dashboard/bookings/new">
              <button
                title="Add New Booking"
                className="icon-box icon-box-primary"
              >
                <Icons.Plus size={17} />
              </button>
            </Link>
            <button
              className="icon-box icon-box-info"
              onClick={() => setShowDiv(!showDiv)}
              title="Additional Filters"
            >
              <Icons.Filter size={17} />
            </button>
          </div>

          <div className="flex-1 min-w-45 lg:w-72 lg:flex-none order-4 lg:order-3">
            <SelectDateRange
              futureCount={futureCount}
              startDate={startDate}
              placeholder="Select Driver"
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </div>
          <div className="flex gap-2 order-2 lg:order-4">
            <button
              onClick={() => setShowColumnModal(true)}
              className="icon-box icon-box-info"
              title="Column's Visibility"
            >
              <Icons.Columns3 size={17} />
            </button>
          
          </div>
        </div>
      </div>

      {showDiv && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
         
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
      )}
    </>
  );
};

export default BookingsFilters;