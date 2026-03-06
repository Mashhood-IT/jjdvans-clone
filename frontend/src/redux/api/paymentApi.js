import { apiSlice } from "../slice/apiSlice";

export const paymentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createPaymentIntent: builder.mutation({
            query: (data) => ({
                url: "/payment/create-intent",
                method: "POST",
                body: data,
            }),
        }),
        getPayPalConfig: builder.query({
            query: (companyId) => `/payment/paypal-config?companyId=${companyId}`,
        }),
        createPayPalOrder: builder.mutation({
            query: (data) => ({
                url: "/payment/paypal-create-order",
                method: "POST",
                body: data,
            }),
        }),
        capturePayPalOrder: builder.mutation({
            query: (data) => ({
                url: "/payment/paypal-capture-order",
                method: "POST",
                body: data,
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useCreatePaymentIntentMutation,
    useGetPayPalConfigQuery,
    useCreatePayPalOrderMutation,
    useCapturePayPalOrderMutation
} = paymentApi;
