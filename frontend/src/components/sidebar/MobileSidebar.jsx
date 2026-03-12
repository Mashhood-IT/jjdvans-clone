import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import classNames from "classnames";
import Icons from "../../assets/icons";
import sidebarItems from "../constants/constantcomponents/sidebarItems";

const MobileSidebar = ({ activeSubTabs, setActiveSubTabs, isOpen, toggleSidebar }) => {
    const user = useSelector((state) => state?.auth?.user);
    const userRole = user?.role;
    const location = useLocation();

    const [activeMain, setActiveMain] = useState(null);

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

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}
            <div
                className={classNames(
                    "fixed top-0 left-0 bg-(--navy-blue) h-full z-50 transition-all duration-300 ease-in-out md:hidden",
                    isOpen ? "w-64" : "w-0 overflow-hidden"
                )}
            >
                <div className="flex flex-col h-full text-(--white) overflow-hidden">
                    <div className="flex border-b border-(--light-gray) justify-between p-3">
                        <h1 className="text-xl font-bold uppercase">
                            ADMIN PANEL
                        </h1 >
                        <button onClick={toggleSidebar} className="cursor-pointer">
                            <Icons.X className="w-6 h-6 text-(--white)" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <ul className="flex flex-col">
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
                                                    onClick={() => handleToggle(index)}
                                                    className={`relative p-4 flex items-center justify-between cursor-pointer ${isMainActive ? "active-theme" : ""
                                                        } pl-4 pr-3`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className="w-4 h-4 text-(--white)" />
                                                        <span className="text-sm font-medium text-(--white)">
                                                            {item.title}
                                                        </span>
                                                    </div>
                                                    <Icons.ChevronDown
                                                        className={`w-4 h-4 text-(--white) transition-transform ${activeMain === index ? "rotate-180" : ""
                                                            }`}
                                                    />
                                                </li>
                                                {activeMain === index && (
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
                                                                                className={`flex items-center justify-between p-2 gap-3 cursor-pointer ${isSubActive ? "active-theme" : ""
                                                                                    }`}
                                                                            >
                                                                                <div className="flex items-center gap-3">
                                                                                    <sub.icon className="w-4 h-4 text-(--white)" />
                                                                                    <span className="text-[13px] text-(--white)">
                                                                                        {sub.title}
                                                                                    </span>
                                                                                </div>
                                                                                <Icons.ChevronDown
                                                                                    className={`w-4 h-4 text-(--white) transition-transform ${activeMain === index
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
                                                                                                    onClick={toggleSidebar}
                                                                                                    className={`flex items-center p-2 gap-3 hover-(--lighter-gray) ${nestedSub.route ===
                                                                                                        location.pathname
                                                                                                        ? "active-(theme)"
                                                                                                        : ""
                                                                                                        }`}
                                                                                                >
                                                                                                    <nestedSub.icon className="w-4 h-4 text-(--white)" />
                                                                                                    <span className="text-[13px] text-(--white)">
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
                                                                            onClick={toggleSidebar}
                                                                            className={`flex items-center p-2 gap-3 hover-(--lighter-gray) ${sub.route === location.pathname
                                                                                ? "active-(theme)"
                                                                                : ""
                                                                                }`}
                                                                        >
                                                                            <sub.icon className="w-4 h-4 text-(--white)" />
                                                                            <span className="text-[15px] text-(--white)">
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
                                                onClick={toggleSidebar}
                                                className={`p-4 hover-(--lighter-gray) flex items-center cursor-pointer justify-start pl-4 ${location.pathname === item.route && "active-(theme)"}`}
                                            >
                                                <item.icon className="w-4 h-4 text-(--white)" />
                                                <span className="ml-3 text-[15px] text-(--white)">{item.title}</span>
                                            </Link>
                                        )}
                                    </div>
                                );
                            })}
                        </ul>
                    </div>
                    <div className="mt-auto border-t border-(--light-gray)">
                        <footer className=" md:p-3 p-2 text-(--white) text-sm text-center">
                            © {new Date().getFullYear()} MTL Booking App. <br /> All
                            rights reserved.
                        </footer>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileSidebar;