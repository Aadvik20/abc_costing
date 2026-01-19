import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import axiosInstance from '@/services/axiosInstance';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchMasterRole } from '@/features/userRole/masterRoles';
import RoleModal from '@/components/dailogs/RoleModal';


const ManageRoles = () => {
  const dispatch = useAppDispatch();
  const { roles, loading } = useAppSelector((state) => state.masterRoles);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchMasterRole());
  }, [dispatch]);

  const onSave = async (payload: any) => {
    setSaving(true);
    try {
      const response =
        mode === 'add'
          ? await axiosInstance.post('/User/AddNewRole', { ...payload, name: payload.roleName })
          : await axiosInstance.put(`/User/UpdateRole?roleId=${payload.id}`, { ...payload, name: payload.roleName });

      if (response.data.statusCode === 200) {
        toast.success(mode === 'add' ? 'Role added successfully' : 'Role updated successfully');
        dispatch(fetchMasterRole());
        setShowModal(false);
      } else {
        toast.error(response.data.message);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axiosInstance.delete(`/User/DeleteRole?roleId=${id}`);

      if (response.data.statusCode === 200) {
        toast.success('Role deleted successfully');
        dispatch(fetchMasterRole());
      }
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-[1600px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Roles</h1>
            <p className="text-gray-600 mt-1">List of roles</p>
          </div>

          <Button
            onClick={() => {
              setMode('add');
              setSelectedRow(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} /> Add New Role
          </Button>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">S.No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Role Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {roles.map((role, index) => (
                    <tr key={role.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                      <td className="p-3">{role.roleName}</td>
                      <td className="p-3">{role.description}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setMode('edit');
                              setSelectedRow(role);
                              setShowModal(true);
                            }}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>

                          <ConfirmDialog
                            triggerClassName={'bg-red-500 px-1 h-6'}
                            triggerLabel=""
                            icon={<Trash2 size={16} />}
                            title="Delete Role"
                            description="Are you sure you want to delete this role?"
                            onConfirm={() => handleDelete(role.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!loading && roles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center">
                        No roles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <RoleModal open={showModal} onOpenChange={setShowModal} mode={mode} initialData={selectedRow} onSave={onSave} saving={saving} />
    </div>
  );
};

export default ManageRoles;
