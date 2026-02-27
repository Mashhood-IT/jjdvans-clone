import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import classNames from "classnames";
import Icons from "../../../assets/icons";

const STATUS_OPTIONS = [
  "New",
  "Accepted",
  "On Route",
  "At Location",
  "Ride Started",
  "Late Cancel",
  "At Waiting",
  "Extra Stop",
  "No Show",
  "Completed",
];

const SelectStatus = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);

  const openDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 2,
        left: rect.left,
        width: rect.width,
        minWidth: "9rem",
        zIndex: 99999,
      });
    }
    setIsOpen(true);
  };

  const toggleDropdown = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      openDropdown();
    }
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      const isDropdownClick = e.target.closest(".status-dropdown-ul");
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        !isDropdownClick
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onGlobalScroll = (e) => {
      // Only close if we are scrolling the window or a parent, NOT the dropdown itself
      if (e.target.closest(".status-dropdown-ul")) return;
      setIsOpen(false);
    };
    window.addEventListener("scroll", onGlobalScroll, true);
    window.addEventListener("resize", () => setIsOpen(false));
    return () => {
      window.removeEventListener("scroll", onGlobalScroll, true);
      window.removeEventListener("resize", () => setIsOpen(false));
    };
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleSelect = (status) => {
    onChange(status);
    setIsOpen(false);
  };

  const dropdown = (
    <ul
      style={dropdownStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={classNames(
        "bg-(--white) rounded-md status-dropdown-ul",
        "overflow-y-auto max-h-48",
        "custom_scrollbar",
        "border border-(--light-gray)",
      )}
      role="listbox"
    >
      {STATUS_OPTIONS.map((status) => (
        <li
          key={status}
          role="option"
          aria-selected={value === status}
          onMouseDown={(e) => {
            e.preventDefault();
            handleSelect(status);
          }}
          className={classNames(
            "px-3 py-1.5 text-sm cursor-pointer",
            "text-(--dark-gray)",
            "hover:bg-(--lighter-gray) transition-colors duration-100",
            value === status && "bg-(--lighter-gray)",
          )}
        >
          {status}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="relative w-full sm:w-fit sm:max-w-[9rem]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        className={classNames(
          "w-full flex items-center justify-between gap-2",
          "pr-2 pl-2 py-1.5",
          "rounded-lg text-sm font-medium shadow-sm",
          "bg-(--white) text-(--dark-gray)",
          "focus:outline-none cursor-pointer",
        )}
      >
        <span className="truncate">{value || STATUS_OPTIONS[0]}</span>
        <span
          className={classNames(
            "flex-shrink-0 transition-transform duration-150",
            isOpen && "rotate-180",
          )}
        >
          <Icons.ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {isOpen && ReactDOM.createPortal(dropdown, document.body)}
    </div>
  );
};

export default SelectStatus;