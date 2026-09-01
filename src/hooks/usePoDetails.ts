import axiosInstance from '@/services/axiosInstance';
import { useState, useEffect, useCallback } from 'react';
export interface PoDetailItem {
  poNo: string;
  invoice: string;
  invoiceValue: number;
  bankPayment: number;
  clearingDate: string;
  sgstAmount: number;
  cgstAmount: number;
  igstAmount: number;
  sgsttds: number;
  cgsttds: number;
  igsttds: number;
  ittds: number;
  paymentDoc: string;
  [key: string]: unknown;
}

interface UsePoDetailsReturn {
  data: PoDetailItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePoDetails = (poNumber?: string | number): UsePoDetailsReturn => {
  const [data, setData] = useState<PoDetailItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPoDetails = useCallback(async () => {
    if (!poNumber) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/SapPo/details/${poNumber}`);
      setData(response.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching PO details.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [poNumber]);

  useEffect(() => {
    fetchPoDetails();
  }, [fetchPoDetails]);

  return { data, loading, error, refetch: fetchPoDetails };
};
