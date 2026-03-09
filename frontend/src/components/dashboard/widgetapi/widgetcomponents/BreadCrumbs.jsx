import React from "react";
import { Link, useLocation } from "react-router-dom";

const BreadCrumbs = () => {
    const location = useLocation();
    const sp = new URLSearchParams(location.search);
    const companyId = sp.get("company") || "";
  
    const steps = [
      { name: "Journey", path: "/widget-form", match: ["/widget-form", "/widget-form/widget-details"] },
      { name: "Vehicle", path: "/widget-form/widget-vehicle", match: ["/widget-form/widget-vehicle"] },
      { name: "Inventory", path: "/widget-form/widget-inventory", match: ["/widget-form/widget-inventory"] },
      { name: "Payment", path: "/widget-form/widget-payment", match: ["/widget-form/widget-payment"] },
    ];
  
    const currentPath = location.pathname.endsWith("/") ? location.pathname.slice(0, -1) : location.pathname;
  
    const currentStepIndex = steps.findIndex(step =>
      step.match.some(m => {
        const normalizedM = m.endsWith("/") ? m.slice(0, -1) : m;
        return normalizedM === currentPath;
      })
    );
  
    const getStepAvailability = (index) => {
      if (index === 0) return true;
      if (index === 1) return !!localStorage.getItem("bookingForm");
      if (index === 2) return !!localStorage.getItem("selectedVehicle");
      if (index === 3) return !!localStorage.getItem("widgetInventoryData");
      return false;
    };
  
    if (currentPath === "/widget-form/widget-success") return null;
  
    return (
      <nav className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2 md:gap-4 mb-8 px-4 max-w-4xl mx-auto">
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isAvailable = getStepAvailability(index);
          const isCompleted = index < currentStepIndex;
  
          return (
            <React.Fragment key={step.name}>
              <div className="flex items-center justify-center w-[calc(50%-0.25rem)] md:flex-1 md:min-w-0">
                {isAvailable && !isActive ? (
                  <Link
                    to={`${step.path}?company=${companyId}`}
                    className="flex items-center widget-label-text text-gray-900 hover:text-(--main-color) transition-colors whitespace-nowrap"
                  >
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] mr-2 flex-shrink-0 ${isCompleted ? "bg-(--main-color) text-(--white)" : "border-2 border-gray-900 bg-(--white) text-gray-900"
                        }`}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </span>
                    {step.name}
                  </Link>
                ) : (
                  <div
                    className={`flex items-center widget-label-text whitespace-nowrap ${isActive ? "text-gray-900" : "text-gray-400"
                      }`}
                  >
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full border-2 text-[10px] mr-2 transition-colors flex-shrink-0 ${isActive
                        ? "border-gray-900 bg-gray-900 text-(--white)"
                        : "border-gray-300 bg-(--white) text-gray-400"
                        }`}
                    >
                      {index + 1}
                    </span>
                    {step.name}
                  </div>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block w-12 lg:w-16 h-px bg-gray-300 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </nav>
    );
  };

  export default BreadCrumbs