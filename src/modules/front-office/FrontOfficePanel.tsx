import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  BookOpen, 
  AlertCircle, 
  Plus, 
  X,
  Edit2,
  Trash2,
  Save,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { AdmissionEnquiry, Visitor, Complaint } from '../../types';
import { supabase } from '../../lib/supabase';

interface FrontOfficePanelProps {
  enquiries: AdmissionEnquiry[];
  setEnquiries: (enquiries: AdmissionEnquiry[]) => void;
  visitors: Visitor[];
  setVisitors: (visitors: Visitor[]) => void;
  complaints: Complaint[];
  setComplaints: (complaints: Complaint[]) => void;
  setView: (view: string) => void;
  setFormData: (data: any) => void;
  currentUser: any;
  masterData: any;
}

export const FrontOfficePanel = ({ 
  enquiries, 
  setEnquiries, 
  visitors, 
  setVisitors, 
  complaints, 
  setComplaints, 
  setView, 
  setFormData, 
  currentUser,
  masterData
}: FrontOfficePanelProps) => {
  const [activeTab, setActiveTab] = useState('enquiry');
  const [showAddEnquiry, setShowAddEnquiry] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState<AdmissionEnquiry | null>(null);
  const [newEnquiry, setNewEnquiry] = useState<Partial<AdmissionEnquiry>>({
    status: 'Pending',
    date: new Date().toISOString().split('T')[0]
  });

  const [editingVisitor, setEditingVisitor] = useState<Visitor | null>(null);
  const [newVisitor, setNewVisitor] = useState<Partial<Visitor>>({
    date: new Date().toISOString().split('T')[0],
    inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    role: 'Other'
  });

  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [newComplaint, setNewComplaint] = useState<Partial<Complaint>>({
    date: new Date().toISOString().split('T')[0],
    status: 'Pending'
  });

  const [isPrinting, setIsPrinting] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  // Fetch data from Supabase
  useEffect(() => {
    fetchEnquiries();
    fetchVisitors();
    fetchComplaints();
  }, []);

  const fetchEnquiries = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('admission_enquiries')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setEnquiries(data.map((e: any) => ({
        id: e.id,
        name: e.first_name,
        surname: e.surname,
        mobile: e.mobile,
        email: e.email,
        class: e.class_name,
        gender: e.gender,
        fatherName: e.father_name,
        motherName: e.mother_name,
        source: e.source,
        date: e.enquiry_date,
        address: e.address,
        status: e.status || 'Pending'
      })));
    }
  };

  const fetchVisitors = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('visitor_book')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setVisitors(data.map((v: any) => ({
        id: v.id,
        name: v.visitor_name,
        mobile: v.mobile,
        role: v.role,
        purpose: v.purpose,
        qualification: v.qualification,
        note: v.note,
        date: v.visit_date,
        inTime: v.in_time,
        outTime: v.out_time
      })));
    }
  };

  const fetchComplaints = async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) {
      setComplaints(data.map((c: any) => ({
        id: c.id,
        complainantName: c.complainant_name,
        type: c.complaint_type,
        source: c.source,
        date: c.complaint_date,
        description: c.description,
        status: c.status || 'Pending'
      })));
    }
  };

  const handleSaveEnquiry = async () => {
    if (!newEnquiry.name || !newEnquiry.mobile) return;
    if (!supabase) return;

    const enquiryData = {
      first_name: newEnquiry.name,
      surname: newEnquiry.surname,
      mobile: newEnquiry.mobile,
      email: newEnquiry.email,
      class_name: newEnquiry.class,
      gender: newEnquiry.gender,
      father_name: newEnquiry.fatherName,
      mother_name: newEnquiry.motherName,
      source: newEnquiry.source,
      enquiry_date: newEnquiry.date,
      address: newEnquiry.address,
      status: newEnquiry.status
    };

    if (editingEnquiry) {
      const { error } = await supabase
        .from('admission_enquiries')
        .update(enquiryData)
        .eq('id', editingEnquiry.id);
      if (!error) fetchEnquiries();
    } else {
      const { error } = await supabase
        .from('admission_enquiries')
        .insert([enquiryData]);
      if (!error) fetchEnquiries();
    }

    setShowAddEnquiry(false);
    setEditingEnquiry(null);
    setNewEnquiry({ status: 'Pending', date: new Date().toISOString().split('T')[0] });
  };

  const handleDeleteEnquiry = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('admission_enquiries').delete().eq('id', id);
    if (!error) fetchEnquiries();
  };

  const handleSaveVisitor = async () => {
    if (!newVisitor.name || !newVisitor.mobile) return;
    if (!supabase) return;

    const visitorData = {
      visitor_name: newVisitor.name,
      mobile: newVisitor.mobile,
      role: newVisitor.role,
      purpose: newVisitor.purpose,
      qualification: newVisitor.qualification,
      note: newVisitor.note,
      visit_date: newVisitor.date,
      in_time: newVisitor.inTime,
      out_time: newVisitor.outTime
    };

    if (editingVisitor) {
      const { error } = await supabase
        .from('visitor_book')
        .update(visitorData)
        .eq('id', editingVisitor.id);
      if (!error) fetchVisitors();
    } else {
      const { error } = await supabase
        .from('visitor_book')
        .insert([visitorData]);
      if (!error) fetchVisitors();
    }

    setEditingVisitor(null);
    setNewVisitor({
      date: new Date().toISOString().split('T')[0],
      inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      role: 'Other'
    });
  };

  const handleDeleteVisitor = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('visitor_book').delete().eq('id', id);
    if (!error) fetchVisitors();
  };

  const handleSaveComplaint = async () => {
    if (!newComplaint.complainantName || !newComplaint.description) return;
    if (!supabase) return;

    const complaintData = {
      complainant_name: newComplaint.complainantName,
      complaint_type: newComplaint.type,
      source: newComplaint.source,
      complaint_date: newComplaint.date,
      description: newComplaint.description,
      status: newComplaint.status
    };

    if (editingComplaint) {
      const { error } = await supabase
        .from('complaints')
        .update(complaintData)
        .eq('id', editingComplaint.id);
      if (!error) fetchComplaints();
    } else {
      const { error } = await supabase
        .from('complaints')
        .insert([complaintData]);
      if (!error) fetchComplaints();
    }

    setEditingComplaint(null);
    setNewComplaint({
      date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    });
  };

  const handleDeleteComplaint = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('complaints').delete().eq('id', id);
    if (!error) fetchComplaints();
  };

  const handleApproveForAdmission = (enquiry: AdmissionEnquiry) => {
    setFormData({
      name: enquiry.name,
      surname: enquiry.surname,
      mobile: enquiry.mobile,
      email: enquiry.email,
      class: enquiry.class,
      fatherName: enquiry.fatherName,
      motherName: enquiry.motherName,
      address: enquiry.address,
      gender: enquiry.gender,
      fatherMobile: enquiry.mobile 
    });
    setView('register-student');
  };

  const handlePrintSlip = (data: any, type: 'enquiry' | 'visitor') => {
    setPrintData({ ...data, type });
    setIsPrinting(true);
    
    // Use a timeout to ensure the print section is rendered
    setTimeout(() => {
      const printWindow = window.open('', '_blank', 'width=600,height=800');
      if (!printWindow) return;

      const content = document.getElementById('print-slip-content');
      if (!content) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Slip</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
              body { 
                font-family: 'Inter', sans-serif; 
                margin: 0; 
                padding: 10mm;
                line-height: 1.5;
              }
              .slip-container {
                border: 2px solid #e2e8f0;
                padding: 20px;
                border-radius: 12px;
                max-width: 100%;
              }
              .header {
                text-align: center;
                border-bottom: 2px solid #f1f5f9;
                padding-bottom: 15px;
                margin-bottom: 20px;
              }
              .title {
                font-size: 20px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                color: #0f172a;
              }
              .type-tag {
                display: inline-block;
                padding: 4px 12px;
                background: #f1f5f9;
                border-radius: 99px;
                font-size: 10px;
                font-weight: 800;
                color: #64748b;
                margin-top: 5px;
                text-transform: uppercase;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                font-size: 14px;
              }
              .label {
                font-weight: 700;
                color: #64748b;
              }
              .value {
                font-weight: 500;
                color: #0f172a;
              }
              .section-title {
                font-size: 12px;
                font-weight: 800;
                color: #64748b;
                text-transform: uppercase;
                margin: 20px 0 10px;
                border-bottom: 1px solid #f1f5f9;
                padding-bottom: 5px;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 10px;
                color: #94a3b8;
                border-top: 1px dashed #e2e8f0;
                padding-top: 15px;
              }
              @media print {
                body { padding: 0; }
                .slip-container { border: none; }
              }
            </style>
          </head>
          <body>
            ${content.innerHTML}
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      setIsPrinting(false);
      setPrintData(null);
    }, 100);
  };

  return (
    <div className="space-y-6">
      {/* Hidden Print Content */}
      <div id="print-slip-content" className="hidden">
        {printData && (
          <div className="slip-container">
            <div className="header">
              <div className="title">School Name</div>
              <div className="type-tag">{printData.type} Slip</div>
            </div>
            
            <div className="section-title">General Information</div>
            <div className="info-row">
              <span className="label">Date:</span>
              <span className="value">{printData.date}</span>
            </div>
            <div className="info-row">
              <span className="label">Name:</span>
              <span className="value">{printData.name || printData.complainantName || printData.visitor_name} {printData.surname || ''}</span>
            </div>
            <div className="info-row">
              <span className="label">Mobile:</span>
              <span className="value">{printData.mobile}</span>
            </div>

            {printData.type === 'enquiry' && (
              <>
                <div className="section-title">Enquiry Details</div>
                <div className="info-row">
                  <span className="label">Class:</span>
                  <span className="value">{printData.class}</span>
                </div>
                <div className="info-row">
                   <span className="label">Father Name:</span>
                   <span className="value">{printData.fatherName}</span>
                </div>
                {printData.address && (
                  <div className="info-row">
                    <span className="label">Address:</span>
                    <span className="value">{printData.address}</span>
                  </div>
                )}
              </>
            )}

            {printData.type === 'visitor' && (
              <>
                <div className="section-title">Visit Details</div>
                <div className="info-row">
                  <span className="label">Purpose:</span>
                  <span className="value">{printData.purpose}</span>
                </div>
                <div className="info-row">
                  <span className="label">Time IN:</span>
                  <span className="value">{printData.inTime}</span>
                </div>
                {printData.outTime && (
                  <div className="info-row">
                    <span className="label">Time OUT:</span>
                    <span className="value">{printData.outTime}</span>
                  </div>
                )}
              </>
            )}
            
            <div className="footer">
              <p>Generated by School Management System</p>
              <p>${new Date().toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-text-heading">Front Office</h2>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-2 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Total Enquiries</span>
              <span className="text-xl font-black text-primary">{enquiries.length}</span>
            </div>
            <div className="w-px h-8 bg-slate-100"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-text-sub uppercase tracking-widest">Visitors Today</span>
              <span className="text-xl font-black text-orange-600">{visitors.filter(v => v.date === new Date().toISOString().split('T')[0]).length}</span>
            </div>
          </div>
          <button 
            onClick={() => {
              setEditingEnquiry(null);
              setNewEnquiry({ status: 'Pending', date: new Date().toISOString().split('T')[0] });
              setShowAddEnquiry(true);
            }}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> New Enquiry
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'enquiry', label: 'Admission Enquiry', icon: UserPlus },
          { id: 'visitors', label: 'Visitor Book', icon: BookOpen },
          { id: 'complaints', label: 'Complaints', icon: AlertCircle }
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

      {activeTab === 'enquiry' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Date</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Student Name</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Mobile</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Class</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Status</th>
                  <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {enquiries.map((e: AdmissionEnquiry) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 text-sm text-text-sub">{e.date}</td>
                    <td className="py-4 text-sm font-bold text-text-heading">{e.name} {e.surname}</td>
                    <td className="py-4 text-sm text-text-sub">{e.mobile}</td>
                    <td className="py-4 text-sm text-text-sub">{e.class}</td>
                    <td className="py-4">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                        e.status === 'Closed' ? 'bg-slate-100 text-slate-700' : 
                        e.status === 'Follow-up' ? 'bg-orange-100 text-orange-700' : 
                        e.status === 'Approved' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {currentUser?.role === 'admin' && e.status !== 'Approved' && (
                          <button 
                            onClick={() => handleApproveForAdmission(e)}
                            className="text-[10px] font-black text-primary hover:underline uppercase"
                          >
                            Approve
                          </button>
                        )}
                        <button 
                          onClick={() => handlePrintSlip(e, 'enquiry')}
                          className="p-2 hover:bg-slate-100 rounded-lg text-text-sub transition-colors"
                          title="Print Enquiry Slip"
                        >
                          <Printer size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingEnquiry(e);
                            setNewEnquiry(e);
                            setShowAddEnquiry(true);
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg text-text-sub transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteEnquiry(e.id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
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

      {activeTab === 'visitors' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 p-6">
            <h3 className="text-lg font-bold mb-6">{editingVisitor ? 'Edit Visitor' : 'Add Visitor'}</h3>
            <div className="space-y-4">
              <Input label="Visitor Name" value={newVisitor.name} onChange={(e: any) => setNewVisitor({...newVisitor, name: e.target.value})} />
              <Input label="Mobile" value={newVisitor.mobile} onChange={(e: any) => setNewVisitor({...newVisitor, mobile: e.target.value})} />
              <Select 
                label="Role" 
                options={['Parent', 'Guardian', 'Vendor', 'Other']} 
                value={newVisitor.role} 
                onChange={(e: any) => setNewVisitor({...newVisitor, role: e.target.value})} 
              />
              <Input label="Purpose" value={newVisitor.purpose} onChange={(e: any) => setNewVisitor({...newVisitor, purpose: e.target.value})} />
              <Input label="Qualification" value={newVisitor.qualification} onChange={(e: any) => setNewVisitor({...newVisitor, qualification: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Date" type="date" value={newVisitor.date} onChange={(e: any) => setNewVisitor({...newVisitor, date: e.target.value})} />
                <Input label="In Time" type="time" value={newVisitor.inTime} onChange={(e: any) => setNewVisitor({...newVisitor, inTime: e.target.value})} />
              </div>
              <Input label="Out Time" type="time" value={newVisitor.outTime || ''} onChange={(e: any) => setNewVisitor({...newVisitor, outTime: e.target.value})} />
              <div className="w-full">
                <label className="label-text">Note / Remarks</label>
                <textarea 
                  className="input-field min-h-[80px]" 
                  value={newVisitor.note}
                  onChange={(e: any) => setNewVisitor({...newVisitor, note: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                {editingVisitor && (
                  <button onClick={() => {
                    setEditingVisitor(null);
                    setNewVisitor({
                      date: new Date().toISOString().split('T')[0],
                      inTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                      role: 'Other'
                    });
                  }} className="flex-1 py-3 font-bold text-text-sub hover:bg-slate-50 rounded-xl">Cancel</button>
                )}
                <button 
                  onClick={handleSaveVisitor}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {editingVisitor ? 'Update Visitor' : 'Save Visitor'}
                </button>
              </div>
            </div>
          </Card>
          <Card className="md:col-span-2 p-6">
            <h3 className="text-lg font-bold mb-6">Visitor List</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Date</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Name</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Purpose</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">In/Out</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visitors.map((v: Visitor) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-sm text-text-sub">{v.date}</td>
                      <td className="py-4 text-sm font-bold text-text-heading">{v.name}</td>
                      <td className="py-4 text-sm text-text-sub">{v.purpose}</td>
                      <td className="py-4 text-sm text-text-sub">{v.inTime} - {v.outTime || '--:--'}</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!v.outTime && (
                            <button 
                              onClick={async () => {
                                if (!supabase) return;
                                const outTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                await supabase.from('visitor_book').update({ out_time: outTime }).eq('id', v.id);
                                fetchVisitors();
                              }}
                              className="text-[10px] font-black text-primary hover:underline uppercase"
                            >
                              Mark Out
                            </button>
                          )}
                          <button 
                            onClick={() => handlePrintSlip(v, 'visitor')}
                            className="p-2 hover:bg-slate-100 rounded-lg text-text-sub transition-colors"
                            title="Print Visitor Pass"
                          >
                            <Printer size={14} />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingVisitor(v);
                              setNewVisitor(v);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-text-sub transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteVisitor(v.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 p-6">
            <h3 className="text-lg font-bold mb-6">{editingComplaint ? 'Edit Complaint' : 'Add Complaint'}</h3>
            <div className="space-y-4">
              <Input label="Complainant Name" value={newComplaint.complainantName} onChange={(e: any) => setNewComplaint({...newComplaint, complainantName: e.target.value})} />
              <Input label="Complaint Type" value={newComplaint.type} onChange={(e: any) => setNewComplaint({...newComplaint, type: e.target.value})} />
              <Input label="Source" value={newComplaint.source} onChange={(e: any) => setNewComplaint({...newComplaint, source: e.target.value})} />
              <Input label="Date" type="date" value={newComplaint.date} onChange={(e: any) => setNewComplaint({...newComplaint, date: e.target.value})} />
              <div className="w-full">
                <label className="label-text">Description</label>
                <textarea 
                  className="input-field min-h-[100px]" 
                  value={newComplaint.description}
                  onChange={(e: any) => setNewComplaint({...newComplaint, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                {editingComplaint && (
                  <button onClick={() => {
                    setEditingComplaint(null);
                    setNewComplaint({
                      date: new Date().toISOString().split('T')[0],
                      status: 'Pending'
                    });
                  }} className="flex-1 py-3 font-bold text-text-sub hover:bg-slate-50 rounded-xl">Cancel</button>
                )}
                <button 
                  onClick={handleSaveComplaint}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  <Save size={18} /> {editingComplaint ? 'Update Complaint' : 'Save Complaint'}
                </button>
              </div>
            </div>
          </Card>
          <Card className="md:col-span-2 p-6">
            <h3 className="text-lg font-bold mb-6">Complaint List</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Date</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Name</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Type</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider">Status</th>
                    <th className="pb-4 font-bold text-xs uppercase text-text-secondary tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {complaints.map((c: Complaint) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-sm text-text-sub">{c.date}</td>
                      <td className="py-4 text-sm font-bold text-text-heading">{c.complainantName}</td>
                      <td className="py-4 text-sm text-text-sub">{c.type}</td>
                      <td className="py-4">
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${
                          c.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {c.status === 'Pending' && (
                            <button 
                              onClick={async () => {
                                if (!supabase) return;
                                await supabase.from('complaints').update({ status: 'Resolved' }).eq('id', c.id);
                                fetchComplaints();
                              }}
                              className="text-[10px] font-black text-primary hover:underline uppercase"
                            >
                              Resolve
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setEditingComplaint(c);
                              setNewComplaint(c);
                            }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-text-sub transition-colors"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteComplaint(c.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Add Enquiry Modal */}
      <AnimatePresence>
        {showAddEnquiry && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-text-heading">{editingEnquiry ? 'Edit Admission Enquiry' : 'New Admission Enquiry'}</h3>
                <button onClick={() => setShowAddEnquiry(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="First Name" required value={newEnquiry.name} onChange={(e: any) => setNewEnquiry({...newEnquiry, name: e.target.value})} />
                <Input label="Surname" value={newEnquiry.surname} onChange={(e: any) => setNewEnquiry({...newEnquiry, surname: e.target.value})} />
                <Input label="Mobile" required value={newEnquiry.mobile} onChange={(e: any) => setNewEnquiry({...newEnquiry, mobile: e.target.value})} />
                <Input label="Email" value={newEnquiry.email} onChange={(e: any) => setNewEnquiry({...newEnquiry, email: e.target.value})} />
                <Select 
                  label="Class" 
                  options={masterData.classes} 
                  value={newEnquiry.class} 
                  onChange={(e: any) => setNewEnquiry({...newEnquiry, class: e.target.value})} 
                />
                <Select 
                  label="Gender" 
                  options={masterData.genders} 
                  value={newEnquiry.gender} 
                  onChange={(e: any) => setNewEnquiry({...newEnquiry, gender: e.target.value})} 
                />
                <Input label="Father's Name" value={newEnquiry.fatherName} onChange={(e: any) => setNewEnquiry({...newEnquiry, fatherName: e.target.value})} />
                <Input label="Mother's Name" value={newEnquiry.motherName} onChange={(e: any) => setNewEnquiry({...newEnquiry, motherName: e.target.value})} />
                <Input label="Source" placeholder="e.g. Website, Newspaper" value={newEnquiry.source} onChange={(e: any) => setNewEnquiry({...newEnquiry, source: e.target.value})} />
                <Input label="Date" type="date" value={newEnquiry.date} onChange={(e: any) => setNewEnquiry({...newEnquiry, date: e.target.value})} />
                <div className="md:col-span-2">
                  <label className="label-text">Address</label>
                  <textarea 
                    className="input-field min-h-[80px]" 
                    value={newEnquiry.address}
                    onChange={(e: any) => setNewEnquiry({...newEnquiry, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowAddEnquiry(false)} className="flex-1 py-4 font-bold text-text-sub hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button onClick={handleSaveEnquiry} className="flex-1 btn-primary py-4">Save Enquiry</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
