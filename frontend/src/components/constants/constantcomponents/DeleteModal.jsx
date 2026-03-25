import React from "react";

const DeleteModal = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Are you sure you want to delete?",
  confirmText = "Yes, Delete",
  cancelText = "Cancel",
  confirmClass,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-(--white) shadow-lg rounded-xl p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-center text-xl font-semibold text-(--dark-grey) mb-6">
          {title}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onConfirm}
            className={
              confirmClass ||
              "w-full bg-(--alert-red) cursor-pointer hover:bg-(--primary-dark-red) text-(--white) font-semibold py-2 px-4 rounded-lg transition"
            }
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="w-full bg-(--lighter-gray) cursor-pointer hover:bg-(--light-gray) text-(--dark-grey) font-semibold py-2 px-4 rounded-lg transition"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;