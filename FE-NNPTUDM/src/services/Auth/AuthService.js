import http from "@/utils/http";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const register = async (data) => {
  // tạo avatar từ username hoặc email
  const seed = data.username || data.email;

  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

  // gắn avatar vào data gửi lên backend
  const payload = {
    ...data,
    avatar,
  };

  const response = await http.post("auth/register", payload);

  localStorage.setItem("accessToken", response.userTokens.accessToken);
  localStorage.setItem("refreshToken", response.userTokens.refreshToken);

  return response;
};

export const login = async (data) => {
  const { accessToken, refreshToken } = await http.post("auth/login", data);
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);

  return { accessToken, refreshToken };
};

export const logout = async () => {
  const refreshToken = localStorage.getItem("refreshToken");
  return await http.post("auth/logout", {
    refreshToken,
  });
};

export const setUser = createAsyncThunk("auth/set-user", async () => {
  const user = await http.get("auth/me");
  return user;
});
