import React from "react";
import Icons from "../../../assets/icons";
import IMAGES from "../../../assets/images";

export const itemsPerPageOptions = [1, 2, 3, 40, "All"];


export const actionMenuItems = [
  "View",
  "Edit",
  "Delete",
];

export const driverList = [
  { label: "Usman Ahmed" },
  { label: "Khizer Khan" },
  { label: "Hafiz Amir" },
  { label: "Noman" },
  { label: "Zain Ul Abideen" },
];

export const accountList = [
  { label: "Corporate Account" },
  { label: "Personal Account" },
  { label: "Travel Agent" },
  { label: "Staff Booking" },
  { label: "Walk-in" },
];

export const driversData = [
  {
    no: "104",
    name: "Abbas",
    email: "Jeffery786@hotmail.com",
    make: "Mercedes Benz",
    model: "E Class",
    regNo: "GV68WSZ",
    documents: "Expired",
    status: "Suspended",
    driverImage: IMAGES.profileimg,
    vehicleImage: IMAGES.mercedesVito,
    shortName: "SC",
    address: "123 Road",
    contact: "1234567890",
    dob: "1990-01-01",
    nationality: "British",
    drivingLicense: "DL12345",
    licenseExpiry: "2025-12-01",
    taxiLicense: "TXL7890",
    taxiLicenseExpiry: "2024-10-15",
    pcoCard: "PCO-567",
    pcoExpiry: "2024-07-01",
    niNumber: "NI999999A",
    insurance: "Aviva",
    insuranceExpiry: "2025-01-01",
    vehicleTaxiLicense: "TX999",
    vehicleTaxiExpiry: "2024-12-31",
    condition: "Excellent",
    conditionExpiry: "2024-11-01",
    carV5: "Available",
    vehicleTypes: ["Standard Saloon", "Luxury MPV"],
  },
];



export const vehicleData = [
  {
    priority: 0,
    vehicleName: "Standard Saloon",
    passengers: 3,
    handLuggage: 2,
    checkinLuggage: 2,
    childSeat: 2,
    price: "0.00%",
    image: "/images/standard.png",
  },
  {
    priority: 1,
    vehicleName: "Executive Saloon",
    passengers: 3,
    handLuggage: 2,
    checkinLuggage: 2,
    childSeat: 1,
    price: "20.00%",
    image: "/images/executive.png",
  },
  {
    priority: 2,
    vehicleName: "VIP Saloon",
    passengers: 3,
    handLuggage: 2,
    checkinLuggage: 2,
    childSeat: 0,
    price: "50.00%",
    image: "/images/vip.png",
  },
  {
    priority: 3,
    vehicleName: "Luxury MPV",
    passengers: 6,
    handLuggage: 6,
    checkinLuggage: 6,
    childSeat: 2,
    price: "50.00%",
    image: "/images/luxury-mpv.png",
  },
  {
    priority: 4,
    vehicleName: "8 Passenger MPV",
    passengers: 8,
    handLuggage: 6,
    checkinLuggage: 6,
    childSeat: 2,
    price: "55.00%",
    image: "/images/8-mpv.png",
  },
];


export const bookingRestrictionData = [
  {
    caption: "Holiday",
    recurring: "Yearly",
    from: "01-Jan 00:00",
    to: "02-Jan 23:55",
    status: "Active",
  },
  {
    caption: "Holidays",
    recurring: "Yearly",
    from: "31-Dec 00:00",
    to: "01-Jan 23:55",
    status: "Active",
  },
];

