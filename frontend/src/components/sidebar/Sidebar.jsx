import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import classNames from "classnames";
import Icons from "../../assets/icons";
import sidebarItems from "../constants/constantcomponents/sidebarItems";

const Sidebar = ({ activeSubTabs, setActiveSubTabs, isOpen = true }) => {
  const user = useSelector((state) => state?.auth?.user);
  const userRole = user?.role;
  const location = useLocation();

  const [activeMain, setActiveMain] = useState(null);

  const [parentTabPosition, setParentTabPosition] = useState(0);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarTabs = sidebarItems
    .map((item) => {
      const hasRole =
        !item.roles || item.roles.length === 0 || item.roles.includes(userRole);

      if (!hasRole) return null;

      const filteredSubTabs = item.subTabs
        ?.map((sub) => {
          const subHasRole =
            !sub.roles ||
            sub.roles.length === 0 ||
            sub.roles.includes(userRole);

          if (!subHasRole) return null;

          if (sub.subTabs) {
            const filteredNestedSubTabs = sub.subTabs.filter((nestedSub) => {
              const nestedHasRole =
                !nestedSub.roles ||
                nestedSub.roles.length === 0 ||
                nestedSub.roles.includes(userRole);
              return nestedHasRole;
            });

            if (filteredNestedSubTabs.length === 0) return null;

            return {
              ...sub,
              subTabs: filteredNestedSubTabs,
            };
          }

          return sub;
        })
        .filter(Boolean);

      if (item.subTabs && filteredSubTabs.length === 0) return null;

      return {
        ...item,
        subTabs: filteredSubTabs,
      };
    })
    .filter(Boolean);

  useEffect(() => {
    const mainIndex = sidebarTabs.findIndex((item) => {
      if (item.route === location.pathname) return true;

      return item.subTabs?.some((sub) => {
        if (sub.route === location.pathname) return true;
        return sub.subTabs?.some(
          (nestedSub) => nestedSub.route === location.pathname,
        );
      });
    });

    if (mainIndex !== -1) {
      setActiveMain(mainIndex);
      const newActiveSubTabs = {};
      sidebarTabs[mainIndex].subTabs?.forEach((sub, subIndex) => {
        if (sub.route === location.pathname) {
          newActiveSubTabs[`${mainIndex}-${subIndex}`] = true;
        } else if (
          sub.subTabs?.some(
            (nestedSub) => nestedSub.route === location.pathname,
          )
        ) {
          newActiveSubTabs[`${mainIndex}-${subIndex}`] = true;
        }
      });

      setActiveSubTabs(newActiveSubTabs);
    }
  }, [location.pathname]);

  const handleToggle = (index) => {
    if (activeMain === index) {
      setActiveMain(null);
      setActiveSubTabs({});
    } else {
      setActiveMain(index);
      setActiveSubTabs({});
    }
  };

  const handleSubToggle = (mainIndex, subIndex) => {
    const key = `${mainIndex}-${subIndex}`;
    setActiveSubTabs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getCollapsedWidth = () => {
    if (isOpen) return "w-64 h-full";
    const activeParent = activeMain !== null ? sidebarTabs[activeMain] : null;
    const hasActiveSubtabs = activeParent?.subTabs?.length > 0;
    const hasActiveNestedSubtabs = activeParent?.subTabs?.some(
      (sub, subIdx) => {
        const subKey = `${activeMain}-${subIdx}`;
        return activeSubTabs[subKey] && sub.subTabs?.length > 0;
      },
    );
    if (hasActiveNestedSubtabs) return "w-36 h-full";
    if (hasActiveSubtabs) return "w-24 h-full";
    return "w-16 h-full";
  };

  return (
    <>
      <div
        className={classNames(
          getCollapsedWidth(),
          "min-w-16",
          "text-(--white)",
          "flex items-start gap-0",
          "duration-300",
          "relative",
        )}
        style={{ transition: "0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
      >
        <div
          className={classNames(
            isOpen ? "w-64" : "w-16",
            isMobileView && "rounded-none",
            "flex flex-col h-full bg-(--navy-blue) border-t relative border-r border-(--light-gray) overflow-hidden",
          )}
        >
          <div className="flex-1 overflow-y-auto pr-0.5 custom_scrollbar">
            <ul className="flex flex-col mt-4">
              {sidebarTabs.map((item, index) => {
                const isMainActive =
                  index === activeMain ||
                  item.route === location.pathname ||
                  item.subTabs?.some((sub) => {
                    if (sub.route === location.pathname) return true;
                    return sub.subTabs?.some(
                      (nestedSub) => nestedSub.route === location.pathname,
                    );
                  });

                return (
                  <div key={index}>
                    {item.subTabs?.length > 0 ? (
                      <>
                        <li
                          ref={(el) => {
                            if (el && index === activeMain && !isOpen) {
                              setParentTabPosition(el.offsetTop);
                            }
                          }}
                          onClick={() => handleToggle(index)}
                          className={`relative p-4 hover-theme flex items-center justify-between cursor-pointer ${isMainActive ? "active-theme" : ""
                            } ${isOpen ? "pl-4 pr-3" : "justify-center"}`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon className="w-4 h-4" />
                            {isOpen && (
                              <span className="text-sm font-medium">
                                {item.title}
                              </span>
                            )}
                          </div>
                          {isOpen && (
                            <Icons.ChevronDown
                              className={`w-4 h-4 transition-transform ${activeMain === index ? "rotate-180" : ""
                                }`}
                            />
                          )}
                        </li>
                        {isOpen && activeMain === index && (
                          <ul className="ml-6">
                            {item.subTabs.map((sub, subIndex) => {
                              const subKey = `${index}-${subIndex}`;
                              const isSubActive =
                                activeSubTabs[subKey] ||
                                sub.route === location.pathname ||
                                sub.subTabs?.some(
                                  (nestedSub) =>
                                    nestedSub.route === location.pathname,
                                );

                              return (
                                <li key={subIndex}>
                                  {sub.subTabs?.length > 0 ? (
                                    <>
                                      <div
                                        onClick={() =>
                                          handleSubToggle(index, subIndex)
                                        }
                                        className={`flex items-center justify-between p-2 gap-3 hover-theme cursor-pointer ${isSubActive ? "active-theme" : ""
                                          }`}
                                      >
                                        <div className="flex items-center gap-3">
                                          <sub.icon className="w-4 h-4" />
                                          <span className="text-[13px]">
                                            {sub.title}
                                          </span>
                                        </div>
                                        <Icons.ChevronDown
                                          className={`w-4 h-4 transition-transform ${activeMain === index
                                            ? "rotate-180"
                                            : ""
                                            }`}
                                        />
                                      </div>
                                      {activeSubTabs[subKey] && (
                                        <ul className="ml-6">
                                          {sub.subTabs.map(
                                            (nestedSub, nestedIndex) => (
                                              <li key={nestedIndex}>
                                                <Link
                                                  to={nestedSub.route}
                                                  className={`flex items-center p-2 gap-3 hover-theme ${nestedSub.route ===
                                                    location.pathname
                                                    ? "active-theme"
                                                    : ""
                                                    }`}
                                                >
                                                  <nestedSub.icon className="w-4 h-4" />
                                                  <span className="text-[13px]">
                                                    {nestedSub.title}
                                                  </span>
                                                </Link>
                                              </li>
                                            ),
                                          )}
                                        </ul>
                                      )}
                                    </>
                                  ) : (
                                    <Link
                                      to={sub.route}
                                      className={`flex items-center p-2 gap-3 hover-theme ${sub.route === location.pathname
                                        ? "active-theme"
                                        : ""
                                        }`}
                                    >
                                      <sub.icon className="w-4 h-4" />
                                      <span className="text-[15px]">
                                        {sub.title}
                                      </span>
                                    </Link>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </>
                    ) : (
                      <Link
                        to={item.route}
                        className={`p-4 hover-theme flex items-center cursor-pointer ${isOpen ? "justify-start pl-4" : "justify-center"
                          } ${location.pathname === item.route && "active-theme"}`}
                      >
                        <item.icon className="w-4 h-4" />
                        {isOpen && (
                          <span className="ml-3 text-[15px]">{item.title}</span>
                        )}
                      </Link>
                    )}
                  </div>
                );
              })}
            </ul>
          </div>
          <div
            className={`w-full ${isOpen ? "lg:block" : "hidden"
              } border-t border-(--light-gray) z-10`}
          >
            <div
              className={`${isOpen ? "text-center" : "flex justify-center"}`}
            >
              <footer className="p-3 text-(--white) text-sm text-center">
                © {new Date().getFullYear()} MTL Booking App. <br /> All
                rights reserved.
              </footer>
            </div>
          </div>
        </div>

        {!isOpen &&
          activeMain !== null &&
          sidebarTabs[activeMain]?.subTabs?.length > 0 && (
            <div
              className={classNames(
                "w-12 mr-2.5 flex flex-col",
                "ml-1.75",
                "h-fit",
                "border-r border-(--light-gray)",
                "absolute overflow-hidden left-14",
                !sidebarTabs[activeMain].subTabs.some((sub, idx) => {
                  const subKey = `${activeMain}-${idx}`;
                  return activeSubTabs[subKey] && sub.subTabs?.length > 0;
                }) && "rounded-r-2xl",
              )}
              style={
                isMobileView
                  ? { maxWidth: "100vw" }
                  : {
                    top: `${parentTabPosition + 6}px`,
                    maxHeight: `calc(100vh - ${parentTabPosition + 20}px)`,
                  }
              }
            >
              <div className="flex-1 overflow-y-auto custom_scrollbar">
                {sidebarTabs[activeMain].subTabs.map((sub, subIdx) => {
                  const subKey = `${activeMain}-${subIdx}`;
                  const isSubTabActive =
                    sub.route === location.pathname ||
                    sub.subTabs?.some(
                      (nestedSub) => nestedSub.route === location.pathname,
                    );

                  return (
                    <Link
                      key={subIdx}
                      to={sub.route || "#"}
                      onClick={(e) => {
                        if (sub.subTabs) {
                          e.preventDefault();
                          handleSubToggle(activeMain, subIdx);
                        }
                      }}
                      className={classNames(
                        "p-3 flex items-center justify-center cursor-pointer",
                        "hover-theme",
                        isSubTabActive && "active-theme",
                      )}
                      title={sub.title}
                    >
                      <sub.icon className="w-4 h-4" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        {!isOpen &&
          activeMain !== null &&
          (() => {
            const activeParent = sidebarTabs[activeMain];
            if (!activeParent?.subTabs) return null;

            const expandedSubIdx = activeParent.subTabs.findIndex(
              (sub, idx) => {
                const subKey = `${activeMain}-${idx}`;
                return activeSubTabs[subKey] && sub.subTabs?.length > 0;
              },
            );

            if (expandedSubIdx === -1) return null;

            const expandedSub = activeParent.subTabs[expandedSubIdx];

            return (
              <div
                className="w-12 flex flex-col rounded-r-xl border-r border-(--light-gray) h-fit absolute overflow-hidden left-27.25"
                style={
                  isMobileView
                    ? { maxWidth: "100vw" }
                    : {
                      top: `${parentTabPosition + 12}px`,
                      maxHeight: `calc(100vh - ${parentTabPosition + 30}px)`,
                    }
                }
              >
                <div className="flex-1 overflow-y-auto custom_scrollbar">
                  {expandedSub.subTabs.map((nestedSub, nestedIdx) => {
                    const isNestedActive = nestedSub.route === location.pathname;

                    return (
                      <Link
                        key={nestedIdx}
                        to={nestedSub.route}
                        className={`p-3 hover-theme  flex items-center justify-center cursor-pointer ${isNestedActive ? "active-theme" : ""
                          }`}
                        title={nestedSub.title}
                      >
                        <nestedSub.icon className="w-4 h-4" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })()}
      </div>
    </>
  );
};

export default Sidebar;