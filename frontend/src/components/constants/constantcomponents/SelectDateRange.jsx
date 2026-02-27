import React, { useEffect, useRef, useState } from "react";
import Icons from "../../../assets/icons";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getToday = () => {
  const today = new Date();
  const iso = today.toISOString().split("T")[0];
  return [iso, iso];
};

const getYesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const iso = date.toISOString().split("T")[0];
  return [iso, iso];
};

const getLastNDays = (n) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - (n - 1));
  return [start.toISOString().split("T")[0], end.toISOString().split("T")[0]];
};

const getThisMonth = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 2);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return [start.toISOString().split("T")[0], end.toISOString().split("T")[0]];
};

const getLastMonth = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 2);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  return [start.toISOString().split("T")[0], end.toISOString().split("T")[0]];
};
const getTomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const iso = date.toISOString().split("T")[0];
  return [iso, iso];
};

const getNextNDays = (n) => {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + (n - 1));
  return [start.toISOString().split("T")[0], end.toISOString().split("T")[0]];
};

const getNext7Days = () => getNextNDays(7);

const getNext30Days = () => getNextNDays(30);

const SelectDateRange = ({ startDate, endDate, setStartDate, setEndDate }) => {
  const ranges = [
    { label: "Today", getRange: getToday },
    { label: "Tomorrow", getRange: getTomorrow },
    { label: "Yesterday", getRange: getYesterday },
    { label: "Last 7 Days", getRange: () => getLastNDays(7) },
    { label: "Next 7 Days", getRange: getNext7Days },
    { label: "Last 30 Days", getRange: () => getLastNDays(30) },
    { label: "Next 30 Days", getRange: getNext30Days },
    { label: "This Month", getRange: getThisMonth },
    { label: "Last Month", getRange: getLastMonth },
  ];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const handleRangeClick = (getRange) => {
    const [start, end] = getRange();
    setStartDate(start);
    setEndDate(end);
    setDropdownOpen(false);
  };

  const applyCustomRange = () => {
    if (customStart && customEnd) {
      setStartDate(customStart);
      setEndDate(customEnd);
      setDropdownOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block w-full">
      <div
        className="flex items-center gap-2 border border-[var(--light-gray)] px-3 py-[7px] bg-(--white) rounded-md cursor-pointer min-w-0 hover:border-(--medium-grey) transition-colors"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <Icons.CalendarDays className="w-4 h-4 text-(--black)" />
        <span className="flex-1 text-xs md:text-sm whitespace-nowrap overflow-hidden text-ellipsis">
          {startDate && endDate
            ? `${formatDate(startDate)} - ${formatDate(endDate)}`
            : "Select Date Range"}
        </span>
        <Icons.ChevronDown
          className={`w-4 h-4 text-(--black) transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""
            }`}
        />
      </div>
      {dropdownOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 mt-2 w-[calc(100vw-2rem)] sm:w-[320px] md:w-full min-w-[280px] bg-(--white) border border-[var(--light-gray)] shadow-xl z-50 rounded-lg overflow-hidden py-1">
          {ranges.map((r) => (
            <div
              key={r.label}
              className="flex justify-between items-center px-4 py-1.5 hover:bg-(--sky-color) cursor-pointer"
              onClick={() => handleRangeClick(r.getRange)}
            >
              <span className="text-sm text-(--black)">{r.label}</span>
            </div>
          ))}
          <div className="pt-2 px-4 pb-1 text-xs font-semibold text-(--dark-grey) uppercase tracking-wider">
            Custom Range:
          </div>
          <div className="flex flex-col gap-2 px-4 pb-3">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="border rounded px-2 text-(--dark-grey) py-1"
            />
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="border rounded px-2 text-(--dark-grey) py-1"
            />
            <button
              onClick={applyCustomRange}
              className="bg-(--main-color) text-(--white) text-sm px-3 py-1 rounded hover:bg-(--dark-blue)"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectDateRange;