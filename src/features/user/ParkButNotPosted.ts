import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/services/axiosInstance';

export type ParkItem = {
  profitCenter: string;
  fiscalYear: string;
  referenceNarration: string;
  postingDate: string;
  documentNumber: string;
};

export type ParkItemFilters = {
  profitCenter?: string;
  fiscalYear?: string;
  postingDate?: string;
  documentNumber?: string;
};

interface ParkItemState {
  data: ParkItem[];
  loading: boolean;
  error: string | null;
}

const initialState: ParkItemState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchParkItem = createAsyncThunk<ParkItem[], void, { rejectValue: string }>('ParkItem/fetchParkItem', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/Reports/park-not-posted');

    return response.data?.data ?? [];
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch pending inventory data');
  }
});

const ParkItemSlice = createSlice({
  name: 'ParkItem',
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(fetchParkItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchParkItem.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      .addCase(fetchParkItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch pending inventory data';
      });
  },
});

export default ParkItemSlice.reducer;
