import React from "react";
import Icons from "../../../../assets/icons";
import { useNavigate } from "react-router-dom";
import { formatMinutesToHM, parseDurationToMinutes } from "../../../../utils/durationHelper";

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

  const totalMinutes = parseDurationToMinutes(durationText);
  const { hours, minutes } = formatMinutesToHM(totalMinutes);

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
              <p className="widget-value-text-sm text-(--white)">
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
                <p className="widget-value-text-sm text-(--white)">
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
              <div className="grid 2xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4">
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
            </div>
          )}
        </div>

        <div className="bg-(--dark-gray) p-5 shadow-lg sm:p-6 lg:min-w-95">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="widget-label-small mb-2 text-(--light-gray)">
                  TOTAL DISTANCE
                </p>
                <div className="flex items-center gap-2">
                  <Icons.MapPin className="h-4 w-4 shrink-0 text-(--main-color)" />
                  <p className="text-sm text-(--white)">
                    {primaryDistanceMiles.replace(" mi", "")}
                    <span className="ml-1 text-(--light-gray)">miles</span>
                  </p>
                </div>
              </div>

              <div>
                <p className="widget-label-small mb-2 text-(--light-gray)">
                  Booked Time
                </p>
                <div className="flex items-center gap-2">
                  <Icons.Clock className="h-4 w-4 shrink-0 text-(--main-color)" />
                  <p className="text-sm text-(--white)">
                    {`${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`}
                  </p>
                  <span className="text-sm font-semibold text-(--light-gray)">
                    hours
                  </span>
                </div>
                <p className="text-[11px] text-(--light-gray) mt-1">
                  (You can add more time in next step)
                </p>
              </div>
            </div>
            <div className="flex flex-col">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="btn btn-blue"
                >
                  Edit Full Route
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-4 px-6 py-2 border-t border-(--light-gray)">
        <div className="flex items-center gap-2">
          <Icons.Calendar className="md:size-4 size-3 shrink-0 text-(--main-color)" />
          <span className="md:text-sm text-xs text-(--light-gray)">
            {formatDate(formData?.date)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Icons.Clock className="md:size-4 size-3 shrink-0 text-(--main-color)" />
          <span className="md:text-sm text-xs text-(--light-gray)">
            {formData?.hour !== undefined && formData?.minute !== undefined
              ? `${String(formData.hour).padStart(2, "0")}:${String(
                formData.minute
              ).padStart(2, "0")} ${formData.hour < 12 ? "AM" : "PM"}`
              : "Time not set"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default JourneySummaryCard;