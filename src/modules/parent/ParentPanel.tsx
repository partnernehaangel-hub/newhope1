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
  Upload,
  Eye,
  FileEdit,
  ClipboardList,
  Trophy,
  Briefcase,
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
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { FileUpload } from '../../components/common/FileUpload';
import { Student, Attendance, Syllabus, Homework, LeaveRequest, Notification, FeeTransaction } from '../../types';

interface ParentPanelProps {
  students: Student[];
  attendance: Attendance[];
  syllabuses: Syllabus[];
  homeworks: Homework[];
  leaveRequests: LeaveRequest[];
  setLeaveRequests: (leaveRequests: LeaveRequest[]) => void;
  notifications: Notification[];
  feeTransactions: FeeTransaction[];
  masterData: any;
  currentUser: any;
  getStudentDueFees: (student: Student) => number;
}

const formatDateDMY = (dateStr: any): string => {
  if (!dateStr) return 'N/A';
  const str = String(dateStr).trim();
  if (!str || str === 'N/A' || str === '--') return 'N/A';
  
  const partsDash = str.split('-');
  if (partsDash.length === 3) {
    if (partsDash[0].length === 4) {
      return `${partsDash[2]}/${partsDash[1]}/${partsDash[0]}`;
    } else if (partsDash[2].length === 4) {
      return `${partsDash[0]}/${partsDash[1]}/${partsDash[2]}`;
    }
  }

  const partsSlash = str.split('/');
  if (partsSlash.length === 3) {
    if (partsSlash[0].length === 4) {
      return `${partsSlash[2]}/${partsSlash[1]}/${partsSlash[0]}`;
    }
    return str;
  }

  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {}

  return str;
};

