// Nothing here imitates a real person.
//
//   1) ELEVENLABS_API_KEY=... node scripts/design-voices.mjs
//        -> makes 3 preview voices per narrator in ./previews (open the .mp3 files and listen)
//   2) ELEVENLABS_API_KEY=... node scripts/design-voices.mjs --pick cinematic=2 brooding=1 adventurer=3
//        -> saves your picks to your ElevenLabs library and prints the VOICE_* lines for your .env
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) { console.error('Set ELEVENLABS_API_KEY first.'); process.exit(1); }
const H = { 'xi-api-key': KEY, 'Content-Type': 'application/json' };
const BASE = 'https://api.elevenlabs.io/v1';

// The preview text has to be 100 to 1000 characters.
const SAMPLE =
  'The lantern flickers as you step onto the old stone path. Somewhere ahead, a door creaks open, ' +
  'and a warm light spills across the leaves. You take a slow breath, and you keep walking.';

const NARRATORS = {
  cinematic: {
    name: 'Storry Cinematic',
    description:
      'A confident, charismatic male narrator in his thirties with a rich, low, smooth voice and easy warmth. ' +
      'Steady, cinematic pacing with small pauses before reveals. Clear American accent.',
  },
  brooding: {
    name: 'Storry Brooding',
    description:
      'A young British male narrator with a soft, low voice and quiet intensity. Dry, understated, ' +
      'deadpan delivery at a slow, deliberate pace with a hint of dark humor.',
  },
  adventurer: {
    name: 'Storry Adventurer',
    description:
      'A young British male storyteller in his early twenties, earnest and bright, with quick pacing ' +
      'and a constant sense of wonder, like narrating a magical adventure.',
  },
};

const pick = process.argv.indexOf('--pick');

if (pick === -1) {
  mkdirSync('previews', { recursive: true });
  const manifest = {};
  for (const [id, n] of Object.entries(NARRATORS)) {
    const r = await fetch(`${BASE}/text-to-voice/design`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify({ voice_description: n.description, text: SAMPLE, model_id: 'eleven_multilingual_ttv_v2' }),
    });
    if (!r.ok) { console.error(id, 'failed', r.status, (await r.text()).slice(0, 300)); continue; }
    const data = await r.json();
    manifest[id] = (data.previews || []).map((p) => p.generated_voice_id);
    (data.previews || []).forEach((p, i) => {
      writeFileSync(`previews/${id}-${i + 1}.mp3`, Buffer.from(p.audio_base_64, 'base64'));
    });
    console.log(`${id}: wrote previews/${id}-1.mp3 .. -${manifest[id].length}.mp3`);
  }
  writeFileSync('previews/manifest.json', JSON.stringify(manifest, null, 2));
  console.log('\nListen, then run again with:  --pick cinematic=1 brooding=2 adventurer=3');
} else {
  if (!existsSync('previews/manifest.json')) { console.error('Run without --pick first.'); process.exit(1); }
  const manifest = JSON.parse(readFileSync('previews/manifest.json', 'utf8'));
  const picks = process.argv.slice(pick + 1).filter((a) => a.includes('='));
  console.log('# Paste these into your .env / Vercel environment variables:');
  for (const p of picks) {
    const [id, num] = p.split('=');
    const n = NARRATORS[id];
    const generated = manifest[id]?.[Number(num) - 1];
    if (!n || !generated) { console.error(`# skipped ${p} (unknown narrator or preview number)`); continue; }
    const r = await fetch(`${BASE}/text-to-voice`, {
      method: 'POST',
      headers: H,
      body: JSON.stringify({ voice_name: n.name, voice_description: n.description, generated_voice_id: generated }),
    });
    if (!r.ok) { console.error(`# ${id} failed`, r.status, (await r.text()).slice(0, 300)); continue; }
    const v = await r.json();
    console.log(`VOICE_${id.toUpperCase()}=${v.voice_id}`);
  }
}
