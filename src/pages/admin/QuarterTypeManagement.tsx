import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuarterTypeModal } from '@/components/dailogs/QuarterTypeModal';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { formatDateTime } from '@/lib/helperFunction';
import Loader from '@/components/ui/loader';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchQuarterTypes } from '@/features/quarter/QuarterTypeSlice';

const QuarterTypeManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState('add');
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const dispatch = useAppDispatch();
  const { quarterTypes, loading, error } = useAppSelector((state) => state.quarterTypes);
  useEffect(() => {
    if (!quarterTypes.length) {
      dispatch(fetchQuarterTypes());
    }
  }, [quarterTypes.length]);
  const onSave = async (payload) => {
    setSaving(true);
    try {
      const response = await axiosInstance.post('/QuarterManage/quarter-type', {
        ...(mode === 'edit' && { pkQTypeId: payload.pkQTypeId }),
        qType: payload?.QType?.trim(),
      });
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
      const response = await axiosInstance.delete(`/QuarterManage/quarter-type/${id}`);
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
  return (
    <div className="min-h-screen  p-4 md:p-8">
      {(saving || loading) && <Loader />}
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quarter Type Management</h1>
            <p className="text-gray-600 mt-1">Manage different types of quarters and their configurations</p>
          </div>
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
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="grid grid-cols-2 justify-between items-center">
              <CardTitle className="text-xl font-semibold">Quarter Types</CardTitle>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quarter type by name" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-primary">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white">S.No.</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white">Quarter Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {fillteredData.map((mapping, index) => (
                      <tr key={mapping.pkQTypeId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">{mapping.qType}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedRow({ ...mapping, QType: mapping.qType });
                                setMode('edit');
                                setShowModal(true);
                              }}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <ConfirmDialog
                              triggerClassName={'bg-red-500 px-1 h-6'}
                              triggerLabel=""
                              onConfirm={() => {
                                handleDelete(mapping.pkQTypeId);
                              }}
                              icon={<Trash2 size={16} />}
                              description="Are you sure to delete this quarter type? This action can not be undone"
                              title="Deleting quarter type"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <QuarterTypeModal open={showModal} onOpenChange={setShowModal} mode={mode} initialData={selectedRow} onSave={onSave} saving={saving} />
    </div>
  );
};

export default QuarterTypeManagement;
