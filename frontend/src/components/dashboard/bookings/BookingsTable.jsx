import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Icons from "../../../assets/icons";
import moment from "moment-timezone";
import SelectStatus from "../../constants/constantcomponents/SelectStatus";
import CustomTable from "../../constants/constantcomponents/CustomTable";
import BookingTableRenderer from "./bookingsTable/BookingTableRenderer";

const BookingsTable = ({
  assignedDrivers,
  selectedColumns,
  selectedActionRow,
  setSelectedActionRow,
  openAuditModal,
  openViewModal,
  openDriverModal,
  actionMenuItems,
  setEditBookingData,
  setShowEditModal,
  selectedStatus,
  selectedPassengers,
  selectedVehicleTypes,
  setShowViewModal,
  setShowAuditModal,
  setShowDriverModal,
  isAnyModalOpen,
  selectedRow,
  setSelectedRow,
  selectedDrivers,
  startDate,
  endDate,
  openCompletionModal,
}) => {
  const user = useSelector((state) => state.auth.user);
  const timezone = useSelector((state) => state.timezone?.timezone) || "UTC";
  const companyId = user?.companyId;
  const [tooltip, setTooltip] = useState({ show: false, text: "", x: 0, y: 0 });
  const emptyMessage = "No bookings found...";
  const updateJobStatus = async () => {};
  const sendBookingEmail = async () => {};
  const updateBookingStatus = async () => {};
  const bookingSettingData = {};
  const bookingData = {};
  const isBookingsLoading = false;
  const refetchBookings = () => {};

  const jobData = {};
  const isJobsLoading = false;
  const refetchJobs = () => {};

  const driversData = {};

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

    let windowMs = Number(cancelWindow.value) || 0;
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

const filteredBookings = [];
const filteredTableHeaders = [];
const exportTableData = [];
const emptyTableRows = [];
const isDriver = false;
const refetch = () => {};
const getErrMsg = (err) => err?.message || "Something went wrong";
const tableHeaders = [];

  // useEffect(() => {
  //   async function handleKeyDown(event) {
  //     if (event.key === "Escape") {
  //       setShowAuditModal(false);
  //       setShowViewModal(false);
  //       setShowDriverModal(false);
  //       setShowEditModal(false);
  //       setSelectedActionRow(null);
  //     }

  //     const updateStatus = async (id, status) => {
  //       let result;
  //       if (isDriver) {
  //         result = await updateJobStatus({
  //           jobId: id,
  //           jobStatus: status,
  //         }).unwrap();
  //       } else {
  //         result = await updateBookingStatus({
  //           id,
  //           status,
  //           updatedBy: `${user.role} | ${user.fullName}`,
  //         }).unwrap();
  //       }

  //       if (status === "Completed") {
  //         const booking = filteredBookings.find((b) => b._id === id);
  //         if (booking) {
  //           openCompletionModal(booking);
  //         }
  //       }
  //       return result;
  //     };

  //     if (isAnyModalOpen || selectedRow == null) return;
  //     const selectedBooking = filteredBookings.find(
  //       (b) => b._id === selectedRow
  //     );
  //     if (!selectedBooking) return;

  //     const key = event.key.toLowerCase();
  //     const actionKeys = ["a", "c", "r", "o", "n", "l", "e"];

  //     if (String(selectedBooking.status).toLowerCase() === "cancelled") {
  //       if (
  //         (event.shiftKey && actionKeys.includes(key)) ||
  //         ((event.ctrlKey || event.metaKey) && ["c", "d"].includes(key))
  //       ) {
  //         toast.error(
  //           "This booking is already cancelled. Status update not allowed."
  //         );
  //         return;
  //       }
  //     }
  //     if (event.shiftKey) {
  //       if (key === "a") {
  //         const wasAlreadyAccepted = (selectedBooking.statusAudit || []).some(
  //           (audit) => String(audit.status || "").toLowerCase() === "accepted"
  //         );

  //         const getIdStr = (v) =>
  //           v?._id?.toString?.() ||
  //           v?.$oid ||
  //           v?.toString?.() ||
  //           String(v || "");

  //         const driversArr = Array.isArray(selectedBooking.drivers)
  //           ? selectedBooking.drivers
  //           : [];

  //         const singleDriver = driversArr[0];
  //         const singleDriverId = getIdStr(
  //           typeof singleDriver === "object" ? singleDriver._id : singleDriver
  //         );

  //         const jobsArray = jobData?.jobs || [];
  //         let jobForDriver = jobsArray.find((j) => {
  //           const jobBookingMatch =
  //             getIdStr(j?.bookingId) === getIdStr(selectedBooking?._id);
  //           const jobDriverMatch = getIdStr(j?.driverId) === singleDriverId;
  //           return jobBookingMatch && jobDriverMatch;
  //         });
  //         if (!jobForDriver) {
  //           const bookingJobs = jobsArray.filter(
  //             (j) => getIdStr(j?.bookingId) === getIdStr(selectedBooking?._id)
  //           );

  //           if (bookingJobs.length === 1) {
  //             jobForDriver = bookingJobs[0];
  //           } else if (bookingJobs.length > 1) {
  //             const activeJob =
  //               bookingJobs.find(
  //                 (j) =>
  //                   !["Cancelled", "Rejected", "Already Assigned"].includes(
  //                     j?.jobStatus
  //                   )
  //               ) || bookingJobs[0];

  //             jobForDriver = activeJob;
  //           }
  //         }

  //         if (!jobForDriver?._id) {
  //           const bookingJobs = jobsArray.filter(
  //             (j) => getIdStr(j?.bookingId) === getIdStr(selectedBooking?._id)
  //           );

  //           toast.error(
  //             `No job found. Found ${bookingJobs.length} jobs for this booking. Check console for details.`
  //           );
  //           refetch();
  //           return;
  //         }

  //         if (!jobForDriver?._id) {
  //           toast.error(
  //             "No job found for the selected driver. Create/assign the job first."
  //           );
  //           return;
  //         }
  //         try {
  //           await updateJobStatus({
  //             jobId: jobForDriver._id,
  //             jobStatus: "Accepted",
  //           }).unwrap();

  //           const siblingJobs = jobsArray.filter(
  //             (j) =>
  //               getIdStr(j?.bookingId) === getIdStr(selectedBooking?._id) &&
  //               getIdStr(j?._id) !== getIdStr(jobForDriver._id)
  //           );

  //           if (siblingJobs.length > 0) {
  //             await Promise.all(
  //               siblingJobs.map((j) =>
  //                 updateJobStatus({
  //                   jobId: j._id,
  //                   jobStatus: "Already Assigned",
  //                 })
  //               )
  //             );
  //           }

  //           await updateBookingStatus({
  //             id: selectedBooking._id,
  //             status: "Accepted",
  //             updatedBy: `${user.role} | ${user.fullName}`,
  //           }).unwrap();

  //           toast.success("Status updated to Accepted");
  //           refetch();
  //         } catch (err) {
  //           toast.error(`Failed to accept booking: ${getErrMsg(err)}`);
  //           refetch();
  //         }
  //         return;
  //       }
  //       if (key === "c") {
  //         try {
  //           await updateBookingStatus({
  //             id: selectedBooking._id,
  //             status: "Cancelled",
  //             updatedBy: `${user.role} | ${user.fullName}`,
  //           }).unwrap();

  //           toast.success("Booking status set to Cancelled");
  //           if (selectedBooking?.passenger?.email) {
  //             try {
  //               await sendBookingEmail({
  //                 bookingId: selectedBooking._id,
  //                 email: selectedBooking.passenger.email,
  //                 type: "cancellation",
  //               }).unwrap();
  //               toast.success("Cancellation email sent to customer");
  //             } catch (err) {
  //               toast.error("Failed to send cancellation email to customer");
  //             }
  //           } else {
  //             toast.info(
  //               "No passenger email found to send cancellation notice"
  //             );
  //           }
  //           if (
  //             Array.isArray(selectedBooking?.drivers) &&
  //             selectedBooking.drivers.length > 0
  //           ) {
  //             for (const drv of selectedBooking.drivers) {
  //               const driverEmail =
  //                 drv?.email ||
  //                 drv?.DriverData?.email ||
  //                 drv?.driverInfo?.email;
  //               if (driverEmail) {
  //                 try {
  //                   await sendBookingEmail({
  //                     bookingId: selectedBooking._id,
  //                     email: driverEmail,
  //                     type: "cancellation-driver",
  //                   }).unwrap();
  //                   toast.success(
  //                     `Cancellation email sent to driver: ${driverEmail}`
  //                   );
  //                 } catch (err) {
  //                   toast.error("Failed to send cancellation email to driver");
  //                 }
  //               }
  //             }
  //           }

  //           refetch();
  //         } catch (err) {
  //           toast.error(getErrMsg(err));
  //         }
  //         return;
  //       }

  //       if (key === "r") {
  //         if (selectedBooking.drivers.length === 0) {
  //           toast.error(
  //             "Please assign a driver to the selected booking before proceeding."
  //           );
  //           return;
  //         }

  //         const hasEverAccepted =
  //           String(selectedBooking.status).toLowerCase() === "accepted" ||
  //           (selectedBooking.statusAudit || []).some(
  //             (audit) => String(audit.status).toLowerCase() === "accepted"
  //           );
  //         if (!hasEverAccepted) {
  //           toast.error(
  //             "Booking must be accepted at least once before changing status."
  //           );
  //           return;
  //         }

  //         const newStatus = "Ride Started";
  //         updateStatus(selectedBooking._id, newStatus);
  //         toast.success(`Status updated to "${newStatus}"`);
  //         refetch();
  //         return;
  //       }

  //       if (key === "o") {
  //         if (selectedBooking.drivers.length === 0) {
  //           toast.error(
  //             "Please assign a driver to the selected booking before proceeding."
  //           );
  //           return;
  //         }
  //         const hasEverAccepted =
  //           String(selectedBooking.status).toLowerCase() === "accepted" ||
  //           (selectedBooking.statusAudit || []).some(
  //             (audit) => String(audit.status).toLowerCase() === "accepted"
  //           );
  //         if (!hasEverAccepted) {
  //           toast.error(
  //             "Booking must be accepted at least once before changing status."
  //           );
  //           return;
  //         }
  //         const newStatus = "On Route";
  //         await updateStatus(selectedBooking._id, newStatus);
  //         toast.success(`Status updated to "${newStatus}"`);
  //         refetch();
  //         return;
  //       }
  //       if (key === "n") {
  //         if (selectedBooking.drivers.length === 0) {
  //           toast.error(
  //             "Please assign a driver to the selected booking before proceeding."
  //           );
  //           return;
  //         }
  //         const hasEverAccepted =
  //           String(selectedBooking.status).toLowerCase() === "accepted" ||
  //           (selectedBooking.statusAudit || []).some(
  //             (audit) => String(audit.status).toLowerCase() === "accepted"
  //           );
  //         if (!hasEverAccepted) {
  //           toast.error(
  //             "Booking must be accepted at least once before changing status."
  //           );
  //           return;
  //         }
  //         const newStatus = "No Show";
  //         await updateStatus(selectedBooking._id, newStatus);
  //         toast.success(`Status updated to "${newStatus}"`);
  //         refetch();
  //         return;
  //       }

  //       if (key === "l") {
  //         if (selectedBooking.drivers.length === 0) {
  //           toast.error(
  //             "Please assign a driver to the selected booking before proceeding."
  //           );
  //           return;
  //         }
  //         const hasEverAccepted =
  //           String(selectedBooking.status).toLowerCase() === "accepted" ||
  //           (selectedBooking.statusAudit || []).some(
  //             (audit) => String(audit.status).toLowerCase() === "accepted"
  //           );
  //         if (!hasEverAccepted) {
  //           toast.error(
  //             "Booking must be accepted at least once before changing status."
  //           );
  //           return;
  //         }
  //         const newStatus = "At Location";
  //         await updateStatus(selectedBooking._id, newStatus);
  //         toast.success(`Status updated to "${newStatus}"`);
  //         refetch();
  //         return;
  //       }

  //       if (key === "d") {
  //         if (user?.role === "driver" || user?.role === "customer") {
  //           toast.info(
  //             `${(user?.role).charAt(0).toUpperCase()}${user?.role?.slice(
  //               1
  //             )}s are not allowed to delete bookings`
  //           );
  //           return;
  //         }
  //         try {
  //           await updateBookingStatus({
  //             id: selectedBooking._id,
  //             status: "Deleted",
  //             updatedBy: `${user.role} | ${user.fullName}`,
  //           }).unwrap();
  //           toast.success("Booking marked as Deleted");
  //           refetch();
  //         } catch (err) {
  //           toast.error(getErrMsg(err));
  //         }
  //         return;
  //       }

  //       if (key === "e") {
  //         if (user?.role === "driver") {
  //           toast.info("Drivers are not allowed to edit bookings");
  //           return;
  //         }

  //         if (
  //           user?.role === "customer" &&
  //           String(selectedBooking?.status || "").toLowerCase() ===
  //           "completed"
  //         ) {
  //           toast.error("Completed bookings cannot be edited by customers.");
  //           return;
  //         }

  //         const bookingSetting =
  //           bookingSettingData?.setting || bookingSettingData?.bookingSetting;

  //         if (
  //           user?.role === "customer" &&
  //           bookingSetting?.companyId === user?.companyId
  //         ) {
  //           const cancelWindow = bookingSetting?.cancelBookingWindow;
  //           if (
  //             cancelWindow &&
  //             isWithinCancelWindow(selectedBooking, cancelWindow)
  //           ) {
  //             const windowText = `${cancelWindow.value
  //               } ${cancelWindow.unit.toLowerCase()}`;
  //             toast.error(
  //               `Cannot edit booking. Pickup time is within the ${windowText} cancellation window.`
  //             );
  //             return;
  //           }
  //         }

  //         const editedData = { ...selectedBooking };
  //         editedData.__editReturn = !!selectedBooking.returnJourney;
  //         setEditBookingData(editedData);
  //         setShowEditModal(true);
  //         return;
  //       }
  //     }

  //     if (key === "enter") {
  //       openViewModal(selectedBooking);
  //     }
  //     if ((event.ctrlKey || event.metaKey) && key === "c") {
  //       if (user?.role === "customer") {
  //         toast.warn("Customer cannot mark booking as completed");
  //         return;
  //       }
  //       const newStatus = "Completed";
  //       await updateStatus(selectedBooking._id, newStatus);
  //       toast.success(`Status updated to "${newStatus}"`);
  //       refetch();
  //       return;
  //     }
  //     if ((event.ctrlKey || event.metaKey) && key === "d") {
  //       if (selectedBooking?.status === "Deleted") {
  //         toast.error("Booking already deleted – Driver assignment disabled");
  //         return;
  //       }

  //       if (user?.role === "customer") {
  //         toast.warn("Customer cannot access drivers list");
  //         return;
  //       }

  //       if (String(selectedBooking.status).toLowerCase() === "cancelled") {
  //         toast.error(
  //           "This booking has been cancelled. Driver selection is disabled."
  //         );
  //         return;
  //       }

  //       openDriverModal(selectedBooking.driver);
  //     }
  //   }

  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [
  //   selectedRow,
  //   filteredBookings,
  //   user,
  //   updateBookingStatus,
  //   openDriverModal,
  //   openViewModal,
  //   refetch,
  //   isAnyModalOpen,
  //   assignedDrivers,
  // ]);

  useEffect(() => {
    function handleFocus() {
      if (isDriver) {
        refetchJobs();
      } else {
        refetchBookings();
        refetchJobs();
      }
    }

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetchBookings, refetchJobs, isDriver]);

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

  if (!companyId) {
    return (
      <CustomTable
        tableHeaders={tableHeaders.filter(
          (header) => selectedColumns[header.key],
        )}
        tableData={[]}
        exportTableData={[]}
        emptyMessage={emptyMessage}
        showSearch
        showRefresh
      />
    );
  }

  if (isDriver ? isJobsLoading : isBookingsLoading) {
    return (
      <CustomTable
        tableHeaders={tableHeaders.filter(
          (header) => selectedColumns[header.key],
        )}
        tableData={[]}
        exportTableData={[]}
        emptyMessage="Loading bookings..."
        showSearch
        showRefresh
      />
    );
  }

  return (
    <>
      <BookingTableRenderer
        filteredTableHeaders={filteredTableHeaders}
        filteredBookings={filteredBookings}
        emptyTableRows={emptyTableRows}
        exportTableData={exportTableData}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        openViewModal={openViewModal}
        user={user}
        updateBookingStatus={updateBookingStatus}
        updateJobStatus={updateJobStatus}
        sendBookingEmail={sendBookingEmail}
        refetch={refetch}
        getErrMsg={getErrMsg}
        selectedActionRow={selectedActionRow}
        setSelectedActionRow={setSelectedActionRow}
        openAuditModal={openAuditModal}
        openDriverModal={openDriverModal}
        openCompletionModal={openCompletionModal}
        setEditBookingData={setEditBookingData}
        setShowEditModal={setShowEditModal}
        actionMenuItems={actionMenuItems}
        toast={toast}
        tooltip={tooltip}
        setTooltip={setTooltip}
        driversData={driversData}
        jobData={jobData}
        assignedDrivers={assignedDrivers}
        bookingSettingData={bookingSettingData}
        isDriver={isDriver}
        Icons={Icons}
        SelectStatus={SelectStatus}
        moment={moment}
        timezone={timezone}
        emptyMessage="No bookings found..."
      />

      {tooltip.show && (
        <div
          className="fixed z-9999 w-62.5 max-w-sm px-3 py-4 text-[13px] text-(--dark-gray) leading-relaxed bg-(--white) border border-(--light-gray) rounded-md transition-all duration-300 ease-in-out"
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
