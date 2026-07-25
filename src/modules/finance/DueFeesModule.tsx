import React, { useState } from 'react';
import { 
  Search, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Share2, 
  Coins, 
  Wallet, 
  Receipt, 
  CheckCircle2, 
  AlertCircle,
  X,
  Bell,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Student, FeeMaster, FeeTransaction } from '../../types';

interface DueFeesModuleProps {
  students: Student[];
  feeMaster: FeeMaster[];
  feeTransactions: FeeTransaction[];
  currentUser: any;
  getStudentDueFees: (student: Student) => number;
}

export const DueFeesModule = ({ students, feeMaster, feeTransactions, currentUser, getStudentDueFees }: DueFeesModuleProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const studentsWithDue = students.map(s => ({
    ...s,
    dueAmount: getStudentDueFees(s)
  })).filter(s => 
    s.dueAmount > 0 &&
    (!selectedClass || s.class === selectedClass) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.includes(searchTerm))
  );

  const totalDue = studentsWithDue.reduce((sum, s) => sum + s.dueAmount, 0);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(studentsWithDue.map(s => ({
      'Student ID': s.studentId,
      'Name': s.name,
      'Class': s.class,
      'Section': s.section,
      'Due Amount': s.dueAmount,
      'Father Name': s.fatherName,
      'Mobile': s.mobile
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Due Fees");
    XLSX.writeFile(wb, "Due_Fees_Report.xlsx");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">Due Fees Management</h1>
          <p className="text-text-sub font-medium">Track outstanding payments and send reminders to parents.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToExcel} className="btn-secondary flex items-center gap-2"><FileSpreadsheet size={18} /> Export List</button>
          <button className="btn-primary flex items-center gap-2"><Bell size={20} /> Bulk Reminder</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 bg-primary text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Total Outstanding</p>
          <p className="text-4xl font-black mb-6">₹{totalDue.toLocaleString()}</p>
          <div className="flex items-center gap-2 text-xs font-bold opacity-90">
            <AlertCircle size={16} /> {studentsWithDue.length} Students have pending fees
          </div>
        </Card>
        <Card className="md:col-span-2 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select 
              label="Filter by Class" 
              options={['LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']} 
              value={selectedClass} 
              onChange={(e: any) => setSelectedClass(e.target.value)} 
            />
            <Input label="Search Student" placeholder="Name or ID..." value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Student</th>
                <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Class</th>
                <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Due Amount</th>
                <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Parent Contact</th>
                <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {studentsWithDue.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4">
                    <p className="font-bold text-sm text-text-heading">{s.name}</p>
                    <p className="text-[10px] text-text-sub font-bold">{s.studentId}</p>
                  </td>
                  <td className="py-4 text-sm text-text-sub">{s.class} - {s.section}</td>
                  <td className="py-4 text-sm font-black text-red-500">₹{s.dueAmount.toLocaleString()}</td>
                  <td className="py-4">
                    <p className="text-sm font-bold text-text-heading">{s.fatherName}</p>
                    <p className="text-[10px] text-text-sub font-bold">{s.mobile}</p>
                  </td>
                  <td className="py-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-green-50 rounded-lg text-green-600"><MessageCircle size={18} /></button>
                      <button className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"><Bell size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {studentsWithDue.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-sub italic font-medium">No students with due fees found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
