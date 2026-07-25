import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Share2, 
  CheckCircle2, 
  AlertCircle,
  X,
  Sparkles,
  CalendarRange
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';

export const AcademicPlanner = ({ currentUser }: any) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'events' | 'holidays'>('calendar');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<any>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'event',
    description: ''
  });

  const [events, setEvents] = useState([
    { id: '1', title: 'Annual Sports Day', date: '2024-04-15', type: 'event', description: 'Annual sports competition for all classes' },
    { id: '2', title: 'Summer Vacation', date: '2024-05-20', type: 'holiday', description: 'Summer break starts' },
    { id: '3', title: 'Parent Teacher Meeting', date: '2024-04-05', type: 'event', description: 'Monthly PTM for Class 1-12' },
    { id: '4', title: 'Holi Festival', date: '2024-03-25', type: 'holiday', description: 'School closed for Holi' },
  ]);

  const handleAddEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    setEvents([...events, { ...newEvent, id: Date.now().toString() }]);
    setShowAddEvent(false);
    setNewEvent({ title: '', date: new Date().toISOString().split('T')[0], type: 'event', description: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">Academic Planner</h1>
          <p className="text-text-sub font-medium">Plan your school year, events, and holidays.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <CalendarRange size={18} /> Sync Google Calendar
          </button>
          <button onClick={() => setShowAddEvent(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Calendar className="text-primary" /> School Calendar 2024
            </h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg"><Clock size={20} /></button>
              <button className="p-2 hover:bg-slate-100 rounded-lg"><Search size={20} /></button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 gap-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-[10px] font-black text-text-sub uppercase tracking-widest pb-4">{day}</div>
            ))}
            {Array.from({ length: 31 }).map((_, i) => {
              const day = i + 1;
              const dateStr = `2024-03-${day.toString().padStart(2, '0')}`;
              const dayEvents = events.filter(e => e.date === dateStr);
              return (
                <div key={i} className={`min-h-[100px] p-2 rounded-2xl border-2 transition-all hover:border-primary/20 cursor-pointer ${dayEvents.length > 0 ? 'bg-primary/5 border-primary/10' : 'bg-slate-50 border-transparent'}`}>
                  <p className="text-xs font-black text-text-sub mb-2">{day}</p>
                  <div className="space-y-1">
                    {dayEvents.map(e => (
                      <div key={e.id} className={`text-[8px] font-black p-1 rounded-lg truncate uppercase ${e.type === 'holiday' ? 'bg-red-100 text-red-700' : 'bg-primary text-white'}`}>
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-6">Upcoming Events</h3>
            <div className="space-y-4">
              {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5).map(e => (
                <div key={e.id} className="flex gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all cursor-pointer group">
                  <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${e.type === 'holiday' ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'}`}>
                    <span className="text-[10px] font-black uppercase">{new Date(e.date).toLocaleString('default', { month: 'short' })}</span>
                    <span className="text-lg font-black leading-none">{new Date(e.date).getDate()}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-text-heading group-hover:text-primary transition-colors">{e.title}</h4>
                    <p className="text-[10px] text-text-sub line-clamp-1">{e.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-primary text-white overflow-hidden relative">
            <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/10 rotate-12" />
            <h3 className="text-lg font-bold mb-2 relative z-10">AI Planner</h3>
            <p className="text-xs text-white/80 mb-6 relative z-10">Let AI suggest the best dates for your school events based on academic load.</p>
            <button className="w-full py-3 bg-white text-primary rounded-xl font-black text-xs uppercase shadow-lg relative z-10">Generate Plan</button>
          </Card>
        </div>
      </div>

      <AnimatePresence>
        {showAddEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-text-heading uppercase">Add New Event</h3>
                <button onClick={() => setShowAddEvent(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
              </div>
              <div className="space-y-4">
                <Input label="Event Title" value={newEvent.title} onChange={(e: any) => setNewEvent({ ...newEvent, title: e.target.value })} />
                <Input label="Date" type="date" value={newEvent.date} onChange={(e: any) => setNewEvent({ ...newEvent, date: e.target.value })} />
                <Select label="Event Type" options={['event', 'holiday']} value={newEvent.type} onChange={(e: any) => setNewEvent({ ...newEvent, type: e.target.value })} />
                <div className="space-y-2">
                  <label className="label-text">Description</label>
                  <textarea className="input-field min-h-[100px]" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}></textarea>
                </div>
                <button onClick={handleAddEvent} className="btn-primary w-full py-4 mt-4">Save Event</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
