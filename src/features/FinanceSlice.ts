import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/services/axiosInstance';

export type ApprovalHistory = {
  approvedAmount: number;
  approvedBy: number;
  approvedOn: string;
  decisionReason: string;
  decisionType: string;
};

export type Finance = {
  approvalHistory: ApprovalHistory[];
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
  demandAmount: number;
  approvedAmount: number;
  pendingAmount: number;
};

interface FinanceState {
  finance: Finance[];
  loading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  finance: [],
  loading: false,
  error: null,
};

export const fetchFinanceData = createAsyncThunk<Finance[], void, { rejectValue: string }>('/finance/fetchFinanceData', async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get('/finance/Demands');
    return response.data.data as Finance[];
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch Finance Data';
    return rejectWithValue(errorMessage);
  }
});

const FinanceSlice = createSlice({
  name: 'finance',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFinanceData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFinanceData.fulfilled, (state, action) => {
        state.loading = false;
        state.finance = action.payload;
      })
      .addCase(fetchFinanceData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {} = FinanceSlice.actions;

export default FinanceSlice.reducer;
