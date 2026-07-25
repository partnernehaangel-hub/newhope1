import React from 'react';
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
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Card } from '../../components/common/Card';

interface Admin360ViewProps {
  students: any[];
  attendance: any[];
  feeTransactions: any[];
  staff: any[];
}

export const Admin360View = ({ students, attendance, feeTransactions, staff }: Admin360ViewProps) => {
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const feeData = [
    { month: 'Jan', amount: 450000 },
    { month: 'Feb', amount: 520000 },
    { month: 'Mar', amount: 480000 },
    { month: 'Apr', amount: 610000 },
    { month: 'May', amount: 550000 },
    { month: 'Jun', amount: 670000 },
  ];

  const attendanceData = [
    { name: 'Present', value: 85 },
    { name: 'Absent', value: 10 },
    { name: 'Late', value: 5 },
  ];

  const classPerformance = [
    { class: 'Class 1', avg: 82 },
    { class: 'Class 2', avg: 78 },
    { class: 'Class 3', avg: 85 },
    { class: 'Class 4', avg: 80 },
    { class: 'Class 5', avg: 88 },
    { class: 'Class 6', avg: 75 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">Admin 360 Dashboard</h1>
          <p className="text-text-sub font-medium">Comprehensive overview of school performance and metrics.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2"><Download size={18} /> Export Report</button>
          <button className="btn-primary flex items-center gap-2"><Printer size={18} /> Print View</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-primary">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Total Students</p>
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Users size={20} /></div>
          </div>
          <p className="text-3xl font-black text-text-heading">{students.length}</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 mt-2">
            <ArrowUpRight size={14} /> +12% from last session
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Fee Collection</p>
            <div className="p-2 bg-green-100 rounded-lg text-green-600"><TrendingUp size={20} /></div>
          </div>
          <p className="text-3xl font-black text-text-heading">₹12.5L</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 mt-2">
            <ArrowUpRight size={14} /> +8% target achieved
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Avg Attendance</p>
            <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><CheckCircle2 size={20} /></div>
          </div>
          <p className="text-3xl font-black text-text-heading">92.4%</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 mt-2">
            <ArrowDownRight size={14} /> -2% from last month
          </div>
        </Card>
        <Card className="p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">Total Staff</p>
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Users size={20} /></div>
          </div>
          <p className="text-3xl font-black text-text-heading">{staff.length}</p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-text-sub mt-2">
            98% active status
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8">
          <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Fee Collection Trends</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={feeData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#6366f1' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Class-wise Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="class" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#6366f1' }}
                />
                <Bar dataKey="avg" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="p-8">
          <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Attendance Rate</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {attendanceData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-[10px] font-bold text-text-sub uppercase">{entry.name}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-8">
          <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Recent Activities</h3>
          <div className="space-y-6">
            {[
              { title: 'Fee Collection', desc: '₹25,000 collected from Class 10A', time: '2 mins ago', icon: <TrendingUp size={18} />, color: 'text-green-600 bg-green-100' },
              { title: 'New Admission', desc: 'Rahul Sharma admitted to Class 1', time: '15 mins ago', icon: <UserPlus size={18} />, color: 'text-blue-600 bg-blue-100' },
              { title: 'Leave Approved', desc: 'Staff leave approved for Sunita Devi', time: '1 hour ago', icon: <CheckCircle2 size={18} />, color: 'text-purple-600 bg-purple-100' },
              { title: 'Exam Schedule', desc: 'Final exam schedule published', time: '3 hours ago', icon: <Calendar size={18} />, color: 'text-orange-600 bg-orange-100' },
            ].map((act, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${act.color}`}>{act.icon}</div>
                  <div>
                    <p className="font-bold text-text-heading">{act.title}</p>
                    <p className="text-xs text-text-sub">{act.desc}</p>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-text-sub uppercase">{act.time}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
