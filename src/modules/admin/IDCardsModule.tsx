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
  UserCircle,
  QrCode,
  Layout,
  Grid,
  Maximize2,
  Settings,
  Shield,
  Eye,
  EyeOff,
  RefreshCw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Circle,
  Play,
  Square,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Student } from '../../types';

const formatDateDMY = (dateStr: any): string => {
  if (!dateStr) return 'N/A';
  const str = String(dateStr).trim();
  if (!str || str === 'N/A' || str === '--') return 'N/A';
  
  const partsDash = str.split('-');
  if (partsDash.length === 3) {
    if (partsDash[0].length === 4) {
      return `${partsDash[2]}/${partsDash[1]}/${partsDash[0]}`;
    } else if (partsDash[2].length === 4) {
      return `${partsDash[0]}/${partsDash[1]}/${partsDash[2]}`;
    }
  }

  const partsSlash = str.split('/');
  if (partsSlash.length === 3) {
    if (partsSlash[0].length === 4) {
      return `${partsSlash[2]}/${partsSlash[1]}/${partsSlash[0]}`;
    }
    return str;
  }

  try {
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch (e) {}

  return str;
};

interface IDCardsModuleProps {
  students: Student[];
}

export const IDCardsModule = ({ students }: IDCardsModuleProps) => {
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(s => 
    (!selectedClass || s.class === selectedClass) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.includes(searchTerm))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">ID Card Generator</h1>
          <p className="text-text-sub font-medium">Generate and print professional ID cards for students and staff.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2"><Printer size={18} /> Bulk Print</button>
          <button className="btn-primary flex items-center gap-2"><Download size={18} /> Export PDFs</button>
        </div>
      </div>

      <Card className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            label="Filter by Class" 
            options={['LKG', 'UKG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']} 
            value={selectedClass} 
            onChange={(e: any) => setSelectedClass(e.target.value)} 
          />
          <Input label="Search Student" placeholder="Name or ID..." value={searchTerm} onChange={(e: any) => setSearchTerm(e.target.value)} />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredStudents.map((s) => (
          <Card key={s.id} className="p-0 overflow-hidden group border-2 border-red-600 rounded-[20px] w-full max-w-[350px] mx-auto shadow-2xl">
            {/* Header */}
            <div className="bg-[#e0f2fe] p-4 text-center border-b border-blue-200 relative">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                  <GraduationCap size={32} />
                </div>
                <div className="text-center w-full">
                  <h3 className="text-3xl font-black text-blue-800 leading-none mb-1 tracking-tight">C.S.H.P. PUBLIC SCHOOL</h3>
                  <p className="text-sm font-bold text-blue-600 uppercase tracking-widest leading-tight">GHAZIABAD</p>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-600 mt-1">Ph. 0120-2843032, 9667212410</p>
              <div className="mt-2 bg-blue-900 text-white py-1 px-4 rounded-full inline-block">
                <p className="text-[10px] font-black uppercase tracking-widest">Session - 2024 - 2025</p>
              </div>
              {/* Wavy background decoration */}
              <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-t from-white/50 to-transparent"></div>
            </div>

            <div className="p-6 bg-white relative">
              {/* QR and Photo Section */}
              <div className="flex justify-between items-start mb-6">
                <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                  <QrCode size={80} className="text-slate-800" />
                </div>
                <div className="w-32 h-40 border-2 border-blue-600 rounded-lg overflow-hidden bg-slate-100 shadow-md">
                  {s.photo ? (
                    <img src={s.photo} alt={s.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-200">
                      <UserCircle size={64} />
                    </div>
                  )}
                </div>
              </div>

              {/* Student Name */}
              <div className="text-center mb-6">
                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight border-b-2 border-blue-600 pb-1 inline-block">
                  {s.name} {s.surname}
                </h4>
              </div>

              {/* Details Grid */}
              <div className="space-y-3 text-[10px] font-bold text-slate-700">
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider">F. NAME :</span>
                  <span className="col-span-8 uppercase">{s.fatherName}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider">M. NAME :</span>
                  <span className="col-span-8 uppercase">{s.motherName}</span>
                </div>
                <div className="grid grid-cols-12 gap-1">
                  <span className="col-span-4 text-slate-500 uppercase tracking-wider">PHONE :</span>
                  <span className="col-span-8">{s.fatherMobile || s.mobile}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Class</p>
                    <p className="uppercase">{s.class}-{s.section}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">Student ID</p>
                    <p>{s.studentId}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-slate-500 uppercase tracking-widest mb-0.5">D.O.B.</p>
                    <p>{formatDateDMY(s.dob)}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Address</p>
                  <p className="uppercase leading-tight text-sm text-slate-700 line-clamp-2">{s.address}</p>
                </div>
              </div>
            </div>

            {/* Footer Logos */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-4 bg-slate-200 rounded"></div>
                <span className="text-[6px] font-bold text-slate-400 uppercase">Digital Partner</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                </div>
                <span className="text-[6px] font-bold text-slate-400 uppercase">ISO Certified</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-4 bg-slate-200 rounded"></div>
                <span className="text-[6px] font-bold text-slate-400 uppercase">Knowledge Partner</span>
              </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-blue-600/90 backdrop-blur-sm flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button className="flex-1 py-2 bg-white text-blue-600 rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                <Printer size={14} /> Print
              </button>
              <button className="flex-1 py-2 bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2">
                <Download size={14} /> Download
              </button>
            </div>
          </Card>
        ))}
        {filteredStudents.length === 0 && (
          <div className="lg:col-span-3 py-20 text-center text-text-sub font-medium italic">No students found matching your criteria.</div>
        )}
      </div>
    </div>
  );
};
