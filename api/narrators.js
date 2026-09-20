// GET /api/narrators
// Tells the app which narrators exist and whether backend story writing is on.
// If this route is missing or empty, the app hides the narrator step and uses the device voice.
import { available } from '../lib/narrators.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    narrators: available(),
    story: Boolean(process.env.GEMINI_API_KEY),
    voiceProvider: 'ElevenLabs',
    storyProvider: 'Gemini',
  });
}
