import React, { useState } from "react";
import DeleteModal from "../../../constants/constantcomponents/DeleteModal";
import ConfirmModal from "../../../constants/constantcomponents/ConfirmModal";
import CustomTable from "../../../constants/constantcomponents/CustomTable";
import {
  useDeleteBookingMutation,
  useUpdateBookingStatusMutation,
} from "../../../../redux/api/bookingApi";
import { useGetBookingSettingQuery } from "../../../../redux/api/bookingSettingsApi";
import SelectOption from "../../../constants/constantcomponents/SelectOption";
import { useLocation } from "react-router-dom";

const BookingTableRenderer = ({
  emptyMessage,
  filteredTableHeaders,
  filteredBookings,
  selectedRow,
  setSelectedRow,
  openViewModal,
  getErrMsg,
  selectedActionRow,
  setSelectedActionRow,
  setEditBookingData,
  setShowEditModal,
  actionMenuItems,
  toast,
  setTooltip,
  Icons,
  moment,
  timezone,
}) => {
  const location = useLocation()
  const newStatus = location.pathname.includes("completed") ? "Completed" : "New";
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null);

  const [deleteBooking] = useDeleteBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation();
  const { data: settingsData } = useGetBookingSettingQuery();
  const defaultCurrencySymbol =
    settingsData?.setting?.currency?.[0]?.symbol || "£";
  const currencyPolicy =
    settingsData?.setting?.currencyApplication || "New Bookings Only";

  const formatCurrency = (value, booking) => {
    if (value === undefined || value === null || value === "-") return "-";

    if (currencyPolicy === "All Bookings") {
      return `${defaultCurrencySymbol}${Number(value).toFixed(2)}`;
    }

    if (booking?.currency?.symbol) {
      return `${booking.currency.symbol}${Number(value).toFixed(2)}`;
    }
    return `£${Number(value).toFixed(2)}`;
  };


  const formatPassenger = (p) =>
    !p || typeof p !== "object" ? "-" : `${p.name || "N/A"}`;

  let tableData = [];
  if (!filteredBookings || filteredBookings.length === 0) {
    tableData = [];
  } else {
    tableData = filteredBookings.map((item, index) => {
      const row = { _id: item._id };

      filteredTableHeaders.forEach(({ key }) => {
        switch (key) {
          case "bookingId":
            row[key] = item.bookingId || "";
            break;
          case "passenger":
            row[key] = formatPassenger(item.passenger);
            break;
          case "status":
            if (item.status === "Deleted") {
              row[key] = (
                <div className="flex gap-2">
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      updateBookingStatus({ id: item._id, status: newStatus })
                        .unwrap()
                        .then(() => toast.success("Booking Restored"))
                        .catch(() => toast.error("Failed to restore booking"));
                    }}
                  >
                    Restore
                  </button>

                  <button
                    className="btn btn-edit"
                    onClick={() => {
                      setSelectedDeleteId(item._id);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete
                  </button>
                </div>
              );
            } else {
              row[key] = (
                <SelectOption
                  width="min-w-28 w-full" options={[
                    { value: "New", label: "New" },
                    { value: "Completed", label: "Completed" },
                    { value: "Deleted", label: "Deleted" },
                  ]}
                  value={item.status || "New"}
                  onChange={(newStatus) => {
                    const status =
                      newStatus?.value || newStatus?.target?.value || newStatus;

                    if (status === "Completed") {
                      setPendingStatusUpdate({ id: item._id, status });
                      setShowConfirmModal(true);
                    } else if (status === "Deleted") {
                      updateBookingStatus({ id: item._id, status: "Deleted" })
                        .unwrap()
                        .then(() => toast.success("Booking moved to Deleted"))
                        .catch(() => toast.error("Error updating booking"));
                    } else {
                      updateBookingStatus({ id: item._id, status })
                        .unwrap()
                        .then(() =>
                          toast.success("Booking Status updated successfully"),
                        )
                        .catch(() =>
                          toast.error("Error updating booking status"),
                        );
                    }
                  }}
                />
              );
            }
            break;
          case "date": {
            const rawDate = item.date;
            const hour = item.hour;
            const minute = item.minute;

            if (!rawDate || hour === undefined || minute === undefined) {
              row[key] = rawDate || "-";
              break;
            }
            const combinedDate = new Date(rawDate);
            combinedDate.setHours(hour);
            combinedDate.setMinutes(minute);
            combinedDate.setSeconds(0);
            combinedDate.setMilliseconds(0);
            const formatted = combinedDate.toLocaleString("en-GB", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            });

            row[key] = formatted;
            break;
          }
          case "pickup": {
            const pickupLocation = item.pickup || "-";
            row[key] = (
              <div
                className="w-full max-w-[200px] truncate whitespace-nowrap cursor-default"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    show: true,
                    text: pickupLocation,
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                  });
                }}
                onMouseLeave={() =>
                  setTooltip({ show: false, text: "", x: 0, y: 0 })
                }
              >
                {pickupLocation}
              </div>
            );
            row[`${key}_searchText`] = pickupLocation;
            break;
          }
          case "dropoff": {
            const dropoffLocation = item.dropoff || "-";
            row[key] = (
              <div
                className="w-full max-w-[200px] truncate whitespace-nowrap cursor-default"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    show: true,
                    text: dropoffLocation,
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                  });
                }}
                onMouseLeave={() =>
                  setTooltip({ show: false, text: "", x: 0, y: 0 })
                }
              >
                {dropoffLocation}
              </div>
            );
            row[`${key}_searchText`] = dropoffLocation;
            break;
          }
          case "vehicle":
            row[key] = item.vehicle?.vehicleName || "-";
            break;
          case "totalPrice":
            row[key] = formatCurrency(Math.round(Number(item.totalPrice)).toFixed(2), item);
            break;
          case "paymentMethod":
            row[key] = item.paymentMethod || "-";
            break;

          case "createdAt":
            row[key] = item.createdAt
              ? moment(item.createdAt)
                .tz(timezone)
                .format("DD/MM/YYYY HH:mm:ss")
              : "-";
            break;

          case "actions":
            row[key] = (
              <div className="flex items-start  gap-2">
                <div className="text-center">
                  <button
                    onClick={() =>
                      setSelectedActionRow(
                        selectedActionRow === index ? null : index,
                      )
                    }
                    className="relative p-2 rounded-lg bg-(--sky-color) hover:bg-(--lighter-blue) border border-(--light-blue) hover:border-(--main-color) transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <Icons.GripHorizontal
                      size={18}
                      className="text-(--dark-gray)"
                    />
                  </button>

                  {selectedActionRow === index && (
                    <div className="mt-2 w-56 bg-(--white) border border-(--lightest-gray) rounded-lg js-actions-menu shadow-lg">
                      {actionMenuItems
                        .filter((action) => {
                          return true;
                        })
                        .map((action, i) => (
                          <button
                            key={i}
                            onClick={async () => {
                              try {
                                if (action === "View") {
                                  openViewModal(item);
                                } else if (action === "Edit") {
                                  const editedData = { ...item };
                                  setEditBookingData(editedData);
                                  setShowEditModal(true);
                                } else if (action === "Delete") {
                                  await updateBookingStatus({
                                    id: item._id,
                                    status: "Deleted",
                                  }).unwrap();

                                  toast.success("Booking moved to Deleted");
                                  setSelectedActionRow(null);
                                }
                              } catch (err) {
                                toast.error(getErrMsg(err));
                              }
                            }}
                            className="w-full text-left cursor-pointer px-4 py-2 text-sm text-(--dark-grey) hover:bg-(----lighter-blue) hover:text-(--navy-blue) transition"
                          >
                            {action}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            );
            break;
          default:
            row[key] = item[key] || "-";
        }
      });
      return row;
    });
  }
  return (
    <>
      <CustomTable
        filename="Bookings-list"
        tableHeaders={filteredTableHeaders}
        tableData={tableData}
        exportTableData={tableData}
        showSearch
        showRefresh
        showDownload
        emptyMessage={emptyMessage}
        showPagination
        showSorting
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        onRowDoubleClick={(row) => {
          const selectedBooking = filteredBookings.find(
            (b) => b._id === row._id,
          );
          if (selectedBooking) {
            openViewModal(selectedBooking);
          }
        }}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={async () => {
          try {
            await deleteBooking(selectedDeleteId).unwrap();
            toast.success("Booking permanently deleted");
          } catch (err) {
            toast.error("Failed to permanently delete booking");
          } finally {
            setShowDeleteModal(false);
            setSelectedDeleteId(null);
          }
        }}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedDeleteId(null);
        }}
      />

      <ConfirmModal
        isOpen={showConfirmModal}
        onConfirm={async () => {
          try {
            await updateBookingStatus({
              id: pendingStatusUpdate.id,
              status: pendingStatusUpdate.status,
            }).unwrap();
            toast.success("Booking Status updated successfully");
          } catch (err) {
            toast.error("Error updating booking status");
          } finally {
            setShowConfirmModal(false);
            setPendingStatusUpdate(null);
          }
        }}
        onCancel={() => {
          setShowConfirmModal(false);
          setPendingStatusUpdate(null);
        }}
      />
    </>
  );
};

export default BookingTableRenderer;