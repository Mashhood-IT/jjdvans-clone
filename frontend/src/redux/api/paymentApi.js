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
    }),
    overrideExisting: false,
});

export const { useCreatePaymentIntentMutation } = paymentApi;
