// POST /api/speak   { text, narrator, previous?, next? }  ->  audio/mpeg
// Narrates one sentence with ElevenLabs. The API key never leaves the server.
import { NARRATORS } from '../lib/narrators.js';

const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  if (!process.env.ELEVENLABS_API_KEY) return res.status(500).json({ error: 'ELEVENLABS_API_KEY not set' });

  const { text, narrator = 'warm', previous = '', next = '' } = req.body || {};
  if (typeof text !== 'string' || !text.trim() || text.length > 900) {
    return res.status(400).json({ error: 'text required, 900 characters max' });
  }
  const n = NARRATORS[narrator];
  if (!n || !n.voiceId) return res.status(400).json({ error: 'unknown narrator' });

  const body = {
    text,
    model_id: MODEL,
    voice_settings: { stability: 0.5, similarity_boost: 0.75 },
  };
  // Neighboring sentences keep the tone continuous when a story is sent one sentence at a time.
  // Eleven v3 does not use these, so they are skipped for it.
  if (MODEL !== 'eleven_v3') {
    if (previous) body.previous_text = String(previous).slice(0, 500);
    if (next) body.next_text = String(next).slice(0, 500);
  }

  try {
    const r = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(n.voiceId)}?output_format=mp3_44100_128`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
        },
        body: JSON.stringify(body),
      }
    );
    if (!r.ok) {
      console.error('elevenlabs error', r.status, (await r.text()).slice(0, 300));
      return res.status(502).json({ error: 'speech failed', status: r.status });
    }
    const audio = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.status(200).send(audio);
  } catch (e) {
    console.error('speak error', e);
    return res.status(502).json({ error: 'speech failed' });
  }
}
