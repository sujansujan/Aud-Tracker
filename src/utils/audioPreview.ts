/**
 * Audio preview simulation using Web Audio API.
 * Provides authentic audiobook narration voice cadence and ambient tone.
 */
class NarrationAudioPlayer {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentBookId: string | null = null;
  private timer: number | null = null;
  private onStateChange: ((isPlaying: boolean, bookId: string | null, progress: number) => void) | null = null;
  private currentProgress = 0;
  private duration = 12; // 12 seconds preview sample

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(callback: (isPlaying: boolean, bookId: string | null, progress: number) => void) {
    this.onStateChange = callback;
  }

  public togglePlay(bookId: string, _title: string, _narrator: string) {
    if (this.isPlaying && this.currentBookId === bookId) {
      this.stop();
      return;
    }
    this.stop();
    this.play(bookId);
  }

  public play(bookId: string) {
    try {
      this.initContext();
      if (!this.ctx) return;

      this.isPlaying = true;
      this.currentBookId = bookId;
      this.currentProgress = 0;

      // Create warm narration ambient tones using harmonic oscillators
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Warm narration frequency ~130Hz - 220Hz
      osc1.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(280, this.ctx.currentTime);

      // Low pass filter for warm radio-grade vocal presence
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, this.ctx.currentTime + 0.3);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();

      // Modulation for human speech cadence rhythm
      let step = 0;
      const cadenceInterval = setInterval(() => {
        if (!this.ctx || !this.isPlaying) {
          clearInterval(cadenceInterval);
          return;
        }
        step++;
        const targetFreq = 130 + Math.sin(step * 0.8) * 35 + (step % 3 === 0 ? 25 : 0);
        osc1.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);
      }, 250);

      // Progress loop
      const startTime = Date.now();
      const totalMs = this.duration * 1000;

      this.timer = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / totalMs);
        this.currentProgress = progress;

        if (this.onStateChange) {
          this.onStateChange(true, this.currentBookId, progress);
        }

        if (elapsed >= totalMs) {
          clearInterval(cadenceInterval);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx?.currentTime || 0 + 0.2);
          setTimeout(() => {
            try {
              osc1.stop();
              osc2.stop();
            } catch {
              // ignore
            }
            this.stop();
          }, 300);
        }
      }, 100);

    } catch (err) {
      console.warn('Audio playback not supported or blocked:', err);
      this.stop();
    }
  }

  public stop() {
    this.isPlaying = false;
    this.currentBookId = null;
    this.currentProgress = 0;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.onStateChange) {
      this.onStateChange(false, null, 0);
    }
  }

  public getCurrent() {
    return {
      isPlaying: this.isPlaying,
      bookId: this.currentBookId,
      progress: this.currentProgress,
    };
  }
}

export const audioPlayer = new NarrationAudioPlayer();
