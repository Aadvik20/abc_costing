import axiosInstance from '@/services/axiosInstance';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export type Unit = {
  unitid: number;
  unitName: string;
  sequenceID: number;
};

export type Post = {
  postid: number;
  post: string;
};

export type grades = {
  grades: string;
  pgOrder: number;
};

export type Department = {
  department: string;
};

export type Employees = {
  employeeMasterAutoId: number;
  employeeCode: string;
  gender: string;
  userName: string;
  post: string;
  genericDesignation: string;
  positions: number;
  positionGrade: string;
  deptDfccil: string;
  subDeptDf: string;
  dob: string;
  doretirement: string;
  location: string;
  dorecruiting: string;
  dojdfccil: string;
  dotends: string | null;
  depTenurecompletiondate: string | null;
  depExtensionuptodate: string | null;
  deputationTenure: string | null;
  dorepatriation: string | null;
  doabsorption: string | null;
  dofirstPromotion: string | null;
  dosecondPromotion: string | null;
  dothirdPromotion: string | null;
  doreemployment: string | null;
  doabsconding: string | null;
  toemploy: string;
  empSubgroup: string;
  ethnicOrigin: string;
  religion: string;
  rbfileNo: string | null;
  lastDesignation: string | null;
  services: string;
  ditsdoarailway: string | null;
  parentRailway: string | null;
  gazettedNonGazetted: string | null;
  doletter: string | null;
  personnelArea: string;
  personnelSubArea: string;
  mobile: string;
  pwd: string;
  emailAddress: string;
  status: number;
  modifyBy: string;
  modifyDate: string;
  modifyIp: string;
  userType: number;
  designation: string;
  aboutUs: string | null;
  extnNo: string | null;
  faxNo: string | null;
  mtnno: string | null;
  photo: string | null;
  anniversaryDate: string | null;
  personalMobile: string | null;
  personalEmailAddress: string | null;
  parentOrganzation: string | null;
  duration: string | null;
  reportingOfficer: string | null;
  fatherName: string | null;
};

export type Dept = {
  departmentid: number;
  department: string;
  unitId: number | null;
  status: string | null;
  ip: string | null;
  createDate: string | null; // Could be Date if parsed
  createBy: string | null;
  cadres: any[]; // Replace `any` with specific type if known
};

type MasterDataResponse = {
  units: Unit[];
  posts: Post[];
  grades: grades[];
  departments: Department[];
  dept: Dept[];
  employees: Employees[];
};
interface MasterDataState {
  units: Unit[];
  posts: Post[];
  grades: grades[];
  departments: Department[];
  dept: Dept[];
  employees: Employees[];
  loading: boolean;
  error: string | null;
}

const initialState: MasterDataState = {
  units: [],
  posts: [],
  grades: [],
  departments: [],
  dept: [],
  employees: [],
  loading: false,
  error: null,
};

export const fetchMasterData = createAsyncThunk<MasterDataResponse, void, { rejectValue: string }>('masterData/fetchMasterData', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/Util/constant-data`);
    return response.data.data as MasterDataResponse;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch master data');
  }
});

const masterDataSlice = createSlice({
  name: 'masterData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterData.fulfilled, (state, action: PayloadAction<MasterDataResponse>) => {
        state.loading = false;
        state.units = [...action.payload.units].sort((a, b) => a.sequenceID - b.sequenceID);
        state.grades = [...action.payload.grades].sort((a, b) => a.pgOrder - b.pgOrder);
        state.posts = action.payload.posts;
        state.departments = action.payload.departments;
        state.employees = action.payload.employees;
        state.dept = action.payload.dept;
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export default masterDataSlice.reducer;
