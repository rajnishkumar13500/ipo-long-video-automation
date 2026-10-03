import fs from "fs";
import path from "path";

/**
 * Generates a clean, subtle 78-second ambient tech-financial background track (WAV).
 * Used as a zero-dependency placeholder until the user drops their Suno AI MP3 into public/audio/background.mp3!
 */
export function generateAmbientBackgroundTrack(outputPath: string): void {
  const sampleRate = 44100;
  const bpm = 120;
  const beatSec = 60 / bpm; // 0.5s per beat
  const totalDurationSec = 78;
  const totalSamples = Math.floor(sampleRate * totalDurationSec);

  const numChannels = 2;
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = totalSamples * blockAlign;
  const headerSize = 44;
  const buffer = Buffer.alloc(headerSize + dataSize);

  // ─── RIFF Header ───────────────────────────────────────────────
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  // Chord frequencies (Am7 -> Fmaj7 -> Dm7 -> Em7 loop)
  const chordRoots = [220.0, 174.61, 146.83, 164.81]; // A3, F3, D3, E3
  const chordNotes = [
    [220.0, 261.63, 329.63, 392.0], // Am7
    [174.61, 220.0, 261.63, 329.63], // Fmaj7
    [146.83, 174.61, 220.0, 261.63], // Dm7
    [164.81, 196.0, 246.94, 293.66], // Em7
  ];

  let offset = headerSize;
  const chordLenSec = 4.0; // 8 beats per chord

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Chord index
    const chordIdx = Math.floor(t / chordLenSec) % chordNotes.length;
    const notes = chordNotes[chordIdx];
    const root = chordRoots[chordIdx];

    // 1. Warm sub bass (sine wave with soft saturation)
    const bassEnv = 0.5 + 0.5 * Math.cos(2 * Math.PI * (t % 1.0));
    const bass = 0.18 * Math.sin(2 * Math.PI * (root / 2) * t) * bassEnv;

    // 2. Gentle ambient synth pad (filtered sine harmonics)
    let pad = 0;
    for (let n = 0; n < notes.length; n++) {
      pad += 0.04 * Math.sin(2 * Math.PI * notes[n] * t);
      pad += 0.015 * Math.sin(2 * Math.PI * notes[n] * 2 * t);
    }

    // 3. Subtle hi-hat / tick on every 0.25s (16th notes)
    const tickPhase = (t % 0.25) / 0.25;
    const tick = tickPhase < 0.05 ? (Math.random() * 2 - 1) * 0.02 * (1 - tickPhase / 0.05) : 0;

    // 4. Soft kick drum on every beat (0.5s)
    const kickPhase = (t % beatSec) / beatSec;
    const kick = kickPhase < 0.15 ? Math.sin(2 * Math.PI * (80 * (1 - kickPhase / 0.15)) * t) * 0.12 * (1 - kickPhase / 0.15) : 0;

    // Sum and apply master volume (-18 dB master for soft background mixing)
    const leftSample = (bass + pad * 0.8 + kick + tick) * 0.18;
    const rightSample = (bass + pad * 0.8 + kick - tick * 0.8) * 0.18;

    // Fade in (first 1.5s) and fade out (last 2.5s)
    let masterFade = 1.0;
    if (t < 1.5) masterFade = t / 1.5;
    else if (t > totalDurationSec - 2.5) masterFade = (totalDurationSec - t) / 2.5;

    const finalLeft = Math.max(-1, Math.min(1, leftSample * masterFade));
    const finalRight = Math.max(-1, Math.min(1, rightSample * masterFade));

    buffer.writeInt16LE(Math.floor(finalLeft * 32767), offset);
    buffer.writeInt16LE(Math.floor(finalRight * 32767), offset + 2);
    offset += 4;
  }

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, buffer);
  console.log(`🎵 Ambient background track generated: ${outputPath} (${(totalDurationSec).toFixed(1)}s)`);
}

if (require.main === module) {
  const target = path.resolve(__dirname, "../public/audio/background.mp3");
  generateAmbientBackgroundTrack(target);
}
