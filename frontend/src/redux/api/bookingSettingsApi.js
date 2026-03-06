import { apiSlice } from "../slice/apiSlice";

export const bookingSettingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBookingSetting: builder.query({
      query: () => ({
        url: `/settings/get-booking-setting`,
        method: "GET",
      }),
      providesTags: ['BookingSetting'],
    }),

    getPublicBookingSetting: builder.query({
      query: (companyId) => ({
        url: `/settings/public/${companyId}`,
        method: "GET",
      }),
      providesTags: ['BookingSetting'],
    }),

    updateBookingSetting: builder.mutation({
      query: (formData) => ({
        url: `/settings/update-booking-setting`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['BookingSetting'],
    }),
    getAdvanceBookingMinutes: builder.mutation({
      query: (formData) => ({
        url: `/settings/advance-booking-minutes`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ['BookingSetting'],
    }),
  }),
});

export const {
  useGetBookingSettingQuery,
  useGetPublicBookingSettingQuery,
  useUpdateBookingSettingMutation,
} = bookingSettingsApi;