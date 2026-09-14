import { formatDate } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

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
  poType?: string;
  paymentDoc: string;
  [key: string]: unknown;
}

export interface MainPoRow {
  poNo?: string;
  poOrderValue?: number;
  poType?: string;
  unit?: string;
  poDate?: string;
  bankPayment?: number;
  supplierCode?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  cgsttds?: number;
  sgsttds?: number;
  igsttds?: number;
  ittds?: number;
  poDetails?: PoDetailItem[];
  glAccount?: string;
  clearingDate?: string;
  paymentDoc?: string;
  [key: string]: unknown;
}

const thinBorder: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'CBD5E1' } },
  left: { style: 'thin', color: { argb: 'CBD5E1' } },
  bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
  right: { style: 'thin', color: { argb: 'CBD5E1' } },
};

const buildNonPoSheet = (worksheet: ExcelJS.Worksheet, data: MainPoRow[]) => {
  worksheet.columns = [
    { header: 'Invoice No', key: 'invoiceNumber', width: 25 },
    { header: 'Invoice Date', key: 'invoiceDate', width: 20 },
    { header: 'GL Account', key: 'glAccount', width: 25 },
    { header: 'Supplier Code', key: 'supplierCode', width: 45 },
    { header: 'Expenditure Type', key: 'poType', width: 24 },
    { header: 'Unit', key: 'unit', width: 18 },
    { header: 'Payment Doc No', key: 'paymentDoc', width: 25 },
    { header: 'Clearing Date', key: 'clearingDate', width: 20 },
    { header: 'Bank Payment', key: 'bankPayment', width: 22 },
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
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  data.forEach((po) => {
    const mainRow = worksheet.addRow({
      invoiceNumber: po.invoiceNumber || '-',
      invoiceDate: formatDate(po.invoiceDate) || '-',
      glAccount: po.glAccount || '-',
      supplierCode: po.supplierCode || '-',
      poType: po.poType || '-',
      unit: po.unit || '-',
      paymentDoc: po.paymentDoc || '-',
      clearingDate: formatDate(po.clearingDate) || '-',
      bankPayment: po.bankPayment ?? 0,
      cgstAmount: po.cgstAmount ?? 0,
      cgsttds: po.cgsttds ?? 0,
      sgstAmount: po.sgstAmount ?? 0,
      sgsttds: po.sgsttds ?? 0,
      igstAmount: po.igstAmount ?? 0,
      igsttds: po.igsttds ?? 0,
      ittds: po.ittds ?? 0,
    });

    mainRow.height = 26;
    mainRow.font = { color: { argb: '0F172A' }, size: 11 };
    mainRow.eachCell((cell) => {
      cell.border = thinBorder;
      cell.alignment = { vertical: 'middle' };
    });
  });

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    row.getCell('bankPayment').numFmt = '₹#,##0.00';
    ['cgstAmount', 'cgsttds', 'sgstAmount', 'sgsttds', 'igstAmount', 'igsttds', 'ittds'].forEach((key) => {
      row.getCell(key).numFmt = '#,##0.00';
    });

    ['bankPayment', 'cgstAmount', 'cgsttds', 'sgstAmount', 'sgsttds', 'igstAmount', 'igsttds', 'ittds'].forEach((key) => {
      row.getCell(key).alignment = { horizontal: 'right', vertical: 'middle' };
    });
  });
};

const buildPoSheet = (worksheet: ExcelJS.Worksheet, data: MainPoRow[]) => {
  worksheet.columns = [
    { header: 'PO No', key: 'recordIdentifier', width: 34 },
    { header: 'PO Date', key: 'poDate', width: 22 },
    { header: 'PO Amount', key: 'poOrderValue', width: 26 },
    { header: 'GL Account', key: 'glAccount', width: 25 },
    { header: 'Supplier Code', key: 'supplierCode', width: 45 },
    { header: 'Expenditure Type', key: 'poType', width: 24 },
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
  headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  data.forEach((po) => {
    // Parent Row (Main PO)
    const mainRow = worksheet.addRow({
      recordIdentifier: po.poNo,
      poDate: formatDate(po.poDate) || '-',
      poOrderValue: po.poOrderValue ?? 0,
      glAccount: po.glAccount || '-',
      supplierCode: po.supplierCode || '-',
      poType: po.poType || '-',
      unit: po.unit || '-',
      bankPayment: po.bankPayment ?? 0,
      cgstAmount: po.cgstAmount ?? 0,
      cgsttds: po.cgsttds ?? 0,
      sgstAmount: po.sgstAmount ?? 0,
      sgsttds: po.sgsttds ?? 0,
      igstAmount: po.igstAmount ?? 0,
      igsttds: po.igsttds ?? 0,
      ittds: po.ittds ?? 0,
    });

    mainRow.height = 30;
    mainRow.font = { bold: true, color: { argb: '0F172A' }, size: 11.5 };
    mainRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C7D2FE' } };

    mainRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'medium', color: { argb: '475569' } },
        bottom: { style: 'medium', color: { argb: '475569' } },
        left: { style: 'thin', color: { argb: '94A3B8' } },
        right: { style: 'thin', color: { argb: '94A3B8' } },
      };
      cell.alignment = { vertical: 'middle' };
    });

    const items = po.poDetails || [];

    if (items.length > 0) {
      const subHeaderRow = worksheet.addRow({
        recordIdentifier: '   ↳ Invoice Number',
        poOrderValue: 'Invoice Value',
        poType: 'Payment Doc No',
        unit: 'Clearing Date',
        bankPayment: 'Bank Payment',
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
      subHeaderRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2E8F0' } };
      subHeaderRow.eachCell((cell) => {
        cell.border = thinBorder;
        cell.alignment = { vertical: 'middle' };
      });

      items.forEach((inv) => {
        const subRow = worksheet.addRow({
          recordIdentifier: `     ${inv.invoice}`,
          poOrderValue: inv.invoiceValue ?? 0,
          poType: inv.paymentDoc || '-',
          unit: formatDate(inv.clearingDate) || '-',
          bankPayment: inv.bankPayment ?? 0,
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
        subRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } };
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
};

export const exportAllPaymentDataToExcel = async (fromDate?: string | null, toDate?: string | null) => {
  try {
    const res = await axiosInstance.get('/SapPo/download-relative-data', {
      params: { fromDate, toDate },
    });

    const responseData = res.data?.data || res.data || {};
    const nonPoList: MainPoRow[] = responseData.nonPoList || [];
    const poList: MainPoRow[] = responseData.poList || [];
    const vendorSalary: MainPoRow[] = responseData?.salaryList || [];
    const vendorAdv: MainPoRow[] = responseData?.advancedList || [];

    const workbook = new ExcelJS.Workbook();

    const poSheet = workbook.addWorksheet('PO');
    buildPoSheet(poSheet, poList);

    const nonPoSheet = workbook.addWorksheet('Non PO');
    buildNonPoSheet(nonPoSheet, nonPoList);

    const vendorSalarySheet = workbook.addWorksheet('Employee Vendor Salary');
    buildNonPoSheet(vendorSalarySheet, vendorSalary);

    const vendorAdvSheet = workbook.addWorksheet('Employee Vendor Advances');
    buildNonPoSheet(vendorAdvSheet, vendorAdv);

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Payment_Report_${fromDate || 'All'}_${toDate || 'Dates'}.xlsx`);
  } catch (err) {
    console.error('Error generating Excel file:', err);
  }
};
