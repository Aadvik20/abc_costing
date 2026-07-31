import React from 'react';
import { usePoDetails } from '@/hooks/usePoDetails';
import { formatDate, formatDecimal, formatRupees } from '@/lib/helperFunction';
interface PoDetailsProps {
  poNumber?: string | number;
}

const PoDetailsContent: React.FC<PoDetailsProps> = ({ poNumber }) => {
  const { data, loading, error, refetch } = usePoDetails(poNumber);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between border-b pb-2 border-gray-200">
        <h3 className="text-sm font-bold text-gray-900">PO Invoice Details</h3>
        <span className="text-xs text-gray-500 font-medium">Breakdown of invoices, payment amounts, and tax deductions</span>
      </div>
      {loading && <div className="p-6 text-center text-gray-600 font-bold bg-gray-50 rounded-lg">Loading PO invoice details...</div>}
      {!loading && error && (
        <div className="p-6 text-center text-red-600 font-bold bg-red-50 rounded-lg space-y-2">
          <p>{error}</p>
          <button onClick={() => refetch()} className="px-4 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition">
            Retry
          </button>
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <div className="p-6 text-center text-gray-500 font-medium bg-gray-50 rounded-lg">No invoice details found for PO No: {poNumber}.</div>
      )}
      {!loading && !error && data.length > 0 && (
        <div className="overflow-x-auto border max-h-[45vh] overflow-y-auto border-gray-300 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-primary text-white font-extrabold uppercase sticky top-0">
              <tr>
                <th className="px-3 py-2.5 border-r border-gray-300 text-left">Sr. No.</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-left">Invoice No</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">Invoice Value</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">Bank Payment</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-center">Payment Date</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">CGST</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">SGST</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">IGST</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">CGST TDS</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">SGST TDS</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">IGST TDS</th>
                <th className="px-3 py-2.5 text-right">IT TDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-semibold text-gray-800 bg-white">
              {data.map((item, idx) => (
                <tr key={item.invoice || idx} className="hover:bg-blue-50/50 transition">
                  <td className="px-3 py-2 border-r border-gray-200 text-left">{idx + 1}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-left whitespace-nowrap font-bold text-blue-700">{item.invoice}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatRupees(item.invoiceValue)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatRupees(item.bankPayment)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-center whitespace-nowrap">{formatDate(item.augdt)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.cgstAmount)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.sgstAmount)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.igstAmount)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.cgsttds)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.sgsttds)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.igsttds)}</td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{formatDecimal(item.ittds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PoDetailsContent;
