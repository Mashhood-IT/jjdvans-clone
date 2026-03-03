import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const NewBooking = ({ onClose }) => {
  const user = useSelector((state) => state.auth.user);
  const companyId = user?.companyId;
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === "resizeWidget") {
        if (iframeRef.current) {
          iframeRef.current.style.height = `${event.data.height}px`;
          setLoading(false);
        }
      }
      if (event.data && event.data.type === "bookingSuccess") {
        onClose?.();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onClose]);

  const widgetUrl = `/widget-form?company=${companyId}&source=admin`;

  return (
    <div className="w-full relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={widgetUrl}
        className="w-full border-none transition-all duration-300"
        style={{ overflow: "hidden" }}
        title="Booking Widget"
        onLoad={() => setLoading(false)}
      />
    </div>
  );
};

export default NewBooking;