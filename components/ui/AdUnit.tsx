'use client';

import React from 'react';

interface AdUnitProps {
  enabled?: boolean;
  publisherId?: string;
  slotId?: string;
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
  positionLabel?: string;
}

export function AdUnit({
  enabled = false,
  publisherId = '',
  slotId = '',
  format = 'auto',
  className = '',
  positionLabel = 'Sponsor Advertisement',
}: AdUnitProps) {
  // If ads are disabled or missing required publisher or slot IDs, render NOTHING.
  if (!enabled || !publisherId || !slotId) {
    return null;
  }

  return (
    <div className={`my-8 text-center border border-[#27272a] bg-[#121215] p-4 rounded-md space-y-2 ${className}`}>
      <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-widest block">
        {positionLabel}
      </span>
      <div className="overflow-hidden min-h-[90px] flex items-center justify-center">
        <ins
          className="adsbygoogle block w-full"
          data-ad-client={publisherId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
