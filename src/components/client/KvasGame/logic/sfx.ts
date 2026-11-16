export type TSfxName =
  | 'open'
  | 'sip'
  | 'sip1'
  | 'sip2'
  | 'canDrop'
  | 'burp'
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
  volume: number;
  jitterPitch?: number;
  stickMin?: number;
  stickMax?: number;
};

const SFX_GROUPS: Record<string, TSfxCfg> = {
  open: { urls: [], volume: 0.48 },
  sip: {
    urls: [
      '/game/kvas/sfx/sip1.mp3',
      '/game/kvas/sfx/sip-3.wav',
      '/game/kvas/sfx/sip-4.wav',
    ],
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
    volume: 0.38,
    jitterPitch: 0.04,
    stickMin: 4,
    stickMax: 7,
  },
  burp1: { urls: ['/game/kvas/sfx/burp1.mp3'], volume: 0.75 },
  burp2: { urls: ['/game/kvas/sfx/burp2.mp3'], volume: 0.8 },
  creak: { urls: ['/game/kvas/sfx/creak.wav'], volume: 0.42 },
  whistle: { urls: ['/game/kvas/sfx/whistle.wav'], volume: 0.55 },
  coin: {
    urls: [
      '/game/kvas/sfx/coin.wav',
      '/game/kvas/sfx/coin-2.wav',
      '/game/kvas/sfx/coin-3.wav',
      '/game/kvas/sfx/coin-5.wav',
      '/game/kvas/sfx/coin-6.wav',
    ],
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
    volume: 0.5,
  },
  pigeon: { urls: ['/game/kvas/sfx/pigeon.wav'], volume: 0.5 },
  sweep: { urls: ['/game/kvas/sfx/sweep.wav'], volume: 0.45 },
  veloCrash: { urls: ['/game/kvas/sfx/velo-crash.wav'], volume: 0.85 },
  click: { urls: [], volume: 0.35 },
};

const CORE_PRELOAD = [
  '/game/kvas/sfx/sip1.mp3',
  '/game/kvas/sfx/burp1.mp3',
  '/game/kvas/sfx/burp2.mp3',
  '/game/kvas/sfx/can-drop-2.wav',
  '/game/kvas/sfx/coin.wav',
];

const resolveGroup = (name: TSfxName): string => {
  if (name === 'sip1' || name === 'sip2') return 'sip';
  return name;
};

type GroupState = {
  lastVariant: number;
  stickRemaining: number;
};

class SfxManager {
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private loading = new Map<string, Promise<AudioBuffer | null>>();
  private groupState: Record<string, GroupState> = {};
  private voiceAudio: HTMLAudioElement | null = null;
  private lastVoiceIndex = -1;
  private lastVeloIndex = -1;
  private lastMateIndex: Record<1 | 2, number> = { 1: -1, 2: -1 };
  private ready = false;

