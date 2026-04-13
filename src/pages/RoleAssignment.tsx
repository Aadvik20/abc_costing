import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import TableList from '@/components/ui/data-table';
import Loader from '@/components/ui/loader';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { X, Check, ChevronDown } from 'lucide-react';


const RoleAssignment = () => {
  const [selectedUnits, setSelectedUnits] = useState<any[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);

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
        accessorKey: 'empCode',
        cell: ({ row }) => row.original?.empCode,
      },
      {
        id: 'emplName',
        accessorKey: 'emplName',
        header: 'Employee Name',
        cell: ({ row }) => <div className="capitalize">{row?.original?.emplName}</div>,
      },
      {
        id: 'unit',
        header: 'Unit',
        accessorKey: 'location',
        cell: ({ row }) => {
          return <div>{row?.original?.location}</div>;
        },
      },
      {
        id: 'deptDFCCIL',
        accessorKey: 'deptDFCCIL',
        header: 'Department',
        cell: ({ row }) => <div className="capitalize">{row?.original?.deptDFCCIL}</div>,
      },

      {
        id: 'roles',
        header: 'Role',
        accessorKey: 'roles',
        cell: ({ row }) => {
          const roles = row.original?.roles;
          if (!roles || roles.length === 0) return 'No roles assigned';
          return <div className="capitalize">{roles.map((role) => role.roleName).join(', ')}</div>;
        },
      },
      {
        id: 'action',
        header: 'Action',
        accessorKey: 'action',
        cell: ({ row }) => {
          return <div className=""></div>;
        },
      },
    ],
    []
  );

  const unitOptions = [
    { value: '1', label: 'Unit 1' },
    { value: '2', label: 'Unit 2' },
  ];

  const departmentOptions = [
    { value: '1', label: 'HR' },
    { value: '2', label: 'Finance' },
  ];

  const employeeOptions = [
    { value: '1', label: 'John Doe' },
    { value: '2', label: 'Jane Smith' },
  ];

  const roleOptions = [
    { value: '1', label: 'Admin' },
    { value: '2', label: 'Manager' },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-full">
      <h2 className='text-xl sm:text-2xl font-semibold'>Role Assignment</h2>
      {loading && <Loader />}
      <Card className="w-full">
        <CardContent className="p-3">
          <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-5 gap-3 lg:items-start">
            {/* Units Multi Select */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block">Select Units</Label>

              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex flex-wrap items-center gap-2 border rounded-md px-3 py-2 min-h-[40px] cursor-pointer">
                    {selectedUnits.length > 0 ? (
                      selectedUnits.map((unit) => (
                        <Badge key={unit.value} variant="secondary" className="flex items-center gap-1">
                          {unit.label}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUnits(selectedUnits.filter((u) => u.value !== unit.value));
                            }}
                          />
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Select Units</span>
                    )}

                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </div>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search units..." />
                    <CommandEmpty>No unit found.</CommandEmpty>

                    <CommandGroup>
                      {unitOptions.map((unit) => {
                        const isSelected = selectedUnits.some((u) => u.value === unit.value);

                        return (
                          <CommandItem
                            key={unit.value}
                            onSelect={() => {
                              if (isSelected) {
                                setSelectedUnits(selectedUnits.filter((u) => u.value !== unit.value));
                              } else {
                                setSelectedUnits([...selectedUnits, unit]);
                              }
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                            {unit.label}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Departments Multi Select */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block">Select Departments</Label>

              <Popover>
                <PopoverTrigger asChild>
                  <div className="flex flex-wrap items-center gap-2 border rounded-md px-3 py-2 min-h-[40px] cursor-pointer">
                    {selectedDepartments.length > 0 ? (
                      selectedDepartments.map((dept) => (
                        <Badge key={dept.value} variant="secondary" className="flex items-center gap-1">
                          {dept.label}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDepartments(selectedDepartments.filter((d) => d.value !== dept.value));
                            }}
                          />
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Select Departments</span>
                    )}

                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </div>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search departments..." />
                    <CommandEmpty>No department found.</CommandEmpty>

                    <CommandGroup>
                      {departmentOptions.map((dept) => {
                        const isSelected = selectedDepartments.some((d) => d.value === dept.value);

                        return (
                          <CommandItem
                            key={dept.value}
                            onSelect={() => {
                              if (isSelected) {
                                setSelectedDepartments(selectedDepartments.filter((d) => d.value !== dept.value));
                              } else {
                                setSelectedDepartments([...selectedDepartments, dept]);
                              }
                            }}
                          >
                            <Check className={`mr-2 h-4 w-4 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                            {dept.label}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Employee Select */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block">Select Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeeOptions.map((emp) => (
                    <SelectItem key={emp.value} value={emp.value}>
                      {emp.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Select */}
            <div className="w-full">
              <Label className="text-sm font-medium mb-2 block">Select Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
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
              </Select>
            </div>

            {/* Assign Button */}
            <div className="w-full lg:w-auto">
              <Button className="w-full lg:w-auto lg:px-8 mt-7">
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
              <TableList columns={columns} data={[]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignment;
