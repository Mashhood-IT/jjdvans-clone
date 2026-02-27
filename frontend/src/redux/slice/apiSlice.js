import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    // Unified relative path: uses Vite Proxy locally and Netlify Proxy in production.
    // This makes the API appear "same-domain", solving the 3rd-party cookie blocking issue.
    baseUrl: `/api`,
    credentials: 'include'
  }),
  tagTypes: ["User", "Bookings", "Vehicles"],
  endpoints: () => ({}),
});