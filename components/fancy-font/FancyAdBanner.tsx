'use client';

import { useEffect } from 'react';

interface FancyAdBannerProps {
  adsEnabled: boolean;
  publisherId: string;
  slotId?: string;
  className?: string;
  label?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export function FancyAdBanner({
  adsEnabled,
  publisherId,
  slotId,
  className = '',
  label = 'ADVERTISEMENT',
}: FancyAdBannerProps) {
  useEffect(() => {
    if (adsEnabled && publisherId && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('AdSense initialization error:', err);
      }
    }
  }, [adsEnabled, publisherId]);

  if (!adsEnabled || !publisherId) {
    return null;
  }

  return (
    <div
      className={`w-full max-w-4xl mx-auto my-8 p-4 rounded-lg bg-[#121215] border border-[#27272a]/60 text-center ${className}`}
      aria-label={label}
    >
      <span className="block text-[10px] font-mono tracking-widest text-[#71717a] uppercase mb-2">
        {label}
      </span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={publisherId}
        data-ad-slot={slotId || ''}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
