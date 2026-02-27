import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  companyId: localStorage.getItem("companyId") || null,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      const userData = action.payload;
      state.user = userData;
      if (userData?.companyId) {
        localStorage.setItem("companyId", userData.companyId);
        state.companyId = userData.companyId;
      } else {
        localStorage.removeItem("companyId");
        state.companyId = null;
      }
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    clearUser(state) {
      state.user = null;
      state.companyId = null;
      localStorage.removeItem("companyId");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

    updateUserPermissions(state, action) {
      if (state.user) {
        state.user.permissions = action.payload.permissions;
      }
    },
  },
});
export const { setUser, clearUser, updateUserPermissions } = authSlice.actions;
export default authSlice.reducer;