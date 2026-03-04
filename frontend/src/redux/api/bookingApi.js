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
    getBookingById: builder.query({
      query: (id) => ({
        url: `/booking/${id}`,
        method: "GET",
      }),
      transformResponse: (response) => response.booking,
      providesTags: (result, error, id) => [{ type: "Bookings", id }],
    }),
    updateBooking: builder.mutation({
      query: ({ id, ...updateData }) => ({
        url: `/booking/${id}`,
        method: "PATCH",
        body: updateData,
      }),
      invalidatesTags: ["Bookings"],
    }),
    deleteBooking: builder.mutation({
      query: (id) => ({
        url: `/booking/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Bookings"],
    }),
    sendBookingEmail: builder.mutation({
      query: ({ bookingId, email, type = "confirmation" }) => ({
        url: "/booking/send-booking-email",
        method: "POST",
        body: { bookingId, email, type },
      }),
    }),
  })
})

export const {
  useGetAllBookingsQuery,
  useGetBookingByIdQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
  useSendBookingEmailMutation
} = bookingApi