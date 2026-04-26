import { Dialog, DialogContent } from '@/components/ui/dialog';
import { status } from '@/constant/status';
import { formatDecimal, formatRupees, monthOptions } from '@/lib/helperFunction';
import { BookOpen, Calculator, Calendar, FileText, Info, Landmark, Wallet } from 'lucide-react';
import { useState } from 'react';

const BudgetDetailsDialog = ({ open, onClose, data }) => {
  const [activeTab, setActiveTab] = useState(0);
  const totalRequests = data.length;

  const isValidGL = (gl: any) => {
    if (!gl) return false;

    const value = String(gl).trim().toLowerCase();

    return value !== 'null' && value !== '';
  };
  const filteredRequest = totalRequests > 1 ? [data[activeTab]] : data;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden shadow-2xl border-none"
      >
        {/* HEADER */}
        <div className="px-8 py-5 border-b bg-white flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Request Details</h2>
        </div>

        {totalRequests > 1 && (
          <div className="px-8 bg-white">
            <div className="flex gap-2 bg-gray-100/50 rounded-lg p-1 w-fit">
              {data.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all
          ${activeTab === index ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  Project {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-slate-50/50 px-8 pt-2 pb-6">
          {data.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-medium">No data found</div>
          ) : (
            <div className="space-y-6">
              {filteredRequest?.map((req, index) => {
                const displayStatus = req.statusName === status.Pending_CGM.label ? 'Pending' : req.statusName;
                return (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* {totalRequests > 1 && (
                      <div className="sticky top-0 z-10 bg-slate-50 px-2 py-1 text-xs font-bold text-gray-600 border-b">Request #{index + 1}</div>
                    )} */}
                    {/* CARD HEADER */}
                    <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-slate-100">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{req.unitName}</h2>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{req.departmentName}</p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset ${
                          req.statusName === status.Pending_CGM.label || status.Pending_Finance.label
                            ? 'bg-amber-50 text-amber-700 ring-amber-200'
                            : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                        }`}
                      >
                        {displayStatus}
                      </div>
                    </div>

                    {/* INFO GRID */}
                    <div className="grid grid-cols-3 gap-px  border-b border-slate-100">
                      <div className="bg-white p-5 flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                          <Wallet size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Actual Amount</p>
                          <p className="text-lg font-bold text-slate-900 tabular-nums leading-none">{formatRupees(req.actualAmount)}</p>
                        </div>
                      </div>
                      {isValidGL(req.gl) && (
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
                      <div className="bg-white p-5 flex items-center gap-4">
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                          <Landmark size={20} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Budget Type</p>
                          <p className="text-lg font-bold text-slate-900 tabular-nums leading-none">{req.budgetType}</p>
                        </div>
                      </div>
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
                            <th className="px-6 py-3 text-center">Category</th>
                            <th className="px-6 py-3 text-center">Sub Category</th>
                            <th className="px-6 py-3 text-center">Unit</th>
                            <th className="px-6 py-3 text-center">Qty</th>
                            <th className="px-6 py-3 text-center">Rate</th>
                            <th className="px-6 py-3 text-center">Total</th>
                          </tr>
                        </thead>

                        <tbody>
                          {req.componentsDetails?.map((comp, i) => (
                            <tr key={i} className="border-t hover:bg-slate-50">
                              <td className="px-6 py-3 font-medium text-center">{comp.categoryName}</td>

                              <td className="px-6 py-3 font-medium text-center">{comp.subCategoryName}</td>

                              <td className="px-6 py-3 text-center">{comp.munit}</td>

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

        {/* FOOTER */}
        <div className="px-8 py-5 border-t bg-white flex justify-end">
          <button onClick={() => onClose(false)} className="px-6 py-2 bg-slate-900 text-white rounded-lg">
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetDetailsDialog;
