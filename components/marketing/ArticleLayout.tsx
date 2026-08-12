import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Calendar, User } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { getArticleJsonLd } from '@/lib/seo/jsonld';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export interface RelatedArticle {
  title: string;
  href: string;
  description: string;
}

interface ArticleLayoutProps {
  title: string;
  description: string;
  slug: string;
  publishedDate: string;
  updatedDate?: string;
  authorName?: string;
  readingTime: string;
  children: React.ReactNode;
  relatedArticles?: RelatedArticle[];
}

export function ArticleLayout({
  title,
  description,
  slug,
  publishedDate,
  updatedDate,
  authorName = 'AI Font Generator Engineering Team',
  readingTime,
  children,
  relatedArticles = [],
}: ArticleLayoutProps) {
  const articleUrl = `/resources/${slug}`;
  const articleSchema = getArticleJsonLd({
    title,
    description,
    url: articleUrl,
    datePublished: publishedDate,
    dateModified: updatedDate || publishedDate,
    authorName,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-[#e05638]/20 selection:text-[#f4f4f5]">
      <JsonLd data={articleSchema} />
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full space-y-12">
        <Breadcrumbs
          items={[
            { name: 'Resources', href: '/resources' },
            { name: title, href: articleUrl },
          ]}
        />

        {/* Article Header */}
        <header className="space-y-6 pb-8 border-b border-[#27272a]">
          <span className="text-xs font-mono uppercase tracking-widest text-[#e05638] font-bold">
            TYPOGRAPHY GUIDE
          </span>
          <h1 className="font-display font-normal text-3xl sm:text-5xl lg:text-6xl text-[#f4f4f5] tracking-tight uppercase leading-[1.05]">
            {title}
          </h1>
          <p className="text-sm sm:text-lg text-[#a1a1aa] leading-relaxed font-normal">
            {description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#71717a] pt-4">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#e05638]" />
              <span>{authorName}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#e05638]" />
              <span>{publishedDate}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#e05638]" />
              <span>{readingTime}</span>
            </div>
          </div>
        </header>

        {/* Article Body */}
        <article className="prose prose-invert max-w-none space-y-6 text-sm sm:text-base text-[#a1a1aa] leading-relaxed">
          {children}
        </article>

        {/* CTA Box */}
        <section className="p-8 border border-[#27272a] bg-[#121215] rounded-md space-y-4 my-12">
          <span className="text-xs font-mono uppercase text-[#e05638] font-bold">READY TO BUILD?</span>
          <h2 className="font-display text-2xl text-[#f4f4f5] uppercase">Synthesize Your Custom Typeface</h2>
          <p className="text-xs sm:text-sm text-[#a1a1aa]">
            Turn your text prompts into downloadable TTF, OTF, and WOFF2 fonts with our generative vector engine.
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#e05638] hover:bg-[#c84326] text-white font-mono text-xs uppercase font-bold transition-colors"
          >
            <span>Launch Font Generator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </section>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="space-y-6 pt-8 border-t border-[#27272a]">
            <h3 className="font-display text-xl sm:text-2xl text-[#f4f4f5] uppercase">
              Related Typography Articles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedArticles.map((rel) => (
                <Link
                  key={rel.href}
                  href={rel.href}
                  className="p-6 border border-[#27272a] bg-[#121215] rounded-md hover:border-[#e05638] transition-colors space-y-2 group block"
                >
                  <h4 className="font-display text-lg text-[#f4f4f5] group-hover:text-[#e05638] transition-colors">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-[#a1a1aa] line-clamp-2">{rel.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
