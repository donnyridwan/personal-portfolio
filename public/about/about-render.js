// Halaman About (tata letak ala screenshot pemilik, tanpa sidebar) → HTML. Murni, dites dengan node --test.
// Dipakai tab "About me" di app Notes dan Finder → About.

const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const SAFE = /^(https?:\/\/|mailto:|tel:)/i;

const ICON = {
  linkedin: '<path d="M4 6.5v5M4 4.2v.1M7 11.5V8.8c0-1.3.8-2.3 2-2.3s2 1 2 2.3v2.7M7 6.5v5"/><rect x="1.5" y="1.5" width="13" height="13" rx="2"/>',
  mail: '<rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="m2.5 4.5 5.5 4 5.5-4"/>',
  phone: '<path d="M5.5 2.5 3.5 3c-.6.2-1 .8-.9 1.4.6 4.3 4.2 7.9 8.5 8.5.6.1 1.2-.3 1.4-.9l.5-2-2.6-1.2-1.3 1.1A7 7 0 0 1 5.6 7.5l1.1-1.3z"/>',
  link: '<path d="M7 9a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-.6.6M9 7a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l.6-.6"/>',
};
const icon = name => `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;

/** "tel:+6285156019065" → "+62 851-5601-9065" */
export function prettyPhone(url) {
  const n = String(url).replace(/^tel:/, '');
  const m = /^\+62(\d{3})(\d{4})(\d{3,5})$/.exec(n);
  return m ? `+62 ${m[1]}-${m[2]}-${m[3]}` : n;
}

function book(about) {
  const url = about.bookUrl && SAFE.test(about.bookUrl) ? about.bookUrl : '';
  // Tanpa link booking: tombol membuka app Contact (lihat public/contact/contact.js).
  return url
    ? `<a class="ab-btn" href="${esc(url)}" target="_blank" rel="noopener">Book a Call</a>`
    : '<button type="button" class="ab-btn" data-ab-book>Book a Call</button>';
}

function stars(n) {
  const k = Math.max(0, Math.min(5, Math.round(Number(n) || 5)));
  return `<div class="ab-stars" aria-label="${k} dari 5">${'★'.repeat(k)}</div>`;
}

const section = (eyebrow, title, sub, inner) => `
  <section class="ab-section">
    <div class="ab-eyebrow">${esc(eyebrow)}</div>
    <h2 class="ab-title">${esc(title)}</h2>
    ${sub ? `<p class="ab-sub">${esc(sub)}</p>` : ''}
    ${inner}
  </section>`;

/**
 * @param {{ about?: object, contact?: {email?: string, links?: {label:string,url:string}[]} }} data
 */
export function renderAboutPage(data) {
  const a = data?.about ?? {};
  const contact = data?.contact ?? {};
  const links = contact.links ?? [];
  const phone = links.find(l => /^tel:/i.test(l.url));
  const parts = [];

  parts.push(`
    <section class="ab-hero">
      <div class="ab-eyebrow">About me</div>
      <h1 class="ab-headline">${esc(a.headline || a.name || '')}</h1>
      ${a.subtitle ? `<p class="ab-sub">${esc(a.subtitle)}</p>` : ''}
      ${book(a)}
    </section>`);

  const testimonials = (a.testimonials ?? []).filter(t => t?.quote);
  if (testimonials.length) {
    parts.push(`<section class="ab-cards">${testimonials.map(t => `
      <figure class="ab-card">
        <figcaption><b>${esc(t.name)}</b><span>${esc(t.title)}</span></figcaption>
        ${stars(t.rating)}
        <blockquote>“${esc(t.quote)}”</blockquote>
      </figure>`).join('')}</section>`);
  }

  const stats = (a.stats ?? []).filter(s => s?.value);
  if (stats.length) {
    parts.push(section('The proof', 'Numbers that hold up.', a.statsIntro, `
      <div class="ab-stats">${stats.map(s => `
        <div class="ab-stat"><div class="ab-num">${esc(s.value)}${s.unit ? `<small>${esc(s.unit)}</small>` : ''}</div><div class="ab-label">${esc(s.label)}</div></div>`).join('')}
      </div>`));
  }

  const exp = (a.experience ?? []).filter(e => e?.role);
  if (exp.length) {
    parts.push(section('Experience', 'From first brief to final handoff.', a.experienceIntro, `
      <div class="ab-exp">${exp.map(e => `
        <div class="ab-job">
          <div class="ab-job-head"><b>${esc(e.role)}</b><span>${esc(e.company)}</span><small>${esc(e.period)}</small></div>
          <p>${esc(e.summary)}</p>
        </div>`).join('')}
      </div>`));
  }

  const icons = [
    ...links.filter(l => SAFE.test(l.url) && !/^tel:/i.test(l.url)).map(l =>
      `<a href="${esc(l.url)}" target="_blank" rel="noopener" title="${esc(l.label)}" aria-label="${esc(l.label)}">${icon(/linkedin/i.test(l.label) ? 'linkedin' : 'link')}</a>`),
    contact.email ? `<a href="mailto:${esc(contact.email)}" title="Email" aria-label="Email">${icon('mail')}</a>` : '',
    phone ? `<a href="${esc(phone.url)}" title="Phone" aria-label="Phone">${icon('phone')}</a>` : '',
  ].join('');
  parts.push(`
    <section class="ab-contact">
      <div class="ab-eyebrow">Contact</div>
      <h2 class="ab-title">Get in Touch</h2>
      <p class="ab-sub">Have a project in mind? Let’s talk.</p>
      <div class="ab-eyebrow ab-direct">Direct contact</div>
      ${phone ? `<a class="ab-phone" href="${esc(phone.url)}">${esc(prettyPhone(phone.url))}</a>` : ''}
      ${contact.email ? `<a class="ab-email" href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>` : ''}
      ${icons ? `<div class="ab-icons">${icons}</div>` : ''}
      ${book(a)}
    </section>
    <footer class="ab-foot">© Copyright ${esc(a.name || '')}. All rights reserved.</footer>`);

  return `<div class="ab">${parts.join('')}</div>`;
}
