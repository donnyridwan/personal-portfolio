import React, { useRef, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Copy,
  GripVertical,
  Image as ImageIcon,
  LayoutGrid,
  Plus,
  Quote,
  Trash2,
  Type,
  Video,
} from 'lucide-react';
import { BLOCK_TYPES, createBlock, duplicateBlock } from '../../lib/blocks';
import TextBlockEditor from './blocks/TextBlockEditor';
import ImageBlockEditor from './blocks/ImageBlockEditor';
import GalleryBlockEditor from './blocks/GalleryBlockEditor';
import VideoBlockEditor from './blocks/VideoBlockEditor';
import MetricsBlockEditor from './blocks/MetricsBlockEditor';
import QuoteBlockEditor from './blocks/QuoteBlockEditor';

// Icons stay here (not in lib/blocks.js) so the registry remains usable from the /api functions
const ICONS = { text: Type, image: ImageIcon, gallery: LayoutGrid, video: Video, metrics: BarChart3, quote: Quote };

const EDITORS = {
  text: TextBlockEditor,
  image: ImageBlockEditor,
  gallery: GalleryBlockEditor,
  video: VideoBlockEditor,
  metrics: MetricsBlockEditor,
  quote: QuoteBlockEditor,
};

const LABELS = Object.fromEntries(BLOCK_TYPES.map((b) => [b.type, b.label]));

export default function BlockEditor({ blocks, onChange }) {
  // 'closed' | 'open' | 'closing' — drives the transitions.dev menu-dropdown classes
  const [menuState, setMenuState] = useState('closed');
  const closeTimer = useRef(null);
  const isMenuOpen = menuState === 'open';

  const openMenu = () => {
    clearTimeout(closeTimer.current);
    setMenuState('open');
  };
  const closeMenu = () => {
    setMenuState('closing');
    clearTimeout(closeTimer.current);
    // Matches --dropdown-close-dur
    closeTimer.current = setTimeout(() => setMenuState('closed'), 150);
  };

  const updateBlock = (id, patch) => onChange(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const moveBlock = (idx, delta) => {
    const target = idx + delta;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const duplicateAt = (idx) => onChange([...blocks.slice(0, idx + 1), duplicateBlock(blocks[idx]), ...blocks.slice(idx + 1)]);

  const removeAt = (idx) => {
    if (!confirm('Hapus block ini?')) return;
    onChange(blocks.filter((_, i) => i !== idx));
  };

  const addBlock = (type) => {
    onChange([...blocks, createBlock(type)]);
    closeMenu();
  };

  return (
    <div className="flex flex-col gap-4">
      {blocks.length === 0 && (
        <p className="text-[13px] text-[#737373] border border-dashed border-[#d4d4d8] px-5 py-8 text-center">
          Belum ada block. Tambahkan block pertama untuk mulai menyusun case study.
        </p>
      )}

      <Reorder.Group axis="y" values={blocks} onReorder={onChange} className="flex flex-col gap-4">
        {blocks.map((block, idx) => (
          <BlockCard
            key={block.id}
            block={block}
            isFirst={idx === 0}
            isLast={idx === blocks.length - 1}
            onChange={(patch) => updateBlock(block.id, patch)}
            onMoveUp={() => moveBlock(idx, -1)}
            onMoveDown={() => moveBlock(idx, 1)}
            onDuplicate={() => duplicateAt(idx)}
            onRemove={() => removeAt(idx)}
          />
        ))}
      </Reorder.Group>

      <div className="relative self-start">
        <button
          type="button"
          onClick={() => (isMenuOpen ? closeMenu() : openMenu())}
          aria-expanded={isMenuOpen}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-[#171717] text-white text-[12.5px] font-medium hover:bg-black cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tambah block
        </button>
        <div
          inert={!isMenuOpen}
          data-origin="top-left"
          className={`t-dropdown ${menuState === 'open' ? 'is-open' : ''} ${menuState === 'closing' ? 'is-closing' : ''} absolute left-0 top-full mt-1.5 z-20 w-[220px] bg-white border border-[#e5e5e7] shadow-lg py-1`}
        >
            {BLOCK_TYPES.map(({ type, label }) => {
              const Icon = ICONS[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => addBlock(type)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] text-[#171717] hover:bg-[#f5f5f7] text-left cursor-pointer"
                >
                  <Icon className="w-4 h-4 text-[#737373]" />
                  {label}
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function BlockCard({ block, isFirst, isLast, onChange, onMoveUp, onMoveDown, onDuplicate, onRemove }) {
  // Drag only from the handle so text inside the fields stays selectable
  const dragControls = useDragControls();
  const Icon = ICONS[block.type];
  const Editor = EDITORS[block.type];

  const iconButton = 'p-1.5 text-[#888] hover:text-black disabled:opacity-30 disabled:hover:text-[#888] cursor-pointer disabled:cursor-not-allowed';

  return (
    <Reorder.Item
      value={block}
      dragListener={false}
      dragControls={dragControls}
      className="bg-[#fafafa] border border-[#e5e5e7] relative"
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#e5e5e7] bg-white">
        <button
          type="button"
          onPointerDown={(e) => dragControls.start(e)}
          className="p-1 text-[#aaa] hover:text-black cursor-grab active:cursor-grabbing touch-none"
          title="Geser untuk mengubah urutan"
          aria-label="Geser block"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <Icon className="w-4 h-4 text-[#737373]" />
        <span className="text-[12px] font-medium uppercase tracking-[0.5px] text-[#171717] flex-1">{LABELS[block.type]}</span>
        <button type="button" onClick={onMoveUp} disabled={isFirst} className={iconButton} title="Naikkan" aria-label="Naikkan block">
          <ArrowUp className="w-4 h-4" />
        </button>
        <button type="button" onClick={onMoveDown} disabled={isLast} className={iconButton} title="Turunkan" aria-label="Turunkan block">
          <ArrowDown className="w-4 h-4" />
        </button>
        <button type="button" onClick={onDuplicate} className={iconButton} title="Duplikat" aria-label="Duplikat block">
          <Copy className="w-4 h-4" />
        </button>
        <button type="button" onClick={onRemove} className={`${iconButton} hover:text-red-600`} title="Hapus" aria-label="Hapus block">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 sm:p-5">
        <Editor block={block} onChange={onChange} />
      </div>
    </Reorder.Item>
  );
}
