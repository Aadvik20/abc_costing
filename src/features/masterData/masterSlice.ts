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

export type PositionGrade = {
  positionGrade: string;
  pgOrder: number;
};

export type Department = {
  department: string;
};

type MasterDataResponse = {
  units: Unit[];
  posts: Post[];
  positionGrades: PositionGrade[];
  departments: Department[];
};

interface MasterDataState {
  units: Unit[];
  posts: Post[];
  positionGrades: PositionGrade[];
  departments: Department[];
  loading: boolean;
  error: string | null;
}

const initialState: MasterDataState = {
  units: [],
  posts: [],
  positionGrades: [],
  departments: [],
  loading: false,
  error: null,
};

export const fetchMasterData = createAsyncThunk<MasterDataResponse, void, { rejectValue: string }>('masterData/fetchMasterData', async (_, thunkAPI) => {
  try {
    const response = await axiosInstance.get(`/Account/GetStaticMasterData`);

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
        state.positionGrades = [...action.payload.positionGrades].sort((a, b) => a.pgOrder - b.pgOrder);
        state.posts = action.payload.posts;
        state.departments = action.payload.departments;
      })
      .addCase(fetchMasterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Something went wrong';
      });
  },
});

export default masterDataSlice.reducer;
