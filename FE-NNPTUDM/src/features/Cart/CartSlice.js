import { getMyCart } from "@/services/Cart/CartService";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  cart: null,
  loading: false,
  error: null,
};

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      // GET CART
      .addCase(getMyCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(getMyCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ❗ Không cần handle update/remove fulfilled nữa
    // vì mình đã gọi lại getMyCart rồi
  },
});

export const { reducerPath } = cartSlice;
export default cartSlice.reducer;