import React, { useState } from 'react';
import { portfolioData } from '../data/portfolioData';

export default function WorkGrid({ onSelectProject, onOpenChat }) {
  // We can let the user toggle between the authentic minimalist Figma solid view (#e7eef0) and rich visual preview!
  const [showPreviews, setShowPreviews] = useState(false);

  const leftColumnProjects = [
    portfolioData.projects[0], // 365px
    portfolioData.projects[1], // 605px
    portfolioData.projects[2], // 369px
  ];

  const rightColumnProjects = [
    portfolioData.projects[3], // 605px
    portfolioData.projects[4], // 369px
  ];

  return (
    <div className="flex-1 relative pb-24">
      {/* View Toggle Bar (Subtle preview switch for best UX) */}
      <div className="flex items-center justify-end gap-2 mb-4 px-2">
        <button
          onClick={() => setShowPreviews(!showPreviews)}
          className="text-[12px] font-sans text-[#8a857d] hover:text-black flex items-center gap-1.5 transition-colors bg-[#f7f6f3] px-3 py-1.5 rounded-full border border-[#ede9e2]"
        >
          <span className="w-2 h-2 rounded-full bg-[#1e1e1e]" />
          <span>{showPreviews ? 'Minimal View (Figma Wire)' : 'Show Rich Project Previews'}</span>
        </button>
      </div>

      {/* Masonry 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        {/* Left Column */}
        <div className="flex flex-col gap-6">
          {leftColumnProjects.map((project, idx) => {
            const containerHeight = idx === 0 ? 'h-[365px]' : idx === 1 ? 'h-[605px]' : 'h-[369px]';
            return (
              <ProjectCard
                key={project.id}
                project={project}
                containerHeight={containerHeight}
                showPreviews={showPreviews}
                onSelect={() => onSelectProject(project)}
              />
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {rightColumnProjects.map((project, idx) => {
            const containerHeight = idx === 0 ? 'h-[605px]' : 'h-[369px]';
            return (
              <ProjectCard
                key={project.id}
                project={project}
                containerHeight={containerHeight}
                showPreviews={showPreviews}
                onSelect={() => onSelectProject(project)}
              />
            );
          })}
        </div>
      </div>

      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-8 right-8 z-30 flex items-center gap-3">
        <button
          onClick={onOpenChat}
          className="btn-dark-glow w-[48px] h-[48px] rounded-full border border-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-all group"
          title="Chat With Jhonny"
        >
          <img
            src="./assets/bot-icon.svg"
            alt="Chat Bot"
            className="w-[42px] h-[42px] object-contain group-hover:rotate-6 transition-transform"
          />
        </button>
      </div>
    </div>
  );
}

function ProjectCard({ project, containerHeight, showPreviews, onSelect }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <article
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col w-full group cursor-pointer"
    >
      {/* Visual Canvas Container */}
      <div
        className={`w-full ${containerHeight} bg-[#e7eef0] rounded-[4px] relative overflow-hidden transition-all duration-300 ${
          isHovered ? 'shadow-md -translate-y-1' : ''
        }`}
      >
        {showPreviews ? (
          <div className="w-full h-full relative overflow-hidden">
            <img
              src={project.image}
              alt={project.title}
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded text-[11px] font-sans font-medium text-neutral-800">
              {project.category}
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-between p-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black/5">
            <span className="text-[12px] font-sans font-medium text-neutral-600 bg-white/80 px-2.5 py-1 rounded w-fit backdrop-blur-sm">
              {project.category}
            </span>
            <span className="text-[12px] font-sans text-neutral-700 font-medium flex items-center gap-1 self-end bg-white/90 px-3 py-1 rounded shadow-sm">
              View Case Study →
            </span>
          </div>
        )}
      </div>

      {/* Text Info Below Container */}
      <div className="pt-[14px] flex items-start justify-between w-full font-sans tracking-[-0.3px]">
        <h3 className="text-[15px] font-normal leading-[21px] text-[#1a1815] group-hover:underline underline-offset-2 pr-4">
          {project.title}
        </h3>
        <span className="text-[14px] font-normal leading-[21.7px] text-[#6b665e] shrink-0">
          {project.year}
        </span>
      </div>
    </article>
  );
}
