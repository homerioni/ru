export type TSfxName =
  | 'open'
  | 'sip'
  | 'sip1'
  | 'sip2'
  | 'canDrop'
  | 'burp1'
  | 'burp2'
  | 'creak'
  | 'whistle'
  | 'coin'
  | 'levelup'
  | 'pigeon'
  | 'sweep'
  | 'veloCrash'
  | 'click';

export type TCommandClip = {
  url: string;
  caption: string;
  durationMs: number;
};

export const VOICE_PHRASE_URLS = [
  '/game/kvas/sfx/phrases/cherkizon.wav',
  '/game/kvas/sfx/phrases/cherkizony.wav',
  '/game/kvas/sfx/phrases/dima-puzo.wav',
  '/game/kvas/sfx/phrases/hmm.wav',
  '/game/kvas/sfx/phrases/induk.wav',
  '/game/kvas/sfx/phrases/levoe.wav',
  '/game/kvas/sfx/phrases/malchik.wav',
  '/game/kvas/sfx/phrases/pivo-top.wav',
  '/game/kvas/sfx/phrases/shpricy.wav',
  '/game/kvas/sfx/phrases/tehnar.wav',
  '/game/kvas/sfx/phrases/utyug.wav',
  '/game/kvas/sfx/command/vse.wav',
] as const;

export const VELO_VOICE_URLS = [
  '/game/kvas/sfx/velo/1.wav',
  '/game/kvas/sfx/velo/2.wav',
  '/game/kvas/sfx/velo/3.wav',
  '/game/kvas/sfx/velo/4.wav',
  '/game/kvas/sfx/velo/6.wav',
  '/game/kvas/sfx/velo/7.wav',
] as const;

export const TEAMMATE_VOICE_CLIPS: Record<1 | 2, readonly TCommandClip[]> = {
  1: [
    { url: '/game/kvas/sfx/command/4i5.wav', caption: 'Четыре и пять!', durationMs: 3100 },
    { url: '/game/kvas/sfx/command/eblani.wav', caption: 'Ну вы исполняете!', durationMs: 2600 },
    { url: '/game/kvas/sfx/command/pacho.wav', caption: 'Пачо в раздевалке', durationMs: 3100 },
    { url: '/game/kvas/sfx/command/penisa.wav', caption: 'Вот это расклад...', durationMs: 3000 },
    { url: '/game/kvas/sfx/command/pianitsa.wav', caption: 'Опять бухаешь?!', durationMs: 2800 },
    { url: '/game/kvas/sfx/command/v3.wav', caption: 'В три касания!', durationMs: 4800 },
  ],
  2: [
    { url: '/game/kvas/sfx/command/capitan.wav', caption: 'Капитан на базе', durationMs: 5200 },
    { url: '/game/kvas/sfx/command/gaz.wav', caption: 'Газ! Даём!', durationMs: 2800 },
    { url: '/game/kvas/sfx/command/kick.wav', caption: 'Ща как пробью!', durationMs: 3800 },
    { url: '/game/kvas/sfx/command/kozirni.wav', caption: 'Козырный движ', durationMs: 5000 },
    { url: '/game/kvas/sfx/command/lamin.wav', caption: 'Ламин на связи', durationMs: 2900 },
    { url: '/game/kvas/sfx/command/poplach.wav', caption: 'Поплачь ещё', durationMs: 3300 },
    { url: '/game/kvas/sfx/command/pravo.wav', caption: 'Правый фланг!', durationMs: 2800 },
    { url: '/game/kvas/sfx/command/progress.wav', caption: 'Прогресс пошёл!', durationMs: 4500 },
    { url: '/game/kvas/sfx/command/rechichane.wav', caption: 'Речичане United!', durationMs: 4200 },
    { url: '/game/kvas/sfx/command/zaebis.wav', caption: 'Вообще чётко!', durationMs: 2800 },
  ],
};

type TSfxCfg = {
  urls: string[];
  channels: number;
  volume: number;
  jitterPitch?: number;
  stickMin?: number;
  stickMax?: number;
};

