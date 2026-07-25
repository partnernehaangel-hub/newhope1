import React, { useState } from 'react';
import { ShieldCheck, Search, Lock, XCircle, CheckCircle2, Edit2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { User } from '../../types';

interface UserCredentialsPanelProps {
  users: User[];
  setUsers: (users: User[]) => void;
  setUserLogs: (logs: any) => void;
  currentUser: User;
}

export const UserCredentialsPanel = ({ users, setUsers, setUserLogs, currentUser }: UserCredentialsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const handleResetPassword = (userId: string) => {
    if (!newPassword) return;
    
    setUsers(users.map(u => u.id === userId ? { ...u, password: newPassword } : u));
    
    const targetUser = users.find(u => u.id === userId);
    setUserLogs((prev: any) => [{
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString(),
      user: currentUser.name,
      action: 'Password Reset',
      details: `Reset password for ${targetUser?.name} (${userId}) to: ${newPassword}`,
      ip: '192.168.1.1'
    }, ...prev]);

    setEditingUserId(null);
    setNewPassword('');
    alert('Password reset successfully!');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-text-heading tracking-tight uppercase">User Credentials</h1>
        <p className="text-text-sub font-medium">Manage system access and reset user passwords.</p>
      </div>

      <Card className="p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h3 className="text-xl font-black text-primary flex items-center gap-3 uppercase tracking-tighter">
            <ShieldCheck size={24} /> User Credentials Master List
          </h3>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by ID, Name or Role..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-primary outline-none text-sm font-bold transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-[2rem] border-2 border-slate-50 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] border-b-2 border-slate-100">
                <th className="py-6 px-6">User Info</th>
                <th className="py-6 px-6">Role</th>
                <th className="py-6 px-6">Current Password</th>
                <th className="py-6 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-primary/5 transition-all group">
                  <td className="py-6 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-black text-text-heading text-base">{user.name}</p>
                        <p className="text-xs font-bold text-primary uppercase tracking-widest">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-6">
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-red-100 text-red-700' :
                      user.role === 'teacher' ? 'bg-blue-100 text-blue-700' :
                      user.role === 'student' ? 'bg-green-100 text-green-700' :
                      user.role === 'super-admin' ? 'bg-purple-100 text-purple-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-6 px-6">
                    {editingUserId === user.id ? (
                      <input 
                        type="text" 
                        className="input-field py-2 text-xs" 
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoFocus
                      />
                    ) : (
                      <div className="flex items-center gap-2 font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
                        <Lock size={12} className="text-slate-400" />
                        {user.password || '12345678'}
                      </div>
                    )}
                  </td>
                  <td className="py-6 px-6 text-right">
                    {editingUserId === user.id ? (
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setEditingUserId(null)}
                          className="p-2 hover:bg-red-50 rounded-xl text-red-500 transition-colors"
                        >
                          <XCircle size={20} />
                        </button>
                        <button 
                          onClick={() => handleResetPassword(user.id)}
                          className="p-2 hover:bg-green-50 rounded-xl text-green-500 transition-colors"
                        >
                          <CheckCircle2 size={20} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setEditingUserId(user.id)}
                        className="px-4 py-2 bg-white border-2 border-slate-100 rounded-xl text-xs font-black text-primary hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm flex items-center gap-2 ml-auto"
                      >
                        <Edit2 size={14} /> Reset Password
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
