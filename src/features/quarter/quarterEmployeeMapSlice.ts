import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';


export type QuarterEmployeeMap = {
  pkQMapEmpId: number;
  fkQDetailId: number;
  fkEmpId: number;
  employeeCode: string;
  userName: string;
  post: string;
  department: string;
  location: string;
  positionGrade: string;
  allotmentDate: string;
  vacanteDate: string;
  createDate: string;
  createBy: string;
  createdByName: string;
  modifyDate: string | null;
  modifyBy: string | null;
  modifyByName: string | null;
};

interface QuarterEmployeeMapState {
  data: QuarterEmployeeMap[];
  loading: boolean;
  error: string | null;
  totalRecords: number;
}

const initialState: QuarterEmployeeMapState = {
  data: [],
  loading: false,
  error: null,
  totalRecords: 0,
};

export const fetchQuarterEmployeeMapping = createAsyncThunk<
  { data: QuarterEmployeeMap[]; totalRecords: number },
  { qDetailId?: number; employeeCode?: string },
  { rejectValue: string }
>('quarterEmployeeMap/fetchQuarterEmployeeMapping', async (params, thunkAPI) => {
  try {
    const response = await axiosInstance.get('/QuarterManage/quarter-map-employee', {
      params: {
        ...(params.qDetailId && { qDetailId: params.qDetailId }),
        ...(params.employeeCode && { employeeCode: params.employeeCode }),
      },
    });

    if (response.data?.statusCode === 200) {
      return {
        data: response.data.data,
        totalRecords: response.data.totalRecords,
      };
    }

    return thunkAPI.rejectWithValue(response.data?.message || 'Failed to fetch mapping');
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch quarter employee mapping');
  }
});

const quarterEmployeeMapSlice = createSlice({
  name: 'quarterEmployeeMap',
  initialState,
  reducers: {
    clearQuarterEmployeeMap: (state) => {
      state.data = [];
      state.totalRecords = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuarterEmployeeMapping.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchQuarterEmployeeMapping.fulfilled,
        (
          state,
          action: PayloadAction<{
            data: QuarterEmployeeMap[];
            totalRecords: number;
          }>
        ) => {
          state.loading = false;
          state.data = action.payload.data;
          state.totalRecords = action.payload.totalRecords;
        }
      )
      .addCase(fetchQuarterEmployeeMapping.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { clearQuarterEmployeeMap } = quarterEmployeeMapSlice.actions;

export default quarterEmployeeMapSlice.reducer;
