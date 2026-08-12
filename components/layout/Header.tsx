import Link from 'next/link';
import { User, LogOut, ArrowRight } from 'lucide-react';
import { getCurrentUserProfile } from '@/lib/auth/admin';
import { logoutAction } from '@/lib/auth/actions';

export async function Header() {
  const { user, profile } = await getCurrentUserProfile();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Typographic Logo */}
        <Link href="/" className="flex items-center gap-3 text-[#f4f4f5] hover:opacity-90 transition-opacity">
          <div className="w-8 h-8 rounded-md bg-[#e05638] flex items-center justify-center text-white font-display font-bold text-lg leading-none">
            f
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight font-sans-ui uppercase">
              AI Font Generator
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#a1a1aa] uppercase font-semibold">
              Type Engine
            </span>
          </div>
        </Link>

        {/* Public Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wide text-[#a1a1aa] uppercase">
          <Link href="/generate" className="hover:text-[#f4f4f5] transition-colors">
            Generator
          </Link>
          <Link href="/fancy-font-generator" className="hover:text-[#f4f4f5] transition-colors text-[#e05638]">
            Fancy Text
          </Link>
          <Link href="/ai-font-generator" className="hover:text-[#f4f4f5] transition-colors">
            Fonts
          </Link>
          <Link href="/how-it-works" className="hover:text-[#f4f4f5] transition-colors">
            How It Works
          </Link>
          <Link href="/typography-glossary" className="hover:text-[#f4f4f5] transition-colors">
            Glossary
          </Link>
          <Link href="/resources" className="hover:text-[#f4f4f5] transition-colors">
            Resources
          </Link>
          <Link href="/about" className="hover:text-[#f4f4f5] transition-colors">
            About
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#e05638]" />
                <span>Dashboard</span>
              </Link>

              {profile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900 transition-colors"
                >
                  Admin
                </Link>
              )}

              <Link
                href="/generate"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-sm"
              >
                <span>Create a Font</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Sign Out"
                  className="p-2 text-[#a1a1aa] hover:text-rose-400 hover:bg-rose-950/40 rounded-md transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#a1a1aa] hover:text-[#f4f4f5] hover:bg-[#18181b] transition-all"
              >
                Login
              </Link>
              <Link
                href="/generate"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-sm"
              >
                <span>Create a Font</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
