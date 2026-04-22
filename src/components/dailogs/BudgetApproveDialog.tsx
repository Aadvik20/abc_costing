import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatDecimal, formatRupees, monthOptions } from '@/lib/helperFunction';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { status } from '@/constant/status';
import { FileText, Wallet, Calculator, BookOpen } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  data: any[];
  onApprove: (req: any, status: string, remarks?: string) => void;
}

const BudgetApproveDialog = ({ open, onClose, data, onApprove }: Props) => {

  const totalRequests = data.length;

  const groupedData = useMemo(() => {
    const groups = {};

    data.forEach((item) => {
      const key = item.statusName;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  }, [data]);

  const statuses = Object.keys(groupedData);

  const [activeTab, setActiveTab] = useState(statuses[0]);

  const currentData = totalRequests > 1 ? groupedData[activeTab] || [] : data;
  useEffect(() => {
    if (statuses.length) {
      setActiveTab(statuses[0]);
    }
  }, [data]);

  const isPending = currentData.length > 0 && currentData.every((item) => item.statusName === status.Pending_Finance.label);

  const getTabLabel = (statusName: string) => {
    if (statusName === status.Pending_Finance.label) {
      return 'Pending';
    }
    return statusName;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl border-none"
      >
        {/* HEADER */}
        <div className="px-8 py-5 border-b bg-white flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Request Details</h2>
        </div>

        {totalRequests > 1 && (
          <div className="flex gap-2 px-8 pt-3 border-b bg-white">
            {statuses.map((statusKey) => (
              <button
                key={statusKey}
                onClick={() => setActiveTab(statusKey)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
                  activeTab === statusKey ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {getTabLabel(statusKey)}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-slate-50/50 px-8 py-6">
          {data.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-medium">No data found</div>
          ) : (
            <div className="space-y-6">
              {(totalRequests > 1 ? groupedData[activeTab] : data)?.map((req, index) => {
                const displayStatus = req.statusName === status.Pending_Finance.label ? 'Pending' : req.statusName;
                return (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* CARD HEADER */}
                    <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-100">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{req.unitName}</h2>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{req.departmentName}</p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${
                          req.statusName === status.Pending_Finance.label
                            ? 'bg-amber-50 text-amber-700 ring-amber-200'
                            : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        }`}
                      >
                        {displayStatus}
                      </div>
                    </div>

                    {/* INFO GRID */}
                    <div className="grid grid-cols-2 gap-px  border-b border-slate-100">
                      <div className="bg-white p-5 flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                          <Wallet size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Actual Amount</p>
                          <p className="text-lg font-bold text-slate-900 tabular-nums leading-none">{formatRupees(req.actualAmount)}</p>
                        </div>
                      </div>
                      {req.gl != 'null' && req.gl !== '' && (
                        <div className="bg-white p-5 flex items-center gap-4">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">GL No.</p>
                            <p className="text-sm font-semibold text-slate-700 leading-none">{req.gl || '-'}</p>
                          </div>
                        </div>
                      )}

                      {/* <div className="bg-white p-5 flex items-center gap-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                          <Calendar size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Period</p>
                          <p className="text-sm font-semibold text-slate-700 leading-none">
                            {monthOptions.find((m) => m.value === req.month)?.label} {req.year}
                          </p>
                        </div>
                      </div> */}
                    </div>

                    {/* DESCRIPTION SECTION */}
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Project Description</p>
                        {req.fileUrl && (
                          <a
                            href={req.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded"
                          >
                            <FileText size={14} /> VIEW ATTACHMENT
                          </a>
                        )}
                      </div>

                      <div
                        className="text-sm text-slate-600 leading-relaxed prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: req.demandDetails }}
                      />
                    </div>

                    {/* COMPONENT TABLE */}
                    <div className="bg-white border-t shadow-sm overflow-hidden mt-5">
                      <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2">
                        <Calculator size={16} />
                        <h3 className="text-sm font-bold uppercase">Component Breakdown</h3>
                      </div>

                      <table className="w-full text-sm">
                        <thead className="bg-white text-[10px] uppercase border-b">
                          <tr>
                            <th className="px-6 py-3 text-center">Component</th>
                            <th className="px-6 py-3 text-center">Unit</th>
                            <th className="px-6 py-3 text-right">Qty</th>
                            <th className="px-6 py-3 text-right">Rate</th>
                            <th className="px-6 py-3 text-right">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {req.componentsDetails?.map((comp, i) => (
                            <tr key={i} className="border-t hover:bg-slate-50">
                              <td className="px-6 py-3 font-medium">{comp.componentDescription}</td>

                              <td className="px-6 py-3 text-center">{comp.munit || '-'}</td>

                              <td className="px-6 py-3 text-right">{comp.qty > 0 ? formatDecimal(comp.qty) : '-'}</td>

                              <td className="px-6 py-3 text-right">{comp.rateOfUnit > 0 ? formatRupees(comp.rateOfUnit) : '-'}</td>

                              <td className="px-6 py-3 text-right font-bold">{formatRupees(comp.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* FIXED FOOTER */}
        {/* {data.length > 0 && (
          <div className="border-t px-8 py-5 bg-white flex justify-end items-center gap-4 flex-shrink-0">
            {data[0].statusName === status.Pending_Finance.label ? (
              <>
                <ConfirmDialog
                  triggerClassName="h-10 px-8 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-sm shadow-md shadow-amber-100 transition-all active:scale-95"
                  triggerLabel="Revert to User"
                  title="Revert Request"
                  description="Please provide a reason for reverting this budget request."
                  actionLabel="Revert"
                  withRemarks
                  remarksRequired
                  onConfirm={(remarks) => onApprove(data[0], status.Reverted_By_Finance.label, remarks)}
                />

                <ConfirmDialog
                  triggerClassName="h-10 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-md shadow-emerald-100 transition-all active:scale-95"
                  triggerLabel="Approve Budget"
                  title="Approve Request"
                  description="Are you sure you want to approve this amount?"
                  onConfirm={() => onApprove(data[0], status.Approved.label)}
                />
              </>
            ) : (
              <button onClick={onClose} className="h-10 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm transition-all">
                Close
              </button>
            )}
          </div>
        )} */}
        {currentData.length > 0 && (
          <div className="border-t px-8 py-5 bg-white flex justify-end items-center gap-4 flex-shrink-0">
            {isPending ? (
              <>
                {/* REVERT ALL */}
                <ConfirmDialog
                  triggerClassName="h-10 px-8 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-sm shadow-md shadow-amber-100 transition-all active:scale-95"
                  triggerLabel="Revert to User"
                  title="Revert Requests"
                  description="Please provide a reason for reverting these budget requests."
                  actionLabel="Revert"
                  withRemarks
                  remarksRequired
                  onConfirm={(remarks) => {
                    currentData.forEach((req) => onApprove(req, status.Reverted_By_Finance.label, remarks));
                  }}
                />

                {/* APPROVE ALL */}
                <ConfirmDialog
                  triggerClassName="h-10 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-md shadow-emerald-100 transition-all active:scale-95"
                  triggerLabel="Approve"
                  title="Approve Requests"
                  description="Are you sure you want to approve these requests?"
                  onConfirm={() => {
                    currentData.forEach((req) => onApprove(req, status.Approved.label));
                  }}
                />
              </>
            ) : (
              <button onClick={onClose} className="h-10 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm transition-all">
                Close
              </button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BudgetApproveDialog;
