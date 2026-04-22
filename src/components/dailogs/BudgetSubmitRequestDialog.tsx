import { Dialog, DialogContent } from '@/components/ui/dialog';
import { formatDecimal, formatRupees } from '@/lib/helperFunction';
import { Calculator, FileText, Info } from 'lucide-react';

const BudgetDetailsDialog = ({ open, onClose, data }) => {
  if (!data) return null;

  const req = data;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        {/* HEADER */}
        <div className="px-8 py-5 border-b bg-white flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Budget Request Analysis</h2>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} />
              <span className="text-xs font-bold uppercase">Project Description</span>
            </div>

            <div
              className="text-sm italic"
              dangerouslySetInnerHTML={{
                __html: req.demandDetails || '',
              }}
            />
          </div>
          {/* 2. COMPONENT TABLE */}
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden mt-5">
            <div className="px-6 py-4 border-b bg-slate-50 flex items-center gap-2">
              <Calculator size={16} />
              <h3 className="text-sm font-bold uppercase">Component Breakdown</h3>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-white text-[10px] uppercase border-b">
                <tr>
                  <th className="px-6 py-3">Component</th>
                  <th className="px-6 py-3">Unit</th>
                  <th className="px-6 py-3 text-center">Qty</th>
                  <th className="px-6 py-3 text-right">Rate</th>
                  <th className="px-6 py-3 text-right">Total</th>
                </tr>
              </thead>

              <tbody>
                {req.componentsDetails?.map((comp, i) => (
                  <tr key={i} className="border-t hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-center">{comp.componentDescription}</td>

                    <td className="px-6 py-3 text-center">{comp.munit || '-'}</td>

                    <td className="px-6 py-3 text-right">{comp.qty > 0 ? `${formatDecimal(comp.qty)}` : '-'}</td>

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
          <button onClick={() => onClose(false)} className="px-6 py-2 bg-slate-900 text-white rounded-lg">
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetDetailsDialog;