const SFX_GROUPS: Record<string, TSfxCfg> = {
  open: {
    urls: [],
    channels: 1,
    volume: 0.48,
  },
  sip: {
    urls: [
      '/game/kvas/sfx/sip1.mp3',
      '/game/kvas/sfx/sip-3.wav',
      '/game/kvas/sfx/sip-4.wav',
    ],
    channels: 2,
    volume: 0.25,
    jitterPitch: 0.03,
    stickMin: 8,
    stickMax: 14,
  },
  canDrop: {
    urls: [
      '/game/kvas/sfx/can-drop-2.wav',
      '/game/kvas/sfx/can-drop-3.wav',
      '/game/kvas/sfx/can-drop-4.wav',
      '/game/kvas/sfx/can-drop-5.wav',
    ],
    channels: 2,
    volume: 0.38,
    jitterPitch: 0.04,
    stickMin: 4,
    stickMax: 7,
  },
  burp1: {
    urls: ['/game/kvas/sfx/burp1.mp3'],
    channels: 2,
    volume: 0.75,
  },
  burp2: {
    urls: ['/game/kvas/sfx/burp2.mp3'],
    channels: 2,
    volume: 0.8,
  },
  creak: { urls: ['/game/kvas/sfx/creak.wav'], channels: 1, volume: 0.42 },
  whistle: { urls: ['/game/kvas/sfx/whistle.wav'], channels: 1, volume: 0.55 },
  coin: {
    urls: [
      '/game/kvas/sfx/coin.wav',
      '/game/kvas/sfx/coin-2.wav',
      '/game/kvas/sfx/coin-3.wav',
      '/game/kvas/sfx/coin-5.wav',
      '/game/kvas/sfx/coin-6.wav',
    ],
    channels: 2,
    volume: 0.42,
    jitterPitch: 0.03,
    stickMin: 3,
    stickMax: 6,
  },
  levelup: {
    urls: [
      '/game/kvas/sfx/levelup.wav',
      '/game/kvas/sfx/levelup-2.wav',
      '/game/kvas/sfx/levelup-3.wav',
    ],
    channels: 1,
    volume: 0.5,
  },
  pigeon: { urls: ['/game/kvas/sfx/pigeon.wav'], channels: 1, volume: 0.5 },
  sweep: { urls: ['/game/kvas/sfx/sweep.wav'], channels: 1, volume: 0.45 },
  veloCrash: { urls: ['/game/kvas/sfx/velo-crash.wav'], channels: 1, volume: 0.85 },
  click: {
    urls: [],
    channels: 1,
    volume: 0.35,
  },
};

const resolveGroup = (name: TSfxName): string => {
  if (name === 'sip1' || name === 'sip2') return 'sip';
  return name;
};

type GroupPool = {
  variants: { cursor: number; items: HTMLAudioElement[] }[];
  lastVariant: number;
  stickRemaining: number;
  stickMin: number;
  stickMax: number;
  volume: number;
  jitterPitch: number;
};

class SfxManager {
  private pools: Record<string, GroupPool> = {};
  private voices: HTMLAudioElement[] = [];
  private veloVoices: HTMLAudioElement[] = [];
  private mateVoices: Record<1 | 2, HTMLAudioElement[]> = { 1: [], 2: [] };
  private activeVoice: HTMLAudioElement | null = null;
  private lastVoiceIndex = -1;
  private lastVeloIndex = -1;
  private lastMateIndex: Record<1 | 2, number> = { 1: -1, 2: -1 };
  private ready = false;

