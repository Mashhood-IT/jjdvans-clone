import { apiSlice } from "../slice/apiSlice";

export const googleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    searchGooglePlaces: builder.query({
      query: (params) => ({
        url: "/google/autocomplete",
        method: "GET",
        params: typeof params === 'string' ? { input: params } : params,
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
      query: (companyId) => ({
        url: "/google/map-key",
        method: "GET",
        params: { companyId },
      }),
    }),
    geocode: builder.query({
      query: (params) => ({
        url: "/google/geocode",
        method: "GET",
        params: typeof params === 'string' ? { address: params } : params,
      }),
    }),

  }),
  overrideExisting: false,
});
export const {
  useSearchGooglePlacesQuery,
  useLazySearchGooglePlacesQuery,
  useGetDistanceQuery,
  useLazyGetDistanceQuery,
  useGetMapKeyQuery,
  useGeocodeQuery,
  useLazyGeocodeQuery,
} = googleApi;