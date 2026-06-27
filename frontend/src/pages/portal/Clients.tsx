import React, { useState } from 'react';
import { FieldWrap, Input, Select } from '@/components/ui/FormField';

const clients = [
  { id: 1, name: 'Demo University', industry: 'Education', email: 'it@demouniversity.edu.in', phone: '+91 98765 43210', users: 3, engagements: 4, created: '01 Jan 2025', active: true },
  { id: 2, name: 'ABC Bank', industry: 'Banking', email: 'security@abcbank.co.in', phone: '+91 98765 00002', users: 2, engagements: 2, created: '15 Mar 2025', active: true },
  { id: 3, name: 'MedCare Hospital', industry: 'Healthcare', email: 'admin@medcare.in', phone: '+91 98765 00003', users: 1, engagements: 1, created: '01 Apr 2025', active: true },
  { id: 4, name: 'EduTech Startup', industry: 'Education', email: 'cto@edutech.in', phone: '+91 98765 00004', users: 2, engagements: 1, created: '10 Apr 2025', active: true },
  { id: 5, name: 'GovPortal India', industry: 'Government', email: 'it@govportal.gov.in', phone: '+91 98765 00005', users: 1, engagements: 1, created: '01 May 2025', active: false },
];

const Clients: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Clients</h1>
          <p className="text-sm text-text-3 font-mono">{clients.length} organisations</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs">+ Add Client</button>
      </div>

      {showForm && (
        <div className="card animate-fade-in">
          <h3 className="font-display text-lg font-bold text-text mb-4">New Client Organisation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldWrap label="Organisation Name" htmlFor="orgName" required><Input id="orgName" placeholder="Company Name" /></FieldWrap>
            <FieldWrap label="Industry" htmlFor="industry" required>
              <Select id="industry" placeholder="Select" options={[
                { value: 'Education', label: 'Education' }, { value: 'Banking', label: 'Banking/Finance' },
                { value: 'Healthcare', label: 'Healthcare' }, { value: 'E-commerce', label: 'E-commerce' },
                { value: 'Government', label: 'Government' }, { value: 'IT', label: 'IT/Software' }, { value: 'Other', label: 'Other' },
              ]} />
            </FieldWrap>
            <FieldWrap label="Contact Email" htmlFor="contactEmail" required><Input id="contactEmail" type="email" placeholder="contact@company.com" /></FieldWrap>
            <FieldWrap label="Contact Phone" htmlFor="contactPhone"><Input id="contactPhone" type="tel" placeholder="+91 9953933965" /></FieldWrap>
            <FieldWrap label="Initial User Email" htmlFor="userEmail" required hint="An account will be created with a temporary password">
              <Input id="userEmail" type="email" placeholder="user@company.com" />
            </FieldWrap>
            <FieldWrap label="Initial User Name" htmlFor="userName" required><Input id="userName" placeholder="Full Name" /></FieldWrap>
          </div>
          <div className="flex gap-3 mt-6">
            <button className="btn-primary text-xs">Create Organisation</button>
            <button onClick={() => setShowForm(false)} className="btn-outline text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        <table className="w-full">
          <thead><tr className="bg-surface">
            <th className="table-header">Organisation</th><th className="table-header">Industry</th><th className="table-header">Contact</th><th className="table-header">Users</th><th className="table-header">Engagements</th><th className="table-header">Status</th>
          </tr></thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="table-row">
                <td className="table-cell">
                  <p className="text-text font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-text-3">{c.email}</p>
                </td>
                <td className="table-cell text-text-2 text-xs">{c.industry}</td>
                <td className="table-cell text-text-3 text-xs">{c.phone}</td>
                <td className="table-cell font-mono text-sm text-text-2">{c.users}</td>
                <td className="table-cell font-mono text-sm text-text-2">{c.engagements}</td>
                <td className="table-cell">
                  <span className={`pill ${c.active ? 'bg-brand-green/10 text-brand-green' : 'bg-text-3/10 text-text-3'}`}>
                    {c.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Clients;
