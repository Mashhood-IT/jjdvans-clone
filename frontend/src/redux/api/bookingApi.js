import { apiSlice } from "../slice/apiSlice";

export const bookingApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: "/booking/create-booking",
        method: "POST",
        body: bookingData,
      }),
      invalidatesTags: ["Bookings"],
    }),
    getAllBookings: builder.query({
      query: () => ({
        url: "/booking/get-all-bookings",
        method: "GET",
      }),
      transformResponse: (response) => response.bookings || [],
      providesTags: ["Bookings"],
    }),
    updateBookingStatus: builder.mutation({
      query: ({ id, status, updatedBy }) => ({
        url: `/booking/${id}`,
        method: "PATCH",
        body: { status, updatedBy },
      }),
    }),
  })
})

export const { useGetAllBookingsQuery, useCreateBookingMutation, useUpdateBookingStatusMutation } = bookingApi