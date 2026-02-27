import { apiSlice } from "../slice/apiSlice";

export const vehicleApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllVehicles: builder.query({
      query: () => ({
        url: `/pricing/get-all-vehicles`,
        method: 'GET',
      }),
      transformResponse: (response) => {
        return response.data || response;
      },
      providesTags: ['Vehicles'],
    }),

    getPublicVehicles: builder.query({
      query: () => ({
        url: `/pricing/vehicles/public`,
        method: 'GET',
      }),
      transformResponse: (response) => {
        return response.vehicles || response.data || [];
      },
      providesTags: ['Vehicles'],
    }),

    getVehicleById: builder.query({
      query: (id) => `/pricing/vehicles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Vehicles', id }],
    }),

    createVehicle: builder.mutation({
      query: (vehicleData) => ({
        url: '/pricing/create-vehicle',
        method: 'POST',
        body: vehicleData,
      }),
      invalidatesTags: ['Vehicles'],
    }),

    updateVehicle: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/pricing/update-vehicle/${id}`,
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: ['Vehicles'],
    }),

    deleteVehicle: builder.mutation({
      query: (id) => ({
        url: `/pricing/delete-vehicle/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Vehicles'],
    }),

    uploadVehicleImage: builder.mutation({
      query: ({ vehicleId, image }) => {
        const formData = new FormData();
        formData.append('image', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || `vehicle_${Date.now()}.jpg`,
        });

        return {
          url: `/pricing/vehicles/${vehicleId}/upload-image`,
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      },
      invalidatesTags: (result, error, { vehicleId }) => [
        'Vehicles',
        { type: 'Vehicles', id: vehicleId },
      ],
    }),

    getAvailableVehicles: builder.query({
      query: ({ passengers, luggage, dateTime }) => ({
        url: `/pricing/vehicles/available`,
        method: 'GET',
        params: {
          passengers,
          luggage,
          dateTime,
        },
      }),
    }),

    getVehicleCategories: builder.query({
      query: () => ({
        url: `/pricing/vehicles/categories`,
        method: 'GET',
      }),
    }),

    getVehiclePricing: builder.query({
      query: ({ vehicleId, distance, duration }) => ({
        url: `/pricing/vehicles/${vehicleId}/calculate-fare`,
        method: 'POST',
        body: { distance, duration },
      }),
    }),
  }),
});

export const {
  useGetAllVehiclesQuery,
  useGetPublicVehiclesQuery,
  useGetVehicleByIdQuery,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
  useUploadVehicleImageMutation,
  useGetAvailableVehiclesQuery,
  useGetVehicleCategoriesQuery,
  useGetVehiclePricingQuery,
  useLazyGetAvailableVehiclesQuery,
  useLazyGetVehiclePricingQuery,
} = vehicleApi;