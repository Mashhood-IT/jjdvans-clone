import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_BASE_URL_BACKEND}/api`
  }),
  tagTypes: ["User", "Bookings", "Vehicles"],
  endpoints: () => ({}),
});