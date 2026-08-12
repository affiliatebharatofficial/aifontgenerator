'use client';

import { useState } from 'react';
import { Moon, Sun, Monitor, Type, Globe, Check, Save } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SettingsForm() {
  const [theme, setTheme] = useState<'system' | 'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('ai_font_theme') as 'system' | 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  const [specimenText, setSpecimenText] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('ai_font_default_specimen') ||
        'The quick brown fox jumps over the lazy dog.'
      );
    }
    return 'The quick brown fox jumps over the lazy dog.';
  });

  const [defaultSize, setDefaultSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseInt(localStorage.getItem('ai_font_default_size') || '48', 10);
    }
    return 48;
  });

  const [language, setLanguage] = useState('en');
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    localStorage.setItem('ai_font_theme', theme);
    localStorage.setItem('ai_font_default_specimen', specimenText);
    localStorage.setItem('ai_font_default_size', String(defaultSize));

    // Theme application
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-400" />
            <span>Theme Preference</span>
          </CardTitle>
          <CardDescription>
            Choose your preferred workspace color theme interface.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-semibold">Dark Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-semibold">Light Mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('system')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all cursor-pointer ${
                theme === 'system'
                  ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Monitor className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-semibold">System Default</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Font Specimen Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Type className="w-4 h-4 text-indigo-400" />
            <span>Font Specimen Preferences</span>
          </CardTitle>
          <CardDescription>
            Default text and font size used in your font result stage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">
              Default Specimen Text
            </label>
            <input
              type="text"
              value={specimenText}
              onChange={(e) => setSpecimenText(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <label>Default Specimen Font Size</label>
              <span className="font-mono">{defaultSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="120"
              value={defaultSize}
              onChange={(e) => setDefaultSize(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-950"
            />
          </div>
        </CardContent>
      </Card>

      {/* Multilingual Foundation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>Language & Region</span>
          </CardTitle>
          <CardDescription>
            System language configuration for workspace and documentation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="en">English (US)</option>
          </select>
          <p className="text-[11px] text-slate-500">
            English is currently the primary supported interface language.
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between border-t border-slate-800 pt-4">
          {saved ? (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Preferences saved!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              Settings persist across browser sessions.
            </span>
          )}

          <Button type="submit" className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
