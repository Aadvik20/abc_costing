import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle  } from '@/components/ui/card';


const ElectricityBill = () => {
   
  const [month, setMonth] = useState('');

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
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Quater No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Old Readings</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Current Readings</th>
                    <th className="px-1 py-3 text-left text-sm font-semibold text-white">Consumption</th>
                    <th className="px-1 py-3 text-left text-sm font-semibold text-white">Rate Per Unit</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
    </div>
  )
}

export default ElectricityBill