export const receiptData = [
  {
    invoiceNo: "INV-00001",
    customer: "Erin Leahy",
    account: "Account 1",
    date: "04-01-2023",
    dueDate: "11-01-2023",
    amount: "92.00",
    email: "erin.leahy@example.com",
    phone: "+447930844247",
    rides: [
      {
        number: "2212323",
        passenger: "Erin Leahy",
        pickup: "London Stansted Airport (STN)",
        drop: "32 The Bishops Ave, London N2 0BA, UK",
        datetime: "23-12-2022 14:05",
        amount: "92.00",
        tax: "0%",
      },
      {
        number: "2212323",
        passenger: "Erin Leahy",
        pickup: "London Stansted Airport (STN)",
        drop: "32 The Bishops Ave, London N2 0BA, UK",
        datetime: "23-12-2022 14:05",
        amount: "32.00",
        tax: "0%",
      },
    ],
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
];

export const timeOptions = {
  autoAllocationHours: [
    "1 hour", "2 hours", "3 hours", "4 hours", "5 hours", "6 hours", "12 hours", "24 hours"
  ],
  reviewHours: [
    "10 seconds", "1 hours", "2 hours", "3 hours", "4 hours", "6 hours", "12 hours", "24 hours"
  ],
  dailyTimes: [
    "00:00 - 01:00", "01:00 - 02:00", "02:00 - 03:00", "03:00 - 04:00", "04:00 - 05:00",
    "05:00 - 06:00", "06:00 - 07:00", "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00",
    "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00", "13:00 - 14:00", "14:00 - 15:00",
    "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00",
    "20:00 - 21:00", "21:00 - 22:00", "22:00 - 23:00", "23:00 - 24:00"
  ],
  weekDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  frequencies: ["Weekly", "Monthly"]
};

// Used
export const bookingPaymentOptions = [
  {
    label: "Pay Now",
    value: "Pay Now",
  },
  {
    label: "Pay Later",
    value: "Pay Later",
  },
  {
    label: "Bank Transfer",
    value: "Bank Transfer",
  },
];

// Used
export const invoicePaymentOptions = [
  {
    label: "Pay Via Debit/Credit Card",
    value: "Pay Via Debit/Credit Card",
  },
  {
    label: "Cash",
    value: "Cash",
  },
  {
    label: "Bank",
    value: "Bank",
  },
];

// Used
export const yesNoOptions = [
  {
    label: "Yes",
    value: "Yes",
  },
  {
    label: "No",
    value: "No",
  },
];

// New Data
export const mockJobs = [
  {
    id: 1,
    pickupLocation: "Downtown Mall, Main Street",
    dropLocation: "Airport Terminal 2, Gate A",
    extraGuidance: "Customer will be waiting near Starbucks entrance",
    driverFare: 45.5,
    totalPayment: 60.0,
    driverShare: 45.5,
    estimatedTime: "25 min",
    distance: "12.5 km",
    customerName: "John Smith",
    customerRating: 4.8,
    status: "available",
    acceptedAt: null,
    driverName: "Driver A",
    driverPhone: "123-456-7890",
  },
  {
    id: 2,
    pickupLocation: "Central Hospital, Emergency Wing",
    dropLocation: "Greenwood Apartments, Block C",
    extraGuidance: "Handle with care - elderly passenger",
    driverFare: 28.75,
    totalPayment: 38.0,
    driverShare: 28.75,
    estimatedTime: "18 min",
    distance: "8.2 km",
    customerName: "Maria Garcia",
    customerRating: 4.9,
    status: "available",
    acceptedAt: null,
    driverName: "Driver B",
    driverPhone: "987-654-3210",
  },
  {
    id: 3,
    pickupLocation: "Tech Park, Building 5",
    dropLocation: "City Center Mall, Food Court",
    extraGuidance: "Customer has luggage - please assist",
    driverFare: 32.25,
    totalPayment: 42.0,
    driverShare: 32.25,
    estimatedTime: "20 min",
    distance: "9.8 km",
    customerName: "Alex Johnson",
    customerRating: 4.7,
    status: "available",
    acceptedAt: null,
    driverName: "Driver C",
    driverPhone: "555-123-4567",
  },
  {
    id: 4,
    pickupLocation: "University Campus, Library",
    dropLocation: "Railway Station, Platform 3",
    extraGuidance: "Student with books - extra time needed",
    driverFare: 22.0,
    totalPayment: 30.0,
    driverShare: 22.0,
    estimatedTime: "15 min",
    distance: "6.5 km",
    customerName: "Emily Chen",
    customerRating: 5.0,
    status: "scheduled",
    acceptedAt: "2025-05-25T10:30:00",
    driverName: "Driver D",
    driverPhone: "444-777-8888",
  },
  {
    id: 5,
    pickupLocation: "Business District, Tower A",
    dropLocation: "Residential Area, Pine Street",
    extraGuidance: "VIP customer - professional service required",
    driverFare: 55.0,
    totalPayment: 70.0,
    driverShare: 55.0,
    estimatedTime: "30 min",
    distance: "15.2 km",
    customerName: "Robert Wilson",
    customerRating: 4.6,
    status: "scheduled",
    acceptedAt: "2025-05-25T09:45:00",
    driverName: "Driver E",
    driverPhone: "222-333-4444",
  },
];

export const mockEarningsData = [
  {
    id: 1,
    date: "2024-05-27",
    amount: 85.5,
    jobType: "pick-drop",
    status: "completed",
    tripDistance: 12.5,
  },
  {
    id: 2,
    date: "2024-05-26",
    amount: 92.0,
    jobType: "pick-drop",
    status: "completed",
    tripDistance: 15.2,
  },
  {
    id: 3,
    date: "2024-05-25",
    amount: 67.25,
    jobType: "pickup-only",
    status: "completed",
    tripDistance: 8.7,
  },
  {
    id: 4,
    date: "2024-05-24",
    amount: 110.75,
    jobType: "pick-drop",
    status: "completed",
    tripDistance: 22.1,
  },
  {
    id: 5,
    date: "2024-05-23",
    amount: 78.9,
    jobType: "drop-only",
    status: "completed",
    tripDistance: 11.3,
  },
  {
    id: 6,
    date: "2024-05-22",
    amount: 95.4,
    jobType: "pick-drop",
    status: "completed",
    tripDistance: 16.8,
  },
  {
    id: 7,
    date: "2024-05-21",
    amount: 73.6,
    jobType: "pickup-only",
    status: "completed",
    tripDistance: 9.9,
  },
  {
    id: 8,
    date: "2024-05-20",
    amount: 128.25,
    jobType: "pick-drop",
    status: "completed",
    tripDistance: 24.5,
  },
];

export const timeFilters = [
  { value: "1", label: "1 Day" },
  { value: "7", label: "7 Days" },
  { value: "15", label: "15 Days" },
  { value: "30", label: "30 Days" },
];

export const jobTypes = [
  { value: "all", label: "All Services" },
  { value: "pick-drop", label: "Pick & Drop" },
  { value: "pickup-only", label: "Pickup Only" },
  { value: "drop-only", label: "Drop Only" },
];

export const statusOptions = [
  { value: "all", label: "All Rides" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "At Waiting", label: "At Waiting" },
  { value: "Extra Stop", label: "Extra Stop" },
];

export const termsData = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing and using our service, you accept and agree to be bound by the terms and provision of this agreement.",
  },
  {
    title: "Use License",
    content:
      "Permission is granted to temporarily use our service for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.",
  },
  {
    title: "Privacy Policy",
    content:
      "Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service.",
  },
  {
    title: "User Responsibilities",
    content:
      "You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer.",
  },
  {
    title: "Limitation of Liability",
    content:
      "In no event shall our company be liable for any damages arising out of the use or inability to use our service.",
  },
];

