import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDecimal, formatRupees } from '@/lib/helperFunction';
import { status } from '@/constant/status';
import { BookOpen, Calculator, FileText, Landmark, Wallet, Building2, Briefcase, ChevronRight } from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Props {
  open: boolean;
  onClose: () => void;
  data: any[];
  handleApprove: (req: any, status: string, remarks?: string) => void;
}

const BudgetDetailsHodDialog = ({ open, onClose, data, handleApprove }: Props) => {
  const [activeTab, setActiveTab] = useState(0);
  const totalRequests = data.length;

  const isValidGL = (gl: any) => {
    if (!gl) return false;
    const value = String(gl).trim().toLowerCase();
    return value !== 'null' && value !== '';
  };
  const filteredRequest = totalRequests > 1 ? [data[activeTab]] : data;
  const currentRequest = totalRequests > 1 ? data[activeTab] : data[0];

  const grossTotals = data.reduce(
    (acc, curr) => {
      acc.actual += Number(curr.actualAmount || 0);
      acc.budget += Number(curr.budgetAmount || 0);
      return acc;
    },
    { actual: 0, budget: 0 }
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="flex max-h-[80vh]">
          {/* LEFT SIDEBAR - Only show if multiple projects */}
          {totalRequests > 1 && (
            <div className="w-fit bg-slate-50 border-r flex flex-col">
              <div className="p-6 border-b bg-white/50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Project List</h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                  {data.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTab(index)}
                      className={`w-full flex flex-col items-start p-3 rounded-xl transition-all ${
                        activeTab === index ? 'bg-white shadow-sm ring-1 ring-slate-200 border-l-4 border-l-blue-600' : 'hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span className={`text-xs font-bold ${activeTab === index ? 'text-blue-600' : ''}`}>Project {index + 1}</span>
                      <span className="text-[11px] truncate w-full text-left opacity-70">{item.budgetType}</span>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col bg-white">
            <DialogHeader className="px-8 py-4 border-b bg-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                {/* Title & Context */}
                <div>
                  <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Request Details</DialogTitle>
                  <div className="flex items-center gap-2 mt-1.5 text-slate-500">
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-600 uppercase">
                      <Building2 size={12} />
                      {currentRequest?.unitName}
                    </div>
                    <ChevronRight size={14} className="text-slate-300" />
                    <div className="flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-600 uppercase">
                      <Briefcase size={12} />
                      {currentRequest?.departmentName}
                    </div>
                  </div>
                </div>

                {/* IMPROVED GROSS TOTALS SECTION */}
                {totalRequests > 1 && (
                  <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Wallet size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Gross Actual</p>
                        <p className="text-base font-black text-slate-900 leading-none">{formatRupees(grossTotals.actual)}</p>
                      </div>
                    </div>

                    <Separator orientation="vertical" className="h-10 bg-slate-200" />

                    <div className="flex items-center gap-4 px-4 py-2 bg-white rounded-xl border border-slate-200/60 shadow-sm">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Calculator size={18} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">Gross Budget</p>
                        <p className="text-base font-black text-slate-900 leading-none">{formatRupees(grossTotals.budget)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </DialogHeader>

            {data.length === 0 ? (
              <div className="text-center py-20 text-gray-400 font-medium">No data found</div>
            ) : (
              <div className="space-y-6 overflow-y-auto">
                {filteredRequest?.map((req, index) => {
                  return (
                    <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      {/* {totalRequests > 1 && (
                      <div className="sticky top-0 z-10 bg-slate-50 px-2 py-1 text-xs font-bold text-gray-600 border-b">Request #{index + 1}</div>
                    )} */}

                      {/* DESCRIPTION SECTION */}
                      <div className="px-6 py-2 mt-2">
                        <div className="flex items-center">
                          <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Project Description</p>
                          {/* {req?.fileUrl && (
                            <a
                              href={req?.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded"
                            >
                              <FileText size={14} /> VIEW ATTACHMENT
                            </a>
                          )} */}
                        </div>
                        <div
                          className="text-sm text-slate-600 leading-relaxed prose prose-slate max-w-none"
                          dangerouslySetInnerHTML={{ __html: req?.demandDetails }}
                        />
                      </div>
                      {/* INFO GRID */}
                      <div className="grid grid-cols-4 gap-px  border-b border-slate-100">
                        <div className="bg-white p-5 flex items-center gap-4">
                          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <Wallet size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Actual Amount</p>
                            <p className="text-lg font-bold text-slate-900 tabular-nums leading-none">{formatRupees(req?.actualAmount)}</p>
                          </div>
                        </div>

                        <div className="bg-white p-5 flex items-center gap-4">
                          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <Wallet size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Budget Amount</p>
                            <p className="text-lg font-bold text-slate-900 tabular-nums leading-none">{formatRupees(req?.budgetAmount)}</p>
                          </div>
                        </div>

                        {isValidGL(req?.gl) && (
                          <div className="bg-white p-5 flex items-center gap-4">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                              <BookOpen size={20} />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">GL No.</p>
                              <p className="text-sm font-semibold text-slate-700 leading-none">{req?.gl || '-'}</p>
                            </div>
                          </div>
                        )}
                        {totalRequests === 1 && (
                          <div className="bg-white p-5 flex items-center gap-4">
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                              <Landmark size={20} />
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Budget Type</p>
                              <p className="text-lg font-bold text-slate-900 tabular-nums leading-none">{req?.budgetType}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* COMPONENT TABLE */}
                      <div className="bg-white border-t shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2">
                          <Calculator size={16} />
                          <h3 className="text-sm font-bold uppercase">Component Breakdown</h3>
                        </div>

                        <table className="w-full text-sm">
                          <thead className="bg-white text-[10px] uppercase border-b">
                            <tr>
                              <th className="px-6 py-3 text-center">Category</th>
                              <th className="px-6 py-3 text-center">Sub Category</th>
                              <th className="px-6 py-3 text-center">Unit</th>
                              <th className="px-6 py-3 text-center">Qty</th>
                              <th className="px-6 py-3 text-center">Rate</th>
                              <th className="px-6 py-3 text-center">Total</th>
                            </tr>
                          </thead>

                          <tbody>
                            {req?.componentsDetails?.map((comp, i) => (
                              <tr key={i} className="border-t hover:bg-slate-50">
                                <td className="px-6 py-3 font-medium text-center">{comp?.categoryName}</td>

                                <td className="px-6 py-3 font-medium text-center">{comp?.subCategoryName}</td>

                                <td className="px-6 py-3 text-center">{comp?.munit || '-'}</td>

                                <td className="px-6 py-3 text-right">{comp?.qty > 0 ? formatDecimal(comp?.qty) : '-'}</td>

                                <td className="px-6 py-3 text-right">{comp?.rateOfUnit > 0 ? formatRupees(comp?.rateOfUnit) : '-'}</td>

                                <td className="px-6 py-3 text-right font-bold">{formatRupees(comp?.amount)}</td>
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
        </div>
        {/* FIXED FOOTER */}
        {data.length > 0 && (
          <div className="border-t px-8 py-5 bg-white flex justify-end items-center gap-4 flex-shrink-0">
            {data[0].statusName === status.Pending_HOD.label ? (
              <>
                <ConfirmDialog
                  triggerClassName="h-10 px-8 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-sm shadow-md shadow-amber-100 transition-all active:scale-95"
                  triggerLabel="Revert to User"
                  title="Revert Request"
                  description="Please provide a reason for reverting this budget request."
                  actionLabel="Revert"
                  withRemarks
                  remarksRequired
                  onConfirm={(remarks) => handleApprove(currentRequest, status.Reverted_By_HOD.label, remarks)}
                />

                <ConfirmDialog
                  triggerClassName="h-10 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-md shadow-emerald-100 transition-all active:scale-95"
                  triggerLabel="Approve Budget"
                  title="Approve Request"
                  description="Are you sure you want to approve this amount?"
                  onConfirm={() => handleApprove(currentRequest, status.Pending_Finance.label)}
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

export default BudgetDetailsHodDialog;
