import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/services/axiosInstance';

export type PO = {
  poNo: string;
  supplierCode: string;
  contractNo: string;
  capexOpex: string;
  createdBy: string;
  unit: string;
  department: string;
  poOrderValue: number;
  currency: string;
  deliveredValue: number;
  balanceToBeInvoice: number;
  pktblSapDump: number;
};

interface PoState {
  po: PO[];
  loading: boolean;
  error: string | null;
}

const initialState: PoState = {
  po: [],
  loading: false,
  error: null,
};

export const fetchPoData = createAsyncThunk<PO[], void, { rejectValue: string }>('po/fetchPoData', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/Util/po-details?unitId=0&DeptId=0');
    return response.data.data as PO[];``
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch Data';
    return rejectWithValue(errorMessage);
  }
});

const poSlice = createSlice({
  name: 'po',
  initialState,
  reducers: {
    removePoByPktblSapDump: (state, action: PayloadAction<number>) => {
      state.po = state.po.filter((item) => Number(item.pktblSapDump) !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPoData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPoData.fulfilled, (state, action) => {
        state.loading = false;
        state.po = action.payload;
      })
      .addCase(fetchPoData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { removePoByPktblSapDump } = poSlice.actions;

export default poSlice.reducer;
