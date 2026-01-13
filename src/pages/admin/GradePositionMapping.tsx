import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { QPGradeMappingModal } from '@/components/dailogs/QPGradeMappingModal';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/app/hooks';
import { AppDispatch, RootState } from '@/app/store';
import { fetchQuarterTypes } from '@/features/quarter/QuarterTypeSlice';
import { useDispatch } from 'react-redux';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { fetchQuarterTypeGrades } from '@/features/quarter/quarterTypeGradeSlice';
import Loader from '@/components/ui/loader';
import { formatDateTime } from '@/lib/helperFunction';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const GradePositionMapping = () => {
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [mode, setMode] = React.useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const { quarterTypes, loading } = useAppSelector((state) => state.quarterTypes);
  const { positionGrades } = useAppSelector((state: RootState) => state.masterData);
  const { data: gradeMappings, loading: gradeListLoading } = useAppSelector((state: RootState) => state.quarterTypeGradeList);

  useEffect(() => {
    if (!gradeMappings.length) {
      dispatch(fetchQuarterTypeGrades({}));
    }
  }, [gradeMappings.length]);

  const onSave = async (payload) => {
    setSaving(true);
    try {
      const response = await axiosInstance.post('/QuarterManage/addorupdate-quarter-type-grade', payload);
      if (response.data.statusCode === 200) {
        toast.success('Grade mapped to quarter type successfully.');
        setShowModal(false);
        dispatch(fetchQuarterTypeGrades({}));
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      toast.error(err.response.data.message);

      console.log(err);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    setSaving(true);
    try {
      const response = await axiosInstance.delete(`/QuarterManage/delete-quarter-type-grade/${id}`);
      if (response.data.statusCode === 200) {
        toast.success('Grade mapping deleted successfully.');
        dispatch(fetchQuarterTypeGrades({}));
        setShowModal(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {(saving || loading || gradeListLoading) && <Loader />}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grade Position Mapping</h1>
            <p className="text-gray-600 mt-1">List of grades mapped with quarter types</p>
          </div>
          <Button
            onClick={() => {
              setShowModal(true);
              dispatch(fetchQuarterTypes());
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Mapping
          </Button>
        </div>
        <div className="bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">S.No.</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Quarter Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Position Grade</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Created Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gradeMappings.map((mapping, index) => (
                  <tr key={mapping.pkQPGradeId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">{mapping.qType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{mapping.positionGrade}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <span className="text-sm text-gray-700">{`${mapping.createdByName}-${mapping.createBy}-${formatDateTime(mapping.createDate)}`}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setMode('edit');
                            setSelectedRow(mapping);
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
                            handleDelete(mapping.pkQPGradeId);
                          }}
                          icon={<Trash2 size={16} />}
                          description="Are you sure to delete this grade mapping? This action can not be undone"
                          title="Deleting Grade Mapping"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <QPGradeMappingModal
        open={showModal}
        onOpenChange={setShowModal}
        mode={mode}
        initialData={selectedRow}
        onSave={onSave}
        saving={saving}
        quarterTypeOptions={quarterTypes}
        positionGrades={positionGrades}
      />
    </div>
  );
};

export default GradePositionMapping;
