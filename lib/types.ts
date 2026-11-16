// Bentuk baris database (db/schema.sql) dan bentuk JSON yang dibaca finder.js.

export type CategoryRow = { id: string; label: string; sort: number };

export type ProjectRow = {
  id: string;
  name: string;
  client: string;
  year: number | null;
  summary: string;
  challenge: string;
  solution: string;
  final_thoughts: string;
  url: string;
  thumbnail: string;
  images: string[];
  tags: string[];
  categories: string[];
  featured_color: string | null;
  featured_order: number | null;
  sort: number;
};

export type SettingsMap = Record<string, unknown>;

export type Favorite = { id: string; label: string; icon: string };
export type About = { name?: string; role?: string; avatar?: string; paragraphs?: string[] };
export type Contact = { email: string; links: { label: string; url: string }[] };
export type Resume = { url: string };

export type FinderProject = {
  id: string;
  name: string;
  client: string;
  year: number | '';
  categories: string[];
  tags: string[];
  summary: string;
  challenge: string;
  solution: string;
  finalThoughts: string;
  thumbnail: string;
  images: string[];
  url: string;
};

export type FinderData = {
  favorites: Favorite[];
  categories: { id: string; label: string }[];
  projects: FinderProject[];
  featured: { projectId: string; color: string }[];
  about: About;
  contact: Contact;
  resume: Resume;
  /** Ikon desktop (hanya dari /api/finder; finder-data.json offline tidak punya). */
  desktop?: DesktopItem[];
  /** Nama AI Terminal (catatan untuk AI tidak pernah dikirim ke browser). */
  ai?: { name: string };
};

export type DesktopKind = 'project' | 'folder' | 'photo' | 'file' | 'app';

export type DesktopRow = {
  id: string;
  kind: DesktopKind;
  ref: string;
  label: string;
  src: string;
  x: number | null;
  y: number | null;
  mx: number | null;
  my: number | null;
  z: number;
};

/** Ikon desktop siap tampil: nama & gambar proyek/folder sudah diisi dari datanya. */
export type DesktopItem = DesktopRow & { img: string };
