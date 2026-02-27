import React, { useEffect } from "react";
import Icons from "../../../assets/icons";
import { useSelector } from "react-redux";
import OutletHeading from "../../constants/constantcomponents/OutletHeading";

const ViewCompany = () => {
  const user = useSelector((state) => state.auth.user);
  console.log(user)
  const fields = [
    { label: "Full Name (Admin)", value: user.fullName },
    { label: "Trading Name", value: user.tradingName },
    {
      label: "Phone",
      value: user.contact ? `${user.contact}` : null,
    },
    { label: "Licensed By", value: user.licensedBy || "" },
    { label: "License Number", value: user.licenseNumber || "" },
    { label: "Website", value: user.website || "" },
    { label: "Address", value: user.address || "" },
    { label: "Cookie Consent", value: user.cookieConsent || "" },
  ];

  return (
    <>
      <OutletHeading name="Company Details" />
      <div className="max-w-4xl w-full overflow-hidden mx-auto bg-(--white) shadow-lg rounded-xl p-3 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-4 sm:mb-6 text-center sm:text-left gap-2 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase text-(--dark-grey) mb-1">
              {user.companyName}
            </h2>
            {user.email && (
              <p className="text-xs sm:text-sm text-(--dark-grey)">{user.email}</p>
            )}
          </div>
          {user?.profileImage ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center rounded-md border border-(--light-gray) shadow-md bg-(--lightest-gray)">
              <img
                src={user.profileImage}
                alt="Company Logo"
                className="w-full h-full object-contain rounded-md"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "";
                }}
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 flex items-center justify-center rounded-md border border-(--medium-grey) shadow-md bg-(--light-gray)">
              <Icons.Building2 className="w-10 h-10 sm:w-12 sm:h-12 bg-(--medium-grey)" />
            </div>
          )}
        </div>
        <hr className="mb-4 sm:mb-6 border-[var(--light-gray)]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-8 text-xs sm:text-sm text-(--dark-grey)">
          {fields.map(
            (field, idx) =>
              field.value && (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-start gap-1"
                >
                  <strong className="text-xs sm:text-sm sm:min-w-[130px]">{field.label}:</strong>
                  {field.label === "Address" ? (
                    <span style={{ whiteSpace: "pre-line" }}>
                      {field.value}
                    </span>
                  ) : (
                    <span className="break-all">{field.value}</span>
                  )}
                </div>
              ),
          )}
        </div>
      </div>
    </>
  );
};

export default ViewCompany;