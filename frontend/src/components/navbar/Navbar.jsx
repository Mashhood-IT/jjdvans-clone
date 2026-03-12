import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Icons from "../../assets/icons";
import IMAGES from "../../assets/images";
import { useGetSuperadminInfoQuery } from "../../redux/api/userApi";

const Navbar = ({ toggleSidebar }) => {
  const user = useSelector((state) => state.auth.user);
  const notifRef = useRef(null);
  const notifRefMobile = useRef(null);
  const themeRef = useRef(null);
  const themeRefMobile = useRef(null);
  const userRef = useRef(null);
  const userRefMobile = useRef(null);
  const TimeRef = useRef(null);

  const closeAllTooltips = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const toggleUser = (e) => {
    e?.stopPropagation();
    const currentState = isDropdownOpen;
    closeAllTooltips();
    setIsDropdownOpen(!currentState);
  };

  const email = user?.email;
  const name = user?.fullName;
  const profileImg = user?.profileImage;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const { data: superadminData } = useGetSuperadminInfoQuery();

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth <= 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const isOutsideNotif =
        (!notifRef.current || !notifRef.current.contains(e.target)) &&
        (!notifRefMobile.current || !notifRefMobile.current.contains(e.target));
      const isOutsideTheme =
        (!themeRef.current || !themeRef.current.contains(e.target)) &&
        (!themeRefMobile.current || !themeRefMobile.current.contains(e.target));
      const isOutsideUser =
        (!userRef.current || !userRef.current.contains(e.target)) &&
        (!userRefMobile.current || !userRefMobile.current.contains(e.target));

      if (isOutsideNotif && isOutsideTheme && isOutsideUser) {
        closeAllTooltips();
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, [closeAllTooltips]);

  const superadminLogo =
    superadminData?.superadminCompanyLogo || user?.superadminCompanyLogo;
  const companyName = superadminData?.superadminCompanyName;
  const companyLogo = superadminLogo || IMAGES.dashboardSmallLogo;

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


  useEffect(() => {
    if (!user?.companyId) return;
  }, [user?.companyId]);

  const UserDropdown = () => (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onMouseEnter={!isMobile ? handleMouseEnterTooltip : undefined}
      onMouseLeave={!isMobile ? handleMouseLeave : undefined}
      className="absolute right-0 mt-2 w-48 bg-(--white) text-(--dark-grey) z-999"
    >
      <div className="border-b">
        <div className="ps-4 pt-4 flex items-center space-x-3">
          {profileImg && profileImg !== "" && profileImg !== "default" ? (
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
                : user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
            </p>
          </div>
        </div>

        <div className="ps-4 py-2">
          <p className="text-sm truncate text-(--dark-gray)">{email}</p>
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
      <nav className="bg-(--navy-blue) text-(--white) z-20 relative p-3 sm:p-4 lg:p-[17.2px] flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <div className="flex items-center justify-between w-full md:w-auto shrink-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSidebar}
              className="cursor-pointer p-2 rounded-lg md:border-hidden! border border-theme"
            >
              <Icons.Menu className="text-(--white)" />
            </button>
            <h1 className="text-xl hidden lg:block font-bold uppercase">
              ADMIN PANEL
            </h1>
            <p className="font-semibold hidden md:block text-(--white) truncate">
              [&nbsp;{displayName || "Guest"}&nbsp;]
            </p>
          </div>

          <div className="md:hidden flex items-center gap-1.5 shrink-0">
            <div className="relative" ref={userRefMobile}>
              <button
                onClick={toggleUser}
                className="flex cursor-pointer items-center gap-2 p-2 rounded-lg border border-(--white) text-sm shadow-md"
              >
                <Icons.User className="w-4 h-4 text-(--white)" />
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
            <div className="flex lg:flex-row md:flex-row sm:flex-row xs flex-row-reverse">
              <div className="relative" ref={userRef}>
                <button
                  onClick={toggleUser}
                  className="flex cursor-pointer items-center gap-2 p-2 rounded-lg border border-(--white) text-sm shadow-md text-(--black) transition duration-200"
                >
                  <Icons.User className="w-4 h-4 text-(--white)" />
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