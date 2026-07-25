import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Download, 
  Calendar, 
  Clock, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Eye,
  FileEdit,
  ClipboardList,
  UserCheck,
  ArrowUpCircle,
  Sparkles,
  ArrowRightLeft,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { FileUpload } from '../../components/common/FileUpload';
import { Student, ClassTimeTable, Syllabus, Homework, ClassAssignment } from '../../types';

interface AcademicsProps {
  students: Student[];
  setStudents: (students: Student[]) => void;
  timeTables: ClassTimeTable[];
  setTimeTables: (timeTables: ClassTimeTable[]) => void;
  syllabuses: Syllabus[];
  setSyllabuses: (syllabuses: Syllabus[]) => void;
  homeworks: Homework[];
  setHomeworks: (homeworks: Homework[]) => void;
  teacherAssignments: ClassAssignment[];
  setTeacherAssignments: (assignments: ClassAssignment[]) => void;
  masterData: any;
  currentUser: any;
  schoolProfile?: any;
}

export const Academics = ({ 
  students, 
  setStudents, 
  timeTables, 
  setTimeTables, 
  syllabuses, 
  setSyllabuses, 
  homeworks, 
  setHomeworks, 
  teacherAssignments, 
  setTeacherAssignments, 
  masterData, 
  currentUser,
  schoolProfile
}: AcademicsProps) => {
  const [activeTab, setActiveTab] = useState<'timetable' | 'assignments' | 'promotion' | 'syllabus' | 'homework' | 'planner'>('timetable');
  
  // Filter data based on user role
  const teacherAssignedClasses = currentUser?.role === 'teacher' 
    ? teacherAssignments.filter((a: any) => 
        a.classTeacher === currentUser.name || 
        a.subjectTeachers.some((st: any) => st.teacher === currentUser.name)
      )
    : [];

  const filteredTimeTables = (currentUser?.role === 'admin')
    ? timeTables 
    : (currentUser?.role === 'teacher')
      ? timeTables.filter((t: any) => 
          teacherAssignedClasses.some((a: any) => a.class === t.class && a.section === t.section)
        )
      : timeTables.filter((t: any) => t.class === currentUser?.class && t.section === currentUser?.section);
    
  const filteredSyllabuses = (currentUser?.role === 'admin')
    ? syllabuses
    : (currentUser?.role === 'teacher')
      ? syllabuses.filter((s: any) => 
          teacherAssignedClasses.some((a: any) => a.class === s.class)
        )
      : syllabuses.filter((s: any) => s.class === currentUser?.class);
    
  const filteredHomeworks = (currentUser?.role === 'admin')
    ? homeworks
    : (currentUser?.role === 'teacher')
      ? homeworks.filter((h: any) => 
          teacherAssignedClasses.some((a: any) => a.class === h.class && a.section === h.section)
        )
      : homeworks.filter((h: any) => h.class === currentUser?.class && h.section === currentUser?.section);

  const filteredAssignments = (currentUser?.role === 'admin')
    ? teacherAssignments
    : (currentUser?.role === 'teacher')
      ? teacherAssignedClasses
      : teacherAssignments.filter((a: any) => a.class === currentUser?.class && a.section === currentUser?.section);
    
  // Time Table Form
  const [ttForm, setTtForm] = useState({
    class: '',
    section: '',
    day: 'Monday',
    startTime: '',
    endTime: '',
    subject: '',
    teacher: ''
  });

  // Assignment Form
  const [assignForm, setAssignForm] = useState({
    class: '',
    section: '',
    classTeacher: '',
    subject: '',
    teacher: '',
    session: schoolProfile?.currentSession || '2024-25'
  });

  useEffect(() => {
    if (schoolProfile?.currentSession) {
      setAssignForm(prev => ({ ...prev, session: schoolProfile.currentSession }));
    }
  }, [schoolProfile?.currentSession]);

  // Syllabus Form
  const [syllabusForm, setSyllabusForm] = useState({
    class: '',
    subject: '',
    title: '',
    description: ''
  });

  // Homework Form
  const [homeworkForm, setHomeworkForm] = useState({
    class: '',
    section: '',
    subject: '',
    title: '',
    description: '',
    dueDate: ''
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [homeworkFile, setHomeworkFile] = useState<File | null>(null);

  const generateAITimeTable = async () => {
    if (!ttForm.class || !ttForm.section) {
      alert('Please select Class and Section first');
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const prompt = `Generate a weekly school time table for Class ${ttForm.class} Section ${ttForm.section}. 
      Available Subjects: ${masterData.subjects.join(', ')}. 
      Available Teachers: ${masterData.teachers.join(', ')}. 
      Format: JSON array of objects with fields: day (Monday-Friday), startTime, endTime, subject, teacher. 
      Ensure no teacher is double booked. Return ONLY the JSON array.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const result = JSON.parse(response.text);
      const newEntries = result.map((entry: any) => ({
        ...entry,
        id: Math.random().toString(36).substr(2, 9),
        class: ttForm.class,
        section: ttForm.section
      }));
      
      setTimeTables([...timeTables, ...newEntries]);
      alert('AI Time Table generated successfully!');
    } catch (error) {
      console.error('AI Generation error:', error);
      alert('Failed to generate AI Time Table');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddTimeTable = () => {
    if (!ttForm.class || !ttForm.section || !ttForm.subject) return;
    
    const existing = timeTables.find((t: any) => t.class === ttForm.class && t.section === ttForm.section);
    if (existing) {
      const updated = timeTables.map((t: any) => {
        if (t.class === ttForm.class && t.section === ttForm.section) {
          return { ...t, entries: [...t.entries, { day: ttForm.day, startTime: ttForm.startTime, endTime: ttForm.endTime, subject: ttForm.subject, teacher: ttForm.teacher }] };
        }
        return t;
      });
      setTimeTables(updated);
    } else {
      setTimeTables([...timeTables, {
        id: Date.now().toString(),
        class: ttForm.class,
        section: ttForm.section,
        entries: [{ day: ttForm.day, startTime: ttForm.startTime, endTime: ttForm.endTime, subject: ttForm.subject, teacher: ttForm.teacher }]
      }]);
    }
    alert('Time table entry added!');
  };

  const handleAssignTeacher = () => {
    if (!assignForm.class || !assignForm.section) return;
    
    const existing = teacherAssignments.find((a: any) => a.class === assignForm.class && a.section === assignForm.section && a.session === assignForm.session);
    if (existing) {
      const updated = teacherAssignments.map((a: any) => {
        if (a.class === assignForm.class && a.section === assignForm.section && a.session === assignForm.session) {
          const newSubjectTeachers = [...a.subjectTeachers];
          if (assignForm.subject && assignForm.teacher) {
            // Check if subject already assigned
            const subIdx = newSubjectTeachers.findIndex(st => st.subject === assignForm.subject);
            if (subIdx > -1) {
              newSubjectTeachers[subIdx].teacher = assignForm.teacher;
            } else {
              newSubjectTeachers.push({ subject: assignForm.subject, teacher: assignForm.teacher });
            }
          }
          return { ...a, classTeacher: assignForm.classTeacher || a.classTeacher, subjectTeachers: newSubjectTeachers };
        }
        return a;
      });
      setTeacherAssignments(updated);
    } else {
      setTeacherAssignments([...teacherAssignments, {
        id: Date.now().toString(),
        class: assignForm.class,
        section: assignForm.section,
        classTeacher: assignForm.classTeacher,
        session: assignForm.session,
        subjectTeachers: assignForm.subject && assignForm.teacher ? [{ subject: assignForm.subject, teacher: assignForm.teacher }] : []
      }]);
    }
    alert('Teacher assigned!');
  };

  const handleAddSyllabus = () => {
    if (!syllabusForm.class || !syllabusForm.subject || !syllabusForm.title) return;
    setSyllabuses([...syllabuses, {
      ...syllabusForm,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(),
      status: 'Not Started'
    }]);
    alert('Syllabus added!');
  };

  const handleAddHomework = () => {
    if (!homeworkForm.class || !homeworkForm.section || !homeworkForm.subject) return;
    setHomeworks([...homeworks, {
      ...homeworkForm,
      id: Date.now().toString(),
      teacherName: currentUser?.role === 'teacher' ? currentUser.name : 'Admin',
      date: new Date().toLocaleDateString(),
      submissions: [],
      file: homeworkFile ? URL.createObjectURL(homeworkFile) : undefined
    }]);
    setHomeworkForm({ class: '', section: '', subject: '', title: '', description: '', dueDate: '' });
    setHomeworkFile(null);
    alert('Homework uploaded!');
  };

  const handleStudentSubmit = (homeworkId: string, file: File) => {
    const updatedHomeworks = homeworks.map((h: any) => {
      if (h.id === homeworkId) {
        return {
          ...h,
          submissions: [
            ...(h.submissions || []),
            {
              studentId: currentUser.id,
              studentName: currentUser.name,
              file: URL.createObjectURL(file),
              date: new Date().toLocaleString()
            }
          ]
        };
      }
      return h;
    });
    setHomeworks(updatedHomeworks);
    alert('Homework submitted successfully!');
  };

  const [promotionFrom, setPromotionFrom] = useState('');
  const [promotionTo, setPromotionTo] = useState('');
  const [promotionToSession, setPromotionToSession] = useState('2025-26');
  const [promotionDecisions, setPromotionDecisions] = useState<Record<string, 'promote' | 'detain'>>({});

  const handlePromoteStudents = (fromClass: string, toClass: string, toSession: string) => {
    if (!fromClass || !toClass || !toSession) {
      alert('Please select current class, next class, and next session');
      return;
    }
    const studentsInClass = students.filter((s: any) => s.class === fromClass);
    if (studentsInClass.length === 0) {
      alert(`No students found in ${fromClass}`);
      return;
    }

    const updated = students.map((s: any) => {
      if (s.class === fromClass) {
        const decision = promotionDecisions[s.id] || 'promote';
        if (decision === 'promote') {
          return { ...s, class: toClass, session: toSession, studentType: 'Old' };
        }
      }
      return s;
    });

    setStudents(updated);
    const promotedCount = studentsInClass.filter(s => (promotionDecisions[s.id] || 'promote') === 'promote').length;
    const detainedCount = studentsInClass.length - promotedCount;
    
    alert(`Promotion completed! ${promotedCount} students promoted to ${toClass} (${toSession}), ${detainedCount} students detained in ${fromClass}.`);
    
    setPromotionFrom('');
    setPromotionTo('');
    setPromotionDecisions({});
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Academics Module 🎓</h1>
          <p className="text-text-secondary">Manage time tables, teacher assignments, syllabus, and student promotions.</p>
        </div>
      </div>

      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'timetable', label: 'Time Table', icon: Clock },
          { id: 'assignments', label: 'Teacher Assignments', icon: UserCheck },
          { id: 'promotion', label: 'Promotion', icon: ArrowUpCircle, adminOnly: true },
          { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
          { 
            id: 'homework', 
            label: 'Homework', 
            icon: () => (
              <img 
                src="https://storage.googleapis.com/cortex-dev-cortex-build-public-assets/ais-dev-qwpf4dfgd7b2nhd2genpku-212916940376/nehatripathifreelance%40gmail.com/1742561480073-image-2.png" 
                alt="HW" 
                className="w-5 h-5 object-contain"
                referrerPolicy="no-referrer"
              />
            ) 
          },
          { id: 'planner', label: 'Academic Planner', icon: Calendar }
        ].filter(tab => !tab.adminOnly || currentUser?.role === 'admin').map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-text-sub hover:bg-white/50'
            }`}
          >
            {(() => {
              const TabIcon = tab.icon as React.ElementType;
              return typeof tab.icon === 'function' ? <TabIcon /> : <TabIcon size={18} />;
            })()}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'timetable' && (
          <motion.div key="timetable" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                <Card className="lg:col-span-1">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                    <Plus size={20} /> Add Time Table Entry
                  </h3>
                  <div className="space-y-4">
                    <Select label="Class" options={masterData.classes} value={ttForm.class} onChange={(e: any) => setTtForm({...ttForm, class: e.target.value})} />
                    <Select label="Section" options={masterData.sections} value={ttForm.section} onChange={(e: any) => setTtForm({...ttForm, section: e.target.value})} />
                    <Select label="Day" options={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']} value={ttForm.day} onChange={(e: any) => setTtForm({...ttForm, day: e.target.value})} />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="Start Time" type="time" value={ttForm.startTime} onChange={(e: any) => setTtForm({...ttForm, startTime: e.target.value})} />
                      <Input label="End Time" type="time" value={ttForm.endTime} onChange={(e: any) => setTtForm({...ttForm, endTime: e.target.value})} />
                    </div>
                    <Select label="Subject" options={masterData.subjects} value={ttForm.subject} onChange={(e: any) => setTtForm({...ttForm, subject: e.target.value})} />
                    <Input label="Teacher Name" value={ttForm.teacher} onChange={(e: any) => setTtForm({...ttForm, teacher: e.target.value})} />
                    <button onClick={handleAddTimeTable} className="btn-primary w-full py-3 mt-4">Add Entry</button>
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                      <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or use AI</span></div>
                    </div>
                    <button 
                      onClick={generateAITimeTable} 
                      disabled={isGeneratingAI}
                      className="w-full py-3 rounded-xl font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 border border-indigo-100"
                    >
                      {isGeneratingAI ? <Clock className="animate-spin" size={18} /> : <Sparkles size={18} />}
                      {isGeneratingAI ? 'Generating...' : 'AI Generate Time Table'}
                    </button>
                  </div>
                </Card>
              )}

              <Card className={(currentUser?.role === 'admin' || currentUser?.role === 'teacher') ? "lg:col-span-2" : "lg:col-span-3"}>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                  <Clock size={20} /> {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') ? 'Class Time Tables' : 'My Time Table'}
                </h3>
                <div className="space-y-6">
                  {filteredTimeTables.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-text-sub">No time tables set yet.</p>
                    </div>
                  ) : (
                    filteredTimeTables.map((tt: any) => (
                      <div key={tt.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-bold text-lg">{tt.class} - Section {tt.section}</h4>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-slate-200">
                                <th className="pb-3">Day</th>
                                <th className="pb-3">Time</th>
                                <th className="pb-3">Subject</th>
                                <th className="pb-3">Teacher</th>
                              </tr>
                            </thead>
                            <tbody className="text-sm">
                              {tt.entries.map((entry: any, idx: number) => (
                                <tr key={idx} className="border-b border-slate-100 last:border-0">
                                  <td className="py-3 font-medium">{entry.day}</td>
                                  <td className="py-3">{entry.startTime} - {entry.endTime}</td>
                                  <td className="py-3">{entry.subject}</td>
                                  <td className="py-3">{entry.teacher}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'assignments' && (
          <motion.div key="assignments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {currentUser?.role === 'admin' && (
                <Card className="lg:col-span-1">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                    <UserCheck size={20} /> Assign Teacher
                  </h3>
                  <div className="space-y-4">
                    <Select label="Session" options={masterData.sessions} value={assignForm.session} onChange={(e: any) => setAssignForm({...assignForm, session: e.target.value})} />
                    <Select label="Class" options={masterData.classes} value={assignForm.class} onChange={(e: any) => setAssignForm({...assignForm, class: e.target.value})} />
                    <Select label="Section" options={masterData.sections} value={assignForm.section} onChange={(e: any) => setAssignForm({...assignForm, section: e.target.value})} />
                    <Input label="Class Teacher Name" value={assignForm.classTeacher} onChange={(e: any) => setAssignForm({...assignForm, classTeacher: e.target.value})} />
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                      <p className="text-xs font-bold text-text-sub uppercase">Subject Teacher Assignment</p>
                      <Select label="Subject" options={masterData.subjects} value={assignForm.subject} onChange={(e: any) => setAssignForm({...assignForm, subject: e.target.value})} />
                      <Select label="Teacher" options={masterData.teachers} value={assignForm.teacher} onChange={(e: any) => setAssignForm({...assignForm, teacher: e.target.value})} />
                    </div>
                    <button onClick={handleAssignTeacher} className="btn-primary w-full py-3 mt-4">Assign</button>
                  </div>
                </Card>
              )}

              <Card className={(currentUser?.role === 'admin' || currentUser?.role === 'teacher') ? "lg:col-span-2" : "lg:col-span-3"}>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                  <ClipboardList size={20} /> {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') ? 'Class Assignments' : 'My Teachers'}
                </h3>
                <div className="space-y-6">
                  {filteredAssignments.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-text-sub">No teachers assigned yet.</p>
                    </div>
                  ) : (
                    filteredAssignments.map((ca: any) => (
                      <div key={ca.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 transition-all group">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-lg">{ca.class} - Section {ca.section}</h4>
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{ca.session}</span>
                            </div>
                            <span className="text-sm text-text-sub font-bold">Class Teacher: {ca.classTeacher}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {ca.subjectTeachers.map((st: any, idx: number) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                              <span className="text-sm font-bold">{st.subject}</span>
                              <span className="text-sm text-text-sub">{st.teacher}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'promotion' && (
          <motion.div key="promotion" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Card>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                <ArrowUpCircle size={20} /> Promote / Detain Students
              </h3>
              <p className="text-text-sub mb-8">Select the current class and the class to promote students to. You can individually decide to promote or detain each student.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end mb-12">
                <Select 
                  label="Current Class" 
                  options={masterData.classes} 
                  value={promotionFrom}
                  onChange={(e: any) => {
                    const from = e.target.value;
                    setPromotionFrom(from);
                    // Reset decisions when class changes
                    setPromotionDecisions({});
                    // Suggest next class
                    const nextIdx = masterData.classes.indexOf(from) + 1;
                    if (nextIdx < masterData.classes.length) {
                      setPromotionTo(masterData.classes[nextIdx]);
                    } else {
                      setPromotionTo('');
                    }
                  }}
                />
                <Select 
                  label="Next Class" 
                  options={masterData.classes} 
                  value={promotionTo}
                  onChange={(e: any) => setPromotionTo(e.target.value)}
                />
                <Select 
                  label="Next Session" 
                  options={masterData.sessions} 
                  value={promotionToSession}
                  onChange={(e: any) => setPromotionToSession(e.target.value)}
                />
                <button 
                  onClick={() => handlePromoteStudents(promotionFrom, promotionTo, promotionToSession)}
                  className="btn-primary py-3"
                >
                  Execute Promotion
                </button>
              </div>

              {promotionFrom && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-700">Student List - {promotionFrom}</h4>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const decisions: any = {};
                          students.filter((s: any) => s.class === promotionFrom).forEach((s: any) => {
                            decisions[s.id] = 'promote';
                          });
                          setPromotionDecisions(decisions);
                        }}
                        className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
                      >
                        Promote All
                      </button>
                      <button 
                        onClick={() => {
                          const decisions: any = {};
                          students.filter((s: any) => s.class === promotionFrom).forEach((s: any) => {
                            decisions[s.id] = 'detain';
                          });
                          setPromotionDecisions(decisions);
                        }}
                        className="text-xs px-3 py-1 bg-amber-50 text-amber-600 rounded-full hover:bg-amber-100"
                      >
                        Detain All
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-6 py-4 font-semibold">Student</th>
                          <th className="px-6 py-4 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {students.filter((s: any) => s.class === promotionFrom).map((s: any) => (
                          <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                  {s.name[0]}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{s.name} {s.surname}</div>
                                  <div className="text-xs text-slate-500">{s.studentId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => setPromotionDecisions(prev => ({ ...prev, [s.id]: 'promote' }))}
                                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                    (promotionDecisions[s.id] || 'promote') === 'promote' 
                                      ? 'bg-green-100 text-green-700 border border-green-200' 
                                      : 'bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-200'
                                  }`}
                                >
                                  Promote
                                </button>
                                <button 
                                  onClick={() => setPromotionDecisions(prev => ({ ...prev, [s.id]: 'detain' }))}
                                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                    promotionDecisions[s.id] === 'detain' 
                                      ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                                      : 'bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-200'
                                  }`}
                                >
                                  Detain
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                    <AlertCircle className="text-amber-500 shrink-0" size={24} />
                    <div>
                      <h4 className="font-bold text-amber-900">Important Note</h4>
                      <p className="text-sm text-amber-800">Student promotion is a bulk action. This will update the class and session for all students marked as "Promote". Students marked as "Detain" will remain in their current class and session.</p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'syllabus' && (
          <motion.div key="syllabus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                <Card className="lg:col-span-1">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                    <Plus size={20} /> Prepare Syllabus
                  </h3>
                  <div className="space-y-4">
                    <Select label="Class" options={masterData.classes} value={syllabusForm.class} onChange={(e: any) => setSyllabusForm({...syllabusForm, class: e.target.value})} />
                    <Select label="Subject" options={masterData.subjects} value={syllabusForm.subject} onChange={(e: any) => setSyllabusForm({...syllabusForm, subject: e.target.value})} />
                    <Input label="Syllabus Title" value={syllabusForm.title} onChange={(e: any) => setSyllabusForm({...syllabusForm, title: e.target.value})} />
                    <div className="space-y-2">
                      <label className="label-text">Description / Topics</label>
                      <textarea 
                        className="input-field min-h-[150px]" 
                        value={syllabusForm.description}
                        onChange={(e: any) => setSyllabusForm({...syllabusForm, description: e.target.value})}
                      ></textarea>
                    </div>
                    <FileUpload label="Upload Syllabus PDF (Optional)" />
                    <button onClick={handleAddSyllabus} className="btn-primary w-full py-3 mt-4">Save Syllabus</button>
                  </div>
                </Card>
              )}

              <Card className={(currentUser?.role === 'admin' || currentUser?.role === 'teacher') ? "lg:col-span-2" : "lg:col-span-3"}>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                  <BookOpen size={20} /> {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') ? 'Published Syllabus' : 'My Syllabus'}
                </h3>
                <div className="space-y-6">
                  {filteredSyllabuses.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-text-sub">No syllabus prepared yet.</p>
                    </div>
                  ) : (
                    filteredSyllabuses.map((s: any) => (
                      <div key={s.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-lg">{s.title}</h4>
                            <p className="text-sm text-text-sub">{s.class} | {s.subject}</p>
                          </div>
                          <span className="text-xs text-text-sub">{s.date}</span>
                        </div>
                        <p className="text-sm text-text-secondary whitespace-pre-wrap">{s.description}</p>
                        <button className="mt-4 flex items-center gap-2 text-primary text-sm font-bold hover:underline">
                          <Download size={16} /> Download PDF
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'homework' && (
          <motion.div key="homework" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && (
                <Card className="lg:col-span-1">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                    <Upload size={20} /> Upload Homework
                  </h3>
                  <div className="space-y-4">
                    <Select label="Class" options={masterData.classes} value={homeworkForm.class} onChange={(e: any) => setHomeworkForm({...homeworkForm, class: e.target.value})} />
                    <Select label="Section" options={masterData.sections} value={homeworkForm.section} onChange={(e: any) => setHomeworkForm({...homeworkForm, section: e.target.value})} />
                    <Select label="Subject" options={masterData.subjects} value={homeworkForm.subject} onChange={(e: any) => setHomeworkForm({...homeworkForm, subject: e.target.value})} />
                    <Input label="Homework Title" value={homeworkForm.title} onChange={(e: any) => setHomeworkForm({...homeworkForm, title: e.target.value})} />
                    <div className="space-y-2">
                      <label className="label-text">Instructions</label>
                      <textarea 
                        className="input-field min-h-[150px]" 
                        value={homeworkForm.description}
                        onChange={(e: any) => setHomeworkForm({...homeworkForm, description: e.target.value})}
                      ></textarea>
                    </div>
                    <Input label="Due Date" type="date" value={homeworkForm.dueDate} onChange={(e: any) => setHomeworkForm({...homeworkForm, dueDate: e.target.value})} />
                    <div className="space-y-2">
                      <label className="label-text">Homework PDF (Optional)</label>
                      <input 
                        type="file" 
                        accept=".pdf"
                        onChange={(e) => setHomeworkFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                      />
                    </div>
                    <button onClick={handleAddHomework} className="btn-primary w-full py-3 mt-4">Upload Homework</button>
                  </div>
                </Card>
              )}

              <Card className={(currentUser?.role === 'admin' || currentUser?.role === 'teacher') ? "lg:col-span-2" : "lg:col-span-3"}>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                  <FileEdit size={20} /> {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') ? 'Homework List' : 'My Homework'}
                </h3>
                <div className="space-y-6">
                  {filteredHomeworks.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-text-sub">No homework uploaded yet.</p>
                    </div>
                  ) : (
                    filteredHomeworks.map((h: any) => (
                      <div key={h.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-bold text-lg">{h.title}</h4>
                            <p className="text-sm text-text-sub">{h.class} - {h.section} | {h.subject}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-red-500 block">Due: {h.dueDate}</span>
                            <span className="text-[10px] text-text-sub">By {h.teacherName}</span>
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary whitespace-pre-wrap">{h.description}</p>
                        
                        {h.file && (
                          <a href={h.file} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-primary text-sm font-bold hover:underline">
                            <FileDown size={16} /> Download Assignment PDF
                          </a>
                        )}

                        {/* Student Submission Section */}
                        {currentUser?.role === 'student' && (
                          <div className="mt-6 pt-6 border-t border-slate-100">
                            <h5 className="text-sm font-bold mb-3 flex items-center gap-2">
                              <Upload size={16} /> Submit Your Work
                            </h5>
                            <div className="flex items-center gap-4">
                              <input 
                                type="file" 
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleStudentSubmit(h.id, file);
                                }}
                                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                              />
                            </div>
                          </div>
                        )}

                        {/* Admin/Teacher View Submissions */}
                        {(currentUser?.role === 'admin' || currentUser?.role === 'teacher') && h.submissions?.length > 0 && (
                          <div className="mt-6 pt-6 border-t border-slate-100">
                            <h5 className="text-sm font-bold mb-3 flex items-center gap-2">
                              <ClipboardList size={16} /> Submissions ({h.submissions.length})
                            </h5>
                            <div className="space-y-2">
                              {h.submissions.map((sub: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100">
                                  <div>
                                    <p className="text-sm font-bold">{sub.studentName}</p>
                                    <p className="text-[10px] text-text-sub">{sub.date}</p>
                                  </div>
                                  <a href={sub.file} target="_blank" rel="noreferrer" className="text-primary hover:text-primary-dark">
                                    <Eye size={18} />
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {activeTab === 'planner' && (
          <motion.div key="planner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <AcademicPlanner currentUser={currentUser} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const AcademicPlanner = ({ currentUser }: any) => {
  const [holidays, setHolidays] = useState<any[]>([
    { date: '2026-01-26', title: 'Republic Day', type: 'National', icon: '🇮🇳' },
    { date: '2026-08-15', title: 'Independence Day', type: 'National', icon: '🇮🇳' },
    { date: '2026-10-02', title: 'Gandhi Jayanti', type: 'National', icon: '👓' },
    { date: '2026-12-25', title: 'Christmas', type: 'Festival', icon: '🎄' },
    { date: '2026-03-04', title: 'Holi', type: 'Festival', icon: '🎨' },
    { date: '2026-11-08', title: 'Diwali', type: 'Festival', icon: '🪔' },
    { date: '2026-03-20', title: 'Eid al-Fitr', type: 'Festival', icon: '🌙' },
  ]);

  const months = [
    { name: 'APRIL', days: 30, year: 2026, monthIdx: 3 },
    { name: 'MAY', days: 31, year: 2026, monthIdx: 4 },
    { name: 'JUNE', days: 30, year: 2026, monthIdx: 5 },
    { name: 'JULY', days: 31, year: 2026, monthIdx: 6 },
    { name: 'AUGUST', days: 31, year: 2026, monthIdx: 7 },
    { name: 'SEPTEMBER', days: 30, year: 2026, monthIdx: 8 },
    { name: 'OCTOBER', days: 31, year: 2026, monthIdx: 9 },
    { name: 'NOVEMBER', days: 30, year: 2026, monthIdx: 10 },
    { name: 'DECEMBER', days: 31, year: 2026, monthIdx: 11 },
    { name: 'JANUARY', days: 31, year: 2027, monthIdx: 0 },
    { name: 'FEBRUARY', days: 28, year: 2027, monthIdx: 1 },
    { name: 'MARCH', days: 31, year: 2027, monthIdx: 2 },
  ];

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const getHoliday = (day: number, month: any) => {
    const dateStr = `${month.year}-${String(month.monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays.find(h => h.date === dateStr);
  };

  const isSunday = (day: number, month: any) => {
    const date = new Date(month.year, month.monthIdx, day);
    return date.getDay() === 0;
  };

  const getDayName = (day: number, month: any) => {
    const date = new Date(month.year, month.monthIdx, day);
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  };

  const handleGoogleCalendarSync = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      
      const authWindow = window.open(url, 'google_oauth', 'width=600,height=700');
      if (!authWindow) {
        alert('Please allow popups to sync with Google Calendar');
      }
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to initiate Google Calendar sync');
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        alert('Successfully synced with Google Calendar!');
        // In a real app, we would fetch the events here
        setHolidays(prev => [
          ...prev,
          { date: '2026-09-13', title: 'Grandparents Day', type: 'Other', icon: '👴' },
          { date: '2026-08-28', title: 'Raksha Bandhan', type: 'Festival', icon: '🪢' },
        ]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <Card className="overflow-hidden p-0 border-none shadow-2xl bg-slate-900">
      <div className="p-6 flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">Academic Planner 2026-27</h2>
          <p className="text-slate-400 text-sm font-medium">Annual Academic Calendar & Holiday List</p>
        </div>
        {currentUser?.role === 'admin' && (
          <button 
            onClick={handleGoogleCalendarSync}
            className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-slate-100 transition-all shadow-lg"
          >
            <Calendar size={18} />
            Sync Google Calendar
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header Row */}
          <div className="grid grid-cols-[80px_repeat(12,1fr)] bg-slate-800 border-b border-slate-700">
            <div className="p-4 flex flex-col items-center justify-center border-r border-slate-700">
              <span className="text-white font-black text-xl italic leading-none">D/</span>
              <span className="text-white font-black text-xl italic leading-none">M</span>
            </div>
            {months.map((m, idx) => (
              <div key={idx} className="p-4 text-center border-r border-slate-700 last:border-0 bg-gradient-to-b from-indigo-600/20 to-transparent">
                <span className="text-indigo-400 font-black text-sm tracking-widest">{m.name}</span>
              </div>
            ))}
          </div>

          {/* Days Rows */}
          {days.map((day) => (
            <div key={day} className="grid grid-cols-[80px_repeat(12,1fr)] border-b border-slate-800 last:border-0">
              <div className="p-4 flex items-center justify-center bg-slate-800/50 border-r border-slate-700">
                <span className="text-white font-black text-2xl italic">{day}</span>
              </div>
              {months.map((m, idx) => {
                const holiday = getHoliday(day, m);
                const sunday = isSunday(day, m);
                const dayName = getDayName(day, m);
                const isInvalidDate = day > m.days;

                return (
                  <div 
                    key={idx} 
                    className={`p-2 min-h-[100px] border-r border-slate-800 last:border-0 transition-all relative group
                      ${isInvalidDate ? 'bg-slate-900/50' : 'bg-slate-900 hover:bg-slate-800/50'}
                      ${holiday ? 'ring-1 ring-inset ring-indigo-500/50' : ''}
                    `}
                  >
                    {!isInvalidDate && (
                      <>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold tracking-tighter ${sunday ? 'text-rose-500' : 'text-slate-600'}`}>
                            {dayName}
                          </span>
                          {currentUser?.role === 'admin' && !holiday && (
                            <button className="opacity-0 group-hover:opacity-100 text-indigo-500 hover:text-indigo-400 transition-opacity">
                              <Plus size={12} />
                            </button>
                          )}
                        </div>
                        
                        {holiday && (
                          <div className="flex flex-col items-center justify-center h-full pb-4">
                            <span className="text-3xl mb-1 drop-shadow-lg">{holiday.icon}</span>
                            <span className={`text-[9px] font-black text-center leading-tight uppercase px-1 py-0.5 rounded
                              ${holiday.type === 'National' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}
                            `}>
                              {holiday.title}
                            </span>
                          </div>
                        )}

                        {sunday && !holiday && (
                          <div className="flex items-center justify-center h-full pb-4">
                            <span className="text-rose-900/30 font-black text-xs tracking-widest uppercase rotate-45">Sunday</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
