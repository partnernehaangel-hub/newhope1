import React, { useRef } from 'react';
import { 
  Printer, 
  Download, 
  Share2, 
  X,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { FeeTransaction } from '../../types';

interface ReceiptModalProps {
  transaction: FeeTransaction;
  schoolProfile: any;
  onClose: () => void;
}

export const ReceiptModal = ({ transaction, schoolProfile, onClose }: ReceiptModalProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    const canvas = await html2canvas(receiptRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Receipt_${transaction.invoiceNumber}.pdf`);
  };

  const handleShareWhatsApp = () => {
    const message = `Fee Receipt for ${transaction.studentName}\nInvoice: ${transaction.invoiceNumber}\nAmount: ₹${transaction.totalPaid}\nDate: ${transaction.date}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-[110] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl my-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <h3 className="text-xl font-black text-text-heading uppercase tracking-tight">Fee Receipt</h3>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="p-2 hover:bg-slate-100 rounded-lg text-text-sub"><Printer size={20} /></button>
            <button onClick={handleDownloadPDF} className="p-2 hover:bg-slate-100 rounded-lg text-text-sub"><Download size={20} /></button>
            <button onClick={handleShareWhatsApp} className="p-2 hover:bg-slate-100 rounded-lg text-green-500"><Share2 size={20} /></button>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-text-sub"><X size={20} /></button>
          </div>
        </div>

        <div ref={receiptRef} className="p-8 border-2 border-slate-100 rounded-3xl bg-slate-50/50">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-4">
              {schoolProfile.logo && <img src={schoolProfile.logo} alt="Logo" className="w-16 h-16 object-contain" />}
              <div>
                <h2 className="text-2xl font-black text-text-heading leading-tight">{schoolProfile.name}</h2>
                <p className="text-xs text-text-sub font-bold uppercase tracking-wider">{schoolProfile.address}</p>
                <p className="text-xs text-text-sub font-bold">{schoolProfile.contact}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase mb-2">
                <CheckCircle2 size={12} /> Payment Success
              </div>
              <p className="text-xs font-bold text-text-sub uppercase tracking-widest">Invoice: <span className="text-primary font-black">{transaction.invoiceNumber}</span></p>
              <p className="text-xs font-bold text-text-sub uppercase tracking-widest">Date: {transaction.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-2">Student Details</p>
              <p className="text-lg font-black text-text-heading">{transaction.studentName}</p>
              <p className="text-sm font-bold text-text-sub uppercase tracking-wider">{transaction.studentId}</p>
              <p className="text-sm font-bold text-text-sub uppercase tracking-wider">Class: {transaction.class} - {transaction.section}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-2">Payment Info</p>
              <p className="text-sm font-bold text-text-heading uppercase">Method: {transaction.paymentMethod}</p>
              <p className="text-sm font-bold text-text-heading uppercase">Fee Type: {transaction.feeType}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden mb-10 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-100/50">
                <tr>
                  <th className="py-4 px-6 text-[10px] font-black text-text-sub uppercase tracking-widest">Description</th>
                  <th className="py-4 px-6 text-right text-[10px] font-black text-text-sub uppercase tracking-widest">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr>
                  <td className="py-4 px-6 text-sm font-bold text-text-heading">{transaction.feeType}</td>
                  <td className="py-4 px-6 text-right text-sm font-black text-text-heading">₹{transaction.amount.toLocaleString()}</td>
                </tr>
                {transaction.fine > 0 && (
                  <tr>
                    <td className="py-4 px-6 text-sm font-bold text-text-heading">Fine</td>
                    <td className="py-4 px-6 text-right text-sm font-black text-red-500">+₹{transaction.fine.toLocaleString()}</td>
                  </tr>
                )}
                {transaction.discount > 0 && (
                  <tr>
                    <td className="py-4 px-6 text-sm font-bold text-text-heading">Discount</td>
                    <td className="py-4 px-6 text-right text-sm font-black text-green-500">-₹{transaction.discount.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-primary/5">
                <tr>
                  <td className="py-4 px-6 text-sm font-black text-primary uppercase">Total Paid</td>
                  <td className="py-4 px-6 text-right text-xl font-black text-primary">₹{transaction.totalPaid.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="flex justify-between items-end">
            <div className="text-[10px] text-text-sub font-bold uppercase tracking-widest">
              <p>Generated on: {new Date().toLocaleString()}</p>
              <p>This is a computer generated receipt.</p>
            </div>
            <div className="text-center">
              <div className="w-32 h-12 border-b-2 border-slate-200 mb-2"></div>
              <p className="text-[10px] font-black text-text-heading uppercase tracking-widest">Authorized Signatory</p>
            </div>
          </div>
        </div>

        <button onClick={onClose} className="w-full mt-8 py-4 bg-slate-100 hover:bg-slate-200 text-text-heading font-black rounded-2xl transition-all uppercase tracking-widest text-xs">Close Receipt</button>
      </motion.div>
    </div>
  );
};
