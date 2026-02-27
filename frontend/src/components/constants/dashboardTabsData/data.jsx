import React from "react";
import Icons from "../../../assets/icons";
import IMAGES from "../../../assets/images";

export const itemsPerPageOptions = [1, 2, 3, 40, "All"];

export const homePageServices = [
  {
    icon: Icons.Plane,
    title: "Airport Transfers",
    desc: "Reliable and luxurious transport to and from all major airports, ensuring comfort and punctuality.",
    color: "from-sky-500/20 to-sky-800/10 border-sky-500/20",
  },
  {
    icon: Icons.Briefcase,
    title: "Corporate Chauffeur",
    desc: "Executive travel solutions for professionals who value discretion, style, and time-efficiency.",
    color: "from-teal-500/20 to-teal-800/10 border-teal-500/20",
  },
  {
    icon: Icons.CarFront,
    title: "Point to Point",
    desc: "Elegant and stress-free transportation for your special day, tailored to your wedding style and schedule.",
    color: "from-indigo-500/20 to-indigo-800/10 border-indigo-500/20",
  },
  {
    icon: Icons.Clock,
    title: "Hourly Hire",
    desc: "Book a private chauffeur by the hour for flexible, on-demand luxury travel throughout the day.",
    color: "from-cyan-500/20 to-cyan-800/10 border-cyan-500/20",
  },
  {
    icon: Icons.Star,
    title: "Luxury Fleet",
    desc: "Explore our premium range of luxury vehicles, designed to meet every comfort and style preference.",
    color: "from-purple-500/20 to-purple-800/10 border-purple-500/20",
  },
  {
    icon: Icons.Globe,
    title: "Global City Transfers",
    desc: "Seamless intercity travel across major global destinations — from New York to Dubai — with real-time AI route optimization.",
    color: "from-emerald-500/20 to-emerald-800/10 border-emerald-500/20",
  },
  {
    icon: Icons.ShieldCheck,
    title: "VIP Security Transport",
    desc: "Confidential and secure chauffeur-driven transfers for high-profile clients, integrating GPS-tracked safety protocols and AI surveillance routing.",
    color: "from-red-500/20 to-red-800/10 border-red-500/20",
  },
  {
    icon: Icons.MapPin,
    title: "Event & Conference Travel",
    desc: "Tailored mobility management for summits, conferences, and red-carpet events — ensuring punctual group arrivals with luxury coordination.",
    color: "from-orange-500/20 to-orange-800/10 border-orange-500/20",
  },
  {
    icon: Icons.Smartphone,
    title: "On-Demand Dispatch",
    desc: "Book instantly through the MTL AI App — experience predictive booking, dynamic fleet allocation, and real-time driver intelligence.",
    color: "from-pink-500/20 to-pink-800/10 border-pink-500/20",
  },
];

export const actionMenuItems = [
  "View",
  "Edit",
  "Delete",
  "Completed",
  "Copy Booking",
  "Status Audit",
];

export const columnLabels = {
  bookingId: "Booking ID",
  bookingType: "Booking Type",
  pickUp: "Pickup Location",
  dropOff: "Dropoff Location",
  flightNumber: "Flight Number",
  flightOrigin: "Flight Origin",
  flightDestination: "Flight Destination",
  flightArrivalScheduled: "Flight Arrival Scheduled",
  flightArrivalEstimated: "Flight Arrival Estimated",
  journeyFare: "Journey Fare",
  returnJourneyFare: "Return Journey Fare",
  driverFare: "Driver Fare",
  returnDriverFare: "Return Driver Fare",
  createdAt: "Created At",
  passenger: "Passenger",
  date: "Date",
  driver: "Driver",
  vehicle: "Vehicle",
  payment: "Payment",
  status: "Status",
  actions: "Actions",
};

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

