import { checkoutOrder, getMyOrder } from "@/services/Order/OrderService";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: "",
};

export const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(checkoutOrder.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkoutOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(checkoutOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = action.payload;
      })
      .addCase(getMyOrder.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.isError = false;
        state.message = "";
      })
      .addCase(getMyOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.isError = false;
        state.currentOrder = action.payload;
      })
      .addCase(getMyOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.isError = true;
        state.message = action.payload || "Lấy danh sách đơn hàng thất bại";
      });
  },
});

export const { reducerPath } = orderSlice;
export default orderSlice.reducer;
