import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const PassengerDetails = ({ passengerDetails, setPassengerDetails }) => {
  const user = useSelector((state) => state.auth.user);

  const [selectedPassenger, setSelectedPassenger] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [selectedPassengerObj, setSelectedPassengerObj] = useState(null);

const passengers = [];
const companies = [];
const customers = [];
const isLoading = false;
const isError = false;

  const combinedList = [
    ...passengers,
    ...customers.filter((c) => {
      const cName = (c.name || c.fullName || "").toLowerCase().trim();
      const cEmail = (c.email || "").toLowerCase().trim();
      const cPhone = (c.phone || "").replace(/\D/g, "");

      return !passengers.some((p) => {
        const pName = (p.name || p.fullName || "").toLowerCase().trim();
        const pEmail = (p.email || "").toLowerCase().trim();
        const pPhone = (p.phone || "").replace(/\D/g, "");

        const nameMatch = cName && pName && cName === pName;
        const emailMatch = cEmail && pEmail && cEmail === pEmail;
        const phoneMatch = cPhone && pPhone && cPhone === pPhone;

        return (
          (nameMatch && emailMatch) ||
          (nameMatch && phoneMatch) ||
          (emailMatch && phoneMatch)
        );
      });
    }),
  ];

  const buildDisplayValue = (p) => {
    const name = p.name || p.fullName || "Unnamed";
    return `${name} (${p.email || "No Email"})`;
  };

  const filteredPassengers = combinedList.filter((p) =>
    buildDisplayValue(p).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (value) => {
    const selected = combinedList.find((p) => buildDisplayValue(p) === value);
    setSelectedPassenger(value);
    setSelectedPassengerObj(selected || null);

    if (selected) {
      setPassengerDetails((prev) => ({
        name: selected.name || selected.fullName || "",
        email: isEmailLocked ? prev.email : selected.email || "",
        phone: prev.phone || "",
      }));
    } else {
      setPassengerDetails((prev) => ({
        ...prev,
        name: "",
        phone: "",
        email: isEmailLocked ? prev.email : "",
      }));
    }
  };

  useEffect(() => {
    if (!selectedPassengerObj) return;
  }, [passengerDetails, selectedPassengerObj]);


  return (
    <>
      <div className="h-full">
        <div className="relative">
          {!isLoading && !isError && filteredPassengers.length > 0 && (
            <div
              className="custom_input cursor-pointer flex justify-between items-center"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span
                className={selectedPassenger ? "text-(--black)" : "text-(--medium-grey)"}
              >
                {selectedPassenger || "Select Passenger"}
              </span>
            </div>
          )}

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-(--white) border border-(--light-gray) rounded-md shadow-lg">
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Search passengers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-(--light-gray) rounded focus:outline-none focus:ring-2 focus:ring-(--main-color)"
                  autoFocus
                />
              </div>
              <div className="max-h-48 overflow-y-auto">
                {isLoading && (
                  <div className="px-3 py-2 text-(--medium-grey) text-sm">
                    Loading...
                  </div>
                )}
                {isError && (
                  <div className="px-3 py-2 text-(--alert-red) text-sm">
                    Error loading passengers
                  </div>
                )}
                {filteredPassengers.length === 0 && !isLoading && !isError && (
                  <div className="px-3 py-2 text-(--medium-grey) text-sm">
                    No passengers found
                  </div>
                )}
                {filteredPassengers.map((p, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 hover:bg-(--lightest-gray) cursor-pointer text-sm border-b border-(--lightest-gray) last:border-b-0"
                    onClick={() => {
                      handleSelect(buildDisplayValue(p));
                      setIsDropdownOpen(false);
                      setSearchTerm("");
                    }}
                  >
                    {buildDisplayValue(p)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 lg:grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-medium text-(--medium-grey) mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={passengerDetails.name}
              onChange={(e) =>
                setPassengerDetails({
                  ...passengerDetails,
                  name: e.target.value,
                })
              }
              placeholder="Enter full name"
              className="custom_input"
            />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-medium text-(--medium-grey) mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={passengerDetails.email}
              onChange={(e) =>
                setPassengerDetails({
                  ...passengerDetails,
                  email: e.target.value,
                })
              }
              placeholder="name@example.com"
              className={`custom_input ${isEmailLocked ? "bg-(--light-gray) cursor-not-allowed" : ""
                }`}
              disabled={isEmailLocked}
              title={
                isEmailLocked
                  ? "Email is locked for VAT-verified customers"
                  : ""
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-(--light-gray) mb-1">
            Contact Number
          </label>
          <PhoneInput
            country={"gb"}
            value={passengerDetails.phone}
            onChange={(phone) =>
              setPassengerDetails({ ...passengerDetails, phone })
            }
            inputClass="custom_input !ps-14 !w-full"
            dropdownClass="!text-sm"
            containerClass="!w-full"
            buttonClass="!ps-2"
            specialLabel=""
            placeholder="Phone Number"
          />
        </div>
      </div>
    </>
  );
};

export default PassengerDetails;