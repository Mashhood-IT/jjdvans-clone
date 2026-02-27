import React from "react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import Icons from "../../../assets/icons";

const DownloadExcel = ({
  tableData = [],
  tableHeaders = [],
  filename = "table-data",
}) => {
  const handleDownload = () => {
    if (!tableData || tableData.length === 0) {
      toast.error("No data to download.");
      return;
    }
    const filteredHeaders = tableHeaders.filter(
      (header) =>
        !(
          header.label.toLowerCase().includes("action") ||
          header.key.toLowerCase().includes("action") ||
          header.label.toLowerCase().includes("profile") ||
          header.key.toLowerCase().includes("profile") ||
          header.label.toLowerCase().includes("image") ||
          header.key.toLowerCase().includes("image")
        )
    );
    const headers = filteredHeaders.map((h) => h.label);
    const keys = filteredHeaders.map((h) => h.key);
    const data = tableData.map((row) => {
      const obj = {};
      keys.forEach((key, index) => {
        obj[headers[index]] =
          typeof row[key] === "string" || typeof row[key] === "number"
            ? row[key]
            : "-";
      });
      return obj;
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet 1");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
    toast.success("Excel downloaded!");
  };
  return (
    <>
      <button
        onClick={handleDownload}
        className="border rounded-full py-2 px-3 cursor-pointer border-(--light-gray) bg-(--white) hover:bg-(--lightest-gray) md:text-sm text-xs flex items-center gap-2"
      >
        <Icons.Download size={16} />
        Download Excel
      </button>
    </>
  );
};

export default DownloadExcel;