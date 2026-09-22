import React, { useState } from 'react';
import MsmeVendorReport from './MsmeVendorReport';
import VendorAgeingReport from './VendorAgeingReport';

type TabType = 'msme-report' | 'vendor-report';

const VendorOutstandingReport = () => {
  const [activeTab, setActiveTab] = useState<TabType>('msme-report');

  const tabs: { id: TabType; label: string }[] = [
    { id: 'msme-report', label: 'MSME Vendor Outstanding and Ageing Report' },
    { id: 'vendor-report', label: 'Vendor Ageing Schedule' },
  ];

  return (
    <div className="p-4">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-3">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Vendor Outstanding Reports</h1>
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
        {activeTab === 'msme-report' && <MsmeVendorReport />}
        {activeTab === 'vendor-report' && <VendorAgeingReport />}
      </div>
    </div>
  );
};
export default VendorOutstandingReport;
