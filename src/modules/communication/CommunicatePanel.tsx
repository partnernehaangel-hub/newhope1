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
  Bell,
  MessageCircle,
  Mail,
  Send,
  Smartphone,
  Eye,
  FileEdit,
  ClipboardList,
  Trophy,
  Star,
  Laptop,
  Bed,
  DoorOpen,
  UserCircle,
  Home,
  FileOutput,
  HeartPulse
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Notification } from '../../types';

interface CommunicatePanelProps {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
}

export const CommunicatePanel = ({ notifications, setNotifications }: CommunicatePanelProps) => {
  const [activeTab, setActiveTab] = useState<'notice' | 'email' | 'sms'>('notice');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotice, setNewNotice] = useState<any>({
    title: '',
    message: '',
    targetRoles: ['student', 'parent', 'teacher'],
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddNotice = () => {
    if (!newNotice.title || !newNotice.message) return;
    const notice: Notification = {
      ...newNotice,
      id: Date.now().toString()
    };
    setNotifications([notice, ...notifications]);
    setShowAddModal(false);
    setNewNotice({ title: '', message: '', targetRoles: ['student', 'parent', 'teacher'], date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">Communication Center</h1>
          <p className="text-text-sub font-medium">Send notices, emails, and SMS to school community.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2"><Plus size={20} /> New Notice</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card onClick={() => setActiveTab('notice')} className={`p-8 cursor-pointer transition-all border-2 ${activeTab === 'notice' ? 'border-primary bg-primary/5' : 'border-transparent hover:border-slate-200'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl ${activeTab === 'notice' ? 'bg-primary text-white' : 'bg-slate-100 text-text-sub'}`}><Bell size={24} /></div>
            <h3 className="text-xl font-black text-text-heading uppercase tracking-tight">Notice Board</h3>
          </div>
          <p className="text-xs text-text-sub font-medium">Post announcements on the digital notice board for students, parents, and staff.</p>
        </Card>
        <Card onClick={() => setActiveTab('email')} className={`p-8 cursor-pointer transition-all border-2 ${activeTab === 'email' ? 'border-primary bg-primary/5' : 'border-transparent hover:border-slate-200'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl ${activeTab === 'email' ? 'bg-primary text-white' : 'bg-slate-100 text-text-sub'}`}><Mail size={24} /></div>
            <h3 className="text-xl font-black text-text-heading uppercase tracking-tight">Email Center</h3>
          </div>
          <p className="text-xs text-text-sub font-medium">Send official emails and newsletters to registered email addresses.</p>
        </Card>
        <Card onClick={() => setActiveTab('sms')} className={`p-8 cursor-pointer transition-all border-2 ${activeTab === 'sms' ? 'border-primary bg-primary/5' : 'border-transparent hover:border-slate-200'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-2xl ${activeTab === 'sms' ? 'bg-primary text-white' : 'bg-slate-100 text-text-sub'}`}><Smartphone size={24} /></div>
            <h3 className="text-xl font-black text-text-heading uppercase tracking-tight">SMS Gateway</h3>
          </div>
          <p className="text-xs text-text-sub font-medium">Send urgent alerts and short messages directly to mobile numbers.</p>
        </Card>
      </div>

      {activeTab === 'notice' && (
        <Card className="p-8">
          <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Recent Notices</h3>
          <div className="space-y-6">
            {notifications.map((n) => (
              <div key={n.id} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent hover:border-primary/10 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Bell size={18} /></div>
                    <h4 className="font-bold text-text-heading">{n.title}</h4>
                  </div>
                  <p className="text-[10px] font-bold text-text-sub uppercase">{n.date}</p>
                </div>
                <p className="text-sm text-text-sub mb-6">{n.message}</p>
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex gap-2">
                    {n.targetRoles.map((role, idx) => (
                      <span key={idx} className="text-[10px] font-black px-2 py-1 bg-slate-200 text-text-sub rounded-full uppercase">{role}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-200 rounded-lg text-text-sub"><Edit2 size={16} /></button>
                    <button className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Notice Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-text-heading uppercase">Create New Notice</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <Input label="Notice Title" value={newNotice.title} onChange={(e: any) => setNewNotice({ ...newNotice, title: e.target.value })} placeholder="e.g., Annual Sports Day 2024" />
                <div className="space-y-2">
                  <label className="label-text">Notice Message</label>
                  <textarea className="input-field min-h-[120px]" value={newNotice.message} onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })} placeholder="Write your announcement here..."></textarea>
                </div>
                <div className="space-y-2">
                  <label className="label-text">Target Audience</label>
                  <div className="flex flex-wrap gap-3">
                    {['student', 'parent', 'teacher', 'admin'].map((role) => (
                      <button 
                        key={role} 
                        onClick={() => {
                          const roles = newNotice.targetRoles.includes(role) 
                            ? newNotice.targetRoles.filter((r: string) => r !== role)
                            : [...newNotice.targetRoles, role];
                          setNewNotice({ ...newNotice, targetRoles: roles });
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                          newNotice.targetRoles.includes(role) ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-text-sub hover:bg-slate-200'
                        }`}
                      >
                        {role}s
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleAddNotice} className="btn-primary w-full py-4 mt-6 flex items-center justify-center gap-2">
                  <Send size={20} /> Post Announcement
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
