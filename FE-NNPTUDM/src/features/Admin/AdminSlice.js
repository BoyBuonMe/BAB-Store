import {
  getAllUsers,
  getTotalQuantity,
} from "@/services/Admin/AdminService";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
  totalQuantity: {},
};

export const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(getTotalQuantity.fulfilled, (state, action) => {
        state.totalQuantity = action.payload;
      });
  },
});

export const { reducerPath } = adminSlice;
export default adminSlice.reducer;
