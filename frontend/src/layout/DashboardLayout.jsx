import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";

const DashboardLayout = () => {
  const [activeSubTabs, setActiveSubTabs] = useState({});

  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden bg-(--lightest-gray)">
        <div className="shrink-0 md:px-4 md:py-4">
          <Navbar />
        </div>

        <div className="flex flex-1 min-h-0 md:px-4 md:pb-4">
          <div
            className={`shrink-0 hidden md:block ${activeSubTabs ? "md:mr-5" : "md:mr-4"}`}
          >
            <Sidebar
              activeSubTabs={activeSubTabs}
              setActiveSubTabs={setActiveSubTabs}
            />
          </div>

          <div className="flex-1 relative min-w-0 flex flex-col">
            <div className="flex-1 flex flex-col bg-(--white) md:rounded-2xl rounded-none shadow-lg border border-(--lightest-gray) overflow-hidden">
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
