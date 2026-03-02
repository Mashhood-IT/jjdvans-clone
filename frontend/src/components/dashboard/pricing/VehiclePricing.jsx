import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Icons from "../../../assets/icons";
import { useSelector } from "react-redux";
import { useLoading } from "../../common/LoadingProvider";

import OutletHeading from "../../constants/constantcomponents/OutletHeading";
import CustomTable from "../../constants/constantcomponents/CustomTable";
import CustomModal from "../../constants/constantcomponents/CustomModal";
import DeleteModal from "../../constants/constantcomponents/DeleteModal";

import {
  useCreateVehicleMutation,
  useDeleteVehicleMutation,
  useGetAllVehiclesQuery,
  useUpdateVehicleMutation,
} from "../../../redux/api/vehicleApi";

const VehiclePricing = () => {
  const { showLoading, hideLoading } = useLoading();
  const user = useSelector((state) => state?.auth?.user)
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState("All");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [imageOptions, setImageOptions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [createVehicle, { isLoading: isCreating }] = useCreateVehicleMutation();
  const [updateVehicle, { isLoading: isUpdating }] = useUpdateVehicleMutation();
  const [deleteVehicle] = useDeleteVehicleMutation();
  const {
    data: vehicleData = [],
    refetch,
    isLoading,
  } = useGetAllVehiclesQuery();

  useEffect(() => {
    if (isLoading) {
      showLoading();
    } else {
      hideLoading();
    }
  }, [showLoading, hideLoading, isLoading]);

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (vehicleData?.length) {
      const uniqueImages = Array.from(
        new Set(vehicleData.map((v) => v.image).filter(Boolean))
      );
      setImageOptions(uniqueImages);
    }
  }, [vehicleData]);

  useEffect(() => {
    if (showModal) {
      setSelectedAccount((prev) => ({
        ...prev,
        extraHelp: prev?.extraHelp?.length ? prev.extraHelp : [{ label: "", price: 0 }],
      }));
    }
  }, [showModal]);

  const handleEditModal = (record = {}) => {
    setSelectedAccount(record);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteVehicle(deleteId);
      toast.success("Vehicle deleted successfully");
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (err) {
      toast.error("Failed to delete vehicle");
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    formData.append("priceType", "Percentage");

    const parsedSlabs = (selectedAccount.slabs || [])
      .map((s) => ({
        from: Number(s.from),
        to: Number(s.to),
        price: Number(s.price),
      }))
      .filter((s) => !isNaN(s.from) && !isNaN(s.to) && !isNaN(s.price));
    formData.append("slabs", JSON.stringify(parsedSlabs));

    Object.entries(selectedAccount).forEach(([key, value]) => {
      if (
        key === "image" ||
        key === "extraHelp" ||
        key === "priceType" ||
        key === "slabs"
      )
        return;
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    if (uploadFile) {
      formData.append("image", uploadFile);
    } else if (selectedAccount.image) {
      formData.append("image", selectedAccount.image);
    }

    const cleanedHelp = (selectedAccount.extraHelp || [])
      .filter((item) => item.label && item.label.trim())
      .map((item) => ({
        label: item.label.trim(),
        price: Number(item.price) || 0,
      }));
    formData.append("extraHelp", JSON.stringify(cleanedHelp));

    try {
      if (selectedAccount._id) {
        await updateVehicle({ id: selectedAccount._id, formData });
        toast.success("Vehicle updated successfully");
      } else {
        await createVehicle(formData);
        toast.success("Vehicle created successfully");
      }
      setShowModal(false);
      refetch();
    } catch (err) {
      toast.error("Error saving vehicle");
    }
  };

  const filteredData = vehicleData
    .filter((item) =>
      Object.values(item)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const paginatedData =
    perPage === "All"
      ? filteredData
      : filteredData.slice((page - 1) * perPage, page * perPage);

  const tableHeaders = [
    { label: <div className="flex items-center gap-1.5"> Priority</div>, key: "priority" },
    { label: <div className="flex items-center gap-1.5"> Vehicle</div>, key: "vehicleInfo" },
    { label: <div className="flex items-center gap-1.5"> Pass. Seats</div>, key: "passengerSeats" },
    { label: <div className="flex items-center gap-1.5"> Description</div>, key: "description" },
    { label: <div className="flex items-center gap-1.5"> Markup (%)</div>, key: "percentageIncrease" },
    { label: "Action", key: "actions" },
  ];

  const tableData = paginatedData.map((item) => ({
    ...item,
    vehicleInfo: (
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-(--lighter-gray) border border-(--light-gray) flex items-center justify-center overflow-hidden">
          <img src={item.image} alt="" className="w-full h-full object-contain" />
        </div>
        <span className="font-bold text-(--dark-grey)">{item.vehicleName}</span>
      </div>
    ),
    passengerSeats: (
      <span className="text-(--dark-grey)">{item.passengerSeats || 0} Seats</span>
    ),
    description: (
      <p className="max-w-50 truncate text-(--lighter-gray)0" title={item.description}>
        {item.description || "No description"}
      </p>
    ),
    percentageIncrease: (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-100">
        +{item.percentageIncrease}%
      </span>
    ),
    actions: (
      <div className="flex gap-2">
        <button
          onClick={() => handleEditModal(item)}
          className="tab tab-suspended"
          title="Edit"
        >
          <Icons.Pencil className="size-4" />
        </button>
        <button
          onClick={() => {
            setDeleteId(item._id);
            setShowDeleteModal(true);
          }}
          className="tab tab-danger"
          title="Delete"
        >
          <Icons.Trash className="size-4" />
        </button>
      </div>
    ),
  }));

  return (
    <>
      <OutletHeading name="Vehicle Pricing" />
      <button
        className="btn btn-primary mb-3 sm:mb-4 md:mb-5 px-6 sm:px-8 text-xs sm:text-sm flex items-center gap-2"
        onClick={() => handleEditModal({})}
      >
        <Icons.Plus className="size-4" />
        Add New Vehicle
      </button>

      <CustomTable
        filename="Vehicle-Pricing-list"
        tableHeaders={tableHeaders}
        tableData={tableData}
        showPagination={true}
        showSorting={true}
        currentPage={page}
        setCurrentPage={setPage}
        perPage={perPage}
      />
      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        heading={
          selectedAccount?._id
            ? `Edit ${selectedAccount.vehicleName || "Vehicle"}`
            : "Add Vehicle"
        }
      >
        <div className="mx-auto px-6 pb-4 font-sans space-y-4 w-full max-w-md">
          {[
            { label: "Priority", key: "priority" },
            { label: "Vehicle Name", key: "vehicleName" },
            { label: "Passenger Seats", key: "passengerSeats" },
            { label: "Description", key: "description" },
            { label: "Half Hour Price", key: "halfHourPrice" },
            { label: "Percentage Increase (%)", key: "percentageIncrease" },
          ].map((field) => (
            <div key={field.key}>
              <label className="flex items-center gap-1.5 text-xs sm:text-sm text-(--medium-grey) mb-1.5">
                {field.label}
              </label>
              <input
                type={(field.key === "vehicleName" || field.key === "description") ? "text" : "number"}
                className="custom_input text-xs sm:text-sm shadow-sm border-gray-200 focus:border-(--main-color) focus:ring-1 focus:ring-(--main-color)"
                value={selectedAccount?.[field.key] ?? ""}
                onChange={(e) =>
                  setSelectedAccount({
                    ...selectedAccount,
                    [field.key]: e.target.value,
                  })
                }
              />
            </div>
          ))}
          <div>
            <label className="flex items-center gap-1.5 text-xs sm:text-sm text-(--medium-grey) mb-1.5">
              Price Type
            </label>
            <input
              type="text"
              className="custom_input text-xs sm:text-sm bg-(--lighter-gray) text-(--lighter-gray)0 border-gray-200"
              value="Percentage"
              disabled
            />
          </div>
          <div className="mt-3 sm:mt-4">
            <label className="flex items-center gap-1.5 text-xs sm:text-sm text-(--medium-grey) mb-2">
              Extra Help Options (Add-ons)
            </label>
            {selectedAccount?.extraHelp?.map((help, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 mb-3 bg-(--lighter-gray) p-3 rounded-xl border border-(--light-gray) relative">
                <div className="flex-1">
                  <label className="block text-[10px] uppercase text-gray-400 mb-1">Label</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 Men Team"
                    className="custom_input text-xs sm:text-sm"
                    value={help.label || ""}
                    onChange={(e) => {
                      const updated = [...selectedAccount.extraHelp];
                      updated[index] = { ...updated[index], label: e.target.value };
                      setSelectedAccount({
                        ...selectedAccount,
                        extraHelp: updated,
                      });
                    }}
                  />
                </div>
                <div className="w-full sm:w-24">
                  <label className="block text-[10px] uppercase text-gray-400 mb-1">Price (£)</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="custom_input text-xs sm:text-sm"
                    value={help.price || 0}
                    onChange={(e) => {
                      const updated = [...selectedAccount.extraHelp];
                      updated[index] = { ...updated[index], price: Number(e.target.value) };
                      setSelectedAccount({
                        ...selectedAccount,
                        extraHelp: updated,
                      });
                    }}
                  />
                </div>
                <button
                  type="button"
                  className="absolute -top-2 -right-2 bg-white shadow-md rounded-full p-1 text-(--alert-red) cursor-pointer"
                  onClick={() => {
                    const updated = [...selectedAccount.extraHelp];
                    updated.splice(index, 1);
                    setSelectedAccount({
                      ...selectedAccount,
                      extraHelp: updated,
                    });
                  }}
                >
                  <Icons.X className="size-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              className="btn btn-back w-full px-4 sm:px-6 text-xs sm:text-sm flex items-center justify-center gap-2 border-dashed border-2 hover:border-(--main-color) hover:text-(--main-color) transition-all"
              onClick={() => {
                if (selectedAccount.extraHelp.length >= 10) {
                  toast.warning("You can only add up to 10 options.");
                  return;
                }
                setSelectedAccount({
                  ...selectedAccount,
                  extraHelp: [...selectedAccount.extraHelp, { label: "", price: 0 }],
                });
              }}
            >
              Add New Option
            </button>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs sm:text-sm text-(--medium-grey) mb-1.5">
              Vehicle Image
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="custom_input flex-1 text-xs sm:text-sm"
                value={
                  uploadFile ? uploadFile.name : selectedAccount?.image || ""
                }
                readOnly
              />
              <button
                type="button"
                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-(--lightest-gray) border border-(--medium-grey) rounded hover:bg-(--light-gray)"
                onClick={() => setShowImageSelector(true)}
              >
                <Icons.FileText className="size-4 sm:size-5" />
              </button>
            </div>

            {selectedAccount?.image && (
              <div className="flex flex-col items-center mt-2 sm:mt-3">
                <img
                  src={selectedAccount.image}
                  alt="Preview"
                  className="w-28 h-16 sm:w-32 sm:h-20 object-cover rounded shadow"
                />
                {uploadFile && (
                  <p className="text-xs text-(--dark-gray) mt-1">
                    {uploadFile.name}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 sm:gap-3 pt-2">
            <button disabled={isCreating || isUpdating} onClick={handleSubmit} className="btn btn-edit px-6 sm:px-8 text-xs sm:text-sm">
              {selectedAccount?._id ? "Update" : "Create"}
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="btn btn-cancel px-6 sm:px-8 text-xs sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </CustomModal>
      <CustomModal
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        heading="Select Image"
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3 sm:gap-4 p-3 sm:p-4 justify-center">
          {imageOptions.map((imgPath) => (
            <img
              key={imgPath}
              src={imgPath}
              alt="vehicle"
              className="cursor-pointer rounded shadow border hover:border-(--indigo-color)"
              onClick={() => {
                setUploadFile(null);
                setSelectedAccount({ ...selectedAccount, image: imgPath });
                setShowImageSelector(false);
              }}
            />
          ))}
        </div>
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <label className="block text-xs sm:text-sm font-medium text-(--dark-grey) mb-1">
            Upload Image (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                setUploadFile(file);
                setSelectedAccount((prev) => ({
                  ...prev,
                  image: "",
                }));
              }
            }}
            className="custom_input mt-2 text-xs sm:text-sm"
          />
        </div>
      </CustomModal>
      <DeleteModal
        isOpen={showDeleteModal}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
          refetch();
        }}
      />
    </>
  );
};

export default VehiclePricing;