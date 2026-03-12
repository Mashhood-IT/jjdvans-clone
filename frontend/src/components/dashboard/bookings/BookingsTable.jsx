import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Icons from "../../../assets/icons";
import moment from "moment-timezone";
import BookingTableRenderer from "./bookingsTable/BookingTableRenderer";

const BookingsTable = ({
  assignedDrivers,
  selectedActionRow,
  setSelectedActionRow,
  openViewModal,
  actionMenuItems,
  setEditBookingData,
  setShowEditModal,
  selectedRow,
  setSelectedRow,
  openCompletionModal,
  filteredBookings,
}) => {
  const user = useSelector((state) => state.auth.user);
  const timezone = useSelector((state) => state.timezone?.timezone) || "UTC";
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });

  const tableHeaders = [
    { key: "bookingId", label: "Booking ID" },
    { key: "pickup", label: "Pickup" },
    { key: "dropoff", label: "Dropoff" },
    { key: "source", label: "Source" },
    { key: "passenger", label: "Passenger" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" },
    { key: "actions", label: "Actions" },
    { key: "vehicle", label: "Vehicle" },
    { key: "totalPrice", label: "Total Price" },
    { key: "paymentMethod", label: "Payment" },
    { key: "createdAt", label: "Created At" },
  ];
  const filteredTableHeaders = tableHeaders;
  const getErrMsg = (err) => err?.message || "Something went wrong";

  useEffect(() => {
    function handleDocClick(e) {
      if (selectedActionRow == null) return;

      const clickedTrigger = e.target.closest(".js-actions-trigger");
      const clickedMenu = e.target.closest(".js-actions-menu");
      if (!clickedTrigger && !clickedMenu) {
        setSelectedActionRow(null);
      }
    }

    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [selectedActionRow, setSelectedActionRow]);

  return (
    <>
      <BookingTableRenderer
        filteredTableHeaders={filteredTableHeaders}
        filteredBookings={filteredBookings}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        openViewModal={openViewModal}
        user={user}
        getErrMsg={getErrMsg}
        selectedActionRow={selectedActionRow}
        setSelectedActionRow={setSelectedActionRow}
        openCompletionModal={openCompletionModal}
        setEditBookingData={setEditBookingData}
        setShowEditModal={setShowEditModal}
        actionMenuItems={actionMenuItems}
        toast={toast}
        tooltip={tooltip}
        setTooltip={setTooltip}
        assignedDrivers={assignedDrivers}
        Icons={Icons}
        moment={moment}
        timezone={timezone}
        emptyMessage="No bookings found..."
      />

      {tooltip.show && (
        <div
          className="fixed z-9999 w-[250px] max-w-sm px-3 py-4 text-[13px] text-[var(--dark-gray)] leading-relaxed bg-(--white) border border-(--light-gray) rounded-md transition-all duration-300 ease-in-out"
          style={{
            top: tooltip.y,
            left: tooltip.x,
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  );
};

export default BookingsTable;