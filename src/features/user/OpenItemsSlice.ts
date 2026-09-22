import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/services/axiosInstance';

export type OpenItem = {
  profitCenter: string;
  fiscalYear: string;
  referenceNarration: string;
  postingDate: string;
  documentNumber: string;
};

export type OpenItemFilters = {
  profitCenter?: string;
  fiscalYear?: string;
  postingDate?: string;
  documentNumber?: string;
};

interface OpenItemState {
  data: OpenItem[];
  loading: boolean;
  error: string | null;
}

const initialState: OpenItemState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchOpenItem = createAsyncThunk<OpenItem[], void, { rejectValue: string }>('openItem/fetchOpenItem', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/Reports/open-items');

    return response.data?.data ?? [];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending inventory data');
  }
});

const openItemSlice = createSlice({
  name: 'openItem',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchOpenItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchOpenItem.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      .addCase(fetchOpenItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch pending inventory data';
      });
  },
});

export default openItemSlice.reducer;
