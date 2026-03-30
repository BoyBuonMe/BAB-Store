import {
  getAllProducts,
  getBrands,
  getCategories,
} from "@/services/Product/ProductService";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  categories: [],
  brands: [],
};

export const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      .addCase(getCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(getBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      });
  },
});

export const { reducerPath } = productSlice;
export default productSlice.reducer;

