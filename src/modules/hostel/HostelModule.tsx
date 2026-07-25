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
  Bed,
  DoorOpen,
  Home,
  FileOutput,
  HeartPulse,
  MessageCircle,
  UserPlus,
  Eye,
  FileEdit,
  ClipboardList,
  Trophy,
  Star,
  Bell,
  Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

export const HostelModule = () => {
  const [activeTab, setActiveTab] = useState<'rooms' | 'allocation' | 'attendance' | 'mess'>('rooms');
  const [showAddModal, setShowAddModal] = useState(false);

  const rooms = [
    { id: '101', type: 'Triple Bed', capacity: 3, occupied: 2, floor: '1st Floor', status: 'Available' },
    { id: '102', type: 'Double Bed', capacity: 2, occupied: 2, floor: '1st Floor', status: 'Full' },
    { id: '103', type: 'Single Bed', capacity: 1, occupied: 0, floor: '1st Floor', status: 'Available' },
    { id: '201', type: 'Triple Bed', capacity: 3, occupied: 3, floor: '2nd Floor', status: 'Full' },
    { id: '202', type: 'Double Bed', capacity: 2, occupied: 1, floor: '2nd Floor', status: 'Available' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">Hostel Management</h1>
          <p className="text-text-sub font-medium">Manage rooms, student allocations, and mess facilities.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2"><Plus size={20} /> Add New Room</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 border-l-4 border-primary">
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Total Rooms</p>
          <p className="text-3xl font-black text-text-heading">45</p>
          <p className="text-[10px] font-bold text-text-sub mt-1">12 Available | 33 Full</p>
        </Card>
        <Card className="p-6 border-l-4 border-green-500">
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Total Residents</p>
          <p className="text-3xl font-black text-text-heading">112</p>
          <p className="text-[10px] font-bold text-green-600 mt-1">95% Occupancy Rate</p>
        </Card>
        <Card className="p-6 border-l-4 border-orange-500">
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Pending Requests</p>
          <p className="text-3xl font-black text-text-heading">8</p>
          <p className="text-[10px] font-bold text-orange-600 mt-1">Room allocation pending</p>
        </Card>
        <Card className="p-6 border-l-4 border-purple-500">
          <p className="text-[10px] font-black text-text-sub uppercase tracking-widest mb-1">Mess Status</p>
          <p className="text-3xl font-black text-text-heading">Active</p>
          <p className="text-[10px] font-bold text-purple-600 mt-1">Lunch served: 12:30 PM</p>
        </Card>
      </div>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('rooms')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'rooms' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Room Management</button>
        <button onClick={() => setActiveTab('allocation')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'allocation' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Student Allocation</button>
        <button onClick={() => setActiveTab('attendance')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'attendance' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Hostel Attendance</button>
        <button onClick={() => setActiveTab('mess')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 whitespace-nowrap ${activeTab === 'mess' ? 'border-primary text-primary' : 'border-transparent text-text-sub'}`}>Mess & Menu</button>
      </div>

      {activeTab === 'rooms' && (
        <Card className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-transparent hover:border-primary/10 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all"><Bed size={24} /></div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                    room.status === 'Available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {room.status}
                  </span>
                </div>
                <h4 className="text-xl font-black text-text-heading mb-1">Room {room.id}</h4>
                <p className="text-[10px] font-bold text-text-sub uppercase tracking-widest mb-6">{room.type} | {room.floor}</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <p className="text-text-sub">Occupancy</p>
                    <p className="text-text-heading">{room.occupied} / {room.capacity}</p>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(room.occupied / room.capacity) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Room Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-text-heading uppercase">Add New Room</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <Input label="Room Number" placeholder="e.g., 101" />
                <Select label="Room Type" options={['Single Bed', 'Double Bed', 'Triple Bed', 'Four Bed']} value="" onChange={() => {}} />
                <Input label="Capacity" type="number" />
                <Select label="Floor" options={['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor']} value="" onChange={() => {}} />
                <button onClick={() => setShowAddModal(false)} className="btn-primary w-full py-4 mt-6">Add Room</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
