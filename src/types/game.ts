export interface PuckState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  spd: number;
}

export interface PlayerMallet {
  x: number;
  y: number;
  r: number;
  pvx: number;
  pvy: number;
}

export interface CpuMallet {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  mistakeTimer: number;
  errorY: number;
  hitCool: number;
}

export interface SideStats {
  goals: number;
  streak: number;
  bestStreak: number;
  topSpeed: number;
  powerHits: number;
}

export interface MatchStats {
  p: SideStats;
  cpu: SideStats;
  rallyHits: number;
  totalHits: number;
}

export interface GameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  col: string;
  size: number;
  glow: boolean;
  gravity: number;
}

export interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotV: number;
  w: number;
  h: number;
  col: string;
  life: number;
}

export type Side = "p" | "cpu";
export type GameState = "title" | "play" | "goal" | "over";
export type SoundType =
  | "hit"
  | "wall"
  | "goal"
  | "victory"
  | "speedup"
  | "slomo_in";
