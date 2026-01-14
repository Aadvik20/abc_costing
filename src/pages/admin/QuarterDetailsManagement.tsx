import React, { useEffect, useState } from 'react';
import { Building2, Home, Users, Plus, Edit, Key, Eye, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuarterDetailsModal } from '@/components/dailogs/QuarterDetailsModal';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/app/hooks';
import { useDispatch } from 'react-redux';
import { fetchQuarterTypes } from '@/features/quarter/QuarterTypeSlice';
import { AppDispatch, RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';
import { fetchQuarterDetails } from '@/features/quarter/quarterDetailsSlice';
import Select from 'react-select';
import { Label } from '@/components/ui/label';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import TableList from '@/components/ui/data-table';
const QuarterDetailsManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = React.useState('add');
  const [selectedFilter, setSelectedFilter] = useState({
    qTypeId: 0,
    unitId: 0,
  });
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const { quarterTypes, loading } = useAppSelector((state) => state.quarterTypes);
  const { units } = useAppSelector((state: RootState) => state.masterData);
  const { quarterDetails: quarters, loading: quarteDetailsLoading } = useAppSelector((state: RootState) => state.quarterDetails);

  useEffect(() => {
    dispatch(
      fetchQuarterDetails({
        qTypeId: selectedFilter.qTypeId,
        unitId: selectedFilter.unitId,
      })
    );
  }, [dispatch, selectedFilter.unitId, selectedFilter.qTypeId]);
  const onSave = async (payload) => {
    setSaving(true);
    try {
      const response = await axiosInstance.post('/QuarterManage/quarter-detail', payload);
      if (response.data.statusCode === 200) {
        toast.success('Quarter details added successfully.');
        setShowModal(false);
        dispatch(
          fetchQuarterDetails({
            qTypeId: selectedFilter.qTypeId,
            unitId: selectedFilter.unitId,
          })
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setSaving(true);
    try {
      const response = await axiosInstance.delete(`/QuarterManage/quarter-detail/${id}`);
      if (response.data.statusCode === 200) {
        toast.success('Quarter type deleted successfully.');
        dispatch(
          fetchQuarterDetails({
            qTypeId: selectedFilter.qTypeId,
            unitId: selectedFilter.unitId,
          })
        );
        setShowModal(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };
  const columns = [
    {
      accessorKey: 'Type',
      header: 'Quarter Type',
      cell: ({ row }) => <div className="px-2 w-[120px]">{row.original?.qType}</div>,
    },
    {
      accessorKey: 'qNumber',
      header: 'Quarter No',
      cell: ({ row }) => <div className="px-2">{`${row.original?.qNumber}`}</div>,
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => <div className="w-[140px] px-2">{row.original.city}</div>,
    },
    {
      accessorKey: 'area',
      header: 'Area',
      cell: ({ row }) => <div className="px-2">{row?.original?.area}</div>,
    },
    {
      accessorKey: 'qAddress',
      header: 'Address',
      cell: ({ row }) => (
        <div className=" max-w-[240px] px-2 truncate" title={row.original.qAddress}>
          {row.original.qAddress}
        </div>
      ),
    },

    {
      accessorKey: 'Garage Available',
      header: 'Garage Available',
      cell: ({ row }) => <div className="px-2">{row?.original.isGarage ? 'Yes' : 'No'}</div>,
    },
    {
      accessorKey: 'Servant Quarter',
      header: 'Servant Quarter',
      cell: ({ row }) => <div className="px-2">{row.original.isServentQuarter ? 'Yes' : 'No'}</div>,
    },

    {
      accessorKey: 'Action',
      header: 'Action',
      cell: ({ row }) => (
        <div className="px-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedRow(row.original);
                setMode('edit');
                setShowModal(true);
              }}
              className="rounded-lg border p-1 text-gray-600 hover:bg-gray-100 transition"
              title="Edit Quarter"
            >
              <Edit className="w-4 h-4" />
            </button>
            <ConfirmDialog
              triggerClassName={'bg-red-500 px-1 h-6'}
              triggerLabel=""
              onConfirm={() => {
                handleDelete(row.original.pkQDetailId);
              }}
              icon={<Trash2 size={16} />}
              description="Are you sure to delete this quarter details? This action can not be undone."
              title="Deleting quarter details"
            />
          </div>
        </div>
      ),
    },
  ];
  console.log(quarters, 'quarters');
  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {(saving || quarteDetailsLoading || loading) && <Loader />}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quarter Details Management</h1>
            <p className="text-gray-600 mt-1">View and manage all quarter properties and their details</p>
          </div>
          <Button
            onClick={() => {
              setShowModal(true);
              setMode('add');
              setSelectedRow(null);
              dispatch(fetchQuarterTypes());
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Quarter
          </Button>
        </div>
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    </div>
                    <div className={`${stat.bgColor} p-3 rounded-lg`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div> */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-xl font-semibold">Quarter Inventory</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TableList
              onRefresh={() => {
                dispatch(
                  fetchQuarterDetails({
                    qTypeId: selectedFilter.qTypeId,
                    unitId: selectedFilter.unitId,
                  })
                );
              }}
              showRefresh
              onRowClick={(e) => {}}
              data={quarters}
              columns={columns}
              rightElements={
                <>
                  <div className="flex gap-3">
                    <div>
                      <Label>Select Unit</Label>
                      <Select
                        isClearable
                        onChange={(e) => {
                          setSelectedFilter((pre) => ({
                            ...pre,
                            unitId: e?.value,
                          }));
                        }}
                        value={
                          units
                            .map((ele) => ({
                              label: ele.unitName,
                              value: ele.unitid,
                            }))
                            .find((opt) => opt.value === selectedFilter.unitId) || null
                        }
                        className="min-w-[120px] mt-1"
                        placeholder="Select unit"
                        options={units.map((ele) => ({ label: ele.unitName, value: ele.unitid }))}
                      />
                    </div>
                    <div>
                      <Label>Select Quarter Type</Label>
                      <Select
                        isClearable
                        onChange={(e) => {
                          setSelectedFilter((pre) => ({
                            ...pre,
                            qTypeId: e?.value,
                          }));
                        }}
                        className="min-w-[120px] mt-1"
                        placeholder="Quarter type"
                        options={quarterTypes.map((ele) => ({
                          label: ele.qType,
                          value: ele.pkQTypeId,
                        }))}
                        value={
                          quarterTypes
                            .map((ele) => ({
                              label: ele.qType,
                              value: ele.pkQTypeId,
                            }))
                            .find((opt) => opt.value === selectedFilter.qTypeId) || null
                        }
                      />
                    </div>
                  </div>
                </>
              }
              showFilter={false}
            />
          </CardContent>
        </Card>
      </div>
      <QuarterDetailsModal
        open={showModal}
        onOpenChange={setShowModal}
        mode={mode}
        initialData={selectedRow}
        onSave={onSave}
        saving={saving}
        quarterTypeOptions={quarterTypes}
        unitOptions={units}
      />
    </div>
  );
};

export default QuarterDetailsManagement;
