import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle  } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ElectricityBill = () => {

const [month, setMonth] = useState('');

const dummyElectricityData = [
  {
    quarterNo: "Q-101",
    employeeName: "Amit Sharma",
    designation: "Senior Engineer",
    positionGrade: "PG-6",
    unit: "Corporate Office",
    oldReading: 1200,
    currentReading: 1350,
    ratePerUnit: 6,
    rent: 4500,
  },
  {
    quarterNo: "Q-102",
    employeeName: "Neha Verma",
    designation: "HR Manager",
    positionGrade: "PG-7",
    unit: "Noida",
    oldReading: 980,
    currentReading: 1120,
    ratePerUnit: 6,
    rent: 5200,
  },
  {
    quarterNo: "Q-103",
    employeeName: "Rahul Singh",
    designation: "Accountant",
    positionGrade: "PG-5",
    unit: "Corporate Office",
    oldReading: 1500,
    currentReading: 1680,
    ratePerUnit: 6,
    rent: 4000,
  }
];


return (
    <div className="min-h-screen  p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Electricity Bill</h1>
          <p className="text-gray-600 mt-1">Manage electricity bill for all units</p>
        </div>
       <div>
          <p className= "text-gray-900 mt-1">Select Month</p>
          <input
            className='border p-2'
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
       </div>
      </div>
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Electricity Bill Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Employee Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Designation</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Position Grade</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Unit</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Quater Rent</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Quater No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Old Readings</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Current Readings</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Consumption</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Rate Per Unit</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Bill Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Total Rent</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                 {dummyElectricityData.map((item, index) => {
                  const consumption = item.currentReading - item.oldReading;
                  const billAmount = item.ratePerUnit * consumption
                  const totalRent = item.rent + billAmount
                return (
                <tr key={index} className="hover:bg-gray-50">
   
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.employeeName}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.designation}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.positionGrade}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.unit}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                     <span className="text-sm font-semibold text-green-600">₹{item.rent}</span>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    {item.quarterNo}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                  {item.oldReading}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                  {item.currentReading}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                  {consumption}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                  <span className="text-sm font-semibold text-green-600">₹{item.ratePerUnit}</span>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                     <span className="text-sm font-semibold text-green-600">₹{billAmount}</span>
                  {/* <Input
                  className='w-1/2'
                  placeholder='Enter Amount'
                  type='text'
                  value={amount}
                  onChange={(e)=>{
                    setAmount(e.target.value)
                  }}
                  /> */}
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                  <span className="text-sm font-semibold text-green-600">₹{totalRent}</span>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                  <Button
                  type='button'
                  >
                  Submit
                  </Button>
                  </td>
                </tr>
                );
                })}
              </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

export default ElectricityBill
