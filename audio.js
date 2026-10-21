/**
 * PIXEL BLAST - Retro 8-bit / 16-bit Sound Synthesis System
 * Zero-dependency Web Audio API sound generator
 */
class PixelAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = localStorage.getItem('pixel_blast_muted') === 'true';
    this.adMuted = false;
    this.volume = 0.25;

    // Musical scale for ascending combo pitches (Pentatonic / Major)
    // C4, D4, E4, G4, A4, C5, D5, E5, G5, A5, C6
    this.comboNotes = [
      261.63, 293.66, 329.63, 392.00, 440.00,
      523.25, 587.33, 659.25, 783.99, 880.00,
      1046.50, 1174.66, 1318.51
    ];
  }

  setMutedByAd(mute) {
    this.adMuted = mute;
    if (this.ctx) {
      if (mute && this.ctx.state === 'running') {
        this.ctx.suspend();
      } else if (!mute && !this.isMuted && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended' && !this.adMuted && !this.isMuted) {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem('pixel_blast_muted', this.isMuted);
    return this.isMuted;
  }

  // Helper for quick envelope
  createSynthVoice(type, freq, startTime, duration, startGain, endGain) {
    if (this.isMuted || this.adMuted || !this.ctx) return null;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(startGain * this.volume, startTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endGain * this.volume), startTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration);
    return { osc, gain };
  }

  // 1. Pick up a block piece
  playPickup() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Quick ascending blip
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.05);

    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  // 2. Put down / return to tray (cancel drag)
  playCancel() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.createSynthVoice('sine', 200, now, 0.08, 0.15, 0.001);
  }

  // 3. Place block successfully onto grid
  playPlace() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Crunchy retro thud: quick low square wave + noise burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.07);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  // 4. Line Clear Sound (with rising combo pitch)
  playClear(lineCount = 1, comboCount = 0) {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Base pitch depends on combo
    const noteIdx = Math.min(comboCount, this.comboNotes.length - 1);
    const baseFreq = this.comboNotes[noteIdx];

    // Play sparkling arpeggio based on number of lines
    const arpeggioSteps = [0, 4, 7, 12, 16]; // Major chord intervals in semitones
    const totalNotes = Math.min(2 + lineCount * 2, 7);

    for (let i = 0; i < totalNotes; i++) {
      const step = arpeggioSteps[i % arpeggioSteps.length] + Math.floor(i / arpeggioSteps.length) * 12;
      const freq = baseFreq * Math.pow(2, step / 12);
      const noteTime = now + i * 0.045;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      // 8-bit pulse/square feel
      osc.type = i % 2 === 0 ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      const dur = 0.18;
      gain.gain.setValueAtTime(0.25 * this.volume, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + dur);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + dur);
    }

    // High combo impact sub-layer
    if (comboCount >= 2) {
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(baseFreq * 0.5, now);
      bassGain.gain.setValueAtTime(0.3 * this.volume, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      bassOsc.connect(bassGain);
      bassGain.connect(this.ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.25);
    }
  }

  // 5. Huge Combo Fanfare (3+ combo or 3+ lines)
  playComboFanfare(combo) {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime + 0.15;

    // Radiant chords
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C Major high
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.03);

      gain.gain.setValueAtTime(0.18 * this.volume, now + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.03);
      osc.stop(now + idx * 0.03 + 0.35);
    });
  }

  // 6. Game Over
  playGameOver() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    // Melancholy descending 8-bit notes
    const notes = [392.00, 369.99, 349.23, 311.13, 246.94]; // G4, F#4, F4, D#4, B3
    notes.forEach((freq, idx) => {
      const noteTime = now + idx * 0.14;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.22 * this.volume, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  }

  // 7. New High Score Fanfare
  playNewRecord() {
    this.init();
    if (this.isMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const victoryNotes = [
      { f: 523.25, d: 0.1 }, // C5
      { f: 659.25, d: 0.1 }, // E5
      { f: 783.99, d: 0.1 }, // G5
      { f: 1046.50, d: 0.35 } // C6
    ];

    let t = now;
    victoryNotes.forEach((item) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(item.f, t);

      gain.gain.setValueAtTime(0.25 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + item.d + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + item.d + 0.05);
      t += item.d;
    });
  }

  // 8. Revive / Second Chance Sound
  playRevive() {
    this.init();
    if (this.isMuted || this.adMuted || !this.ctx) return;
    const now = this.ctx.currentTime;

    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }
}

// Export singleton audio engine
export const audio = new PixelAudioEngine();
if (typeof window !== 'undefined') {
  window.audio = audio;
}
