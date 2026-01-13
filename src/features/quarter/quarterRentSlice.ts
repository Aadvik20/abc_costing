import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export type QuarterRent = {
  pkQRateId: number;
  fkQTypeId: number;
  qType: string;
  applicableFrom: string;
  rentPerMonth: number;
  status: boolean;
  createDate: string;
  createBy: string;
  createdByName: string;
  modifyDate: string | null;
  modifyBy: string | null;
  modifyByName: string | null;
};

interface QuarterRentState {
  rentData: QuarterRent[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
}

const initialState: QuarterRentState = {
  rentData: [],
  loading: false,
  error: null,
  totalRecords: 0,
};

export const fetchQuarterRent = createAsyncThunk<{ data: QuarterRent[]; totalRecords: number }, { qTypeId?: number }, { rejectValue: string }>(
  'quarterRent/fetchQuarterRent',
  async (params, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/QuarterManage/get-quarter-rent', {
        params: {
          ...(params.qTypeId && { qTypeId: params.qTypeId }),
        },
      });

      if (response.data?.statusCode === 200) {
        return {
          data: response.data.data,
          totalRecords: response.data.totalRecords,
        };
      }

      return thunkAPI.rejectWithValue(response.data?.message || 'Failed to fetch quarter rent');
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch quarter rent');
    }
  }
);

const quarterRentSlice = createSlice({
  name: 'quarterRent',
  initialState,
  reducers: {
    clearQuarterRent: (state) => {
      state.rentData = [];
      state.totalRecords = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuarterRent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchQuarterRent.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: QuarterRent[];
            totalRecords: number;
          }>
        ) => {
          state.loading = false;
          state.rentData = action.payload.data;
          state.totalRecords = action.payload.totalRecords;
        }
      )
      .addCase(fetchQuarterRent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { clearQuarterRent } = quarterRentSlice.actions;

export default quarterRentSlice.reducer;
