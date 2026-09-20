// Narrator presets. Each one is an ORIGINAL voice "vibe", not an imitation of a real person.
// A narrator only appears in the app when its voice ID is set.
//
// "warm" ships with a default premade ElevenLabs voice ID (the one used in ElevenLabs' own docs)
// so the app works before you design anything. Override any of them with the VOICE_* env vars.
const DEFAULT_WARM = 'JBFqnCBsd6RMkjVDRZzb';

export const NARRATORS = {
  warm: {
    label: 'Warm storyteller',
    blurb: 'Unhurried and reassuring, like a favorite audiobook.',
    voiceId: process.env.VOICE_WARM || DEFAULT_WARM,
  },
  cinematic: {
    label: 'Cinematic and confident',
    blurb: 'Rich, low, and easy, with steady pacing.',
    voiceId: process.env.VOICE_CINEMATIC,
  },
  brooding: {
    label: 'Dry and brooding',
    blurb: 'Understated British delivery with quiet intensity.',
    voiceId: process.env.VOICE_BROODING,
  },
  adventurer: {
    label: 'Wide-eyed adventurer',
    blurb: 'Bright, quick, and full of wonder.',
    voiceId: process.env.VOICE_ADVENTURER,
  },
};

export function available() {
  if (!process.env.ELEVENLABS_API_KEY) return [];
  return Object.entries(NARRATORS)
    .filter(([, n]) => n.voiceId)
    .map(([id, n]) => ({ id, label: n.label, blurb: n.blurb }));
}
