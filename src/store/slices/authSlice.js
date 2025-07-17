import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk for fetching countries
export const fetchCountries = createAsyncThunk(
  'auth/fetchCountries',
  async () => {
    const response = await fetch('https://restcountries.com/v3.1/all?fields=name,idd,flag');
    const data = await response.json();
    return data.map(country => ({
      name: country.name.common,
      code: country.idd.root + (country.idd.suffixes?.[0] || ''),
      flag: country.flag
    })).filter(country => country.code).sort((a, b) => a.name.localeCompare(b.name));
  }
);

// Simulate OTP send
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async ({ phoneNumber }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, phoneNumber });
      }, 1500);
    });
  }
);

// Simulate OTP verification
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phoneNumber, otp }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === '123456') {
          resolve({ 
            success: true, 
            user: { 
              id: '1', 
              phoneNumber,
              name: 'User' 
            },
            token: 'mock-jwt-token'
          });
        } else {
          reject(new Error('Invalid OTP'));
        }
      }, 1000);
    });
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    countries: [],
    isLoading: false,
    error: null,
    otpSent: false,
    phoneNumber: '',
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.otpSent = false;
      state.phoneNumber = '';
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
    setPhoneNumber: (state, action) => {
      state.phoneNumber = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.countries = action.payload;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(sendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.phoneNumber = action.payload.phoneNumber;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.otpSent = false;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('token', action.payload.token);
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
  },
});

export const { logout, clearError, setPhoneNumber } = authSlice.actions;
export default authSlice.reducer;