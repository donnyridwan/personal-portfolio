import React, { useEffect, useState } from 'react';
import MediaWithSkeleton from './MediaWithSkeleton';
import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';
import { getPublishedProjects, getProjectSlug } from '../lib/projects';
import { projectPath } from '../lib/route';
import { distributeColumns } from '../lib/grid';

// 3 masonry columns on wide screens (Tailwind 2xl, ≥1536px), 2 otherwise
const WIDE_QUERY = '(min-width: 1536px)';
function useColumnCount() {
  const getCount = () => (typeof window !== 'undefined' && window.matchMedia(WIDE_QUERY).matches ? 3 : 2);
  const [count, setCount] = useState(getCount);
  useEffect(() => {
    const mq = window.matchMedia(WIDE_QUERY);
    const update = () => setCount(mq.matches ? 3 : 2);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return count;
}

const GRID_COLS = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3' };

export default function WorkGrid({ projects, isLoading, onOpenProject }) {
  const columnCount = useColumnCount();
  if (isLoading) return <WorkGridSkeleton />;

  const projectList = getPublishedProjects(projects && projects.length > 0 ? projects : portfolioData.projects);
  if (projectList.length === 0) {
    return (
      <div className="flex-1 pb-24 pt-16 flex flex-col items-center text-center gap-2 font-sans">
        <span className="font-serif text-[26px] text-[#171717]">Belum ada project</span>
        <p className="text-[13px] text-[#737373]">Project akan tampil di sini setelah dipublikasikan.</p>
      </div>
    );
  }

  // Columns filled left to right; cards take the cover's natural height (fixed width, free height)
  const columns = distributeColumns(projectList, columnCount);

  return (
    <div className="flex-1 relative pb-24 font-sans">
      {/* On mobile the columns flatten (display: contents) and cards keep their original order */}
      <div className={`flex flex-col gap-8 md:grid ${GRID_COLS[columnCount]} md:gap-7 md:items-start w-full`}>
        {columns.map((column, col) => (
          <div key={col} className="contents md:flex md:flex-col md:gap-7">
            {column.map(({ item: project, index }) => (
              <ProjectCard key={project.id} project={project} index={index} onOpen={onOpenProject} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Placeholder grid shown until live projects load, so no demo card is ever clickable
function WorkGridSkeleton() {
  const columns = [
    ['aspect-[4/3] md:aspect-auto md:h-[365px]', 'aspect-[4/5] md:aspect-auto md:h-[605px]'],
    ['aspect-[4/5] md:aspect-auto md:h-[605px]', 'aspect-[4/3] md:aspect-auto md:h-[369px]'],
    ['aspect-[4/3] md:aspect-auto md:h-[440px]', 'aspect-[4/3] md:aspect-auto md:h-[365px]'],
  ];
  return (
    <div className="flex-1 pb-24" aria-busy="true" aria-label="Loading projects">
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8 md:gap-7 w-full">
        {columns.map((heights, col) => (
          // The third skeleton column only appears where the real grid has 3 columns
          <div key={col} className={`flex-col gap-8 md:gap-7 ${col === 2 ? 'hidden 2xl:flex' : 'flex'}`}>
            {heights.map((h, idx) => (
              <div key={idx} data-skeleton className="flex flex-col gap-3.5">
                <div className={`w-full ${h} bg-[#f5f5f7] motion-safe:animate-pulse`} />
                <div className="h-[14px] w-2/3 bg-[#f5f5f7] motion-safe:animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, index, onOpen }) {
  const slug = getProjectSlug(project);

  return (
    <motion.a
      href={projectPath(slug)}
      onClick={(e) => {
        // Let cmd/ctrl/shift-click open a new tab; plain clicks navigate in-app
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onOpen(slug);
      }}
      style={{ order: index }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay: (index % 4) * 0.08,
      }}
      className="flex flex-col w-full group cursor-pointer"
    >
      <div className="w-full rounded-none relative overflow-hidden">
        <CardMedia project={project} />

        {/* Hover Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-black/15">
          <span className="text-[12px] font-sans font-medium text-neutral-800 bg-white/95 px-3 py-1 rounded-none w-fit backdrop-blur-sm shadow-sm tracking-tight">
            {project.category}
          </span>
          <span className="text-[12px] font-sans text-neutral-800 font-medium flex items-center gap-1.5 self-end bg-white/95 px-3.5 py-1.5 rounded-none shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0.5">
            View Case Study →
          </span>
        </div>
      </div>

      {/* Text Info Below Container */}
      <div className="pt-[14px] flex items-start justify-between w-full font-sans tracking-[-0.3px]">
        <h3 className="text-[15px] font-normal leading-[21px] text-[#1a1815] group-hover:text-black transition-colors duration-300 pr-4">
          <span className="bg-gradient-to-r from-black to-black bg-[length:0%_1px] bg-left-bottom bg-no-repeat group-hover:bg-[length:100%_1px] transition-[background-size] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pb-0.5">
            {project.title}
          </span>
        </h3>
        <span className="text-[14px] font-normal leading-[21.7px] text-[#737373] shrink-0 font-light">
          {project.year}
        </span>
      </div>
    </motion.a>
  );
}

// Grid cover at its natural ratio (fixed width, free height) with a skeleton until it loads
function CardMedia({ project }) {
  const videoSrc = project.video || project.video_url;
  const isVideo = (project.mediaType === 'video' || Boolean(videoSrc)) && Boolean(videoSrc);
  const url = isVideo ? videoSrc : project.image;
  if (!url) return <div className="aspect-[4/3] bg-[#efefef]" />;
  return <MediaWithSkeleton url={url} mediaType={isVideo ? 'video' : 'image'} alt={project.title} mode="natural" />;
}
