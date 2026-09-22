import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchPoData } from '@/features/user/PoSlice';
import React, { useEffect, useMemo, useState } from 'react';
import ZeroPoReport from './ZeroPoReport';
import NegativePoReport from './NegativePoReport';
import Loader from '@/components/ui/loader';

type TabType = 'po-report' | 'adverse-report';

const PoReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('po-report');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'po-report', label: 'PO Report' },
    { id: 'adverse-report', label: 'Adverse PO Report' },
  ];
  const dispatch = useAppDispatch();
  const { po, loading } = useAppSelector((state) => state.poSlice);

  useEffect(() => {
    if (!po || po.length === 0) {
      dispatch(fetchPoData());
    }
  }, [dispatch, po]);

  const { zeroPoData, negativePoData } = useMemo(() => {
    if (!Array.isArray(po)) {
      return {
        zeroPoData: [],
        negativePoData: [],
      };
    }

    return {
      zeroPoData: po.filter((item) => Number(item.pendingLiabilities) === 0),

      negativePoData: po.filter((item) => Number(item.pendingLiabilities) < 0),
    };
  }, [po]);

  return (
    <div className="p-4">
      {loading && <Loader/>}
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-3">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payroll Reports</h1>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
          relative flex items-center gap-2
          px-5 py-2
          rounded-lg
          text-xs font-semibold
          border
          transition-all duration-200
          ${
            isActive
              ? 'bg-white text-blue-700 border-blue-200 shadow-sm'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-white hover:text-slate-800 hover:border-slate-300'
          }
        `}
            >
              {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />}

              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Component Based on Active Tab */}
      <div className="w-full mt-4">
        {activeTab === 'po-report' && <ZeroPoReport data={zeroPoData} />}
        {activeTab === 'adverse-report' && <NegativePoReport data={negativePoData} />}
      </div>
    </div>
  );
};

export default PoReport;
