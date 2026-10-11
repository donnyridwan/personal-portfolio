import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { normalizeCaseStudy, isRenderable } from '../lib/blocks';
import BlockRenderer from './blocks/BlockRenderer';
import StaggerOnMount from './motion/StaggerOnMount';
import LearnChevron from './motion/LearnChevron';
import { getAdjacentProjects, getDetailCover, getProjectSlug } from '../lib/projects';
import { projectPath } from '../lib/route';

export default function ProjectDetail({ project, projects, isLoading, onOpenProject, onBack, onBookCall }) {
  if (!project) {
    if (isLoading) return null;
    return <ProjectNotFound onBack={onBack} />;
  }

  const caseStudy = normalizeCaseStudy(project.caseStudy);
  const slug = getProjectSlug(project);
  const { prev, next } = getAdjacentProjects(projects, slug);

  const meta = [
    { label: 'Client', value: caseStudy.client },
    { label: 'Role', value: project.role },
    { label: 'Year', value: project.year },
    { label: 'Tools', value: (project.tools || []).join(', ') },
  ].filter((item) => item.value);

  return (
    <article className="w-full max-w-[880px] mx-auto pb-24 font-sans">
      <BackLink onBack={onBack} />

      {/* Hero */}
      <StaggerOnMount as="header" className="pt-8 md:pt-10 pb-8 md:pb-10">
        <span className="t-stagger-line t-stagger-line--1 text-[11px] font-medium tracking-[0.66px] uppercase text-[#a3a3a3]">
          {[project.category, project.year].filter(Boolean).join(' · ')}
        </span>
        <h1 className="t-stagger-line t-stagger-line--2 font-serif font-normal text-[36px] md:text-[52px] leading-[1.1] tracking-[-0.64px] text-[#171717] mt-3">
          {project.title.trim()}
        </h1>
        {caseStudy.summary && (
          <p className="t-stagger-line t-stagger-line--3 font-light text-[15px] leading-[24px] tracking-[-0.3px] text-[#737373] mt-4 max-w-[640px]">
            {caseStudy.summary}
          </p>
        )}

        {meta.length > 0 && (
          <dl className="t-stagger-line t-stagger-line--4 !grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 mt-8 pt-6 border-t border-[#eeeeee]">
            {meta.map((item) => (
              <div key={item.label} className="flex flex-col gap-1 min-w-0">
                <dt className="text-[11px] font-medium tracking-[0.66px] uppercase text-[#a3a3a3]">{item.label}</dt>
                <dd className="text-[14px] text-[#171717] tracking-[-0.2px] break-words">{item.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {caseStudy.liveUrl && (
          <a
            href={caseStudy.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="t-stagger-line t-stagger-line--4 !inline-flex mt-8 items-center gap-1.5 h-[38px] px-4 border border-[#171717] text-[13.5px] font-medium text-[#171717] hover:bg-[#171717] hover:text-white transition-colors duration-300"
          >
            Visit live site
            <ArrowUpRight className="w-4 h-4" />
          </a>
        )}
      </StaggerOnMount>

      <ProjectCover project={project} />

      {/* Story */}
      <div className="mt-12 md:mt-16">
        <ProjectBody project={project} caseStudy={caseStudy} />
      </div>

      {(prev || next) && (
        <nav className="mt-20 md:mt-24 pt-10 border-t border-[#eeeeee] grid grid-cols-1 sm:grid-cols-2 gap-6" aria-label="More projects">
          {prev && <AdjacentCard project={prev} direction="prev" onOpenProject={onOpenProject} />}
          {next && <AdjacentCard project={next} direction="next" onOpenProject={onOpenProject} />}
        </nav>
      )}

      {/* CTA */}
      <section className="mt-16 bg-[#f5f5f7] border border-[#e5e5e7] px-6 py-10 sm:p-12 flex flex-col items-center text-center">
        <h2 className="font-serif font-normal text-[28px] sm:text-[36px] tracking-[-0.64px] text-[#171717]">
          Have a similar project in mind?
        </h2>
        <p className="font-light text-[13.5px] text-[#737373] mt-1">Let's talk about what you're building.</p>
        <button
          onClick={onBookCall}
          className="mt-7 btn-dark-glow h-[38px] px-[18px] rounded-none flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="font-medium text-[14px] text-white tracking-[-0.28px] whitespace-nowrap leading-none">
            Book a Call
          </span>
          <img src="/assets/call-icon.png" alt="" className="w-[17px] h-[14px] object-contain" />
        </button>
      </section>
    </article>
  );
}

function BackLink({ onBack }) {
  return (
    <a
      href="/#work"
      onClick={(e) => {
        e.preventDefault();
        onBack();
      }}
      className="t-learn t-learn--back inline-flex items-center gap-1 text-[13px] text-[#737373] hover:text-black transition-colors"
    >
      <LearnChevron direction="left" />
      All work
    </a>
  );
}

// Detail cover at a fixed 4:3 (Dribbble shot frame), cropped to fit; only the All Work grid uses free heights
function ProjectCover({ project }) {
  const cover = getDetailCover(project);
  if (!cover.url) return null;
  return (
    <div className="w-full aspect-[4/3] overflow-hidden relative" style={{ backgroundColor: project.accentColor || '#e7eef0' }}>
      <CoverMedia cover={cover} alt={project.title} />
    </div>
  );
}

function CoverMedia({ cover, alt, className = '' }) {
  const mediaClass = `absolute inset-0 w-full h-full object-cover ${className}`;
  return cover.mediaType === 'video' ? (
    <video src={cover.url} autoPlay loop muted playsInline className={mediaClass} />
  ) : (
    <img src={cover.url} alt={alt} className={mediaClass} />
  );
}

// Authored blocks, or the legacy description as an "Overview" text block when none are renderable yet
function ProjectBody({ project, caseStudy }) {
  const blocks = caseStudy.blocks.some(isRenderable)
    ? caseStudy.blocks
    : [{ id: 'overview', type: 'text', label: 'Overview', heading: '', body: project.description || '' }];
  return <BlockRenderer blocks={blocks} />;
}

function AdjacentCard({ project, direction, onOpenProject }) {
  const slug = getProjectSlug(project);
  const isNext = direction === 'next';
  const thumb = getDetailCover(project);

  return (
    <a
      href={projectPath(slug)}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onOpenProject(slug);
      }}
      className={`t-learn ${isNext ? '' : 't-learn--back'} group flex flex-col gap-3 ${isNext ? 'sm:text-right' : ''}`}
    >
      <div
        className="w-full aspect-[4/3] overflow-hidden relative"
        style={{ backgroundColor: project.accentColor || '#e7eef0' }}
      >
        {thumb.url && (
          <CoverMedia
            cover={thumb}
            alt=""
            className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          />
        )}
      </div>
      <span
        className={`flex items-center gap-1.5 text-[11px] font-medium tracking-[0.66px] uppercase text-[#a3a3a3] ${
          isNext ? 'sm:justify-end' : ''
        }`}
      >
        {!isNext && <LearnChevron direction="left" />}
        {isNext ? 'Next' : 'Previous'}
        {isNext && <LearnChevron />}
      </span>
      <span className="text-[15px] text-[#1a1815] tracking-[-0.3px] -mt-1">{project.title.trim()}</span>
    </a>
  );
}

function ProjectNotFound({ onBack }) {
  return (
    <section className="w-full max-w-[880px] mx-auto pb-24 font-sans">
      <BackLink onBack={onBack} />
      <div className="pt-16 flex flex-col items-start gap-3">
        <h1 className="font-serif font-normal text-[36px] md:text-[44px] tracking-[-0.64px] text-[#171717]">
          Project not found
        </h1>
        <p className="font-light text-[14px] text-[#737373]">This project doesn't exist or isn't published yet.</p>
        <button
          onClick={onBack}
          className="mt-4 btn-dark-glow h-[38px] px-4 rounded-none text-white text-[13.5px] font-medium cursor-pointer"
        >
          ← Back to work
        </button>
      </div>
    </section>
  );
}
