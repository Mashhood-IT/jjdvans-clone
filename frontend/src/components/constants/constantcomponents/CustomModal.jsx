import React from "react";
import Icons from "../../../assets/icons";

const CustomModal = ({
  isOpen,
  onClose,
  heading,
  children,
  modalClassName = "",
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-(--black)/20 flex items-center justify-center z-[9999] p-4 md:p-6"
      onClick={onClose}
    >
      <div
        className={`w-full sm:w-auto md:min-w-[450px] max-w-[95vw] sm:max-w-4xl max-h-[90vh] bg-(--white) rounded-2xl border border-[var(--light-gray)] overflow-hidden flex flex-col shadow-2xl ${modalClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center bg-theme border-b border-(--light-gray) p-3 shrink-0">
          <h2
            className="text-lg sm:text-xl font-bold text-theme md:ps-3"
            style={{
              fontFamily: "sans-serif",
            }}
          >
            {heading}
          </h2>
          <button
            onClick={onClose}
            className="text-theme cursor-pointer transition hover:opacity-80 p-1 pe-3"
          >
            <Icons.X className="size-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CustomModal;