  private ensureContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (Ctor) this.ctx = new Ctor();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => undefined);
    }
    return this.ctx;
  }

  private loadBuffer(url: string): Promise<AudioBuffer | null> {
    const cached = this.buffers.get(url);
    if (cached) return Promise.resolve(cached);
    const inflight = this.loading.get(url);
    if (inflight) return inflight;

    const ctx = this.ensureContext();
    if (!ctx) return Promise.resolve(null);

    const task = fetch(url)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error('HTTP'))))
      .then((buf) => ctx.decodeAudioData(buf))
      .then((decoded) => {
        this.buffers.set(url, decoded);
        this.loading.delete(url);
        return decoded;
      })
      .catch(() => {
        this.loading.delete(url);
        return null;
      });
    this.loading.set(url, task);
    return task;
  }

  init() {
    if (this.ready || typeof window === 'undefined') return;
    this.ready = true;
    // Lazy-preload only the 5 core tap SFX instead of all 50+ WAVs upfront
    CORE_PRELOAD.forEach((url) => {
      void this.loadBuffer(url);
    });
  }

  isVoiceBusy() {
    return !!(this.voiceAudio && !this.voiceAudio.paused && !this.voiceAudio.ended);
  }

  play(name: TSfxName, enabled: boolean, rate = 1) {
    if (!enabled || typeof window === 'undefined') return;
    if (!this.ready) this.init();
    const groupKey = resolveGroup(name);
    const cfg = SFX_GROUPS[groupKey];
    if (!cfg || cfg.urls.length === 0) return;

    const st =
      this.groupState[groupKey] ??
      (this.groupState[groupKey] = { lastVariant: -1, stickRemaining: 0 });

    if (st.lastVariant < 0 || st.stickRemaining <= 0) {
      let vIdx = Math.floor(Math.random() * cfg.urls.length);
      if (cfg.urls.length > 1 && vIdx === st.lastVariant) {
        vIdx = (vIdx + 1) % cfg.urls.length;
      }
      st.lastVariant = vIdx;
      const min = cfg.stickMin ?? 1;
      const max = cfg.stickMax ?? 1;
      st.stickRemaining = min + Math.floor(Math.random() * (Math.max(0, max - min) + 1));
    }
    st.stickRemaining -= 1;

    const url = cfg.urls[st.lastVariant];
    const jitter = cfg.jitterPitch ? 1 + (Math.random() * 2 - 1) * cfg.jitterPitch : 1;
    const playbackRate = Math.max(0.55, Math.min(1.6, rate * jitter));

    const ctx = this.ensureContext();
    if (!ctx) return;

    const trigger = (buf: AudioBuffer | null) => {
      if (!buf || !this.ctx) return;
      try {
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        src.playbackRate.value = playbackRate;
        const gain = this.ctx.createGain();
        gain.gain.value = cfg.volume;
        src.connect(gain);
        gain.connect(this.ctx.destination);
        src.start(0);
      } catch {
        // Ignore audio errors
      }
    };

    const cached = this.buffers.get(url);
    if (cached) {
      trigger(cached);
    } else {
      void this.loadBuffer(url).then(trigger);
    }
  }

  private playVoiceUrl(url: string) {
    try {
      if (!this.voiceAudio) {
        this.voiceAudio = new Audio();
        this.voiceAudio.preload = 'none';
      }
      this.voiceAudio.pause();
      this.voiceAudio.src = url;
      this.voiceAudio.volume = 1.0;
      this.voiceAudio.play().catch(() => undefined);
    } catch {
      // Ignore autoplay errors
    }
  }

  playRandomVoice(enabled: boolean, rng: () => number = Math.random): string | null {
    if (!enabled || typeof window === 'undefined') return null;
    if (this.isVoiceBusy()) return null;
    let index = Math.floor(rng() * VOICE_PHRASE_URLS.length);
    if (VOICE_PHRASE_URLS.length > 1 && index === this.lastVoiceIndex) {
      index = (index + 1) % VOICE_PHRASE_URLS.length;
    }
    this.lastVoiceIndex = index;
    const url = VOICE_PHRASE_URLS[index];
    this.playVoiceUrl(url);
    return url;
  }

  playTeammateVoice(
    mate: 1 | 2,
    enabled: boolean,
    rng: () => number = Math.random
  ): { caption: string; durationMs: number } | null {
    if (typeof window === 'undefined') return null;
    const clips = TEAMMATE_VOICE_CLIPS[mate];
    let index = Math.floor(rng() * clips.length);
    if (clips.length > 1 && index === this.lastMateIndex[mate]) {
      index = (index + 1) % clips.length;
    }
    this.lastMateIndex[mate] = index;
    const clip = clips[index];
    if (enabled && !this.isVoiceBusy()) {
      this.playVoiceUrl(clip.url);
    }
    return { caption: clip.caption, durationMs: clip.durationMs };
  }

  playVeloVoice(enabled: boolean, rng: () => number = Math.random): string | null {
    if (!enabled || typeof window === 'undefined') return null;
    if (this.isVoiceBusy()) return null;
    let index = Math.floor(rng() * VELO_VOICE_URLS.length);
    if (VELO_VOICE_URLS.length > 1 && index === this.lastVeloIndex) {
      index = (index + 1) % VELO_VOICE_URLS.length;
    }
    this.lastVeloIndex = index;
    const url = VELO_VOICE_URLS[index];
    this.playVoiceUrl(url);
    return url;
  }

  stopVoices() {
    if (!this.voiceAudio) return;
    try {
      this.voiceAudio.pause();
      this.voiceAudio.currentTime = 0;
    } catch {
      // Ignore
    }
  }
}

export const sfx = new SfxManager();
