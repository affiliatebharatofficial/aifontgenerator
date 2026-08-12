import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export interface ToolLandingConfig {
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  features: string[];
}

export function ToolLanding({ config }: { config: ToolLandingConfig }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24 space-y-16">
      <div className="space-y-6">
        <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
          {config.badge}
        </span>

        <h1 className="font-display font-normal text-4xl sm:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
          {config.title}
        </h1>

        <p className="text-sm sm:text-base text-[#a1a1aa] max-w-2xl leading-relaxed">
          {config.description}
        </p>

        <div className="pt-2">
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-md text-xs font-semibold uppercase tracking-wider bg-[#e05638] hover:bg-[#c84326] text-white transition-all shadow-md"
          >
            <span>Open Font Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="border border-[#27272a] bg-[#121215] rounded-md p-8 sm:p-12 space-y-6">
        <div className="pb-4 border-b border-[#27272a]">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-bold">
            CAPABILITY & ENGINE SPECIFICATION
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {config.features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3 p-4 rounded-md bg-[#09090b] border border-[#27272a]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-xs font-mono text-[#a1a1aa]">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
