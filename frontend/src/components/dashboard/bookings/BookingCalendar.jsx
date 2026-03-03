import React, { useState, useEffect } from "react";
import Icons from "../../../assets/icons";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";
import OutletHeading from "../../constants/constantcomponents/OutletHeading";


const BookingCalendar = () => {
  const { data: bookings = [], isLoading, error } = useGetAllBookingsQuery();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
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

  const processedBookings = bookings.map((booking) => ({
    id: booking._id,
    date: booking.date
      ? new Date(booking.date).toISOString().split("T")[0]
      : null,
    pickup: booking.pickup || "N/A",
    dropoff: booking.dropoff || "N/A",

    passenger: booking.passenger?.name || "N/A",
    email: booking.passenger?.email || "N/A",
    phone: booking.passenger?.phone || "N/A",
    bookingId: booking.bookingId || "-",
  }));

  const getBookingsForDate = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    return processedBookings.filter((b) => b.date === dateStr);
  };

  const navigateMonth = (offset) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset)
    );
  };

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  if (isLoading) return <div>Loading calendar...</div>;
  if (error) return <div>Failed to load bookings</div>;

  return (
    <>
      <OutletHeading name="Booking Calendar" />

      <div>
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigateMonth(-1)}>
            <div className="icon-box icon-box-info">
              <Icons.ChevronLeft size={17} />
            </div>
          </button>

          <h2 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>

          <button onClick={() => navigateMonth(1)}>
            <div className="icon-box icon-box-info">
              <Icons.ChevronRight size={17} />
            </div>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonth(currentDate).map((day, index) => {
            const dayBookings = getBookingsForDate(day);

            return (
              <div
                key={index}
                className={`min-h-28 border rounded p-1 ${day ? "bg-(--white)" : "bg-(--lightest-gray)"
                  }`}
              >
                {day && (
                  <>
                    <div className="text-sm font-semibold mb-1">{day}</div>

                    {dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="text-[11px] p-1 rounded mb-1 truncate cursor-pointer bg-(--lighter-blue) text-(--navy-blue)"
                        onMouseEnter={(e) => {
                          setHoveredEvent(booking);
                          handleMouseMove(e);
                        }}
                        onMouseLeave={() => setHoveredEvent(null)}
                      >
                        {booking.bookingId} — {booking.pickup} →{" "}
                        {booking.dropoff}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {hoveredEvent && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{ top: mousePosition.y + 10, left: mousePosition.x + 10 }}
          >
            <div className="bg-(--white) shadow-lg border p-3 rounded text-xs space-y-1">
              <p><strong>Booking ID:</strong> {hoveredEvent.bookingId}</p>
              <p><strong>Passenger:</strong> {hoveredEvent.passenger}</p>
              <p><strong>Email:</strong> {hoveredEvent.email}</p>
              <p><strong>Phone:</strong> {hoveredEvent.phone}</p>
              <p><strong>Pickup:</strong> {hoveredEvent.pickup}</p>
              <p><strong>Dropoff:</strong> {hoveredEvent.dropoff}</p>

            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BookingCalendar;