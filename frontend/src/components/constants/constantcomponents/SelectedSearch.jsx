import React, { useEffect, useRef, useState } from "react";
import Icons from "../../../assets/icons";

const SelectedSearch = ({
  selected,
  setSelected,
  statusList,
  placeholder,
  showCount = true,
}) => {
  const dropdownRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  const safeSelected = Array.isArray(selected) ? selected : [];
  const toggleCheckbox = (label) => {
    if (safeSelected.includes(label)) {
      setSelected(safeSelected.filter((item) => item !== label));
    } else {
      setSelected([...safeSelected, label]);
    }
  };

  const filteredStatuses = statusList.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative inline-block text-left w-full">
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="border px-3 py-[7px] text-sm rounded-md bg-(--white) cursor-pointer border-(--light-gray) w-full text-left hover:border-(--medium-grey) transition-colors flex items-center justify-between"
      >
        <span className="truncate">
          {selected.length === 0
            ? placeholder || "Select"
            : `${selected.length} Selected`}
        </span>
        <Icons.ChevronDown className={`w-4 h-4 text-black transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {dropdownOpen && (
        <div className="absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 z-50 mt-2 bg-(--white) border rounded-lg border-[var(--light-gray)] shadow-xl max-h-72 overflow-y-auto w-[calc(100vw-2rem)] sm:w-[300px] md:w-full">
          <div className="p-2 border-b border-(--light-gray)">
            <input
              type="text"
              placeholder="Search"
              className="custom_input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="p-2 space-y-1 text-sm">
            {filteredStatuses.map((item, idx) => {
              const value = item.value || item.label;

              return (
                <label
                  key={idx}
                  className="flex items-center justify-between hover:bg-(--lightest-gray) px-2 py-1.5 rounded-md cursor-pointer transition-colors"
                >
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    <input
                      type="checkbox"
                      checked={safeSelected.includes(value)}
                      onChange={() => toggleCheckbox(value)}
                      className="cursor-pointer"
                    />

                    <span className="truncate text-sm text-(--dark-gray)">
                      {item.label}
                    </span>
                  </div>
                  {showCount && (
                    <span className="text-(--medium-grey) text-xs">
                      ({item.count || 0})
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedSearch;