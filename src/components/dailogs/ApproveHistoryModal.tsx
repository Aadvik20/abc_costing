import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchFinanceData } from '@/features/FinanceSlice';
import { formatRupees } from '@/lib/helperFunction';

export function ApproveHistoryModal({ open, onOpenChange, initialData }) {
  const dispatch = useAppDispatch();
  const { finance, loading } = useAppSelector((state) => state.FinanceSlice);

  useEffect(() => {
    if (!finance.length) {
      dispatch(fetchFinanceData());
    }
  }, [dispatch, finance.length, open]);

  const data = initialData || {};
  const poNo = data.poNo ?? 0;

  const ApproveHistory = finance.find((elem) => elem.poNo === poNo)?.approvalHistory || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Approved History</DialogTitle>
        </DialogHeader>
        {ApproveHistory.length === 0 && <div className="py-6 text-center text-sm text-gray-500">No approval history found</div>}
        {!loading && ApproveHistory.length > 0 && (
          <div className="mt-2 border rounded-lg overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Approved Amount</th>
                  <th className="p-2 text-left">Approved By</th>
                  <th className="p-2 text-left">Approved On</th>
                  <th className="p-2 text-left">Decision</th>
                  <th className="p-2 text-left">Reason</th>
                </tr>
              </thead>
              <tbody>
                {ApproveHistory.map((item, index) => (
                  <tr key={index} className="border">
                    <td className="p-2">{formatRupees(item.approvedAmount) || '-'}</td>
                    <td className="p-2">{item.approvedBy || '-'}</td>
                    <td className="p-2">{new Date(item.approvedOn).toLocaleDateString() || '-'}</td>
                    <td className="p-2">{item.decisionType || '-'}</td>
                    <td className="p-2">{item.decisionReason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <DialogFooter className="gap-2"></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
