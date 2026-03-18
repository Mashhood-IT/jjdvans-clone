import React from "react";
import Icons from "../../../../assets/icons";

const FloorAccessibility = ({
  pickupFloor,
  setPickupFloor,
  pickupAccess,
  setPickupAccess,
  dropoffFloor,
  setDropoffFloor,
  dropoffAccess,
  setDropoffAccess,
  primaryPickupAddress,
  primaryDropoffAddress,
  additionalDropoffs,
  floorAccess,
  setFloorAccess,
  pricePerFloor = 0,
  priceForStairs = 0,
  priceForLift = 0,
  currencySymbol = "£",
}) => {
  const getSubtotal = (floor, access) => {
    let floorPrice = 0;
    if (access !== "LIFT") {
      floorPrice = (floor || 0) * pricePerFloor;
    }

    let accessPrice = 0;
    if (floor > 0) {
      if (access === "STAIRS") accessPrice = priceForStairs;
      else if (access === "LIFT") accessPrice = priceForLift;
    }
    return floorPrice + accessPrice;
  };
  return (
    <div className="bg-(--lightest-gray) rounded-lg shadow-sm p-6 mb-6">
      <h1 className="text-xl font-bold mb-6 text-(--dark-gray)">
        Floor & Accessibility
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:border-r md:pr-6 md:border-(--light-gray)">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icons.MapPin className="w-4 h-4 text-(--medium-grey)" />
              <span className="widget-label-small text-gray-700">
                Pickup Location
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-900 text-(--white) rounded-full">
              {currencySymbol}{Math.round(getSubtotal(pickupFloor, pickupAccess)).toFixed(2)}
            </span>
          </div>

          {primaryPickupAddress && (
            <p className="widget-description text-gray-500 mb-4 wrap-break-word">
              {primaryPickupAddress}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`mb-4 md:mb-0 ${pickupFloor > 0 && 'pr-5 border-r border-(--light-gray)'}`}>
              <label className="block widget-label-text text-(--medium-grey) mb-2">
                Floor Level
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const next = Math.max(0, pickupFloor - 1);
                    setPickupFloor(next);
                    if (next === 0) setPickupAccess(null);
                  }}
                  className="btn btn-mate"
                >
                  <Icons.Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-(--dark-grey)">
                    {pickupFloor}
                  </span>
                </div>
                <button
                  onClick={() => setPickupFloor(pickupFloor + 1)}
                  className="btn btn-mate"
                >
                  <Icons.Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {pickupFloor > 0 && (
              <div>
                <label className="block widget-label-text text-(--medium-grey) mb-2">
                  Access Type
                </label>
                <div className="flex items-center justify-between md:mt-0 mt-3 gap-2">
                  <button
                    onClick={() => setPickupAccess("LIFT")}
                    className={`btn ${pickupAccess === "LIFT"
                      ? "btn-mate"
                      : "btn-back"
                      }`}
                  >
                    LIFT
                  </button>
                  <button
                    onClick={() => setPickupAccess("STAIRS")}
                    className={`btn ${pickupAccess === "STAIRS"
                      ? "btn-mate"
                      : "btn-back"
                      }`}
                  >
                    STAIRS
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Icons.MapPin className="w-4 h-4 text-(--medium-grey)" />
              <span className="widget-label-small text-gray-700">
                Drop-off Location
              </span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-gray-900 text-(--white) rounded-full">
              {currencySymbol}{Math.round(getSubtotal(dropoffFloor, dropoffAccess)).toFixed(2)}
            </span>
          </div>

          {primaryDropoffAddress && (
            <p className="widget-description text-gray-500 mb-4 wrap-break-word">
              {primaryDropoffAddress}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`mb-4 md:mb-0 ${dropoffFloor > 0 && 'pr-5 border-r border-(--light-gray)'}`}>
              <label className="block widget-label-text text-(--medium-grey) mb-2">
                Floor Level
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const next = Math.max(0, dropoffFloor - 1);
                    setDropoffFloor(next);
                    if (next === 0) setDropoffAccess(null);
                  }}
                  className="btn btn-mate"
                >
                  <Icons.Minus className="w-4 h-4" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-xl text-(--dark-grey)">
                    {dropoffFloor}
                  </span>
                </div>
                <button
                  onClick={() => setDropoffFloor(dropoffFloor + 1)}
                  className="btn btn-mate"
                >
                  <Icons.Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {dropoffFloor > 0 && (
              <div>
                <label className="block widget-label-text text-(--medium-grey) mb-2">
                  Access Type
                </label>
                <div className="flex items-center justify-between gap-2">
                  <button
                    onClick={() => setDropoffAccess("LIFT")}
                    className={`btn ${dropoffAccess === "LIFT"
                      ? "btn-mate"
                      : "btn-back"
                      }`}
                  >
                    LIFT
                  </button>
                  <button
                    onClick={() => setDropoffAccess("STAIRS")}
                    className={`btn ${dropoffAccess === "STAIRS"
                      ? "btn-mate"
                      : "btn-back"
                      }`}
                  >
                    STAIRS
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {additionalDropoffs.map((ad) => (
          <div
            key={ad.id}
            className={`mt-8 pt-8 border-t border-gray-100 ${ad.id % 2 === 1 ? "md:border-r md:pr-6 border-(--light-gray)" : ""
              }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icons.MapPin className="w-4 h-4 text-(--medium-grey)" />
                <span className="widget-label-small text-gray-700">
                  Additional Drop-off {ad.id}
                </span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-900 text-(--white) rounded-full">
                {currencySymbol}{Math.round(getSubtotal(
                  floorAccess[`additionalDropoff${ad.id}Floor`],
                  floorAccess[`additionalDropoff${ad.id}Access`]
                )).toFixed(2)}
              </span>
            </div>

            <p className="widget-description text-gray-500 mb-4 wrap-break-word">
              {ad.address}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={` ${(floorAccess[`additionalDropoff${ad.id}Floor`] || 0) && 'pr-5 border-r border-(--light-gray)'}`}>
                <label className="block widget-label-text text-(--medium-grey) mb-2">
                  Floor Level
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setFloorAccess((prev) => {
                        const nextFloor = Math.max(0, (prev[`additionalDropoff${ad.id}Floor`] || 0) - 1);
                        return {
                          ...prev,
                          [`additionalDropoff${ad.id}Floor`]: nextFloor,
                          ...(nextFloor === 0 ? { [`additionalDropoff${ad.id}Access`]: null } : {})
                        };
                      })
                    }
                    className="btn btn-mate"
                  >
                    <Icons.Minus className="w-4 h-4" />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="widget-price-large text-(--dark-grey)">
                      {floorAccess[`additionalDropoff${ad.id}Floor`]}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setFloorAccess((prev) => ({
                        ...prev,
                        [`additionalDropoff${ad.id}Floor`]:
                          (prev[`additionalDropoff${ad.id}Floor`] || 0) + 1,
                      }))
                    }
                    className="btn btn-mate"
                  >
                    <Icons.Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {(floorAccess[`additionalDropoff${ad.id}Floor`] || 0) > 0 && (
                <div>
                  <label className="block widget-label-text text-(--medium-grey) mb-2">
                    Access Type
                  </label>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() =>
                        setFloorAccess((prev) => ({
                          ...prev,
                          [`additionalDropoff${ad.id}Access`]: "LIFT",
                        }))
                      }
                      className={`btn ${floorAccess[`additionalDropoff${ad.id}Access`] === "LIFT"
                        ? "btn-mate"
                        : "btn-back"
                        }`}
                    >
                      LIFT
                    </button>
                    <button
                      onClick={() =>
                        setFloorAccess((prev) => ({
                          ...prev,
                          [`additionalDropoff${ad.id}Access`]: "STAIRS",
                        }))
                      }
                      className={`btn ${floorAccess[`additionalDropoff${ad.id}Access`] ===
                        "STAIRS"
                        ? "btn-mate"
                        : "btn-back"
                        }`}
                    >
                      STAIRS
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorAccessibility;