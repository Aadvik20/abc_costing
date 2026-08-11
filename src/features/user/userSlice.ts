import { getDelegationInfoFromSession } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

type UnitOption = {
  value: string;
  label: string;
};

type DepartmentOption = {
  value: number;
  label: string;
  unitId: string;
};
export interface UserState {
  Roles: Number[];
  name: string | null;
  EmpCode: string | null;
  Designation: string | null;
  Unit: string | null;
  Department: string | null;
  employeeMasterAutoId: number | null;
  loading: boolean;
  error: string | null;

  units: UnitOption[];
  departments: DepartmentOption[];

  isDelegatedUser?: boolean;
  delegateeEmpCode?: string | null;
  delegatedApplications?: string | null;
  delegatedApplicationNames?: string | null;
}

interface ProfileResponse {
  data: {
    empId: number;
    empCode: string;
    name: string;
    designation: string;
    unit: string;
    department: string;
  };
}

const initialState: UserState = {
  Roles: [],
  name: null,
  EmpCode: null,
  Designation: null,
  Unit: null,
  Department: null,
  loading: false,
  error: null,
  employeeMasterAutoId: null,
  units: [],
  departments: [],
  isDelegatedUser: false,
  delegateeEmpCode: null,
  delegatedApplications: null,
  delegatedApplicationNames: null,
};

export const fetchUserProfile = createAsyncThunk('/Account/profile', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ProfileResponse>('/Account/profile');
    console.log(response, 'response');
    const data: any = response.data.data;
    if (data.error) {
      throw new Error(data.errorDetail || 'Unknown error occurred');
    }

    const delegationInfo = getDelegationInfoFromSession();
    data.data = {
      ...data,
      roles: data.roles,
      ...delegationInfo,
    };
    return data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch user profile');
  }
});

// ✅ User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser(state, action: PayloadAction<Partial<UserState>>) {
      return { ...state, ...action.payload };
    },
    resetUser() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        const { data } = action.payload || {};
        console.log(data, 'data');
        state.EmpCode = data?.employeeCode || '';
        state.name = data?.userName || '';
        state.Designation = data?.designation || '';
        state.Unit = data?.location || '';
        state.Department = data?.deptDfccil || '';
        state.Roles = [-1];
      });
  },
});

export const { updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
