import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Share2, 
  Calendar, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  X,
  Trophy,
  Star,
  Bell,
  Laptop,
  Bed,
  DoorOpen,
  UserCircle,
  Home,
  FileOutput,
  HeartPulse,
  MessageCircle,
  ClipboardList,
  UserPlus,
  Eye,
  FileEdit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

export const ExaminationModule = () => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'marks' | 'report' | 'admit'>('schedule');
  const [showAddModal, setShowAddModal] = useState(false);

  const exams = [
    { id: '1', title: 'Final Term Examination', class: 'Class 10', startDate: '2024-04-10', endDate: '2024-04-25', status: 'Upcoming' },
    { id: '2', title: 'Unit Test 3', class: 'Class 1-5', startDate: '2024-03-15', endDate: '2024-03-20', status: 'Ongoing' },
    { id: '3', title: 'Term 1 Examination', class: 'All Classes', startDate: '2023-10-05', endDate: '2023-10-20', status: 'Completed' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">Examination Management</h1>
          <p className="text-text-sub font-medium">Manage exam schedules, marks entry, and report cards.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2"><Plus size={20} /> Create New Exam</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-primary">
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Upcoming Exams</p>
          <p className="text-3xl font-black text-text-heading">3</p>
          <p className="text-[10px] font-bold text-text-sub mt-1">Next: Final Term (April)</p>
        </Card>
        <Card className="p-6 border-l-4 border-green-500">
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Marks Entered</p>
          <p className="text-3xl font-black text-text-heading">85%</p>
          <p className="text-[10px] font-bold text-green-600 mt-1">Unit Test 3 in progress</p>
        </Card>
        <Card className="p-6 border-l-4 border-orange-500">
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Report Cards</p>
          <p className="text-3xl font-black text-text-heading">1,240</p>
          <p className="text-[10px] font-bold text-orange-600 mt-1">Generated for Term 1</p>
        </Card>
        <Card className="p-6 border-l-4 border-purple-500">
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Top Performers</p>
          <p className="text-3xl font-black text-text-heading">45</p>
          <p className="text-[10px] font-bold text-purple-600 mt-1">Gold Medalists identified</p>
        </Card>
      </div>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('schedule')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'schedule' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Exam Schedule</button>
        <button onClick={() => setActiveTab('marks')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'marks' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Marks Entry</button>
        <button onClick={() => setActiveTab('report')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'report' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Report Cards</button>
        <button onClick={() => setActiveTab('admit')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'admit' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Admit Cards</button>
      </div>

      {activeTab === 'schedule' && (
        <Card className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => (
              <div key={exam.id} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent hover:border-primary/10 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all"><ClipboardList size={24} /></div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                    exam.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                    exam.status === 'Ongoing' ? 'bg-green-100 text-green-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {exam.status}
                  </span>
                </div>
                <h4 className="text-xl font-black text-text-heading mb-1">{exam.title}</h4>
                <p className="text-[10px] font-bold text-text-sub uppercase tracking-widest mb-6">{exam.class}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-text-sub uppercase">
                    <Calendar size={14} /> {exam.startDate}
                  </div>
                  <button className="text-[10px] font-black text-primary uppercase hover:underline">View Schedule</button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Exam Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-text-heading uppercase">Create New Exam</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <Input label="Exam Title" placeholder="e.g., Final Term 2024" />
                <Select label="Target Classes" options={['All Classes', 'Primary', 'Secondary', 'Class 10', 'Class 12']} value="" onChange={() => {}} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Date" type="date" />
                  <Input label="End Date" type="date" />
                </div>
                <button onClick={() => setShowAddModal(false)} className="btn-primary w-full py-4 mt-6">Create Exam & Schedule</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
