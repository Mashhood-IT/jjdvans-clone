import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLoading } from "../../common/LoadingProvider";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";

import JourneyDetailsModal from "./JourneyDetailsModal";
import BookingsFilters from "./BookingsFilters";
import BookingsTable from "./BookingsTable";
import AuditModal from "./AuditModal";
import NewBooking from "./NewBooking";

import CustomModal from "../../constants/constantcomponents/CustomModal";
import OutletHeading from "../../constants/constantcomponents/OutletHeading";
import { actionMenuItems } from "../../constants/dashboardTabsData/data";

const BookingsList = () => {
  const user = useSelector((state) => state.auth.user);
  const { showLoading, hideLoading } = useLoading();
  const { data: allBookings = [], isLoading, refetch } = useGetAllBookingsQuery();
  console.log(allBookings)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [assignedDrivers, setAssignedDrivers] = useState([
    { _id: "1", name: "John Driver" },
    { _id: "2", name: "Ali Khan" },
  ]);

  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedActionRow, setSelectedActionRow] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditData, setAuditData] = useState([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewData, setViewData] = useState([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectedPassengers, setSelectedPassengers] = useState([]);
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState([]);
  const [showDiv, setShowDiv] = useState(false);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [showKeyboardModal, setShowKeyboardModal] = useState(false);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
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

  const rawfutureBookingsCount = allBookings.filter((b) => {
    const journey = b.primaryJourney;
    if (!journey?.date) return false;
    const bookingDate = new Date(journey.date);
    return bookingDate >= today;
  });

  const futureBookingsCount = rawfutureBookingsCount.length;



  const passengerMap = new Map();
  allBookings.forEach((booking) => {
    const p = booking.passenger;
    if (p?.name && !passengerMap.has(p.name)) {
      passengerMap.set(p.name, { label: p.name, value: p.name });
    }
  });

  const passengerList = Array.from(passengerMap.values());

  const vehicleMap = new Map();
  allBookings.forEach((booking) => {
    const v = booking.vehicle;
    if (v?.vehicleName && !vehicleMap.has(v.vehicleName)) {
      vehicleMap.set(v.vehicleName, {
        label: v.vehicleName,
        value: v.vehicleName,
      });
    }
  });

  const vehicleList = Array.from(vehicleMap.values());

  const openAuditModal = (audit) => {
    setAuditData(audit || []);
    setShowAuditModal(true);
    setSelectedActionRow(null);
  };

  const openViewModal = (view) => {
    setViewData(view || []);
    setShowViewModal(true);
    setSelectedActionRow(null);
  };

  const openCompletionModal = (booking) => {
    setCompletionData(booking);
    setShowCompletionModal(true);
    setSelectedActionRow(null);
  };

  const openDriverModal = (driverName) => {
    setSelectedDriver(driverName);
    setShowDriverModal(true);
  };

  const isAnyModalOpen =
    showViewModal ||
    showCompletionModal ||
    showDriverModal ||
    showKeyboardModal ||
    showColumnModal ||
    showEditModal;

  return (
    <>
      <OutletHeading name="Bookings List" />

      <BookingsFilters
        futureCount={futureBookingsCount}
        assignedDrivers={assignedDrivers}

        selectedDrivers={selectedDrivers}
        setSelectedDrivers={setSelectedDrivers}
        selectedPassengers={selectedPassengers}
        setSelectedPassengers={setSelectedPassengers}
        selectedVehicleTypes={selectedVehicleTypes}
        setSelectedVehicleTypes={setSelectedVehicleTypes}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        showDiv={showDiv}
        setShowDiv={setShowDiv}
        setShowColumnModal={setShowColumnModal}
        setShowKeyboardModal={setShowKeyboardModal}
        passengerList={passengerList}
        vehicleList={vehicleList}
      />

      <BookingsTable
        filteredBookings={allBookings}
        startDate={startDate}
        endDate={endDate}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        sortConfig={sortConfig}
        setSortConfig={setSortConfig}
        selectedActionRow={selectedActionRow}
        setSelectedActionRow={setSelectedActionRow}
        openAuditModal={openAuditModal}
        openViewModal={openViewModal}
        openDriverModal={openDriverModal}
        actionMenuItems={actionMenuItems}
        setEditBookingData={setEditBookingData}
        setShowEditModal={setShowEditModal}

        selectedPassengers={selectedPassengers}
        selectedVehicleTypes={selectedVehicleTypes}
        setShowViewModal={setShowViewModal}
        setShowAuditModal={setShowAuditModal}
        setShowDriverModal={setShowDriverModal}
        openCompletionModal={openCompletionModal}
        isAnyModalOpen={isAnyModalOpen}
        selectedDrivers={selectedDrivers}
        setSelectedDrivers={setSelectedDrivers}
      />

      <CustomModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        heading="Journey Details"
      >
        <JourneyDetailsModal viewData={viewData} />
      </CustomModal>

      <CustomModal
        isOpen={showColumnModal}
        onClose={() => setShowColumnModal(false)}
        heading="Column Visibility"
      >
        Column settings here
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

export default BookingsList;