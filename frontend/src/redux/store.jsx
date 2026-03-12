import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import { apiSlice } from "./slice/apiSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});