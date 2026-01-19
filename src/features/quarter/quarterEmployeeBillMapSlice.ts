import { environment } from '@/config';
import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

/* =======================
   Types
======================= */

export type QuarterDetails = {
  pkQDetailId: number;
  qNumber: string;
  city: string;
  qAddress: string;
  pkAreaId: number;
  area: string;
  pkQTypeId: number;
  quarterType: string;
  isGarage: boolean;
  garageRent: number;
  isServentQuarter: boolean;
  serventQuarterRent: number;
  fkUnitId: number;
  unitName: string;
};

export type EmployeeDetails = {
  fkEmpId: number;
  employeeCode: string;
  userName: string;
  post: string;
  positionGrade: string;
  department: string;
  location: string;
};

export type AreaWithRent = {
  pkAreaId: number;
  area: string;
  rentPerMonth: number;
};

export type ElectricityBillDetail = {
  pkElectricityBillId: number;
  dateOfReading: string;
  currentMeterReading: number;
  ratePerUnit: number;
  amount: number;
};

export type QuarterEmployeeMap = {
  pkQMapEmpId: number;
  quarterDetails: QuarterDetails;
  employeeDetails: EmployeeDetails;
  areaWithRent: AreaWithRent;
  electricityBillDetails: ElectricityBillDetail[];
  allotmentDate: string;
  vacanteDate: string | null;
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
}

const initialState: QuarterEmployeeMapState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchQuarterEmployeeBillMap = createAsyncThunk<QuarterEmployeeMap[], { employeeCode?: string } | void, { rejectValue: string }>(
  'quarterEmployeeMap/fetchQuarterEmployeeBillMap',
  async (params, thunkAPI) => {
    try {
      const response = await axiosInstance.get(`/QuarterManage/Get-quarter-map-employee-with-electricity-bill`, {
        params: {
          ...(params?.employeeCode && {
            employeeCode: params.employeeCode,
          }),
        },
      });

      return response.data.data as QuarterEmployeeMap[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch quarter employee mapping');
    }
  }
);

const quarterEmployeeMapSlice = createSlice({
  name: 'quarterEmployeeMap',
  initialState,
  reducers: {
    clearQuarterEmployeeMap: (state) => {
      state.data = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuarterEmployeeBillMap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuarterEmployeeBillMap.fulfilled, (state, action: PayloadAction<QuarterEmployeeMap[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchQuarterEmployeeBillMap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export const { clearQuarterEmployeeMap } = quarterEmployeeMapSlice.actions;

export default quarterEmployeeMapSlice.reducer;
