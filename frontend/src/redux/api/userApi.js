import { apiSlice } from "../slice/apiSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    loginUser: builder.mutation({
      query: ({ email, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: { email, password },
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    resendLoginOtp: builder.mutation({
      query: ({ userId }) => ({
        url: "/auth/resend-otp",
        method: "POST",
        body: { userId },
      }),
    }),
    sendForgotPasswordOtp: builder.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ email, otp, newPassword }) => ({
        url: "/auth/new-password",
        method: "POST",
        body: { email, otp, newPassword },
      }),
    }),
    updateUserProfile: builder.mutation({
      query: (formData) => ({
        url: "/auth/profile",
        method: "PUT",
        body: formData,
        formData: true,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    getSuperadminInfo: builder.query({
      query: () => ({
        url: "/auth/superadmin-info",
        method: "GET",
      }),
    }),
    getCurrentUser: builder.query({
      query: () => ({
        url: "/auth/me",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["User"],
    }),
    logoutUser: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        credentials: "include",
      }),
    }),
  }),
});
export const {
  useLoginUserMutation,
  useSendForgotPasswordOtpMutation,
  useResetPasswordMutation,
  useUpdateUserProfileMutation,
  useGetSuperadminInfoQuery,
  useGetCurrentUserQuery,
  useLogoutUserMutation,
  useVerifyLoginOtpMutation,
  useResendLoginOtpMutation,
} = userApi;