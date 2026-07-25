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
  Shield,
  UserPlus,
  Eye,
  FileEdit,
  ClipboardList,
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
  Database,
  Settings,
  Lock,
  Unlock,
  Activity,
  Server,
  Cloud,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

export const SuperAdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'system' | 'database' | 'security' | 'logs'>('system');

  const systemStats = [
    { name: 'CPU Usage', value: '12%', status: 'Healthy', icon: <Activity size={20} />, color: 'text-green-600 bg-green-100' },
    { name: 'Memory', value: '2.4 GB', status: 'Healthy', icon: <Server size={20} />, color: 'text-blue-600 bg-blue-100' },
    { name: 'Storage', value: '45.2 GB', status: 'Healthy', icon: <Database size={20} />, color: 'text-purple-600 bg-purple-100' },
    { name: 'Cloud Sync', value: 'Active', status: 'Healthy', icon: <Cloud size={20} />, color: 'text-orange-600 bg-orange-100' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">Super Admin Control Panel</h1>
          <p className="text-text-sub font-medium">System-wide settings, database management, and security controls.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2"><RefreshCw size={18} /> System Refresh</button>
          <button className="btn-primary flex items-center gap-2"><Settings size={18} /> Global Settings</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, idx) => (
          <Card key={idx} className="p-6 border-l-4 border-primary">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black text-text-sub uppercase tracking-widest">{stat.name}</p>
              <div className={`p-2 rounded-lg ${stat.color}`}>{stat.icon}</div>
            </div>
            <p className="text-2xl font-black text-text-heading">{stat.value}</p>
            <p className="text-[10px] font-bold text-green-600 mt-1">{stat.status}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('system')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'system' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>System Configuration</button>
        <button onClick={() => setActiveTab('database')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'database' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Database Backup</button>
        <button onClick={() => setActiveTab('security')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'security' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Security Audit</button>
        <button onClick={() => setActiveTab('logs')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'logs' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>System Logs</button>
      </div>

      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8">
            <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">School Information</h3>
            <div className="space-y-6">
              <Input label="School Name" value="Global International School" onChange={() => {}} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="School Code" value="GIS-2024" onChange={() => {}} />
                <Input label="Session Year" value="2024-25" onChange={() => {}} />
              </div>
              <Input label="Address" value="123, Academic Street, Knowledge City" onChange={() => {}} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Contact Number" value="+91 98765 43210" onChange={() => {}} />
                <Input label="Email Address" value="info@globalschool.edu" onChange={() => {}} />
              </div>
            </div>
          </Card>
          <Card className="p-8">
            <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">System Modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Student Management', 'Fee Management', 'Attendance System', 
                'Exam Management', 'Library System', 'Transport Tracking',
                'Hostel Management', 'Human Resource', 'Front Office'
              ].map((module) => (
                <label key={module} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                  <span className="text-xs font-bold text-text-heading">{module}</span>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={Math.random() > 0.3} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'database' && (
        <Card className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-text-heading uppercase tracking-tight">Database Backups</h3>
            <button className="btn-primary flex items-center gap-2"><Database size={20} /> Create New Backup</button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'gis_db_full_20240325.sql', size: '450 MB', date: '2024-03-25 10:00 AM', status: 'Completed' },
              { name: 'gis_db_full_20240324.sql', size: '448 MB', date: '2024-03-24 10:00 AM', status: 'Completed' },
              { name: 'gis_db_full_20240323.sql', size: '445 MB', date: '2024-03-23 10:00 AM', status: 'Completed' },
            ].map((backup, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Database size={20} /></div>
                  <div>
                    <p className="font-bold text-text-heading">{backup.name}</p>
                    <p className="text-[10px] font-bold text-text-sub uppercase">{backup.size} | {backup.date}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-200 rounded-lg text-text-sub"><Download size={18} /></button>
                  <button className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
