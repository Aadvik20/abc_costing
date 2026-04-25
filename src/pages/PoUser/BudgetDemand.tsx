import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useMemo } from 'react';
import Select from 'react-select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Info, Layers3, LayoutList, Trash2, Wrench } from 'lucide-react';
import { RootState } from '@/app/store';
import axiosInstance from '@/services/axiosInstance';
import toast from 'react-hot-toast';
import Loader from '@/components/ui/loader';
import { formatDecimal, formatRupees, monthOptions, yearOptions } from '@/lib/helperFunction';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import BudgetRequestList from '@/pages/PoUser/BudgetRequestList';
import { showCustomToast } from '@/components/common/showCustomToast';
import { components } from 'react-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Omform from './Omform';
import Capexform from './CapexForm';

const BudgetDemand = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [subTab, setSubTab] = useState<'O & M' | 'CAPEX'>('O & M');
  return (
    <div className="p-4 md:p-8">
      {loading && <Loader />}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Demand Budget</h1>
          <p className="text-gray-600 mt-1">Raise and track budget requests for departments within your unit</p>
        </div>
      </div>
      <div className="flex gap-8 border-slate-200 px-2 mt-8">
        <button
          onClick={() => setActiveTab('create')}
          className={`pb-4 px-2 flex items-center gap-2 text-sm font-bold transition-all relative ${
            activeTab === 'create' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers3 size={18} />
          Raise New
          {activeTab === 'create' && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.4)]" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-4 px-2 flex items-center gap-2 text-sm font-bold transition-all relative ${
            activeTab === 'list' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <LayoutList size={18} />
          Submitted Requests
          {activeTab === 'list' && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.4)]" />
          )}
        </button>
      </div>
      {activeTab === 'create' && (
        <div className="p-6 bg-white rounded-xl shadow">
          <div className="w-full mb-4">
            <Tabs value={subTab} onValueChange={(val) => setSubTab(val as 'O & M' | 'CAPEX')}>
              <div>
                <TabsList className="gap-1 p-1 rounded-full bg-slate-100 border border-slate-200 shadow-sm">
                  <TabsTrigger
                    value="O & M"
                    className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold
    text-emerald-600 hover:bg-emerald-50
    data-[state=active]:bg-emerald-600 data-[state=active]:text-white
    data-[state=active]:shadow-lg transition-all"
                  >
                    <Wrench className="h-4 w-4" /> O & M
                  </TabsTrigger>
                  
                  <TabsTrigger
                    value="CAPEX"
                    className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold
    text-indigo-600 hover:bg-indigo-50
    data-[state=active]:bg-indigo-600 data-[state=active]:text-white
    data-[state=active]:shadow-lg transition-all"
                  >
                    <Building2 className="h-4 w-4" /> CAPEX
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="O & M">
                  <Omform setLoading={setLoading} />
                </TabsContent>

                <TabsContent value="CAPEX">
                  <Capexform setLoading={setLoading} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      )}

      {activeTab == 'list' && <BudgetRequestList />}
    </div>
  );
};

export default BudgetDemand;
