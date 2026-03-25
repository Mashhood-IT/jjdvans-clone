import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

import { useLoading } from "../../common/LoadingProvider";
import OutletHeading from "../../constants/constantcomponents/OutletHeading";
import CustomTable from "../../constants/constantcomponents/CustomTable";

import {
  useGetAllVehiclesQuery,
  useUpdateVehicleMutation,
} from "../../../redux/api/vehicleApi";
import { useGetBookingSettingQuery, useUpdateBookingSettingMutation } from "../../../redux/api/bookingSettingsApi";
import Icons from "../../../assets/icons";

const DistanceSlab = () => {
  const companyId = useSelector((state) => state.auth?.user?.companyId);
  const { showLoading, hideLoading } = useLoading();

  const [data, setData] = useState([]);
  const [updateVehicle] = useUpdateVehicleMutation();

  const { data: vehicleList = [], isLoading } = useGetAllVehiclesQuery(
    companyId,
    {
      skip: !companyId,
    },
  );
  const { data: settingsData } = useGetBookingSettingQuery();
  const [updateBookingSetting] = useUpdateBookingSettingMutation();
  const currencySymbol = settingsData?.setting?.currency?.[0]?.symbol || "£";

  const [floorPricing, setFloorPricing] = useState({
    pricePerFloor: 0,
    priceForStairs: 0,
    priceForLift: 0,
  });

  useEffect(() => {
    if (settingsData?.setting) {
      setFloorPricing({
        pricePerFloor: settingsData.setting.pricePerFloor || 0,
        priceForStairs: settingsData.setting.priceForStairs || 0,
        priceForLift: settingsData.setting.priceForLift || 0,
      });
    }
  }, [settingsData]);

  const handleFloorPricingChange = (e) => {
    const { name, value } = e.target;
    setFloorPricing((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [isLoading, hideLoading, showLoading]);

  useEffect(() => {
    if (vehicleList.length) {
      const allSlabs = [];

      vehicleList.forEach((v) => {
        v.slabs.forEach((slab) => {
          const existing = allSlabs.find(
            (s) => s.from === slab.from && s.to === slab.to,
          );

          const distance = slab.to - slab.from;
          const pricePerMile = distance
            ? slab.price / distance / (1 + (v.percentageIncrease || 0) / 100)
            : 0;

          if (existing) {
            existing[v.vehicleName] = slab.price;
            existing[`${v.vehicleName}_pricePerMile`] = parseFloat(
              pricePerMile.toFixed(2),
            );
          } else {
            allSlabs.push({
              from: slab.from,
              to: slab.to,
              pricePerMile: parseFloat(pricePerMile.toFixed(2)),
              [v.vehicleName]: slab.price,
              [`${v.vehicleName}_pricePerMile`]: parseFloat(
                pricePerMile.toFixed(2),
              ),
            });
          }
        });
      });

      setData(allSlabs);
    }
  }, [vehicleList]);

  const handleAddSlab = () => {
    const newSlab = {
      from: 0,
      to: 0,
      pricePerMile: 0,
    };
    vehicleList.forEach((v) => {
      newSlab[v.vehicleName] = 0;
      newSlab[`${v.vehicleName}_pricePerMile`] = 0;
    });
    setData([...data, newSlab]);
  };

  const updateRow = (index, key, value) => {
    const updated = [...data];
    updated[index][key] = value;

    const from =
      key === "from" ? parseFloat(value) : parseFloat(updated[index].from || 0);
    const to =
      key === "to" ? parseFloat(value) : parseFloat(updated[index].to || 0);
    const pricePerMile =
      key === "pricePerMile"
        ? parseFloat(value)
        : parseFloat(updated[index].pricePerMile || 0);
    const distance = to - from;

    if (distance > 0 && pricePerMile >= 0) {
      vehicleList.forEach((v) => {
        const percent = v.percentageIncrease || 0;
        const perMile = pricePerMile * (1 + percent / 100);
        const total = perMile * distance;

        updated[index][v.vehicleName] = parseFloat(total.toFixed(2));
        updated[index][`${v.vehicleName}_pricePerMile`] = parseFloat(
          perMile.toFixed(2),
        );
      });
    }

    if (key === "to" && index < updated.length - 1) {
      updated[index + 1].from = parseFloat(value);
    }

    setData(updated);
  };

  const handleDelete = (index) => {
    const updated = [...data];
    updated.splice(index, 1);
    setData(updated);
    toast.success("Slab Deleted!");
  };

  const handleSaveAll = async () => {
    try {
      showLoading();
      await Promise.all(
        vehicleList.map(async (v) => {
          const vehicleSlabs = data.map((slab) => {
            const distance = slab.to - slab.from;
            const perMile = slab[`${v.vehicleName}_pricePerMile`] || 0;
            const totalPrice = distance > 0 ? perMile * distance : 0;

            return {
              from: Number(slab.from),
              to: Number(slab.to),
              price: parseFloat(totalPrice.toFixed(2)),
            };
          });

          const formData = new FormData();
          formData.append("slabs", JSON.stringify(vehicleSlabs));
          formData.append("vehicleName", v.vehicleName);
          formData.append("description", v.description || "");
          formData.append("priority", v.priority || 0);
          formData.append("percentageIncrease", v.percentageIncrease || 0);
          formData.append("priceType", v.priceType || "Percentage");
          formData.append("image", v.image || "");
          if (v.extraHelp) {
            formData.append("extraHelp", JSON.stringify(v.extraHelp));
          }

          await updateVehicle({
            id: v._id,
            formData,
          });
        }),
      );

      // Update Floor Pricing
      await updateBookingSetting(floorPricing).unwrap();

      toast.success("All Slabs & Floor Pricing Updated Successfully!");
    } catch (err) {
      console.error("Error updating slabs:", err);
      toast.error("Error updating slabs");
    } finally {
      hideLoading();
    }
  };

  const tableHeaders = [
    { label: "Distance (miles)", key: "distance" },
    {
      label: `Price Per Mile (${currencySymbol}/${"mile"})`,
      key: "pricePerMile",
    },
    ...vehicleList.map((v) => ({
      label: `${v.vehicleName.charAt(0).toUpperCase() + v.vehicleName.slice(1)} (${v.percentageIncrease}%)`,
      key: `${v.vehicleName}_total`,
    })),
    { label: "Action", key: "actions" },
  ];

  const tableData = data.map((item, idx) => {
    const slabDistance = (item.to || 0) - (item.from || 0);
    const row = {
      distance: (
        <div className="flex items-center gap-2 sm:gap-3">
          <label className="font-bold text-xs sm:text-sm whitespace-nowrap">From:</label>
          <div className="w-16 sm:w-20">
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              className="custom_input text-xs sm:text-sm"
              value={item.from}
              onChange={(e) =>
                updateRow(idx, "from", parseFloat(e.target.value))
              }
            />
          </div>
          <span className="text-(--medium-grey) font-bold px-0.5 sm:px-1 text-xs sm:text-sm">-</span>
          <label className="font-bold text-xs sm:text-sm whitespace-nowrap">To:</label>
          <div className="w-16 sm:w-20">
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              className="custom_input text-xs sm:text-sm"
              value={item.to}
              onChange={(e) => updateRow(idx, "to", parseFloat(e.target.value))}
            />
          </div>
        </div>
      ),
      pricePerMile: (
        <div className="w-20 sm:w-24">
          <input
            type="number"
            onWheel={(e) => e.target.blur()}
            className="custom_input text-xs sm:text-sm"
            value={item.pricePerMile}
            onChange={(e) =>
              updateRow(idx, "pricePerMile", parseFloat(e.target.value))
            }
          />
        </div>
      ),
      actions: (
        <div
          onClick={() => handleDelete(idx)}
          className="icon-box icon-box-danger"
        >
          <Icons.Trash title="Delete" className="size-4" />
        </div>
      ),
    };

    vehicleList.forEach((v) => {
      const percent = v.percentageIncrease || 0;
      const perMile = item.pricePerMile * (1 + percent / 100);
      const total = perMile * slabDistance;

      item[v.vehicleName] = parseFloat(total.toFixed(2));
      item[`${v.vehicleName}_pricePerMile`] = parseFloat(perMile.toFixed(2));

      row[`${v.vehicleName}_total`] = (
        <div className="text-xs sm:text-sm">
          <div className="text-(--main-color) font-semibold">
            {currencySymbol} {perMile.toFixed(2)}
          </div>
          <div className="text-(--medium-color) flex items-center gap-0.5 text-xs">
            <span>
              <Icons.X size={10} />
            </span>
            {slabDistance} miles
          </div>
        </div>
      );
    });

    return row;
  });

  const exportTableData = data.map((item, idx) => {
    const slabDistance = (item.to || 0) - (item.from || 0);

    const exportRow = {
      distance: `${item.from} - ${item.to} miles (${slabDistance} miles)`,
      pricePerMile: `${currencySymbol} ${item.pricePerMile}`,
    };
    vehicleList.forEach((v) => {
      const percent = v.percentageIncrease || 0;
      const perMile = item.pricePerMile * (1 + percent / 100);
      const total = perMile * slabDistance;

      exportRow[`${v.vehicleName}_total`] =
        `${currencySymbol} ${total.toFixed(2)}`;
    });

    return exportRow;
  });
  return (
    <>
      <OutletHeading name="Mileage Slab" />

      <div className="bg-(--white) border border-(--light-gray) rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
        <h3 className="text-lg font-bold text-(--dark-grey) mb-4">Floor & Access Type Pricing</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs sm:text-sm text-(--medium-grey) mb-1.5">Price Per Floor ({currencySymbol})</label>
            <input
              type="number"
              name="pricePerFloor"
              className="custom_input text-xs sm:text-sm"
              value={floorPricing.pricePerFloor}
              onChange={handleFloorPricingChange}
              onWheel={(e) => e.target.blur()}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-(--medium-grey) mb-1.5">Price For Stairs ({currencySymbol})</label>
            <input
              type="number"
              name="priceForStairs"
              className="custom_input text-xs sm:text-sm"
              value={floorPricing.priceForStairs}
              onChange={handleFloorPricingChange}
              onWheel={(e) => e.target.blur()}
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm text-(--medium-grey) mb-1.5">Price For Lift ({currencySymbol})</label>
            <input
              type="number"
              name="priceForLift"
              className="custom_input text-xs sm:text-sm"
              value={floorPricing.priceForLift}
              onChange={handleFloorPricingChange}
              onWheel={(e) => e.target.blur()}
            />
          </div>
        </div>
      </div>

      <div className="mb-4 sm:mb-5 md:mb-6">
        <button className="btn btn-blue" onClick={handleAddSlab}>
          Add Distance Slab
        </button>
      </div>
      <CustomTable
        filename="Distance-Slab-list"
        tableHeaders={tableHeaders}
        tableData={tableData}
        showPagination={true}
        showSorting={true}
        exportTableData={exportTableData}
      />
      <div className="mt-4 sm:mt-5 md:mt-6 text-right">
        <button className="btn btn-back" onClick={handleSaveAll}>
          Update Pricing
        </button>
      </div>
    </>
  );
};

export default DistanceSlab;