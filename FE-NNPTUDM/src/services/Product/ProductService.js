import http from "@/utils/http";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllProducts = createAsyncThunk("product/get-products", async () => {
    const response = await http.get(`product/products`);
    return response;
});

export const getCategories = createAsyncThunk("product/get-categories", async () => {
    const categories = await http.get("product/categories");
    return categories;
});

export const getBrands = createAsyncThunk("product/get-brands", async () => {
    const brands = await http.get("product/brands");
    return brands;
});