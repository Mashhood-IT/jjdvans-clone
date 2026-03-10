import React, { useState } from "react";
import DeleteModal from "../../../constants/constantcomponents/DeleteModal";
import CustomTable from "../../../constants/constantcomponents/CustomTable";
import { useDeleteBookingMutation, useUpdateBookingStatusMutation } from "../../../../redux/api/bookingApi";
import { useGetBookingSettingQuery } from "../../../../redux/api/bookingSettingsApi";
import SelectOption from "../../../constants/constantcomponents/SelectOption";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);

  const [deleteBooking] = useDeleteBookingMutation();
  const [updateBookingStatus] = useUpdateBookingStatusMutation()
  const { data: settingsData } = useGetBookingSettingQuery();
  const defaultCurrencySymbol = settingsData?.setting?.currency?.[0]?.symbol || "£";
  const currencyPolicy = settingsData?.setting?.currencyApplication || "New Bookings Only";

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
          case "pickup":
            row[key] = item?.pickup || "";
            break;
          case "status": 
            row[key] = (
              <SelectOption 
                options={[
                  { value: "New", label: "New" },
                  { value: "Completed", label: "Completed" }
                ]}
                value={item.status || "New"}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  try {
                    const updatedStatus = await updateBookingStatus({
                      id: item._id,
                      status: newStatus
                    })
                    if(updatedStatus) {
                      toast.success("Booking Status updated successfully")
                    }
                  } catch (error) {
                      toast.error("Error updating booking status")
                      console.log(error)
                  }
                }}
              />
            );
            break;
          case "dropoff":
            row[key] = item?.dropoff || "";
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
                className="w-full max-w-[250px] truncate whitespace-nowrap cursor-default"
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
                className="w-full max-w-[250px] truncate whitespace-nowrap cursor-default"
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
            row[key] = formatCurrency(item.totalPrice, item);
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
                                  setSelectedDeleteId(item._id);
                                  setShowDeleteModal(true);
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
    </>
  );
};

export default BookingTableRenderer;