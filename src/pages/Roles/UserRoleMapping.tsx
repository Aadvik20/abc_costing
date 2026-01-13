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
import { Trash2Icon } from 'lucide-react';
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

  const masterRoleList = useAppSelector((state: RootState) => state.masterRoles.roles);
  const { units: masterUnits } = useAppSelector((state: RootState) => state.masterData);
  const { employees:employeesList} = useAppSelector((state: RootState) => state.employeeList);

  // const { employees: employeesList} = useAppSelector((state: RootState) => state.employee);
  const { empRoles:userList, loading: isUserListLoading } = useAppSelector((state: RootState) => state.userRoles);
  console.log(userList);
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

  const unitOptions = useMemo(() => masterUnits.map((unit) => ({ unitId: unit.unitid, unitName: unit.unitName })), [masterUnits]);

  // const employeesListFiltered = useMemo(() => {
  //   if (!selectedUnit) return [];
  //   return employeesList.filter((emp) => emp.unitId === selectedUnit.unitId);
  // }, [employeesList, selectedUnit]);

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

    const payload =
      isEditing && currentRole
        ? {
            assignmentId: currentRole?.id,
            newUnitId: empUnit,
            newRoleId: selectedRoles.roleId,
          }
        : {
            comployeeCode,
            unitId: empUnit,
            roleId: selectedRoles.roleId,
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
      { accessorKey: 'employee.employeeCode', header: 'Employee Code' },
      { accessorKey: 'employee.userName', header: 'Employee Name' },
      { accessorKey: 'employee.post', header: 'Designation' },
      { accessorKey: 'employee.unitName', header: 'Unit' },
      { accessorKey: 'roleName', header: 'Role(s)', cell: ({ row }: any) =>{
        return (
          row.original.roles.map((item)=> <div className='flex items-center gap-2 flex-col'><Badge variant="secondary">{item.roleName}</Badge></div>)
        )
      } },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }: any) => {
          const rowData = row.original;
          return (
            <div className="flex gap-2 items-center justify-center">
              <Button
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => {
                  const unit = masterUnits.find((u) => u.unitId === rowData.unitId);
                  setSelectedUnit(unit || null);

                  setSelectedEmployee({
                    employeeId: rowData?.employeeDetails?.employeeMasterAutoId,
                    employeeCode: rowData?.employeeDetails?.empCode,
                    employeeName: rowData?.employeeDetails?.userName,
                    designation: rowData?.employeeDetails?.post,
                    unitId: rowData.empUnitId,
                    location: rowData?.employeeMasterAutoId?.location,
                  });

                  const rolesFromUser = userList.find((u) => u?.employeeDetails?.employeeMasterAutoId === rowData?.employeeDetails?.employeeMasterAutoId);
                  const matchedRoles = masterRoleList.find((m) => m.roleName.toLowerCase() === rolesFromUser.roleName.toLowerCase());
                  const result = matchedRoles ? { ...matchedRoles, ...rolesFromUser } : null;

                  setCurrentRole(result);
                  setSelectedRoles(result);
                  setIsEditing(true);
                  setIsAddOpen(true);
                }}
              >
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setRowToDeleteId(row.original.id);
                  setIsDeleteOpen(true);
                }}
              >
                <Trash2Icon />
              </Button>
            </div>
          );
        },
      },
    ],
    [masterUnits, userList, masterRoleList]
  );

  const handleConfirmDelete = async () => {
    if (!rowToDeleteId) return;
    const response = await dispatch(deleteEmpRoleAssignment({ mappingId: rowToDeleteId })).unwrap();
    if(response?.statusCode===200){
      toast.success("User Role deleted successfully");
      dispatch(fetchEmpRoleList());
    }else{
      toast.error("Something Went Wrong!")
    }
    setRowToDeleteId(null);
    setIsDeleteOpen(false);
  };

  if (loading || isUserListLoading) return <Loader />;

  return (
    <div className="p-6 font-sans">
      <div className="bg-white border border-blue-200 shadow-lg rounded-xl p-6 space-y-6">
        <h1 className="text-2xl font-bold text-blue-800">User Role Mapping</h1>

        <AdminTable
          data={userList}
          columns={columns}
          onAddClick={() => {
            resetForm();
            setIsAddOpen(true);
          }}
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
        {/* Delete row confirm */}
        {/* <ConfirmDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          title="Delete Role?"
          description="Are you sure want to delete this role?"
          confirmLabel="Delete"
          variant="destructive"
          onConfirm={handleConfirmDelete}
          loading={loading}
        /> */}
      </div>
    </div>
  );
};

export default UserRoleMapping;
