import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-[#27272a] bg-[#09090b] pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Large Editorial Headline */}
        <div className="pb-12 border-b border-[#27272a]">
          <h2 className="font-display font-normal text-4xl sm:text-6xl lg:text-7xl text-[#f4f4f5] tracking-tight uppercase leading-[0.95]">
            MAKE SOMETHING <br />
            <span className="italic text-[#a1a1aa]">TYPE-WORTHY.</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Product Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-semibold">
              Product
            </h3>
            <ul className="space-y-2 text-xs font-medium text-[#71717a]">
              <li>
                <Link href="/fancy-font-generator" className="hover:text-[#f4f4f5] transition-colors font-bold text-[#e05638]">
                  Fancy Font Generator
                </Link>
              </li>
              <li>
                <Link href="/generate" className="hover:text-[#f4f4f5] transition-colors">
                  Font Generator
                </Link>
              </li>
              <li>
                <Link href="/ai-font-generator" className="hover:text-[#f4f4f5] transition-colors">
                  AI Font Generator
                </Link>
              </li>
              <li>
                <Link href="/handwriting-font-generator" className="hover:text-[#f4f4f5] transition-colors">
                  Handwriting to Font
                </Link>
              </li>
              <li>
                <Link href="/create-a-font" className="hover:text-[#f4f4f5] transition-colors">
                  Create a Font
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-semibold">
              Resources
            </h3>
            <ul className="space-y-2 text-xs font-medium text-[#71717a]">
              <li>
                <Link href="/how-it-works" className="hover:text-[#f4f4f5] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/typography-glossary" className="hover:text-[#f4f4f5] transition-colors">
                  Typography Glossary
                </Link>
              </li>
              <li>
                <Link href="/resources" className="hover:text-[#f4f4f5] transition-colors">
                  Educational Guides
                </Link>
              </li>
              <li>
                <Link href="/font-maker" className="hover:text-[#f4f4f5] transition-colors">
                  Font Maker Guide
                </Link>
              </li>
              <li>
                <Link href="/custom-font-generator" className="hover:text-[#f4f4f5] transition-colors">
                  Custom Vector Spec
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-semibold">
              Company
            </h3>
            <ul className="space-y-2 text-xs font-medium text-[#71717a]">
              <li>
                <Link href="/about" className="hover:text-[#f4f4f5] transition-colors">
                  About Type Engine
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#f4f4f5] transition-colors">
                  Contact Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Col */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-widest text-[#a1a1aa] font-semibold">
              Legal
            </h3>
            <ul className="space-y-2 text-xs font-medium text-[#71717a]">
              <li>
                <Link href="/privacy" className="hover:text-[#f4f4f5] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#f4f4f5] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-[#f4f4f5] transition-colors">
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy" className="hover:text-[#f4f4f5] transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#71717a] gap-4">
          <p>© {new Date().getFullYear()} ai-fontgenerator.com. All rights reserved.</p>
          <p className="uppercase">Vector Type Synthesis Engine</p>
        </div>
      </div>
    </footer>
  );
}
