import React, { useState } from 'react';
import { 
  Users, 
  CalendarRange, 
  CheckCircle2, 
  Building2, 
  UserCog, 
  Plus, 
  X, 
  Trash2,
  Edit2,
  Eye,
  FileText,
  Upload,
  Download,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { FileUpload } from '../../components/common/FileUpload';
import { Staff } from '../../types';

interface HumanResourcePanelProps {
  staff: Staff[];
  setStaff: (staff: Staff[]) => void;
  departments: any[];
  setDepartments: (departments: any[]) => void;
  designations: any[];
  setDesignations: (designations: any[]) => void;
  leaveRequests: any[];
  setLeaveRequests: (leaveRequests: any[]) => void;
}

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

export const HumanResourcePanel = ({ 
  staff, 
  setStaff, 
  departments, 
  setDepartments, 
  designations, 
  setDesignations, 
  leaveRequests, 
  setLeaveRequests 
}: HumanResourcePanelProps) => {
  const [activeTab, setActiveTab] = useState('staff-list');
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewStaff, setViewStaff] = useState<Staff | null>(null);
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    status: 'Active',
    joiningDate: new Date().toISOString().split('T')[0],
    documents: []
  });
  const [newDepartment, setNewDepartment] = useState('');
  const [newDesignation, setNewDesignation] = useState('');
  const [newLeave, setNewLeave] = useState<any>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'Pending'
  });

  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.surname || !newStaff.role) return;
    
    if (isEditing && newStaff.id) {
      setStaff(staff.map(s => s.id === newStaff.id ? { ...s, ...newStaff } as Staff : s));
    } else {
      const staffMember: Staff = {
        ...newStaff as Staff,
        id: `STF-${Math.floor(100000 + Math.random() * 900000)}`,
        staffId: `EMP${Math.floor(1000 + Math.random() * 9000)}`
      };
      setStaff([...staff, staffMember]);
    }
    
    setShowAddStaff(false);
    setIsEditing(false);
    setNewStaff({ status: 'Active', joiningDate: new Date().toISOString().split('T')[0], documents: [] });
  };

  const handleEdit = (s: Staff) => {
    setNewStaff(s);
    setIsEditing(true);
    setShowAddStaff(true);
  };

  const handleFileChange = (name: string, file: string) => {
    const currentDocs = newStaff.documents || [];
    const existingIndex = currentDocs.findIndex(d => d.name === name);
    
    let updatedDocs;
    if (existingIndex >= 0) {
      updatedDocs = currentDocs.map((d, i) => i === existingIndex ? { name, file } : d);
    } else {
      updatedDocs = [...currentDocs, { name, file }];
    }
    
    setNewStaff({ ...newStaff, documents: updatedDocs });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-text-heading">Human Resource</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowAddStaff(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Add Staff
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'staff-list', label: 'Staff Details', icon: Users },
          { id: 'leave', label: 'Apply Leave', icon: CalendarRange },
          { id: 'approve-leave', label: 'Approve Leave', icon: CheckCircle2 },
          { id: 'departments', label: 'Department', icon: Building2 },
          { id: 'designations', label: 'Designation', icon: UserCog }
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

      {activeTab === 'staff-list' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Staff ID</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Name</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Role</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Department</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Designation</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Mobile</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Status</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {staff.map((s: Staff) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-sm font-bold text-primary">{s.staffId || s.id}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
                          {s.photo ? <img src={s.photo} alt="" className="w-full h-full object-cover" /> : s.name[0]}
                        </div>
                        <span className="font-bold text-text-heading">{s.name} {s.surname}</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-text-sub">{s.role}</td>
                    <td className="py-4 text-sm text-text-sub">{s.department}</td>
                    <td className="py-4 text-sm text-text-sub">{s.designation}</td>
                    <td className="py-4 text-sm text-text-sub">{s.mobile}</td>
                    <td className="py-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                        s.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button 
                          onClick={() => setViewStaff(s)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(s)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setStaff(staff.filter(st => st.id !== s.id))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'leave' && (
        <Card className="max-w-xl mx-auto p-8">
          <h3 className="text-xl font-black text-text-heading mb-6 uppercase tracking-tight">Apply Leave</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Start Date" type="date" value={newLeave.startDate} onChange={(e: any) => setNewLeave({...newLeave, startDate: e.target.value})} />
              <Input label="End Date" type="date" value={newLeave.endDate} onChange={(e: any) => setNewLeave({...newLeave, endDate: e.target.value})} />
            </div>
            <div className="w-full">
              <label className="label-text">Reason</label>
              <textarea 
                className="input-field min-h-[120px]" 
                value={newLeave.reason}
                onChange={(e: any) => setNewLeave({...newLeave, reason: e.target.value})}
              />
            </div>
            <button 
              onClick={() => {
                if (!newLeave.reason) return;
                setLeaveRequests([{...newLeave, id: Date.now().toString(), staffName: 'Current User', staffId: 'STF-001'}, ...leaveRequests]);
                setNewLeave({
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: new Date().toISOString().split('T')[0],
                  reason: '',
                  status: 'Pending'
                });
              }}
              className="btn-primary w-full py-4"
            >
              Submit Leave Request
            </button>
          </div>
        </Card>
      )}

      {activeTab === 'approve-leave' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 px-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Staff</th>
                  <th className="pb-4 px-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Duration</th>
                  <th className="pb-4 px-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Reason</th>
                  <th className="pb-4 px-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Status</th>
                  <th className="pb-4 px-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leaveRequests.map((l: any) => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <p className="text-sm font-bold text-text-heading">{l.staffName}</p>
                      <p className="text-[10px] text-text-sub uppercase">{l.staffId}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-bold text-text-heading">{l.startDate} to {l.endDate}</p>
                    </td>
                    <td className="py-4 px-4 text-sm text-text-sub max-w-xs truncate">{l.reason}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                        l.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                        l.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {l.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setLeaveRequests(leaveRequests.map((r: any) => r.id === l.id ? {...r, status: 'Approved'} : r))}
                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"
                          >
                            <CheckCircle2 size={16} />
                          </button>
                          <button 
                            onClick={() => setLeaveRequests(leaveRequests.map((r: any) => r.id === l.id ? {...r, status: 'Rejected'} : r))}
                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {leaveRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-text-sub font-medium italic">No leave requests found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 p-6">
            <h3 className="text-lg font-bold mb-6">Add Department</h3>
            <div className="space-y-4">
              <Input label="Department Name" value={newDepartment} onChange={(e: any) => setNewDepartment(e.target.value)} />
              <button 
                onClick={() => {
                  if (!newDepartment) return;
                  setDepartments([...departments, { id: Date.now().toString(), name: newDepartment }]);
                  setNewDepartment('');
                }}
                className="btn-primary w-full py-3"
              >
                Save Department
              </button>
            </div>
          </Card>
          <Card className="md:col-span-2 p-6">
            <h3 className="text-lg font-bold mb-6">Department List</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Name</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {departments.map((d: any) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-sm font-bold text-text-heading">{d.name}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => setDepartments(departments.filter((dep: any) => dep.id !== d.id))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'designations' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 p-6">
            <h3 className="text-lg font-bold mb-6">Add Designation</h3>
            <div className="space-y-4">
              <Input label="Designation Name" value={newDesignation} onChange={(e: any) => setNewDesignation(e.target.value)} />
              <button 
                onClick={() => {
                  if (!newDesignation) return;
                  setDesignations([...designations, { id: Date.now().toString(), name: newDesignation }]);
                  setNewDesignation('');
                }}
                className="btn-primary w-full py-3"
              >
                Save Designation
              </button>
            </div>
          </Card>
          <Card className="md:col-span-2 p-6">
            <h3 className="text-lg font-bold mb-6">Designation List</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Name</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {designations.map((d: any) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-sm font-bold text-text-heading">{d.name}</td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => setDesignations(designations.filter((des: any) => des.id !== d.id))}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddStaff && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-0 w-full max-w-4xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-black text-text-heading">{isEditing ? 'Edit Staff Details' : 'Add New Staff'}</h3>
                <button onClick={() => { setShowAddStaff(false); setIsEditing(false); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-12">
                  {/* Basic Information */}
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Users size={18} />
                      </div>
                      <h4 className="text-lg font-black text-text-heading uppercase tracking-tight">Basic Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FileUpload 
                        label="Profile Photo" 
                        preview={newStaff.photo}
                        onChange={(file: string) => setNewStaff({ ...newStaff, photo: file })}
                      />
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="First Name" required value={newStaff.name} onChange={(e: any) => setNewStaff({...newStaff, name: e.target.value})} />
                        <Input label="Last Name" required value={newStaff.surname} onChange={(e: any) => setNewStaff({...newStaff, surname: e.target.value})} />
                        <Input label="Father's Name" value={newStaff.fatherName} onChange={(e: any) => setNewStaff({...newStaff, fatherName: e.target.value})} />
                        <Input label="Mother's Name" value={newStaff.motherName} onChange={(e: any) => setNewStaff({...newStaff, motherName: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
                      <Input label="Date of Birth" type="date" value={newStaff.dob} onChange={(e: any) => setNewStaff({...newStaff, dob: e.target.value})} />
                      <div className="w-full">
                        <label className="label-text">Gender</label>
                        <select className="input-field" value={newStaff.gender} onChange={(e: any) => setNewStaff({...newStaff, gender: e.target.value})}>
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <Input label="Email" type="email" value={newStaff.email} onChange={(e: any) => setNewStaff({...newStaff, email: e.target.value})} />
                      <Input label="Mobile" value={newStaff.mobile} onChange={(e: any) => setNewStaff({...newStaff, mobile: e.target.value})} />
                    </div>
                  </section>

                  {/* Employment Details */}
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <Building2 size={18} />
                      </div>
                      <h4 className="text-lg font-black text-text-heading uppercase tracking-tight">Employment Details</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="w-full">
                        <label className="label-text">Role <span className="text-red-500">*</span></label>
                        <select className="input-field" value={newStaff.role} onChange={(e: any) => setNewStaff({...newStaff, role: e.target.value})}>
                          <option value="">Select Role</option>
                          <option value="Admin">Admin</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Accountant">Accountant</option>
                          <option value="Librarian">Librarian</option>
                          <option value="Warden">Warden</option>
                        </select>
                      </div>
                      <div className="w-full">
                        <label className="label-text">Department</label>
                        <select className="input-field" value={newStaff.department} onChange={(e: any) => setNewStaff({...newStaff, department: e.target.value})}>
                          <option value="">Select Department</option>
                          {departments.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>
                      <div className="w-full">
                        <label className="label-text">Designation</label>
                        <select className="input-field" value={newStaff.designation} onChange={(e: any) => setNewStaff({...newStaff, designation: e.target.value})}>
                          <option value="">Select Designation</option>
                          {designations.map((d: any) => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <Input label="Qualification" value={newStaff.qualification} onChange={(e: any) => setNewStaff({...newStaff, qualification: e.target.value})} />
                      <Input label="Work Experience" value={newStaff.experience} onChange={(e: any) => setNewStaff({...newStaff, experience: e.target.value})} />
                      <Input label="Joining Date" type="date" value={newStaff.joiningDate} onChange={(e: any) => setNewStaff({...newStaff, joiningDate: e.target.value})} />
                      <div className="w-full">
                        <label className="label-text">Status</label>
                        <select className="input-field" value={newStaff.status} onChange={(e: any) => setNewStaff({...newStaff, status: e.target.value as any})}>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Documents Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                        <FileText size={18} />
                      </div>
                      <h4 className="text-lg font-black text-text-heading uppercase tracking-tight">Staff Documents</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      <FileUpload 
                        label="Identity Proof (Aadhar/PAN)" 
                        preview={newStaff.documents?.find(d => d.name === 'Identity Proof')?.file}
                        onChange={(file: string) => handleFileChange('Identity Proof', file)} 
                      />
                      <FileUpload 
                        label="Educational Certificates" 
                        preview={newStaff.documents?.find(d => d.name === 'Education')?.file}
                        onChange={(file: string) => handleFileChange('Education', file)} 
                      />
                      <FileUpload 
                        label="Experience Letter" 
                        preview={newStaff.documents?.find(d => d.name === 'Experience')?.file}
                        onChange={(file: string) => handleFileChange('Experience', file)} 
                      />
                      <FileUpload 
                        label="Resume/CV" 
                        preview={newStaff.documents?.find(d => d.name === 'Resume')?.file}
                        onChange={(file: string) => handleFileChange('Resume', file)} 
                      />
                    </div>

                    {/* Display existing documents list for easy viewing/deletion */}
                    {newStaff.documents && newStaff.documents.length > 0 && (
                      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {newStaff.documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <FileText size={20} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-text-heading">{doc.name}</p>
                                <p className="text-[10px] text-primary font-black uppercase">Uploaded</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                setNewStaff({
                                  ...newStaff,
                                  documents: newStaff.documents?.filter((_, i) => i !== idx)
                                });
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button onClick={() => { setShowAddStaff(false); setIsEditing(false); }} className="flex-1 py-4 font-bold text-text-sub hover:bg-slate-100 rounded-2xl transition-all uppercase tracking-widest text-xs">Cancel</button>
                <button onClick={handleAddStaff} className="flex-1 btn-primary py-4 uppercase tracking-widest text-xs">{isEditing ? 'Update Staff Member' : 'Save Staff Member'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Staff Profile Modal */}
      <AnimatePresence>
        {viewStaff && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-0 w-full max-w-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-primary text-white">
                <h3 className="text-xl font-bold uppercase tracking-widest">Staff Profile</h3>
                <button onClick={() => setViewStaff(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                  <div className="w-32 h-32 rounded-3xl bg-slate-100 flex items-center justify-center text-primary font-black text-4xl overflow-hidden border-4 border-slate-50 shadow-lg">
                    {viewStaff.photo ? <img src={viewStaff.photo} alt="" className="w-full h-full object-cover" /> : viewStaff.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-3xl font-black text-text-heading">{viewStaff.name} {viewStaff.surname}</h2>
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${
                        viewStaff.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {viewStaff.status}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">{viewStaff.staffId || viewStaff.id}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-text-sub uppercase tracking-wider mb-1">Role</p>
                        <p className="text-sm font-bold text-text-heading">{viewStaff.role}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-text-sub uppercase tracking-wider mb-1">Department</p>
                        <p className="text-sm font-bold text-text-heading">{viewStaff.department}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-slate-100 pb-2">Personal Details</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-text-sub uppercase tracking-wider mb-1">Father's Name</p>
                        <p className="text-sm font-bold text-text-heading">{viewStaff.fatherName || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-text-sub uppercase tracking-wider mb-1">Date of Birth</p>
                        <p className="text-sm font-bold text-text-heading">{formatDateDMY(viewStaff.dob)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-text-sub uppercase tracking-wider mb-1">Gender</p>
                        <p className="text-sm font-bold text-text-heading">{viewStaff.gender || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-text-sub uppercase tracking-wider mb-1">Mobile</p>
                        <p className="text-sm font-bold text-text-heading">{viewStaff.mobile}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-text-sub uppercase tracking-wider mb-1">Email</p>
                        <p className="text-sm font-bold text-text-heading">{viewStaff.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-slate-100 pb-2">Academic & Experience</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black text-text-sub uppercase tracking-wider mb-1">Qualification</p>
                        <p className="text-sm font-bold text-text-heading">{viewStaff.qualification || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-text-sub uppercase tracking-wider mb-1">Experience</p>
                        <p className="text-sm font-bold text-text-heading">{viewStaff.experience || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-text-sub uppercase tracking-wider mb-1">Joining Date</p>
                        <p className="text-sm font-bold text-text-heading">{viewStaff.joiningDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visible Documents Section */}
                <div className="mt-12">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-slate-100 pb-2 mb-6">Uploaded Documents</h4>
                  {viewStaff.documents && viewStaff.documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {viewStaff.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary/20 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                              <FileText size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text-heading">{doc.name}</p>
                              <p className="text-[8px] text-text-sub font-black uppercase tracking-widest">Document File</p>
                            </div>
                          </div>
                          <a 
                            href={doc.file} 
                            download={`${viewStaff.name}_${doc.name}`}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Download"
                          >
                            <Download size={18} />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <AlertCircle className="text-slate-300 mb-2" size={32} />
                      <p className="text-xs font-bold text-text-sub uppercase tracking-widest">No documents uploaded yet</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => {
                    handleEdit(viewStaff);
                    setViewStaff(null);
                  }}
                  className="btn-primary px-8 py-3 uppercase tracking-widest text-xs flex items-center gap-2"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
