import React, { useState } from 'react';
import { 
  Users, 
  Receipt, 
  UserCheck, 
  Clock, 
  BookOpen, 
  Home, 
  ShieldCheck, 
  ArrowRightLeft, 
  Calendar, 
  FileSpreadsheet 
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card } from '../../components/common/Card';

interface ReportsViewProps {
  students: any[];
  feeTransactions: any[];
  attendance: any[];
  homeworks: any[];
  hostelAttendance: any[];
  masterData: any;
  leaveRequests: any[];
  userLogs: any[];
}

export const ReportsView = ({ 
  students, 
  feeTransactions, 
  attendance, 
  homeworks, 
  hostelAttendance, 
  masterData, 
  leaveRequests, 
  userLogs 
}: ReportsViewProps) => {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    class: '',
    section: '',
    date: new Date().toISOString().split('T')[0]
  });

  const reports = [
    { id: 'students', title: 'STUDENTS INFORMATION', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-50' },
    { id: 'finance', title: 'FINANCE', icon: Receipt, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    { id: 'attendance', title: 'ATTENDANCE', icon: UserCheck, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { id: 'leave', title: 'LEAVE & PICKUP', icon: Clock, color: 'text-rose-500', bgColor: 'bg-rose-50' },
    { id: 'homework', title: 'HOME WORK', icon: BookOpen, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    { id: 'hostel', title: 'HOSTEL', icon: Home, color: 'text-pink-500', bgColor: 'bg-pink-50' },
    { id: 'userlog', title: 'USER LOG', icon: ShieldCheck, color: 'text-slate-500', bgColor: 'bg-slate-50' },
  ];

  const filteredStudents = students.filter((s: any) => 
    (!filters.class || s.class === filters.class) && 
    (!filters.section || s.section === filters.section)
  );

  const filteredFinance = feeTransactions.filter((t: any) => 
    (!filters.class || t.class === filters.class) && 
    (!filters.section || t.section === filters.section) &&
    (!filters.date || t.date === new Date(filters.date).toLocaleDateString())
  );

  const filteredAttendance = attendance.filter((a: any) => 
    (!filters.class || a.class === filters.class) && 
    (!filters.section || a.section === filters.section) &&
    (!filters.date || a.date === new Date(filters.date).toLocaleDateString())
  );

  const filteredHomework = homeworks.filter((h: any) => 
    (!filters.class || h.class === filters.class) && 
    (!filters.section || h.section === filters.section) &&
    (!filters.date || h.date === new Date(filters.date).toLocaleDateString())
  );

  const filteredHostel = hostelAttendance.filter((a: any) => 
    (!filters.date || a.date === new Date(filters.date).toLocaleDateString())
  );

  const filteredLeave = leaveRequests.filter((l: any) => 
    (!filters.date || l.startDate === new Date(filters.date).toLocaleDateString())
  );

  const exportToExcel = (data: any[], fileName: string) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight">Reports Center 📊</h1>
          <p className="text-text-sub font-medium">Generate and filter comprehensive school reports.</p>
        </div>
        {activeReport && (
          <button 
            onClick={() => setActiveReport(null)}
            className="flex items-center gap-2 text-text-sub hover:text-primary font-bold transition-all"
          >
            <ArrowRightLeft size={18} className="rotate-180" /> Back to Reports
          </button>
        )}
      </div>

      {!activeReport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all text-left"
            >
              <div className={`w-14 h-14 ${report.bgColor} ${report.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all shadow-sm`}>
                <report.icon size={28} />
              </div>
              <h3 className="text-lg font-black text-text-heading mb-2">{report.title}</h3>
              <p className="text-sm text-text-sub font-medium">View and filter {report.title.toLowerCase()} data.</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">
                  <Calendar size={16} className="text-text-secondary" />
                  <input 
                    type="date" 
                    className="bg-transparent outline-none text-sm font-medium"
                    value={filters.date}
                    onChange={(e) => setFilters({...filters, date: e.target.value})}
                  />
                </div>
                <select 
                  className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm font-medium"
                  value={filters.class}
                  onChange={(e) => setFilters({...filters, class: e.target.value})}
                >
                  <option value="">All Classes</option>
                  {masterData.classes.map((c: string) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                  className="bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 outline-none text-sm font-medium"
                  value={filters.section}
                  onChange={(e) => setFilters({...filters, section: e.target.value})}
                >
                  <option value="">All Sections</option>
                  {masterData.sections.map((s: string) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <button 
                onClick={() => exportToExcel(
                  activeReport === 'students' ? filteredStudents :
                  activeReport === 'finance' ? filteredFinance :
                  activeReport === 'attendance' ? filteredAttendance :
                  activeReport === 'leave' ? filteredLeave :
                  activeReport === 'homework' ? filteredHomework :
                  activeReport === 'hostel' ? filteredHostel : [],
                  `${activeReport}_report`
                )}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
              >
                <FileSpreadsheet size={18} />
                Export Excel
              </button>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                  {activeReport === 'students' && (
                    <tr>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">ID</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Name</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Class</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Father Name</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Mobile</th>
                    </tr>
                  )}
                  {activeReport === 'finance' && (
                    <tr>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Date</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Student</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Fee Type</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Amount</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Status</th>
                    </tr>
                  )}
                  {activeReport === 'attendance' && (
                    <tr>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Date</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Student</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Class</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Status</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Period</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Time</th>
                    </tr>
                  )}
                  {activeReport === 'leave' && (
                    <tr>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Date</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Student</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Type</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Pickup Time</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Status</th>
                    </tr>
                  )}
                  {activeReport === 'homework' && (
                    <tr>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Date</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Subject</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Title</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Due Date</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Submissions</th>
                    </tr>
                  )}
                  {activeReport === 'hostel' && (
                    <tr>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Date</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Student ID</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Status</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Time</th>
                    </tr>
                  )}
                  {activeReport === 'userlog' && (
                    <tr>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Time</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">User</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">Action</th>
                      <th className="p-4 font-bold text-xs uppercase text-text-secondary">IP Address</th>
                    </tr>
                  )}
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeReport === 'students' && filteredStudents.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="p-4 text-sm font-bold text-primary">{s.studentId}</td>
                      <td className="p-4 text-sm font-bold">{s.name} {s.surname}</td>
                      <td className="p-4 text-sm font-medium">{s.class} - {s.section}</td>
                      <td className="p-4 text-sm font-medium">{s.fatherName}</td>
                      <td className="p-4 text-sm font-medium">{s.fatherMobile}</td>
                    </tr>
                  ))}
                  {activeReport === 'finance' && filteredFinance.map((t: any) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="p-4 text-sm font-medium">{t.date}</td>
                      <td className="p-4 text-sm font-bold">{t.studentName}</td>
                      <td className="p-4 text-sm font-medium">{t.feeType}</td>
                      <td className="p-4 text-sm font-black text-emerald-600">₹{t.totalPaid}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${t.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {activeReport === 'attendance' && filteredAttendance.map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="p-4 text-sm font-medium">{a.date}</td>
                      <td className="p-4 text-sm font-bold">{a.studentName}</td>
                      <td className="p-4 text-sm font-medium">{a.class} - {a.section}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${a.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-bold text-primary">{a.period || 'Morning'}</td>
                      <td className="p-4 text-sm font-medium">{a.time}</td>
                    </tr>
                  ))}
                  {activeReport === 'leave' && filteredLeave.map((l: any) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="p-4 text-sm font-medium">{l.startDate}</td>
                      <td className="p-4 text-sm font-bold">{l.studentName}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                          l.type === 'Early Leave' ? 'bg-orange-100 text-orange-700' : 
                          l.type === 'Parent Pickup' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {l.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium">{l.pickupTime || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                          l.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                          l.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {activeReport === 'homework' && filteredHomework.map((h: any) => (
                    <tr key={h.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="p-4 text-sm font-medium">{h.date}</td>
                      <td className="p-4 text-sm font-bold text-primary">{h.subject}</td>
                      <td className="p-4 text-sm font-bold">{h.title}</td>
                      <td className="p-4 text-sm font-medium text-red-500">{h.dueDate}</td>
                      <td className="p-4 text-sm font-bold">{h.submissions.length} Students</td>
                    </tr>
                  ))}
                  {activeReport === 'hostel' && filteredHostel.map((a: any) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="p-4 text-sm font-medium">{a.date}</td>
                      <td className="p-4 text-sm font-bold">{a.studentId}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${a.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm font-medium">{a.time}</td>
                    </tr>
                  ))}
                  {activeReport === 'userlog' && userLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-all">
                      <td className="p-4 text-sm font-medium">{log.timestamp}</td>
                      <td className="p-4 text-sm font-bold">{log.user}</td>
                      <td className="p-4 text-sm font-medium">{log.action}</td>
                      <td className="p-4 text-sm font-medium text-text-sub">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(
                (activeReport === 'students' && filteredStudents.length === 0) ||
                (activeReport === 'finance' && filteredFinance.length === 0) ||
                (activeReport === 'attendance' && filteredAttendance.length === 0) ||
                (activeReport === 'leave' && filteredLeave.length === 0) ||
                (activeReport === 'homework' && filteredHomework.length === 0) ||
                (activeReport === 'hostel' && filteredHostel.length === 0) ||
                (activeReport === 'userlog' && userLogs.length === 0)
              ) && (
                <div className="text-center py-20">
                  <p className="text-text-sub font-medium italic">No records found for the selected filters.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
