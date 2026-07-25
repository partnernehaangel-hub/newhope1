import React, { useState } from 'react';
import { 
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
  ArrowDownRight
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
import { Select } from '../../components/common/Select';

interface Class360ViewProps {
  students: any[];
  attendance: any[];
}

export const Class360View = ({ students, attendance }: Class360ViewProps) => {
  const [selectedClass, setSelectedClass] = useState('Class 1');
  const [selectedSection, setSelectedSection] = useState('A');

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const classAttendanceData = [
    { day: 'Mon', rate: 95 },
    { day: 'Tue', rate: 92 },
    { day: 'Wed', rate: 88 },
    { day: 'Thu', rate: 94 },
    { day: 'Fri', rate: 91 },
    { day: 'Sat', rate: 85 },
  ];

  const subjectPerformance = [
    { subject: 'Math', avg: 82, highest: 98, lowest: 45 },
    { subject: 'Science', avg: 78, highest: 95, lowest: 52 },
    { subject: 'English', avg: 85, highest: 96, lowest: 60 },
    { subject: 'Social', avg: 80, highest: 92, lowest: 48 },
    { subject: 'Hindi', avg: 88, highest: 94, lowest: 65 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">Class 360 View</h1>
          <p className="text-text-sub font-medium">Detailed insights into specific class performance and metrics.</p>
        </div>
        <div className="flex gap-4">
          <div className="w-48">
            <Select 
              label="Select Class" 
              options={['LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']} 
              value={selectedClass} 
              onChange={(e: any) => setSelectedClass(e.target.value)} 
            />
          </div>
          <div className="w-32">
            <Select 
              label="Section" 
              options={['A', 'B', 'C', 'D']} 
              value={selectedSection} 
              onChange={(e: any) => setSelectedSection(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-primary">
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Class Strength</p>
          <p className="text-3xl font-black text-text-heading">45</p>
          <p className="text-[10px] font-bold text-text-sub mt-1">24 Boys | 21 Girls</p>
        </Card>
        <Card className="p-6 border-l-4 border-green-500">
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Today's Attendance</p>
          <p className="text-3xl font-black text-text-heading">94.2%</p>
          <p className="text-[10px] font-bold text-green-600 mt-1">42 Present | 3 Absent</p>
        </Card>
        <Card className="p-6 border-l-4 border-orange-500">
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Average Score</p>
          <p className="text-3xl font-black text-text-heading">82.5%</p>
          <p className="text-[10px] font-bold text-orange-600 mt-1">B+ Grade Average</p>
        </Card>
        <Card className="p-6 border-l-4 border-purple-500">
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Syllabus Progress</p>
          <p className="text-3xl font-black text-text-heading">65%</p>
          <p className="text-[10px] font-bold text-purple-600 mt-1">On track for Term 2</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8">
          <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Weekly Attendance Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={classAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#6366f1' }}
                />
                <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={4} dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8">
          <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Subject Performance Analysis</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectPerformance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} width={80} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#6366f1' }}
                />
                <Bar dataKey="avg" fill="#6366f1" radius={[0, 8, 8, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-8">
        <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Top Performers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Aditya Kumar', score: 98, rank: 1, img: 'A' },
            { name: 'Sneha Singh', score: 96, rank: 2, img: 'S' },
            { name: 'Rahul Verma', score: 95, rank: 3, img: 'R' },
            { name: 'Priya Das', score: 94, rank: 4, img: 'P' },
          ].map((student, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg">
                {student.img}
              </div>
              <div>
                <p className="font-bold text-text-heading">{student.name}</p>
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{student.score}% | Rank #{student.rank}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