export const informationData = [
  {
    icon: <Icons.Mail className="size-4 text-black" />,
    title: "Email Us",
    detail: "hello@company.com",
    note: "Send us an email anytime",
  },
  {
    icon: <Icons.Phone className="size-4 text-black" />,
    title: "Call Us",
    detail: "+1 (555) 123-4567",
    note: "Available 24 for support",
  },
  {
    icon: <Icons.MapPin className="size-4 text-black" />,
    title: "Visit Us",
    detail: "123 Business St\nNew York, NY 10001",
  },
  {
    icon: <Icons.Clock className="size-4 text-black" />,
    title: "Office Hours",
    detail: "Mon - Fri: 9AM - 6PM\nWeekend: 10AM - 4PM",
  },
];

export const CompanyAdditionalInformation = [
  {
    label: "Contact number",
    placeholder: "+44 208 961 1818",
    type: "text",
  },
  {
    label: "Email address",
    placeholder: "booking@megatransfers.co.uk",
    type: "email",
  },
  { label: "Company address", placeholder: "", type: "text" },
  { label: "License number", placeholder: "", type: "text" },
  { label: "License reference link", placeholder: "", type: "text" },
];

export const themes = [
  {
    value: "theme-dark-1",
    bg: "#07384D",
    text: "#F1EFEF",
    hoverActive: "#064f7c",
  },
  {
    value: "theme-dark-2",
    bg: "#22333B",
    text: "#F1EFEF",
    hoverActive: "#930000",
  },
  {
    value: "theme-light-1",
    bg: "#cfe2e3",
    text: "#1E1E1E",
    hoverActive: "#a5d8dd",
  },
  {
    value: "custom",
    bg: "#ffffff",
    text: "#000000",
    hoverActive: "#F7BE7E",
  },
];

