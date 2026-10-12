import React from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react';

// One draggable project row in the CMS list; dragging starts only from the handle
export default function ProjectListRow({ project, isFirst, isLast, onDragStart, onDragEnd, onMoveUp, onMoveDown, onEdit, onDelete }) {
  const dragControls = useDragControls();
  const iconButton = 'p-1.5 text-[#888] hover:text-black disabled:opacity-30 disabled:hover:text-[#888] cursor-pointer disabled:cursor-not-allowed';

  return (
    <Reorder.Item
      value={project}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="bg-white border border-[#e5e5e7] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-[#b3b3b3] relative"
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <button
          type="button"
          onPointerDown={(e) => dragControls.start(e)}
          className="p-1 -ml-1 text-[#aaa] hover:text-black cursor-grab active:cursor-grabbing touch-none shrink-0"
          title="Geser untuk mengubah urutan"
          aria-label={`Geser ${project.title.trim()}`}
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Thumbnail */}
        <div className="w-20 h-16 bg-[#e7eef0] shrink-0 border border-[#e5e5e7] overflow-hidden flex items-center justify-center">
          {project.video ? (
            <span className="text-[11px] font-mono font-medium text-[#555]">▶ Video</span>
          ) : project.image ? (
            <img src={project.image} alt="" draggable={false} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[11px] text-[#999]">No Media</span>
          )}
        </div>

        <div className="flex flex-col min-w-0">
          <h4 className="font-medium text-[15px] text-[#171717] truncate">{project.title}</h4>
          <p className="text-[12.5px] text-[#737373] mt-0.5">
            {project.category} • {project.year}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {project.tools?.slice(0, 3).map((t, ti) => (
              <span key={ti} className="text-[10.5px] text-[#888] bg-[#f7f7f8] px-1.5 py-0.5 border border-[#ececee]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 self-end sm:self-center">
        <button type="button" onClick={onMoveUp} disabled={isFirst} className={iconButton} title="Naikkan" aria-label="Naikkan urutan">
          <ArrowUp className="w-4 h-4" />
        </button>
        <button type="button" onClick={onMoveDown} disabled={isLast} className={iconButton} title="Turunkan" aria-label="Turunkan urutan">
          <ArrowDown className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="ml-2 px-3 py-1.5 bg-[#f5f5f7] border border-[#e5e5e7] text-[12px] font-medium text-[#333] hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="ml-2 px-3 py-1.5 bg-white border border-[#e5e5e7] text-[12px] font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          Hapus
        </button>
      </div>
    </Reorder.Item>
  );
}
