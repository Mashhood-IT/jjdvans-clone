import { apiSlice } from "../slice/apiSlice";

export const googleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchGooglePlaces: builder.query({
      query: (input) => ({
        url: "/google/autocomplete",
        method: "GET",
        params: { input },
      }),
    }),
    getDistance: builder.query({
      query: ({ origin, destination, avoid, companyId }) => {
        const params = { origin, destination, companyId };
        if (avoid && avoid.trim() !== '') params.avoid = avoid;
        return { url: "/google/distance", method: "GET", params };
      },
    }),
    getMapKey: builder.query({
      query: () => ({
        url: "/google/map-key",
        method: "GET",
      }),
    }),
    searchPostcodeSuggestions: builder.query({
      query: (input) => ({
        url: "/google/postcode-suggestions",
        method: "GET",
        params: { input },
      }),
    }),
    geocode: builder.query({
      query: (address) => ({
        url: "/google/geocode",
        method: "GET",
        params: { address },
      }),
    }),
    sendGoogleAuthLink: builder.mutation({
      query: ({ email, role }) => ({
        url: "/google/send-google-auth-link",
        method: "POST",
        body: { email, role },
      }),
    }),
  }),
  overrideExisting: false,
});
export const {
  useSendGoogleAuthLinkMutation,
  useSearchGooglePlacesQuery,
  useLazySearchGooglePlacesQuery,
  useGetDistanceQuery,
  useLazyGetDistanceQuery,
  useGetMapKeyQuery,
  useSearchPostcodeSuggestionsQuery,
  useLazySearchPostcodeSuggestionsQuery,
  useGeocodeQuery,
  useLazyGeocodeQuery,
} = googleApi;