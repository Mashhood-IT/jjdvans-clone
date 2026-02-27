import Icons from "../../../assets/icons";

const sidebarItems = [
  {
    title: "My Dashboard",
    icon: Icons.LayoutDashboard,
    route: "/dashboard/my-dashboard",
  },

  {
    title: "Booking Logs",
    icon: Icons.ScrollText,
    route: "/dashboard/bookings",
    subTabs: [
      {
        title: "Booking List",
        route: "/dashboard/bookings/list",
        icon: Icons.ListChecks,
      },
      {
        title: "New Booking",
        route: "/dashboard/bookings/new",
        icon: Icons.PlusCircle,
      },
      {
        title: "Booking Calendar",
        route: "/dashboard/bookings/calendar",
        icon: Icons.CalendarDays,
      },
      {
        title: "Booking Map",
        route: "/dashboard/bookings/map",
        icon: Icons.MapPin,
      },
    ],
  },

  {
    title: "Customer List",
    icon: Icons.Users,
    route: "/dashboard/user-profiles/customers/list",
  },

  {
    title: "View Company",
    icon: Icons.Building2,
    route: "/dashboard/view-company",
  },

  {
    title: "Pricing",
    icon: Icons.DollarSign,
    route: "/dashboard/pricing",

    subTabs: [
      {
        title: "General",
        route: "/dashboard/pricing/general",
        icon: Icons.Settings,
      },
      {
        title: "Vehicle Pricing",
        route: "/dashboard/pricing/vehicle",
        icon: Icons.Truck,
      },
      {
        title: "Distance Slab",
        route: "/dashboard/pricing/distance-slab",
        icon: Icons.Activity,
      },
    ],
  },

  {
    title: "Settings",
    icon: Icons.Settings,
    route: "/dashboard/settings",
    subTabs: [
      {
        title: "General",
        route: "/dashboard/settings/general",
        icon: Icons.Sliders,
      },
      {
        title: "Booking",
        route: "/dashboard/settings/booking",
        icon: Icons.Book,
      },
      {
        title: "Widget/API",
        icon: Icons.Code,
        route: "/dashboard/settings/widget-api",
      },
    ],
  },

  {
    title: "Profile",
    icon: Icons.User,
    route: "/dashboard/profile",
  },

  {
    title: "Logout",
    icon: Icons.LogOut,
    route: "/dashboard/logout",
  },
];

export default sidebarItems;
