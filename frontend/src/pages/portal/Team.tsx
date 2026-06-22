import React, { useState } from 'react';
import { FieldWrap, Input, Select } from '@/components/ui/FormField';

const members = [
  { id: 1, name: 'Kshitiz Agrawal', email: 'admin@auronix.in', role: 'ADMIN', status: 'active', lastLogin: '7 Jun 2025, 12:30 PM' },
  { id: 2, name: 'Arjun Singh', email: 'analyst@auronix.in', role: 'ANALYST', status: 'active', lastLogin: '7 Jun 2025, 10:15 AM' },
  { id: 3, name: 'Priya Sharma', email: 'priya@auronix.in', role: 'ANALYST', status: 'active', lastLogin: '6 Jun 2025, 4:45 PM' },
  { id: 4, name: 'Rajesh Kumar', email: 'client@demouniversity.edu.in', role: 'CLIENT', status: 'active', lastLogin: '5 Jun 2025, 9:00 AM' },
];

const roleColors: Record<string, string> = { ADMIN: 'bg-brand-purple/20 text-brand-purple', ANALYST: 'bg-accent/20 text-accent', CLIENT: 'bg-brand-green/20 text-brand-green' };

const Team: React.FC = () => {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Team</h1>
          <p className="text-sm text-text-3 font-mono">{members.length} members</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)} className="btn-primary text-xs">+ Invite Member</button>
      </div>

      {showInvite && (
        <div className="card animate-fade-in">
          <h3 className="font-display text-lg font-bold text-text mb-4">Invite New Member</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldWrap label="Email" htmlFor="inviteEmail" required><Input id="inviteEmail" type="email" placeholder="user@email.com" /></FieldWrap>
            <FieldWrap label="Role" htmlFor="inviteRole" required>
              <Select id="inviteRole" placeholder="Select role" options={[
                { value: 'ANALYST', label: 'Analyst' },
                { value: 'CLIENT', label: 'Client' },
              ]} />
            </FieldWrap>
            <FieldWrap label="First Name" htmlFor="inviteFirst" required><Input id="inviteFirst" placeholder="First name" /></FieldWrap>
            <FieldWrap label="Last Name" htmlFor="inviteLast" required><Input id="inviteLast" placeholder="Last name" /></FieldWrap>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary text-xs">Send Invitation</button>
            <button onClick={() => setShowInvite(false)} className="btn-outline text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-surface">
            <th className="table-header">Member</th><th className="table-header">Role</th><th className="table-header">Status</th><th className="table-header">Last Login</th><th className="table-header">Actions</th>
          </tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent font-display text-xs font-bold">{m.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <div>
                      <p className="text-sm text-text font-medium">{m.name}</p>
                      <p className="text-xs text-text-3">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="table-cell"><span className={`pill ${roleColors[m.role]}`}>{m.role}</span></td>
                <td className="table-cell">
                  <span className={`pill ${m.status === 'active' ? 'bg-brand-green/10 text-brand-green' : 'bg-text-3/10 text-text-3'}`}>
                    {m.status}
                  </span>
                </td>
                <td className="table-cell text-xs text-text-3">{m.lastLogin}</td>
                <td className="table-cell">
                  <div className="flex gap-2">
                    <button className="btn-ghost text-xs">Edit</button>
                    {m.role !== 'ADMIN' && <button className="text-xs text-brand-red hover:underline">Deactivate</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Team;
