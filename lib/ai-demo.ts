// Mode demo AI Terminal: dipakai selama ANTHROPIC_API_KEY belum diisi.
// Menjawab pertanyaan dasar dari data portofolio dengan pencocokan kata kunci (tanpa AI sungguhan).
import { docText } from './blocks';
import type { FinderData, FinderProject } from './types';

/** Kata utuh (boleh berakhiran "-nya"), supaya "hi" tidak cocok dengan "him". */
const has = (q: string, words: string[]) =>
  words.some(w => new RegExp(`(^|[^a-z])${w}(nya)?([^a-z]|$)`, 'i').test(q));

const EN = ['who', 'what', 'how', 'where', 'which', 'tell', 'about', 'his', 'her', 'him', 'their', 'can', 'does', 'is', 'are', 'the', 'projects?', 'contact', 'skills?', 'work'];
const ID = ['siapa', 'apa', 'bagaimana', 'gimana', 'yang', 'dia', 'nya', 'proyek', 'kontak', 'hubungi', 'dong', 'aja', 'saja', 'cerita', 'tentang', 'pernah', 'bisa'];

/** Bahasa Inggris kalau kata Inggris lebih banyak dari kata Indonesia. */
function isEnglish(q: string) {
  const count = (words: string[]) => words.filter(w => has(q, [w])).length;
  return count(EN) > count(ID);
}

const byNewest = (a: FinderProject, b: FinderProject) => (Number(b.year) || 0) - (Number(a.year) || 0);

export function demoAnswer(question: string, data: FinderData): string {
  const q = question.toLowerCase();
  const en = isEnglish(q);
  const owner = data.about?.name?.trim() || (en ? 'the owner' : 'pemilik situs');
  const first = owner.split(/\s+/)[0];
  const cat = new Map(data.categories.map(c => [c.id, c.label]));
  const projects = [...data.projects].sort(byNewest);

  // Nama proyek tertentu disebut → ceritakan proyek itu.
  const named = data.projects.find(p => {
    const key = p.name.toLowerCase().replace(/[™®©]/g, '').trim();
    return key.length > 2 && q.includes(key);
  });
  if (named) {
    const meta = [named.client && (en ? `for ${named.client}` : `untuk ${named.client}`), named.year].filter(Boolean).join(', ');
    // Isi kanvas: ambil paragraf (bukan judul pendek), maksimal ~700 karakter.
    const paras = named.body
      ? docText(named.body).split('\n').filter(l => l.length > 40)
      : [named.summary, named.solution].filter(Boolean);
    let story = '';
    for (const p of paras) { if ((story + p).length > 700) break; story += (story ? '\n\n' : '') + p; }
    return `**${named.name}**${meta ? ` (${meta})` : ''}: ${story || (en ? 'no description yet.' : 'belum ada deskripsi.')}`
      + (named.url ? `\n\n${named.url}` : '');
  }

  if (has(q, ['halo', 'hai', 'hi', 'hello', 'hey', 'pagi', 'siang', 'malam'])) {
    return en
      ? `Hi! 👋 Ask me anything about ${owner}: who they are, their projects, skills, or how to get in touch.`
      : `Halo! 👋 Silakan tanya tentang ${owner}: siapa dia, proyeknya, keahliannya, atau cara menghubunginya.`;
  }

  if (has(q, ['kontak', 'hubungi', 'menghubungi', 'contact', 'reach', 'email', 'linkedin', 'instagram', 'dm', 'hire', 'rekrut', 'kerja sama', 'kerjasama'])) {
    const c = data.contact ?? { email: '', links: [] };
    const lines = [c.email ? `- Email: ${c.email}` : '', ...c.links.map(l => `- ${l.label}: ${l.url}`)].filter(Boolean);
    if (!lines.length) return en ? `${first} hasn't added contact details yet.` : `${first} belum mencantumkan kontak.`;
    return (en ? `You can reach ${first} here:\n` : `Kamu bisa menghubungi ${first} lewat:\n`) + lines.join('\n');
  }

  if (has(q, ['skill', 'keahlian', 'keterampilan', 'tools?', 'bisa apa', 'spesialis', 'expertise', 'stack', 'jago'])) {
    const tags = [...new Set(data.projects.flatMap(p => p.tags))];
    if (!tags.length) return en ? `No skills listed yet.` : `Belum ada keahlian yang dicantumkan.`;
    return en
      ? `From their projects, ${first} works on: ${tags.join(', ')}.`
      : `Dari proyek-proyeknya, ${first} mengerjakan: ${tags.join(', ')}.`;
  }

  if (has(q, ['proyek', 'project', 'portofolio', 'portfolio', 'karya', 'work', 'kerjaan', 'client', 'klien', 'terbaru', 'latest'])) {
    if (!projects.length) return en ? `No projects yet.` : `Belum ada proyek.`;
    const list = projects.map(p => {
      const cats = p.categories.map(c => cat.get(c)).filter(Boolean).join(', ');
      return `- **${p.name}**${p.year ? ` (${p.year})` : ''}${cats ? ` · ${cats}` : ''}`;
    }).join('\n');
    return (en ? `${first}'s projects, newest first:\n` : `Proyek ${first}, dari yang terbaru:\n`) + list
      + (en ? `\n\nAsk about one of them by name for details.` : `\n\nSebut nama proyeknya untuk cerita lebih lengkap.`);
  }

  if (has(q, ['siapa', 'who', 'tentang', 'about', 'profil', 'profile', 'kenalan', 'introduce', 'background', 'latar'])) {
    const role = data.about?.role;
    const para = (data.about?.paragraphs ?? []).find(p => p.length > 60) ?? '';
    const head = en
      ? `${owner}${role ? ` is a ${role}` : ''}.`
      : `${owner}${role ? ` adalah ${role}` : ''}.`;
    return para ? `${head}\n\n${para}` : head;
  }

  return en
    ? `(Demo mode) I'm not connected to a real AI yet, so I can only answer basic questions: who ${first} is, projects, skills, and contact. Try "What projects has ${first} done?"`
    : `(Mode demo) Aku belum terhubung ke AI sungguhan, jadi baru bisa menjawab pertanyaan dasar: siapa ${first}, proyek, keahlian, dan kontak. Coba tanya "Proyek apa saja yang pernah dikerjakan?"`;
}

/** Potong jawaban jadi potongan kecil supaya tampil bertahap seperti AI sungguhan. */
export function chunkText(text: string, size = 12): string[] {
  const out: string[] = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out;
}
