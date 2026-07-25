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
  Lock,
  Unlock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Staff } from '../../types';

interface RoleAssignPanelProps {
  staff: Staff[];
}

export const RoleAssignPanel = ({ staff }: RoleAssignPanelProps) => {
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const roles = [
    { name: 'Super Admin', permissions: ['all'], color: 'bg-red-100 text-red-700' },
    { name: 'Admin', permissions: ['manage_students', 'manage_staff', 'manage_fees'], color: 'bg-blue-100 text-blue-700' },
    { name: 'Teacher', permissions: ['attendance', 'syllabus', 'homework'], color: 'bg-green-100 text-green-700' },
    { name: 'Accountant', permissions: ['fees', 'payroll', 'expenses'], color: 'bg-orange-100 text-orange-700' },
    { name: 'Librarian', permissions: ['manage_books', 'issue_return'], color: 'bg-purple-100 text-purple-700' },
    { name: 'Receptionist', permissions: ['visitors', 'enquiries', 'calls'], color: 'bg-pink-100 text-pink-700' },
  ];

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.staffId.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">Role & Permissions</h1>
          <p className="text-text-sub font-medium">Assign roles and manage access control for staff members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 p-8">
          <h3 className="text-xl font-black text-text-heading mb-8 uppercase tracking-tight">Staff List</h3>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub" size={18} />
            <input type="text" placeholder="Search staff..." className="input-field pl-12" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
            {filteredStaff.map((s) => (
              <div 
                key={s.id} 
                onClick={() => setSelectedStaff(s)}
                className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                  selectedStaff?.id === s.id ? 'border-primary bg-primary/5' : 'border-transparent bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">{s.name[0]}</div>
                  <div>
                    <p className="font-bold text-sm text-text-heading">{s.name}</p>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{s.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-8">
          {selectedStaff ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl">{selectedStaff.name[0]}</div>
                  <div>
                    <h3 className="text-2xl font-black text-text-heading uppercase tracking-tight">{selectedStaff.name}</h3>
                    <p className="text-sm font-bold text-text-sub uppercase tracking-widest">{selectedStaff.staffId} | {selectedStaff.department}</p>
                  </div>
                </div>
                <button className="btn-primary flex items-center gap-2"><Shield size={18} /> Save Changes</button>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-black text-text-heading uppercase tracking-widest">Assign System Role</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((role) => (
                    <div 
                      key={role.name}
                      onClick={() => setSelectedStaff({ ...selectedStaff, role: role.name })}
                      className={`p-6 rounded-3xl cursor-pointer transition-all border-2 flex items-center justify-between ${
                        selectedStaff.role === role.name ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div>
                        <p className="font-black text-text-heading uppercase tracking-tight">{role.name}</p>
                        <p className="text-[10px] font-bold text-text-sub mt-1">{role.permissions.length} Permissions</p>
                      </div>
                      <div className={`p-2 rounded-lg ${selectedStaff.role === role.name ? 'bg-primary text-white' : 'bg-slate-100 text-text-sub'}`}>
                        {selectedStaff.role === role.name ? <Lock size={18} /> : <Unlock size={18} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-black text-text-heading uppercase tracking-widest">Specific Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    'Student Admission', 'Fee Collection', 'Attendance Marking', 
                    'Syllabus Management', 'Exam Results', 'Payroll Access',
                    'Inventory Management', 'Transport Tracking', 'Library Access'
                  ].map((perm) => (
                    <label key={perm} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all">
                      <input type="checkbox" className="w-5 h-5 rounded-lg border-2 border-slate-300 text-primary focus:ring-primary" defaultChecked={Math.random() > 0.5} />
                      <span className="text-xs font-bold text-text-heading">{perm}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
              <div className="p-6 bg-slate-50 rounded-full text-text-sub"><Shield size={48} /></div>
              <div>
                <h3 className="text-xl font-black text-text-heading uppercase tracking-tight">Select a Staff Member</h3>
                <p className="text-sm text-text-sub font-medium">Choose a staff member from the list to manage their roles and permissions.</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
