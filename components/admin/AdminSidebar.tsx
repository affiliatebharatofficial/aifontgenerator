'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Cpu,
  Gauge,
  Sliders,
  Megaphone,
  Search,
  Wrench,
  HardDrive,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Activity,
  ShieldAlert,
  FileText,
  BellRing,
  Globe,
  Lock,
  Layers,
  FileType,
  BarChart3,
  CreditCard,
} from 'lucide-react';
import { logoutAction } from '@/lib/auth/actions';

interface AdminSidebarProps {
  adminEmail: string;
}

interface NavSection {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

export function AdminSidebar({ adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }],
    },
    {
      title: 'PRODUCT',
      items: [
        { href: '/admin/ai-providers', label: 'AI Providers', icon: Cpu },
        { href: '/admin/settings/generation', label: 'Generation', icon: Gauge },
        { href: '/admin/settings/features', label: 'Features', icon: Layers },
        { href: '/admin/settings/formats', label: 'Font Formats', icon: FileType },
      ],
    },
    {
      title: 'CONTENT',
      items: [
        { href: '/admin/settings/homepage', label: 'Homepage', icon: Globe },
        { href: '/admin/seo', label: 'SEO', icon: Search },
        { href: '/admin/settings/legal', label: 'Legal Pages', icon: FileText },
        { href: '/admin/settings/announcement', label: 'Announcement', icon: BellRing },
      ],
    },
    {
      title: 'MONETIZATION',
      items: [
        { href: '/admin/ads', label: 'Ads & AdSense', icon: Megaphone },
        { href: '/admin/billing/plans', label: 'Subscription Plans', icon: CreditCard },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { href: '/admin/storage', label: 'Storage', icon: HardDrive },
        { href: '/admin/settings/authentication', label: 'Authentication', icon: Lock },
        { href: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
        { href: '/admin/settings/analytics', label: 'Analytics', icon: BarChart3 },
        { href: '/admin/logs', label: 'System Logs', icon: ClipboardList },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/activity', label: 'Activity Logs', icon: Activity },
        { href: '/admin/site-settings', label: 'All Settings', icon: Sliders },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-slate-100 text-sm">
          <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center text-white">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span>Admin Control</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
          <Link href="/admin" className="flex items-center gap-2.5 font-bold text-slate-100">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white shadow-md">
              <ShieldAlert className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm tracking-tight font-mono">Admin Control</span>
              <span className="text-[9px] font-mono text-rose-400 font-bold uppercase">
                Central System
              </span>
            </div>
          </Link>

          <div className="space-y-5">
            {sections.map((section) => (
              <div key={section.title} className="space-y-1.5">
                <span className="px-3 text-[9px] font-mono font-bold uppercase text-slate-500 tracking-wider">
                  {section.title}
                </span>
                <nav className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      pathname === item.href ||
                      (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                          isActive
                            ? 'bg-rose-950/80 border border-rose-800/60 text-rose-300 font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/50'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Admin Email & Logout */}
        <div className="p-4 border-t border-slate-800/80 space-y-3 shrink-0">
          <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 space-y-0.5 font-mono">
            <span className="text-[9px] uppercase text-slate-500 font-bold block">
              Authenticated Admin
            </span>
            <p className="text-[11px] font-bold text-slate-200 truncate">{adminEmail}</p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer border border-slate-800"
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
