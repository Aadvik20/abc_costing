import { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import AdminTable from '@/components/admin/AdminTable';
import AddUserMapRole from '@/components/admin/AddUserRoleMap';
import { Button } from '@/components/ui/button';
import Loader from '@/components/ui/loader';
import { deleteEmpRoleAssignment, fetchEmpRoleList } from '@/features/userRole/userRoles';
import toast from 'react-hot-toast';
import axiosInstance from '@/services/axiosInstance';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2Icon } from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { Employee, fetchEmployeeList } from '@/features/quarter/employeeListSlice';
import { fetchMasterRole } from '@/features/userRole/masterRoles';

const UserRoleMapping = () => {
  const dispatch = useAppDispatch();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const onDialogeClose = () => {
    setIsAddOpen(false);
    setSelectedUnit(null);
  };

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<any>({});
  const [currentRole, setCurrentRole] = useState<any>({});
  const [selectedUnit, setSelectedUnit] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [rowToDeleteId, setRowToDeleteId] = useState(null);
  console.log(selectedEmployee, 'selectedEmployee');
  const masterRoleList = useAppSelector((state: RootState) => state.masterRoles.roles);
  const { units: masterUnits } = useAppSelector((state: RootState) => state.masterData);
  const { employees: employeesList } = useAppSelector((state: RootState) => state.employeeList);

  // const { employees: employeesList} = useAppSelector((state: RootState) => state.employee);
  const { empRoles: userList = [], loading: isUserListLoading } = useAppSelector((state: RootState) => state.userRoles);
  useEffect(() => {
    dispatch(fetchEmpRoleList());
    dispatch(fetchMasterRole());
  }, [dispatch]);

  useEffect(() => {
    if (selectedUnit) {
      dispatch(fetchEmployeeList({ location: selectedUnit?.name }));
    } else if (!isEditing) {
      //   dispatch(clearEmployees());
    }
  }, [selectedUnit, dispatch]);

  const unitOptions = useMemo(() => masterUnits?.map((unit) => ({ unitId: unit.unitid, unitName: unit.unitName })), [masterUnits]);

  // const employeesListFiltered = useMemo(() => {
  //   if (!selectedUnit) return [];
  //   return employeesList.filter((emp) => emp.unitId === selectedUnit.unitId);
  // }, [employeesList, selectedUnit]);
  console.log(employeesList, 'employeesList');
  const resetForm = () => {
    setSelectedEmployee(null);
    setSelectedRoles(null);
    setCurrentRole(null);
    setSelectedUnit(null);
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !selectedRoles || !selectedUnit) {
      toast.error('Please select unit, employee, and at least one role.');
      return;
    }

    const comployeeCode = selectedEmployee.employeeCode;
    const empUnit = selectedUnit.unitId.toString();

    const endpoint = isEditing ? '/User/EditRoleAssignment' : '/User/AddUserRoleMapping';
    const method = isEditing ? 'put' : 'post';

    const roleIds = selectedRoles?.map((role: any) => {
      return { roleId: role.id };
    });
    const payload =
      isEditing && currentRole
        ? {
            assignmentId: currentRole?.id,
            newUnitId: empUnit,
            newRoleId: roleIds,
          }
        : {
            empCode: comployeeCode,
            empUnitId: empUnit,
            userRoles: roleIds,
          };

    setLoading(true);
    try {
      const res = await axiosInstance[method](endpoint, payload);
      const { statusCode, message } = res.data;

      if (statusCode === 201 || statusCode === 200) {
        toast.success(isEditing ? 'Role(s) updated successfully!' : 'Role(s) assigned successfully!');
        dispatch(fetchEmpRoleList());
      } else {
        toast.error(message || 'Request failed.');
      }
    } catch (e) {
      console.error('Role mapping error:', e);
      toast.error('Something went wrong.');
    } finally {
      resetForm();
      setIsAddOpen(false);
      setLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'SrNo',
        header: 'Sr. No.',
        cell: ({ row }: any) => row.index + 1,
      },
      { accessorKey: 'empCode', header: 'Employee Code' },
      { accessorKey: 'userName', header: 'Employee Name' },
      { accessorKey: 'post', header: 'Designation' },
      { accessorKey: 'location', header: 'Unit' },
      {
        accessorKey: 'roleName',
        header: 'Role(s)',
        cell: ({ row }: any) => {
          const roles = row.original.roles || [];
          return (
            <div className="flex flex-wrap gap-1.5 max-w-[220px]">
              {roles?.map((item, idx) => (
                <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-xs rounded-md">
                  {item.roleName}
                </Badge>
              ))}
            </div>
          );
        },
      },
    ],
    [masterUnits, userList, masterRoleList]
  );

  const handleConfirmDelete = async () => {
    if (!rowToDeleteId) return;
    const response = await dispatch(deleteEmpRoleAssignment({ empCode: rowToDeleteId })).unwrap();
    if (response?.statusCode === 200) {
      toast.success('User Role deleted successfully');
      dispatch(fetchEmpRoleList());
    } else {
      toast.error('Something Went Wrong!');
    }
    setRowToDeleteId(null);
    setIsDeleteOpen(false);
  };

  if (loading || isUserListLoading) return <Loader />;

  return (
    <div className="p-6 font-sans">
      <h1 className="text-3xl font-bold text-gray-900">User Role Mapping</h1>

      <div className="mt-4">
        <AdminTable
          data={userList || []}
          columns={columns}
          rightElements={
            <>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddOpen(true);
                }}
              >
                <Plus /> New Role Map
              </Button>
            </>
          }
          inputPlaceholder="Search by name or designation"
        />

        <AddUserMapRole
          open={isAddOpen}
          onClose={onDialogeClose}
          roles={masterRoleList}
          unitOptions={unitOptions}
          employees={employeesList}
          selectedUnit={selectedUnit}
          selectedEmployee={selectedEmployee}
          selectedRoles={selectedRoles}
          onUnitChange={setSelectedUnit}
          onEmployeeChange={setSelectedEmployee}
          onRoleChange={setSelectedRoles}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default UserRoleMapping;
