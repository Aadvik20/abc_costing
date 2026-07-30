import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Adjust import path for shadcn/ui Dialog
import { usePoDetails } from '@/hooks/usePoDetails';
import { Button } from '../ui/button';

interface PoDetailsDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  poNumber?: string | number;
}
const formatRupees = (val?: number | null): string => {
  if (val === null || val === undefined) return '-';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const formatDecimal = (val?: number | null): string => {
  if (val === null || val === undefined) return '-';
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

export const PoDetailsDialog: React.FC<PoDetailsDialogProps> = ({ isOpen, setIsOpen, poNumber }) => {
  const { data, loading, error, refetch } = usePoDetails(isOpen ? poNumber : undefined);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-7xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">PO Invoice Details - {poNumber || 'N/A'}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">Breakdown of invoices, payment amounts, and tax deductions.</DialogDescription>
        </DialogHeader>

        {/* Content Area */}
        <div className="mt-4">
          {loading && <div className="p-8 text-center text-gray-600 font-bold bg-gray-50 rounded-lg">Loading PO invoice details...</div>}

          {!loading && error && (
            <div className="p-8 text-center text-red-600 font-bold bg-red-50 rounded-lg space-y-2">
              <p>{error}</p>
              <button onClick={() => refetch()} className="px-4 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && data.length === 0 && (
            <div className="p-8 text-center text-gray-500 font-medium bg-gray-50 rounded-lg">No invoice details found for PO No: {poNumber}.</div>
          )}

          {!loading && !error && data.length > 0 && (
            <div className="overflow-x-auto border max-h-[55vh] overflow-y-auto border-gray-300 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100 text-gray-900 font-extrabold uppercase text-xs">
                  <tr>
                    <th className="px-3 py-3 border-r border-gray-300 text-left">Sr. No.</th>
                    <th className="px-3 py-3 border-r border-gray-300 text-left">Invoice No</th>
                    <th className="px-3 py-3 border-r border-gray-300 text-right">Invoice Value</th>
                    <th className="px-3 py-3 border-r border-gray-300 text-right">Bank Payment</th>
                    <th className="px-3 py-3 border-r border-gray-300 text-center">Aug Date</th>
                    <th className="px-3 py-3 border-r border-gray-300 text-right">CGST</th>
                    <th className="px-3 py-3 border-r border-gray-300 text-right">SGST</th>
                    <th className="px-3 py-3 border-r border-gray-300 text-right">IGST</th>
                    <th className="px-3 py-3 border-r border-gray-300 text-right">CGST TDS</th>
                    <th className="px-3 py-3 border-r border-gray-300 text-right">SGST TDS</th>
                    <th className="px-3 py-3 border-r border-gray-300 text-right">IGST TDS</th>
                    <th className="px-3 py-3 text-right">IT TDS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 font-semibold text-gray-800">
                  {data.map((item, idx) => (
                    <tr key={item.invoice || idx} className="hover:bg-blue-50/50 transition">
                      <td className="px-3 py-2.5 border-r border-gray-200 text-left">{idx + 1}</td>
                      <td className="px-3 py-2.5 border-r border-gray-200 text-left whitespace-nowrap font-bold text-blue-700">{item.invoice}</td>
                      <td className="px-3 py-2.5 border-r border-gray-200 text-right whitespace-nowrap">{formatRupees(item.invoiceValue)}</td>
                      <td className="px-3 py-2.5 border-r border-gray-200 text-right whitespace-nowrap">{formatRupees(item.bankPayment)}</td>
                      <td className="px-3 py-2.5 border-r border-gray-200 text-center whitespace-nowrap">{item.augdt}</td>
                      <td className="px-3 py-2.5 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.cgstAmount)}</td>
                      <td className="px-3 py-2.5 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.sgstAmount)}</td>
                      <td className="px-3 py-2.5 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.igstAmount)}</td>
                      <td className="px-3 py-2.5 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.cgsttds)}</td>
                      <td className="px-3 py-2.5 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.sgsttds)}</td>
                      <td className="px-3 py-2.5 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.igsttds)}</td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">{formatDecimal(item.ittds)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
