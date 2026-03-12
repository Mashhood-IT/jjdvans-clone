import React, { useState, useEffect } from "react";
import { useLoading } from "../../common/LoadingProvider";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";

import JourneyDetailsModal from "./JourneyDetailsModal";
import BookingsFilters from "./BookingsFilters";
import BookingsTable from "./BookingsTable";
import NewBooking from "./NewBooking";

import CustomModal from "../../constants/constantcomponents/CustomModal";
import OutletHeading from "../../constants/constantcomponents/OutletHeading";
import { actionMenuItems } from "../../constants/dashboardTabsData/data";

const CompletedBookings = () => {
  const { showLoading, hideLoading } = useLoading();
  const { data: allBookings = [], isLoading, refetch } = useGetAllBookingsQuery();

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedActionRow, setSelectedActionRow] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState([]);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBookingData, setEditBookingData] = useState(null);

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading]);

  const completedBookings = allBookings.filter((booking) => booking.status !== "New");

  const filteredBookings = completedBookings.filter((booking) => {
    if (startDate || endDate) {
      const journey = booking;
      if (!journey?.date) return false;

      const bookingDate = new Date(journey.date);
      bookingDate.setHours(0, 0, 0, 0);

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        if (bookingDate < start || bookingDate > end) return false;
      } else if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (bookingDate < start) return false;
      } else if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (bookingDate > end) return false;
      }
    }

    if (selectedPassengers.length > 0) {
      const passengerName = booking.passenger?.name;
      if (!passengerName || !selectedPassengers.includes(passengerName)) {
        return false;
      }
    }

    if (selectedVehicleTypes.length > 0) {
      const vehicleName = booking.vehicle?.vehicleName;
      if (!vehicleName || !selectedVehicleTypes.includes(vehicleName)) {
        return false;
      }
    }

    return true;
  });

  const passengerMap = new Map();
  completedBookings.forEach((booking) => {
    const p = booking.passenger;
    if (p?.name && !passengerMap.has(p.name)) {
      passengerMap.set(p.name, { label: p.name, value: p.name });
    }
  });

  const passengerList = Array.from(passengerMap.values());

  const vehicleMap = new Map();
  completedBookings.forEach((booking) => {
    const v = booking.vehicle;
    if (v?.vehicleName && !vehicleMap.has(v.vehicleName)) {
      vehicleMap.set(v.vehicleName, {
        label: v.vehicleName,
        value: v.vehicleName,
      });
    }
  });

  const vehicleList = Array.from(vehicleMap.values());

  const openViewModal = (view) => {
    setViewData(view || []);
    setShowViewModal(true);
    setSelectedActionRow(null);
  };

  const openCompletionModal = (booking) => {
    setShowCompletionModal(true);
    setSelectedActionRow(null);
  };

  const isAnyModalOpen =
    showViewModal ||
    showCompletionModal ||
    showDriverModal ||
    showEditModal;

  return (
    <>
      <OutletHeading name="Completed Bookings" />

      <BookingsFilters
        selectedPassengers={selectedPassengers}
        setSelectedPassengers={setSelectedPassengers}
        selectedVehicleTypes={selectedVehicleTypes}
        setSelectedVehicleTypes={setSelectedVehicleTypes}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        passengerList={passengerList}
        vehicleList={vehicleList}
      />

      <BookingsTable
        filteredBookings={filteredBookings}
        startDate={startDate}
        endDate={endDate}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        selectedActionRow={selectedActionRow}
        setSelectedActionRow={setSelectedActionRow}
        openViewModal={openViewModal}
        actionMenuItems={actionMenuItems}
        setEditBookingData={setEditBookingData}
        setShowEditModal={setShowEditModal}
        selectedPassengers={selectedPassengers}
        selectedVehicleTypes={selectedVehicleTypes}
        setShowViewModal={setShowViewModal}
        setShowDriverModal={setShowDriverModal}
        openCompletionModal={openCompletionModal}
        isAnyModalOpen={isAnyModalOpen}
      />

      <CustomModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        heading="Journey Details"
      >
        <JourneyDetailsModal viewData={viewData} />
      </CustomModal>

      <CustomModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        heading={editBookingData?._id ? "Edit Booking" : "New Booking"}
        modalClassName="max-w-5xl w-full max-h-full"
      >
        <NewBooking
          editBookingData={editBookingData}
          onClose={() => {
            setShowEditModal(false);
            refetch();
          }}
        />
      </CustomModal>
    </>
  );
};

export default CompletedBookings;