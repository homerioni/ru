'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AUTO_SIP_INTERVAL_MS_BY_LEVEL,
  CLEANER_STAY_MS,
  COACH_CREAK_MS,
  COACH_LOOK_MS,
  EVENT_TICK_MS,
  FINAL_CANS,
  HYPE_TEAMMATE_BONUS,
  PIGEON_STAY_MAX_MS,
  PIGEON_STAY_MIN_MS,
  SLOT_COUNTS,
  VELO_CHANCE,
} from '../logic/balance';
import { canStartCleaner, canStartCoach, coachRoll } from '../logic/events';
import {
  CLEANER_BONUS_PHRASE,
  CLEANER_PHRASES,
  COACH_CAUGHT_PHRASE,
  COACH_CREAK_PHRASE,
  COACH_SAFE_PHRASE,
  PIGEON_PHRASE,
  TEAMMATE_BANTER,
} from '../logic/phrases';
import { pick } from '../logic/random';
import { reduceGame } from '../logic/reducer';
import { bellyStage, voiceTriggerChance } from '../logic/selectors';
import { sfx, TSfxName } from '../logic/sfx';
import { loadState, saveState } from '../logic/storage';
import { TAction, TEffect, TGameState, TSkillId } from '../types';

export type TTapPopup = {
  id: number;
  x: number;
  y: number;
  text: string;
  tone: 'gold' | 'burp' | 'warn';
};

const DRINK_BODY_VARIANTS = [
  [1, 2, 0],
  [1, 2, 2, 0],
  [4, 1, 2, 0],
];

const playSequence = (
  frames: number[],
  fps: number,
  token: { current: number },
  setFrame: (frame: number) => void
) => {
  const mine = ++token.current;
  frames.forEach((frame, index) => {
    window.setTimeout(() => {
      if (token.current !== mine) return;
      setFrame(frame);
    }, (index * 1000) / fps);
  });
};

