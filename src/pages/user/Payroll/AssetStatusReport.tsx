import ReportTable from '@/components/common/ReportTable';
import Loader from '@/components/ui/loader';
import { formatDate, formatRupees } from '@/lib/helperFunction';
import axiosInstance from '@/services/axiosInstance';
import React, { useEffect, useMemo, useState } from 'react';

const AssetStatusReport = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const fetchdata = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/Reports/separated-employees');
      setData(res.data?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchdata();
  }, []);

  const columns = useMemo(
    () => [
      {
        id: 'srNo',
        header: 'Sr. No.',
        size: 75,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold text-center">{row.index + 1}</div>,
      },
      {
        accessorKey: 'profitCentre',
        header: 'Profit Center',
        size: 130,
        enableSorting: false,
        cell: ({ row }: any) => <span className="font-semibold tabular-nums">{row.original.profitCentre || '-'}</span>,
      },
      {
        accessorKey: 'unitName',
        header: 'Unit Name',
        size: 120,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row?.original?.unitName || '-'}</div>,
      },
      {
        accessorKey: 'employeeCode',
        header: 'Employee Code',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.employeeCode || '-'}</div>,
      },
      {
        accessorKey: 'nameOfEmployee',
        header: 'Employee Name',
        size: 180,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.nameOfEmployee || '-'}</div>,
      },
      {
        accessorKey: 'assetsPurchased',
        header: 'Assets Purchased',
        size: 160,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row.original.assetsPurchased || '-'}</div>,
      },
      {
        accessorKey: 'dateOfPurchase',
        header: 'Date of Purchase',
        size: 170,
        enableSorting: true,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{formatDate(row?.original?.dateOfPurchase || '-')}</div>,
      },
      {
        accessorKey: 'costOfAssets',
        header: 'Cost of Assets',
        size: 160,
        enableSorting: true,
        cell: ({ row }: any) => <div className="text-right font-semibold tabular-nums">{formatRupees(row.original.costOfAssets)}</div>,
      },
      {
        accessorKey: 'wdvOfAssetsOnDateOfCessation',
        header: 'WDV of assets on date of cessation',
        size: 290,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold tabular-nums">{row?.original?.wdvOfAssetsOnDateOfCessation || '-'}</div>,
      },
      {
        accessorKey: 'statusOfAssets',
        header: 'Status of Assets ',
        size: 150,
        enableSorting: false,
        cell: ({ row }: any) => <div className="font-semibold">{row.original.statusOfAssets || '-'}</div>,
      },
    ],
    []
  );

  return (
    <div>
      {loading && <Loader />}
      <ReportTable data={data} columns={columns} showSearchInput={true} />;
    </div>
  );
};

export default AssetStatusReport;
