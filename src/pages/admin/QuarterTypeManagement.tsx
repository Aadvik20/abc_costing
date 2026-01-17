import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Ruler, DollarSign, MapPin, IndianRupee } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuarterTypeModal } from '@/components/dailogs/QuarterTypeModal';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { formatDate, formatDateTime } from '@/lib/helperFunction';
import Loader from '@/components/ui/loader';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchQuarterTypes } from '@/features/quarter/QuarterTypeSlice';
import { RootState } from '@/app/store';
import AdminTable from '@/components/admin/AdminTable';
import { Label } from '@/components/ui/label';

const QuarterTypeManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('add');
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const dispatch = useAppDispatch();
  const { positionGrades, units } = useAppSelector((state: RootState) => state.masterData);

  const { quarterTypes, loading, error } = useAppSelector((state) => state.quarterTypes);
  useEffect(() => {
    if (!quarterTypes.length) {
      dispatch(fetchQuarterTypes());
    }
  }, [quarterTypes.length]);
  const onSave = async (payload) => {
    setSaving(true);
    try {
      const response = await axiosInstance.post('/QuarterManage/AddOrUpdateQuarteTypeWithRent', payload);
      if (response.data.statusCode === 200) {
        toast.success('Quarter type added successfully.');
        dispatch(fetchQuarterTypes());
        setShowModal(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.log(err, 'err');
      toast.error(err.response.data.message);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    setSaving(true);
    try {
      const response = await axiosInstance.delete(`/QuarterManage/DeleteQuarteTypeWithRent?pkQtypeId=${id}`);
      if (response.data.statusCode === 200) {
        toast.success('Quarter type deleted successfully.');
        dispatch(fetchQuarterTypes());
        setShowModal(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };

  const fillteredData = useMemo(() => {
    return quarterTypes?.filter((ele) => ele?.qType?.toLowerCase()?.includes(search?.toLowerCase()));
  }, [search, quarterTypes]);
  const columns = [
    {
      accessorKey: 'qType',
      header: 'Quarter Type',
      cell: ({ row }) => <div className="px-2 font-semibold">{row.original.qType}</div>,
    },
    {
      accessorKey: 'applicableFrom',
      header: 'Applicable From',
      cell: ({ row }) => <div className="px-2 font-semibold">{formatDate(row.original.applicableFrom)}</div>,
    },
    {
      accessorKey: 'applicableFrom',
      header: 'Avaliable Areas',
      cell: ({ row }) => (
        <div className="px-2 font-semibold">
          <Popover>
            <PopoverTrigger asChild>
              <button className="bg-green-600 text-white px-3 py-1 rounded-lg">View Areas ({row.original?.areas?.length})</button>
            </PopoverTrigger>
            <PopoverContent className="w-full">
              <div className="grid gap-3 max-h-[250px] overflow-y-auto">
                {row?.original?.areas?.map((ele, idx) => (
                  <div key={idx} className="grid grid-cols-2 items-center gap-4 p-3  border-t bg-gray-50">
                    {/* Area */}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <Label className="text-gray-700">
                        Area: <span className="font-semibold">{ele?.area}</span>
                      </Label>
                    </div>

                    {/* Rent */}
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-yellow-600" />
                      <Label className="text-gray-700">
                        Rent: <span className="font-semibold">{ele?.rentPerMonth?.toFixed(2)}</span>
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ),
    },

    {
      accessorKey: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <div className="flex items-center justify-center  gap-2">
          <button
            onClick={() => {
              setSelectedRow(row.original);
              setMode('edit');
              setShowModal(true);
            }}
            className="rounded-lg border p-1 text-gray-600 hover:bg-gray-100"
            title="Edit Allocation"
          >
            <Edit className="w-4 h-4" />
          </button>
          <ConfirmDialog
            triggerClassName={'bg-red-500 px-1 h-6'}
            triggerLabel=""
            onConfirm={() => {
              handleDelete(row.original.pkQTypeId);
            }}
            icon={<Trash2 size={16} />}
            description="Are you sure to delete this quarter details map? This action can not be undone."
            title="Deleting quarter details map"
          />
        </div>
      ),
    },
  ];
  return (
    <div className="min-h-screen  p-4 md:p-8">
      {(saving || loading) && <Loader />}
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quarter Type Management</h1>
            <p className="text-gray-600 mt-1">Manage different types of quarters,area and their rent</p>
          </div>
        </div>
        <Card className="border-0 shadow-lg">
          <CardContent>
            <div className="bg-white">
              <AdminTable
                inputPlaceholder={'Search type by name..'}
                data={fillteredData}
                columns={columns}
                rightElements={
                  <>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => {
                          dispatch(fetchQuarterTypes());
                        }}
                      >
                        <RefreshCw />
                      </Button>
                      <Button
                        onClick={() => {
                          setShowModal(true);
                          setMode('add');
                          setSelectedRow(null);
                        }}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Add New Type
                      </Button>
                    </div>
                  </>
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
      <QuarterTypeModal open={showModal} onOpenChange={setShowModal} mode={mode} initialData={selectedRow} onSave={onSave} saving={saving} />
    </div>
  );
};

export default QuarterTypeManagement;
