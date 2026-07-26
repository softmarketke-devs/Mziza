import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Splits text into chunks of <= 180 characters, breaking cleanly on punctuation or spaces.
 */
function splitTextIntoChunks(text: string, maxLen = 180): string[] {
  const clean = text.trim();
  if (clean.length <= maxLen) return [clean];

  const sentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (current.length + trimmed.length + 1 <= maxLen) {
      current = current ? `${current} ${trimmed}` : trimmed;
    } else {
      if (current) chunks.push(current);

      if (trimmed.length > maxLen) {
        // Fallback split on space if a single clause exceeds maxLen
        const words = trimmed.split(/\s+/);
        let sub = '';
        for (const w of words) {
          if (sub.length + w.length + 1 <= maxLen) {
            sub = sub ? `${sub} ${w}` : w;
          } else {
            if (sub) chunks.push(sub);
            sub = w;
          }
        }
        if (sub) current = sub;
        else current = '';
      } else {
        current = trimmed;
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const lang = searchParams.get('lang') === 'en' ? 'en' : 'sw';

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: 'Text parameter is required' }, { status: 400 });
  }

  try {
    const chunks = splitTextIntoChunks(text);
    const audioBuffers: Buffer[] = [];

    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
        chunk
      )}&tl=${lang}&client=tw-ob`;

      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!res.ok) {
        throw new Error(`TTS upstream error: ${res.status}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      audioBuffers.push(Buffer.from(arrayBuffer));
    }

    const combinedAudio = Buffer.concat(audioBuffers);

    return new NextResponse(combinedAudio, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': combinedAudio.length.toString(),
        'Cache-Control': 'public, max-age=86400, immutable'
      }
    });
  } catch (err) {
    console.error('Swahili TTS generation failed:', err);
    return NextResponse.json(
      { error: 'Could not generate Swahili audio stream' },
      { status: 502 }
    );
  }
}
