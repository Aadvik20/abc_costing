import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/services/axiosInstance";
import toast from "react-hot-toast";
import { fetchMasterRole } from "@/features/userRole/masterRoles";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { formatDateTime } from "@/lib/helperFunction";

interface FormState {
  roleName: string;
  description: string;
}

const ManageRoles = () => {
  const dispatch = useAppDispatch();
  const { roles, loading } = useAppSelector(
    (state) => state.masterRoles
  );

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormState>({
    roleName: "",
    description: ""
  });

  useEffect(() => {
    dispatch(fetchMasterRole());
  }, [dispatch]);

 
  const handleAdd = () => {
    setIsEdit(false);
    setSelectedRoleId(null);
    setFormData({ roleName: "", description: "" });
    setShowModal(true);
  };

  const onSave = async () => {
    if (!formData.roleName) {
      toast.error("Role name is required");
      return;
    }

    setSaving(true);
    try {
      const response = await axiosInstance.post("/User/AddNewRole",formData);

      if (response.data.statusCode === 200) {
        toast.success("Role added successfully");
        dispatch(fetchMasterRole());
        setShowModal(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Add failed");
    } finally {
      setSaving(false);
    }
  };


  const openEdit = (role: any) => {
    setIsEdit(true);
    setSelectedRoleId(role.id);
    setFormData({
      roleName: role.roleName,
      description: role.description
    });
    setShowModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedRoleId) return;

    setSaving(true);
    try {
      const response = await axiosInstance.put(`/User/UpdateRole?roleId=${selectedRoleId}`,formData);

      if (response.data.statusCode === 200) {
        toast.success("Role updated successfully");
        dispatch(fetchMasterRole());
        setShowModal(false);
      }
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await axiosInstance.delete(`/User/DeleteRole?roleId=${id}`);

      if (response.data.statusCode === 200) {
        toast.success("Role deleted successfully");
        dispatch(fetchMasterRole());
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Roles</h1>
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          Add New Role
        </Button>
      </div>


      <div className="bg-white shadow rounded">
        <table className="w-full">
          <thead className="bg-primary text-white">
            <tr>
              <th className="p-3 text-left">S.No.</th>
              <th className="p-3 text-left">Role Name</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {roles.map((role, index) => (
              <tr key={role.id} className="border-b">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">{role.roleName}</td>
                <td className="p-3">{role.description}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => openEdit(role)}
                    className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>

                  <ConfirmDialog
                   triggerClassName={'bg-red-500 px-1 h-6'}
                              triggerLabel=""
                              onConfirm={() => {
                                handleDelete(role.id);
                              }}
                   icon={<Trash2 size={16} />}
                   description="Are you sure to delete role? This action can not be undone"
                   title="Deleting Role"           
                  />
                </td>
              </tr>
            ))}

            {!loading && roles.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  No roles found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-[400px]">
            <h2 className="text-lg font-semibold mb-4">
              {isEdit ? "Edit Role" : "Add Role"}
            </h2>

            <input
              type="text"
              placeholder="Role Name"
              className="border p-2 w-full mb-3"
              value={formData.roleName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  roleName: e.target.value
                })
              }
            />

            <input
              type="text"
              placeholder="Description"
              className="border p-2 w-full mb-4"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value
                })
              }
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={isEdit ? handleUpdate : onSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRoles;
