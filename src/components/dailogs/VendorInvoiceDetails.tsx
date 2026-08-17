import React from 'react';
import { formatDecimal, formatRupees } from '@/lib/helperFunction';
import { useVendorDetails } from '@/hooks/useVendorDetails';
interface VendorDetailsProps {
  invoiceNumber?: string | number;
}

const VendorInvoiceDetails: React.FC<VendorDetailsProps> = ({ invoiceNumber }) => {
  const { data, loading, error, refetch } = useVendorDetails(invoiceNumber);
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between border-b pb-2 border-gray-200">
        <h3 className="text-sm font-bold text-gray-900">Invoice Number Details</h3>
      </div>
      {loading && <div className="p-6 text-center text-gray-600 font-bold bg-gray-50 rounded-lg">Loading invoice details...</div>}
      {!loading && error && (
        <div className="p-6 text-center text-red-600 font-bold bg-red-50 rounded-lg space-y-2">
          <p>{error}</p>
          <button onClick={() => refetch()} className="px-4 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition">
            Retry
          </button>
        </div>
      )}
      {!loading && !error && data.length === 0 && (
        <div className="p-6 text-center text-gray-500 font-medium bg-gray-50 rounded-lg">No invoice details found for invoice number: {invoiceNumber}.</div>
      )}
      {!loading && !error && data.length > 0 && (
        <div className="overflow-x-auto border max-h-[45vh] overflow-y-auto border-gray-300 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-xs">
            <thead className="bg-primary text-white font-extrabold uppercase sticky top-0">
              <tr>
                <th className="px-3 py-2.5 border-r border-gray-300 text-left">Sr. No.</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-left">Supplier Code</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-left">Po Type</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">Bank Payment</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">CGST</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">CGST TDS</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">SGST</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">SGST TDS</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">IGST</th>
                <th className="px-3 py-2.5 border-r border-gray-300 text-right">IGST TDS</th>
                <th className="px-3 py-2.5 text-right">IT TDS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 font-semibold text-gray-800 bg-white">
              {data?.map((item, idx) => (
                <tr key={item.invoiceNumber || idx} className="hover:bg-blue-50/50 transition">
                  <td className="px-3 py-2 border-r border-gray-200 text-left">{idx + 1}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-left whitespace-nowrap font-bold text-blue-700">{item.supplierCode}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-left whitespace-nowrap">{item.poType || '-'}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatRupees(item.bankPayment)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.cgstAmount)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.cgsttds)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.sgstAmount)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.sgsttds)}</td>
                  <td className="px-3 py-2 border-r border-gray-200 text-right whitespace-nowrap">{formatDecimal(item.igstAmount)}</td>
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

export default VendorInvoiceDetails;
