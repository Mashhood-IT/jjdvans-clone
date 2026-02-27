import React from "react";

const AuditModal = ({ auditData = [] }) => {
  return (
    <>
      <div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-(--lightest-gray) text-(--dark-gray) uppercase text-xs tracking-wider">
              <tr>
                <th className="text-left px-6 py-3">#</th>
                <th className="text-left px-6 py-3">Updated By</th>
                <th className="text-left px-6 py-3">Status</th>
                <th className="text-left px-6 py-3">GPS Stamp</th>
                <th className="text-left px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--lightest-gray)">
              {auditData.length > 0 ? (
                auditData.map((entry, i) => (
                  <tr
                    key={i}
                    className="hover:bg-(--lightest-gray) transition duration-200"
                  >
                    <td className="px-6 py-3 text-(--medium-grey)">{i + 1}</td>
                    <td className="px-6 py-3 font-medium text-(--dark-gray)">
                      {entry.updatedBy
                        ? entry.updatedBy
                          .split(" ")
                          .map((word) =>
                            word
                              .split("|")
                              .map((part) => {
                                let clean = part.trim();
                                if (clean.toLowerCase() === "clientadmin") {
                                  return "Admin";
                                }
                                return (
                                  clean.charAt(0).toUpperCase() +
                                  clean.slice(1)
                                );
                              })
                              .join(" | ")
                          )
                          .join(" ")
                        : "Unknown"}
                    </td>
                    <td className="px-6 py-3 text-(--dark-gray)">
                      {entry.status || "—"}
                    </td>
                    <td className="px-6 py-3 text-(--dark-gray)">
                      {entry.latitude && entry.longitude ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${entry.latitude},${entry.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-(--indigo-color) hover:underline flex items-center gap-1"
                        >
                          View Map
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-3 text-(--medium-grey)">
                      {entry.date ? new Date(entry.date).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-(--medium-grey)"
                  >
                    No audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default AuditModal;