export const useGame = (playerId: number) => {
  const [state, setState] = useState<TGameState | null>(null);
  const stateRef = useRef<TGameState | null>(null);
  const [bodyFrame, setBodyFrame] = useState(0);
  const [headFrame, setHeadFrame] = useState(0);
  const [canPop, setCanPop] = useState(false);
  const [shake, setShake] = useState<[number, number]>([0, 0]);
  const [dark, setDark] = useState(false);
  const [bubbles, setBubbles] = useState<{ id: number; text: string }[]>([]);
  const [popups, setPopups] = useState<TTapPopup[]>([]);
  const [coach, setCoach] = useState<'idle' | 'creak' | 'look'>('idle');
  const [coachYell, setCoachYell] = useState(false);
  const [cleaner, setCleaner] = useState(false);
  const [pigeon, setPigeon] = useState(false);
  const [teammate, setTeammate] = useState<1 | 2 | null>(null);
  const [teammateFrame, setTeammateFrame] = useState(0);
  const [velo, setVelo] = useState<'idle' | 'ride' | 'crash'>('idle');
  const [veloImpulse, setVeloImpulse] = useState(0);

  const bodyToken = useRef(0);
  const headToken = useRef(0);
  const shakeToken = useRef(0);
  const bubbleId = useRef(0);
  const popupId = useRef(0);
  const sipToggle = useRef(0);
  const bodyFrameRef = useRef(0);
  const headFrameRef = useRef(0);
  const lastBurp = useRef<string | null>(null);
  const coachCaught = useRef(false);
  const lastCoachAt = useRef(0);
  const lastCleanerAt = useRef(0);
  const coachRef = useRef(coach);
  const cleanerRef = useRef(cleaner);
  const teammateRef = useRef(teammate);
  const veloRef = useRef(velo);
  const teammateTimer = useRef<number | null>(null);
  const teammateAnimTimer = useRef<number | null>(null);
  const veloTimers = useRef<number[]>([]);
  const reducedRef = useRef(false);
  coachRef.current = coach;
  cleanerRef.current = cleaner;
  teammateRef.current = teammate;
  veloRef.current = velo;
  bodyFrameRef.current = bodyFrame;
  headFrameRef.current = headFrame;

  const pushBubble = useCallback((text: string) => {
    const id = ++bubbleId.current;
    setBubbles((prev) => [...prev, { id, text }].slice(-2));
    window.setTimeout(() => {
      setBubbles((prev) => prev.filter((item) => item.id !== id));
    }, 1200);
  }, []);

  const pushPopup = useCallback(
    (x: number, y: number, text: string, tone: TTapPopup['tone'] = 'gold') => {
      const id = ++popupId.current;
      setPopups((prev) => [...prev, { id, x, y, text, tone }].slice(-4));
      window.setTimeout(() => {
        setPopups((prev) => prev.filter((item) => item.id !== id));
      }, 650);
    },
    []
  );

  const runShake = useCallback((steps: [number, number][]) => {
    if (reducedRef.current) return;
    const mine = ++shakeToken.current;
    steps.forEach((step, index) => {
      window.setTimeout(() => {
        if (shakeToken.current !== mine) return;
        setShake(step);
      }, index * 90);
    });
  }, []);

  const playSound = useCallback((name: TSfxName, rate = 1) => {
    sfx.play(name, !!stateRef.current?.soundOn, rate);
  }, []);

  const handleEffects = useCallback(
    (effects: TEffect[], point?: { x: number; y: number }, deltaKvasiki = 0) => {
      const burp = effects.find((effect) => effect.type === 'burp');
      const done = effects.find((effect) => effect.type === 'canDone');
      const opened = effects.find((effect) => effect.type === 'open');
      const sipEffect = effects.find((effect) => effect.type === 'sip');

      if (opened && opened.type === 'open') {
        pushBubble(opened.phrase);
        playSound('open');
        setCanPop(true);
        if (!sipEffect) {
          playSequence([4, 0], 10, bodyToken, setBodyFrame);
          playSequence([5, 0], 10, headToken, setHeadFrame);
        }
        window.setTimeout(() => setCanPop(false), 220);
      }

      if (burp && burp.type === 'burp') {
        lastBurp.current = burp.phrase;
        pushBubble(burp.phrase);
        playSequence([3, 3, 0], 8, bodyToken, setBodyFrame);
        playSequence(
          [burp.mega ? 3 : 2, burp.mega ? 3 : 2, 0],
          8,
          headToken,
          setHeadFrame
        );
        playSound(
          burp.mega ? 'burp2' : sipToggle.current % 2 === 0 ? 'burp1' : 'burp2',
          burp.mega ? 0.72 : 1
        );
        runShake(
          burp.mega
            ? [
                [4, 0],
                [-4, 2],
                [4, -2],
                [0, 0],
              ]
            : [
                [2, 0],
                [-2, 1],
                [0, 0],
              ]
        );
        if (burp.mega) {
          setDark(true);
          window.setTimeout(() => setDark(false), 250);
        }
        if (point && deltaKvasiki > 0) {
          pushPopup(point.x, point.y - 16, `+${deltaKvasiki} ОТРЫЖКА!`, 'burp');
        }
      } else if (done && done.type === 'canDone') {
        playSequence([2, 4, 3, 0], 10, bodyToken, setBodyFrame);
        playSequence([1, 5, 0], 8, headToken, setHeadFrame);
        playSound('canDrop');
        if (done.phrase) pushBubble(done.phrase);
        if (point && deltaKvasiki > 0) {
          pushPopup(point.x, point.y - 12, `+${deltaKvasiki} БАНКА!`, 'gold');
        }
      } else if (sipEffect && sipEffect.type === 'sip') {
        sipToggle.current += 1;
        const seq = DRINK_BODY_VARIANTS[sipToggle.current % DRINK_BODY_VARIANTS.length];
        playSequence(seq, sipEffect.crit ? 10 : 8, bodyToken, setBodyFrame);
        playSequence(
          [sipEffect.crit ? 5 : 1, 1, 0],
          8,
          headToken,
          setHeadFrame
        );
        playSound('sip', sipEffect.crit ? 1.12 : 1);
        if (sipEffect.crit) {
          runShake([
            [2, -1],
            [-2, 1],
            [0, 0],
          ]);
        }
        if (point && deltaKvasiki > 0) {
          const label = sipEffect.crit
            ? `+${deltaKvasiki} КРИТ ×3!`
            : sipEffect.double
              ? `+${deltaKvasiki} ДВОЙНОЙ!`
              : `+${deltaKvasiki} кв.`;
          pushPopup(point.x, point.y, label, sipEffect.crit ? 'burp' : 'gold');
        }
      } else if (opened && point) {
        pushPopup(point.x, point.y, 'ПШШШ!', 'gold');
      }

      effects.forEach((effect) => {
        if (effect.type === 'belly') {
          pushBubble(effect.name);
          runShake([
            [2, 2],
            [-2, 0],
            [0, 0],
          ]);
          playSound('levelup');
        }
        if (effect.type === 'rank') {
          pushBubble(effect.name);
          playSound('levelup');
        }
        if (effect.type === 'pigeon') setPigeon(true);
      });
    },
    [playSound, pushBubble, pushPopup, runShake]
  );

  const applyRef = useRef<(action: TAction, point?: { x: number; y: number }) => number>(
    () => 0
  );
  applyRef.current = (action, point) => {
    const current = stateRef.current;
    if (!current) return 0;
    const result = reduceGame(current, action, Math.random);
    const delta = result.state.kvasiki - current.kvasiki;
    stateRef.current = result.state;
    setState(result.state);
    handleEffects(result.effects, point, delta);
    return delta;
  };

  useEffect(() => {
    const loaded = loadState(playerId);
    stateRef.current = loaded;
    setState(loaded);
    setCoach('idle');
    setCoachYell(false);
    setCleaner(false);
    setPigeon(false);
    setTeammate(null);
    setTeammateFrame(0);
    setVelo('idle');
    setBubbles([]);
    setPopups([]);
    setBodyFrame(0);
    setHeadFrame(0);
    setDark(false);
    setShake([0, 0]);
  }, [playerId]);

  useEffect(() => {
    return () => {
      if (teammateTimer.current !== null) window.clearTimeout(teammateTimer.current);
      if (teammateAnimTimer.current !== null) window.clearInterval(teammateAnimTimer.current);
      veloTimers.current.forEach((id) => window.clearTimeout(id));
      veloTimers.current = [];
    };
  }, []);

  // Natural idle blinking & subtle nod micro-animations when resting
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden || bodyFrameRef.current !== 0 || headFrameRef.current !== 0) return;
      if (Math.random() < 0.72) {
        playSequence([4, 4, 0], 10, headToken, setHeadFrame);
      } else {
        playSequence([5, 5, 0], 8, headToken, setHeadFrame);
      }
    }, 2900);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    sfx.init();
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const loaded = stateRef.current;
    const curBelly = loaded ? bellyStage(loaded.cans) : 0;
    const curRoom = loaded?.roomLevel ?? 1;
    const urls = [
      '/game/kvas/room/base.png',
      '/game/kvas/room/upgrade-1.png',
      '/game/kvas/players/_default/head.png',
      '/game/kvas/props/can.png',
      '/game/kvas/props/can-drink.png',
      '/game/kvas/props/can-crushed.png',
      '/game/kvas/props/grip-idle.png',
      '/game/kvas/props/grip-drink.png',
      `/game/kvas/body/belly-${curBelly}.png`,
      ...(curBelly < 9 ? [`/game/kvas/body/belly-${curBelly + 1}.png`] : []),
      ...(curRoom > 1 ? [`/game/kvas/room/upgrade-${curRoom}.png`] : []),
      ...(curRoom < 12 ? [`/game/kvas/room/upgrade-${curRoom + 1}.png`] : []),
    ];
    urls.forEach((url) => {
      const image = new Image();
      image.src = url;
    });
  }, []);

  useEffect(() => {
    if (!state) return;
    const timer = window.setTimeout(() => saveState(state), 2000);
    const flush = () => {
      if (stateRef.current) saveState(stateRef.current);
    };
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', flush);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', flush);
    };
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden || !stateRef.current) return;
      applyRef.current({ type: 'TICK_PLAYTIME', ms: 15000 });
    }, 15000);
    return () => window.clearInterval(timer);
  }, [playerId]);

  const coachLevel = state?.skills.coach;
  useEffect(() => {
    if (coachLevel == null) return;
    const interval = AUTO_SIP_INTERVAL_MS_BY_LEVEL[coachLevel];
    if (interval == null) return;
    const timer = window.setInterval(() => {
      const current = stateRef.current;
      if (document.hidden || !current) return;
      if (current.cans >= FINAL_CANS && !current.finalSeen) return;
      applyRef.current({
        type: 'SIP',
        auto: true,
        caught: false,
        lastBurp: lastBurp.current,
      });
    }, interval);
    return () => window.clearInterval(timer);
  }, [playerId, coachLevel]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const current = stateRef.current;
      if (!current || (current.cans >= FINAL_CANS && !current.finalSeen)) return;
      const busy =
        coachRef.current !== 'idle' ||
        cleanerRef.current ||
        teammateRef.current !== null ||
        veloRef.current !== 'idle';
      const now = Date.now();
      if (canStartCoach(now, lastCoachAt.current, busy) && coachRoll(Math.random)) {
        lastCoachAt.current = now;
        coachCaught.current = false;
        setCoachYell(false);
        setCoach('creak');
        return;
      }
      const fill = current.slots.floor.filter(Boolean).length / SLOT_COUNTS.floor;
      if (canStartCleaner(fill, now, lastCleanerAt.current, busy)) {
        lastCleanerAt.current = now;
        setCleaner(true);
      }
    }, EVENT_TICK_MS);
    return () => window.clearInterval(timer);
  }, [playerId]);

  useEffect(() => {
    if (coach !== 'creak') return;
    pushBubble(COACH_CREAK_PHRASE);
    playSound('creak');
    const timer = window.setTimeout(() => setCoach('look'), COACH_CREAK_MS);
    return () => window.clearTimeout(timer);
  }, [coach, playSound, pushBubble]);

  useEffect(() => {
    if (coach !== 'look') return;
    const timer = window.setTimeout(() => {
      if (!coachCaught.current) {
        applyRef.current({ type: 'COACH_BONUS' });
        pushBubble(COACH_SAFE_PHRASE);
        playSound('coin');
      }
      setCoach('idle');
      setCoachYell(false);
    }, COACH_LOOK_MS);
    return () => window.clearTimeout(timer);
  }, [coach, playSound, pushBubble]);

  useEffect(() => {
    if (!cleaner) return;
    pushBubble(pick(Math.random, CLEANER_PHRASES));
    playSound('sweep');
    const timer = window.setTimeout(() => {
      applyRef.current({ type: 'CLEANER_CLEAN' });
      pushBubble(CLEANER_BONUS_PHRASE);
      playSound('coin');
      setCleaner(false);
    }, CLEANER_STAY_MS);
    return () => window.clearTimeout(timer);
  }, [cleaner, playSound, pushBubble]);

  useEffect(() => {
    if (!pigeon) return;
    playSound('pigeon');
    const stay =
      PIGEON_STAY_MIN_MS + Math.random() * (PIGEON_STAY_MAX_MS - PIGEON_STAY_MIN_MS);
    const timer = window.setTimeout(() => setPigeon(false), stay);
    return () => window.clearTimeout(timer);
  }, [pigeon, playSound]);

  const spawnTeammateVisit = useCallback(
    (mate: 1 | 2, point?: { x: number; y: number }) => {
      if (teammateTimer.current !== null) window.clearTimeout(teammateTimer.current);
      if (teammateAnimTimer.current !== null) window.clearInterval(teammateAnimTimer.current);
      const clip = sfx.playTeammateVoice(mate, !!stateRef.current?.soundOn);
      const stayMs = Math.min(7500, Math.max(2800, clip?.durationMs ?? 3200));
      setTeammate(mate);
      setTeammateFrame(0);
      pushBubble(clip ? clip.caption : pick(Math.random, TEAMMATE_BANTER));

      const hypeLevel = stateRef.current?.skills.hype ?? 0;
      if (hypeLevel > 0 && (HYPE_TEAMMATE_BONUS[hypeLevel] ?? 0) > 0) {
        const bonus = applyRef.current({ type: 'TEAMMATE_BONUS' });
        if (bonus > 0 && point) {
          pushPopup(point.x + 18, point.y - 24, `+${bonus} БРАТВА!`, 'gold');
        }
      }

      let step = 0;
      teammateAnimTimer.current = window.setInterval(() => {
        step += 1;
        setTeammateFrame(step % 2 === 1 ? 1 : 2);
      }, 240);
      teammateTimer.current = window.setTimeout(() => {
        if (teammateAnimTimer.current !== null) {
          window.clearInterval(teammateAnimTimer.current);
          teammateAnimTimer.current = null;
        }
        setTeammate(null);
        setTeammateFrame(0);
        teammateTimer.current = null;
      }, stayMs);
    },
    [pushBubble, pushPopup]
  );

  const spawnVeloCrash = useCallback(() => {
    veloTimers.current.forEach((id) => window.clearTimeout(id));
    veloTimers.current = [];
    setVelo('ride');

    const tCrash = window.setTimeout(() => {
      setVelo('crash');
      setVeloImpulse((prev) => prev + 1);
      playSound('veloCrash');
      runShake([
        [6, -3],
        [-6, 4],
        [5, -2],
        [-4, 2],
        [2, 0],
        [0, 0],
      ]);
    }, 540);

    const tVoice = window.setTimeout(() => {
      sfx.playVeloVoice(!!stateRef.current?.soundOn);
    }, 840);

    const tDone = window.setTimeout(() => {
      setVelo('idle');
    }, 1060);

    veloTimers.current = [tCrash, tVoice, tDone];
  }, [playSound, runShake]);

  const sip = (auto = false, point?: { x: number; y: number }) => {
    const current = stateRef.current;
    if (!current || (current.cans >= FINAL_CANS && !current.finalSeen)) return;
    const caught = !auto && coachRef.current === 'look';
    if (caught) {
      coachCaught.current = true;
      setCoachYell(true);
      playSound('whistle');
    }
    applyRef.current({ type: 'SIP', auto, caught, lastBurp: lastBurp.current }, point);
    const canRunVelo =
      !auto &&
      veloRef.current === 'idle' &&
      coachRef.current === 'idle' &&
      !cleanerRef.current &&
      !teammateRef.current &&
      !sfx.isVoiceBusy();
    if (canRunVelo && Math.random() < VELO_CHANCE) {
      spawnVeloCrash();
    } else if (!auto && Math.random() < voiceTriggerChance(current)) {
      const canRunTeammate =
        coachRef.current === 'idle' &&
        !cleanerRef.current &&
        !teammateRef.current &&
        veloRef.current === 'idle' &&
        !sfx.isVoiceBusy();
      // Combined 5% (+ hype bonus) pool: 6 clips (teammate 1) + 10 clips (teammate 2) + 12 clips (ordinary) = 28
      const roll = Math.random() * 28;
      if (canRunTeammate && roll < 16) {
        spawnTeammateVisit(roll < 6 ? 1 : 2, point);
      } else {
        sfx.playRandomVoice(!!stateRef.current?.soundOn);
      }
    }
    if (caught) {
      pushBubble(COACH_CAUGHT_PHRASE);
      if (point) pushPopup(point.x, point.y - 22, 'ТРЕНЕР СПАЛИЛ!', 'warn');
    }
  };

  const finalOpen = !!state && state.cans >= FINAL_CANS && !state.finalSeen;

  return {
    state,
    bodyFrame,
    headFrame,
    canPop,
    shake,
    dark: dark || (state ? state.roomLevel < 1 : true),
    bubbles,
    popups,
    coach,
    coachYell,
    cleaner,
    pigeon,
    teammate,
    teammateFrame,
    velo,
    veloImpulse,
    finalOpen,
    sip,
    buySkill: (id: TSkillId) => {
      const prev = stateRef.current?.kvasiki ?? 0;
      applyRef.current({ type: 'BUY_SKILL', id });
      if ((stateRef.current?.kvasiki ?? 0) < prev) playSound('coin');
      if (stateRef.current) saveState(stateRef.current);
    },
    pokePigeon: () => {
      playSound('pigeon');
      pushBubble(PIGEON_PHRASE);
    },
    toggleSound: () => {
      const nextOn = !stateRef.current?.soundOn;
      applyRef.current({ type: 'TOGGLE_SOUND' });
      if (nextOn) sfx.play('click', true);
      else sfx.stopVoices();
      if (stateRef.current) saveState(stateRef.current);
    },
    buyRoom: () => {
      const prev = stateRef.current?.roomLevel ?? 0;
      applyRef.current({ type: 'BUY_ROOM' });
      if ((stateRef.current?.roomLevel ?? 0) > prev) playSound('levelup');
      if (stateRef.current) saveState(stateRef.current);
    },
    flushSave: () => {
      if (stateRef.current) saveState(stateRef.current);
    },
    clickUi: () => playSound('click'),
    continueSeason: () => applyRef.current({ type: 'MARK_FINAL_SEEN' }),
    reset: () => applyRef.current({ type: 'RESET' }),
  };
};
