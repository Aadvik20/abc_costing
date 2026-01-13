import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/services/axiosInstance';

/* ============================
   TYPES
============================ */

export interface EmpRole {
  roleId: number;
  roleName: string;
}

export interface EmpRoleMappingPayload {
  empCode: number;
  empUnitId: number;
  userRoles: {
    roleId: number;
  }[];
}

export interface EditEmpRolePayload {
  empCode: number;
  empUnitId: number;
  roles: EmpRole[];
}

interface EmpRoleState {
  empRoles: any[]; // API response structure not provided
  loading: boolean;
  error: string | null;

  addLoading: boolean;
  addError: string | null;

  editLoading: boolean;
  editError: string | null;

  deleteLoading: boolean;
  deleteError: string | null;
}

/* ============================
   INITIAL STATE
============================ */

const initialState: EmpRoleState = {
  empRoles: [],
  loading: false,
  error: null,

  addLoading: false,
  addError: null,

  editLoading: false,
  editError: null,

  deleteLoading: false,
  deleteError: null,
};

/* ============================
   THUNKS
============================ */

/** 1️⃣ Get Employee Role List */
export const fetchEmpRoleList = createAsyncThunk<
  any[],
  void,
  { rejectValue: string }
>('empRole/getEmpRoleList', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/User/GetEmpRoleList');
    return response.data;
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message || 'Failed to fetch employee role list';
    return rejectWithValue(errorMessage);
  }
});

/** 2️⃣ Add User Role Mapping */
export const addUserRoleMapping = createAsyncThunk<
  any,
  EmpRoleMappingPayload,
  { rejectValue: string }
>('empRole/addUserRoleMapping', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(
      '/User/AddUserRoleMapping',
      payload
    );
    return response.data;
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message || 'Failed to add user role mapping';
    return rejectWithValue(errorMessage);
  }
});

/** 3️⃣ Edit Employee Role */
export const editEmpRole = createAsyncThunk<
  any,
  EditEmpRolePayload,
  { rejectValue: string }
>('empRole/editEmpRole', async (payload, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.put(
      '/User/EditEmpRole',
      payload
    );
    return response.data;
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message || 'Failed to edit employee role';
    return rejectWithValue(errorMessage);
  }
});

/** 4️⃣ Delete Employee Role Assignment */
export const deleteEmpRoleAssignment = createAsyncThunk<
  number,
  { mappingId: number },
  { rejectValue: string }
>('empRole/deleteEmpRoleAssignment', async ({ mappingId }, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(
      `/User/DeleteEMPRoleAssignment?MappingId=${mappingId}`
    );
    return mappingId;
  } catch (err: any) {
    const errorMessage =
      err.response?.data?.message || 'Failed to delete role assignment';
    return rejectWithValue(errorMessage);
  }
});

/* ============================
   SLICE
============================ */

export const empRoleSlice = createSlice({
  name: 'empRole',
  initialState,
  reducers: {
    resetEmpRoleState(state) {
      state.error = null;
      state.addError = null;
      state.editError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder

      // GET
      .addCase(fetchEmpRoleList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmpRoleList.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.empRoles = action.payload;
      })
      .addCase(fetchEmpRoleList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An unknown error occurred';
      })

      // ADD
      .addCase(addUserRoleMapping.pending, (state) => {
        state.addLoading = true;
        state.addError = null;
      })
      .addCase(addUserRoleMapping.fulfilled, (state) => {
        state.addLoading = false;
      })
      .addCase(addUserRoleMapping.rejected, (state, action) => {
        state.addLoading = false;
        state.addError = action.payload || 'An unknown error occurred';
      })

      // EDIT
      .addCase(editEmpRole.pending, (state) => {
        state.editLoading = true;
        state.editError = null;
      })
      .addCase(editEmpRole.fulfilled, (state) => {
        state.editLoading = false;
      })
      .addCase(editEmpRole.rejected, (state, action) => {
        state.editLoading = false;
        state.editError = action.payload || 'An unknown error occurred';
      })

      // DELETE
      .addCase(deleteEmpRoleAssignment.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteEmpRoleAssignment.fulfilled, (state) => {
        state.deleteLoading = false;
      })
      .addCase(deleteEmpRoleAssignment.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload || 'An unknown error occurred';
      });
  },
});

export const { resetEmpRoleState } = empRoleSlice.actions;
export default empRoleSlice.reducer;
