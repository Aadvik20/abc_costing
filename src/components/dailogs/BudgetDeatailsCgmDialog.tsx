import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatDecimal, formatRupees, monthOptions } from '@/lib/helperFunction';
import { status as statusConst } from '@/constant/status';
import { BookOpen, Calculator, Calendar, FileText, Info } from 'lucide-react';
import ConfirmDialog from '@/components/common/ConfirmDialog';

const BudgetDetailsCgmDialog = ({ open, onClose, data, handleApprove }) => {
  if (!data) return null;

  const req = data;
  console.log(req);

  const isPending = req.status === statusConst.Pending_CGM.value;
  const hasLongDescription = req.demandDetails && req.demandDetails.length > 400;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        {/* HEADER */}
        <div className="px-8 py-5 border-b bg-white flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Budget Request</h2>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4">
          <div className="grid grid-cols-2 gap-px border mb-4 border-slate-100">
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

            <div className="bg-white p-5 flex items-center gap-4">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold leading-none mb-1">Period</p>
                <p className="text-sm font-semibold text-slate-700 leading-none">
                  {monthOptions.find((m) => m.value === req.month)?.label} {req.year}
                </p>
              </div>
            </div>
          </div>
          {/* DESCRIPTION */}
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16}  />
              <span className="text-xs font-bold uppercase">Project Description</span>
            </div>

            <div className="relative">
              <div
                className="text-sm italic max-h-[250px] overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: req.demandDetails || 'No description provided.',
                }}
              />

              {hasLongDescription && <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />}
            </div>
          </div>

          {/* COMPONENT TABLE */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-5">
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

        {/* FOOTER */}
        <div className="px-8 py-5 border-t bg-white flex justify-end">
          {isPending ? (
            <div className="flex gap-3 w-full justify-end">
              <ConfirmDialog
                triggerClassName="bg-green-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-bold"
                triggerLabel="Approve"
                title="Approve Request"
                description="Are you sure you want to approve?"
                onConfirm={() => handleApprove(req, statusConst.Pending_Finance.label)}
              />

              <ConfirmDialog
                triggerClassName="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-bold"
                triggerLabel="Revert to user"
                title="Revert Request"
                description="Please provide reason for revert"
                actionLabel="Revert"
                withRemarks
                remarksRequired
                onConfirm={(remarks) => handleApprove(req, statusConst.Reverted_By_CGM.label, remarks)}
              />
            </div>
          ) : (
            <button onClick={() => onClose(false)} className="px-6 py-2 bg-slate-900 text-white rounded-lg">
              Close
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetDetailsCgmDialog;
