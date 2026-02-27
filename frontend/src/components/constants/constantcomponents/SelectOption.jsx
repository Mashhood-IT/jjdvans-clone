import React, { useState } from "react";
import classNames from "classnames";
import Icons from "../../../assets/icons";

const SelectOption = ({ options, label, width = "full", value, onChange, name, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectClass = classNames(
    width === "full" ? "w-full" : `w-${width}`,
    "appearance-none px-3 py-1.5 text-sm border border-[var(--light-gray)] rounded-lg shadow-sm",
    "bg-(--white) dark:text-(--white)",
    "focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all cursor-pointer"
  );

  return (
    <div className={classNames("w-full mb-1", width !== "full" && `sm:w-${width}`)}>
      {label && (
        <label className="block text-sm font-medium text-(--dark-grey) mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          name={name}
          disabled={disabled}
          value={value?.toString() || ""}
          onChange={onChange}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setIsOpen(false)}
          className={selectClass}
        >
          <option disabled value="">
            Select
          </option>
          {Array.isArray(options) &&
            options.map((option, idx) => (
              <option key={idx} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-(--medium-grey)">
          <Icons.ChevronDown
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
              }`}
          />
        </div>
      </div>
    </div>
  );
};

export default SelectOption;