export const colorFields = [
  { key: "bg", label: "Background Color" },
  { key: "text", label: "Text Color" },
  { key: "primary", label: "Primary Button Color" },
  { key: "hover", label: "Hover Color" },
  { key: "active", label: "Active Color" },
  { key: "widgetBg", label: "Widget Background" },
  { key: "widgetText", label: "Widget Text" },
  { key: "widgetBorder", label: "Widget Border" },
  { key: "widgetBtnBg", label: "Widget Button Background" },
  { key: "widgetBtnText", label: "Widget Button Text" },

];

export const ALL_PERMISSIONS = [
  "My Dashboard",
  "Booking Logs",
  "User Profiles",
  "Invoices",
  "Company Profiles",
  "Statements",
  "Pricing",
  "Settings",
  "Profile",
  "Logout",
];

export const statusColors = {
  "New": { bg: "#E0E7FF", text: "#3730A3" },
  "Accepted": { bg: "#CCFBF1", text: "#0F766E" },
  "On Route": { bg: "#FEF9C3", text: "#92400E" },
  "At Location": { bg: "#DBEAFE", text: "#1D4ED8" },
  "At Waiting": { bg: "#FFF7ED", text: "#92400E" },
  "Extra Stop": { bg: "#FFFDE7", text: "#92400E" },
  "Already Assigned": { bg: "#DBEAFE", text: "#1D4ED8" },
  "Ride Started": { bg: "#E0F2FE", text: "#0284C7" },
  "Late Cancel": { bg: "#FECACA", text: "#B91C1C" },
  "No Show": { bg: "#E9D5FF", text: "#7E22CE" },
  "Completed": { bg: "#DCFCE7", text: "#15803D" },
  "Cancel": { bg: "#F3F4F6", text: "#6B7280" },
  "Deleted": { bg: "#F3F4F6", text: "#6B7280" },
  "Rejected": { bg: "var(--alert-red)", text: "#FFFFFF" },
};

export const driverportalstatusOptions = [
  "Accepted",
  "On Route",
  "At Location",
  "At Waiting",
  "Extra Stop",
  "Ride Started",
  "Late Cancel",
  "No Show",
  "Completed",
];

export const SCHEDULED_SET = [
  "New",
  "Accepted",
  "On Route",
  "At Location",
  "At Waiting",
  "Extra Stop",
  "Ride Started",
  "Late Cancel",
  "No Show",
  "Completed",
  "Cancel",
];

export const sortList = [
  { label: "Date Descending", value: "date-desc" },
  { label: "Date Ascending", value: "date-asc" },
  { label: "Status Ascending", value: "status-asc" },
  { label: "Status Descending", value: "status-desc" },
]

export const STATIC_THEME_DATA = [
  {
    id: "theme-dark-1",
    name: "Dark Theme 1",
    colors: {
      bg: "#07384d",
      text: "#f1efef",
      primary: "#01f5fe",
      hover: "#003353",
      active: "#064f7c",
    },
  },
  {
    id: "theme-dark-2",
    name: "Dark Theme 2",
    colors: {
      bg: "#1e1e1e",
      text: "#f1efef",
      primary: "#ba090a",
      hover: "#930000",
      active: "#930000",
    },
  },
  {
    id: "theme-light-1",
    name: "Light Theme 1",
    colors: {
      bg: "#f5f9fa",
      text: "#1e1e1e",
      primary: "#a5d8dd",
      hover: "#a5d8dd",
      active: "#a5d8dd",
    },
  },
];

export const fonts = [
  { label: "Roboto", value: "roboto", css: "'Roboto', sans-serif" },
  { label: "Open Sans", value: "opensans", css: "'Open Sans', sans-serif" },
  { label: "Lato", value: "lato", css: "'Lato', sans-serif" },
  { label: "Poppins", value: "poppins", css: "'Poppins', sans-serif" },
];

