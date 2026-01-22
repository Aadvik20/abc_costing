import { getDelegationInfoFromSession } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';

export interface UserState {
  Roles: string[];
  name: string | null;
  EmpCode: string | null;
  personnelSubArea: string | null;
  Designation: string | null;
  Unit: string | null;
  unitId: string | null;
  Lavel: string | null;
  Department: string | null;
  Mobile: string | null;
  Email: string | null;
  employeeMasterAutoId: number | null;
  exp: number | null;
  loading: boolean;
  error: string | null;
  reportingOfficer: string | null;
  roleAssigned: any[];
  isDelegatedUser?: boolean;
  delegateeEmpCode?: string | null;
  delegatedApplications?: string | null; // "11,61,72,53"
  delegatedApplicationNames?: string | null; // "IT Services Management,Module Management,e-Measurement Book,APAR"
}
interface RoleUnit {
  unitId: string;
  unitName: string;
  departments: string[];
}

interface AssignedRole {
  roleAssign: string;
  units: RoleUnit[];
}

interface ProfileResponse {
  data: {
    empId: number;
    empCode: string;
    name: string;
    email: string;
    mobile: string;
    designation: string;
    unit: string;
    unitId: number;
    department: string;
    level: string;

    qRoles: {
      roleAssign: string;
      units: unknown[]; // empty array in response, keeping flexible
    }[];

    globelAssigndRolesAndUnits: AssignedRole[];
  };
}

// ✅ Corrected initial state: Roles is now an empty array
const initialState: UserState = {
  Roles: [],
  name: null,
  EmpCode: null,
  Designation: null,
  Unit: null,
  unitId: null,
  Lavel: null,
  Department: null,
  Mobile: null,
  personnelSubArea: null,
  Email: null,
  exp: null,
  reportingOfficer: null,
  loading: false,
  error: null,
  employeeMasterAutoId: null,
  roleAssigned: [],
  isDelegatedUser: false,
  delegateeEmpCode: null,
  delegatedApplications: null,
  delegatedApplicationNames: null,
};

export const fetchUserProfile = createAsyncThunk('user/fetchUserProfile', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get<ProfileResponse>('/User/GetProfile');
    const data: any = response.data;
    if (data.error) {
      throw new Error(data.errorDetail || 'Unknown error occurred');
    }

    const delegationInfo = getDelegationInfoFromSession();
    data.data = {
      ...data.employeeInfo,
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
        state.EmpCode = data?.employeeCode || '';
        state.name = data?.userName || '';
        state.Designation = data?.designation || '';
        state.Unit = data?.location || '';
        state.unitId = String(data?.unitId);
        state.Department = data?.deptDfccil || '';
        state.Lavel = data?.level || '';
        state.Mobile = data?.mobile || '';
        state.Email = data?.emailAddress || '';
        // state.employeeMasterAutoId = data?.employeeMasterAutoId || null;
        // state.reportingOfficer = data?.reportingOfficer || null;
        // state.personnelSubArea = data?.personnelSubArea || null;
        const roles : any = Array.isArray(data.qRoles)
          ? Array.from(
              new Set(data.qRoles.map((r: any) => (typeof r === 'string' ? r : r?.roleAssign)).filter((s: any) => typeof s === 'string' && s.trim().length > 0))
            )
          : [];
        state.Roles = roles.length ? [...roles] : ['user'];
        state.roleAssigned = data.qRoles;
      });
  },
});

export const { updateUser, resetUser } = userSlice.actions;
export default userSlice.reducer;
