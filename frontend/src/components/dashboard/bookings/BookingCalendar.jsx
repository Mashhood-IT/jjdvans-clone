import React, { useState, useEffect } from "react";
import Icons from "../../../assets/icons";
import { useSelector } from "react-redux";
import { useLoading } from "../../common/LoadingProvider";
import OutletHeading from "../../../constants/constantscomponents/OutletHeading";
import SelectOption from "../../../constants/constantscomponents/SelectOption";

import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import { useGetDriverJobsQuery } from "../../../redux/api/jobsApi";
import { useGetBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";
import { BookingCalendarstatusColors } from "../../../constants/dashboardTabsData/data";

const BookingCalendar = () => {
  const user = useSelector((state) => state.auth.user);
  const { data: bookingSettingData } = useGetBookingSettingQuery();
  const currencySetting = bookingSettingData?.setting?.currency?.[0] || {};
  const currencySymbol = currencySetting?.symbol || "£";
  const currencyCode = currencySetting?.value || "GBP";
  const { showLoading, hideLoading } = useLoading();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [processedBookings, setProcessedBookings] = useState([]);

  const {
    data: bookingsData,
    isLoading,
    error,
  } = useGetAllBookingsQuery(user?.companyId);
  const companyId = user?.companyId;
  const driverId = user?._id;
  const isDriver = user?.role?.toLowerCase?.() === "driver";
  const isCustomer = user?.role.toLowerCase() === "customer";
  const { data: driverJobsData } = useGetDriverJobsQuery(
    { companyId, driverId },
    { skip: !companyId }
  );

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

  useEffect(() => {
    if (!bookingsData || !Array.isArray(bookingsData.bookings)) {
      setProcessedBookings([]);
      return;
    }

    const userEmail = user?.email;
    const base = bookingsData.bookings || [];

    let visibleBookings = base;

    if (isDriver) {
      const jobs = driverJobsData?.jobs ?? [];
      const allowedStatuses = new Set([
        "Accepted",
        "On Route",
        "At Location",
        "Ride Started",
        "Completed",
        "No Show",
      ]);

      const visibleBookingIds = new Set(
        jobs
          .filter(
            (job) =>
              String(job?.driverId) === String(driverId) &&
              allowedStatuses.has(job?.jobStatus) &&
              job?.bookingId
          )
          .map((job) => String(job.bookingId))
      );

      visibleBookings = base.filter((booking) =>
        visibleBookingIds.has(String(booking?._id))
      );
    } else if (isCustomer) {
      visibleBookings = base.filter((b) => b?.passenger?.email === userEmail);
    }
    const processed = visibleBookings.flatMap((booking) => {
      const entries = [];

      if (booking.primaryJourney?.date) {
        const isDriver = user?.role === "driver";
        let fare = 0;
        if (isDriver) {
          fare = booking.returnJourneyToggle
            ? booking.returnDriverFare
            : booking.driverFare;
        } else {
          fare = booking.returnJourneyToggle
            ? booking.returnJourneyFare
            : booking.journeyFare;
        }
        entries.push({
          id: booking._id,
          date: new Date(booking.primaryJourney.date)
            .toISOString()
            .split("T")[0],
          time: `${String(booking.primaryJourney.hour).padStart(
            2,
            "0"
          )}:${String(booking.primaryJourney.minute).padStart(2, "0")}`,
          pickup: booking.primaryJourney.pickup || "N/A",
          dropoff: booking.primaryJourney.dropoff || "N/A",
          fare,
          status: booking.status || "New",
          passenger: booking.passenger?.name || "N/A",
          vehicle: booking.vehicleType || "N/A",
          bookingId: booking.bookingId,
          journeyType: "Primary",
        });
      }

      if (booking.returnJourneyToggle && booking.returnJourney?.date) {
        const fare =
          booking.returnJourneyFare ?? booking.returnJourney?.fare ?? 0;
        entries.push({
          id: `${booking._id}_return`,
          date: new Date(booking.returnJourney.date)
            .toISOString()
            .split("T")[0],
          time: `${String(booking.returnJourney.hour).padStart(
            2,
            "0"
          )}:${String(booking.returnJourney.minute).padStart(2, "0")}`,
          pickup: booking.returnJourney.pickup || "N/A",
          dropoff: booking.returnJourney.dropoff || "N/A",
          fare,
          status: booking.status || "New",
          passenger: booking.passenger?.name || "N/A",
          vehicle: booking.vehicleType || "N/A",
          bookingId: booking.bookingId,
          journeyType: "Return",
        });
      }

      return entries;
    });

    setProcessedBookings(processed);
  }, [bookingsData, driverJobsData, user?._id, user?.role, isDriver]);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(i);

    return days;
  };

  const getBookingsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return processedBookings.filter((booking) => booking.date === dateStr);
  };

  const navigateMonth = (offset) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset)
    );
  };

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <>
      <OutletHeading name="Booking Calendar" />
      <div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-4">
          <div className="flex items-center w-full lg:w-auto">
            <SelectOption
              options={["All", ...Object.keys(BookingCalendarstatusColors)]}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              width="auto"
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-3 md:gap-x-4 gap-y-2 w-full lg:w-auto">
            {Object.entries(BookingCalendarstatusColors).map(([status, colors]) => (
              <div key={status} className="flex items-center gap-1.5 md:gap-2">
                <div
                  className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: colors.color }}
                />
                <span className="text-xs md:text-sm font-medium text-(--dark-gray) whitespace-nowrap">
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <section className="bg-(--white) rounded-lg overflow-hidden">
          {error ? (
            <div className="py-12 md:py-20 text-center text-(--alert-red) px-4">
              <h3 className="text-base md:text-lg font-semibold">Error loading bookings</h3>
              <p className="text-sm md:text-base">{error.message || "Unexpected error occurred."}</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <button onClick={() => navigateMonth(-1)} className="touch-manipulation">
                  <div className="icon-box icon-box-info">
                    <Icons.ChevronLeft size={17} />
                  </div>
                </button>
                <h2 className="text-sm sm:text-base md:text-xl font-semibold">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button onClick={() => navigateMonth(1)} className="touch-manipulation">
                  <div className="icon-box icon-box-info">
                    <Icons.ChevronRight size={17} />
                  </div>
                </button>
              </div>
              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px] md:min-w-[700px]">
                  <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1 md:mb-2 text-xs sm:text-sm">
                    {dayNames.map((day) => (
                      <div
                        key={day}
                        className="text-center text-theme py-1.5 md:py-2 rounded-sm bg-theme font-medium"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 md:gap-1">
                    {getDaysInMonth(currentDate).map((day, index) => {
                      const dayBookings = getBookingsForDate(day);
                      const displayedBookings =
                        selectedStatus === "All"
                          ? dayBookings
                          : dayBookings.filter(
                            (b) => b.status === selectedStatus
                          );

                      return (
                        <div
                          key={index}
                          className={`min-h-24 sm:min-h-28 md:min-h-32 p-1 sm:p-1.5 md:p-2 border rounded-md md:rounded-lg transition-colors ${day
                            ? "bg-(--white) hover:bg-(--lightest-gray) cursor-pointer"
                            : "bg-(--lightest-gray)"
                            } ${displayedBookings.length > 0
                              ? "bg-theme/5 border-theme/30"
                              : ""
                            }`}
                          onClick={() => day && setHoveredEvent(null)}
                        >
                          {day && (
                            <>
                              <div className="text-xs sm:text-sm font-semibold text-(--dark-gray) mb-1 md:mb-2">
                                {day}
                              </div>
                              <div className="space-y-0.5 md:space-y-1">
                                {displayedBookings
                                  .slice(0, 3)
                                  .map((booking) => (
                                    <div
                                      key={booking.id}
                                      className={`text-[10px] sm:text-xs p-1 sm:p-1.5 md:p-2 rounded shadow-sm cursor-pointer transition truncate hover:opacity-90 touch-manipulation ${BookingCalendarstatusColors[booking.status]?.bgClass ||
                                        "bg-theme text-(--white)"
                                        }`}
                                      onMouseEnter={(e) => {
                                        setHoveredEvent(booking);
                                        handleMouseMove(e);
                                      }}
                                      onMouseLeave={() => setHoveredEvent(null)}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setHoveredEvent(booking);
                                      }}
                                    >
                                      <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5 sm:mb-1 truncate">
                                        <Icons.Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                                        <span className="text-[10px] sm:text-xs md:text-sm font-medium">
                                          {booking.time}
                                        </span>
                                        <span className="text-[9px] sm:text-[10px] md:text-xs bg-(--cream) text-(--black) px-0.5 sm:px-1 rounded">
                                          {booking.journeyType}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-0.5 sm:gap-1 truncate">
                                        <Icons.MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                                        <span className="truncate text-[9px] sm:text-[10px] md:text-xs">
                                          {booking.pickup}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                {displayedBookings.length > 3 && (
                                  <div className="text-[9px] sm:text-xs text-center text-(--medium-grey) mt-0.5">
                                    +{displayedBookings.length - 3} more
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
        {hoveredEvent && (
          <div
            className="fixed z-50 pointer-events-none hidden sm:block"
            style={{ top: mousePosition.y + 10, left: mousePosition.x + 10 }}
          >
            <div className="bg-(--white) shadow-xl border p-3 md:p-4 rounded-lg max-w-xs sm:max-w-sm text-xs md:text-sm space-y-1.5">
              <div className="flex justify-between items-center gap-3">
                <span
                  className={`font-bold px-2 py-1 rounded text-xs ${BookingCalendarstatusColors[hoveredEvent?.status]?.bgClass ||
                    "bg-theme text-(--white)"
                    }`}
                >
                  {hoveredEvent.status}
                </span>
                <span className="text-(--medium-grey) text-xs">{hoveredEvent.time}</span>
              </div>
              <p className="text-xs md:text-sm">
                <strong>Pickup:</strong> {hoveredEvent.pickup}
              </p>
              <p className="text-xs md:text-sm">
                <strong>Dropoff:</strong> {hoveredEvent.dropoff}
              </p>
              <p className="text-xs md:text-sm">
                <strong>Passenger:</strong> {hoveredEvent.passenger}
              </p>
              <p className="text-xs md:text-sm">
                <strong>Booking ID:</strong> {hoveredEvent.bookingId}
              </p>
              <p className="text-xs md:text-sm">
                <strong>Journey:</strong> {hoveredEvent.journeyType}
              </p>
              <p className="font-bold text-(--success-color) text-xs md:text-sm">
                {currencySymbol}
                {Number(hoveredEvent?.fare ?? 0).toFixed(2)} {currencyCode}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingCalendar;