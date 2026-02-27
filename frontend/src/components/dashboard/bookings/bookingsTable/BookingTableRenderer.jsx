import React, { useState } from "react";
import DeleteModal from "../../../constants/constantcomponents/DeleteModal";
import CustomTable from "../../../constants/constantcomponents/CustomTable";

const BookingTableRenderer = ({
  emptyMessage,
  filteredTableHeaders,
  filteredBookings,
  exportTableData,
  selectedRow,
  setSelectedRow,
  openViewModal,
  user,
  updateBookingStatus,
  updateJobStatus,
  sendBookingEmail,
  refetch,
  getErrMsg,
  selectedActionRow,
  setSelectedActionRow,
  openAuditModal,
  openDriverModal,
  openCompletionModal,
  setEditBookingData,
  setShowEditModal,
  actionMenuItems,
  toast,
  setTooltip,
  jobData,
  bookingSettingData,
  isDriver,
  Icons,
  SelectStatus,
  moment,
  timezone,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);


  const formatCurrency = (value, booking) => {
    if (value === undefined || value === null || value === "-") return "-";

    const currencyApplication =
      bookingSettingData?.setting?.currencyApplication;
    const currentCurrency = bookingSettingData?.setting?.currency?.[0] || {
      symbol: "£",
      label: "British Pound",
      value: "GBP",
    };
    if (currencyApplication === "All Bookings") {
      return `${currentCurrency.symbol}${Number(value).toFixed(2)}`;
    }
    if (booking?.currency?.symbol) {
      return `${booking.currency.symbol}${Number(value).toFixed(2)}`;
    }
    return `${currentCurrency.symbol}${Number(value).toFixed(2)}`;
  };

  const getIdStr = (v) =>
    v?._id?.toString?.() || v?.$oid || v?.toString?.() || String(v || "");

  const isWithinCancelWindow = (booking, cancelWindow) => {
    if (!booking || !cancelWindow) return false;

    const journey = booking.returnJourneyToggle
      ? booking.returnJourney
      : booking.primaryJourney;
    if (
      !journey?.date ||
      journey.hour === undefined ||
      journey.minute === undefined
    ) {
      return false;
    }

    const pickupDate = new Date(journey.date);
    pickupDate.setHours(journey.hour);
    pickupDate.setMinutes(journey.minute);
    pickupDate.setSeconds(0);
    pickupDate.setMilliseconds(0);

    const now = new Date();
    const timeDiffMs = pickupDate.getTime() - now.getTime();

    let windowMs = cancelWindow.value;
    switch (cancelWindow.unit) {
      case "Minutes":
        windowMs *= 60 * 1000;
        break;
      case "Hours":
        windowMs *= 60 * 60 * 1000;
        break;
      case "Days":
        windowMs *= 24 * 60 * 60 * 1000;
        break;
      case "Weeks":
        windowMs *= 7 * 24 * 60 * 60 * 1000;
        break;
      case "Months":
        windowMs *= 30 * 24 * 60 * 60 * 1000;
        break;
      case "Years":
        windowMs *= 365 * 24 * 60 * 60 * 1000;
        break;
      default:
        windowMs *= 60 * 60 * 1000;
    }

    return timeDiffMs < windowMs;
  };

  const isCancelledByRole = (item, roles = []) => {
    if (String(item?.status).toLowerCase() !== "cancelled") return false;
    if (!Array.isArray(item?.statusAudit)) return false;

    const entry = item.statusAudit
      .slice()
      .reverse()
      .find(
        (a) =>
          String(a?.status || "")
            .trim()
            .toLowerCase() === "cancelled",
      );

    if (!entry) return false;

    const byRaw = String(entry.updatedBy || "").toLowerCase();
    return roles.some((role) => byRaw.includes(role.toLowerCase()));
  };

  const formatPassenger = (p) =>
    !p || typeof p !== "object" ? "-" : `${p.name || "N/A"}`;

  const formatDriver = (item) => {
    const drivers = Array.isArray(item.drivers) ? item.drivers : [];
    const hasDrivers = drivers.length > 0;

    if (!hasDrivers) {
      if (user?.role === "customer") {
        return (
          <span className="italic text-(--medium-grey) text-">
            No driver assigned
          </span>
        );
      } else {
        return (
          <span className="text-[var(--dark-grey)]">
            <Icons.CircleUserRound />
          </span>
        );
      }
    }

    const progressiveStatuses = ["accepted", "on route", "at location", "at waiting", "extra stop", "ride started", "completed"];
    const hasEverBeenAccepted =
      progressiveStatuses.includes(String(item?.status || "").toLowerCase()) ||
      progressiveStatuses.includes(String(item?.jobStatus || "").toLowerCase()) ||
      (Array.isArray(item.statusAudit) &&
        item.statusAudit.some(
          (a) => progressiveStatuses.includes(String(a.status || "").toLowerCase()),
        ));

    let driverNames = "";
    if (hasEverBeenAccepted) {
      const acceptedEntry = item.statusAudit
        .slice()
        .reverse()
        .find((a) => String(a.status || "").toLowerCase() === "accepted");

      if (acceptedEntry?.updatedBy) {
        const updatedByLower = acceptedEntry.updatedBy.toLowerCase();

        if (updatedByLower.includes("clientadmin") && drivers.length === 1) {
          driverNames = drivers[0]?.name || "Unnamed Driver";
        } else if (updatedByLower.includes("driver")) {
          const parts = acceptedEntry.updatedBy.split("|");
          const acceptedByName = parts.length > 1 ? parts[1].trim() : "";

          const acceptedDriver = drivers.find(
            (d) =>
              d?.name === acceptedByName ||
              d?.fullName === acceptedByName ||
              String(d?.name || d?.fullName || "").toLowerCase() ===
              acceptedByName.toLowerCase(),
          );

          driverNames =
            acceptedDriver?.name ||
            acceptedDriver?.fullName ||
            acceptedByName ||
            "Unnamed Driver";
        } else {
          driverNames = drivers
            .map((d) => d?.name || d?.fullName || "Unnamed Driver")
            .join(", ");
        }
      } else {
        driverNames = drivers
          .map((d) => d?.name || d?.fullName || "Unnamed Driver")
          .join(", ");
      }
    } else {
      driverNames = drivers
        .map((d) => d?.name || d?.fullName || "Unnamed Driver")
        .join(", ");
    }

    if (item?.status === "Rejected") {
      if (user.role === "customer") {
        return (
          <span className="italic text-(--medium-grey) text-">
            No driver assigned
          </span>
        );
      } else {
        <div className="text-(--alert-red) italic">
          <div className="text-xs mt-1">
            (Booking was rejected by driver: {driverNames})
          </div>
        </div>;
      }
    }

    if (!hasEverBeenAccepted) {
  if (user?.role === "customer") {
    return (
      <span className="italic text-(--medium-grey) text-">
        No driver assigned
      </span>
    );
  }

const rejectedDriverNames = [
  ...new Set(
    (item.statusAudit || [])
      .filter((a) => String(a.status || "").trim().toLowerCase() === "rejected")
      .map((a) => {
        const parts = String(a.updatedBy || "").split("|");
        return parts.length > 1 ? parts[1].trim() : "";
      })
      .filter(Boolean)
  ),
];

const awaitingDrivers = drivers.filter((d) => {
  const name = String(d?.name || d?.fullName || "").trim().toLowerCase();
  return !rejectedDriverNames.some(
    (rName) => rName.trim().toLowerCase() === name
  );
});

  if (awaitingDrivers.length === 0 && rejectedDriverNames.length > 0) {
    return (
      <div className="text-(--alert-red) italic text-xs">
        <div className="font-medium mb-0.5">Booking rejected by:</div>
        <div>{rejectedDriverNames.join(", ")}</div>
      </div>
    );
  }

  const awaitingNames = awaitingDrivers
    .map((d) => d?.name || d?.fullName || "Unnamed Driver")
    .join(", ");

  return (
    <div className="text-(--amber-color) italic">
      <div className="font-medium">Booking sent to: {awaitingNames}</div>
      {rejectedDriverNames.length > 0 && (
        <div className="text-xs text-(--alert-red) mt-1">
          Rejected by: {rejectedDriverNames.join(", ")}
        </div>
      )}
      <div className="text-xs text-(--medium-color) mt-1">
        (Awaiting acceptance)
      </div>
    </div>
  );
}

    return <div className="text-sm text-(--dark-grey)">{driverNames}</div>;
  };

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
          case "bookingType":
            row[key] = item?.returnJourney ? "Return" : "Primary";
            break;
          case "passenger":
            row[key] = formatPassenger(item.passenger);
            break;
          case "date": {
            const journey = item.returnJourney
              ? item.returnJourney
              : item.primaryJourney;
            const rawDate = journey?.date;
            const hour = journey?.hour;
            const minute = journey?.minute;

            if (!rawDate || hour === undefined || minute === undefined) {
              row[key] = "-";
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
          case "pickUp":
            const pickupLocation = item.returnJourney
              ? item.returnJourney?.pickup || "-"
              : item.primaryJourney?.pickup || "-";

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
          case "dropOff":
            const dropoffLocation = item.returnJourney
              ? item.returnJourney?.dropoff || "-"
              : item.primaryJourney?.dropoff || "-";

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
          case "vehicle":
            row[key] = item.vehicle?.vehicleName || "-";
            break;
          case "payment":
            row[key] = item.paymentMethod || "-";
            break;
          case "journeyFare":
            row[key] = formatCurrency(item.journeyFare, item);
            break;
          case "driverFare":
            row[key] = formatCurrency(item.driverFare, item);
            break;
          case "returnJourneyFare":
            row[key] = formatCurrency(item.returnJourneyFare, item);
            break;
          case "returnDriverFare":
            row[key] = formatCurrency(item.returnDriverFare, item);
            break;
          case "flightNumber": {
            const journey = item.returnJourneyToggle
              ? item.returnJourney
              : item.primaryJourney;
            const flightNo = journey?.flightNumber || "-";
            const origin = journey?.flightOrigin || "-";
            const destination = journey?.flightDestination || "-";

            row[key] = (
              <div className="flex flex-col">
                <span className="font-medium">{flightNo}</span>
                <span className="text-xs text-(--medium-grey)">
                  {origin} → {destination}
                </span>
              </div>
            );
            break;
          }

          case "flightArrivalScheduled": {
            const journey = item.returnJourneyToggle
              ? item.returnJourney
              : item.primaryJourney;
            row[key] = journey?.flightArrival?.scheduled
              ? new Date(journey.flightArrival.scheduled).toLocaleString(
                "en-GB",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                },
              )
              : "-";
            break;
          }

          case "flightArrivalEstimated": {
            const journey = item.returnJourneyToggle
              ? item.returnJourney
              : item.primaryJourney;
            row[key] = journey?.flightArrival?.estimated
              ? new Date(journey.flightArrival.estimated).toLocaleString(
                "en-GB",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                },
              )
              : "-";
            break;
          }

          case "createdAt":
            row[key] = item.createdAt
              ? moment(item.createdAt)
                .tz(timezone)
                .format("DD/MM/YYYY HH:mm:ss")
              : "-";
            break;
          case "driver": {
            const disabledByClientOrCustomer = isCancelledByRole(item, [
              "clientadmin",
              "customer",
            ]);
            const content = formatDriver(item);
            let driverPlainText = "-";
            if (Array.isArray(item.drivers) && item.drivers.length > 0) {
              driverPlainText = item.drivers
                .map((d) => d?.name || d?.fullName || "Unnamed Driver")
                .join(", ");
            }
            if (item?.status === "Deleted") {
              row[key] = (
                <div className="text-(--alert-red) text-xs italic">
                  Booking Deleted – Driver assignment disabled
                </div>
              );
              row[`${key}_searchText`] = "Booking Deleted";
              break;
            }

            if (disabledByClientOrCustomer) {
              row[key] = (
                <div
                  className="text-(--light-gray) opacity-60 cursor-not-allowed select-none"
                  title="Driver selection disabled — booking cancelled by Clientadmin/Customer"
                  aria-disabled="true"
                >
                  {content}
                </div>
              );
              row[`${key}_searchText`] = driverPlainText;
              break;
            }

            row[key] =
              user?.role === "customer" ? (
                content
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selectedRow !== item._id) {
                      setSelectedRow(item._id);
                    }
                    openDriverModal(item);
                  }}
                >
                  {content}
                </div>
              );

            row[`${key}_searchText`] = driverPlainText;
            break;
          }
          case "status": {
            const latestCancelledBy = (() => {
              if (
                item.status !== "Cancelled" ||
                !Array.isArray(item.statusAudit)
              )
                return null;

              const entry = item.statusAudit
                .slice()
                .reverse()
                .find(
                  (a) => (a.status || "").trim().toLowerCase() === "cancelled",
                );

              if (!entry) return null;

              const byRaw = (entry.updatedBy || "unknown").toLowerCase();
              const name = entry.updatedBy?.split(" | ")[1] || "";

              if (byRaw.includes("clientadmin"))
                return { role: "Clientadmin", name };
              if (byRaw.includes("customer")) return { role: "Customer", name };
              return null;
            })();

            if (latestCancelledBy) {
              row[key] = (
                <span className="text-(--alert-red) text-xs italic">
                  {`Booking Cancelled by ${latestCancelledBy.role}: ${latestCancelledBy.name}`}
                </span>
              );
              break;
            }

            if (item?.status === "Rejected") {
              if (user?.role === "customer") {
                return (row[key] = (
                  <span className="italic text-(--dark-grey)">New</span>
                ));
              } else {
                const driverRejectEntry = (item.statusAudit || [])
                  .slice()
                  .reverse()
                  .find(
                    (a) => (a.status || "").trim().toLowerCase() === "rejected",
                  );

                const driverName =
                  driverRejectEntry?.updatedBy?.split(" | ")[1] || "Driver";

                row[key] = (
                  <span className="text-(--alert-red) text-xs italic">
                    {`Booking Rejected by Driver: ${driverName}`}
                  </span>
                );
                break;
              }
            }

            if (item?.status === "Deleted") {
              row[key] = (
                <div className="flex flex-col items-start gap-2">
                  <p
                    className="text-(--alert-red) bg-(--white) p-1 text-xs border border-(--light-red) rounded-md italic cursor-pointer hover:bg-(--light-red) transition"
                    title="Click to permanently delete"
                    onClick={async () => {
                      setSelectedDeleteId(item._id);
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete Booking
                  </p>

                  <button
                    className="underline cursor-pointer text-(--main-color)"
                    title="Restore Booking"
                  >
                    Restore
                  </button>
                </div>
              );
              break;
            }

            if (user?.role === "customer") {
              const displayStatus = item?.status || "No Show";
              row[key] = (
                <span className="text-(--dark-grey)">{displayStatus}</span>
              );
              break;
            }

            row[key] = (
              <SelectStatus
                value={
                  isDriver ? item.jobStatus || "New" : item.status || "No Show"
                }
                onChange={async (newStatus) => {
                  try {
                    if (isDriver) {
                      const response = await updateJobStatus({
                        jobId: item.jobId,
                        jobStatus: newStatus,
                      }).unwrap();

                      if (
                        !response.success &&
                        response.message?.includes("already been accepted")
                      ) {
                        toast.warning(
                          "This booking was just accepted by another driver!",
                        );
                        refetch();
                        return;
                      }
                      toast.success("Status updated");
                      refetch();
                      return;
                    }

                    if (String(newStatus).toLowerCase() === "accepted") {
                      if (user?.role?.toLowerCase() === "clientadmin") {
                        const driversArr = Array.isArray(item.drivers)
                          ? item.drivers
                          : [];

                        if (driversArr.length > 1) {
                          toast.error(
                            "Please assign only one driver before accepting the booking!",
                          );
                          return;
                        }
                      }

                      const wasAlreadyAccepted = (item.statusAudit || []).some(
                        (audit) =>
                          String(audit.status || "").toLowerCase() ===
                          "accepted",
                      );

                      const driversArr = Array.isArray(item.drivers)
                        ? item.drivers
                        : [];

                      const singleDriver = driversArr[0];
                      const singleDriverId = getIdStr(
                        typeof singleDriver === "object"
                          ? singleDriver._id
                          : singleDriver,
                      );

                      const jobsArray = jobData?.jobs || [];
                      const jobForDriver = jobsArray.find(
                        (j) =>
                          getIdStr(j?.bookingId) === getIdStr(item?._id) &&
                          getIdStr(j?.driverId) === getIdStr(singleDriverId),
                      );
                      await updateBookingStatus({
                        id: item._id,
                        status: "Accepted",
                        updatedBy: `${user.role} | ${user.fullName}`,
                      }).unwrap();

                      refetch();

                      const siblingJobs = jobsArray.filter(
                        (j) =>
                          getIdStr(j?.bookingId) === getIdStr(item?._id) &&
                          getIdStr(j?._id) !== getIdStr(jobForDriver._id),
                      );
                      await Promise.all(
                        siblingJobs.map((j) =>
                          updateJobStatus({
                            jobId: j._id,
                            jobStatus: "Already Assigned",
                          }),
                        ),
                      );
                    }

                    await updateBookingStatus({
                      id: item._id,
                      status: newStatus,
                      updatedBy: `${user.role} | ${user.fullName}`,
                    }).unwrap();

                    toast.success("Status updated");
                    refetch();
                  } catch (err) {
                    const message = err?.data?.message;
                    toast.error(message);
                    refetch();
                  }
                }}
              />
            );
            break;
          }

          case "actions":
            const journeyNotes =
              item?.primaryJourney?.internalNotes ||
              item?.returnJourney?.internalNotes;

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
                      className="text-[var(--dark-gray)]"
                    />
                  </button>

                  {selectedActionRow === index && (
                    <div className="mt-2 w-56 bg-(--white) border border-(--lightest-gray) rounded-lg js-actions-menu shadow-lg">
                      {actionMenuItems
                        .filter((action) => {
                          if (user?.role === "driver") {
                            return (
                              action === "View" || action === "Status Audit"
                            );
                          }
                          if (user?.role === "customer") {
                            if (action === "Delete") return false;
                            if (action === "Completed") return false;
                            if (
                              action === "Edit" &&
                              String(item?.status || "").toLowerCase() ===
                              "completed"
                            ) {
                              return false;
                            }
                          }
                          return true;
                        })
                        .map((action, i) => (
                          <button
                            key={i}
                            onClick={async () => {
                              try {
                                if (action === "Status Audit") {
                                  openAuditModal(item.statusAudit);
                                } else if (action === "View") {
                                  openViewModal(item);
                                } else if (action === "Completed") {
                                  try {
                                    if (
                                      String(
                                        item?.status || "",
                                      ).toLowerCase() === "completed"
                                    ) {
                                      toast.info(
                                        "Booking is already completed",
                                      );
                                      setSelectedActionRow(null);
                                      return;
                                    }

                                    await updateBookingStatus({
                                      id: item._id,
                                      status: "Completed",
                                      updatedBy: `${user.role} | ${user.fullName}`,
                                    }).unwrap();
                                    toast.success(
                                      "Booking marked as Completed",
                                    );
                                    refetch();
                                    openCompletionModal(item);
                                    setSelectedActionRow(null);
                                  } catch (err) {
                                    toast.error(getErrMsg(err));
                                  }
                                } else if (action === "Edit") {
                                  if (user?.role === "driver") {
                                    toast.info("Drivers cannot edit bookings");
                                    return;
                                  }

                                  if (
                                    user?.role === "customer" &&
                                    String(item?.status || "").toLowerCase() ===
                                    "completed"
                                  ) {
                                    toast.error(
                                      "Completed bookings cannot be edited by customers.",
                                    );
                                    return;
                                  }

                                  const bookingSetting =
                                    bookingSettingData?.setting ||
                                    bookingSettingData?.bookingSetting;

                                  if (
                                    user?.role === "customer" &&
                                    bookingSetting?.companyId ===
                                    user?.companyId
                                  ) {
                                    const cancelWindow =
                                      bookingSetting?.cancelBookingWindow;
                                    if (
                                      cancelWindow &&
                                      isWithinCancelWindow(item, cancelWindow)
                                    ) {
                                      const windowText = `${cancelWindow.value
                                        } ${cancelWindow.unit.toLowerCase()}`;
                                      toast.error(
                                        `Cannot edit booking. Pickup time is within the ${windowText} cancellation window.`,
                                      );
                                      return;
                                    }
                                  }

                                  const editedData = { ...item };
                                  editedData.__editReturn =
                                    !!item.returnJourney;
                                  if (item.primaryJourney?.flightArrival) {
                                    editedData.primaryJourney = {
                                      ...editedData.primaryJourney,
                                      flightArrival: {
                                        ...item.primaryJourney.flightArrival,
                                      },
                                    };
                                  }
                                  if (item.returnJourney?.flightArrival) {
                                    editedData.returnJourney = {
                                      ...editedData.returnJourney,
                                      flightArrival: {
                                        ...item.returnJourney.flightArrival,
                                      },
                                    };
                                  }

                                  setEditBookingData(editedData);
                                  setShowEditModal(true);
                                } else if (action === "Delete") {
                                  if (item?.status === "Deleted") {
                                    try {
                                      await restoreOrDeleteBooking({
                                        id: item._id,
                                        action: "delete",
                                        updatedBy: `${user.role} | ${user.fullName}`,
                                      }).unwrap();
                                      toast.success(
                                        "Booking permanently deleted",
                                      );
                                      refetch();
                                      setSelectedActionRow(null);
                                    } catch (err) {
                                      toast.error(
                                        "Failed to permanently delete booking",
                                      );
                                    }
                                  } else {
                                    try {
                                      await updateBookingStatus({
                                        id: item._id,
                                        status: "Deleted",
                                        updatedBy: `${user.role} | ${user.fullName}`,
                                      }).unwrap();
                                      toast.success(
                                        "Booking marked as Deleted",
                                      );
                                      refetch();
                                      setSelectedActionRow(null);
                                    } catch (err) {
                                      toast.error(
                                        "Failed to mark booking as Deleted",
                                      );
                                    }
                                  }
                                } else if (action === "Copy Booking") {
                                  const copied = { ...item };
                                  delete copied._id;
                                  if (copied.passenger?._id)
                                    delete copied.passenger._id;
                                  if (copied.vehicle?._id)
                                    delete copied.vehicle._id;
                                  if (copied.primaryJourney?._id)
                                    delete copied.primaryJourney._id;
                                  if (copied.returnJourney?._id)
                                    delete copied.returnJourney._id;

                                  copied.bookingId = "";
                                  copied.status = "Pending";
                                  copied.statusAudit = [];
                                  copied.createdAt = new Date().toISOString();
                                  copied.drivers = [];
                                  copied.__copyMode = true;

                                  if (item.returnJourney) {
                                    copied.primaryJourney = {
                                      ...item.returnJourney,
                                    };
                                    delete copied.returnJourney;
                                    copied.__copyReturn = false;
                                  } else {
                                    copied.__copyReturn = false;
                                  }

                                  setEditBookingData(copied);
                                  setShowEditModal(true);
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

                      {user?.role?.toLowerCase() === "clientadmin" &&
                        item.status !== "Cancelled" && (
                          <button
                            onClick={async () => {
                              try {
                                await updateBookingStatus({
                                  id: item._id,
                                  status: "Cancelled",
                                  updatedBy: `${user.role} | ${user.fullName}`,
                                }).unwrap();

                                toast.success(
                                  "Booking status set to Cancelled",
                                );

                                if (item?.passenger?.email) {
                                  try {
                                    await sendBookingEmail({
                                      bookingId: item._id,
                                      email: item.passenger.email,
                                      type: "cancellation",
                                    }).unwrap();

                                    toast.success(
                                      "Cancellation email sent to customer",
                                    );
                                  } catch (emailErr) {
                                    toast.error(
                                      "Failed to send cancellation email",
                                    );
                                  }
                                } else {
                                  toast.info(
                                    "No passenger email found to send cancellation notice",
                                  );
                                }
                                if (
                                  Array.isArray(item?.drivers) &&
                                  item.drivers.length > 0
                                ) {
                                  for (const drv of item.drivers) {
                                    const driverEmail =
                                      drv?.email ||
                                      drv?.DriverData?.email ||
                                      drv?.driverInfo?.email;
                                    if (driverEmail) {
                                      try {
                                        await sendBookingEmail({
                                          bookingId: item._id,
                                          email: driverEmail,
                                          type: "cancellation-driver",
                                        }).unwrap();

                                        toast.success(
                                          `Cancellation email sent to driver: ${driverEmail}`,
                                        );
                                      } catch (err) {
                                        toast.error(
                                          "Failed to send cancellation email to driver",
                                        );
                                      }
                                    }
                                  }
                                }

                                refetch();
                                setSelectedActionRow(null);
                              } catch (err) {
                                toast.error(getErrMsg(err));
                              }
                            }}
                            className="w-full cursor-pointer text-left px-4 py-2 text-sm text-(--alert-red) hover:bg-(--light-red) hover:text-(--primary-dark-red) transition border-t border-(--lightest-gray)"
                          >
                            Cancel Booking
                          </button>
                        )}
                    </div>
                  )}
                </div>
                {journeyNotes && journeyNotes.trim() !== "" && (
                  <button
                    onClick={() => openCompletionModal(item)}
                    title="Driver Completion Details"
                    className="relative p-2 rounded-lg bg-(--lightest-blue) hover:bg-blue(--lighter-blue) border border-(--light-blue) hover:border-(--sky-color) transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
                  >
                    <Icons.FileText
                      size={18}
                      className="text-(--navy-blue) hover:text-(--dark-blue)"
                    />

                    <span
                      className="absolute bg-(--alert-red) rounded-full border-2 border-(--white)"
                      style={{
                        width: "10px",
                        height: "10px",
                        top: "-2px",
                        right: "-2px",
                        animation: "pulse 2s infinite",
                      }}
                    />
                  </button>
                )}
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
        exportTableData={exportTableData}
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
            await restoreOrDeleteBooking({
              id: selectedDeleteId,
              action: "delete",
              updatedBy: `${user.role} | ${user.fullName}`,
            }).unwrap();
            toast.success("Booking permanently deleted");
            refetch();
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
