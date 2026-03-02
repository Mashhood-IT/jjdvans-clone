import React, { useEffect } from "react";
import Icons from "../../../assets/icons";
import { useSelector } from "react-redux";
import OutletHeading from "../../constants/constantcomponents/OutletHeading";
import { useGetSuperadminInfoQuery } from "../../../redux/api/userApi";

const ViewCompany = () => {
  const user = useSelector((state) => state.auth.user);

  const { data } = useGetSuperadminInfoQuery();

  return (
    <>
      <OutletHeading name="Company Details" />

      <div className="max-w-4xl w-full overflow-hidden mx-auto bg-(--white) shadow-lg rounded-xl p-3 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-4 sm:mb-6 text-center sm:text-left gap-2 sm:gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold uppercase text-(--dark-grey) mb-1">
              {data?.superadminCompanyName}
            </h2>

            {data?.superadminCompanyEmail && (
              <p className="text-xs sm:text-sm text-(--dark-grey)">
                {data.superadminCompanyEmail}
              </p>
            )}
          </div>

          {data?.superadminCompanyLogo ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center rounded-md border border-(--light-gray) shadow-md bg-(--lightest-gray)">
              <img
                src={data.superadminCompanyLogo}
                alt="Company Logo"
                className="w-full h-full object-contain rounded-md"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center rounded-md border border-(--medium-grey) shadow-md bg-(--light-gray)">
              <Icons.Building2 className="w-10 h-10 sm:w-12 sm:h-12 bg-(--medium-grey)" />
            </div>
          )}
        </div>

        <hr className="mb-4 sm:mb-6 border-(--light-gray)" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-4 sm:gap-x-8 text-xs sm:text-sm text-(--dark-grey)">
          {data?.superadminCompanyAddress && (
            <div className="flex flex-col sm:flex-row items-start justify-center gap-1">
              <strong className="mr-4">Address:</strong>
              <span style={{ whiteSpace: "pre-line" }}>
                {data.superadminCompanyAddress}
              </span>
            </div>
          )}

          {data?.superadminCompanyPhoneNumber && (
            <div className="flex flex-col sm:flex-row items-start gap-1">
              <strong className="mr-4">Phone:</strong>
              <span className="break-all">
                {data.superadminCompanyPhoneNumber}
              </span>
            </div>
          )}

          {data?.superadminCompanyWebsite && (
            <div className="flex flex-col sm:flex-row items-start gap-1">
              <strong className="mr-4">Website:</strong>
              <span className="break-all">{data.superadminCompanyWebsite}</span>
            </div>
          )}

          {data?.superadminCompanyEmail && (
            <div className="flex flex-col sm:flex-row items-start gap-1">
              <strong className="mr-4">Email:</strong>
              <span className="break-all">{data.superadminCompanyEmail}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewCompany;