import React, { useState, useRef, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import PDFContent from "./PDFContent";
import { useSelector } from "react-redux";
import Icons from "../../../assets/icons";
import moment from "moment-timezone";
import SelectOption from "../../constants/constantcomponents/SelectOption";
import { formatPhoneNumber } from "../../../utils/formatPhoneNumber";
import { useSendBookingEmailMutation } from "../../../redux/api/bookingApi";
import { useGetBookingSettingQuery } from "../../../redux/api/bookingSettingsApi";
import { toast } from "react-toastify";

const JourneyDetailsModal = ({ viewData = {} }) => {
  const user = useSelector((state) => state.auth.user);
  const companyLogo = user?.superadminCompanyLogo
  const [selectedType, setSelectedType] = useState("Send Customer");
  const [email, setEmail] = useState("");
  const pdfRef = useRef();

  const timezone =
    useSelector((state) => state.bookingSetting?.timezone) || "UTC";

  const companyId = localStorage.getItem("companyId");
  const companyList = useSelector((state) => state.company?.list);
  const companyData = Array.isArray(companyList)
    ? companyList.find((c) => c._id === companyId)
    : null;
  const loggedInUser = useSelector((state) => state.auth?.user);

  const [sendBookingEmail] = useSendBookingEmailMutation();
  const { data: settingsData } = useGetBookingSettingQuery();
  const defaultCurrencySymbol =
    settingsData?.setting?.currency?.[0]?.symbol || "£";

  const currencyPolicy =
    settingsData?.setting?.currencyApplication || "New Bookings Only";

  const currencySymbol =
    currencyPolicy === "All Bookings"
      ? defaultCurrencySymbol
      : viewData?.currency?.symbol || "£";

  useEffect(() => {
    if (selectedType === "Send Customer") {
      setEmail(viewData?.passenger?.email || "");
    } else if (selectedType === "Send  Admin") {
      setEmail(loggedInUser?.email || "");
    }
  }, [selectedType, viewData, loggedInUser]);

  const handleSendEmail = async () => {
    try {
      await sendBookingEmail({
        email,
        bookingId: viewData?._id,
      }).unwrap();
      toast.success("Email sent successfully!");
    } catch (err) {
      toast.error("Failed to send email");
    }
  };

  const downloadPDF = async () => {
    const input = pdfRef.current;
    if (!input) return;

    input.style.opacity = "1";
    input.style.position = "static";
    input.style.pointerEvents = "auto";

    await new Promise((resolve) => setTimeout(resolve, 500));

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save(`#${viewData?.bookingId} Booking-Information.pdf`);

    input.style.opacity = "0";
    input.style.position = "absolute";
    input.style.pointerEvents = "none";
  };

  const formatDateTime = (dateStr, hour, minute) => {
    if (dateStr == null || hour == null || minute == null) return "N/A";

    const date = new Date(dateStr);
    date.setHours(Number(hour));
    date.setMinutes(Number(minute));
    date.setSeconds(0);
    date.setMilliseconds(0);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const sec = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hh}:${min}:${sec}`;
  };

  const pickupTime =
    viewData?.date && viewData?.hour !== undefined
      ? formatDateTime(viewData.date, viewData.hour, viewData.minute)
      : "N/A";


  return (
    <>
      <div
        className="max-w-4xl w-full mx-auto space-y-6 px-6 pb-6 pt-2"
        id="pdf-container"
      >
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <SelectOption
            options={["Send Customer", "Send  Admin"]}
            value={selectedType}
            onChange={(val) => {
              const selected =
                typeof val === "string" ? val : val?.target?.value;
              setSelectedType(selected);
            }}
          />
          <div className="flex items-center gap-2 w-full">
            <span className="text-sm text-(--dark-gray)">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border border-(--light-gray) px-2 py-1.5 rounded text-sm"
              placeholder="Enter email"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              className="btn btn-success text-sm px-4 py-1.5"
              onClick={handleSendEmail}
            >
              Send
            </button>
            <button
              onClick={downloadPDF}
              className="border px-4 py-1.5 rounded text-(--dark-gray) hover:bg-(--lightest-gray) text-sm cursor-pointer"
            >
              <Icons.Download size={20} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-1.5 bg-(--white) p-2.5 rounded-lg shadow-sm border border-(--lightest-gray)">
            <div className="text-sm">
              <strong className="text-(--dark-gray) font-semibold">
                Booking ID:
              </strong>
              <span className="ml-2 text-(--dark-grey)">
                {viewData?.bookingId || "N/A"}
              </span>
            </div>
            <div className="text-sm">
              <strong className="text-(--dark-gray) font-semibold">
                Booking Type:
              </strong>
              <span className="ml-2 text-(--dark-grey)">
                {viewData?.bookingType || "N/A"}
              </span>
            </div>
            <div className="text-sm">
              <strong className="text-(--dark-gray) font-semibold">
                Booking Source:
              </strong>
              <span className="ml-2 text-(--dark-grey)">
                {viewData?.source.charAt(0).toUpperCase() + viewData?.source.slice(1) || "N/A"}
              </span>
            </div>
            <div className="text-sm">
              <strong className="text-(--dark-gray) font-semibold">
                Booked On:
              </strong>
              <span className="ml-2 text-(--dark-grey)">
                {viewData?.createdAt
                  ? moment(viewData.createdAt)
                    .tz(timezone)
                    .format("DD/MM/YYYY HH:mm:ss")
                  : "N/A"}
              </span>
            </div>

            <div className="text-sm">
              <strong className="text-(--dark-gray) font-semibold">
                Payment Type:
              </strong>
              <span className="ml-2 text-(--dark-gray)">
                {viewData?.paymentMethod || "N/A"}
              </span>
            </div>

            <div className="text-sm">
              <strong className="text-(--dark-gray) font-semibold">
                Notes:
              </strong>
              <span className="ml-2 text-(--dark-grey)">
                {viewData?.notes.charAt(0).toUpperCase() + viewData?.notes?.slice(1) || "None"}
              </span>
            </div>

            {viewData?.extraTime && Number(viewData.extraTime) > 0 && (
              <div className="text-sm">
                <strong className="text-(--dark-gray) font-semibold">
                  Extra Time:
                </strong>
                <span className="ml-2 text-(--dark-grey)">
                  {viewData.extraTime} mins
                </span>
              </div>
            )}

            <div className="text-sm">
              <strong className="text-(--dark-gray) font-semibold">
                Duration:
              </strong>
              <span className="ml-2 text-(--dark-grey)">
                {(() => {
                  const totalMins = viewData?.estimatedDuration || 0;
                  const hours = Math.floor(totalMins / 60);
                  const mins = totalMins % 60;
                  const timeStr =
                    hours > 0
                      ? `${hours} hour${hours > 1 ? "s" : ""} ${mins > 0 ? mins + " mins" : ""}`
                      : `${mins} mins`;
                  return `${timeStr} (including extra time)`;
                })()}
              </span>
            </div>

            <div className="text-sm mt-8">
              <strong className="text-(--dark-gray) font-semibold block mb-2">
                Pick Up:
              </strong>
              <div className="ml-0 sm:ml-1 mt-2 space-y-2 bg-(--lightest-gray) p-3 sm:p-4 rounded-md border border-(--lightest-gray)">
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <strong className="text-(--dark-gray) text-xs whitespace-nowrap">
                    Date & Time:
                  </strong>
                  <span className="text-(--dark-grey) text-xs wrap-break-word">
                    {pickupTime}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <strong className="text-(--dark-gray) text-xs">
                    Address:
                  </strong>
                  <span className="text-(--dark-grey) text-xs wrap-break-word">
                    {viewData?.pickup || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                  <strong className="text-(--dark-gray) text-xs whitespace-nowrap">
                    Access / Floor:
                  </strong>
                  <span className="text-(--dark-grey) text-xs">
                    {viewData?.pickupAccess || "STAIRS"} / Floor{" "}
                    {viewData?.pickupFloorNo || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm">
              <strong className="text-(--dark-gray) font-semibold block mb-2">
                Drop Off:
              </strong>
              <div className="ml-0 sm:ml-1 space-y-3">
                {[0, 1, 2, 3, 4].map((idx) => {
                  const dropMap = [
                    viewData?.dropoff,
                    viewData?.additionalDropoff1,
                    viewData?.additionalDropoff2,
                    viewData?.additionalDropoff3,
                    viewData?.additionalDropoff4,
                  ];
                  const drop = dropMap[idx];
                  if (!drop) return null;

                  return (
                    <div
                      key={idx}
                      className="bg-(--lightest-gray) p-3 sm:p-4 rounded-md border border-(--lightest-gray) space-y-2"
                    >
                      <div className="flex flex-col gap-1">
                        <strong className="text-(--dark-gray) text-xs">
                          {idx === 0
                            ? "Main Drop Off"
                            : `Additional Drop Off ${idx}`}
                          :
                        </strong>
                        <span className="text-(--dark-grey) text-xs wrap-break-word">
                          {drop}
                        </span>
                      </div>

                      {idx === 0 && (
                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                          <strong className="text-(--dark-gray) text-xs whitespace-nowrap">
                            Access / Floor:
                          </strong>
                          <span className="text-(--dark-grey) text-xs">
                            {viewData?.dropoffAccess || "STAIRS"} / Floor{" "}
                            {viewData?.dropoffFloorNo || 0}
                          </span>
                        </div>
                      )}

                      {idx > 0 && viewData[`additionalDropoff${idx}Access`] && (
                        <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                          <strong className="text-(--dark-gray) text-xs whitespace-nowrap">
                            Access / Floor:
                          </strong>
                          <span className="text-(--dark-grey) text-xs">
                            {viewData[`additionalDropoff${idx}Access`]} / Floor{" "}
                            {viewData[`additionalDropoff${idx}FloorNo`] || 0}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-(--white) p-3 rounded-lg shadow-sm border border-(--lightest-gray)">
            <div>
              <div className="text-sm">
                <strong className="text-(--dark-grey) font-semibold block mb-2">
                  Passenger Details:
                </strong>
                <div className="ml-0 sm:ml-1 mt-2 space-y-2 bg-(--lightest-gray)  p-3 sm:p-4 rounded-md border border-(--lightest-gray)">
                  <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                    <strong className="text-(--dark-gray) text-xs whitespace-nowrap">
                      Name:
                    </strong>
                    <span className="text-(--dark-grey)">
                      {viewData?.passenger?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <strong className="text-(--dark-gray)">
                      Email:
                    </strong>
                    <span className="text-(--dark-grey) break-all">
                      {viewData?.passenger?.email || "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col xs:flex-row xs:items-start gap-1">
                    <strong className="text-(--dark-gray) text-xs whitespace-nowrap">
                      Phone:
                    </strong>
                    <span className="text-(--dark-grey) text-xs">
                      {formatPhoneNumber(viewData?.passenger?.phone) || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <strong className="text-(--dark-grey) mt-3 font-semibold block mb-2">
                  Vehicle Details:
                </strong>
                <div className="ml-0 sm:ml-1 mt-2 bg-(--lightest-gray)  p-3 sm:p-4 rounded-md border border-(--lightest-gray)">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex flex-col gap-1">
                      <strong className="text-(--dark-gray) text-xs">
                        Vehicle:
                      </strong>
                      <span className="text-(--dark-grey) text-xs wrap-break-word">
                        {viewData?.vehicle?.vehicleName || "N/A"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <strong className="text-(--dark-gray) text-xs">
                        Passengers:
                      </strong>
                      <span className="text-(--dark-grey) text-xs">
                        {viewData?.passengerCount || 0}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <strong className="text-(--dark-gray) text-xs">
                        Who's Helping?:
                      </strong>
                      <span className="text-(--dark-grey) text-xs">
                        {viewData?.vehicle?.extraHelp?.label || "Self Load"}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <strong className="text-(--dark-gray) text-xs">
                        Luggage:
                      </strong>
                      <span className="text-(--dark-grey) text-xs">
                        {viewData?.inventoryItems || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-(--white) p-3 rounded-lg shadow-sm border border-(--lightest-gray)">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
              {(viewData?.fare !== undefined ||
                viewData?.additionalTimeFare ||
                viewData?.workersCharges) && (
                  <div className="space-y-1 border-b border-gray-200 pb-2 mb-2">
                    <div className="flex justify-between text-xs text-(--dark-grey)">
                      <span>Base Quote:</span>
                      <span>
                        {currencySymbol}
                        {Math.round(Number(viewData?.fare || 0)).toFixed(2)}
                      </span>
                    </div>
                    {viewData?.additionalTimeFare > 0 && (
                      <div className="flex justify-between text-xs text-(--dark-grey)">
                        <span>Additional Time Charges:</span>
                        <span>
                          +{currencySymbol}
                          {Math.round(Number(viewData?.additionalTimeFare)).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {viewData?.workersCharges > 0 && (
                      <div className="flex justify-between text-xs text-(--dark-grey)">
                        <span>Extra Men Charges:</span>
                        <span>
                          +{currencySymbol}
                          {Math.round(Number(viewData?.workersCharges)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              <div className="btn btn-back text-sm sm:text-base px-6 py-3 rounded-md font-medium flex-col items-center justify-center">
                <div className="flex items-center">
                  <span className="text-(--dark-gray)">Total Fare:</span>
                  <span className="ml-2 text-lg sm:text-xl font-semibold text-(--dark-grey)">
                    {currencySymbol}
                    {Math.round(Number(viewData?.totalPrice || viewData?.fare || 0)).toFixed(
                      2,
                    )}
                  </span>
                </div>
                <div className="flex flex-col w-full mt-2 border-t border-gray-200 pt-2 space-y-1">
                  <div className="flex justify-between text-xs text-(--dark-grey)">
                    <span>Deposit Paid (35%):</span>
                    <span className="font-semibold">
                      {currencySymbol}
                      {Math.round(Number(viewData?.fareBreakdown?.depositPaid || (viewData?.totalPrice || viewData?.fare || 0) * 0.35)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-(--dark-grey)">
                    <span>Remaining Balance (65%):</span>
                    <span className="font-semibold">
                      {currencySymbol}
                      {Math.round(Number(viewData?.totalPrice || viewData?.fare || 0) - Number(viewData?.fareBreakdown?.depositPaid || (viewData?.totalPrice || viewData?.fare || 0) * 0.35)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-(--dark-grey) mt-3 text-xs sm:text-sm">
          <span className="font-medium">Approx. Distance:</span>
          <span className="ml-2">{viewData?.distanceText}</span>
        </div>
      </div>
      <PDFContent ref={pdfRef} viewData={viewData} companyData={companyData} companyLogo={companyLogo} />
    </>
  );
};

export default JourneyDetailsModal;