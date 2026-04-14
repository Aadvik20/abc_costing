import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import Select from 'react-select';
import { Select as ShadSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';

const EditRoleDialog = ({ open, onClose, data, unitOptions, departmentOptions, onSuccess }: any) => {
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      const unit = data.units?.[0];

      setFormData({
        employeeCode: data.employeeCode,
        employeeName: data.employeeName,
        roleId: data.roleId,
        role: data.role,
        unitId: unit?.unitId ? String(unit.unitId) : '',
        departments:
          unit?.departments?.map((d: any) => ({
            value: d.depId,
            label: d.depName,
          })) || [],
      });
    }
  }, [data]);

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const payload = {
        employeeCode: formData.employeeCode,
        roleId: formData.roleId,
        unitDepartments: [
          {
            unitId: Number(formData.unitId),
            departmentIds: formData.departments.map((d: any) => d.value),
          },
        ],
      };

      const res = await axiosInstance.post('/User/assign-or-update', payload);

      if (res.data.success) {
        toast.success('Role Updated successfully');
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!formData) return null;

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: '40px',
      maxHeight: '80px', // 🔥 max height limit
      overflow: 'hidden',
    }),

    valueContainer: (provided: any) => ({
      ...provided,
      flexWrap: 'wrap', // ✅ allow wrap
      overflowY: 'auto', // ✅ vertical scroll
      maxHeight: '80px',
    }),

    multiValue: (provided: any) => ({
      ...provided,
      maxWidth: '100%',
    }),
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Edit Role Assignment</DialogTitle>
        </DialogHeader>

        <div>
          <Label>Role</Label>
          <input value={formData.role} disabled className="w-full border p-2 rounded bg-gray-100" />
        </div>

        <div>
          <Label>Employee</Label>
          <input value={formData.employeeName} disabled className="w-full border p-2 rounded bg-gray-100" />
        </div>

        <div>
          <Label>Unit</Label>
          <ShadSelect value={formData.unitId} onValueChange={(val) => setFormData((prev: any) => ({ ...prev, unitId: val }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select Unit" />
            </SelectTrigger>
            <SelectContent>
              {unitOptions.map((u: any) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label}
                </SelectItem>
              ))}
            </SelectContent>
          </ShadSelect>
        </div>

        <div>
          <Label>Departments</Label>
          <Select
            isMulti
            value={formData.departments}
            onChange={(val) =>
              setFormData((prev: any) => ({
                ...prev,
                departments: [...(val || [])],
              }))
            }
            options={departmentOptions}
            closeMenuOnSelect={false}
            styles={customSelectStyles}
            menuPlacement="bottom"
          />
        </div>

        {/* Button */}
        <Button onClick={handleUpdate} disabled={loading}>
          Update
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EditRoleDialog;
