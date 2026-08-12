'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getFaqJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  title?: string;
  description?: string;
  faqs: FaqItem[];
}

export function FaqSection({
  title = 'FREQUENTLY ASKED QUESTIONS',
  description = 'Everything you need to know about AI vector font generation and licensing.',
  faqs,
}: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const schema = getFaqJsonLd(faqs);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="space-y-8 my-16">
      <JsonLd data={schema} />
      <div className="space-y-2">
        <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
          KNOWLEDGE BASE
        </span>
        <h2 className="font-display font-normal text-3xl sm:text-4xl text-[#f4f4f5] uppercase">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-[#a1a1aa] font-mono max-w-2xl">{description}</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="border border-[#27272a] bg-[#121215] rounded-md overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#18181b] transition-colors"
                aria-expanded={isOpen}
              >
                <span className="font-display text-lg sm:text-xl text-[#f4f4f5]">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#e05638] transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-6 pt-2 border-t border-[#27272a] text-xs sm:text-sm text-[#a1a1aa] leading-relaxed font-normal">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
