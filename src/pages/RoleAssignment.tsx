import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select as ShadSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Select from 'react-select';
import { Label } from '@/components/ui/label';
import TableList from '@/components/ui/data-table';
import Loader from '@/components/ui/loader';
import { Edit, Trash2 } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EditRoleDialog from '@/components/dailogs/EditRoleDialog';

const RoleAssignment = () => {
  const [selectedUnits, setSelectedUnits] = useState('');
  const [selectedDepartments, setSelectedDepartments] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { units } = useAppSelector((state: RootState) => state.user);
  const { departments } = useAppSelector((state: RootState) => state.user);
  const { employees } = useAppSelector((state: RootState) => state.masterData);
  const [roles, setRoles] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editRowData, setEditRowData] = useState<any>(null);

  const unitOptions = useMemo(
    () =>
      (units || []).map((unit: any) => ({
        value: String(unit.value),
        label: unit.label,
      })),
    [units]
  );

  const filteredDepartments = useMemo(() => {
    return departments.map((d: any) => ({
      value: d.value,
      label: d.label,
    }));
  }, [selectedUnits, departments]);

  const isAllSelected = selectedDepartments.length === filteredDepartments.length;

  const deptOptions = [
    {
      label: isAllSelected ? 'Deselect All' : 'Select All',
      value: 'all',
    },
    ...filteredDepartments,
  ];

  // useEffect(() => {
  //   setSelectedDepartments([]);
  // }, [selectedUnits]);

  useEffect(() => {
    if (units.length === 1 && !selectedUnits) {
      setSelectedUnits(units[0].value);
    }
  }, [units, selectedUnits]);

  const filteredEmployees = useMemo(() => {
    return (employees || []).filter((emp: any) => {
      const selectedUnitLabel = units.find((u: any) => u.value === selectedUnits)?.label;

      const matchUnit = selectedUnitLabel ? emp.location === selectedUnitLabel : true;

      const matchDept = selectedDepartments.length > 0 ? selectedDepartments.some((d) => d.label === emp.deptDfccil) : true;

      return matchUnit && matchDept;
    });
  }, [employees, selectedUnits, selectedDepartments, units]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/User/roles');

      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/User/employee-roles');

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    if (!data?.length) return [];

    return data.filter((row) => {
      const rowUnits = row.units || [];

      const unitMatch = rowUnits.some((u: any) => units?.some((userUnit: any) => Number(userUnit.value) === u.unitId));

      const deptMatch = rowUnits.some((u: any) =>
        (u.departments || []).some((d: any) => departments?.some((userDept: any) => Number(userDept.value) === d.depId))
      );

      return unitMatch && deptMatch;
    });
  }, [data, units, departments]);

  const roleOptions = useMemo(
    () =>
      roles.map((role: any) => ({
        value: String(role.roleId),
        label: role.roleName,
      })),
    [roles]
  );

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: '40px',
      maxHeight: '80px',
    }),

    valueContainer: (provided: any) => ({
      ...provided,
      flexWrap: 'wrap', // ✅ allow wrap
      overflowY: 'auto', // ✅ vertical scroll
      maxHeight: '80px',
    }),

    multiValue: (provided: any) => ({
      ...provided,
      flexShrink: 0,
    }),
  };

  const employeeOptions = useMemo(() => {
    return filteredEmployees.map((emp: any) => ({
      value: emp.employeeCode,
      label: emp.userName,
      empName: emp.userName,
      empCode: emp.employeeCode,
      designation: emp.post,
      department: emp.deptDfccil,
    }));
  }, [filteredEmployees]);

  const handleEdit = (row: any) => {
    setEditRowData(row);
    setEditDialogOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        id: 'sn',
        header: 'Sr.No.',
        cell: ({ row }) => row.index + 1,
      },
      {
        id: 'empCode',
        header: 'Employee Code',
        cell: ({ row }) => row.original?.employeeCode,
      },
      {
        id: 'emplName',
        header: 'Employee Name',
        cell: ({ row }) => <div className="capitalize">{row.original?.employeeName}</div>,
      },
      {
        id: 'unit',
        header: 'Unit',
        cell: ({ row }) => {
          const units = row.original?.units || [];

          if (units.length === 0) return '-';

          return <div>{units.map((u: any) => u.unitName).join(', ')}</div>;
        },
      },
      {
        id: 'departments',
        header: 'Departments',
        cell: ({ row }) => {
          const units = row.original?.units || [];

          const departments = units.flatMap((u: any) => (u.departments || []).map((d: any) => d.depName));

          return <div className="capitalize">{departments.length > 0 ? departments.join(', ') : '-'}</div>;
        },
      },
      {
        id: 'role',
        header: 'Role',
        cell: ({ row }) => <div className="capitalize">{row.original?.role || '-'}</div>,
      },
      {
        id: 'action',
        header: 'Action',
        cell: ({ row }) => {
          const rowData = row.original;

          return (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(rowData)}>
                <Edit />
              </Button>

              <ConfirmDialog
                triggerLabel=""
                onConfirm={() => handleDelete(rowData)}
                actionLabel="Deactivate Role"
                title="Deactivate Role from Employee"
                description="Are you sure you want to deactivate this role from the employee? This action cannot be undone."
                icon={<Trash2 />}
              />
            </div>
          );
        },
      },
    ],
    []
  );

  const handleDelete = async (row: any) => {
    try {
      setLoading(true);

      const payload = {
        employeeCode: row.employeeCode,
        roleId: row.roleId,
      };

      const res = await axiosInstance.post('/User/deactivate-role', payload);

      if (res.data.success) {
        toast.success('Role removed successfully');
        fetchData();
      }
    } catch (error) {
      console.error(error);
      toast.error('Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedEmployee || !selectedRole || !selectedUnits) {
      toast.error('Please select all fields');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        employeeCode: selectedEmployee.value,
        roleId: Number(selectedRole),
        unitDepartments: [
          {
            unitId: Number(selectedUnits),
            departmentIds: selectedDepartments.map((d) => d.value),
          },
        ],
      };

      const res = await axiosInstance.post('/User/assign-or-update', payload);

      if (res.data.success) {
        toast.success('Role Assigned successfully');

        setSelectedEmployee(null);
        setSelectedRole('');
        setSelectedDepartments([]);
        setSelectedUnits('');
        fetchData();
      }
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-full">
      <h2 className="text-xl sm:text-2xl font-semibold">Role Assignment</h2>
      {loading && <Loader />}
      <Card className="w-full">
        <CardContent className="p-3">
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-5 gap-3 lg:items-start">
            {/* Units Multi Select */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block">Unit</Label>
              <ShadSelect value={selectedUnits} onValueChange={setSelectedUnits}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </ShadSelect>
            </div>

            {/* Departments Multi Select */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block">Select Departments</Label>

              <Select
                isMulti
                value={selectedDepartments}
                onChange={(val) => {
                  if (!val) {
                    setSelectedDepartments([]);
                    return;
                  }

                  const isAllSelected = val.some((option) => option.value === 'all');

                  if (isAllSelected) {
                    // If already all selected → deselect all
                    if (selectedDepartments.length === filteredDepartments.length) {
                      setSelectedDepartments([]);
                    } else {
                      // Select all (exclude "all" option itself)
                      setSelectedDepartments(filteredDepartments);
                    }
                  } else {
                    setSelectedDepartments(val as any[]);
                  }
                }}
                options={deptOptions}
                placeholder="Select Departments"
                closeMenuOnSelect={false}
                styles={customSelectStyles}
              />
            </div>

            {/* Employee Select */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block">Select Employee</Label>
              <Select
                id="selectedEmployee"
                value={selectedEmployee}
                onChange={(val) => setSelectedEmployee(val)}
                options={employeeOptions}
                placeholder="Select employee"
                isClearable
                styles={customSelectStyles}
                isDisabled={!selectedUnits && selectedDepartments.length === 0}
                formatOptionLabel={(option: any) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full font-bold uppercase">
                      {option?.empName?.[0]}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{option?.empName}</div>
                      <div className="text-xs text-gray-500">
                        {option?.empCode} | {option?.department} | {option?.designation}
                      </div>
                    </div>
                  </div>
                )}
                filterOption={(option, inputValue) => {
                  const search = inputValue.toLowerCase();
                  return (
                    option.data.empName?.toLowerCase().includes(search) ||
                    option.data.empCode?.toLowerCase().includes(search) ||
                    option.data.designation?.toLowerCase().includes(search) ||
                    option.data.department?.toLowerCase().includes(search)
                  );
                }}
              />
            </div>

            {/* Role Select */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block">Select Role</Label>
              <ShadSelect value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </ShadSelect>
            </div>

            {/* Assign Button */}
            <div className="w-full lg:w-auto">
              <Button
                onClick={handleAssignRole}
                className="w-full lg:w-auto lg:px-8 mt-7"
                disabled={!selectedUnits || !selectedEmployee || !selectedRole || loading}
              >
                Assign Role
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="w-full">
        <div className="w-full overflow-x-auto">
          <div className="min-w-full">
            <div>
              <TableList columns={columns} data={filteredData} />
            </div>
          </div>
        </div>
      </div>
      <EditRoleDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        data={editRowData}
        unitOptions={unitOptions}
        departmentOptions={deptOptions}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default RoleAssignment;
