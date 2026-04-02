import http from "@/utils/http";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllUsers = createAsyncThunk("admin/get-users", async () => {
    const response = await http.get("admin/get-users");
    return response;
})

export const getTotalQuantity = createAsyncThunk("admin/get-totalQuantity", async () => {
    const response = await http.get("admin/get-quantity");
    return response;
})

export const deleteUser = async (id) => {
    const response = await http.del("admin/delete-user", {id});
    return response;
}

export const updateUser = async (id, payload) => {
  try {
    const response = await http.put(`admin/update-user/${id}`, payload);
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

export const createProduct = async (payload) => {
  console.log(payload);
  
  try {
    const response = await http.post("admin/create-product", payload);
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
}

export const updateProduct = async (payload) => {
  try {
    const response = await http.post("admin/update-product", payload);
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
}

export const deleteProduct = async (id) => {
  try {
    const response = await http.del("admin/delete-product", {id});
    return response.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
}

/** @param {{ page?: number; limit?: number; status?: string; search?: string }} params */
export const getAdminOrders = async (params = {}) => {
  const sp = new URLSearchParams();
  sp.set("page", String(params.page ?? 1));
  sp.set("limit", String(params.limit ?? 10));
  if (params.status) sp.set("status", params.status);
  if (params.search) sp.set("search", params.search);
  return http.get(`admin/orders?${sp.toString()}`);
};

export const getAdminOrderDetail = async (id) => {
  return http.get(`admin/orders/${id}`);
};

export const patchAdminOrderStatus = async (id, status) => {
  return http.patch(`admin/orders/${id}/status`, { status });
};