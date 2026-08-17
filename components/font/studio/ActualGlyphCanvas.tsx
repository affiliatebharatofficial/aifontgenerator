'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Sliders,
  Layers,
  SplitSquareVertical,
  Check,
} from 'lucide-react';
import type { GlyphMetadataInfo, GlyphTransformParams, GlyphOverride } from '@/lib/font/studio/types';

interface ActualGlyphCanvasProps {
  selectedGlyph: GlyphMetadataInfo;
  override?: GlyphOverride;
  originalPathCommands: Array<{ type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number }>;
  transformedPathCommands: Array<{ type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number }>;
  unitsPerEm?: number;
  ascender?: number;
  descender?: number;
  capHeight?: number;
  xHeight?: number;
  compareMode: 'none' | 'overlay' | 'side-by-side';
  onToggleCompareMode: (mode: 'none' | 'overlay' | 'side-by-side') => void;
}

export function ActualGlyphCanvas({
  selectedGlyph,
  override,
  originalPathCommands,
  transformedPathCommands,
  unitsPerEm = 1000,
  ascender = 800,
  descender = -200,
  capHeight = 700,
  xHeight = 480,
  compareMode,
  onToggleCompareMode,
}: ActualGlyphCanvasProps) {
  const [zoom, setZoom] = useState(1.0);
  const [showBaseline, setShowBaseline] = useState(true);
  const [showCapHeight, setShowCapHeight] = useState(true);
  const [showXHeight, setShowXHeight] = useState(true);
  const [showSideBearings, setShowSideBearings] = useState(true);
  const [showBoundingBox, setShowBoundingBox] = useState(true);
  const [showControlPoints, setShowControlPoints] = useState(true);

  // SVG coordinate transformation:
  // Font space: baseline is Y=0, Ascender is positive (Y=+800), Descender is negative (Y=-200).
  // SVG space: Y increases downwards.
  // We place baseline at Y = ascender + 100 margin, so total height = unitsPerEm + 300 margin.
  const canvasWidth = 1000;
  const canvasHeight = unitsPerEm + 300;
  const baselineY = ascender + 150;
  const capHeightY = baselineY - capHeight;
  const xHeightY = baselineY - xHeight;
  const ascenderY = baselineY - ascender;
  const descenderY = baselineY - descender;

  // Convert font path commands to SVG Path 'd' string
  const commandsToSvgPath = (
    cmds: Array<{ type: string; x?: number; y?: number; x1?: number; y1?: number; x2?: number; y2?: number }>
  ): string => {
    if (!cmds || cmds.length === 0) return '';
    let d = '';

    for (const c of cmds) {
      const cy = (y?: number) => (y !== undefined ? baselineY - y : 0);
      const cx = (x?: number) => (x !== undefined ? 200 + x : 0);

      if (c.type === 'M') {
        d += ` M ${cx(c.x)} ${cy(c.y)}`;
      } else if (c.type === 'L') {
        d += ` L ${cx(c.x)} ${cy(c.y)}`;
      } else if (c.type === 'C') {
        d += ` C ${cx(c.x1)} ${cy(c.y1)}, ${cx(c.x2)} ${cy(c.y2)}, ${cx(c.x)} ${cy(c.y)}`;
      } else if (c.type === 'Q') {
        d += ` Q ${cx(c.x1)} ${cy(c.y1)}, ${cx(c.x)} ${cy(c.y)}`;
      } else if (c.type === 'Z') {
        d += ' Z';
      }
    }
    return d.trim();
  };

  const originalPathD = commandsToSvgPath(originalPathCommands);
  const transformedPathD = commandsToSvgPath(transformedPathCommands);

  // Bounding box calculations
  const bbox = selectedGlyph.boundingBox;
  const bboxX = 200 + bbox.xMin;
  const bboxY = baselineY - bbox.yMax;
  const bboxW = Math.max(10, bbox.xMax - bbox.xMin);
  const bboxH = Math.max(10, bbox.yMax - bbox.yMin);

  const advanceX = 200 + selectedGlyph.advanceWidth;
  const isEdited = override && (
    override.transforms.scaleX !== 1.0 ||
    override.transforms.scaleY !== 1.0 ||
    override.transforms.moveX !== 0 ||
    override.transforms.moveY !== 0 ||
    override.transforms.slant !== 0 ||
    override.transforms.strokeDelta !== 1.0 ||
    override.transforms.roundnessDelta !== 0 ||
    override.transforms.advanceWidthDelta !== 0
  );

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f12] border border-[#27272a] rounded-xl overflow-hidden shadow-2xl relative select-none">
      {/* Canvas Controls Header */}
      <div className="h-12 border-b border-[#27272a] bg-[#141418] px-4 flex items-center justify-between text-xs font-mono text-[#a1a1aa]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#f4f4f5] text-sm uppercase flex items-center gap-2">
            <span>GLYPH:</span>
            <span className="text-[#e05638] bg-[#e05638]/10 px-2 py-0.5 rounded border border-[#e05638]/30">
              {selectedGlyph.char}
            </span>
          </span>
          <span className="text-[#71717a] hidden sm:inline">({selectedGlyph.unicodeHex})</span>
          {isEdited && (
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded uppercase font-bold">
              MODIFIED
            </span>
          )}
          {override?.isLocked && (
            <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded uppercase font-bold">
              LOCKED 🔒
            </span>
          )}
        </div>

        {/* Guide Toggles & View Modes */}
        <div className="flex items-center gap-2">
          {/* Compare Mode Selector */}
          <div className="flex items-center bg-[#1f1f24] rounded border border-[#27272a] p-0.5">
            <button
              onClick={() => onToggleCompareMode('none')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                compareMode === 'none' ? 'bg-[#e05638] text-white' : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
              }`}
              title="Standard single glyph view"
            >
              Current
            </button>
            <button
              onClick={() => onToggleCompareMode('overlay')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                compareMode === 'overlay' ? 'bg-[#e05638] text-white' : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
              }`}
              title="Overlay original vs edited"
            >
              Overlay
            </button>
            <button
              onClick={() => onToggleCompareMode('side-by-side')}
              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                compareMode === 'side-by-side' ? 'bg-[#e05638] text-white' : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
              }`}
              title="Side by side comparison"
            >
              Split
            </button>
          </div>

          <div className="h-4 w-px bg-[#27272a] mx-1" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
            className="p-1.5 hover:bg-[#27272a] rounded text-[#a1a1aa] hover:text-[#f4f4f5]"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono text-[#71717a] w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="p-1.5 hover:bg-[#27272a] rounded text-[#a1a1aa] hover:text-[#f4f4f5]"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1.0)}
            className="p-1.5 hover:bg-[#27272a] rounded text-[#a1a1aa] hover:text-[#f4f4f5]"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main SVG Vector Canvas */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[#09090c] relative">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.1s ease-out' }}
          className="relative"
        >
          {compareMode === 'side-by-side' ? (
            /* Side-by-Side Dual Canvas */
            <div className="flex items-center gap-8">
              {/* Original */}
              <div className="border border-[#27272a] rounded-lg bg-[#121215] p-4 text-center">
                <span className="text-[10px] uppercase font-mono text-[#71717a] block mb-2 font-bold">
                  ORIGINAL BASELINE
                </span>
                <svg
                  width={450}
                  height={500}
                  viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                  className="bg-[#0c0c0e] rounded border border-[#1f1f24]"
                >
                  <GuideLines
                    canvasWidth={canvasWidth}
                    baselineY={baselineY}
                    capHeightY={capHeightY}
                    xHeightY={xHeightY}
                    ascenderY={ascenderY}
                    descenderY={descenderY}
                    advanceX={advanceX}
                  />
                  <path d={originalPathD} fill="#a1a1aa" fillRule="nonzero" />
                </svg>
              </div>

              {/* Edited */}
              <div className="border border-[#e05638]/40 rounded-lg bg-[#121215] p-4 text-center">
                <span className="text-[10px] uppercase font-mono text-[#e05638] block mb-2 font-bold">
                  MODIFIED OUTLINE
                </span>
                <svg
                  width={450}
                  height={500}
                  viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                  className="bg-[#0c0c0e] rounded border border-[#e05638]/30"
                >
                  <GuideLines
                    canvasWidth={canvasWidth}
                    baselineY={baselineY}
                    capHeightY={capHeightY}
                    xHeightY={xHeightY}
                    ascenderY={ascenderY}
                    descenderY={descenderY}
                    advanceX={advanceX}
                  />
                  <path d={transformedPathD} fill="#e05638" fillRule="nonzero" />
                </svg>
              </div>
            </div>
          ) : (
            /* Single / Overlay Canvas */
            <div className="border border-[#27272a] rounded-xl bg-[#121215] p-4 shadow-2xl">
              <svg
                width={650}
                height={550}
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                className="bg-[#0c0c0e] rounded-lg border border-[#1f1f24]"
              >
                {/* Guide lines */}
                <GuideLines
                  canvasWidth={canvasWidth}
                  baselineY={baselineY}
                  capHeightY={capHeightY}
                  xHeightY={xHeightY}
                  ascenderY={ascenderY}
                  descenderY={descenderY}
                  advanceX={advanceX}
                  showBaseline={showBaseline}
                  showCapHeight={showCapHeight}
                  showXHeight={showXHeight}
                  showSideBearings={showSideBearings}
                />

                {/* Bounding Box Guide */}
                {showBoundingBox && (
                  <rect
                    x={bboxX}
                    y={bboxY}
                    width={bboxW}
                    height={bboxH}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity={0.4}
                  />
                )}

                {/* Overlay Mode: Original outline in transparent white/grey */}
                {compareMode === 'overlay' && (
                  <path
                    d={originalPathD}
                    fill="none"
                    stroke="#71717a"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    opacity={0.7}
                  />
                )}

                {/* Active vector glyph outline */}
                <path
                  d={transformedPathD}
                  fill={isEdited ? '#e05638' : '#f4f4f5'}
                  fillRule="nonzero"
                  stroke={isEdited ? '#ffffff' : '#e05638'}
                  strokeWidth="1.5"
                  opacity={0.95}
                />

                {/* Vector Control Points */}
                {showControlPoints &&
                  transformedPathCommands.map((cmd, i) => {
                    if (cmd.x === undefined || cmd.y === undefined) return null;
                    const cx = 200 + cmd.x;
                    const cy = baselineY - cmd.y;
                    return (
                      <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r="3.5"
                        fill="#ffffff"
                        stroke="#e05638"
                        strokeWidth="1.5"
                        className="hover:r-5 transition-all cursor-crosshair"
                      />
                    );
                  })}
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Guide Lines Toggle Bar at Bottom of Canvas */}
      <div className="h-10 border-t border-[#27272a] bg-[#141418] px-4 flex items-center justify-between text-[11px] font-mono text-[#a1a1aa]">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#f4f4f5]">
            <input
              type="checkbox"
              checked={showBaseline}
              onChange={(e) => setShowBaseline(e.target.checked)}
              className="accent-[#e05638] rounded"
            />
            <span>Baseline</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#f4f4f5]">
            <input
              type="checkbox"
              checked={showCapHeight}
              onChange={(e) => setShowCapHeight(e.target.checked)}
              className="accent-[#e05638] rounded"
            />
            <span>Cap Height</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#f4f4f5]">
            <input
              type="checkbox"
              checked={showXHeight}
              onChange={(e) => setShowXHeight(e.target.checked)}
              className="accent-[#e05638] rounded"
            />
            <span>X-Height</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#f4f4f5]">
            <input
              type="checkbox"
              checked={showSideBearings}
              onChange={(e) => setShowSideBearings(e.target.checked)}
              className="accent-[#e05638] rounded"
            />
            <span>Side Bearings</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#f4f4f5]">
            <input
              type="checkbox"
              checked={showBoundingBox}
              onChange={(e) => setShowBoundingBox(e.target.checked)}
              className="accent-[#e05638] rounded"
            />
            <span>BBox</span>
          </label>
        </div>

        <div className="text-[10px] text-[#71717a]">
          ADVANCE: <span className="text-[#f4f4f5] font-bold">{selectedGlyph.advanceWidth}</span> • LSB:{' '}
          <span className="text-[#f4f4f5] font-bold">{Math.round(selectedGlyph.leftSideBearing)}</span> • RSB:{' '}
          <span className="text-[#f4f4f5] font-bold">{Math.round(selectedGlyph.rightSideBearing)}</span>
        </div>
      </div>
    </div>
  );
}

function GuideLines({
  canvasWidth,
  baselineY,
  capHeightY,
  xHeightY,
  ascenderY,
  descenderY,
  advanceX,
  showBaseline = true,
  showCapHeight = true,
  showXHeight = true,
  showSideBearings = true,
}: {
  canvasWidth: number;
  baselineY: number;
  capHeightY: number;
  xHeightY: number;
  ascenderY: number;
  descenderY: number;
  advanceX: number;
  showBaseline?: boolean;
  showCapHeight?: boolean;
  showXHeight?: boolean;
  showSideBearings?: boolean;
}) {
  return (
    <g className="guides opacity-60">
      {/* Origin Left Bearing (X=200) */}
      {showSideBearings && (
        <line x1={200} y1={0} x2={200} y2={1300} stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
      )}
      {/* Advance Width Right Bearing */}
      {showSideBearings && (
        <line x1={advanceX} y1={0} x2={advanceX} y2={1300} stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
      )}

      {/* Ascender Guide */}
      <line x1={0} y1={ascenderY} x2={canvasWidth} y2={ascenderY} stroke="#8b5cf6" strokeWidth="1" strokeDasharray="2 2" />
      <text x={20} y={ascenderY - 4} fill="#8b5cf6" fontSize="10" fontFamily="monospace">
        ASCENDER
      </text>

      {/* Cap Height Guide */}
      {showCapHeight && (
        <>
          <line x1={0} y1={capHeightY} x2={canvasWidth} y2={capHeightY} stroke="#ec4899" strokeWidth="1" strokeDasharray="4 4" />
          <text x={20} y={capHeightY - 4} fill="#ec4899" fontSize="10" fontFamily="monospace">
            CAP HEIGHT
          </text>
        </>
      )}

      {/* X-Height Guide */}
      {showXHeight && (
        <>
          <line x1={0} y1={xHeightY} x2={canvasWidth} y2={xHeightY} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 4" />
          <text x={20} y={xHeightY - 4} fill="#f59e0b" fontSize="10" fontFamily="monospace">
            X-HEIGHT
          </text>
        </>
      )}

      {/* Baseline (Y=0) */}
      {showBaseline && (
        <>
          <line x1={0} y1={baselineY} x2={canvasWidth} y2={baselineY} stroke="#e05638" strokeWidth="1.5" />
          <text x={20} y={baselineY - 4} fill="#e05638" fontSize="10" fontFamily="monospace" fontWeight="bold">
            BASELINE (0)
          </text>
        </>
      )}

      {/* Descender Guide */}
      <line x1={0} y1={descenderY} x2={canvasWidth} y2={descenderY} stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 2" />
      <text x={20} y={descenderY + 12} fill="#3b82f6" fontSize="10" fontFamily="monospace">
        DESCENDER
      </text>
    </g>
  );
}
