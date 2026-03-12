import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import MobileSidebar from "../components/sidebar/MobileSidebar";

const DashboardLayout = () => {
  const [activeSubTabs, setActiveSubTabs] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <>
      <MobileSidebar
        toggleSidebar={toggleSidebar}
        isOpen={isSidebarOpen}
        activeSubTabs={activeSubTabs}
        setActiveSubTabs={setActiveSubTabs}
      />
      <div className="h-screen flex flex-col overflow-hidden bg-(--lightest-gray)">
        <div>
          <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </div>

        <div className="flex flex-1 min-h-0">
          <div
            className={`shrink-0 hidden md:block transition-all duration-300`}
            style={{ width: isSidebarOpen ? undefined : "60px", overflow: isSidebarOpen ? undefined : "hidden" }}
          >
            <Sidebar
              activeSubTabs={activeSubTabs}
              setActiveSubTabs={setActiveSubTabs}
              isOpen={isSidebarOpen}
            />
          </div>

          <div className="flex-1 relative min-w-0 flex flex-col">
            <div className="flex-1 flex flex-col bg-(--white) border border-(--lightest-gray) overflow-hidden">
              <div className="flex-1 overflow-y-auto">
                <div
                  className="md:p-6 p-3"
                >
                  <Outlet />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardLayout;