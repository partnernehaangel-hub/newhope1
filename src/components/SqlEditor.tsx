import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-sql';
import 'prismjs/themes/prism.css';
import { Save, Share2, Play, Trash2, Plus, Copy, CheckCircle2, UserCog, Key, Shield, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

interface SqlSnippet {
  id: string;
  title: string;
  code: string;
  created_at: string;
}

export const SqlEditor: React.FC = () => {
  const [code, setCode] = useState<string>(`-- Comprehensive fix for students table schema
-- This adds missing columns like roll_number, student_id, etc.

ALTER TABLE students ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS roll_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS residential_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS caste TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_name TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_mobile TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_income TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS father_income_source TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_income TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS mother_income_source TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS local_guardian_contact TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_type TEXT DEFAULT 'Old';
ALTER TABLE students ADD COLUMN IF NOT EXISTS allergy TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS has_disability BOOLEAN DEFAULT FALSE;
ALTER TABLE students ADD COLUMN IF NOT EXISTS disability_details TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS photo TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS aadhaar_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS passport_number TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS relation_in_school JSONB DEFAULT '[]'::jsonb;
ALTER TABLE students ADD COLUMN IF NOT EXISTS aadhaar_card_doc TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS caste_certificate_doc TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS parents_docs TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS signature_doc TEXT;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- Verify columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'students'
ORDER BY column_name;`);
  const [title, setTitle] = useState<string>('Super Admin Workspace');
  const [snippets, setSnippets] = useState<SqlSnippet[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const quickActions = [
    { label: 'View All Users', icon: UserCog, code: 'SELECT id, username, name, role, password FROM users ORDER BY role DESC;' },
    { label: 'Reset Admin Pwd', icon: Key, code: "UPDATE users SET password = 'admin@123' WHERE id = 'admin';" },
    { label: 'Hostel/Accounts Pwd', icon: Shield, code: 'SELECT warden_id, warden_password, accountant_id, accountant_password FROM school_profile;' },
    { label: 'Fix System Users', icon: HardDrive, code: `-- Ensure system users exist
INSERT INTO users (id, username, name, role, password)
VALUES 
  ('admin', 'admin', 'System Administrator', 'super-admin', 'admin123'),
  ('warden', 'warden', 'Hostel Warden', 'warden', 'warden123'),
  ('accountant', 'accountant', 'School Accountant', 'accountant', 'acc123')
ON CONFLICT (id) DO UPDATE SET 
  role = EXCLUDED.role,
  password = EXCLUDED.password;` },
  ];

  useEffect(() => {
    fetchSnippets();
    
    // Load SQL from URL if present
    const params = new URLSearchParams(window.location.search);
    const sqlParam = params.get('sql');
    if (sqlParam) {
      setCode(decodeURIComponent(sqlParam));
      setTitle('Shared Query');
    }
  }, []);

  const fetchSnippets = async () => {
    if (!supabase) return;
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('sql_snippets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSnippets(data || []);
    } catch (err: any) {
      console.error('Error fetching snippets:', err.message);
      setFetchError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!supabase) {
      alert('Supabase not configured');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sql_snippets')
        .upsert({ title, code, created_at: new Date().toISOString() })
        .select()
        .single();

      if (error) throw error;
      
      setSnippets(prev => [data, ...prev.filter(s => s.id !== data.id)]);
      alert('Snippet saved successfully!');
    } catch (err: any) {
      alert('Error saving snippet: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRun = async () => {
    if (!supabase) {
      alert('Supabase not configured');
      return;
    }
    setExecuting(true);
    setError(null);
    setResults(null);
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: code });
      
      if (error) throw error;
      
      if (data.status === 'error') {
        setError(data.message);
      } else {
        if (Array.isArray(data)) {
          setResults(data);
        } else if (data.status === 'success') {
          // Some operations return success object
          setResults([{ status: 'success', message: 'SQL executed successfully' }]);
        }
        alert('SQL executed successfully!');
        // Refresh snippets if we modified them
        if (code.toLowerCase().includes('sql_snippets')) {
          fetchSnippets();
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setExecuting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(`${url}?sql=${encodeURIComponent(code)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSnippet = (snippet: SqlSnippet) => {
    setCode(snippet.code);
    setTitle(snippet.title);
  };

  const deleteSnippet = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Are you sure you want to delete this snippet?')) return;
    
    try {
      const { error } = await supabase
        .from('sql_snippets')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setSnippets(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      alert('Error deleting snippet: ' + err.message);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SQL Editor</h1>
          <p className="text-slate-500">Write, share, and manage your Supabase SQL queries.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-700 font-medium"
          >
            {copied ? <CheckCircle2 size={18} className="text-green-500" /> : <Share2 size={18} />}
            {copied ? 'Link Copied' : 'Share Link'}
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Snippet'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Snippets List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Copy size={18} /> Saved Snippets
              </h2>
              <button 
                onClick={() => { setCode(''); setTitle('New Query'); }}
                className="p-1 hover:bg-slate-100 rounded-lg text-primary"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              ) : fetchError ? (
                <div className="text-center py-8 text-red-400 text-xs px-2">
                  <p className="font-bold mb-1">Error loading snippets</p>
                  <p className="opacity-70">{fetchError}</p>
                  {fetchError.includes('schema cache') && (
                    <p className="mt-2 text-primary hover:underline cursor-pointer" onClick={() => window.open('https://supabase.com/dashboard', '_blank')}>
                      Check Supabase Dashboard
                    </p>
                  )}
                </div>
              ) : snippets.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm italic">
                  No saved snippets yet.
                </div>
              ) : (
                snippets.map(snippet => (
                  <div 
                    key={snippet.id}
                    className="group p-3 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer relative"
                    onClick={() => loadSnippet(snippet)}
                  >
                    <p className="font-medium text-slate-700 text-sm truncate pr-6">{snippet.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(snippet.created_at).toLocaleDateString()}
                    </p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSnippet(snippet.id); }}
                      className="absolute right-2 top-3 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4 flex-1">
                <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 font-bold text-slate-800 w-full"
                  placeholder="Query Title..."
                />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setCode(''); setTitle('New Query'); }}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-all"
                  title="Clear Editor"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={() => { navigator.clipboard.writeText(code); alert('SQL copied to clipboard!'); }}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-all"
                  title="Copy SQL"
                >
                  <Copy size={16} />
                </button>
                <button 
                  onClick={handleRun}
                  disabled={executing}
                  className="flex items-center gap-2 px-4 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-bold text-sm disabled:opacity-50"
                >
                  <Play size={16} fill="currentColor" />
                  {executing ? 'Running...' : 'Run'}
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto font-mono text-sm p-4 bg-[#f5f2f0]">
              <Editor
                value={code}
                onValueChange={code => setCode(code)}
                highlight={code => highlight(code, languages.sql, 'sql')}
                padding={10}
                style={{
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                  fontSize: 14,
                  minHeight: '100%',
                }}
                className="outline-none"
              />
            </div>
          </div>

          {/* Quick Actions Area */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">System Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => { setCode(action.code); setTitle(action.label); }}
                  className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <action.icon size={24} className="text-slate-400 group-hover:text-primary mb-2 transition-colors" />
                  <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-primary tracking-tighter">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[200px] p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Results</h3>
            {executing ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3">
                <Trash2 size={18} className="mt-0.5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            ) : results ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {Object.keys(results[0] || {}).map(key => (
                        <th key={key} className="text-left p-2 text-slate-500 font-medium">{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                        {Object.values(row).map((val: any, j) => (
                          <td key={j} className="p-2 text-slate-700">{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Play size={32} className="mb-2 opacity-20" />
                <p className="text-sm">Run a query to see results here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
