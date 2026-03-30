import http from "@/utils/http";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productVariantId, quantity }, { rejectWithValue, dispatch }) => {
    
    try {
      const response = await http.post("cart/add", {
        productVariantId,
        quantity,
      });

      dispatch(getMyCart());

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMyCart = createAsyncThunk(
  "cart/fetchMyCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await http.get("cart/my-cart");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateCartItemQuantity",
  async ({ cartItemId, quantity }, { rejectWithValue, dispatch }) => {
    try {
      await http.patch(`cart/update`, { cartItemId, quantity });

      dispatch(getMyCart());

      return { cartItemId, quantity };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);

// REMOVE ITEM
export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (cartItemId, { rejectWithValue, dispatch }) => {
    try {
      await http.del(`cart/delete`, {cartItemId});

      dispatch(getMyCart());

      return cartItemId;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  },
);
