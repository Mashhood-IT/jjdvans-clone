import React from "react";
import Icons from "../../../../assets/icons";
import { useNavigate } from "react-router-dom";

const JourneySummaryCard = ({
  formData,
  durationText,
  distanceText,
}) => {
  const navigate = useNavigate()
  const dropList = [
    formData?.dropoff,
    formData?.additionalDropoff1,
    formData?.additionalDropoff2,
    formData?.additionalDropoff3,
    formData?.additionalDropoff4,
  ];

  const convertToMiles = (distanceText) => {
    if (!distanceText) return "0 mi";
    const match = distanceText.match(/([\d.]+)\s*(km|mi|miles)/i);
    if (!match) return distanceText;
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    return unit === "km"
      ? `${(value * 0.621371).toFixed(2)} mi`
      : `${value.toFixed(2)} mi`;
  };

  const getTotalDuration = (text) => {
    if (!text) return { hours: 0, minutes: 0 };
    const segments = text.split("+").map((t) => t.trim());
    let totalMinutes = 0;

    segments.forEach((seg) => {
      const hrMatch = seg.match(/(\d+)\s*hour/i);
      const minMatch = seg.match(/(\d+)\s*min/i);
      if (hrMatch) totalMinutes += parseInt(hrMatch[1]) * 60;
      if (minMatch) totalMinutes += parseInt(minMatch[1]);
    });

    return {
      hours: Math.floor(totalMinutes / 60),
      minutes: totalMinutes % 60
    };
  };

  const { hours, minutes } = getTotalDuration(durationText);

  const primaryDistanceMiles = convertToMiles(distanceText);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Date not selected";
    try {
      // Expecting YYYY-MM-DD
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-GB", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch (err) {
      return dateStr;
    }
  };

  return (
    <div className="bg-(--mate-color) rounded-2xl shadow-lg overflow-hidden w-full">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-6 space-y-5">
          <div>
            <p className="widget-label-small text-(--medium-grey) mb-2">
              PICKUP LOCATION
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 bg-(--light-green) rounded-full shrink-0">
                <Icons.MapPin className="size-3.5 text-(--success-color)" />
              </div>
              <p className="widget-value-text-xs text-(--white)">
                {formData?.pickup || "Pickup Location"}
              </p>
            </div>
          </div>

          {dropList.filter(Boolean).length > 0 && (
            <div>
              <p className="widget-label-small text-(--medium-grey) mb-2">
                DROP-OFF 1 (PRIMARY)
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 bg-(--light-red) rounded-full shrink-0">
                  <Icons.MapPin className="size-3.5 text-(--primary-dark-red)" />
                </div>
                <p className="widget-value-text-xs text-(--white)">
                  {dropList.filter(Boolean)[0]}
                </p>
              </div>
            </div>
          )}

          {dropList.filter(Boolean).length > 1 && (
            <div className="space-y-4">
              <p className="widget-label-small text-(--medium-grey) mb-2">
                ADDITIONAL DROP-OFFS (2ND - 5TH)
              </p>
              {dropList.filter(Boolean).slice(1).map((dropoff, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-7 h-7 bg-(--light-red) rounded-full shrink-0">
                    <Icons.MapPin className="size-3.5 text-(--primary-dark-red)" />
                  </div>
                  <p className="widget-value-text-sm text-(--white)">
                    {dropoff}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-start justify-between lg:min-w-95 bg-(--dark-gray) p-6">
          <div className="space-y-5 flex items-start justify-between text-start w-full">
            <div className="flex-1">
              <p className="widget-label-small text-(--white) mb-2">
                TOTAL DISTANCE
              </p>
              <div className="flex items-center justify-start gap-2">
                <Icons.MapPin className="size-3.5 text-(--white)" />
                <p className="widget-value-sm text-(--white)">
                  {primaryDistanceMiles.replace(" mi", "")}
                  <span className="widget-value-sm ml-1">Miles</span>
                </p>
              </div>
            </div>

            <div className="flex-1">
              <p className="widget-label-small text-(--white) mb-2">
                ESTIMATED TIME
              </p>
              <div className="flex items-center justify-start gap-2">
                <Icons.Clock className="size-3.5 text-(--white)" />
                <p className="widget-value-sm text-(--white)">
                  {`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`}
                </p>
                <span className="text-(--white) widget-value-sm font-semibold">Hours</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate(-1)} className="btn btn-primary mt-3">EDIT FULL ROUTE</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 px-6 py-4 border-t border-(--dark-grey)">
        <div className="flex items-center gap-2">
          <Icons.Calendar className="w-5 h-5 text-(--main-color)" />
          <span className="widget-value-text-sm text-(--light-gray)">
            {formatDate(formData?.date)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Icons.Clock className="w-5 h-5 text-(--white)" />
          <span className="widget-value-text-sm text-(--light-gray)">
            {formData?.hour && formData?.minute
              ? `${String(formData.hour).padStart(2, "0")}:${String(
                formData.minute,
              ).padStart(2, "0")} ${formData.hour < 12 ? "AM" : "PM"}`
              : "Time not set"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JourneySummaryCard;