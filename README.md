# Storry

**Stories that keep pace with you.**

Storry reads you an AI-written story while you do a task you'd rather avoid, like brushing your teeth, working out, or tidying up. The story plays while you move and pauses the moment you stop. When you finish the task, you get the ending.

**Live demo:** https://storry-neon.vercel.app

## How it works

1. Pick a task, a genre (or describe your own story), and a language.
2. A sensor tells Storry whether you're moving or still.
3. Gemini writes the story and ElevenLabs narrates it, one sentence at a time.
4. Stop moving and the story pauses. Start again and it picks up where it left off.
5. Finish the task to unlock the ending, earn points, and see how on task you were.

## Features

- **Real sensing**: phone motion sensors, an Arduino light sensor over USB, or a Bluetooth heart-rate sensor
- **AI stories** written by Google Gemini, sized to match your task length
- **ElevenLabs narration** with original narrator voices, and a fallback to your device's voice
- **16 languages**, including right-to-left Arabic
- **Focus reports**: on-task percentage, number of distractions, longest focus streak, and a weekly breakdown
- **Kid mode** with simple, family-safe stories and a playful look
- **Accessibility**: dyslexia-friendly text, contrast options, low-stimulation mode, adjustable text size, and screen-reader support

## Project structure

```
index.html                     The whole app (HTML, CSS, JavaScript)
api/story.js                   Story writing with Gemini
api/speak.js                   Narration with ElevenLabs
api/narrators.js               Reports which voices and services are available
lib/narrators.js               Narrator definitions
scripts/design-voices.mjs      Creates original narrator voices with ElevenLabs Voice Design
arduino/storry_light_sensor/   Arduino sketch for the light sensor
```

## Run it yourself

You need a [Vercel](https://vercel.com) account, a [Gemini API key](https://aistudio.google.com), and an [ElevenLabs API key](https://elevenlabs.io).

1. Clone this repo.
2. Copy `.env.example` to `.env` and fill it in. The two required keys are `GEMINI_API_KEY` and `ELEVENLABS_API_KEY`. Narrator voice IDs are optional.
3. Deploy:
   ```
   npx vercel --prod
   ```
4. Add the same keys under **Project → Settings → Environment Variables** in Vercel, then redeploy.

API keys stay on the server. The browser never sees them.

## Arduino setup

The sketch reads a light sensor and prints one line per reading over USB in the form `light,motion` (for example `512,1`). It marks motion when the newest reading differs from either of the two before it by more than 15. Storry connects to it with the Web Serial API, so use **Chrome or Edge on a computer**.

1. Upload `arduino/storry_light_sensor/storry_light_sensor.ino` to your board.
2. Close the Arduino Serial Monitor.
3. In Storry, choose **Arduino sensor** and press **Connect USB**.

There is also a holder mode, where bright light means the toothbrush is out of its holder.

## Troubleshooting

Open **Settings → Check my setup → Run**. It tests the story server, Gemini, and the voice in your chosen language and tells you what's wrong.

## Built with

Google Gemini, ElevenLabs, Vercel, Arduino, and the Web Serial, Web Bluetooth, and Device Motion browser APIs.

Built at VT Hacks.
