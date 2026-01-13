import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export type QuarterDetail = {
  pkQDetailId: number;
  fkQTypeId: number;
  fkUnitId: number;
  area: number;
  isServentQuarter: boolean;
  isGarage: boolean;
  qNumber: string;
  qAddress: string;
  city: string;
  isVacant: boolean;
  vacantDate: string | null;
  status: boolean;
  createDate: string;
  createBy: string;
  createdByName: string;
  modifyDate: string | null;
  modifyBy: string | null;
  modifyByName: string | null;
};

interface FetchQuarterDetailsParams {
  qTypeId?: number;
  unitId?: number;
}

interface QuarterDetailsState {
  quarterDetails: QuarterDetail[];
  loading: boolean;
  error: string | null;
}

const initialState: QuarterDetailsState = {
  quarterDetails: [],
  loading: false,
  error: null,
};

export const fetchQuarterDetails = createAsyncThunk<QuarterDetail[], FetchQuarterDetailsParams | void, { rejectValue: string }>(
  'quarterDetails/fetchQuarterDetails',
  async (params: any, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/QuarterManage/quarter-detail`, {
        params: {
          ...(params?.qTypeId && { qTypeId: params.qTypeId }),
          ...(params?.unitId && { unitId: params.unitId }),
        },
      });

      return response.data.data as QuarterDetail[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch quarter details');
    }
  }
);

const quarterDetailsSlice = createSlice({
  name: 'quarterDetails',
  initialState,
  reducers: {
    clearQuarterDetails: (state) => {
      state.quarterDetails = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuarterDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuarterDetails.fulfilled, (state, action: PayloadAction<QuarterDetail[]>) => {
        state.loading = false;
        state.quarterDetails = action.payload;
      })
      .addCase(fetchQuarterDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { clearQuarterDetails } = quarterDetailsSlice.actions;
export default quarterDetailsSlice.reducer;
