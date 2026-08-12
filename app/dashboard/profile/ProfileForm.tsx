'use client';

import { useState } from 'react';
import { User, Mail, Shield, Check, AlertCircle, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateProfileAction } from '@/lib/auth/actions';

interface ProfileFormProps {
  userEmail: string;
  fullName: string;
  avatarUrl: string;
  role: string;
  createdAt: string;
}

export function ProfileForm({
  userEmail,
  fullName: initialName,
  avatarUrl: initialAvatar,
  role,
  createdAt,
}: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatar);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('fullName', fullName.trim());
      formData.append('avatarUrl', avatarUrl.trim());

      const res = await updateProfileAction(formData);

      if (res.success) {
        setStatus({ type: 'success', message: 'Profile details updated successfully.' });
      } else {
        setStatus({ type: 'error', message: res.error || 'Failed to update profile.' });
      }
    } catch {
      setStatus({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Profile Details</span>
          </CardTitle>
          <CardDescription>
            Your account credentials and public profile information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                status.type === 'success'
                  ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                  : 'bg-rose-950/70 border-rose-800 text-rose-300'
              }`}
            >
              {status.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{status.message}</span>
            </div>
          )}

          {/* Email (Read-Only) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Authenticated Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={userEmail}
                readOnly
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800/80 rounded-lg text-slate-400 cursor-not-allowed"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Email changes are managed through Supabase Security Auth flows.
            </p>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Full Name</label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Avatar Image URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Avatar Image URL</label>
            <Input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
            <p className="text-[11px] text-slate-500">
              Paste a secure HTTPS image link to display your custom avatar.
            </p>
          </div>

          {/* Account Role & Registration Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-500">Account Access Role</span>
              <span className="font-mono text-indigo-400 uppercase font-bold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                {role}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-500">Member Since</span>
              <span className="text-slate-300 font-mono">
                {new Date(createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-slate-800 pt-4">
          <Button type="submit" isLoading={isSaving} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
