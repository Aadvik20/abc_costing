import axiosInstance from '@/services/axiosInstance';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
export interface VendorDetailItem {
  invoiceNumber: string;
  supplierCode: string;
  poType: string;
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

interface UseVendorDetailsReturn {
  data: VendorDetailItem[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useVendorDetails = (invoiceNumber?: string | number): UseVendorDetailsReturn => {
  const [data, setData] = useState<VendorDetailItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');

  const fetchVendorDetails = useCallback(async () => {
    if (!invoiceNumber) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(`/SapPo/Vendordetails/${invoiceNumber}?fromDate=${fromDate}&toDate=${toDate}`);
      setData(response.data || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching PO details.';
      setError(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [invoiceNumber]);

  useEffect(() => {
    fetchVendorDetails();
  }, [fetchVendorDetails]);

  return { data, loading, error, refetch: fetchVendorDetails };
};
