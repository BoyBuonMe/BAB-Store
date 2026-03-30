import http from "@/utils/http";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getMyCart, removeCartItem } from "../Cart/CartService";

// Tạo order rồi xóa cartItems đã thanh toán
export const checkoutOrder = createAsyncThunk(
  "order/checkoutOrder",
  async (payload, { rejectWithValue, dispatch }) => {
    
    try {
      
      // 1. Tạo order
      const response = await http.post("order/create", payload);

      // 2. Lấy ra cartItemIds từ payload
      const cartItemIds = payload.items
        ?.map((item) => item.cartItemId)
        ?.filter(Boolean);

      // 3. Xóa cartItems đã mua khỏi giỏ
      if (cartItemIds?.length > 0) {
        dispatch(removeCartItem(cartItemIds));
      }

      // 4. Gọi lại giỏ hàng
      dispatch(getMyCart());

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Có lỗi xảy ra",
      );
    }
  },
);

export const getMyOrder = createAsyncThunk("order/get-my-order", async () => {
  try {
    const response = await http.get("order/my-orders");
    return response.data;
  } catch (error) {
    console.log(error);
  }
})