// Sekali jalan: isi About, Kontak, Notes (Experience & Services), dan catatan AI dari CV Donny Ridwan Setiawan.
// Jalankan: npx tsx --env-file=.env.local scripts/seed-cv.ts
// Setelah ini semua bisa diubah dari admin (Profil, dan kanvas Notes di mode edit).
import { neon } from '@neondatabase/serverless';
import { validateDoc, type DocNode } from '../lib/blocks';

const sql = neon(process.env.DATABASE_URL!);

const t = (text: string, marks?: string[]): DocNode =>
  marks ? { type: 'text', text, marks: marks.map(type => ({ type })) } : { type: 'text', text };
const p = (...content: DocNode[]): DocNode => ({ type: 'paragraph', content });
const h = (level: number, text: string): DocNode => ({ type: 'heading', attrs: { level }, content: [t(text)] });
const ul = (items: string[]): DocNode => ({
  type: 'bulletList',
  content: items.map(i => ({ type: 'listItem', content: [p(t(i))] })),
});
const doc = (...content: DocNode[]): DocNode => {
  const d = validateDoc({ type: 'doc', content });
  if (!d) throw new Error('dokumen tidak valid');
  return d;
};
const job = (role: string, company: string, meta: string, points: string[], achievements: string[] = []) => [
  h(2, `${role} — ${company}`),
  p(t(meta, ['italic'])),
  ul(points),
  ...(achievements.length ? [p(t('Key achievements', ['bold'])), ul(achievements)] : []),
];

const about = {
  name: 'Donny Ridwan Setiawan',
  role: 'Senior UI/UX & Product Designer',
  avatar: '',
  paragraphs: [
    'Hi there, my name is Donny Ridwan Setiawan',
    'I’m a Senior UI/UX and Product Designer with 4+ years of experience helping SaaS, fintech, and e-commerce products convert, working remotely with teams in Indonesia, the Philippines, Australia, Saudi Arabia, and the UAE.',
    'I find where users get stuck or drop off, then research, wireframe, prototype, and test the fix in Figma. Every project ships with a design system developers can actually use, and I take designs live on WordPress or Shopify using AI-assisted development.',
    'Recent results: +20% user retention on a SaaS redesign, +25% e-commerce conversion rate, +30% fintech app downloads, and an event-tracking app used at an F1-related event and Hajj 2025.',
  ],
  // Halaman About (tata letak dari screenshot pemilik, isi dari CV)
  headline: 'I design products people can actually finish using.',
  subtitle: 'Senior UI/UX and Product Designer, 4+ years in SaaS, fintech and e-commerce. I look for the screen where users get stuck or drop off, then redesign it in Figma and test it with real users.',
  bookUrl: '',
  statsIntro: 'Four numbers from the last four years, three of them from Upwork.',
  stats: [
    { value: '4+', unit: 'Yrs', label: 'Designing digital products' },
    { value: '60+', unit: '', label: 'Contracts completed on Upwork' },
    { value: '100%', unit: '', label: 'Job Success Score on Upwork' },
    { value: '1,200+', unit: '', label: 'Hours logged on Upwork' },
  ],
  experienceIntro: 'Two roles I still hold, and three I\'ve wrapped up.',
  experience: [
    { role: 'Senior Product Designer', company: 'Gandaria Studio · Semarang', period: 'Feb 2024 – Present',
      summary: 'Led a SaaS redesign that lifted user retention 20% and task completion 15%. I also built the Figma design system our developers hand off from, and raised one e-commerce client\'s conversion rate by 25%.' },
    { role: 'Freelance UI/UX & Website Designer', company: 'Upwork · Remote', period: 'May 2024 – Present',
      summary: 'I design landing pages and marketing sites for e-commerce and DTC brands, and run CRO audits on the ones they already have. 60+ contracts so far, with Top Rated status.' },
    { role: 'UI/UX Designer', company: 'Tappifyd · Jeddah, Saudi Arabia', period: 'Dec 2024 – Jun 2026',
      summary: 'Led design of an event participant-tracking app, first used at an F1-related event and later during Hajj 2025. I also helped turn an MVP into a B2B platform for hospitals, hotels and other industries.' },
    { role: 'UI/UX Designer (Internship)', company: 'Aksantara Digital · Semarang', period: 'Oct 2023 – Mar 2024',
      summary: 'Designed mobile and web screens for 5+ client pitch decks and a fashion marketplace. One of my Dribbble shots reached 20,000 impressions and 150 likes.' },
    { role: 'UI Designer (Internship)', company: 'Tupai Tech · Surakarta', period: 'Jul 2022 – Sep 2022',
      summary: 'Redesigned the website for an ERP dashboard product. After launch, engagement went up 30%, inquiries 25% and conversions 15%.' },
  ],
  testimonials: [] as { name: string; title: string; quote: string; rating?: number }[],
};

