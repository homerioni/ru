export type TCanPose = 'stand' | 'lie' | 'crushed';
export type TSlotZone = 'floor' | 'bench' | 'shelf';
export type TSkillId =
  | 'throat'
  | 'stomach'
  | 'burp'
  | 'opener'
  | 'coach'
  | 'armband'
  | 'tattoo'
  | 'crit'
  | 'recycle'
  | 'stealth'
  | 'hype'
  | 'marathon';

export type TKvasPlayer = {
  id: number;
  name: string;
  number: number | null;
  photo: string | null;
};

export type TGameState = {
  version: 1;
  playerId: number;
  sips: number;
  cans: number;
  kvasiki: number;
  can: { state: 'closed' | 'open'; left: number };
  skills: Record<TSkillId, number>;
  roomLevel: number;
  roomItems: number[];
  slots: Record<TSlotZone, (TCanPose | null)[]>;
  pileCount: number;
  stats: {
    burps: number;
    megaBurps: number;
    coachCaught: number;
    cleanerVisits: number;
    playMs: number;
  };
  finalSeen: boolean;
  soundOn: boolean;
};

export type TEffect =
  | { type: 'open'; phrase: string }
  | { type: 'sip'; crit?: boolean; double?: boolean }
  | { type: 'canDone'; phrase: string | null }
  | { type: 'burp'; phrase: string; mega: boolean }
  | { type: 'belly'; name: string }
  | { type: 'rank'; name: string }
  | { type: 'final' }
  | { type: 'pigeon' };

export type TAction =
  | { type: 'SIP'; auto: boolean; caught: boolean; lastBurp: string | null }
  | { type: 'BUY_SKILL'; id: TSkillId }
  | { type: 'BUY_ROOM'; id: number }
  | { type: 'CLEANER_CLEAN' }
  | { type: 'COACH_BONUS' }
  | { type: 'TEAMMATE_BONUS' }
  | { type: 'TICK_PLAYTIME'; ms: number }
  | { type: 'MARK_FINAL_SEEN' }
  | { type: 'TOGGLE_SOUND' }
  | { type: 'RESET' };

export type TPoint = [number, number];

export type TManifest = {
  scene: TPoint;
  focus: TPoint;
  kitColors: { shirt: string; shorts: string; socks: string };
  players: number[];
  body: {
    cell: TPoint;
    frames: number;
    anchors: Record<string, { neck: TPoint; hand: TPoint }[]>;
  };
  head: { cell: TPoint; frames: number; neck: TPoint };
  playerPosition: TPoint;
  slots: Record<TSlotZone, TPoint[]>;
  pilePosition: TPoint;
  pigeonOnPile: TPoint[];
  coachPosition: TPoint;
  teammatePosition: TPoint;
  egorPosition: TPoint;
  cleanerPosition: TPoint;
  can: { cell: TPoint; sheetCell: TPoint; frames: number };
  canDrink: { cell: TPoint; sheetCell: TPoint; frames: number };
  canCrushed: { cell: TPoint; sheetCell: TPoint; frames: number };
  pile: { cell: TPoint; frames: number };
  coach: { cell: TPoint; frames: number };
  teammate: { cell: TPoint; frames: number };
  egor: { cell: TPoint; frames: number };
  velo: { cell: TPoint; frames: number };
  cleaner: { cell: TPoint; frames: number };
  pigeon: { cell: TPoint; frames: number };
  upgradeFrames: Record<string, number>;
};
