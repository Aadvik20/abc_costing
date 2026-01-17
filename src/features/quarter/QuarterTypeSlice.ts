import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export type QuarterType = {
  pkQTypeId: number;
  qType: string;
  createBy: string;
  createdByName: string;
  createDate: string;
  modifyDate: string | null;
  modifyBy: string | null;
  modifyByName: string | null;
};

interface QuarterTypesState {
  quarterTypes: QuarterType[];
  loading: boolean;
  error: string | null;
}

const initialState: QuarterTypesState = {
  quarterTypes: [],
  loading: false,
  error: null,
};

export const fetchQuarterTypes = createAsyncThunk<QuarterType[], void, { rejectValue: string }>('quarterTypes/fetchQuarterTypes', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/QuarterManage/GetQuarteTypeWithRent`);
    if (response.data.statusCode === 200) {
      return response.data.data as QuarterType[];
    }
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch quarter types');
  }
});

const quarterTypesSlice = createSlice({
  name: 'quarterTypes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuarterTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuarterTypes.fulfilled, (state, action: PayloadAction<QuarterType[]>) => {
        state.loading = false;
        state.quarterTypes = action.payload;
      })
      .addCase(fetchQuarterTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export default quarterTypesSlice.reducer;
