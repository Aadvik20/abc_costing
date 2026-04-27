import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import { showCustomToast } from '@/components/common/showCustomToast';
import Loader from '@/components/ui/loader';
import { Button } from '@/components/ui/button';
import { Download, Pencil, Plus } from 'lucide-react';
import ExpandableTableList from '@/components/ui/expand-table';
import { formatDate } from '@/lib/helperFunction';

const CategoryDetails = () => {
  const userDetails = useAppSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');

  const fetchContract = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/ContractManagement/get-all-contrac');
      setContracts(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, []);

  const columns = [
    {
      accessorKey: 'key',
      header: 'Sr No.',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold">{row.index + 1}</div>,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold text-nowrap">{row.original.department}</div>,
    },
    {
      accessorKey: 'categoryName',
      header: 'Category Name',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold text-nowrap">{row.original.categoryName.toUpperCase()}</div>,
    },
    {
      accessorKey: 'categoryDescription',
      header: 'Category Description',
      cell: ({ row }) => <div className="px-2 py-3 font-semibold text-nowrap">{row.original.categoryDescription || '-'}</div>,
    },
  ];

  return (
    <div className="p-4 md:p-8">
      {loading && <Loader />}
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Manage Categories</h1>
            <p className="text-gray-600 mt-1">Create and manage category and sub category for departments.</p>
          </div>
        </div>
        <Card className="border-0 shadow-md">
          <CardContent className="mt-5">
            <div className="flex justify-between mb-3">
              <Button
                onClick={() => {
                  setMode('add');
                  //   setSelectedRow(null);
                  setShowModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Contract
              </Button>
            </div>
            <ExpandableTableList
              columns={columns}
              data={contracts}
              showSearchInput
              showRefresh
              onRefresh={fetchContract}
              renderExpanded={(row) => {
                return (
                  <div className="w-full">
                    {/* SECOND TABLE */}
                    <div className="max-h-[300px] overflow-y-auto border rounded-md">
                      <table className="w-full border rounded-md">
                        <thead className="bg-gray-200 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left">Sub Category Name</th>
                            <th className="px-4 py-2 text-left">Sub Category Description</th>
                            <th className="px-4 py-2 text-left">Measurement Unit</th>
                          </tr>
                        </thead>

                        <tbody>
                          {contracts.length ? (
                            contracts.map((emp, i) => (
                              <tr key={i}>
                                <td className="px-4 py-2">{emp.subcategoryName}</td>
                                <td className="px-4 py-2">{emp.subcategoryDescription}</td>
                                <td className="px-4 py-2">{emp.munit}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="text-center py-3 text-gray-500">
                                No subcategory for this category
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryDetails;
