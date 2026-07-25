import React, { useState } from 'react';
import { 
  Bell, 
  MessageCircle, 
  FileText, 
  Plus, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Notification } from '../../types';

interface CommunicatePanelProps {
  notifications: Notification[];
  setNotifications: (notifications: Notification[]) => void;
  templates: any[];
  setTemplates: (templates: any[]) => void;
}

export const CommunicatePanel = ({ 
  notifications, 
  setNotifications, 
  templates, 
  setTemplates 
}: CommunicatePanelProps) => {
  const [activeTab, setActiveTab] = useState('notice-board');
  const [showAddNotice, setShowAddNotice] = useState(false);
  const [newNotice, setNewNotice] = useState<Partial<Notification>>({
    type: 'Info',
    targetRoles: ['admin', 'teacher', 'student', 'parent'],
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddNotice = () => {
    if (!newNotice.title || !newNotice.message) return;
    const notice: Notification = {
      ...newNotice as Notification,
      id: `NOT-${Date.now()}`
    };
    setNotifications([notice, ...notifications]);
    setShowAddNotice(false);
    setNewNotice({ type: 'Info', targetRoles: ['admin', 'teacher', 'student', 'parent'], date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-text-heading">Communicate</h2>
        <button 
          onClick={() => setShowAddNotice(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Add Notice
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'notice-board', label: 'Notice Board', icon: Bell },
          { id: 'send-message', label: 'Send Email/WhatsApp', icon: MessageCircle },
          { id: 'templates', label: 'Templates', icon: FileText }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-primary'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'notice-board' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {notifications.map((n: Notification) => (
            <Card key={n.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                n.type === 'Warning' ? 'bg-orange-500' : 
                n.type === 'Success' ? 'bg-green-500' : 
                n.type === 'Fee' ? 'bg-purple-500' : 'bg-blue-500'
              }`} />
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-black text-text-heading">{n.title}</h4>
                <span className="text-[10px] font-bold text-text-sub uppercase">{n.date}</span>
              </div>
              <p className="text-sm text-text-sub mb-4">{n.message}</p>
              <div className="flex flex-wrap gap-2">
                {n.targetRoles.map(role => (
                  <span key={role} className="text-[8px] font-black px-2 py-1 bg-slate-100 rounded-full uppercase text-slate-500">
                    {role}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Notice Modal */}
      <AnimatePresence>
        {showAddNotice && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-text-heading">Add New Notice</h3>
                <button onClick={() => setShowAddNotice(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <Input label="Title" required value={newNotice.title} onChange={(e: any) => setNewNotice({...newNotice, title: e.target.value})} />
                <div className="w-full">
                  <label className="label-text">Message <span className="text-red-500">*</span></label>
                  <textarea 
                    className="input-field min-h-[120px]" 
                    value={newNotice.message}
                    onChange={(e: any) => setNewNotice({...newNotice, message: e.target.value})}
                  />
                </div>
                <div className="w-full">
                  <label className="label-text">Notice Type</label>
                  <select 
                    className="input-field"
                    value={newNotice.type}
                    onChange={(e: any) => setNewNotice({...newNotice, type: e.target.value as any})}
                  >
                    <option value="Info">Information</option>
                    <option value="Warning">Warning</option>
                    <option value="Success">Success</option>
                    <option value="Fee">Fee Related</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowAddNotice(false)} className="flex-1 py-4 font-bold text-text-sub hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button onClick={handleAddNotice} className="flex-1 btn-primary py-4">Post Notice</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
