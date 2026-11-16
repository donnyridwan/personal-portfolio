// POST /api/ai — AI Terminal di situs: menjawab pertanyaan pengunjung tentang pemilik portofolio.
// Body: { messages: [{ role: 'user'|'assistant', content }] }. Balasan: teks yang di-stream (text/plain).
import { createHash } from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';
import { aiSettingsFrom, buildSystemPrompt, sanitizeMessages } from '@/lib/ai';
import { loadFinderData, loadSettings } from '@/lib/db';
import { takeAiQuota } from '@/lib/repo';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MODEL = 'claude-opus-5-5';
/** Batas pertanyaan per pengunjung per hari dan untuk semua pengunjung per hari (bisa diubah lewat env). */
const PER_VISITOR = Number(process.env.AI_LIMIT_PER_VISITOR) || 30;
const PER_DAY = Number(process.env.AI_LIMIT_PER_DAY) || 300;

const json = (body: unknown, status: number) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

function visitorKey(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
  // Simpan hash, bukan IP mentah.
  return createHash('sha256').update(`dockfolio-ai:${ip}`).digest('hex').slice(0, 32);
}

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: 'AI belum diaktifkan oleh pemilik situs.' }, 503);
  }
  const body = (await req.json().catch(() => null)) as { messages?: unknown } | null;
  const parsed = sanitizeMessages(body?.messages);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  let system: string;
  try {
    const quota = await takeAiQuota(visitorKey(req), PER_VISITOR, PER_DAY);
    if (quota !== 'ok') {
      return json({ error: 'Batas pertanyaan hari ini sudah habis. Silakan hubungi langsung lewat Kontak.' }, 429);
    }
    const [data, settings] = await Promise.all([loadFinderData(), loadSettings()]);
    system = buildSystemPrompt(data, aiSettingsFrom(settings.ai));
  } catch (err) {
    console.error('[api/ai] data', err);
    return json({ error: 'Data belum bisa dimuat. Coba lagi sebentar.' }, 500);
  }

  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 2000, // jawaban chat dibatasi supaya biaya per pertanyaan tetap kecil
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default', // kalau model menolak karena filter keamanan, server mencoba model cadangan
    output_config: { effort: 'low' }, // chat singkat: cepat dan hemat
    system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
    messages: parsed.messages,
  });

  const encoder = new TextEncoder();
  const body$ = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (t: string) => controller.enqueue(encoder.encode(t));
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') send(event.delta.text);
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === 'refusal') send('\n\n[Maaf, pertanyaan ini tidak bisa dijawab di sini.]');
        else if (final.stop_reason === 'max_tokens') send('…');
      } catch (err) {
        if (err instanceof Anthropic.RateLimitError) {
          send('\n[AI sedang sibuk. Coba lagi sebentar lagi.]');
        } else {
          console.error('[api/ai] stream', err);
          send('\n[Koneksi ke AI terputus. Coba lagi.]');
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort(); // pengunjung menutup terminal: hentikan permintaan ke model
    },
  });

  return new Response(body$, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Accel-Buffering': 'no',
    },
  });
}
