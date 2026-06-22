import React, { useState } from 'react';
import { FieldWrap, Input } from '@/components/ui/FormField';

const Settings: React.FC = () => {
  const [tab, setTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const [twoFA, setTwoFA] = useState(false);
  const [notifications, setNotifications] = useState({ newReport: true, findingUpdate: true, engagementStatus: true, weeklyDigest: false });

  const tabs = [
    { id: 'profile' as const, label: 'Profile' },
    { id: 'security' as const, label: 'Security' },
    { id: 'notifications' as const, label: 'Notifications' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Settings</h1>
        <p className="text-sm text-text-3 font-mono">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 font-mono text-xs uppercase tracking-wider border-b-2 transition-all ${
              tab === t.id ? 'border-accent text-accent' : 'border-transparent text-text-3 hover:text-text'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <div className="card max-w-2xl animate-fade-in">
          <h3 className="font-display text-lg font-bold text-text mb-6">Profile Information</h3>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldWrap label="First Name" htmlFor="firstName"><Input id="firstName" defaultValue="Kshitiz" /></FieldWrap>
              <FieldWrap label="Last Name" htmlFor="lastName"><Input id="lastName" defaultValue="Admin" /></FieldWrap>
            </div>
            <FieldWrap label="Email" htmlFor="email" hint="Email cannot be changed">
              <Input id="email" defaultValue="admin@auronix.in" disabled className="opacity-50" />
            </FieldWrap>
            <FieldWrap label="Phone" htmlFor="phone"><Input id="phone" defaultValue="+91 XXXXX XXXXX" /></FieldWrap>
            <FieldWrap label="Organisation" htmlFor="org" hint="Organisation cannot be changed">
              <Input id="org" defaultValue="Auronix Technologies" disabled className="opacity-50" />
            </FieldWrap>
            <button className="btn-primary text-xs">Save Changes</button>
          </div>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="space-y-6 max-w-2xl animate-fade-in">
          <div className="card">
            <h3 className="font-display text-lg font-bold text-text mb-6">Change Password</h3>
            <div className="space-y-4">
              <FieldWrap label="Current Password" htmlFor="currentPass"><Input id="currentPass" type="password" /></FieldWrap>
              <FieldWrap label="New Password" htmlFor="newPass" hint="Minimum 8 characters with uppercase, lowercase, number, and special character">
                <Input id="newPass" type="password" />
              </FieldWrap>
              <FieldWrap label="Confirm Password" htmlFor="confirmPass"><Input id="confirmPass" type="password" /></FieldWrap>
              <button className="btn-primary text-xs">Update Password</button>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-text">Two-Factor Authentication</h3>
                <p className="text-sm text-text-3">Add an extra layer of security with TOTP-based 2FA</p>
              </div>
              <button onClick={() => setTwoFA(!twoFA)}
                className={`relative w-12 h-6 rounded-full transition-colors ${twoFA ? 'bg-accent' : 'bg-surface-2'}`}>
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${twoFA ? 'left-[26px]' : 'left-0.5'}`} />
              </button>
            </div>
            {twoFA && (
              <div className="p-4 bg-bg-2 rounded-lg border border-border">
                <p className="text-sm text-text-2 mb-4">Scan this QR code with your authenticator app:</p>
                <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center mb-4">
                  <span className="text-bg font-mono text-xs text-center p-2">QR Code<br />Placeholder</span>
                </div>
                <FieldWrap label="Verification Code" htmlFor="totpCode" hint="Enter the 6-digit code from your app">
                  <Input id="totpCode" placeholder="000000" maxLength={6} className="max-w-[150px] text-center font-mono text-lg tracking-[0.5em]" />
                </FieldWrap>
                <button className="btn-primary text-xs mt-4">Verify & Enable</button>
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-display text-lg font-bold text-text mb-4">Active Sessions</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-bg-2 rounded-lg border border-border">
                <div>
                  <p className="text-sm text-text">Chrome on macOS <span className="pill bg-brand-green/10 text-brand-green ml-2">Current</span></p>
                  <p className="text-xs text-text-3">Bareilly, UP · IP: 103.xxx.xxx.xxx · Active now</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-bg-2 rounded-lg border border-border">
                <div>
                  <p className="text-sm text-text">Safari on iPhone</p>
                  <p className="text-xs text-text-3">New Delhi · IP: 49.xxx.xxx.xxx · 2 hours ago</p>
                </div>
                <button className="text-xs text-brand-red hover:underline">Revoke</button>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-display text-lg font-bold text-text mb-3">Session Timeout</h3>
            <div className="flex flex-wrap gap-2">
              {['15 min', '30 min', '1 hour', '4 hours'].map((t) => (
                <button key={t} className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${t === '30 min' ? 'bg-accent text-white' : 'bg-surface text-text-2 hover:bg-surface-2'}`}>{t}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className="card max-w-2xl animate-fade-in">
          <h3 className="font-display text-lg font-bold text-text mb-6">Email Notifications</h3>
          <div className="space-y-4">
            {([
              { key: 'newReport' as const, label: 'New report available', desc: 'Get notified when a new security report is uploaded' },
              { key: 'findingUpdate' as const, label: 'Finding status changed', desc: 'Get notified when a vulnerability finding status is updated' },
              { key: 'engagementStatus' as const, label: 'Engagement status change', desc: 'Get notified when an engagement status changes' },
              { key: 'weeklyDigest' as const, label: 'Weekly security digest', desc: 'Receive a weekly summary of your security posture' },
            ]).map((n) => (
              <div key={n.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="text-sm text-text">{n.label}</p>
                  <p className="text-xs text-text-3">{n.desc}</p>
                </div>
                <button onClick={() => setNotifications((prev) => ({ ...prev, [n.key]: !prev[n.key] }))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${notifications[n.key] ? 'bg-accent' : 'bg-surface-2'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${notifications[n.key] ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="card border-brand-red/20 max-w-2xl">
        <h3 className="font-display text-lg font-bold text-brand-red mb-2">Danger Zone</h3>
        <p className="text-sm text-text-3 mb-4">Export your audit log or permanently delete your account.</p>
        <div className="flex gap-3">
          <button className="btn-outline text-xs">Export Audit Log</button>
          <button className="btn-danger text-xs">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
