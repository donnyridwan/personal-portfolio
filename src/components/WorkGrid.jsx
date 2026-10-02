import React from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';

export default function WorkGrid({ projects, onSelectProject }) {
  const projectList = projects && projects.length > 0 ? projects : portfolioData.projects;

  // Split into 2 columns
  const leftColumnProjects = projectList.filter((_, idx) => idx % 2 === 0);
  const rightColumnProjects = projectList.filter((_, idx) => idx % 2 === 1);

  return (
    <div className="flex-1 relative pb-24 font-sans">
      {/* Masonry 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 w-full">
        {/* Left Column */}
        <div className="flex flex-col gap-7">
          {leftColumnProjects.map((project, idx) => {
            const containerHeight =
              project.span === 'tall'
                ? 'h-[605px]'
                : project.span === 'medium'
                ? 'h-[460px]'
                : idx === 0
                ? 'h-[365px]'
                : idx === 1
                ? 'h-[605px]'
                : 'h-[369px]';
            return (
              <ProjectCard
                key={project.id}
                project={project}
                index={idx * 2}
                containerHeight={containerHeight}
                onSelect={() => onSelectProject(project)}
              />
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-7">
          {rightColumnProjects.map((project, idx) => {
            const containerHeight =
              project.span === 'tall'
                ? 'h-[605px]'
                : project.span === 'short'
                ? 'h-[369px]'
                : idx === 0
                ? 'h-[605px]'
                : 'h-[369px]';
            return (
              <ProjectCard
                key={project.id}
                project={project}
                index={idx * 2 + 1}
                containerHeight={containerHeight}
                onSelect={() => onSelectProject(project)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, index, containerHeight, onSelect }) {
  const videoSrc = project.video || project.video_url;
  const isVideo = project.mediaType === 'video' || Boolean(videoSrc);

  return (
    <motion.article
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1],
        delay: (index % 4) * 0.08,
      }}
      className="flex flex-col w-full group cursor-pointer"
    >
      {/* Visual Canvas Container with radius 0 */}
      <div
        style={{ backgroundColor: project.accentColor || '#e7eef0' }}
        className={`w-full ${containerHeight} rounded-none relative overflow-hidden`}
      >
        {/* Image or Video from Cloudinary / Database */}
        {isVideo && videoSrc ? (
          <video
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover absolute inset-0"
          />
        ) : project.image ? (
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover absolute inset-0"
          />
        ) : null}

        {/* Hover Overlay */}
        <div className="w-full h-full relative z-10 flex flex-col justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] bg-black/15">
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
    </motion.article>
  );
}
