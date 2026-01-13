import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export type Employee = {
  employeeMasterAutoId: number;
  employeeCode: string;
  userName: string;
  positionGrade: string | null;
  post: string | null;
  deptDFCCIL: string;
  mobile: string;
  emailAddress: string;
  gender: string;
  location: string;
};

interface EmployeeState {
  employees: Employee[];
  loading: boolean;
  error: string | null;
}

const initialState: EmployeeState = {
  employees: [],
  loading: false,
  error: null,
};

export const fetchEmployeeList = createAsyncThunk<Employee[], { location: string }, { rejectValue: string }>(
  'employees/fetchEmployeeList',
  async ({ location }, thunkAPI) => {
    try {
      const response = await axiosInstance.get('/Account/GetAllActiveEmployee', {
        params: { location },
      });

      if (response.data?.statusCode === 200) {
        return response.data.data as Employee[];
      }

      return thunkAPI.rejectWithValue('Failed to fetch employee list');
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch employee list');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeList.fulfilled, (state, action: PayloadAction<Employee[]>) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployeeList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export default employeeSlice.reducer;