export const shortcuts = [
  { key: "CTRL + D", label: "Driver allocation" },
  { key: "SHIFT + A", label: "Accepted" },
  { key: "SHIFT + O", label: "On Route" },
  { key: "SHIFT + L", label: "At Location" },
  { key: "SHIFT + N", label: "No Show" },
  { key: "CTRL + C", label: "Completed" },
  { key: "SHIFT + R", label: "Ride Started" },
  { key: "Enter", label: "View booking" },
  { key: "Shift + C", label: "Cancel booking" },
  { key: "Shift + D", label: "Delete booking", restricted: true },
  { key: "Shift + E", label: "Edit booking", restricted: true },
];

export const fields = [
  "Profile Picture",
  "Address",
  "D.O.B.",
  "Nationality",
  "Driving License",
  "Driving License Expiry",
  "Driving License Attachments",
  "Driver Taxi License",
  "Driver Taxi License Expiry",
  "Driver Taxi License Attachments",
  "Driver PCO Card",
  "Driver PCO Card Expiry",
  "NI Number",
  "Vehicle Make",
  "Vehicle Model",
  "Vehicle Color",
  "Vehicle Reg. No.",
  "Vehicle Insurance",
  "Vehicle Insurance Expiry",
  "Vehicle Insurance Attachments",
  "Vehicle Taxi License",
  "Vehicle Taxi License Expiry",
  "Vehicle Taxi License Attachments",
  "Vehicle Condition",
  "Vehicle Condition Expiry",
  "Vehicle Condition Attachments",
  "Car V5",
  "Car Picture (Front)",
];


export const BookingCalendarstatusColors = {
  New: {
    bgClass: "bg-[#3B82F6] text-(--white)",
    color: "#3B82F6"
  },
  Accepted: {
    bgClass: "bg-[#10B981] text-(--white)",
    color: "#10B981"
  },
  "On Route": {
    bgClass: "bg-[#F59E0B] text-(--white)",
    color: "#F59E0B"
  },
  "At Location": {
    bgClass: "bg-[#8B5CF6] text-(--white)",
    color: "#8B5CF6"
  },
  "Ride Started": {
    bgClass: "bg-[#06B6D4] text-(--white)",
    color: "#06B6D4"
  },
  "At Waiting": {
    bgClass: "bg-[#FDE68A] text-(--white)",
    color: "#92400E"
  },
  "Extra Stop": {
    bgClass: "bg-[#FEF9C3] text-(--white)",
    color: "#92400E"
  },
  Completed: {
    bgClass: "bg-[#22C55E] text-(--white)",
    color: "#22C55E"
  },
  "No Show": {
    bgClass: "bg-[#6B7280] text-(--white)",
    color: "#6B7280"
  },
  "Late Cancel": {
    bgClass: "bg-[#EF4444] text-(--white)",
    color: "#EF4444"
  },
  Cancel: {
    bgClass: "bg-[#DC2626] text-(--white)",
    color: "#DC2626"
  },
};

export const tabs = ["Active", "Pending", "Suspended", "Deleted"];

  export const allColumnKeys = [
    "statusDisplay",
    "bookingIdDisplay",
    "accountName",
    "tourManagerNameDisplay",
    "customerName",
    "passengerEmailDisplay",
    "passengerPhoneDisplay",
    "pickupDateDisplay",
    "pickupTimeDisplay",
    "pickupLocation",
    "dropoffLocation",
    "doorNumberDisplay",
    "arriveFromDisplay",
    "flightNumber",
    "vehicleType",
    "noOfPassenger",
    "childSeatsDisplay",
    "babySeatsDisplay",
    "childSeatsCountDisplay",
    "boosterSeatsDisplay",
    "luggageDisplay",
    "paymentMethodDisplay",
    "fareDisplay",
    "airportChargesDisplay",
    "waitingChargesDisplay",
    "meetAndGreetChargesDisplay",
    "totalDriverWagesDisplay",
    "companyCommissionDisplay",
    "TotalfareDisplay",
    "driverName",
    "actions",
  ];