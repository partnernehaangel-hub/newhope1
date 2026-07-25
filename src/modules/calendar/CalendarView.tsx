import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, X } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { CalendarEvent, User } from '../../types';

interface CalendarViewProps {
  calendarEvents: CalendarEvent[];
  setCalendarEvents: (events: CalendarEvent[]) => void;
  currentUser: User | null;
}

const CalendarView = ({ calendarEvents, setCalendarEvents, currentUser }: CalendarViewProps) => {
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState<Partial<CalendarEvent>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'event',
    icon: '',
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  });

  // Academic year starts in April
  const academicMonths = [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2]; // April (3) to March (2)
  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  const currentYear = new Date().getFullYear();
  const startYear = new Date().getMonth() < 3 ? currentYear - 1 : currentYear;
  const endYear = startYear + 1;

  const handleAddEvent = () => {
    if (!eventForm.title || !eventForm.date) return;
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title: eventForm.title!,
      date: eventForm.date!,
      type: eventForm.type as any,
      icon: eventForm.icon,
      color: eventForm.color || 'bg-blue-50 text-blue-700 border-blue-200'
    };
    setCalendarEvents([...calendarEvents, newEvent]);
    setShowEventModal(false);
    setEventForm({ title: '', date: new Date().toISOString().split('T')[0], type: 'event', icon: '', color: 'bg-blue-50 text-blue-700 border-blue-200' });
  };

  const getEventsForDate = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarEvents.filter((e: CalendarEvent) => e.date === dateStr);
  };

  const isSunday = (year: number, month: number, day: number) => {
    return new Date(year, month, day).getDay() === 0;
  };

  const getDayName = (year: number, month: number, day: number) => {
    const d = new Date(year, month, day);
    if (d.getMonth() !== month) return null;
    return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  const festivalIcons = [
    { name: 'Holi', icon: '🎨' },
    { name: 'Eid', icon: '🌙' },
    { name: 'Christmas', icon: '🎅' },
    { name: 'Navratri', icon: '🕉️' },
    { name: 'Ram Navmi', icon: '🏹' },
    { name: 'Sikh Festival', icon: '☬' },
  ];

  return (
    <div className="space-y-6 max-w-[95vw] mx-auto pb-20">
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Academic Planner {startYear}-{String(endYear).slice(-2)}</h1>
          <p className="text-slate-500 font-bold text-sm">Annual Academic Calendar & Holiday List</p>
        </div>
        <div className="flex gap-3">
          {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
            <button 
              onClick={() => setShowEventModal(true)}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
            >
              <Plus size={20} /> Add Event
            </button>
          )}
          <button className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all">
            <Calendar size={20} /> Sync Google Calendar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed min-w-[1200px]">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="w-16 p-4 border-r border-slate-700 font-black text-xl italic">D/M</th>
                {academicMonths.map(m => (
                  <th key={m} className="p-4 border-r border-slate-700 font-black text-sm tracking-widest uppercase">
                    {monthNames[m]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 31 }).map((_, dayIdx) => {
                const day = dayIdx + 1;
                return (
                  <tr key={day} className="border-b border-slate-100 group">
                    <td className="p-4 bg-slate-50 border-r border-slate-200 text-center font-black text-xl text-slate-400 italic group-hover:text-primary transition-colors">
                      {day}
                    </td>
                    {academicMonths.map(m => {
                      const year = m < 3 ? endYear : startYear;
                      const date = new Date(year, m, day);
                      const isValidDate = date.getMonth() === m && date.getDate() === day;
                      const sunday = isValidDate && isSunday(year, m, day);
                      const dayName = isValidDate ? getDayName(year, m, day) : null;
                      const events = isValidDate ? getEventsForDate(year, m, day) : [];

                      return (
                        <td 
                          key={m} 
                          className={`p-2 border-r border-slate-100 h-24 relative transition-all hover:bg-slate-50/50 ${!isValidDate ? 'bg-slate-50/30' : ''}`}
                        >
                          {isValidDate && (
                            <>
                              <div className="flex justify-between items-start mb-1">
                                <span className={`text-[9px] font-black tracking-tighter ${sunday ? 'text-red-500' : 'text-slate-400'}`}>
                                  {dayName}
                                </span>
                                {sunday && (
                                  <span className="text-[8px] font-black text-red-500/20 rotate-45 absolute top-4 right-2 pointer-events-none uppercase">
                                    Sunday
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1">
                                {events.map(event => (
                                  <div 
                                    key={event.id} 
                                    className={`text-[9px] font-bold p-1.5 rounded-lg border flex flex-col items-center justify-center text-center shadow-sm leading-tight ${event.color}`}
                                  >
                                    {event.icon && <span className="text-lg mb-0.5">{event.icon}</span>}
                                    <span className="uppercase tracking-tighter">{event.title}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
            animate={{ scale: 1, opacity: 1, y: 0 }} 
            className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-slate-100"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Add New Event</h3>
              <button onClick={() => setShowEventModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <div className="space-y-5">
              <Input 
                label="Event Title" 
                placeholder="e.g. Annual Sports Day"
                value={eventForm.title} 
                onChange={(e: any) => setEventForm({...eventForm, title: e.target.value})} 
              />
              <Input 
                label="Date" 
                type="date" 
                value={eventForm.date} 
                onChange={(e: any) => setEventForm({...eventForm, date: e.target.value})} 
              />
              <Select 
                label="Event Type" 
                options={['event', 'holiday', 'examination', 'ptm', 'festival']} 
                value={eventForm.type} 
                onChange={(e: any) => {
                  const type = e.target.value;
                  let color = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (type === 'holiday') color = 'bg-red-50 text-red-700 border-red-200';
                  if (type === 'examination') color = 'bg-purple-50 text-purple-700 border-purple-200';
                  if (type === 'ptm') color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
                  if (type === 'festival') color = 'bg-orange-50 text-orange-700 border-orange-200';
                  setEventForm({...eventForm, type, color});
                }} 
              />
              
              {eventForm.type === 'festival' && (
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Festival Icon</label>
                  <div className="grid grid-cols-6 gap-2">
                    {festivalIcons.map(f => (
                      <button 
                        key={f.name}
                        onClick={() => setEventForm({...eventForm, icon: f.icon})}
                        className={`text-2xl p-3 rounded-2xl border-2 transition-all ${eventForm.icon === f.icon ? 'border-primary bg-primary/5 scale-110' : 'border-slate-50 hover:border-slate-200'}`}
                        title={f.name}
                      >
                        {f.icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-8">
                <button 
                  onClick={() => setShowEventModal(false)} 
                  className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddEvent} 
                  className="flex-1 py-4 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                  Save Event
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
