import { createSlice } from "@reduxjs/toolkit";

const userFromStorage = localStorage.getItem("userData")
  ? JSON.parse(localStorage.getItem("userData"))
  : null;

const initialState = {
    status: !!userFromStorage,
    userData: userFromStorage
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true,
            state.userData = action.payload.userData
        },
        logout: (state) => {
            state.status = false,
            state.userData = null
            localStorage.removeItem("token");
            localStorage.removeItem("userData");
        },
        updateUser: (state, action) => {
            state.userData = {
                ...state.userData,
                ...action.payload
            }
        }
    }
});

export const {login, logout, updateUser} = authSlice.actions;

export default authSlice.reducer;