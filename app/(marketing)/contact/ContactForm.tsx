'use client';

import React, { useActionState } from 'react';
import { submitContactAction, type ContactActionResult } from '@/lib/contact/actions';
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function ContactForm() {
  const [state, formAction, isPending] = useActionState<ContactActionResult | null, FormData>(
    submitContactAction,
    null
  );

  return (
    <form action={formAction} className="space-y-6 font-mono text-xs">
      {state?.success && (
        <div className="p-4 rounded bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-sans text-xs">{state.message}</p>
        </div>
      )}

      {state && !state.success && (
        <div className="p-4 rounded bg-rose-950/40 border border-rose-800/50 text-rose-400 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-sans text-xs">{state.message}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-[#a1a1aa] uppercase font-bold">
            Your Name <span className="text-[#e05638]">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Jane Doe"
            className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded text-[#f4f4f5] focus:outline-none focus:border-[#e05638] transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-[#a1a1aa] uppercase font-bold">
            Email Address <span className="text-[#e05638]">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="jane@example.com"
            className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded text-[#f4f4f5] focus:outline-none focus:border-[#e05638] transition-colors"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="block text-[#a1a1aa] uppercase font-bold">
          Subject <span className="text-[#e05638]">*</span>
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder="Type synthesis inquiry / API integration"
          className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded text-[#f4f4f5] focus:outline-none focus:border-[#e05638] transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="block text-[#a1a1aa] uppercase font-bold">
          Message <span className="text-[#e05638]">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder="Describe your inquiry or technical question in detail..."
          className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded text-[#f4f4f5] focus:outline-none focus:border-[#e05638] transition-colors resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded bg-[#e05638] hover:bg-[#c84326] text-white uppercase font-bold tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Transmitting...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Transmit Message</span>
          </>
        )}
      </button>
    </form>
  );
}
