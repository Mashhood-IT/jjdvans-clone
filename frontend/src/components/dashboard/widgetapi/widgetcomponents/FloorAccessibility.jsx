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
}) => {
  return (
    <div className="bg-(--white) rounded-lg shadow-sm p-6 mb-6">
      <h2 className="widget-section-title text-gray-900 mb-6">
        Floor & Accessibility
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-r pr-6 border-(--light-gray)">
          <div className="flex items-center gap-2 mb-4">
            <Icons.MapPin className="w-4 h-4 text-(--medium-grey)" />
            <span className="widget-label-small text-gray-700">
              Pickup Location
            </span>
          </div>

          {primaryPickupAddress && (
            <p className="widget-description text-gray-500 mb-4 wrap-break-word">
              {primaryPickupAddress}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4 md:mb-0">
              <label className="block widget-label-text text-(--medium-grey) mb-2">
                Floor Level
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPickupFloor(Math.max(0, pickupFloor - 1))}
                  className="w-10 h-10 cursor-pointer flex items-center justify-center border border-gray-300 rounded-lg hover:bg-(--lighter-gray) transition-colors"
                >
                  <Icons.Minus className="w-4 h-4 text-(--medium-grey)" />
                </button>
                <div className="flex-1 text-center">
                  <span className="widget-price-large text-gray-900">
                    {pickupFloor}
                  </span>
                </div>
                <button
                  onClick={() => setPickupFloor(pickupFloor + 1)}
                  className="w-10 h-10 cursor-pointer flex items-center justify-center border border-gray-300 rounded-lg hover:bg-(--lighter-gray) transition-colors"
                >
                  <Icons.Plus className="w-4 h-4 text-(--medium-grey)" />
                </button>
              </div>
            </div>

            <div>
              <label className="block widget-label-text text-(--medium-grey) mb-2">
                Access Type
              </label>
              <div className="flex md:mt-0 mt-3 gap-2">
                <button
                  onClick={() => setPickupAccess("LIFT")}
                  className={`flex-1 cursor-pointer px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    pickupAccess === "LIFT"
                      ? "bg-gray-900 text-(--white)"
                      : "bg-gray-100 text-(--medium-grey) hover:bg-gray-200"
                  }`}
                >
                  LIFT
                </button>
                <button
                  onClick={() => setPickupAccess("STAIRS")}
                  className={`flex-1 cursor-pointer px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    pickupAccess === "STAIRS"
                      ? "bg-gray-900 text-(--white)"
                      : "bg-gray-100 text-(--medium-grey) hover:bg-gray-200"
                  }`}
                >
                  STAIRS
                </button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Icons.MapPin className="w-4 h-4 text-(--medium-grey)" />
            <span className="widget-label-small text-gray-700">
              Drop-off Location
            </span>
          </div>

          {primaryDropoffAddress && (
            <p className="widget-description text-gray-500 mb-4 wrap-break-word">
              {primaryDropoffAddress}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4 md:mb-0">
              <label className="block text-sm text-(--medium-grey) mb-2">
                Floor Level
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setDropoffFloor(Math.max(0, dropoffFloor - 1))}
                  className="w-10 cursor-pointer h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-(--lighter-gray) transition-colors"
                >
                  <Icons.Minus className="w-4 h-4 text-(--medium-grey)" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {dropoffFloor}
                  </span>
                </div>
                <button
                  onClick={() => setDropoffFloor(dropoffFloor + 1)}
                  className="w-10 cursor-pointer h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-(--lighter-gray) transition-colors"
                >
                  <Icons.Plus className="w-4 h-4 text-(--medium-grey)" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-(--medium-grey) mb-2">
                Access Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setDropoffAccess("LIFT")}
                  className={`flex-1 cursor-pointer px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    dropoffAccess === "LIFT"
                      ? "bg-gray-900 text-(--white)"
                      : "bg-gray-100 text-(--medium-grey) hover:bg-gray-200"
                  }`}
                >
                  LIFT
                </button>
                <button
                  onClick={() => setDropoffAccess("STAIRS")}
                  className={`flex-1 cursor-pointer px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                    dropoffAccess === "STAIRS"
                      ? "bg-gray-900 text-(--white)"
                      : "bg-gray-100 text-(--medium-grey) hover:bg-gray-200"
                  }`}
                >
                  STAIRS
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {additionalDropoffs.map((ad) => (
          <div
            key={ad.id}
            className={`mt-8 pt-8 border-t border-gray-100 ${
              ad.id % 2 === 1 ? "md:border-r md:pr-6 border-(--light-gray)" : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <Icons.MapPin className="w-4 h-4 text-(--medium-grey)" />
              <span className="widget-label-small text-gray-700">
                Additional Drop-off {ad.id}
              </span>
            </div>

            <p className="widget-description text-gray-500 mb-4 wrap-break-word">
              {ad.address}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block widget-label-text text-(--medium-grey) mb-2">
                  Floor Level
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setFloorAccess((prev) => ({
                        ...prev,
                        [`additionalDropoff${ad.id}Floor`]: Math.max(
                          0,
                          prev[`additionalDropoff${ad.id}Floor`] - 1,
                        ),
                      }))
                    }
                    className="w-10 h-10 cursor-pointer flex items-center justify-center border border-gray-300 rounded-lg hover:bg-(--lighter-gray) transition-colors"
                  >
                    <Icons.Minus className="w-4 h-4 text-(--medium-grey)" />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="widget-price-large text-gray-900">
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
                    className="w-10 h-10 cursor-pointer flex items-center justify-center border border-gray-300 rounded-lg hover:bg-(--lighter-gray) transition-colors"
                  >
                    <Icons.Plus className="w-4 h-4 text-(--medium-grey)" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block widget-label-text text-(--medium-grey) mb-2">
                  Access Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setFloorAccess((prev) => ({
                        ...prev,
                        [`additionalDropoff${ad.id}Access`]: "LIFT",
                      }))
                    }
                    className={`flex-1 cursor-pointer px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      floorAccess[`additionalDropoff${ad.id}Access`] === "LIFT"
                        ? "bg-gray-900 text-(--white)"
                        : "bg-gray-100 text-(--medium-grey) hover:bg-gray-200"
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
                    className={`flex-1 cursor-pointer px-4 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                      floorAccess[`additionalDropoff${ad.id}Access`] ===
                      "STAIRS"
                        ? "bg-gray-900 text-(--white)"
                        : "bg-gray-100 text-(--medium-grey) hover:bg-gray-200"
                    }`}
                  >
                    STAIRS
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloorAccessibility;