import { formatDate } from '@/lib/helperFunction';
import TransferAxiosInstance from '@/services/TransferAxiosInstance';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Types matching your data structure
export interface MainPoRow {
  poNo: string;
  poOrderValue?: number;
  poType?: string;
  unit?: string;
  poDate?: string;
  bankPayment?: number;
  itTds?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  cgstTds?: number;
  sgstTds?: number;
  igstTds?: number;
  [key: string]: unknown;
}

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
const filterInvoicesByDateRange = (invoices: PoDetailItem[], fromDate?: string | null, toDate?: string | null): PoDetailItem[] => {
  if (!invoices || invoices.length === 0) return [];
  if (!fromDate && !toDate) return invoices;

  const fromTime = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
  const toTime = toDate ? new Date(toDate).setHours(23, 59, 59, 999) : null;

  return invoices.filter((item) => {
    if (!item.augdt) return false;

    // Parse DD-MM-YYYY format
    const parts = String(item.augdt).split('-');
    if (parts.length !== 3) return false;

    const [day, month, year] = parts.map(Number);
    const itemDate = new Date(year, month - 1, day);
    const itemTime = itemDate.getTime();

    if (Number.isNaN(itemTime)) return false;
    if (fromTime && itemTime < fromTime) return false;
    if (toTime && itemTime > toTime) return false;

    return true;
  });
};
const fetchPoDetails = async (poNo: string): Promise<PoDetailItem[]> => {
  try {
    const res = await TransferAxiosInstance.get(`/SapPo/details/${poNo}`);
    const data = await res.data;
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error(`Error fetching details for PO ${poNo}:`, err);
    return [];
  }
};

export const exportPaginatedPoExcel = async (paginatedData: MainPoRow[], fromDate?: string | null, toDate?: string | null) => {
  if (!paginatedData || paginatedData.length === 0) {
    alert('No data available on the current page to export.');
    return;
  }

  const poDetailsResults = await Promise.all(paginatedData.map((po) => fetchPoDetails(po.poNo)));

  const detailsMap: Record<string, PoDetailItem[]> = {};
  paginatedData.forEach((po, index) => {
    const rawInvoices = poDetailsResults[index] || [];
    detailsMap[po.poNo] = filterInvoicesByDateRange(rawInvoices, fromDate, toDate);
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('PO & Invoice Details');

  worksheet.columns = [
    { header: 'PO No', key: 'recordIdentifier', width: 34 },
    { header: 'PO Date', key: 'poDate', width: 22 },

    { header: 'PO Amount', key: 'poOrderValue', width: 26 },
    { header: 'PO Type (Capex/Opex)', key: 'poType', width: 24 },
    { header: 'Unit', key: 'unit', width: 20 },
    { header: 'Bank Payment', key: 'bankPayment', width: 24 },
    { header: 'CGST', key: 'cgstAmount', width: 18 },
    { header: 'CGST TDS', key: 'cgsttds', width: 18 },
    { header: 'SGST', key: 'sgstAmount', width: 18 },
    { header: 'SGST TDS', key: 'sgsttds', width: 18 },
    { header: 'IGST', key: 'igstAmount', width: 18 },
    { header: 'IGST TDS', key: 'igsttds', width: 18 },
    { header: 'IT TDS', key: 'ittds', width: 18 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.height = 38;
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 13 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '0F172A' },
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'CBD5E1' } },
    left: { style: 'thin', color: { argb: 'CBD5E1' } },
    bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
    right: { style: 'thin', color: { argb: 'CBD5E1' } },
  };
  paginatedData.forEach((po) => {
    const mainRow = worksheet.addRow({
      recordIdentifier: po.poNo,
      poDate: formatDate(po.poDate) || '-',
      poOrderValue: po.poOrderValue ?? 0,
      poType: po.poType || '-',
      unit: po.unit || '-',
      bankPayment: po.bankPayment ?? 0,

      cgstAmount: po.cgstAmount ?? 0,
      cgsttds: po.cgsttds ?? 0,
      sgstAmount: po.sgstAmount ?? 0,
      sgsttds: po.sgsttds ?? 0,
      igstAmount: po.igstAmount ?? 0,
      igsttds: po.igsttds ?? 0,
      ittds: po.itTds ?? 0,
    });

    mainRow.height = 30;
    mainRow.font = { bold: true, color: { argb: '0F172A' }, size: 11.5 };
    mainRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'C7D2FE' },
    };

    mainRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'medium', color: { argb: '475569' } },
        bottom: { style: 'medium', color: { argb: '475569' } },
        left: { style: 'thin', color: { argb: '94A3B8' } },
        right: { style: 'thin', color: { argb: '94A3B8' } },
      };
      cell.alignment = { vertical: 'middle' };
    });

    const invoices = detailsMap[po.poNo] || [];

    if (invoices.length > 0) {
      const subHeaderRow = worksheet.addRow({
        recordIdentifier: '   ↳ Invoice Number',
        poOrderValue: 'Invoice Value',
        bankPayment: 'Bank Payment',
        poDate: 'Payment Date',
        cgstAmount: 'CGST',
        cgsttds: 'CGST TDS',
        sgstAmount: 'SGST',
        sgsttds: 'SGST TDS',
        igstAmount: 'IGST',
        igsttds: 'IGST TDS',
        ittds: 'IT TDS',
      });

      subHeaderRow.height = 26;
      subHeaderRow.font = { bold: true, color: { argb: '1E293B' }, size: 11 };
      subHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'E2E8F0' }, // Light Gray Sub-Header fill
      };

      subHeaderRow.eachCell((cell) => {
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle' };
      });

      invoices.forEach((inv) => {
        const subRow = worksheet.addRow({
          recordIdentifier: `     ${inv.invoice}`,
          poOrderValue: inv.invoiceValue ?? 0,
          bankPayment: inv.bankPayment ?? 0,
          poDate: formatDate(inv.augdt) || '-',
          cgstAmount: inv.cgstAmount ?? 0,
          cgsttds: inv.cgsttds ?? 0,
          sgstAmount: inv.sgstAmount ?? 0,
          sgsttds: inv.sgsttds ?? 0,
          igstAmount: inv.igstAmount ?? 0,
          igsttds: inv.igsttds ?? 0,
          ittds: inv.ittds ?? 0,
        });

        subRow.height = 26;
        subRow.font = { italic: true, color: { argb: '334155' }, size: 11 };
        subRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'F8FAFC' },
        };

        subRow.eachCell((cell) => {
          cell.border = thinBorder;
          cell.alignment = { vertical: 'middle' };
        });
      });
    }
  });

  const numericKeys = ['poOrderValue', 'bankPayment', 'cgstAmount', 'cgsttds', 'sgstAmount', 'sgsttds', 'igstAmount', 'igsttds', 'ittds'];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const firstCellVal = String(row.getCell('recordIdentifier').value || '');
    if (firstCellVal.includes('↳ Invoice Number')) {
      numericKeys.forEach((key) => {
        row.getCell(key).alignment = { horizontal: 'right', vertical: 'middle' };
      });
      return;
    }
    row.getCell('poOrderValue').numFmt = '₹#,##0.00';
    row.getCell('bankPayment').numFmt = '₹#,##0.00';

    ['cgstAmount', 'cgsttds', 'sgstAmount', 'sgsttds', 'igstAmount', 'igsttds', 'ittds'].forEach((key) => {
      row.getCell(key).numFmt = '#,##0.00';
    });
    numericKeys.forEach((key) => {
      row.getCell(key).alignment = { horizontal: 'right', vertical: 'middle' };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `PO_Invoice_Report_${Date.now()}.xlsx`);
};
