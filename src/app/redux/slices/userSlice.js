import { createSlice } from "@reduxjs/toolkit";

let cookieData = null;

// Check if we're in the browser
if (typeof window !== "undefined") {
  const storedData = localStorage.getItem("user-data");
  cookieData = storedData ? JSON.parse(storedData) : null;
}

const initialState = {
  value: cookieData,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action) => {
      state.value = action.payload;
      localStorage.setItem('user-data', JSON.stringify(action.payload)); // Save user data to localStorage
    },
    logout: (state) => {
      state.value = null; // Clear the user state
      localStorage.removeItem('user-data'); // Remove user data from localStorage
    },
    filepath: (state, action) => {
      state.value = action.payload;
    }
  }
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
