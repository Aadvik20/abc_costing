import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/services/axiosInstance';

export type MsmeVendor = {
  profitCenter: string;
  unit: string;
  vendorCode: string;
  vendorName: string;
  pan: string;
  categoryOfMsme: string;
  outstandingBalance: number;
  invoiceNumber: string;
  invoiceDate: string;
  dueDateForPayment: string;
  noOfDaysOutstanding: number;
};

export type MsmeVendorFilters = {
  profitCenter?: string;
  fiscalYear?: string;
  postingDate?: string;
  documentNumber?: string;
};

interface MsmeVendorState {
  data: MsmeVendor[];
  loading: boolean;
  error: string | null;
}

const initialState: MsmeVendorState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchMsmeVendor = createAsyncThunk<MsmeVendor[], void, { rejectValue: string }>('MsmeVendor/fetchMsmeVendor', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/Reports/vendor-outstanding');

    return response.data?.data ?? [];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending inventory data');
  }
});

const MsmeVendorSlice = createSlice({
  name: 'MsmeVendor',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchMsmeVendor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchMsmeVendor.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      .addCase(fetchMsmeVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch pending inventory data';
      });
  },
});

export default MsmeVendorSlice.reducer;
