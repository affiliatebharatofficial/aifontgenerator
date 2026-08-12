import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { getBreadcrumbJsonLd } from '@/lib/seo/jsonld';
import { JsonLd } from '@/components/seo/JsonLd';

export interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const jsonLdItems = [
    { name: 'Home', item: '/' },
    ...items.map((it) => ({ name: it.name, item: it.href })),
  ];
  const schema = getBreadcrumbJsonLd(jsonLdItems);

  return (
    <>
      <JsonLd data={schema} />
      <nav aria-label="Breadcrumb" className="font-mono text-xs text-[#a1a1aa] mb-6">
        <ol className="flex items-center flex-wrap gap-2">
          <li>
            <Link href="/" className="hover:text-[#f4f4f5] transition-colors">
              Home
            </Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.href} className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-[#71717a]" />
                {isLast ? (
                  <span className="text-[#e05638] font-bold" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.href} className="hover:text-[#f4f4f5] transition-colors">
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
