'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react';
import { logoutAction } from '@/lib/auth/actions';

interface DashboardSidebarProps {
  userEmail: string;
  fullName: string | null;
  role: string;
}

export function DashboardSidebar({ userEmail, fullName, role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Workspace', icon: LayoutDashboard },
    { href: '/dashboard/my-fonts', label: 'My Fonts', icon: FolderKanban },
    { href: '/generate', label: 'Synthesize Font', icon: ArrowRight, highlight: true },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-[#121215] border-b border-[#27272a] sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-[#f4f4f5] text-xs font-mono uppercase">
          <div className="w-6 h-6 rounded bg-[#e05638] flex items-center justify-center text-white font-display text-sm">
            f
          </div>
          <span>AI Font Generator</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-md bg-[#09090b] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#121215] border-r border-[#27272a] flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 space-y-8">
          {/* Logo Brand */}
          <Link href="/dashboard" className="flex items-center gap-3 text-[#f4f4f5]">
            <div className="w-8 h-8 rounded-md bg-[#e05638] flex items-center justify-center text-white font-display font-bold text-lg leading-none">
              f
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold font-sans uppercase tracking-tight">AI Font Generator</span>
              <span className="text-[9px] font-mono text-[#e05638] font-bold uppercase tracking-widest">
                Type Studio
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1.5 font-mono text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-md font-semibold transition-all uppercase ${
                    item.highlight
                      ? 'bg-[#e05638] hover:bg-[#c84326] text-white font-bold'
                      : isActive
                      ? 'bg-[#18181b] text-[#e05638] border border-[#27272a]'
                      : 'text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Identity & Logout */}
        <div className="p-6 border-t border-[#27272a] space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="min-w-0 space-y-0.5">
              <p className="text-[#f4f4f5] font-bold truncate">{fullName || 'User'}</p>
              <p className="text-[10px] text-[#71717a] truncate">{userEmail}</p>
            </div>
            {role === 'admin' && (
              <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-rose-950 text-rose-400 border border-rose-800">
                Admin
              </span>
            )}
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#09090b] border border-[#27272a] text-[#a1a1aa] hover:text-rose-400 hover:border-rose-900 transition-colors uppercase font-bold text-[11px] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
