import React, { useState } from "react";
import { useSelector } from "react-redux";
import OutletHeading from "../../constants/constantcomponents/OutletHeading";

const WidgetAPI = () => {
  const user = useSelector((state) => state.auth.user);
  const [copied, setCopied] = useState(false);

  const BASE_URL =
    import.meta.env.VITE_BASE_URL_FRONTEND;
  const companyId = user?.companyId || "";

  const iframeCode = `<iframe
  id="mtlWidget"
  src="${BASE_URL}/widget-form?company=${companyId}"
  style="width:100%;min-height:700px;border:none;overflow:hidden;"
  title="MTL Dispatch Booking Widget"
  loading="lazy"
  allowfullscreen
></iframe>

<script>
  // auto-adjust height dynamically from widget
  window.addEventListener("message", function(event) {
    if (event.data && event.data.type === "resizeWidget") {
      const iframe = document.getElementById("mtlWidget");
      if (iframe) iframe.style.height = event.data.height + "px";
    }
  });
</script>`;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const previewUrl = `${BASE_URL}widget-form?company=${companyId}`;

  return (
    <div>
      <div className="mb-4 sm:mb-5 md:mb-6">
        <OutletHeading name="Widget / API Integration" />
      </div>

      {companyId && (
        <div className="bg-(--lighter-blue) border border-(--lighter-blue) rounded-lg p-3 sm:p-4 mb-4 sm:mb-5 md:mb-6">
          <p className="text-xs sm:text-sm text-(--main-color)">
            <strong>Company ID:</strong> {companyId}
          </p>
        </div>
      )}

      <div className="bg-(--white) border border-(--light-gray) rounded-lg shadow p-4 sm:p-5 mb-4 sm:mb-5 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
          <label className="block text-xs sm:text-sm font-semibold text-(--dark-grey)">
            Embed your booking form on any website using the iframe code below.
          </label>
          <button
            onClick={() => copyToClipboard(iframeCode)}
            className="btn btn-edit px-6 sm:px-8 text-xs sm:text-sm"
          >
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>
        <pre className="bg-(--lighter-gray) p-3 sm:p-4 rounded-md text-xs sm:text-sm overflow-auto text-(--dark-gray) relative">
          <code>{iframeCode}</code>
        </pre>
      </div>

      <div className="bg-(--light-yellow) border border-(--medium-yellow) rounded-lg p-4 sm:p-5">
        <h3 className="font-semibold text-(--dark-yellow) mb-2 sm:mb-3 text-sm sm:text-base">
          Installation Instructions
        </h3>
        <ol className="list-decimal list-inside space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-(--dark-yellow)">
          <li>Copy the complete widget code above</li>
          <li>Paste it anywhere in the &lt;body&gt; section of your website</li>
          <li>
            The widget will automatically adjust its height based on content
          </li>
          <li>
            For best results, place the widget in a container with fixed width
          </li>
        </ol>
      </div>
    </div>
  );
};

export default WidgetAPI;