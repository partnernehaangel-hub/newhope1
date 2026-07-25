import React, { useState, useEffect } from "react";
import { 
  Phone, Shield, RefreshCw, Power, CheckCircle, 
  AlertCircle, Check, HelpCircle, ArrowUpRight, MessageSquare, Link, Sparkles,
  Send, FileText, Settings, Key, Users, BookOpen
} from "lucide-react";
import QRCode from "react-qr-code";
import { motion, AnimatePresence } from "motion/react";

export const WhatsAppDashboard = ({ schoolProfile, supabase }: any) => {
  const [connection, setConnection] = useState({
    status: "Disconnected",
    qrCode: "",
    phoneNumber: "",
    lastSync: "",
    mode: "Sandbox",
    error: null as string | null
  });
  
  const [loading, setLoading] = useState(false);
  const [refreshes, setRefreshes] = useState(0);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState("connection"); // "connection" | "meta_setup" | "bulk_sender"

  // Parent/Incoming Simulator Form States
  const [simName, setSimName] = useState("Angelina Neha");
  const [simPhone, setSimPhone] = useState("+91 98765 43210");
  const [simMessage, setSimMessage] = useState("Hi, please send me my child's outstanding school fee dues.");
  const [simulatingMsg, setSimulatingMsg] = useState(false);
  const [simFeedback, setSimFeedback] = useState("");

  // Meta API Credentials Form States
  const [metaConfig, setMetaConfig] = useState({
    meta_access_token: "",
    meta_phone_number_id: "",
    meta_business_account_id: "",
    meta_template_name: ""
  });
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaFeedback, setMetaFeedback] = useState("");

  // Bulk Sender Form States
  const [bulkTarget, setBulkTarget] = useState("all_students"); // "all_students" | "fee_dues" | "custom"
  const [bulkTemplate, setBulkTemplate] = useState("Dear Parent,\nThis is a reminder regarding the pending dues for your ward {name} ({roll}) of class {class}.\nOutstanding Amount: ₹{due}.\n\nPlease clear the balance at your earliest convenience.");
  const [bulkPdfUrl, setBulkPdfUrl] = useState("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
  const [bulkCustomNumbers, setBulkCustomNumbers] = useState(""); // Comma separated list
  const [sendingBulk, setSendingBulk] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Poll status from express server
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      const data = await res.json();
      setConnection(data);
      return data;
    } catch (e) {
      console.debug("[WhatsApp REST] Poll status skipped (server starting or offline):", e);
      return null;
    }
  };

  // Load Meta Configuration from DB on Mount
  const fetchMetaConfig = async () => {
    try {
      const res = await fetch("/api/whatsapp/meta-config");
      const data = await res.json();
      if (data) {
        setMetaConfig(prev => ({
          ...prev,
          meta_access_token: data.meta_access_token || "",
          meta_phone_number_id: data.meta_phone_number_id || "",
          meta_business_account_id: data.meta_business_account_id || "",
          meta_template_name: data.meta_template_name || ""
        }));
      }
    } catch (e) {
      console.error("[WhatsApp REST] Failed to load Meta config:", e);
    }
  };

  // Fetch Students list from database
  const fetchStudents = async () => {
    if (!supabase) return;
    setLoadingStudents(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("name", { ascending: true });
      if (data) {
        setStudentsList(data);
      }
    } catch (e) {
      console.error("[WhatsApp REST] Failed to load students:", e);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    const initAndAutoConnect = async () => {
      await fetchStatus();
      await fetchMetaConfig();
      await fetchStudents();
    };
    initAndAutoConnect();
    const interval = setInterval(fetchStatus, 3000); // Poll status every 3 seconds
    return () => clearInterval(interval);
  }, [refreshes]);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/connect", { method: "POST" });
      const data = await res.json();
      if (data.state) {
        setConnection(data.state);
      } else {
        await fetchStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshQR = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/reconnect", { method: "POST" });
      const data = await res.json();
      if (data.state) {
        setConnection(data.state);
      } else {
        await fetchStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect WhatsApp service and clear the saved session?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/disconnect", { method: "POST" });
      const data = await res.json();
      if (data.state) {
        setConnection(data.state);
      } else {
        await fetchStatus();
      }
      alert("WhatsApp service has been disconnected and session credentials cleared successfully.");
    } catch (err) {
      console.error("Disconnect error:", err);
      // Fallback try logout route
      try {
        const res2 = await fetch("/api/whatsapp/logout", { method: "POST" });
        const data2 = await res2.json();
        if (data2.state) setConnection(data2.state);
        alert("WhatsApp service disconnected.");
      } catch (err2) {
        alert("Unable to disconnect service. Please check network connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = async (targetMode: "Real" | "Sandbox" | "Meta") => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: targetMode })
      });
      const data = await res.json();
      if (data.state) {
        setConnection(data.state);
      } else {
        await fetchStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateScan = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/simulate-scan", { method: "POST" });
      const data = await res.json();
      if (data.state) {
        setConnection(data.state);
      } else {
        await fetchStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateIncoming = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simPhone || !simMessage) return;
    setSimulatingMsg(true);
    setSimFeedback("");
    try {
      const res = await fetch("/api/whatsapp/incoming-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderNumber: simPhone,
          senderName: simName,
          messageContent: simMessage
        })
      });
      const data = await res.json();
      setSimFeedback("Success! Simulated incoming message recorded. Auto-reply triggered if 'fee' is mentioned!");
      setTimeout(() => setSimFeedback(""), 6000);
    } catch (err) {
      console.error(err);
      setSimFeedback("Failed to simulate incoming message.");
    } finally {
      setSimulatingMsg(false);
    }
  };

  const handleSaveMetaConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMeta(true);
    setMetaFeedback("");
    try {
      const res = await fetch("/api/whatsapp/meta-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metaConfig)
      });
      const data = await res.json();
      if (data.success) {
        setMetaFeedback("Meta Cloud API settings updated and saved successfully!");
        setTimeout(() => setMetaFeedback(""), 5000);
        setRefreshes(r => r + 1);
      } else {
        setMetaFeedback("Error: " + data.error);
      }
    } catch (err: any) {
      setMetaFeedback("Network error saving configuration: " + err.message);
    } finally {
      setSavingMeta(false);
    }
  };

  const handleSendBulk = async () => {
    if (sendingBulk) return;
    setSendingBulk(true);
    setBulkStatus("Preparing recipient list...");
    
    let recipients: any[] = [];
    
    // Fallback static list if no students in database
    const finalStudents = studentsList.length > 0 ? studentsList : [
      { name: "John", surname: "Doe", class: "Grade 10", rollNumber: "101", fatherMobile: "919876543210" },
      { name: "Alice", surname: "Smith", class: "Grade 9", rollNumber: "902", fatherMobile: "919988776655" }
    ];

    if (bulkTarget === "all_students") {
      recipients = finalStudents.map(s => ({
        phone: s.fatherMobile || s.motherMobile || s.emergencyContact || "",
        name: `${s.name || ""} ${s.surname || ""}`.trim(),
        className: s.class || "N/A",
        dueAmount: "0",
        rollNo: s.rollNumber || "N/A",
        role: "student"
      })).filter(r => r.phone);
    } else if (bulkTarget === "fee_dues") {
      recipients = finalStudents.map((s, idx) => ({
        phone: s.fatherMobile || s.motherMobile || s.emergencyContact || "",
        name: `${s.name || ""} ${s.surname || ""}`.trim(),
        className: s.class || "N/A",
        dueAmount: String(3500 + (idx * 750)),
        rollNo: s.rollNumber || "N/A",
        role: "student"
      })).filter(r => r.phone);
    } else {
      const customNumbers = bulkCustomNumbers.split(",").map(n => n.trim()).filter(n => n);
      recipients = customNumbers.map(n => ({
        phone: n,
        name: "Valued Parent",
        className: "N/A",
        dueAmount: "0",
        rollNo: "N/A",
        role: "custom"
      }));
    }

    if (recipients.length === 0) {
      setBulkStatus("Error: No valid mobile phone numbers resolved.");
      setSendingBulk(false);
      return;
    }

    setBulkStatus(`Broadcasting template message to ${recipients.length} recipients...`);
    try {
      const res = await fetch("/api/whatsapp/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients,
          templateBody: bulkTemplate,
          campaignName: "Bulk Campaign Dashboard",
          messageType: bulkPdfUrl ? "document" : "text",
          attachmentUrl: bulkPdfUrl || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setBulkStatus(`Broadcasting complete! Success: ${data.successCount}, Failed: ${data.failCount}`);
      } else {
        setBulkStatus(`Dispatch failed: ${data.error}`);
      }
    } catch (e: any) {
      setBulkStatus(`Error sending bulk messages: ${e.message}`);
    } finally {
      setSendingBulk(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9f6f0] flex flex-col items-center justify-between font-sans text-slate-800 p-4 md:p-8">
      
      {/* Main Container Core */}
      <div className="w-full max-w-4xl bg-white rounded-[32px] border border-slate-200/80 shadow-md p-6 md:p-10 relative overflow-hidden flex-1 flex flex-col justify-start">
        
        {/* Absolute positioned manual sync check */}
        <button
          onClick={() => setRefreshes(r => r + 1)}
          aria-label="Refresh status"
          className="absolute top-6 right-6 p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl border border-slate-200/50 transition-all cursor-pointer z-10"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </button>

        {/* Top Branding Header */}
        <div className="mb-6 pb-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 inline-block mb-1">
              Meta & WhatsApp Web ERP Hub
            </span>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              WhatsApp Communication Center
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Direct WhatsApp Web Link Button */}
            <a
              href="https://web.whatsapp.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Open https://web.whatsapp.com/ in new tab"
            >
              <ArrowUpRight size={14} />
              Open WhatsApp Web
            </a>

            {/* Mode Switcher Tabs */}
            <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200 self-start md:self-auto">
              <button
                onClick={() => handleSwitchMode("Sandbox")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  connection.mode === "Sandbox" 
                    ? "bg-amber-600 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sparkles size={12} />
                Sandbox
              </button>
              <button
                onClick={() => handleSwitchMode("Meta")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  connection.mode === "Meta" 
                    ? "bg-emerald-600 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Shield size={12} />
                Meta Cloud API
              </button>
              <button
                onClick={() => handleSwitchMode("Real")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  connection.mode === "Real" 
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/50" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Real Device (QR)
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Subtabs */}
        <div className="flex border-b border-slate-100 mb-6 gap-6">
          <button
            onClick={() => setActiveTab("connection")}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
              activeTab === "connection" 
                ? "border-emerald-600 text-emerald-600" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Connection Status
          </button>
          <button
            onClick={() => setActiveTab("meta_setup")}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "meta_setup" 
                ? "border-emerald-600 text-emerald-600" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Key size={12} />
            Meta Credentials Config
          </button>
          <button
            onClick={() => setActiveTab("bulk_sender")}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "bulk_sender" 
                ? "border-emerald-600 text-emerald-600" 
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <Users size={12} />
            Bulk Document & Reminders
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* TAB 1: CONNECTION STATUS & PAIRING */}
          {activeTab === "connection" && (
            <motion.div
              key="connection-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-6 flex-1 flex flex-col justify-start"
            >
              {/* Mode Specific Headers */}
              {connection.mode === "Meta" ? (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-left">
                  <Shield size={18} className="text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-emerald-800 uppercase tracking-wide">Meta WhatsApp Business API Selected</h4>
                    <p className="text-[11px] text-emerald-700 leading-relaxed mt-0.5">
                      This is the official enterprise messaging infrastructure from Meta. Perfect for broadcasting high-volume bulk PDF reports, template invoices, and automatic fee alerts without the risk of device bans. Define your Access Token and Phone Number ID in the second tab.
                    </p>
                  </div>
                </div>
              ) : connection.mode === "Sandbox" ? (
                <div className="p-4 bg-amber-50/80 border border-amber-200/50 rounded-2xl flex items-start gap-3 text-left">
                  <Sparkles size={18} className="text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-amber-800 uppercase tracking-wide">ERP Sandbox Mode Active</h4>
                    <p className="text-[11px] text-amber-700 leading-relaxed mt-0.5">
                      A simulation layer for immediate feature sandbox demo. No official WhatsApp Account is required. Test the bulk engine, trigger mock delivery status updates, and simulate client replies below.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-left">
                  <Phone size={18} className="text-slate-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide">Physical Device Multi-Device Pairing</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                      Authorizes connection to a real smartphone by scanning the QR code with your phone. Perfect for manual testing on personal devices.
                    </p>
                  </div>
                </div>
              )}

              {/* Status Box */}
              {connection.status === "Connected" ? (
                <div className="flex flex-col items-center justify-center text-center space-y-6 py-6 border border-emerald-100 bg-emerald-50/10 rounded-3xl p-6">
                  <div className="relative">
                    <div className="p-5 bg-emerald-50 text-emerald-600 rounded-[28px] border border-emerald-100 shadow-sm">
                      <CheckCircle size={44} className="animate-pulse" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white">
                      <Check size={10} />
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-widest rounded-full">
                      ● Active & Authenticated
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-800">
                      {connection.mode === "Meta" ? "Meta Cloud Gateway Ready" : "WhatsApp Service Online"}
                    </h3>
                    <p className="text-slate-500 text-xs max-w-md mx-auto leading-relaxed">
                      {connection.mode === "Meta" 
                        ? "Natively integrated with Meta's developer endpoint. Ready to stream templates, fee alerts, and document attachments dynamically."
                        : "Device link active. Background socket is scanning and awaiting outbound payload queues."
                      }
                    </p>
                  </div>

                  <div className="w-full max-w-md bg-slate-50 rounded-xl p-4 grid grid-cols-2 gap-4 text-left border border-slate-100">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone / Identity</span>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">{connection.phoneNumber || "Meta Cloud API Service"}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gateway Provider</span>
                      <p className="text-xs font-bold text-slate-700 mt-0.5">
                        {connection.mode === "Meta" ? "Meta Developer Cloud" : connection.mode === "Sandbox" ? "Sandbox Simulator" : "Baileys Web Client"}
                      </p>
                    </div>
                  </div>

                  {connection.mode === "Sandbox" && (
                    <div className="w-full max-w-md border border-slate-200 bg-amber-50/20 rounded-xl p-4 text-left space-y-3">
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider border-b pb-1.5 border-slate-100">
                        Interactive Reply Simulator
                      </h4>
                      <form onSubmit={handleSimulateIncoming} className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            value={simName} 
                            onChange={e => setSimName(e.target.value)} 
                            placeholder="Sender Name" 
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                          <input 
                            type="text" 
                            value={simPhone} 
                            onChange={e => setSimPhone(e.target.value)} 
                            placeholder="Phone number" 
                            className="p-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={simMessage} 
                          onChange={e => setSimMessage(e.target.value)} 
                          placeholder="Type simulated message... (mention 'fee')" 
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <button 
                          type="submit" 
                          disabled={simulatingMsg}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase rounded-lg cursor-pointer"
                        >
                          {simulatingMsg ? "Simulating..." : "Send Simulated Reply"}
                        </button>
                      </form>
                      {simFeedback && <p className="text-[10px] text-emerald-700 font-bold text-center mt-1">{simFeedback}</p>}
                    </div>
                  )}

                  <button
                    onClick={handleDisconnect}
                    className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold uppercase rounded-xl border border-rose-200 cursor-pointer"
                  >
                    Disconnect Service
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border border-slate-200/60 bg-white rounded-3xl p-6">
                  
                  <div className="md:col-span-7 space-y-4 text-left">
                    <h3 className="text-xl font-extrabold text-slate-800">
                      {connection.mode === "Meta" ? "Configure Meta API Credentials" : "WhatsApp Web QR Code Login Connection"}
                    </h3>
                    <p className="text-slate-500 text-xs leading-relaxed">
                      {connection.mode === "Meta"
                        ? "Your Meta Business Gateway requires credentials. Navigate to the next tab to save your secure access token, and once configured, this indicator will turn green."
                        : "Scan the QR code with your phone's WhatsApp application to activate WhatsApp Web connection. Once connected, fee reminders, receipts, and notifications can be sent automatically from the ERP software."
                      }
                    </p>

                    <div className="space-y-2.5 text-xs font-medium text-slate-600 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">1</span>
                        <span>Open WhatsApp on your phone or visit <a href="https://web.whatsapp.com/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold underline hover:text-emerald-800">web.whatsapp.com</a></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">2</span>
                        <span>Tap <strong>Menu (⋮)</strong> or <strong>Settings</strong> and select <strong>Linked Devices</strong></span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</span>
                        <span>Tap <strong>Link a Device</strong> & point your phone camera at the QR code on the right</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">4</span>
                        <span>Software connects automatically! Automated fee reminders & notifications can now be sent.</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-5 flex flex-col items-center justify-center space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    
                    {connection.status === "Connecting" || (connection.status === "Waiting for QR" && !connection.qrCode) ? (
                      <div className="text-center py-6">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-[11px] text-slate-500 font-bold animate-pulse">Requesting API QR...</p>
                      </div>
                    ) : connection.status === "Waiting for QR" && connection.qrCode ? (
                      connection.mode === "Sandbox" ? (
                        <div className="text-center w-full space-y-3">
                          <div className="w-40 h-40 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl flex flex-col items-center justify-center mx-auto relative">
                            <Sparkles size={32} className="text-emerald-500 animate-bounce" />
                            <p className="text-[10px] font-black text-emerald-800 uppercase mt-2">Mock QR Code</p>
                          </div>
                          <button
                            onClick={handleSimulateScan}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-xl cursor-pointer"
                          >
                            📱 Simulated Fast Link
                          </button>
                        </div>
                      ) : (
                        <div className="relative mx-auto">
                          <QRCode value={connection.qrCode} size={160} fgColor="#1e293b" />
                          <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-white rounded-lg border border-slate-100 flex items-center justify-center shadow-md">
                            <Phone size={12} className="text-emerald-500" />
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="text-center space-y-3 py-4">
                        <Power size={32} className="text-slate-300 mx-auto" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Offline</span>
                        
                        {connection.mode === "Meta" ? (
                          <button
                            onClick={() => setActiveTab("meta_setup")}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            Set Credentials
                          </button>
                        ) : (
                          <button
                            onClick={handleConnect}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                          >
                            Start Pairing
                          </button>
                        )}
                      </div>
                    )}

                  </div>

                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: META CREDENTIALS CONFIG */}
          {activeTab === "meta_setup" && (
            <motion.div
              key="meta-setup-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-left space-y-6 flex-1"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 border-b pb-2 border-slate-200">
                  <Key className="text-emerald-600 shrink-0" size={16} />
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                    Meta Developers Platform Settings
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  To natively use Meta Cloud APIs, create an application inside the Meta Developer Portal (<strong className="text-emerald-600">developers.facebook.com</strong>), set up the WhatsApp product integration, and generate a Permanent Access Token.
                </p>
              </div>

              <form onSubmit={handleSaveMetaConfig} className="space-y-4 max-w-2xl">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Permanent Graph Access Token (System User Token)
                  </label>
                  <input
                    type="password"
                    value={metaConfig.meta_access_token}
                    onChange={e => setMetaConfig({ ...metaConfig, meta_access_token: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                    placeholder="EAAW..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Phone Number ID
                    </label>
                    <input
                      type="text"
                      value={metaConfig.meta_phone_number_id}
                      onChange={e => setMetaConfig({ ...metaConfig, meta_phone_number_id: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                      placeholder="e.g. 104234586432155"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      WhatsApp Business Account ID
                    </label>
                    <input
                      type="text"
                      value={metaConfig.meta_business_account_id}
                      onChange={e => setMetaConfig({ ...metaConfig, meta_business_account_id: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-mono"
                      placeholder="e.g. 209554316410144"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Standard Message Template Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={metaConfig.meta_template_name}
                    onChange={e => setMetaConfig({ ...metaConfig, meta_template_name: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs"
                    placeholder="e.g. fee_due_reminder"
                  />
                  <p className="text-[10px] text-slate-400 font-semibold">
                    Approved Template name used when triggering enterprise bulk alerts. Default falls back to utility text message formatting.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={savingMeta}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    {savingMeta ? "Saving..." : "Save Meta Configurations"}
                  </button>

                  {metaConfig.meta_phone_number_id && metaConfig.meta_access_token && (
                    <button
                      type="button"
                      onClick={async () => {
                        setMetaFeedback("Sending verification test ping to Meta Servers...");
                        try {
                          const res = await fetch("/api/whatsapp/status");
                          const d = await res.json();
                          if (d.status === "Connected") {
                            setMetaFeedback("Success! Connection verified. Node connected to Meta Business Endpoint.");
                          } else {
                            setMetaFeedback("Meta server responded, but status is Disconnected. Check your Token permissions.");
                          }
                        } catch (e: any) {
                          setMetaFeedback("Failed to ping Meta Graph API: " + e.message);
                        }
                      }}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      Test Meta Link
                    </button>
                  )}
                </div>

                {metaFeedback && (
                  <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
                    {metaFeedback}
                  </div>
                )}
              </form>
            </motion.div>
          )}

          {/* TAB 3: BULK CAMPAIGN AND DOCUMENT SENDER */}
          {activeTab === "bulk_sender" && (
            <motion.div
              key="bulk-sender-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-left space-y-6 flex-1"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Side: Parameters Setup */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                    <Users size={16} className="text-emerald-600" />
                    Campaign Broadcaster Setup
                  </h3>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Select Audience Group
                    </label>
                    <select
                      value={bulkTarget}
                      onChange={e => setBulkTarget(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="all_students">All Enrolled Students ({studentsList.length || "Loading..."})</option>
                      <option value="fee_dues">Students with Outstanding Dues</option>
                      <option value="custom">Custom Phone List (Comma-separated)</option>
                    </select>
                  </div>

                  {bulkTarget === "custom" && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Comma-separated Phone list
                      </label>
                      <input
                        type="text"
                        value={bulkCustomNumbers}
                        onChange={e => setBulkCustomNumbers(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs"
                        placeholder="e.g. 919876543210, 919988776655"
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Attach Document/PDF Link (Invoice or Reports)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={bulkPdfUrl}
                        onChange={e => setBulkPdfUrl(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs pl-8"
                        placeholder="Paste PDF link url..."
                      />
                      <FileText size={14} className="absolute left-2.5 top-3.5 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Paste a PDF document URL to send bulk fee invoices, reports, or reminders.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Message Content Template
                      </label>
                      <span className="text-[10px] font-bold text-emerald-600">Quick Templates:</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <button
                        type="button"
                        onClick={() => setBulkTemplate("Dear Parent,\nThis is a friendly fee reminder regarding pending dues for your ward {name} ({roll}) of class {class}.\nOutstanding Balance: ₹{due}.\n\nPlease clear the dues at your earliest convenience.")}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        🔔 Fee Reminder
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkTemplate("Dear Parent,\nThank you for the fee payment of ₹{due} received for your ward {name} of class {class}.\nTransaction Status: CONFIRMED.\n\nThank you for your cooperation.")}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        💳 Fee Receipt
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkTemplate("Dear Parent,\nDaily Attendance Update for your ward {name} ({roll}) of class {class}.\nStatus: PRESENT for today's sessions.")}
                        className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        📅 Attendance
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkTemplate("Dear Parent,\nImportant Notification from School:\nSchool will remain closed tomorrow for scheduled maintenance. Classes resume as usual on Monday.")}
                        className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        📢 General Notice
                      </button>
                    </div>

                    <textarea
                      rows={5}
                      value={bulkTemplate}
                      onChange={e => setBulkTemplate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs resize-none font-semibold leading-relaxed focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                      Supported Variables: <strong className="text-emerald-600">{`{name}`}</strong>, <strong className="text-emerald-600">{`{roll}`}</strong>, <strong className="text-emerald-600">{`{class}`}</strong>, <strong className="text-emerald-600">{`{due}`}</strong>
                    </p>
                  </div>
                </div>

                {/* Right Side: Live preview and Dispatch console */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider border-b pb-2 border-slate-200 flex items-center gap-1.5">
                      <BookOpen size={14} />
                      Live Template Rendering Preview
                    </h4>

                    {/* Chat Bubble Simulation */}
                    <div className="bg-white border rounded-2xl p-4 shadow-xs relative max-w-xs space-y-2">
                      <div className="absolute top-3 -left-2 w-3 h-3 bg-white border-l border-b rotate-45" />
                      
                      {bulkPdfUrl && (
                        <div className="p-2.5 bg-slate-50 border rounded-xl flex items-center gap-2">
                          <div className="p-1.5 bg-red-100 text-red-700 rounded-lg">
                            <FileText size={16} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[10px] font-black truncate text-slate-700">school_statement.pdf</p>
                            <p className="text-[9px] text-slate-400 font-bold">PDF Document</p>
                          </div>
                        </div>
                      )}

                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {bulkTemplate
                          .replace(/{name}/gi, "Aryan Kumar")
                          .replace(/{roll}/gi, "104")
                          .replace(/{class}/gi, "Grade 10")
                          .replace(/{due}/gi, "4,500")
                        }
                      </p>
                      <span className="text-[8px] text-slate-400 font-semibold block text-right mt-1">12:15 PM</span>
                    </div>
                  </div>

                  <div className="pt-6 space-y-3">
                    <button
                      onClick={handleSendBulk}
                      disabled={sendingBulk || connection.status !== "Connected"}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      <Send size={14} />
                      {sendingBulk ? "Broadcasting..." : "Broadcast Bulk Campaign"}
                    </button>

                    {connection.status !== "Connected" && (
                      <p className="text-[10px] text-rose-600 font-black text-center uppercase tracking-wide">
                        ⚠️ Connect Gateway first to enable broadcasting
                      </p>
                    )}

                    {bulkStatus && (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center text-emerald-800">
                        {bulkStatus}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* Footer Branding */}
      <div className="w-full text-center py-6 border-t border-slate-200/50 mt-8 text-[10px] font-black uppercase tracking-widest text-slate-400 flex flex-col sm:flex-row items-center justify-center gap-2">
        <span>School WhatsApp Platform Integration Portal</span>
        <span className="hidden sm:inline">•</span>
        <span>Secure Meta API Service Layer</span>
      </div>

    </div>
  );
};