export const invoicesData = [
  {
    invoiceNo: "INV-00001",
    customer: "Erin Leahy",
    account: "Account 1",
    date: "04-01-2023",
    dueDate: "11-01-2023",
    amount: "92.00",
    status: "Paid",
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
    ],
    subtotal: "92.00",
    discount: "0.00",
    deposit: "0.00",
    balanceDue: "92.00",
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
  {
    invoiceNo: "INV-00002",
    customer: "Peter Griffiths",
    account: "Account 2",
    date: "05-01-2023",
    dueDate: "12-01-2023",
    amount: "110.00",
    status: "Unpaid",
    email: "peter.griffiths@example.com",
    phone: "+447955123456",
    rides: [
      {
        number: "2212649",
        passenger: "Peter Griffiths",
        pickup: "Tring Station Car Park, Hertfordshire",
        drop: "London Coliseum, St Martin",
        datetime: "27-12-2022 11:00",
        amount: "110.00",
        tax: "0%",
      },
    ],
    subtotal: "110.00",
    discount: "0.00",
    deposit: "0.00",
    balanceDue: "110.00",
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
  {
    invoiceNo: "INV-00001",
    customer: "Erin Leahy",
    account: "Account 1",
    date: "04-01-2023",
    dueDate: "11-01-2023",
    amount: "92.00",
    status: "Paid",
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
    ],
    subtotal: "92.00",
    discount: "0.00",
    deposit: "0.00",
    balanceDue: "92.00",
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
  {
    invoiceNo: "INV-00002",
    customer: "Peter Griffiths",
    account: "Account 2",
    date: "05-01-2023",
    dueDate: "12-01-2023",
    amount: "110.00",
    status: "Unpaid",
    email: "peter.griffiths@example.com",
    phone: "+447955123456",
    rides: [
      {
        number: "2212649",
        passenger: "Peter Griffiths",
        pickup: "Tring Station Car Park, Hertfordshire",
        drop: "London Coliseum, St Martin",
        datetime: "27-12-2022 11:00",
        amount: "110.00",
        tax: "0%",
      },
    ],
    subtotal: "110.00",
    discount: "0.00",
    deposit: "0.00",
    balanceDue: "110.00",
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
  {
    invoiceNo: "INV-00001",
    customer: "Erin Leahy",
    account: "Account 1",
    date: "04-01-2023",
    dueDate: "11-01-2023",
    amount: "92.00",
    status: "Paid",
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
    ],
    subtotal: "92.00",
    discount: "0.00",
    deposit: "0.00",
    balanceDue: "92.00",
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
  {
    invoiceNo: "INV-00002",
    customer: "Peter Griffiths",
    account: "Account 2",
    date: "05-01-2023",
    dueDate: "12-01-2023",
    amount: "110.00",
    status: "Unpaid",
    email: "peter.griffiths@example.com",
    phone: "+447955123456",
    rides: [
      {
        number: "2212649",
        passenger: "Peter Griffiths",
        pickup: "Tring Station Car Park, Hertfordshire",
        drop: "London Coliseum, St Martin",
        datetime: "27-12-2022 11:00",
        amount: "110.00",
        tax: "0%",
      },
    ],
    subtotal: "110.00",
    discount: "0.00",
    deposit: "0.00",
    balanceDue: "110.00",
    company: {
      name: "Mega Transfers Limited",
      address: "29 Minerva Road, London, NW10 6HJ",
      vat: "442612419",
      phone: "+442089611818",
      email: "bookings@megatransfers.co.uk",
    },
  },
];

export const statementsData = [
  {
    driver: "0233 Hassan Butt",
    email: "hassanbutt@example.com",
    period: "03-03-2025 to 09-03-2025",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "96.00 GBP",
    due: "96.00 GBP",
    paid: "96.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "1 Usman",
    email: "usman@example.com",
    period: "21-10-2024 to 27-10-2024",
    bookings: 6,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "1297.00 GBP",
    due: "1297.00 GBP",
    paid: "1297.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "10 Aftab Khan",
    email: "aftabkhan@example.com",
    period: "13-05-2024 to 19-05-2024",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "190.00 GBP",
    due: "190.00 GBP",
    paid: "190.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "104 Abbas",
    email: "abbas@example.com",
    period: "17-07-2023 to 23-07-2023",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "146.00 GBP",
    due: "146.00 GBP",
    paid: "146.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "105 Raj Bagga",
    email: "rajbagga@example.com",
    period: "29-05-2023 to 04-06-2023",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "126.00 GBP",
    due: "126.00 GBP",
    paid: "126.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "0233 Hassan Butt",
    email: "hassanbutt@example.com",
    period: "03-03-2025 to 09-03-2025",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "96.00 GBP",
    due: "96.00 GBP",
    paid: "96.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "1 Usman",
    email: "usman@example.com",
    period: "21-10-2024 to 27-10-2024",
    bookings: 6,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "1297.00 GBP",
    due: "1297.00 GBP",
    paid: "1297.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "10 Aftab Khan",
    email: "aftabkhan@example.com",
    period: "13-05-2024 to 19-05-2024",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "190.00 GBP",
    due: "190.00 GBP",
    paid: "190.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "104 Abbas",
    email: "abbas@example.com",
    period: "17-07-2023 to 23-07-2023",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "146.00 GBP",
    due: "146.00 GBP",
    paid: "146.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "105 Raj Bagga",
    email: "rajbagga@example.com",
    period: "29-05-2023 to 04-06-2023",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "126.00 GBP",
    due: "126.00 GBP",
    paid: "126.00 GBP",
    received: "0 GBP",
  },
  {
    driver: "0101 SC",
    email: "sc@example.com",
    period: "01-04-2025 to 05-04-2025",
    bookings: 1,
    payments: 1,
    cashCollected: "0.00 GBP",
    fare: "97.50 GBP",
    due: "97.50 GBP",
    paid: "0.00 GBP",
    received: "0 GBP",
  },
];

export const statementsPayment = {
  Pending: [
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 Mohammad Mushtaq",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "398.50",
    },
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 Mohammad Mushtaq",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "398.50",
    },
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 Mohammad Mushtaq",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "398.50",
    },
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 Mohammad Mushtaq",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "398.50",
    },
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 Mohammad Mushtaq",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "398.50",
    },
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 amir Mushtaq",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "kareem",
      amount: "398.50",
    },
  ],
  Completed: [
    {
      id: 1668,
      driver: "90 Khalid Zaman",
      statement: "24/Mar/2025 - 30/Mar/2025",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "138.00",
    },
    {
      id: 1665,
      driver: "3 Mohammad Mushtaq",
      statement: "09/Mar/2025 - 30/Mar/2025",
      title: "Payment for statement 17-03-2025 to 23-03-2025",
      type: "Debit",
      amount: "398.50",
    },
  ],
  Deleted: [],
};

