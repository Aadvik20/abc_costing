import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AdminTable from '@/components/admin/AdminTable';
import { FileText, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { table } from 'console';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';

const ElectricityBill = () => {
  const [month, setMonth] = useState('');
const [allocationData,setAllocationData]= useState([])
  const [openButton, setOpenButton] = useState(false);
  const { data: allocations, loading: employeeLoading } = useAppSelector((state: RootState) => state.quarterEmployeeMapList);

  const columns = [
    {
      accessorKey: 'employeeCode',
      header: 'Employee Code',
      cell: ({ row }) => <div className="px-2 w-[120px]">{row?.original?.employeeCode}</div>,
    },
    {
      accessorKey: 'employeeName',
      header: 'Employee Name',
      cell: ({ row }) => <div className="w-[140px] px-2">{row?.original?.employeeName}</div>,
    },

    {
      accessorKey: 'designation',
      header: 'Designation',
      cell: ({ row }) => <div className="px-2">{row?.original?.designation}</div>,
    },

    {
      accessorKey: 'positionGrade',
      header: 'Position Grade',
      cell: ({ row }) => <div className=" max-w-[240px] px-2 truncate">{row?.original?.positionGrade}</div>,
    },

    {
      accessorKey: 'post',
      header: 'Post',
      cell: ({ row }) => <div className="px-2">{row?.original?.post}</div>,
    },

    {
      accessorKey: 'unit',
      header: 'Unit',
      cell: ({ row }) => <div className="px-2">{row?.original?.unit}</div>,
    },

    {
      accessorKey: 'quarterNo',
      header: 'Quarter No',
      cell: ({ row }) => <div className="px-2">{row?.original?.quarterNo}</div>,
    },

    {
      accessorKey: 'rent',
      header: 'Quater Rent',
      cell: ({ row }) => (
        <div className="px-2">
          <span className="text-sm font-semibold text-green-600">₹{row?.original?.rent}</span>
        </div>
      ),
    },

    {
      accessorKey: 'oldReading',
      header: 'Old Readings',
      cell: ({ row }) => <div className="px-2">{row?.original?.oldReading}</div>,
    },
    {
      accessorKey: 'currentReading',
      header: 'Current Reading',
      cell: ({ row }) => <div className="px-2">{row?.original?.currentReading}</div>,
    },

    {
      accessorKey: 'consumption',
      header: 'Consumption',
      cell: ({ row }) => {
        const consumption = row?.original?.currentReading - row?.original?.oldReading;
        return <div className="px-2">{consumption}</div>;
      },
    },

    {
      accessorKey: 'ratePerUnit',
      header: 'Rate Per Unit',
      cell: ({ row }) => (
        <div className="px-2">
          <span className="text-sm font-semibold text-green-600">₹{row?.original?.ratePerUnit}</span>
        </div>
      ),
    },

    {
      accessorKey: 'billAmount',
      header: 'Bill Amount',
      cell: ({ row }) => {
        const billAmount = row?.original?.ratePerUnit * (row?.original?.currentReading - row?.original?.oldReading);
        return (
          <div className="px-2">
            <span className="text-sm font-semibold text-green-600">₹{billAmount}</span>
          </div>
        );
      },
    },

    {
      accessorKey: 'totalRent',
      header: 'Total Rent',
      cell: ({ row }) => {
        const totalRent = row?.original?.rent + row?.original?.ratePerUnit * (row?.original?.currentReading - row?.original?.oldReading);
        return (
          <div className="px-2">
            <span className="text-sm font-semibold text-green-600">₹{totalRent}</span>
          </div>
        );
      },
    },

    {
      accessorKey: 'Action',
      header: 'Action',
      cell: () => (
        <div className="px-2 active:scale-90">
          <Button type="button">Submit</Button>
        </div>
      ),
    },
  ];

  const dummyElectricityData = [
    {
      employeeCode: 123,
      quarterNo: 'Q-101',
      employeeName: 'Amit Sharma',
      designation: 'Senior Engineer',
      positionGrade: 'PG-6',
      post: 'SR EXEC',
      unit: 'Corporate Office',
      oldReading: 1200,
      currentReading: 1350,
      ratePerUnit: 6,
      rent: 4500,
    },
    {
      employeeCode: 456,
      quarterNo: 'Q-102',
      employeeName: 'Neha Verma',
      designation: 'HR Manager',
      positionGrade: 'PG-7',
      post: 'DPM',
      unit: 'Noida',
      oldReading: 980,
      currentReading: 1120,
      ratePerUnit: 6,
      rent: 5200,
    },
    {
      employeeCode: 789,
      quarterNo: 'Q-103',
      employeeName: 'Rahul Singh',
      designation: 'Accountant',
      positionGrade: 'PG-5',
      post: 'DGM',
      unit: 'Corporate Office',
      oldReading: 1500,
      currentReading: 1680,
      ratePerUnit: 6,
      rent: 4000,
    },
  ];

  const data = dummyElectricityData.map((item) => {
    const consumption = item.currentReading - item.oldReading;
    const billAmount = item.ratePerUnit * consumption;
    const totalRent = item.rent + billAmount;
    return {
      'Employee Code': item.employeeCode,
      'Employee Name': item.employeeName,
      Designation: item.designation,
      'Position Grade': item.positionGrade,
      Post: item.post,
      Unit: item.unit,
      'Quarter No': item.quarterNo,
      'Quarter Rent': `₹${item.rent}`,
      'Old Reading': item.oldReading,
      'Current Reading': item.currentReading,
      Consumption: consumption,
      'Rate Per Unit': `₹${item.ratePerUnit}`,
      'Bill Amount': `₹${billAmount}`,
      'Total Rent': `₹${totalRent}`,
    };
  });

  const pdfRows = dummyElectricityData.map((item) => {
    const consumption = item.currentReading - item.oldReading;
    const billAmount = item.ratePerUnit * consumption;
    const totalRent = item.rent + billAmount;

    return [
      item.employeeCode,
      item.employeeName,
      item.designation,
      item.positionGrade,
      item.post,
      item.unit,
      item.quarterNo,
      `${item.rent}`,
      item.oldReading,
      item.currentReading,
      consumption,
      `${item.ratePerUnit}`,
      `${billAmount}`,
      `${totalRent}`,
    ];
  });

  const pdfHeaders = [
    'Employee Code',
    'Employee Name',
    'Designation',
    'Position Grade',
    'Post',
    'Unit',
    'Quarter No',
    'Quarter Rent',
    'Old Reading',
    'Current Reading',
    'Consumption',
    'Rate Per Unit',
    'Bill Amount',
    'Total Rent',
  ];

  const generateExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, 'report.xlsx');
    setOpenButton(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFontSize(14);

    doc.text('Report', 14, 15);

    autoTable(doc, {
      head: [pdfHeaders],
      body: pdfRows,
      startY: 28,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
      },
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: 255,
        halign: 'center',
      },
      bodyStyles: {
        halign: 'center',
      },
    });

    doc.save('Report.pdf');

    setOpenButton(false);
  };

  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Electricity Bill</h1>
          <p className="text-gray-600 mt-1">Manage electricity bill for all units</p>
        </div>
      </div>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Electricity Bill Information</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminTable
            data={dummyElectricityData}
            columns={columns}
            inputPlaceholder="Search"
            rightElements={
              <>
                <div className="flex items-center gap-2 mb-6">
                  {/* <div className="px-2">
                    <p className="text-gray-900 mt-1">Select Month</p>
                    <Input className="border" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                  </div> */}

                  <div className="px-2">
                    <Button type="button" variant="destructive" size="lg" className="mt-6" onClick={() => setOpenButton(true)}>
                      Generate Report
                    </Button>

                    {openButton && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenButton(false)} />

                        <div className="absolute mt-2 w-44 bg-white border rounded-md shadow-lg z-50">
                          <button onClick={generatePDF} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100">
                            <FileText className="h-4 w-4 text-red-600" />
                            Generate Pdf
                          </button>

                          <button onClick={generateExcel} className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100">
                            <FileSpreadsheet className="h-4 w-4 text-green-600" />
                            Generate Excel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            }
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ElectricityBill;