export const ParentPanel = ({ 
  students, 
  attendance, 
  syllabuses, 
  homeworks, 
  leaveRequests, 
  setLeaveRequests, 
  notifications,
  feeTransactions,
  masterData, 
  currentUser,
  getStudentDueFees
}: ParentPanelProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'progress' | 'homework' | 'syllabus' | 'leave' | 'fees' | 'documents' | 'notifications'>('profile');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [newLeave, setNewLeave] = useState<any>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: ''
  });

  const student = students.find(s => s.studentId === currentUser.studentId);
  if (!student) return <div className="p-8 text-center text-text-sub font-medium italic">Student profile not found.</div>;

  const dueFees = getStudentDueFees(student);

  const handleApplyLeave = () => {
    if (!newLeave.reason) return;
    const start = new Date(newLeave.startDate);
    const end = new Date(newLeave.endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const leaveReq: LeaveRequest = {
      id: Date.now().toString(),
      studentId: student.studentId,
      studentName: student.name,
      class: student.class,
      section: student.section,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      duration,
      reason: newLeave.reason,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    
    setLeaveRequests([leaveReq, ...leaveRequests]);
    setShowLeaveModal(false);
    setNewLeave({ startDate: new Date().toISOString().split('T')[0], endDate: new Date().toISOString().split('T')[0], reason: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-black text-3xl shadow-inner">
            {student.name[0]}
          </div>
          <div>
            <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">{student.name}</h1>
            <p className="text-text-sub font-bold uppercase tracking-widest text-xs">Student ID: {student.studentId} | Class: {student.class}-{student.section}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowLeaveModal(true)} className="btn-primary flex items-center gap-2">
            <FileOutput size={20} /> Apply Leave
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-primary">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><CheckCircle2 size={20} /></div>
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Attendance</p>
          </div>
          <p className="text-2xl font-black text-text-heading">92.5%</p>
          <p className="text-[10px] font-bold text-green-600 uppercase mt-1">Excellent Attendance</p>
        </Card>
        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Trophy size={20} /></div>
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Rank</p>
          </div>
          <p className="text-2xl font-black text-text-heading">4th / 45</p>
          <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">Top 10% of Class</p>
        </Card>
        <Card className="p-6 border-l-4 border-orange-500">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Briefcase size={20} /></div>
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Due Fees</p>
          </div>
          <p className="text-2xl font-black text-text-heading">₹{dueFees.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-orange-600 uppercase mt-1">Next Due: 10th April</p>
        </Card>
        <Card className="p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Star size={20} /></div>
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Merit Points</p>
          </div>
          <p className="text-2xl font-black text-text-heading">450</p>
          <p className="text-[10px] font-bold text-purple-600 uppercase mt-1">Silver Badge Earner</p>
        </Card>
      </div>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Profile</button>
        <button onClick={() => setActiveTab('progress')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'progress' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Progress</button>
        <button onClick={() => setActiveTab('homework')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'homework' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Homework</button>
        <button onClick={() => setActiveTab('syllabus')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'syllabus' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Syllabus</button>
        <button onClick={() => setActiveTab('leave')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'leave' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Leave</button>
        <button onClick={() => setActiveTab('fees')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'fees' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Fees</button>
        <button onClick={() => setActiveTab('documents')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Documents</button>
        <button onClick={() => setActiveTab('notifications')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'notifications' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Notifications</button>
      </div>

      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 p-8">
            <div className="text-center mb-8">
              <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 flex items-center justify-center mx-auto mb-6 text-4xl font-black text-primary border-4 border-white shadow-xl">
                {student.name[0]}
              </div>
              <h3 className="text-2xl font-black text-text-heading">{student.name}</h3>
              <p className="text-sm font-bold text-text-sub uppercase tracking-widest">{student.studentId}</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Class</p>
                <p className="text-sm font-black text-text-heading">{student.class}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Section</p>
                <p className="text-sm font-black text-text-heading">{student.section}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Blood Group</p>
                <p className="text-sm font-black text-red-500">{student.bloodGroup}</p>
              </div>
            </div>
          </Card>
          <Card className="lg:col-span-2 p-8">
            <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Father's Name</p>
                  <p className="text-base font-bold text-text-heading">{student.fatherName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Mother's Name</p>
                  <p className="text-base font-bold text-text-heading">{student.motherName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Date of Birth</p>
                  <p className="text-base font-bold text-text-heading">{formatDateDMY(student.dob)}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Contact Number</p>
                  <p className="text-base font-bold text-text-heading">{student.mobile}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Email Address</p>
                  <p className="text-base font-bold text-text-heading">{student.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Residential Address</p>
                  <p className="text-base font-bold text-text-heading">{student.address}</p>
                </div>
              </div>
            </div>
            <div className="mt-12 p-6 bg-primary/5 rounded-[2rem] border-2 border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><HeartPulse size={24} /></div>
                <div>
                  <p className="text-sm font-black text-text-heading">Health Profile</p>
                  <p className="text-xs font-bold text-text-sub">Last updated: 2 months ago</p>
                </div>
              </div>
              <button className="text-[10px] font-black text-primary uppercase hover:underline">View Details</button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'progress' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8">
            <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Academic Performance</h3>
            <div className="space-y-6">
              {[
                { subject: 'Mathematics', score: 92, grade: 'A+' },
                { subject: 'Science', score: 88, grade: 'A' },
                { subject: 'English', score: 95, grade: 'A+' },
                { subject: 'Social Studies', score: 85, grade: 'A' },
                { subject: 'Hindi', score: 90, grade: 'A+' }
              ].map((s, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-bold text-text-heading">{s.subject}</p>
                    <p className="text-xs font-black text-primary">{s.score}% | {s.grade}</p>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.score}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-8">
            <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Attendance Summary</h3>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeDasharray="100, 100" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-primary" strokeDasharray="92.5, 100" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-black text-text-heading">92.5%</p>
                  <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Present</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center p-3 bg-green-50 rounded-2xl">
                <p className="text-lg font-black text-green-600">185</p>
                <p className="text-[8px] font-black text-green-700 uppercase">Present</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-2xl">
                <p className="text-lg font-black text-red-600">12</p>
                <p className="text-[8px] font-black text-red-700 uppercase">Absent</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-2xl">
                <p className="text-lg font-black text-orange-600">3</p>
                <p className="text-[8px] font-black text-orange-700 uppercase">Late</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'homework' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {homeworks.filter(h => h.class === student.class).map((h) => (
            <Card key={h.id} className="p-6 border-l-4 border-primary">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{h.subject}</p>
                <p className="text-[10px] font-bold text-red-500 uppercase">Due: {h.dueDate}</p>
              </div>
              <h3 className="text-lg font-bold text-text-heading mb-2">{h.title}</h3>
              <p className="text-xs text-text-sub mb-6 line-clamp-2">{h.description}</p>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                  h.status === 'Submitted' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {h.status}
                </span>
                <button className="text-[10px] font-black text-primary uppercase hover:underline">Submit Now</button>
              </div>
            </Card>
          ))}
          {homeworks.filter(h => h.class === student.class).length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 py-20 text-center text-text-sub font-medium italic">No homework assigned yet.</div>
          )}
        </div>
      )}

      {activeTab === 'syllabus' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {syllabuses.filter(s => s.class === student.class).map((s) => (
            <Card key={s.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                  s.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  s.status === 'Started' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {s.status}
                </span>
                <p className="text-[10px] font-bold text-text-sub">{s.date}</p>
              </div>
              <h3 className="text-lg font-bold text-text-heading mb-2">{s.title}</h3>
              <p className="text-xs text-text-sub mb-4 line-clamp-2">{s.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <p className="text-[10px] font-black text-primary uppercase">{s.subject}</p>
                <button className="text-[10px] font-black text-primary uppercase hover:underline">View Material</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'leave' && (
        <div className="space-y-6">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-text-heading uppercase tracking-tight">Leave Applications</h3>
              <button onClick={() => setShowLeaveModal(true)} className="btn-primary flex items-center gap-2">
                <Plus size={20} /> Apply New
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Applied Date</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Duration</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Reason</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leaveRequests.filter(l => l.studentId === student.studentId).map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-sm font-bold text-text-heading">{l.appliedDate}</td>
                      <td className="py-4">
                        <p className="text-sm font-bold text-text-heading">{l.duration} Days</p>
                        <p className="text-[10px] text-text-sub font-bold">{l.startDate} to {l.endDate}</p>
                      </td>
                      <td className="py-4 text-sm text-text-sub max-w-xs truncate">{l.reason}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                          l.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          l.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {leaveRequests.filter(l => l.studentId === student.studentId).length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-text-sub italic font-medium">No leave applications yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-primary text-white">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">Total Outstanding</p>
              <p className="text-4xl font-black mb-6">₹{dueFees.toLocaleString()}</p>
              <button className="w-full py-4 bg-white text-primary rounded-2xl font-black text-xs uppercase shadow-xl">Pay Now</button>
            </Card>
            <Card className="md:col-span-2 p-8">
              <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Recent Payments</h3>
              <div className="space-y-4">
                {feeTransactions.filter(t => t.studentId === student.studentId).map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 text-green-600 rounded-xl"><Receipt size={20} /></div>
                      <div>
                        <p className="font-bold text-text-heading">{t.feeType}</p>
                        <p className="text-[10px] font-bold text-text-sub uppercase">{t.invoiceNumber} | {t.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-text-heading">₹{t.totalPaid.toLocaleString()}</p>
                      <button className="text-[10px] font-black text-primary uppercase hover:underline">Receipt</button>
                    </div>
                  </div>
                ))}
                {feeTransactions.filter(t => t.studentId === student.studentId).length === 0 && (
                  <p className="text-center text-text-sub italic py-8">No payment history found.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Transfer Certificate', type: 'PDF', size: '1.2 MB', date: '2024-03-15' },
            { name: 'Character Certificate', type: 'PDF', size: '0.8 MB', date: '2024-03-15' },
            { name: 'Previous Year Marksheet', type: 'PDF', size: '2.5 MB', date: '2023-06-20' },
            { name: 'Birth Certificate', type: 'JPG', size: '1.5 MB', date: '2023-01-10' },
            { name: 'Aadhar Card', type: 'PDF', size: '0.5 MB', date: '2023-01-10' }
          ].map((doc, idx) => (
            <Card key={idx} className="p-6 hover:shadow-xl transition-all group">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-slate-100 text-text-sub rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <FileText size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-text-heading truncate">{doc.name}</h4>
                  <p className="text-[10px] font-bold text-text-sub uppercase">{doc.type} | {doc.size}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-text-sub">{doc.date}</p>
                <button className="p-2 hover:bg-slate-100 rounded-lg text-primary"><Download size={18} /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {notifications.filter(n => n.targetRoles.includes('parent') && (!n.targetStudentId || n.targetStudentId === student.studentId)).map((n) => (
            <Card key={n.id} className="p-6 border-l-4 border-primary">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-text-heading">{n.title}</h4>
                <p className="text-[10px] font-bold text-text-sub">{n.date}</p>
              </div>
              <p className="text-sm text-text-sub">{n.message}</p>
            </Card>
          ))}
        </div>
      )}

      {/* Apply Leave Modal */}
      <AnimatePresence>
        {showLeaveModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-text-heading uppercase">Apply for Leave</h3>
                <button onClick={() => setShowLeaveModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Start Date" type="date" value={newLeave.startDate} onChange={(e: any) => setNewLeave({ ...newLeave, startDate: e.target.value })} />
                  <Input label="End Date" type="date" value={newLeave.endDate} onChange={(e: any) => setNewLeave({ ...newLeave, endDate: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="label-text">Reason for Leave</label>
                  <textarea className="input-field min-h-[120px]" value={newLeave.reason} onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })} placeholder="Explain the reason for leave..."></textarea>
                </div>
                <FileUpload label="Attach Supporting Documents (Optional)" onFileSelect={() => {}} />
                <button onClick={handleApplyLeave} className="btn-primary w-full py-4 mt-4">Submit Application</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
