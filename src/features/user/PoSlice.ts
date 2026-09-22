import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axiosInstance from '@/services/axiosInstance';

export type PO = {
  poNo: string;
  poDescription: string;
  supplierCode: string;
  contractNo: string;
  capexopex: string;
  createdBy: string;
  unit: string;
  department: string;
  poOrderValue: number;
  currency: string;
  deliveredValue: number;
  balancetobeinvoice: number;
  bankPaymentReleased: number;
  invoiceValue: number;
  pktblSapDump: number;
  unitId: number;
  departmentId: number;
  podate: string;
  glaccount: string;
  glDescription: string;
  paymentDoc: string;
  isClubedPo: boolean;
  adjectPaymentDoc: string;
  paymentDocUnit: string;
  paymentDocCreator: string;
  sapSyncDate: string;
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
    const response = await axiosInstance.get('/Reports/poreport');
    return response.data.data as PO[];
  } catch (err: any) {
    const errorMessage = err.response?.data?.message || 'Failed to fetch Data';
    return rejectWithValue(errorMessage);
  }
});

const poSlice = createSlice({
  name: 'po',
  initialState,
  reducers: {},
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

export default poSlice.reducer;
