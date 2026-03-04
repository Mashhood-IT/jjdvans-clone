import { apiSlice } from "../slice/apiSlice";

export const bookingSettingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBookingSetting: builder.query({
      query: () => ({
        url: `/booking-settings/get-booking-setting`,
        method: "GET",
      }),
      providesTags: ['BookingSetting'],
    }),

    updateBookingSetting: builder.mutation({
      query: (formData) => ({
        url: `/booking-settings/update-booking-setting`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['BookingSetting'],
    }),
  }),
});

export const {
  useGetBookingSettingQuery,
  useUpdateBookingSettingMutation,
} = bookingSettingsApi;