export const companyAccountsData = [
  {
    company: "RBS Company",
    email: "helan@negup.com",
    phone: "+444578415263",
    website: "https://www.megatransfers.com/",
    address: "Address 1, Address 1",
    city: "Test City",
    state: "",
    postcode: "859652",
    country: "United Kingdom",
    primaryContact: "Test Account",
    designation: "Director",
    tax: "None",
    locationsDisplay: "Yes",
    paymentOptionsBooking: "Cash,Card,Invoice",
    paymentOptionsInvoice: "Cash",
    invoiceDueDays: "1",
    invoiceTerms: "",
    passphrase: "",
    status: "Active",
    created: "2025-04-01",
  },
  {
    company: "Mega Transfers Limited",
    logo: IMAGES.profileimg,
    primaryContact: "+442089611818 (+447930844247)",
    email: "admin@megatransfers.co.uk",
    phone: "+442089611818",
    due: "0.00",
    created: "2024-09-02 06:58:51",
    status: "Pending",
  },
  {
    company: "London City Travels",
    logo: IMAGES.profileimg,
    primaryContact: "Test (Director)",
    email: "test.customer@cabcher.com",
    phone: "+44123456765432",
    due: "0.00",
    created: "2024-09-16 13:41:46",
    status: "Verified",
  },
  {
    company: "SkyLine Tours",
    logo: IMAGES.profileimg,
    primaryContact: "Nadia Khan",
    email: "nadia@skyline.com",
    phone: "+447700900111",
    due: "55.00",
    created: "2024-08-25 12:15:00",
    status: "Suspended",
  },
  {
    company: "Fast Wheels Travel",
    logo: IMAGES.profileimg,
    primaryContact: "Imran Hashmi",
    email: "imran@fastwheels.com",
    phone: "+447855331122",
    due: "120.00",
    created: "2024-07-19 18:05:30",
    status: "Finished",
  },
  {
    company: "Bright Move Co.",
    logo: IMAGES.profileimg,
    primaryContact: "Zara Mirza",
    email: "zara@brightmove.com",
    phone: "+447841123456",
    due: "0.00",
    created: "2024-09-01 11:00:00",
    status: "Delete Pending",
  },
  {
    company: "Capital Cars Ltd.",
    logo: IMAGES.profileimg,
    primaryContact: "Haris Naveed",
    email: "haris@capitalcars.com",
    phone: "+447980998877",
    due: "0.00",
    created: "2024-08-11 09:00:00",
    status: "Active",
  },
  {
    company: "Alpha Executive Rides",
    logo: IMAGES.profileimg,
    primaryContact: "Faizan Sheikh",
    email: "faizan@alphaexec.com",
    phone: "+447911000222",
    due: "75.50",
    created: "2024-08-05 14:45:00",
    status: "Verified",
  },
  {
    company: "Royal Airport Transfers",
    logo: IMAGES.profileimg,
    primaryContact: "Sana Khalid",
    email: "sana@royaltransfers.com",
    phone: "+447900334455",
    due: "10.00",
    created: "2024-08-12 07:30:00",
    status: "Pending",
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

export const hourlyData = [
  {
    distance: 40,
    hours: 4,
    standardSaloon: 160,
    executiveSaloon: 200,
    vipSaloon: 280,
    luxuryMpv: 280,
    passengerMpv: 300,
  },
  {
    distance: 60,
    hours: 6,
    standardSaloon: 240,
    executiveSaloon: 300,
    vipSaloon: 420,
    luxuryMpv: 420,
    passengerMpv: 450,
  },
  {
    distance: 80,
    hours: 8,
    standardSaloon: 320,
    executiveSaloon: 400,
    vipSaloon: 560,
    luxuryMpv: 560,
    passengerMpv: 600,
  },
  {
    distance: 100,
    hours: 10,
    standardSaloon: 400,
    executiveSaloon: 500,
    vipSaloon: 700,
    luxuryMpv: 700,
    passengerMpv: 750,
  },
];

export const distanceslabData = [
  {
    start: 0,
    end: 0,
    standard: 60,
    executive: 70,
    vip: 80,
    luxury: 80,
    passenger: 80,
  },
  {
    start: 0,
    end: 10,
    standard: 2,
    executive: 3,
    vip: 4,
    luxury: 5,
    passenger: 5,
  },
  {
    start: 10,
    end: 20,
    standard: 2.5,
    executive: 3.5,
    vip: 4.5,
    luxury: 5.5,
    passenger: 5.75,
  },
  {
    start: 20,
    end: 1000,
    standard: 2.25,
    executive: 3.25,
    vip: 3.75,
    luxury: 3.75,
    passenger: 4,
  },
  {
    start: 0,
    end: 0,
    standard: 60,
    executive: 70,
    vip: 80,
    luxury: 80,
    passenger: 80,
  },
  {
    start: 0,
    end: 10,
    standard: 2,
    executive: 3,
    vip: 4,
    luxury: 5,
    passenger: 5,
  },
  {
    start: 10,
    end: 20,
    standard: 2.5,
    executive: 3.5,
    vip: 4.5,
    luxury: 5.5,
    passenger: 5.75,
  },
  {
    start: 20,
    end: 1000,
    standard: 2.25,
    executive: 3.25,
    vip: 3.75,
    luxury: 3.75,
    passenger: 4,
  },
];

export const driverfarebData = [
  {
    start: 0,
    end: 0,
    standard: 60,
    executive: 70,
    vip: 80,
    luxury: 80,
    passenger: 80,
  },
];

export const congestionchargesData = [
  {
    caption: "Parking",
    locations: "RH6, TW6",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    fromTime: "00:00",
    toTime: "23:55",
    category: "Surcharge",
    priceType: "Amount",
    price: 10.0,
  },
];

export const surchargeDateData = [
  {
    caption: "New Years Day",
    recurring: "Yearly",
    fromDate: "01-Jan 00:00",
    toDate: "01-Jan 23:55",
    category: "Surcharge",
    priceType: "Percentage",
    price: 50,
    status: "Active",
  },
  {
    caption: "New Years Day",
    recurring: "Yearly",
    fromDate: "01-Jan 00:00",
    toDate: "01-Jan 23:55",
    category: "Surcharge",
    priceType: "Percentage",
    price: 50,
    status: "Active",
  },
];

export const surchargeLocationData = [
  {
    locationType: "Pickup",
    location: "W1A 1AA",
    category: "Surcharge",
    priceType: "Amount",
    price: 5.0,
  },
  {
    locationType: "Dropoff",
    location: "EC2V 7HH",
    category: "Discount",
    priceType: "Percentage",
    price: 10.0,
  },
  {
    locationType: "Both",
    location: "Manchester Zone 3",
    category: "Surcharge",
    priceType: "Amount",
    price: 7.5,
  },
  {
    locationType: "Pickup",
    location: "Birmingham B1",
    category: "Discount",
    priceType: "Percentage",
    price: 15.0,
  },
  {
    locationType: "Dropoff",
    location: "Leeds LS1",
    category: "Surcharge",
    priceType: "Amount",
    price: 4.25,
  },
];

export const vouchersData = [
  {
    voucher: "First100",
    quantity: 100,
    applicable: "All Users",
    discountType: "Percentage",
    discountValue: 10.0,
    validity: "2024-10-31T10:40",
    applied: 1,
    used: 0,
    status: "Expired",
  },
  {
    voucher: "First10",
    quantity: 100,
    applicable: "All Users",
    discountType: "Percentage",
    discountValue: 10.0,
    validity: "2023-04-30T21:55",
    applied: 1,
    used: 0,
    status: "Deleted",
  },
  {
    voucher: "ILFORD10",
    quantity: 10,
    applicable: "All Users",
    discountType: "Percentage",
    discountValue: 10.0,
    validity: "2023-06-30T09:55",
    applied: 1,
    used: 0,
    status: "Deleted",
  },
  {
    voucher: "test1",
    quantity: 1,
    applicable: "All Users",
    discountType: "Amount",
    discountValue: 140.0,
    validity: "2023-07-31T13:05",
    applied: 1,
    used: 1,
    status: "Deleted",
  },
  {
    voucher: "BLDiscount10",
    quantity: 100,
    applicable: "All Users",
    discountType: "Percentage",
    discountValue: 10.0,
    validity: "2024-06-30T22:35",
    applied: 1,
    used: 0,
    status: "Deleted",
  },
];

export const locationCategoryData = [
  {
    category: "Airport",
    locations: 16,
  },
  {
    category: "Airport",
    locations: 16,
  },
  {
    category: "Airport",
    locations: 16,
  },
];

export const locationsData = [
  {
    category: "Airport",
    name: "Birmingham International Airport (BHX)",
    latLng: "52.45389938,-1.748029947",
  },
  {
    category: "Airport",
    name: "Bristol Airport (BRS)",
    latLng: "51.382702,-2.71909",
  },
  {
    category: "Airport",
    name: "London City Airport (LCY)",
    latLng: "51.505299,0.055278",
  },
  {
    category: "Airport",
    name: "London Gatwick Airport (LGW), North Terminal",
    latLng: "51.16027,-0.175015",
  },
  {
    category: "Airport",
    name: "London Gatwick Airport (LGW), South Terminal",
    latLng: "51.156669,-0.159695",
  },
  {
    category: "Airport",
    name: "London Heathrow Airport (LHR), Terminal 1",
    latLng: "51.472324,-0.452892",
  },
  {
    category: "Airport",
    name: "London Heathrow Airport (LHR), Terminal 2",
    latLng: "51.46978,-0.45333",
  },
  {
    category: "Airport",
    name: "London Heathrow Airport (LHR), Terminal 3",
    latLng: "51.471497,-0.456631",
  },
  {
    category: "Airport",
    name: "London Heathrow Airport (LHR), Terminal 4",
    latLng: "51.459183,-0.4462",
  },
  {
    category: "Airport",
    name: "London Heathrow Airport (LHR), Terminal 5",
    latLng: "51.471555,-0.489575",
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