  init() {
    if (this.ready || typeof window === 'undefined') return;
    this.ready = true;
    Object.entries(SFX_GROUPS).forEach(([group, cfg]) => {
      const variants = cfg.urls.map((url) => ({
        cursor: 0,
        items: Array.from({ length: cfg.channels }, () => {
          const audio = new Audio(url);
          audio.preload = 'auto';
          audio.volume = cfg.volume;
          return audio;
        }),
      }));
      this.pools[group] = {
        variants,
        lastVariant: -1,
        stickRemaining: 0,
        stickMin: cfg.stickMin ?? 1,
        stickMax: cfg.stickMax ?? 1,
        volume: cfg.volume,
        jitterPitch: cfg.jitterPitch ?? 0,
      };
    });
    this.voices = VOICE_PHRASE_URLS.map((url) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 1.0;
      return audio;
    });
    this.veloVoices = VELO_VOICE_URLS.map((url) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 1.0;
      return audio;
    });
    ([1, 2] as const).forEach((mate) => {
      this.mateVoices[mate] = TEAMMATE_VOICE_CLIPS[mate].map((clip) => {
        const audio = new Audio(clip.url);
        audio.preload = 'auto';
        audio.volume = 1.0;
        return audio;
      });
    });
  }

  isVoiceBusy() {
    return !!(this.activeVoice && !this.activeVoice.paused && !this.activeVoice.ended);
  }

  play(name: TSfxName, enabled: boolean, rate = 1) {
    if (!enabled || typeof window === 'undefined') return;
    if (!this.ready) this.init();
    const pool = this.pools[resolveGroup(name)];
    if (!pool || pool.variants.length === 0) return;

    if (pool.lastVariant < 0 || pool.stickRemaining <= 0) {
      let vIdx = Math.floor(Math.random() * pool.variants.length);
      if (pool.variants.length > 1 && vIdx === pool.lastVariant) {
        vIdx = (vIdx + 1) % pool.variants.length;
      }
      pool.lastVariant = vIdx;
      const span = Math.max(0, pool.stickMax - pool.stickMin);
      pool.stickRemaining = pool.stickMin + Math.floor(Math.random() * (span + 1));
    }
    pool.stickRemaining -= 1;

    const variant = pool.variants[pool.lastVariant];
    const audio = variant.items[variant.cursor % variant.items.length];
    variant.cursor += 1;
    const jitter = pool.jitterPitch > 0 ? 1 + (Math.random() * 2 - 1) * pool.jitterPitch : 1;

    try {
      audio.pause();
      audio.currentTime = 0;
      audio.playbackRate = Math.max(0.55, Math.min(1.6, rate * jitter));
      audio.volume = pool.volume;
      audio.play().catch(() => undefined);
    } catch {
      // Ignore autoplay errors before user gesture
    }
  }

  playRandomVoice(enabled: boolean, rng: () => number = Math.random): string | null {
    if (!enabled || typeof window === 'undefined') return null;
    if (!this.ready) this.init();
    if (this.voices.length === 0 || this.isVoiceBusy()) return null;
    let index = Math.floor(rng() * this.voices.length);
    if (this.voices.length > 1 && index === this.lastVoiceIndex) {
      index = (index + 1) % this.voices.length;
    }
    this.lastVoiceIndex = index;
    const audio = this.voices[index];
    this.activeVoice = audio;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1.0;
      audio.play().catch(() => undefined);
      return VOICE_PHRASE_URLS[index];
    } catch {
      return null;
    }
  }

  playTeammateVoice(
    mate: 1 | 2,
    enabled: boolean,
    rng: () => number = Math.random
  ): { caption: string; durationMs: number } | null {
    if (typeof window === 'undefined') return null;
    if (!this.ready) this.init();
    const list = this.mateVoices[mate];
    const clips = TEAMMATE_VOICE_CLIPS[mate];
    if (list.length === 0) return null;
    let index = Math.floor(rng() * list.length);
    if (list.length > 1 && index === this.lastMateIndex[mate]) {
      index = (index + 1) % list.length;
    }
    this.lastMateIndex[mate] = index;
    const clip = clips[index];
    const audio = list[index];
    if (enabled && !this.isVoiceBusy()) {
      this.activeVoice = audio;
      try {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1.0;
        audio.play().catch(() => undefined);
      } catch {
        // Ignore autoplay errors before user gesture
      }
    }
    const audioMs =
      Number.isFinite(audio.duration) && audio.duration > 0
        ? Math.ceil(audio.duration * 1000)
        : clip.durationMs;
    return { caption: clip.caption, durationMs: Math.max(clip.durationMs, audioMs) };
  }

  playVeloVoice(enabled: boolean, rng: () => number = Math.random): string | null {
    if (!enabled || typeof window === 'undefined') return null;
    if (!this.ready) this.init();
    if (this.veloVoices.length === 0 || this.isVoiceBusy()) return null;
    let index = Math.floor(rng() * this.veloVoices.length);
    if (this.veloVoices.length > 1 && index === this.lastVeloIndex) {
      index = (index + 1) % this.veloVoices.length;
    }
    this.lastVeloIndex = index;
    const audio = this.veloVoices[index];
    this.activeVoice = audio;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 1.0;
      audio.play().catch(() => undefined);
      return VELO_VOICE_URLS[index];
    } catch {
      return null;
    }
  }

  stopVoices() {
    if (!this.activeVoice) return;
    try {
      this.activeVoice.pause();
      this.activeVoice.currentTime = 0;
    } catch {
      // Ignore
    }
    this.activeVoice = null;
  }
}

export const sfx = new SfxManager();
