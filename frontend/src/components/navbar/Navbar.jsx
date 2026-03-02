import React, { useCallback, useEffect, useRef, useState } from "react";
import {  useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Icons from "../../assets/icons";
import IMAGES from "../../assets/images";
import { useGetSuperadminInfoQuery } from "../../redux/api/userApi";
// import {
//   useGetUserNotificationsQuery,
//   useMarkAllAsReadMutation,
//   useMarkAsReadMutation,
// } from "../../../redux/api/notificationApi";

const Navbar = () => {
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const empArg =
    user?.role === "driver"
      ? String(user?.employeeNumber || "")
      : String(user?._id || "");

  const companyId = user?.companyId;
  const notifRef = useRef(null);
  const notifRefMobile = useRef(null);
  const themeRef = useRef(null);
  const themeRefMobile = useRef(null);
  const userRef = useRef(null);
  const userRefMobile = useRef(null);
  const TimeRef = useRef(null);

  const closeAllTooltips = useCallback(() => {
    setShowTooltip(false);
    setIsDropdownOpen(false);
  }, []);

  const toggleNotif = (e) => {
    e?.stopPropagation();
    const currentState = showTooltip;
    closeAllTooltips();
    setShowTooltip(!currentState);
  };

  const toggleUser = (e) => {
    e?.stopPropagation();
    const currentState = isDropdownOpen;
    closeAllTooltips();
    setIsDropdownOpen(!currentState);
  };

  const email = user?.email;
  const name = user?.fullName;
  const profileImg = user?.profileImage;

  const toggleSidebar = true;
  const [showTooltip, setShowTooltip] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // const [markAsRead] = useMarkAsReadMutation();
  // const [markAllAsRead] = useMarkAllAsReadMutation();
  // const { data: notifications = [] } = useGetUserNotificationsQuery(empArg, {
  //   skip: !empArg,
  // });
  const { data: superadminData } = useGetSuperadminInfoQuery();


  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isOutsideNotif = (!notifRef.current || !notifRef.current.contains(e.target)) &&
        (!notifRefMobile.current || !notifRefMobile.current.contains(e.target));
      const isOutsideTheme = (!themeRef.current || !themeRef.current.contains(e.target)) &&
        (!themeRefMobile.current || !themeRefMobile.current.contains(e.target));
      const isOutsideUser = (!userRef.current || !userRef.current.contains(e.target)) &&
        (!userRefMobile.current || !userRefMobile.current.contains(e.target));

      if (isOutsideNotif && isOutsideTheme && isOutsideUser) {
        closeAllTooltips();
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [closeAllTooltips]);

  const handleNotificationClick = (jobId) => {
  };

  const superadminLogo = superadminData?.superadminCompanyLogo || user?.superadminCompanyLogo;
  const companyName = superadminData?.superadminCompanyName
  const companyLogo = superadminLogo || IMAGES.dashboardSmallLogo


  const displayName = (name || "")
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  const handleMouseLeave = () => {
    if (isMobile) return;
    TimeRef.current = setTimeout(() => {
      closeAllTooltips();
    }, 400);
  };

  const handleMouseEnterTooltip = () => {
    if (isMobile) return;
    if (TimeRef.current) {
      clearTimeout(TimeRef.current);
      TimeRef.current = null;
    }
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? "s" : ""} ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
  };

  useEffect(() => {
    if (!user?.companyId) return;
  }, [user?.companyId]);



  // const NotificationTooltip = () => (
  //   <div
  //     onMouseEnter={!isMobile ? handleMouseEnterTooltip : undefined}
  //     onMouseLeave={!isMobile ? handleMouseLeave : undefined}
  //     className={`bg-(--white) ${isMobile ? "fixed left-4 right-4 top-28" : "absolute top-full right-0 lg:w-96 w-64"} border-[var(--light-gray)] border-[1.5px] mt-2 text-(--black) z-[999] max-h-96 overflow-hidden shadow-xl rounded-xl`}
  //   >
  //     <div className="border-b px-4 py-3 text-white bg-theme">
  //       <div className="flex items-center justify-between">
  //         <div className="flex items-center gap-2">
  //           <h3 className="font-semibold">Notifications</h3>
  //         </div>
  //         <button
  //           onClick={async () => {
  //             try {
  //               await markAllAsRead(empArg).unwrap();
  //             } catch (err) { }
  //           }}
  //           className="text-sm cursor-pointer"
  //         >
  //           Mark all as read
  //         </button>
  //       </div>
  //     </div>
  //     {(!Array.isArray(notifications) ||
  //       notifications.length === 0) && (
  //         <div className="px-4 py-3 text-(--medium-grey) text-sm">
  //           No new notifications
  //         </div>
  //       )}
  //     <div className="max-h-64 overflow-y-auto">
  //       {Array.isArray(notifications) &&
  //         notifications.map((data) => {
  //           const isDocExpiry = data.status === "Document Expired";

  //           return (
  //             <Link
  //               key={data._id}
  //               to="/dashboard/settings/notifications"
  //               onClick={(e) => {
  //                 if (userRole === "driver") {
  //                   e.preventDefault();
  //                   handleNotificationClick(data.jobId);
  //                 } else if (isDocExpiry) {
  //                   e.preventDefault();
  //                 }
  //                 setShowTooltip(false);
  //               }}
  //               className={`block px-4 py-3 border-b border-(--lightest-gray) hover:bg-(--lightest-gray) transition-colors duration-200 ${data.isRead
  //                 ? "bg-(--lightest-gray) opacity-60"
  //                 : "bg-(--white)"
  //                 } ${isDocExpiry ? "cursor-default" : "cursor-pointer"
  //                 }`}
  //             >
  //               <div className="flex items-start gap-3">
  //                 <div className="flex-1">
  //                   {isDocExpiry ? (
  //                     <>
  //                       <div className="flex items-start justify-between">
  //                         <h4 className="text-xs text-(--dark-gray) font-medium">
  //                           Document Expired
  //                         </h4>
  //                         <span className="text-xs font-medium text-(dark--gray)">
  //                           <span>Employee Number:</span>#
  //                           {data.expiryDetails
  //                             .driverEmployeeNumber ||
  //                             "New Notification"}
  //                         </span>
  //                       </div>
  //                       <p className="text-xs text-[var(--dark-gray)] mt-1">
  //                         Driver:
  //                         <span className="font-medium">
  //                           {data.expiryDetails?.driverName}
  //                         </span>
  //                       </p>
  //                       <p className="text-xs text-(--primary-dark-red) mt-1">
  //                         Expired:
  //                         {data.expiryDetails?.expiredDocuments?.join(
  //                           ", "
  //                         )}
  //                       </p>
  //                     </>
  //                   ) : (
  //                     <>
  //                       <div className="flex items-start justify-between">
  //                         <h4 className="text-sm text-(dark-grey)">
  //                           {data.status || "New Notification"}
  //                         </h4>
  //                         <div>
  //                           <span className="text-xs text-(--dark-grey)">
  //                             #{data?.bookingId || "_"}
  //                           </span>
  //                         </div>
  //                       </div>
  //                       <p className="text-xs text-[var(--dark-gray)] mt-1 line-clamp-1">
  //                         {data?.primaryJourney?.pickup ||
  //                           data?.returnJourney?.pickup}
  //                       </p>
  //                     </>
  //                   )}

  //                   <div className="flex items-center mt-2 justify-between">
  //                     <div className="flex items-center space-x-1">
  //                       <Icons.Clock className="w-3 h-3 text-(--medium-gray)" />
  //                       <span className="text-xs text-(--medium-gray)">
  //                         {getTimeAgo(
  //                           data.bookingSentAt || data.createdAt
  //                         )}
  //                       </span>
  //                     </div>
  //                     <div>
  //                       {!data.isRead && (
  //                         <button
  //                           onClick={async (e) => {
  //                             e.stopPropagation();
  //                             try {
  //                               await markAsRead(data._id).unwrap();
  //                             } catch (err) { }
  //                           }}
  //                           className="text-xs px-2 py-1 text-(--black) cursor-pointer"
  //                         >
  //                           Mark as read
  //                         </button>
  //                       )}
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </Link>
  //           );
  //         })}
  //     </div>

  //     <div className="px-4 py-3 text-white bg-theme border-t">
  //       <Link
  //         onClick={() => setShowTooltip(false)}
  //         to="/dashboard/settings/notifications"
  //         className="w-full text-center text-sm font-medium flex items-center justify-center gap-2"
  //       >
  //         View All Notifications
  //       </Link>
  //     </div>
  //   </div>
  // );

  const UserDropdown = () => (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onMouseEnter={!isMobile ? handleMouseEnterTooltip : undefined}
      onMouseLeave={!isMobile ? handleMouseLeave : undefined}
      className="absolute right-0 mt-2 w-48 bg-(--white) text-(--dark-grey) rounded-lg shadow-lg z-[999]"
    >
      <div className="border-b">
        <div className="ps-4 pt-4 flex items-center space-x-3">
          {profileImg &&
            profileImg !== "" &&
            profileImg !== "default" ? (
            <img
              src={profileImg}
              alt="Profile"
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <img
              src={IMAGES.dummyImg}
              alt="Default"
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div className="min-w-0 w-24">
            <p className="font-semibold truncate whitespace-nowrap">
              {displayName}
            </p>
            <p className="font-light text-sm">
              {user?.role === "clientadmin"
                ? "Admin"
                : user?.role.charAt(0).toUpperCase() +
                user?.role.slice(1)}
            </p>
          </div>
        </div>

        <div className="ps-4 py-2">
          <p className="text-sm truncate text-[var(--dark-gray)]">
            {email}
          </p>
        </div>
      </div>

      <ul className="py-2" role="menu">
        <li role="menuitem">
          <Link
            to="/dashboard/profile"
            onClick={closeAllTooltips}
            className="block w-full px-4 py-2 hover:bg-(--lighter-gray) cursor-pointer"
          >
            Profile
          </Link>
        </li>
        <li role="menuitem">
          <Link
            to="/dashboard/logout"
            onClick={closeAllTooltips}
            className="block w-full px-4 py-2 hover:bg-(--lighter-gray) cursor-pointer"
          >
            Logout
          </Link>
        </li>
      </ul>
    </div>
  );

  return (
    <>
      <nav className="bg-[#07384d] text-white md:rounded-2xl rounded-none z-20 relative p-3 sm:p-4 lg:p-[17.2px] flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <div className="flex items-center justify-between w-full md:w-auto shrink-0">
          <div className="flex items-center space-x-2">
            <button onClick={toggleSidebar} className=" cursor-pointer p-2 rounded-lg md:border-hidden! border border-theme">
              <Icons.Menu className="size-6 text-white" />
            </button>
            <h1 className="text-xl hidden lg:block font-bold uppercase">
              ADMIN PANEL
            </h1>
            <p className="font-semibold hidden md:block text-white truncate">
              [&nbsp;{displayName || "Guest"}&nbsp;]
            </p>
          </div>

          <div className="md:hidden flex items-center gap-1.5 shrink-0">
            <div
              ref={notifRefMobile}
              className="cursor-pointer relative border border-theme bg-theme p-2 rounded-lg"
              onClick={toggleNotif}
              onMouseLeave={!isMobile ? handleMouseLeave : undefined}
            >
              <Icons.BellPlus className="size-4 text-white" />
              {/* <div>
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-(--alert-red) text-(--white) text-xs py-[0.8px] px-1.5 rounded-full">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </div> */}
              {/* {showTooltip && <NotificationTooltip />} */}
            </div>
            <div className="relative" ref={userRefMobile}>
              <button
                onClick={toggleUser}
                className="flex cursor-pointer items-center gap-2 p-2 rounded-lg bg-theme border border-theme text-sm shadow-md"
              >
                <Icons.User className="w-4 h-4 text-white" />
              </button>
              {isDropdownOpen && <UserDropdown />}
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-1 items-center justify-center gap-3 min-w-0 px-4">
          <div className="relative shrink-0">
            <img
              src={companyLogo}
              alt="Company Logo"
              className="relative size-12 object-contain rounded-md"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-(--white) font-bold text-md pb-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {companyName || "Your Company"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between w-full md:w-auto md:gap-6">
          <div className="flex md:hidden items-center gap-3 shrink-0 w-full min-w-0">
            <div className="relative shrink-0">
              <img
                src={companyLogo}
                alt="Company Logo"
                className="relative size-10 object-contain rounded-md"
              />
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-(--white) font-bold text-sm pb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {companyName}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-end gap-1.5 sm:gap-4 md:flex-wrap flex-nowrap shrink-0">
            <div
              ref={notifRef}
              className="cursor-pointer relative border border-theme bg-theme p-2 rounded-lg"
              onClick={toggleNotif}
              onMouseLeave={!isMobile ? handleMouseLeave : undefined}
            >
              <Icons.BellPlus className="size-4 text-white" />
              {/* <div>
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-(--alert-red) text-xs py-[0.8px] px-1.5 rounded-full">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
              </div> */}

              {/* {showTooltip && <NotificationTooltip />} */}
            </div>
            <div className="flex lg:flex-row md:flex-row sm:flex-row xs flex-row-reverse">
              <div className="relative" ref={userRef}>
                <button
                  onClick={toggleUser}
                  className="flex cursor-pointer items-center gap-2 p-2 rounded-lg border border-theme text-sm shadow-md text-(--black) transition duration-200"
                >
                  <Icons.User className="w-4 h-4 text-white" />
                </button>

                {isDropdownOpen && <UserDropdown />}
              </div>
            </div>

          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;