import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';

// Type definition for the PO Detail item
export interface PoDetailItem {
  poNo: string;
  invoice: string;
  invoiceValue: number;
  bankPayment: number;
  augdt: string;
  sgstAmount: number;
  cgstAmount: number;
  igstAmount: number;
  sgsttds: number;
  cgsttds: number;
  igsttds: number;
  ittds: number;
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
    // Prevent fetching if no PO number is supplied
    if (!poNumber) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`https://uattransferapi.dfccil.com/api/SapPo/details/${poNumber}`);
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
