import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/services/axiosInstance';

export type VendorAgeing = {
  profitCenter: string;
  unit: string;
  vendorCode: string;
  vendorName: string;
  moreThan3Years: string;
  twoToThreeYears: string;
  outstandingBalance: number;
  oneToTwoYears: string;
  lessThan1Year: string;
};

export type VendorAgeingFilters = {
  profitCenter?: string;
  unit?: string;
};

interface VendorAgeingState {
  data: VendorAgeing[];
  loading: boolean;
  error: string | null;
}

const initialState: VendorAgeingState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchVendorAgeing = createAsyncThunk<VendorAgeing[], void, { rejectValue: string }>(
  'VendorAgeing/fetchVendorAgeing',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/Reports/ageing-schedule');

      return response.data?.data ?? [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending inventory data');
    }
  }
);

const VendorAgeingSlice = createSlice({
  name: 'VendorAgeing',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchVendorAgeing.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchVendorAgeing.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      .addCase(fetchVendorAgeing.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch pending inventory data';
      });
  },
});

export default VendorAgeingSlice.reducer;