const contact = {
  email: 'halo@donnyridwan.my.id',
  links: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/donnyrs/' },
    { label: 'Phone', url: 'tel:+6285156019065' },
  ],
};

const experience = doc(
  ...job('Senior Product Designer', 'Gandaria Studio', 'Feb 2024 – Present · Semarang, Indonesia', [
    'Led an end-to-end UX redesign of a SaaS platform, lifting user retention by 20% and task completion by 15%.',
    'Raised an e-commerce platform’s conversion rate by 25% with engineering and marketing through CRO-focused UX changes: clearer hierarchy, stronger CTAs, and simpler navigation.',
    'Designed and prototyped a fintech mobile app; feedback-driven iterations drove a 30% increase in downloads.',
    'Simplified an analytics dashboard used by 500+ internal users by restructuring its information architecture and prioritizing critical data.',
    'Built a scalable Figma design system that improved consistency and sped up developer handoff.',
    'Shipped 5 WordPress/Shopify websites from Figma to launch using AI-assisted development.',
  ]),
  ...job('Freelance UI/UX & Website Designer', 'Upwork', 'May 2024 – Present · Remote', [
    'Designed conversion-focused landing pages and marketing websites for e-commerce and DTC brands, delivered as responsive Figma layouts ready for developer handoff.',
    'Ran UX and CRO audits of marketing sites and landing pages, turning findings on hierarchy, messaging, and CTAs into design fixes.',
    'Managed multiple remote client engagements across industries, from requirements to organized Figma handoff.',
  ], [
    'Completed 60+ contracts and 1,200+ hours on Upwork across website design, landing pages, SaaS, e-commerce, mobile app, and CRO projects.',
    'Earned Top Rated status with a 100% Job Success Score.',
  ]),
  ...job('UI/UX Designer', 'Tappifyd', 'Dec 2024 – Jun 2026 · Jeddah, Saudi Arabia', [
    'Led product design of an event participant-tracking app for an F1-related event, later used during Hajj 2025.',
    'Designed a food-ordering app for the Middle East market, used by several restaurants in the UAE.',
    'Redesigned an MVP into a multi-sector B2B platform for hospitals, hotels, and other industries.',
    'Turned complex business requirements into user flows, wireframes, prototypes, and production-ready UI.',
    'Established reusable UI patterns, components, and responsive standards for multi-industry workflows.',
  ], [
    'Designed an event-tracking product used in high-volume operations, including an F1-related event and Hajj 2025.',
    'Transformed an MVP into a multi-sector B2B platform for hospital, hotel, and broader business use cases.',
  ]),
  ...job('UI/UX Designer (Internship)', 'Aksantara Digital', 'Oct 2023 – Mar 2024 · Semarang, Indonesia', [
    'Published a Dribbble shot that reached 20,000 impressions and 150 likes, drawing inbound inquiries from international clients.',
    'Designed mobile and web interfaces for 5+ client pitch decks.',
    'Designed UI/UX for a fashion marketplace with 100+ listings, improving product discovery and navigation.',
  ]),
  ...job('UI Designer (Internship)', 'Tupai Tech', 'Jul 2022 – Sep 2022 · Surakarta, Indonesia', [
    'Redesigned an ERP dashboard website, driving +30% engagement, +25% inquiries, and +15% conversions.',
    'Applied CRO and WCAG accessibility practices, improving UX by 25%.',
    'Revamped the company website’s branding, accessibility, and SEO, growing organic traffic.',
  ]),
  { type: 'horizontalRule' },
  h(2, 'Education'),
  p(t('Computer Engineering, Diponegoro University', ['bold'])),
  p(t('Bachelor of Engineering (BE), GPA 3.79/4.00 · Aug 2020 – Apr 2024', ['italic'])),
);

