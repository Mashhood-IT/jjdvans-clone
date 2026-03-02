import React from "react";
import Icons from "../../../../assets/icons";

const JourneySummaryCard = ({
  formData,
  durationText,
  distanceText,
  currencyCode = "GBP",
}) => {
  const dropList = [
    formData?.dropoff,
    formData?.additionalDropoff1,
    formData?.additionalDropoff2,
    formData?.additionalDropoff3,
    formData?.additionalDropoff4,
  ];

  const convertToMiles = (distanceText) => {
    if (!distanceText) return "0 mi";
    const match = distanceText.match(/([\d.]+)\s*(km|mi)/i);
    if (!match) return distanceText;
    const value = parseFloat(match[1]);
    const unit = match[2].toLowerCase();
    return unit === "km"
      ? `${(value * 0.621371).toFixed(1)} mi`
      : `${value.toFixed(1)} mi`;
  };

  const getTotalDuration = (text) => {
    if (!text) return "N/A";
    const segments = text.split("+").map((t) => t.trim());
    let totalMinutes = 0;

    segments.forEach((seg) => {
      const hrMatch = seg.match(/(\d+)\s*hour/);
      const minMatch = seg.match(/(\d+)\s*min/);
      if (hrMatch) totalMinutes += parseInt(hrMatch[1]) * 60;
      if (minMatch) totalMinutes += parseInt(minMatch[1]);
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours && minutes) return `${hours}h ${minutes}m`;
    if (hours) return `${hours}h`;
    return `${minutes}m`;
  };

  const totalPrimaryDuration = getTotalDuration(durationText);

  const primaryDistanceMiles = convertToMiles(distanceText);

  return (
    <div className="bg-(--mate-color) rounded-2xl shadow-lg overflow-hidden w-full">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-6 space-y-5">
          <div>
            <p className="text-(--medium-grey) text-xs uppercase tracking-wider mb-2 font-semibold">
              PICKUP LOCATION
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-7 h-7 bg-(--light-green) rounded-full shrink-0">
                <Icons.MapPin className="w-4 h-4 text-(--success-color)" />
              </div>
              <p className="text-(--white) font-semibold text-base">
                {formData?.pickup || "Pickup Location"}
              </p>
            </div>
          </div>

          {/* Primary Drop-off */}
          {dropList.filter(Boolean).length > 0 && (
            <div>
              <p className="text-(--medium-grey) text-xs uppercase tracking-wider mb-2 font-semibold">
                DROP-OFF 1 (PRIMARY)
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 bg-(--light-red) rounded-full shrink-0">
                  <Icons.MapPin className="w-4 h-4 text-(--primary-dark-red)" />
                </div>
                <p className="text-(--white) font-semibold text-base">
                  {dropList.filter(Boolean)[0]}
                </p>
              </div>
            </div>
          )}

          {/* Additional Drop-offs */}
          {dropList.filter(Boolean).length > 1 && (
            <div className="space-y-4">
              <p className="text-(--medium-grey) text-xs uppercase tracking-wider mb-2 font-semibold flex items-center gap-1">
                ADDITIONAL DROP-OFFS (2ND - 5TH)
                <Icons.ChevronDown className="w-4 h-4" />
              </p>
              {dropList.filter(Boolean).slice(1).map((dropoff, idx) => (
                <div key={idx} className="flex items-center gap-3 pl-4">
                  <div className="flex items-center justify-center w-6 h-6 bg-(--light-red) rounded-full shrink-0">
                    <Icons.MapPin className="w-3 h-3 text-(--primary-dark-red)" />
                  </div>
                  <p className="text-(--white) font-medium text-sm">
                    {dropoff}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col items-start justify-between lg:min-w-95 bg-(--dark-gray) p-6">
          <div className="space-y-5 text-start w-full">
            <div>
              <p className="text-(--white) text-xs uppercase tracking-widest mb-2">
                TOTAL DISTANCE
              </p>
              <div className="flex items-center justify-start gap-2">
                <Icons.MapPin className="w-6 h-6 text-(--primary-dark-red)" />
                <p className="text-(--white) font-semibold text-4xl">
                  {primaryDistanceMiles.replace(" mi", "")}
                  <span className="text-base font-semibold ml-1">miles</span>
                </p>
              </div>
            </div>

            <div>
              <p className="text-(--white) text-xs uppercase tracking-widest mb-2">
                ESTIMATED TIME
              </p>
              <div className="flex items-center justify-start gap-2">
                <Icons.Clock className="w-6 h-6 text-(--white)" />
                <p className="text-(--white) font-semibold text-4xl">
                  {totalPrimaryDuration}
                </p>
              </div>
            </div>
          </div>

          <button className="btn btn-primary mt-3">EDIT FULL ROUTE</button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 px-6 py-4 border-t border-(--dark-grey)">
        <div className="flex items-center gap-2">
          <Icons.Calendar className="w-5 h-5 text-(--main-color)" />
          <span className="text-(--light-gray) text-sm font-medium">
            {formData?.date
              ? new Date(formData.date).toLocaleDateString("en-UK", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })
              : "Date not selected"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Icons.Clock className="w-5 h-5 text-(--white)" />
          <span className="text-(--light-gray) text-sm font-medium">
            {formData?.hour && formData?.minute
              ? `${String(formData.hour).padStart(2, "0")}:${String(
                formData.minute,
              ).padStart(2, "0")} ${formData.hour < 12 ? "AM" : "PM"}`
              : "Time not set"}
            <span className="text-(--medium-grey) ml-1">({currencyCode})</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default JourneySummaryCard;