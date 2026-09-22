import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/services/axiosInstance';

export type PendingInventory = {
  profitCenter: string;
  assignment: string;
  poNumber: string;
  documentNumber: string;
  documentType: string;
  documentDate: string;
  postingKey: string | null;
  amountInLocalCurrency: number;
  clearingDocument: string;
  postingDate: string;
  glAccount: string;
  supplierCode: string;
  supplierName: string;
  glUsed: string;
  pendingForMoreThen3Months: string;
};

export type PendingInventoryFilters = {
  profitCenter?: string;
  poNumber?: string;
  supplierCode?: string;
  supplierName?: string;
  documentType?: string;
  glAccount?: string;
  pendingForMoreThen3Months?: string;
  fromDate?: string;
  toDate?: string;
};

interface PendingInventoryState {
  data: PendingInventory[];
  loading: boolean;
  error: string | null;
}

const initialState: PendingInventoryState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchPendingInventory = createAsyncThunk<PendingInventory[], void, { rejectValue: string }>(
  'pendingInventory/fetchPendingInventory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/Reports/pending-inventory');

      return response.data?.data ?? [];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending inventory data');
    }
  }
);

const pendingInventorySlice = createSlice({
  name: 'pendingInventory',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchPendingInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      .addCase(fetchPendingInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch pending inventory data';
      });
  },
});

export default pendingInventorySlice.reducer;