const services = doc(
  h(2, 'What I can help with'),
  p(t('Website Design', ['bold']), t(' — responsive websites, marketing websites, and landing pages, taken live on WordPress or Shopify.')),
  p(t('Conversion Rate Optimization', ['bold']), t(' — conversion-focused UX, CTA strategy, and funnel optimization.')),
  p(t('UI/UX Design', ['bold']), t(' — user flows, wireframing, high-fidelity UI, prototyping, UX research, SaaS dashboards, and B2B platforms.')),
  p(t('Figma & Design Systems', ['bold']), t(' — auto layout, components, variants, and developer handoff.')),
  p(t('SEO & Web Accessibility', ['bold']), t(' — SEO-aware layouts, mobile-first design, WCAG, and responsive QA.')),
  p(t('AI-assisted Workflow', ['bold']), t(' — prompt engineering, AI-assisted development, and AI image generation.')),
  h(2, 'How I work'),
  ul([
    'Client communication: requirement gathering, design rationale, feedback management, and expectation setting.',
    'Cross-functional collaboration: remote teams, marketing, developers, and stakeholder alignment.',
    'Project management: task prioritization, deadline management, scope awareness, and an organized workflow.',
    'Problem solving: user-centered thinking, conversion-focused decisions, design iteration, and attention to detail.',
  ]),
  p(
    t('Open to projects — email '),
    { type: 'text', text: 'halo@donnyridwan.my.id', marks: [{ type: 'link', attrs: { href: 'mailto:halo@donnyridwan.my.id' } }] },
    t(' or connect on '),
    { type: 'text', text: 'LinkedIn', marks: [{ type: 'link', attrs: { href: 'https://www.linkedin.com/in/donnyrs/' } }] },
    t('.'),
  ),
);

const aiKnowledge = `CV ringkas Donny Ridwan Setiawan (Senior UI/UX & Product Designer):
- 4+ tahun pengalaman, fokus SaaS, fintech, dan e-commerce; bekerja remote dengan tim di Indonesia, Filipina, Australia, Arab Saudi, dan UEA.
- Gandaria Studio, Semarang — Senior Product Designer (part-time), Feb 2024–sekarang: redesign UX SaaS (+20% retensi, +15% task completion), CRO e-commerce (+25% konversi), app fintech (+30% unduhan), dashboard analitik untuk 500+ pengguna internal, design system Figma, 5 situs WordPress/Shopify dengan pengembangan berbantuan AI.
- Upwork, remote — Freelance UI/UX & Website Designer, Mei 2024–sekarang: 60+ kontrak, 1.200+ jam, Top Rated, Job Success Score 100%.
- Tappifyd, Jeddah — UI/UX Designer (part-time), Des 2024–Jun 2026: app pelacak peserta event untuk acara terkait F1 lalu dipakai saat Haji 2025; app pemesanan makanan untuk restoran di UEA; MVP jadi platform B2B multi-sektor (rumah sakit, hotel).
- Aksantara Digital, Semarang — UI/UX Designer (magang), Okt 2023–Mar 2024: shot Dribbble 20.000 impresi & 150 likes; UI untuk 5+ pitch deck; marketplace fashion 100+ listing.
- Tupai Tech, Surakarta — UI Designer (magang), Jul–Sep 2022: redesign dashboard ERP (+30% engagement, +25% inquiry, +15% konversi), praktik CRO & WCAG.
- Pendidikan: Teknik Komputer, Universitas Diponegoro (S.T.), IPK 3,79/4,00, 2020–2024.
- Keahlian: website design (WordPress, Shopify), CRO, UI/UX (user flow, wireframe, prototipe, riset), Figma & design system, SEO & aksesibilitas (WCAG), alur kerja berbantuan AI.
- Kontak: halo@donnyridwan.my.id · LinkedIn https://www.linkedin.com/in/donnyrs/
- Terbuka untuk proyek; untuk tarif dan ketersediaan, arahkan pengunjung ke email.`;

const upsert = (key: string, value: unknown) =>
  sql`insert into settings (key, value) values (${key}, ${JSON.stringify(value)}::jsonb)
      on conflict (key) do update set value = excluded.value`;

const [ai] = (await sql`select value from settings where key = 'ai'`) as { value: { name?: string } }[];
await upsert('about', about);
await upsert('contact', contact);
await upsert('notes', { experience, services });
await upsert('ai', { name: ai?.value?.name || 'Donny AI', knowledge: aiKnowledge });
console.log('About, Kontak, Notes (Experience & Services), dan catatan AI diisi dari CV.');
