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
  DoorOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { FileUpload } from '../../components/common/FileUpload';
import { Syllabus, Attendance, LeaveRequest, Activity, Notification } from '../../types';

interface TeacherPanelProps {
  syllabuses: Syllabus[];
  setSyllabuses: (syllabuses: Syllabus[]) => void;
  attendance: Attendance[];
  setAttendance: (attendance: Attendance[]) => void;
  leaveRequests: LeaveRequest[];
  setLeaveRequests: (leaveRequests: LeaveRequest[]) => void;
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  notifications: Notification[];
  teacherAssignments: any[];
  students: any[];
  masterData: any;
  currentUser: any;
}

export const TeacherPanel = ({ 
  syllabuses, 
  setSyllabuses, 
  attendance, 
  setAttendance, 
  leaveRequests, 
  setLeaveRequests, 
  activities, 
  setActivities, 
  notifications,
  teacherAssignments,
  students,
  masterData, 
  currentUser 
}: TeacherPanelProps) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'attendance' | 'leaves' | 'activities' | 'progress' | 'fees' | 'hostel' | 'tools' | 'notifications'>('syllabus');
  
  const teacherAssignedClasses = teacherAssignments.filter((a: any) => 
    a.classTeacher === currentUser.name || 
    a.subjectTeachers.some((st: any) => st.teacher === currentUser.name)
  );

  const filteredSyllabuses = syllabuses.filter((s: any) => 
    teacherAssignedClasses.some((a: any) => a.class === s.class)
  );

  const filteredAttendance = attendance.filter((a: any) => 
    teacherAssignedClasses.some((tc: any) => 
      students.find(s => s.studentId === a.studentId)?.class === tc.class &&
      students.find(s => s.studentId === a.studentId)?.section === tc.section
    )
  );

  const filteredLeaveRequests = leaveRequests.filter((l: any) => 
    teacherAssignedClasses.some((tc: any) => tc.class === l.class && tc.section === l.section)
  );

  const filteredActivities = activities.filter((act: any) => 
    teacherAssignedClasses.some((tc: any) => tc.class === act.class && tc.section === act.section)
  );
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [newActivity, setNewActivity] = useState<any>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddActivity = () => {
    if (!newActivity.title || !newActivity.description) return;
    setActivities([{ ...newActivity, id: Date.now().toString() }, ...activities]);
    setShowActivityModal(false);
    setNewActivity({ title: '', description: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">Teacher Portal</h1>
          <p className="text-text-sub font-medium">Manage your classes, students, and academic responsibilities.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowActivityModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Upload Activity
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('syllabus')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'syllabus' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Syllabus</button>
        <button onClick={() => setActiveTab('attendance')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'attendance' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Attendance</button>
        <button onClick={() => setActiveTab('leaves')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'leaves' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Leaves</button>
        <button onClick={() => setActiveTab('activities')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'activities' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Activities</button>
        <button onClick={() => setActiveTab('progress')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'progress' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Progress</button>
        <button onClick={() => setActiveTab('fees')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'fees' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Fees</button>
        <button onClick={() => setActiveTab('hostel')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'hostel' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Hostel</button>
        <button onClick={() => setActiveTab('tools')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'tools' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Tools</button>
        <button onClick={() => setActiveTab('notifications')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'notifications' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Notifications</button>
      </div>

      {activeTab === 'syllabus' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSyllabuses.map((s) => (
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
                <div>
                  <p className="text-[10px] font-black text-primary uppercase">{s.subject}</p>
                  <p className="text-[10px] font-bold text-text-sub uppercase">Class {s.class}</p>
                </div>
                <button className="text-[10px] font-black text-primary uppercase hover:underline">Update Status</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'attendance' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold flex items-center gap-2"><Clock size={20} className="text-primary" /> My Class Attendance</h3>
            <button className="btn-primary px-4 py-2 text-xs">Mark Today's Attendance</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Student</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Status</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Time</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAttendance.slice(0, 10).map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-sm text-text-heading">{a.studentName}</p>
                      <p className="text-[10px] text-text-sub font-bold">{a.studentId}</p>
                    </td>
                    <td className="py-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                        a.status === 'Present' ? 'bg-green-100 text-green-700' :
                        a.status === 'Absent' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-text-sub">{a.time}</td>
                    <td className="py-4">
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-blue-500"><Edit2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'leaves' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeaveRequests.map((l) => (
            <Card key={l.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                  l.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  l.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  {l.status}
                </span>
                <p className="text-[10px] font-bold text-text-sub">{l.appliedDate}</p>
              </div>
              <h3 className="text-lg font-bold text-text-heading mb-1">{l.studentName}</h3>
              <p className="text-xs font-bold text-text-sub uppercase tracking-wider mb-4">Class {l.class}-{l.section}</p>
              <p className="text-xs text-text-sub mb-6 line-clamp-2">{l.reason}</p>
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                {l.status === 'Pending' && (
                  <>
                    <button 
                      onClick={() => setLeaveRequests(leaveRequests.map(req => req.id === l.id ? { ...req, status: 'Approved', approvedBy: currentUser.name } : req))}
                      className="flex-1 py-2 bg-green-500 text-white text-[10px] font-black uppercase rounded-xl"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => setLeaveRequests(leaveRequests.map(req => req.id === l.id ? { ...req, status: 'Rejected', approvedBy: currentUser.name } : req))}
                      className="flex-1 py-2 bg-red-500 text-white text-[10px] font-black uppercase rounded-xl"
                    >
                      Reject
                    </button>
                  </>
                )}
                {l.status !== 'Pending' && (
                  <p className="text-[10px] font-bold text-text-sub italic">Action taken by {l.approvedBy}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((act) => (
            <Card key={act.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{act.subject}</p>
                <p className="text-[10px] font-bold text-text-sub">{act.date}</p>
              </div>
              <h3 className="text-lg font-bold text-text-heading mb-2">{act.title}</h3>
              <p className="text-xs text-text-sub mb-4 line-clamp-3">{act.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-text-sub uppercase">Class {act.class}-{act.section}</p>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg text-blue-500"><Edit2 size={16} /></button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            </Card>
          ))}
          {filteredActivities.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 py-20 text-center text-text-sub font-medium italic">No activities uploaded yet.</div>
          )}
        </div>
      )}

      {activeTab === 'progress' && (
        <Card className="p-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Student Progress Tracking</h3>
            <p className="text-text-sub max-w-md mx-auto mb-8">Monitor academic performance, behavioral traits, and extra-curricular achievements of your students.</p>
            <button className="btn-primary px-8 py-4">Open Progress Dashboard</button>
          </div>
        </Card>
      )}

      {activeTab === 'fees' && (
        <Card className="p-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Fee Status Overview</h3>
            <p className="text-text-sub max-w-md mx-auto mb-8">View fee payment status for students in your class and send reminders to parents.</p>
            <button className="btn-primary px-8 py-4">View Fee List</button>
          </div>
        </Card>
      )}

      {activeTab === 'hostel' && (
        <Card className="p-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bed size={40} className="text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Hostel Management</h3>
            <p className="text-text-sub max-w-md mx-auto mb-8">Track hostel attendance and room assignments for students in your care.</p>
            <button className="btn-primary px-8 py-4">Open Hostel Panel</button>
          </div>
        </Card>
      )}

      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Laptop size={24} />
            </div>
            <h4 className="font-bold mb-2">Smart Time Table</h4>
            <p className="text-xs text-text-sub">AI-powered time table generator for your classes.</p>
          </Card>
          <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-all">
              <Star size={24} />
            </div>
            <h4 className="font-bold mb-2">Merit Certificates</h4>
            <p className="text-xs text-text-sub">Generate and award merit certificates to students.</p>
          </Card>
          <Card className="p-6 hover:shadow-xl transition-all cursor-pointer group">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
              <DoorOpen size={24} />
            </div>
            <h4 className="font-bold mb-2">Leave Management</h4>
            <p className="text-xs text-text-sub">Apply for your own leaves and track approval status.</p>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {notifications.filter(n => n.targetRoles.includes('teacher')).map((n) => (
            <Card key={n.id} className="p-6 border-l-4 border-primary">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-text-heading">{n.title}</h4>
                <p className="text-[10px] font-bold text-text-sub">{n.date}</p>
              </div>
              <p className="text-sm text-text-sub">{n.message}</p>
            </Card>
          ))}
          {notifications.filter(n => n.targetRoles.includes('teacher')).length === 0 && (
            <div className="py-20 text-center text-text-sub font-medium italic">No new notifications.</div>
          )}
        </div>
      )}

      {/* Upload Activity Modal */}
      <AnimatePresence>
        {showActivityModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-text-heading uppercase">Upload Activity</h3>
                <button onClick={() => setShowActivityModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Class" options={masterData.classes} value={newActivity.class} onChange={(e: any) => setNewActivity({ ...newActivity, class: e.target.value })} />
                  <Select label="Section" options={masterData.sections} value={newActivity.section} onChange={(e: any) => setNewActivity({ ...newActivity, section: e.target.value })} />
                </div>
                <Select label="Subject" options={masterData.subjects} value={newActivity.subject} onChange={(e: any) => setNewActivity({ ...newActivity, subject: e.target.value })} />
                <Input label="Activity Title" value={newActivity.title} onChange={(e: any) => setNewActivity({ ...newActivity, title: e.target.value })} />
                <div className="space-y-2">
                  <label className="label-text">Description</label>
                  <textarea className="input-field min-h-[100px]" value={newActivity.description} onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}></textarea>
                </div>
                <FileUpload label="Attach Files (Optional)" onFileSelect={() => {}} />
                <button onClick={handleAddActivity} className="btn-primary w-full py-4 mt-4">Post Activity</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
