import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export type QuarterTypeGrade = {
  pkQPGradeId: number;
  fkQTypeId: number;
  qType: string;
  positionGrade: string;
  createDate: string;
  createBy: string;
  createdByName: string;
  modifyDate: string | null;
  modifyBy: string | null;
  modifyByName: string | null;
};

interface QuarterTypeGradeState {
  data: QuarterTypeGrade[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
}

const initialState: QuarterTypeGradeState = {
  data: [],
  loading: false,
  error: null,
  totalRecords: 0,
};

export const fetchQuarterTypeGrades = createAsyncThunk<{ data: QuarterTypeGrade[]; totalRecords: number }, { qTypeId?: number }, { rejectValue: string }>(
  'quarterTypeGrade/fetchQuarterTypeGrades',
  async (params, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/QuarterManage/get-quarter-type-grade', {
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

      return thunkAPI.rejectWithValue(response.data?.message || 'Failed to fetch quarter type grades');
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch quarter type grades');
    }
  }
);

const quarterTypeGradeSlice = createSlice({
  name: 'quarterTypeGrade',
  initialState,
  reducers: {
    clearQuarterTypeGrades: (state) => {
      state.data = [];
      state.totalRecords = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuarterTypeGrades.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchQuarterTypeGrades.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: QuarterTypeGrade[];
            totalRecords: number;
          }>
        ) => {
          state.loading = false;
          state.data = action.payload.data;
          state.totalRecords = action.payload.totalRecords;
        }
      )
      .addCase(fetchQuarterTypeGrades.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { clearQuarterTypeGrades } = quarterTypeGradeSlice.actions;

export default quarterTypeGradeSlice.reducer;
