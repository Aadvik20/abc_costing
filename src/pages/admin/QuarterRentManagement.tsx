import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, CheckCircle, Eye, Home, DollarSign, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QuarterRentModal } from '@/components/dailogs/QuarterRentModal';
import { Button } from '@/components/ui/button';
import { useAppSelector } from '@/app/hooks';
import { fetchQuarterTypes } from '@/features/quarter/QuarterTypeSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/app/store';
import Loader from '@/components/ui/loader';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import { fetchQuarterRent } from '@/features/quarter/quarterRentSlice';
import { formatDate, formatDateTime } from '@/lib/helperFunction';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const QuarterRentManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const [selectedType, setSelectedType] = useState(null);
  const [mode, setMode] = React.useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const { quarterTypes, loading } = useAppSelector((state) => state.quarterTypes);
  const { rentData: rentRates, loading: rentLoading } = useAppSelector((state: RootState) => state.quarterRentList);
  useEffect(() => {
    if (!rentRates.length) {
      dispatch(fetchQuarterRent({}));
    }
  }, [dispatch, quarterTypes.length, rentRates.length]);

  const stats = [
    {
      title: 'Total Rent Records',
      value: rentRates.length.toString(),
      icon: FileText,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Average Rent',
      value: `₹${Math.round(rentRates.reduce((sum, r) => sum + r.rentPerMonth, 0) / rentRates.length).toLocaleString()}`,
      icon: DollarSign,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Monthly Collection',
      value: `₹${rentRates.reduce((sum, r) => sum + r.rentPerMonth, 0).toLocaleString()}`,
      icon: DollarSign,
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];
  const onSave = async (payload) => {
    setSaving(true);

    console.log(payload, 'payload');
    try {
      const response = await axiosInstance.post('/QuarterManage/addOrupdate-quarter-rent', payload);
      if (response.data.statusCode === 200) {
        toast.success('Quarter details added successfully.');
        setShowModal(false);
        dispatch(fetchQuarterRent({}));
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
      const response = await axiosInstance.delete(`/QuarterManage/delete-quarter-rent/${id}`);
      if (response.data.statusCode === 200) {
        toast.success('Quarter type deleted successfully.');
        dispatch(fetchQuarterRent({}));
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
        {(loading || rentLoading) && <Loader />}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quarter Rent Management</h1>
            <p className="text-gray-600 mt-1">Manage rental rates for all quarters</p>
          </div>
          <Button
            onClick={() => {
              setShowModal(true);
              dispatch(fetchQuarterTypes());
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Rent Rate
          </Button>
        </div>

        <Alert className="border-green-200 bg-green-50">
          <DollarSign className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All rent rates are applicable from January 1, 2024. Rates are reviewed annually and updated based on location and amenities.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Rent Rate Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">S.No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Quarter Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Rent</th>
                    <th className="px-1 py-3 text-left text-sm font-semibold text-white">Applicable From</th>
                    <th className="px-1 py-3 text-left text-sm font-semibold text-white">Created By</th>
                    <th className="px-1 py-3 text-left text-sm font-semibold text-white">Updated By</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rentRates.map((rate, index) => (
                    <tr key={rate.pkQRateId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700">{rate.qType}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-green-600">₹{rate.rentPerMonth.toLocaleString()}</span>
                      </td>
                      <td className="px-1 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-700">{formatDate(rate.applicableFrom)}</span>
                        </div>
                      </td>
                      <td className="px-1 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">{`${rate.createdByName}-${rate.createBy}-${formatDateTime(rate.createDate)}`}</span>
                        </div>
                      </td>

                      <td className="px-1 py-3">
                        <div className="flex items-center gap-2">
                          {rate.modifyByName ? (
                            <>
                              <Calendar className="w-4 h-4 text-purple-700" />
                              <span className="text-sm text-gray-700">{`${rate.modifyByName}-${rate.modifyBy}-${formatDateTime(rate.modifyDate)}`}</span>
                            </>
                          ) : (
                            '-'
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedRow(rate);
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
                              handleDelete(rate.pkQRateId);
                            }}
                            icon={<Trash2 size={16} />}
                            description="Are you sure to delete this quarter rent? This action can not be undone"
                            title="Deleting Quarter Rent"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      <QuarterRentModal
        open={showModal}
        onOpenChange={setShowModal}
        mode={mode}
        initialData={selectedRow}
        onSave={onSave}
        saving={saving}
        quarterDetailsOptions={quarterTypes}
      />
    </div>
  );
};

export default QuarterRentManagement;
