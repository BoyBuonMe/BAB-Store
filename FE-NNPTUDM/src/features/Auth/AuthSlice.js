import { setUser } from "@/services/Auth/AuthService";

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: {},
  loading: true,
};

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.loading = false;
        },
        logout: (state) => {
            state.user = null;
            state.loading = false;
        }
    },

    extraReducers: builder => {
        builder.addCase(setUser.fulfilled, (state, action) => {
            state.user = action.payload;
            state.loading = false;
        })
    }
})

export const { reducerPath } = authSlice;
export const { logout } = authSlice.actions;
export default authSlice.reducer;