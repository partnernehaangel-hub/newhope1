import React, { useState, useEffect } from 'react';
import { 
  Search, 
  QrCode, 
  CheckCircle2, 
  History, 
  Calendar as CalendarIcon, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Share2, 
  Camera, 
  Scan, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertCircle,
  X,
  Users,
  GraduationCap,
  Building,
  Home as HomeIcon,
  ShieldAlert,
  Save,
  CheckCircle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Student, Attendance as AttendanceType, HostelAttendance, Staff } from '../../types';

interface AttendanceProps {
  students: Student[];
  attendance: AttendanceType[];
  setAttendance: (attendance: AttendanceType[]) => void;
  masterData: {
    classes: string[];
    sections: string[];
    sessions: string[];
    [key: string]: any;
  };
  currentUser: any;
  supabase: any;
  teacherAssignments?: any[];
  setSelectedStudentQR?: (id: string | null) => void;
  staffAttendance: any[];
  setStaffAttendance: (records: any[]) => void;
  staff: any[];
  hostelAttendance: any[];
  setHostelAttendance: (records: any[]) => void;
  schoolProfile?: any;
}

export const Attendance = ({ 
  students, 
  attendance, 
  setAttendance, 
  masterData, 
  currentUser,
  supabase,
  teacherAssignments,
  setSelectedStudentQR,
  staffAttendance,
  setStaffAttendance,
  staff,
  hostelAttendance,
  setHostelAttendance,
  schoolProfile
}: AttendanceProps) => {

  const [activeTab, setActiveTab] = useState<'student' | 'staff' | 'hostel'>('student');
  const [subView, setSubView] = useState<'scan' | 'manual' | 'history'>('manual');
  
  // Filters
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSession, setSelectedSession] = useState(masterData.sessions?.[2] || '2025-26');
  const [selectedRole, setSelectedRole] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Loading/Save markers
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (showScanner) {
      scanner = new Html5QrcodeScanner('reader', { fps: 15, qrbox: 250 }, false);
      scanner.render(onScanSuccess, onScanError);
    }
    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error('Failed to clear scanner', error));
      }
    };
  }, [showScanner, activeTab]);

  const getIPAndLocation = async () => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        return { 
          ip: data.ip || '127.0.0.1', 
          location: `${data.city || 'Local'}, ${data.country_name || 'India'}` 
        };
      }
    } catch (e) {
      // fallback
    }
    return { ip: '127.0.0.1', location: 'Local Network, India' };
  };

  const onScanSuccess = async (decodedText: string) => {
    const rawId = decodedText.trim();
    if (activeTab === 'student') {
      const student = students.find(s => s.studentId === rawId);
      if (student) {
        setScanResult(`Scanning: ${student.name}`);
        setScanError(null);
        await handleMarkStudent(student, 'Present', 'QR Scan');
        setShowScanner(false);
      } else {
        setScanError('ID Code not matched for standard Student database.');
      }
    } else if (activeTab === 'staff') {
      const staffMember = staff.find(s => s.staffId === rawId || s.id === rawId);
      if (staffMember) {
        setScanResult(`Scanning: ${staffMember.name}`);
        setScanError(null);
        await handleMarkStaff(staffMember, 'Present', 'QR Scan');
        setShowScanner(false);
      } else {
        setScanError('ID Code not matched for our Staff register.');
      }
    } else if (activeTab === 'hostel') {
      const student = students.find(s => s.studentId === rawId);
      if (student) {
        setScanResult(`Scanning Hostel Resident: ${student.name}`);
        setScanError(null);
        await handleMarkHostel(student, 'Present');
        setShowScanner(false);
      } else {
        setScanError('Student ID not matched for Hostel residents.');
      }
    }
  };

  const onScanError = (err: any) => {
    // Suppress console spam from scan ticks
  };

  // --- Student Attendance Commands ---
  const handleMarkStudent = async (student: Student, status: 'Present' | 'Absent' | 'Late' | 'Leave', method = 'Manual') => {
    const exists = attendance.find(a => 
      a.studentId === student.studentId && 
      (a.date === attendanceDate || a.date === new Date(attendanceDate).toISOString().split('T')[0])
    );
    if (exists) {
      triggerNotif('Attendance already marked for ' + student.name + ' on this date (ONE TIME ONLY).', true);
      return;
    }

    setSavingId('st_' + student.studentId);
    try {
      const locationInfo = await getIPAndLocation();
      const finalTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const newRecord = {
        student_id: student.studentId,
        student_name: student.name,
        class_name: student.class,
        section_name: student.section,
        attendance_date: attendanceDate,
        status: status,
        period: 'Morning',
        ip_address: locationInfo.ip,
        location: locationInfo.location
      };

      if (supabase) {
        // Direct DB check for safety:
        const { data: existingData } = await supabase
          .from('student_attendance')
          .select('id')
          .eq('student_id', student.studentId)
          .eq('attendance_date', attendanceDate);

        if (existingData && existingData.length > 0) {
          triggerNotif('Attendance already marked for ' + student.name + ' on this date (ONE TIME ONLY).', true);
          return;
        }

        const { data, error } = await supabase
          .from('student_attendance')
          .insert([newRecord])
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          const loadedEntry = {
            id: data[0].id,
            studentId: data[0].student_id,
            studentName: data[0].student_name,
            class: data[0].class_name,
            section: data[0].section_name,
            date: data[0].attendance_date,
            status: data[0].status,
            time: finalTime,
            period: data[0].period,
            ipAddress: data[0].ip_address,
            location: data[0].location,
            markedBy: currentUser?.name || 'Admin Panel'
          };
          
          // Remove old if exists, prepending new
          setAttendance([loadedEntry, ...attendance.filter(a => !(a.studentId === student.studentId && a.date === attendanceDate))]);
        }
      } else {
        // Fallback internal memory
        const internalEntry: AttendanceType = {
          id: Date.now().toString(),
          studentId: student.studentId,
          studentName: student.name,
          class: student.class,
          section: student.section,
          status,
          date: attendanceDate,
          time: finalTime,
          markedBy: currentUser?.name || 'Local Administrator'
        };
        setAttendance([internalEntry, ...attendance.filter(a => !(a.studentId === student.studentId && a.date === attendanceDate))]);
      }
      triggerNotif('Saved attendance successfully for ' + student.name);
    } catch (e: any) {
      console.error(e);
      triggerNotif('Error submitting: ' + e.message, true);
    } finally {
      setSavingId(null);
    }
  };

  // --- Staff & Teachers Commands ---
  const handleMarkStaff = async (staffMember: any, status: 'Present' | 'Absent' | 'Late', method = 'Manual') => {
    const targetStaffId = staffMember.staffId || staffMember.id;
    const exists = staffAttendance.find(sa => 
      sa.staffId === targetStaffId && 
      (sa.date === attendanceDate || sa.date === new Date(attendanceDate).toISOString().split('T')[0])
    );
    if (exists) {
      triggerNotif('Attendance already marked for ' + staffMember.name + ' on this date (ONE TIME ONLY).', true);
      return;
    }

    setSavingId('sf_' + staffMember.id);
    try {
      const locationInfo = await getIPAndLocation();
      const finalTime = new Date().toLocaleTimeString();
      
      const newRecord = {
        staff_id: staffMember.staffId || staffMember.id,
        staff_name: staffMember.name,
        role: staffMember.role || 'Staff',
        status: status,
        attendance_date: attendanceDate,
        attendance_time: finalTime,
        method: method,
        ip_address: locationInfo.ip,
        location: locationInfo.location
      };

      if (supabase) {
        // Direct DB check for safety:
        const { data: existingData } = await supabase
          .from('staff_attendance')
          .select('id')
          .eq('staff_id', newRecord.staff_id)
          .eq('attendance_date', attendanceDate);

        if (existingData && existingData.length > 0) {
          triggerNotif('Staff attendance already marked for today (ONE TIME ONLY).', true);
          return;
        }

        const { data, error } = await supabase
          .from('staff_attendance')
          .insert([newRecord])
          .select();

        if (error) throw error;
        
        if (data && data.length > 0) {
          const loadedEntry = {
            id: data[0].id,
            staffId: data[0].staff_id,
            staffName: data[0].staff_name,
            role: data[0].role,
            status: data[0].status,
            date: data[0].attendance_date,
            inTime: data[0].attendance_time,
            ipAddress: data[0].ip_address,
            location: data[0].location,
            method: data[0].method
          };
          setStaffAttendance([loadedEntry, ...staffAttendance.filter(sa => !(sa.staffId === loadedEntry.staffId && sa.date === attendanceDate))]);
        }
      } else {
        const memoryEntry = {
          id: Date.now().toString(),
          staffId: newRecord.staff_id,
          staffName: newRecord.staff_name,
          role: newRecord.role,
          status: status,
          date: attendanceDate,
          inTime: finalTime,
          method: 'Local'
        };
        setStaffAttendance([memoryEntry, ...staffAttendance.filter(sa => !(sa.staffId === memoryEntry.staffId && sa.date === attendanceDate))]);
      }
      triggerNotif('Uploaded staff attendance record for ' + staffMember.name);
    } catch (e: any) {
      console.error(e);
      triggerNotif('Error saving staff record: ' + e.message, true);
    } finally {
      setSavingId(null);
    }
  };

  // --- Hostel Attendance Commands ---
  const handleMarkHostel = async (student: Student, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    const exists = hostelAttendance.find(ha => 
      ha.studentId === student.studentId && 
      (ha.date === attendanceDate || ha.date === new Date(attendanceDate).toISOString().split('T')[0])
    );
    if (exists) {
      triggerNotif('Hostel attendance already marked for ' + student.name + ' on this date (ONE TIME ONLY).', true);
      return;
    }

    setSavingId('hs_' + student.studentId);
    try {
      const locationInfo = await getIPAndLocation();
      const finalTime = new Date().toLocaleTimeString();

      const newRecord = {
        student_id: student.studentId,
        student_name: student.name,
        room_number: student.roomNumber || 'A-101',
        attendance_date: attendanceDate,
        status: status,
        ip_address: locationInfo.ip,
        location: locationInfo.location
      };

      if (supabase) {
        // Direct DB check for safety:
        const { data: existingData } = await supabase
          .from('hostel_attendance')
          .select('id')
          .eq('student_id', student.studentId)
          .eq('attendance_date', attendanceDate);

        if (existingData && existingData.length > 0) {
          triggerNotif('Hostel attendance already marked for today (ONE TIME ONLY).', true);
          return;
        }

        const { data, error } = await supabase
          .from('hostel_attendance')
          .insert([newRecord])
          .select();

        if (error) throw error;

        if (data && data.length > 0) {
          const loadedEntry = {
            id: data[0].id,
            studentId: data[0].student_id,
            studentName: data[0].student_name,
            roomNumber: data[0].room_number,
            date: data[0].attendance_date,
            status: data[0].status,
            time: finalTime,
            ipAddress: data[0].ip_address,
            location: data[0].location,
            isHostel: true
          };
          setHostelAttendance([loadedEntry, ...hostelAttendance.filter(ha => !(ha.studentId === student.studentId && ha.date === attendanceDate))]);
        }
      } else {
        const memoryEntry = {
          id: Date.now().toString(),
          studentId: student.studentId,
          studentName: student.name,
          roomNumber: student.roomNumber || 'N/A',
          date: attendanceDate,
          status,
          time: finalTime,
          isHostel: true
        };
        setHostelAttendance([memoryEntry, ...hostelAttendance.filter(ha => !(ha.studentId === student.studentId && ha.date === attendanceDate))]);
      }
      triggerNotif('Saved hostel roster for ' + student.name);
    } catch (e: any) {
      console.error(e);
      triggerNotif('Error saving hostel entry: ' + e.message, true);
    } finally {
      setSavingId(null);
    }
  };

  const triggerNotif = (text: string, isError = false) => {
    setStatusMessage({ text, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // --- Filter and Search ---
  const getFilteredData = () => {
    if (activeTab === 'student') {
      return students.filter(s => {
        const matchesClass = !selectedClass || s.class === selectedClass;
        const matchesSection = !selectedSection || s.section === selectedSection;
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.includes(searchTerm);
        return matchesClass && matchesSection && matchesSearch;
      });
    } else if (activeTab === 'staff') {
      return staff.filter(s => {
        const matchesRole = selectedRole === 'All' || s.role?.toLowerCase() === selectedRole.toLowerCase();
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.staffId?.includes(searchTerm) || s.id?.includes(searchTerm);
        return matchesRole && matchesSearch;
      });
    } else {
      // Hostel residents - filters the students registered in hostel
      return students.filter(s => {
        // Usually, hostel students are either flagged as isHostel, or they have a room listed
        const isRegisteredInHostel = s.isHostel || s.roomNumber || s.hostelName;
        const matchesClass = !selectedClass || s.class === selectedClass;
        const matchesSection = !selectedSection || s.section === selectedSection;
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.studentId.includes(searchTerm);
        return isRegisteredInHostel && matchesClass && matchesSection && matchesSearch;
      });
    }
  };

  const currentList = getFilteredData();

  // Stats Counters
  const getStats = () => {
    if (activeTab === 'student') {
      const classRecords = attendance.filter(a => a.date === attendanceDate && (!selectedClass || a.class === selectedClass) && (!selectedSection || a.section === selectedSection));
      const present = classRecords.filter(r => r.status === 'Present').length;
      const absent = classRecords.filter(r => r.status === 'Absent').length;
      const late = classRecords.filter(r => r.status === 'Late').length;
      const leave = classRecords.filter(r => r.status === 'Leave').length;
      const total = currentList.length;
      return { present, absent, late, leave, total };
    } else if (activeTab === 'staff') {
      const staffRecords = staffAttendance.filter(sa => sa.date === attendanceDate && (selectedRole === 'All' || sa.role?.toLowerCase() === selectedRole.toLowerCase()));
      const present = staffRecords.filter(r => r.status === 'Present').length;
      const absent = staffRecords.filter(r => r.status === 'Absent').length;
      const late = staffRecords.filter(r => r.status === 'Late').length;
      const total = currentList.length;
      return { present, absent, late, leave: 0, total };
    } else {
      const hostelRecords = hostelAttendance.filter(ha => ha.date === attendanceDate);
      const present = hostelRecords.filter(r => r.status === 'Present').length;
      const absent = hostelRecords.filter(r => r.status === 'Absent').length;
      const late = hostelRecords.filter(r => r.status === 'Late').length;
      const leave = hostelRecords.filter(r => r.status === 'Leave').length;
      const total = currentList.length;
      return { present, absent, late, leave, total };
    }
  };

  const stats = getStats();

  // Export to Excel file helper
  const handleExportExcel = () => {
    let exportData: any[] = [];
    if (activeTab === 'student') {
      exportData = attendance.map(a => ({
        'Date': a.date,
        'Academy Year': selectedSession,
        'Student ID': a.studentId,
        'Name': a.studentName,
        'Class': a.class,
        'Section': a.section,
        'Status': a.status,
        'Marked At': a.time || 'N/A',
        'Marked By': a.markedBy || 'Admin System',
        'IP Address': a.ipAddress || 'Self',
        'Location': a.location || 'Local'
      }));
    } else if (activeTab === 'staff') {
      exportData = staffAttendance.map(sa => ({
        'Date': sa.date,
        'Staff ID': sa.staffId,
        'Name': sa.staffName,
        'Role / Designation': sa.role,
        'Status/Attendance': sa.status,
        'Clock In Time': sa.inTime || 'N/A',
        'IP Address': sa.ipAddress || 'Self',
        'Location': sa.location || 'Site'
      }));
    } else {
      exportData = hostelAttendance.map(ha => ({
        'Date': ha.date,
        'Resident ID': ha.studentId,
        'Student Name': ha.studentName,
        'Room Assigned': ha.roomNumber || 'Room 101',
        'Status': ha.status,
        'Scan Event Time': ha.time || 'N/A',
        'IP Address': ha.ipAddress || 'Device',
        'Location': ha.location || 'Gate'
      }));
    }

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `${activeTab}_Roster`);
    XLSX.writeFile(wb, `${activeTab}_Attendance_Report_${attendanceDate}.xlsx`);
  };

  // Export to PDF file helper
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    
    const schoolTitle = schoolProfile?.name || "Hope English School";
    doc.text(schoolTitle, 14, 15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Official Attendance Ledger - Tab: [${activeTab.toUpperCase()}]`, 14, 22);
    doc.text(`Date of Register: ${attendanceDate} | Year/Session: ${selectedSession}`, 14, 28);
    doc.line(14, 32, 196, 32);

    let headers: string[][] = [];
    let rows: any[][] = [];

    if (activeTab === 'student') {
      headers = [['Student ID', 'Student Name', 'Class/Sec', 'Status', 'Record Time', 'Marked By']];
      rows = attendance
        .filter(a => a.date === attendanceDate && (!selectedClass || a.class === selectedClass) && (!selectedSection || a.section === selectedSection))
        .map(a => [a.studentId, a.studentName, `${a.class}-${a.section}`, a.status, a.time || '--', a.markedBy || 'System']);
    } else if (activeTab === 'staff') {
      headers = [['Staff ID', 'Employee Name', 'Role Name', 'Status', 'In Time', 'Location']];
      rows = staffAttendance
        .filter(sa => sa.date === attendanceDate && (selectedRole === 'All' || sa.role?.toLowerCase() === selectedRole.toLowerCase()))
        .map(sa => [sa.staffId || 'N/A', sa.staffName, sa.role || 'Staff', sa.status, sa.inTime || '--', sa.location || 'Local']);
    } else {
      headers = [['Student ID', 'Resident Name', 'Room No.', 'Status', 'Registration Time', 'IP Location']];
      rows = hostelAttendance
        .filter(ha => ha.date === attendanceDate)
        .map(ha => [ha.studentId, ha.studentName, ha.roomNumber || 'Room 101', ha.status, ha.time || '--', ha.location || 'Local']);
    }

    if (rows.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.text("No matching verified attendance entries registered for this specific criteria.", 14, 45);
    } else {
      (doc as any).autoTable({
        head: headers,
        body: rows,
        startY: 38,
        theme: 'striped',
        headStyles: { fillColor: [47, 93, 159], textBold: true },
        styles: { fontSize: 9 }
      });
    }

    doc.save(`${activeTab}_Attendance_Report_${attendanceDate}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner section */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1.5Packed">
            <Building className="text-[#2F5D9F]" size={20} />
            <span className="text-[10px] font-black tracking-widest text-[#2F5D9F] uppercase bg-blue-50 px-2.5 py-1 rounded-md">Unified Management</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase font-display">School Attendance Ledger</h1>
          <p className="text-text-sub text-sm">Unified system monitoring real-time attendance for students, teachers, staff, wardens, and hostel residents.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleExportExcel} 
            className="flex items-center gap-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors px-4 py-2.5 rounded-xl font-bold text-xs uppercase"
          >
            <FileSpreadsheet size={16} /> Excel Export
          </button>
          
          <button 
            onClick={handleExportPDF} 
            className="flex items-center gap-2 bg-red-50 text-red-800 hover:bg-red-100 transition-colors px-4 py-2.5 rounded-xl font-bold text-xs uppercase"
          >
            <FileText size={16} /> PDF Ledger
          </button>
        </div>
      </div>

      {/* Primary Category Select Tabs */}
      <div className="flex flex-col sm:flex-row gap-2 bg-slate-100 p-2 rounded-2xl">
        <button 
          onClick={() => { setActiveTab('student'); setSubView('manual'); }}
          className={`flex-1 py-3.5 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2.5 ${
            activeTab === 'student' ? 'bg-[#2F5D9F] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <GraduationCap size={18} />
          Student Attendance
        </button>

        <button 
          onClick={() => { setActiveTab('staff'); setSubView('manual'); }}
          className={`flex-1 py-3.5 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2.5 ${
            activeTab === 'staff' ? 'bg-[#2F5D9F] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <Users size={18} />
          Teachers & Staff
        </button>

        <button 
          onClick={() => { setActiveTab('hostel'); setSubView('manual'); }}
          className={`flex-1 py-3.5 px-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2.5 ${
            activeTab === 'hostel' ? 'bg-[#2F5D9F] text-white shadow-md' : 'text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          <HomeIcon size={18} />
          Hostel Residents
        </button>
      </div>

      {/* Global & Contextual Filters in a single card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <Filter size={18} className="text-[#2F5D9F]" />
          <h3 className="font-bold text-slate-700 text-sm uppercase">Selection Filters & Search</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Academic Session / Year</label>
            <Select 
              value={selectedSession} 
              onChange={(e: any) => setSelectedSession(e.target.value)}
              options={masterData.sessions}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Register Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F5D9F] focus:ring-2 focus:ring-[#2F5D9F]/10 outline-none text-sm font-semibold bg-[#F8FAFC]"
              value={attendanceDate} 
              onChange={(e: any) => setAttendanceDate(e.target.value)} 
            />
          </div>

          {activeTab !== 'staff' ? (
            <>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Class / Standard</label>
                <Select 
                  value={selectedClass} 
                  onChange={(e: any) => setSelectedClass(e.target.value)}
                  options={['', ...masterData.classes]}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Section</label>
                <Select 
                  value={selectedSection} 
                  onChange={(e: any) => setSelectedSection(e.target.value)}
                  options={['', ...masterData.sections]}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Member Role</label>
              <Select 
                value={selectedRole} 
                onChange={(e: any) => setSelectedRole(e.target.value)}
                options={['All', 'Teacher', 'Warden', 'Accountant', 'Security', 'Staff']}
              />
            </div>
          )}

          <div className={activeTab === 'staff' ? "sm:col-span-2" : ""}>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5">Search Name / ID No.</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                placeholder="Type keywords..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#2F5D9F] focus:ring-2 focus:ring-[#2F5D9F]/10 outline-none text-sm font-semibold bg-[#F8FAFC]"
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Real-time Status Notification banner */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-2xl flex items-center gap-3 font-semibold text-sm border ${
              statusMessage.isError 
                ? 'bg-red-50 text-red-700 border-red-100' 
                : 'bg-green-50 text-green-700 border-green-100'
            }`}
          >
            {statusMessage.isError ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
            <span className="flex-1">{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overall Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2F5D9F] flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Registers</p>
            <h4 className="text-xl font-bold text-slate-700">{stats.total} Listed</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Present</p>
            <h4 className="text-xl font-bold text-emerald-600">{stats.present} Active</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center">
            <UserX size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Absent Today</p>
            <h4 className="text-xl font-bold text-red-500">{stats.absent} Away</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Late / Leave</p>
            <h4 className="text-xl font-bold text-amber-500">{stats.late + stats.leave} Pending</h4>
          </div>
        </div>
      </div>

      {/* Sub tabs: Manual Sheet vs QR Scan vs Historical logs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setSubView('manual')} 
          className={`pb-3 font-bold text-sm transition-all border-b-2 tracking-wider uppercase ${subView === 'manual' ? 'border-[#2F5D9F] text-[#2F5D9F]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Daily Sheet Register
        </button>
        <button 
          onClick={() => setSubView('scan')} 
          className={`pb-3 font-bold text-sm transition-all border-b-2 tracking-wider uppercase ${subView === 'scan' ? 'border-[#2F5D9F] text-[#2F5D9F]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Live ID Card QR Scanner
        </button>
        <button 
          onClick={() => setSubView('history')} 
          className={`pb-3 font-bold text-sm transition-all border-b-2 tracking-wider uppercase ${subView === 'history' ? 'border-[#2F5D9F] text-[#2F5D9F]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          System Verification History
        </button>
      </div>

      {subView === 'scan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 p-8 flex flex-col items-center justify-center min-h-[400px]">
            {!showScanner ? (
              <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center mx-auto shadow-md">
                  <QrCode size={48} className="text-[#2F5D9F]" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Verify Identity via Camera</h3>
                <p className="text-text-sub max-w-xs mx-auto">Holds support for scanning Student cards, staff credentials or QR badges to instantly check attendance status.</p>
                
                <button 
                  onClick={() => setShowScanner(true)} 
                  className="btn-primary flex items-center gap-2.5 mx-auto px-8 py-4 bg-[#2F5D9F] hover:bg-[#244A80] transition-colors rounded-2xl font-bold"
                >
                  <Camera size={20} /> Launch Device Camera
                </button>
              </div>
            ) : (
              <div className="w-full max-w-md mx-auto">
                <div id="reader" className="rounded-3xl overflow-hidden border-4 border-slate-100 shadow-xl"></div>
                <button 
                  onClick={() => setShowScanner(false)} 
                  className="mt-6 text-red-500 font-bold flex items-center gap-2 mx-auto bg-red-50 px-5 py-2.5 rounded-xl hover:bg-red-100 transition-colors"
                >
                  <X size={18} /> Shutdown Camera Interface
                </button>
              </div>
            )}
            
            {(scanResult || scanError) && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className={`mt-6 p-4 rounded-xl font-bold flex items-center gap-3 border ${
                  scanError ? 'bg-red-50 text-red-700 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
                }`}
              >
                {scanError ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                <span>{scanError || scanResult}</span>
              </motion.div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-slate-50 pb-3">
              <Clock size={20} className="text-[#2F5D9F]" /> 
              Recent Event Scans
            </h3>
            
            <div className="space-y-4">
              {activeTab === 'student' && attendance.slice(0, 6).map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/50 transition-colors rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{a.studentName}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{a.class} - {a.section} | {a.studentId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#2F5D9F]">{a.time || 'Logged'}</p>
                    <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase tracking-wider">Present</span>
                  </div>
                </div>
              ))}

              {activeTab === 'staff' && staffAttendance.slice(0, 6).map((sa) => (
                <div key={sa.id} className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/50 transition-colors rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{sa.staffName}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">{sa.role} | {sa.staffId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#2F5D9F]">{sa.inTime || 'Logged'}</p>
                    <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase tracking-wider">{sa.status}</span>
                  </div>
                </div>
              ))}

              {activeTab === 'hostel' && hostelAttendance.slice(0, 6).map((ha) => (
                <div key={ha.id} className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/50 transition-colors rounded-2xl border border-slate-100">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{ha.studentName}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Room {ha.roomNumber || 'A-101'} | {ha.studentId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#2F5D9F]">{ha.time || 'Logged'}</p>
                    <span className="text-[8px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md uppercase tracking-wider">{ha.status}</span>
                  </div>
                </div>
              ))}

              {((activeTab === 'student' && attendance.length === 0) ||
                (activeTab === 'staff' && staffAttendance.length === 0) ||
                (activeTab === 'hostel' && hostelAttendance.length === 0)) && (
                <div className="py-12 text-center text-slate-400 italic text-sm font-semibold">No interactive scan traces stored for today.</div>
              )}
            </div>
          </Card>
        </div>
      )}

      {subView === 'manual' && (
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
                <Save size={18} className="text-[#2F5D9F]" />
                Registered Roster List ({currentList.length} total matched)
              </h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-lg">Date: {attendanceDate}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentList.map((member) => {
                let statusBadge: any = null;
                let isLoading = false;
                
                if (activeTab === 'student') {
                  const todayAtt = attendance.find(a => a.studentId === member.studentId && a.date === attendanceDate);
                  statusBadge = todayAtt ? todayAtt.status : null;
                  isLoading = savingId === 'st_' + member.studentId;
                } else if (activeTab === 'staff') {
                  const todayAtt = staffAttendance.find(sa => sa.staffId === member.id || sa.staffId === member.staffId && sa.date === attendanceDate);
                  statusBadge = todayAtt ? todayAtt.status : null;
                  isLoading = savingId === 'sf_' + member.id;
                } else {
                  const todayAtt = hostelAttendance.find(ha => ha.studentId === member.studentId && ha.date === attendanceDate);
                  statusBadge = todayAtt ? todayAtt.status : null;
                  isLoading = savingId === 'hs_' + member.studentId;
                }

                return (
                  <div 
                    key={member.id || member.studentId} 
                    className={`bg-white rounded-3xl border p-5 transition-all shadow-xs relative flex flex-col justify-between ${
                      statusBadge === 'Present' ? 'border-emerald-200 bg-emerald-50/10' :
                      statusBadge === 'Absent' ? 'border-red-200 bg-red-50/10' :
                      statusBadge ? 'border-amber-200 bg-amber-50/10' : 'border-slate-100 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-lg font-black text-[#2F5D9F] flex items-center justify-center shrink-0">
                        {member.name?.[0] || 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-800 text-base truncate">{member.name}</h4>
                          {isLoading && <RefreshCw size={14} className="text-[#2F5D9F] animate-spin" />}
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                          {activeTab === 'student' ? `${member.class} - ${member.section}` : 
                           activeTab === 'staff' ? `${member.role || 'Teacher'} / ${member.department || 'Academic'}` : 
                           `Room: ${member.roomNumber || 'Unassigned'} / Bed: ${member.bedNumber || 'Unassigned'}`}
                        </p>
                        <p className="text-xs text-slate-500 font-bold">{member.studentId || member.staffId || member.id}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (activeTab === 'student') handleMarkStudent(member, 'Present');
                          else if (activeTab === 'staff') handleMarkStaff(member, 'Present');
                          else handleMarkHostel(member, 'Present');
                        }}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border ${
                          statusBadge === 'Present' 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                        }`}
                      >
                        Present
                      </button>

                      <button 
                        onClick={() => {
                          if (activeTab === 'student') handleMarkStudent(member, 'Absent');
                          else if (activeTab === 'staff') handleMarkStaff(member, 'Absent');
                          else handleMarkHostel(member, 'Absent');
                        }}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border ${
                          statusBadge === 'Absent' 
                            ? 'bg-red-600 border-red-600 text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                        }`}
                      >
                        Absent
                      </button>

                      <button 
                        onClick={() => {
                          if (activeTab === 'student') handleMarkStudent(member, 'Late');
                          else if (activeTab === 'staff') handleMarkStaff(member, 'Late');
                          else handleMarkHostel(member, 'Late');
                        }}
                        className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border ${
                          statusBadge === 'Late' 
                            ? 'bg-amber-600 border-amber-600 text-white shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200'
                        }`}
                      >
                        Late
                      </button>
                    </div>
                  </div>
                );
              })}

              {currentList.length === 0 && (
                <div className="col-span-1 md:col-span-3 text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <ShieldAlert className="mx-auto text-slate-400 mb-2" size={32} />
                  <p className="text-slate-500 font-bold">No active users matched your filters or search keywords.</p>
                  <p className="text-xs text-slate-400 mt-1">Refine options above to load other classrooms or staff roles.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {subView === 'history' && (
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase flex items-center gap-2">
              <History size={18} className="text-[#2F5D9F]" />
              Attendance Registration Logs
            </h3>
            <span className="text-xs text-slate-400 font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-widest">
              Live Database Verification
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-xs font-black uppercase tracking-wider">
                  <th className="pb-3 pl-2">Subject / Identity</th>
                  <th className="pb-3">Roster Class / Role</th>
                  <th className="pb-3">Academic Session</th>
                  <th className="pb-3">Status Badge</th>
                  <th className="pb-3">Check-in Time</th>
                  <th className="pb-3 pr-2">IP Audit / Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-sm font-semibold">
                {activeTab === 'student' && attendance
                  .filter(a => a.date === attendanceDate && (!selectedClass || a.class === selectedClass) && (!selectedSection || a.section === selectedSection))
                  .map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <p className="font-extrabold text-slate-800">{a.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{a.studentId}</p>
                      </td>
                      <td className="py-4 font-bold text-[#2F5D9F] uppercase text-xs">{a.class} - {a.section}</td>
                      <td className="py-4 text-xs font-bold text-slate-500">{selectedSession}</td>
                      <td className="py-4">
                        <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md ${
                          a.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                          a.status === 'Absent' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-xs">{a.time || '--:--'}</td>
                      <td className="py-4 text-xs text-slate-500 pr-2">
                        <p className="font-mono text-[10px]">{a.ipAddress || '192.168.1.1'}</p>
                        <p className="truncate max-w-[150px] font-light">{a.location || 'Local School wifi'}</p>
                      </td>
                    </tr>
                ))}

                {activeTab === 'staff' && staffAttendance
                  .filter(sa => sa.date === attendanceDate && (selectedRole === 'All' || sa.role?.toLowerCase() === selectedRole.toLowerCase()))
                  .map((sa) => (
                    <tr key={sa.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <p className="font-extrabold text-slate-800">{sa.staffName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{sa.staffId}</p>
                      </td>
                      <td className="py-4 font-bold text-[#2F5D9F] uppercase text-xs">{sa.role || 'Teacher'}</td>
                      <td className="py-4 text-xs font-bold text-slate-500">{selectedSession}</td>
                      <td className="py-4">
                        <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md ${
                          sa.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                          sa.status === 'Absent' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {sa.status}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-xs">{sa.inTime || '--:--'}</td>
                      <td className="py-4 text-xs text-slate-500 pr-2">
                        <p className="font-mono text-[10px]">{sa.ipAddress || '192.168.1.1'}</p>
                        <p className="truncate max-w-[150px] font-light">{sa.location || 'Local'}</p>
                      </td>
                    </tr>
                ))}

                {activeTab === 'hostel' && hostelAttendance
                  .filter(ha => ha.date === attendanceDate)
                  .map((ha) => (
                    <tr key={ha.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-2">
                        <p className="font-extrabold text-slate-800">{ha.studentName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{ha.studentId}</p>
                      </td>
                      <td className="py-4 font-bold text-[#2F5D9F] uppercase text-xs">Room {ha.roomNumber || 'A-101'}</td>
                      <td className="py-4 text-xs font-bold text-slate-500">{selectedSession}</td>
                      <td className="py-4">
                        <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md ${
                          ha.status === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                          ha.status === 'Absent' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {ha.status}
                        </span>
                      </td>
                      <td className="py-4 font-mono text-xs">{ha.time || '--:--'}</td>
                      <td className="py-4 text-xs text-slate-500 pr-2">
                        <p className="font-mono text-[10px]">{ha.ipAddress || '192.168.1.1'}</p>
                        <p className="truncate max-w-[150px] font-light">{ha.location || 'Campus Gate'}</p>
                      </td>
                    </tr>
                ))}

                {((activeTab === 'student' && attendance.filter(a => a.date === attendanceDate && (!selectedClass || a.class === selectedClass) && (!selectedSection || a.section === selectedSection)).length === 0) ||
                  (activeTab === 'staff' && staffAttendance.filter(sa => sa.date === attendanceDate && (selectedRole === 'All' || sa.role?.toLowerCase() === selectedRole.toLowerCase())).length === 0) ||
                  (activeTab === 'hostel' && hostelAttendance.filter(ha => ha.date === attendanceDate).length === 0)) && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic text-sm font-semibold">
                      No matching verified logs saved in our records for date: {attendanceDate}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
