import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/services/axiosInstance';

export interface Role {
  id: number;
  roleName: string;
  description: string;
  createdBy: number;
  createdDate: string;
  updatedBy: number | null;
  updatedDate: string | null;
  isActive: boolean;
  userRoleMappings: any [];
}
export interface Unit {
  unitId: number;
  unitName: string;
}
export interface Employee {
  employeeCode: string;
  employeeId:number;
  employeeName: string;
  designation: string;
  location: string;
  // unitId:string
  department: string;
}

interface RoleState {
  roles: Role[];
  units: Unit[];
  employees: Employee[];
  loading: boolean;
  error: string | null;
  empLoading: boolean;
  empError: string | null;
  delLoading: boolean;
  delError: string | null;
  unitLoading: boolean;
  unitError: string | null;
}

const initialState: RoleState = {
  roles: [],
  units: [],
  employees: [],
  loading: false,
  error: null,
  empLoading: false,
  empError: null,
  delLoading: false,
  delError: null,
  unitLoading: false,
  unitError: null,
};

export const fetchMasterRole = createAsyncThunk<Role[], void, { rejectValue: string }>('roles/AllRoles', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/User/GetAllRoles');
    return response.data.data as Role[];
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch roles';
    return rejectWithValue(errorMessage);
  }
});


export const masterRoleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    clearEmployees(state){
      state.employees=[];
      state.empError=null;
      state.empLoading=false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterRole.fulfilled, (state, action: PayloadAction<Role[]>) => {
        state.roles = action.payload;
        state.loading = false;
      })
      .addCase(fetchMasterRole.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred';
      })
     
  },
});
export const {clearEmployees} = masterRoleSlice.actions;
export default masterRoleSlice.reducer;
