import React, { useMemo, useState } from "react";
import OutletHeading from "../../constants/constantcomponents/OutletHeading";
import CustomTable from "../../constants/constantcomponents/CustomTable";
import { useGetAllBookingsQuery } from "../../../redux/api/bookingApi";

const CustomersList = () => {
  const { data: bookings = [], isLoading, isError } = useGetAllBookingsQuery();
  const [selectedRow, setSelectedRow] = useState(null);

  const customersData = useMemo(() => {
    return bookings
      .filter((b) => b.passenger)
      .map((b) => ({
        _id: b._id,
        bookingId: b.bookingId || "-",
        name: b.passenger?.name || "-",
        email: b.passenger?.email || "-",
        phone: b.passenger?.phone || "-",
      }));
  }, [bookings]);

  const tableHeaders = [
    { key: "bookingId", label: "Booking ID" },
    { key: "name", label: "Customer Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ];

  if (isLoading) return <div>Loading customers...</div>;
  if (isError) return <div>Failed to load customers</div>;

  return (
    <>
      <OutletHeading name="Customers List" />

      <CustomTable
        tableHeaders={tableHeaders}
        tableData={customersData}
        exportTableData={customersData}
        filename="customers-list"
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        emptyMessage="No Customers Found"
      />
    </>
  );
};

export default CustomersList;