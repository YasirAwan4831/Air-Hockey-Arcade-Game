"use client";

import { useEffect, useRef } from "react";
import { AudioEngine } from "@/lib/audioEngine";
import { clamp, darken, lighten } from "@/lib/utils";
import {
  W,
  H,
  TABLE_X,
  TABLE_Y,
  TABLE_W,
  TABLE_H,
  CX,
  CY,
  GOAL_Y1,
  GOAL_Y2,
  GOAL_DEPTH,
  PUCK_R,
  MALLET_R,
  MAX_SCORE,
  FRICTION,
  WALL_BOUNCE,
  CPU_SPEED,
  CPU_REACT,
  CPU_ERROR_Y,
  CPU_MISTAKE_CHANCE,
  CPU_MISTAKE_DUR,
} from "@/lib/constants";
import type {
  PuckState,
  TrailPoint,
  PlayerMallet,
  CpuMallet,
  MatchStats,
  GameParticle,
  ConfettiPiece,
  Side,
  GameState,
} from "@/types/game";

export default function AirHockeyGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const muteBtnRef = useRef<HTMLDivElement | null>(null);
  const gameoverRef = useRef<HTMLDivElement | null>(null);
  const goWhoRef = useRef<HTMLDivElement | null>(null);
  const goWinsRef = useRef<HTMLDivElement | null>(null);
  const goFinalRef = useRef<HTMLDivElement | null>(null);
  const goFaceRef = useRef<HTMLDivElement | null>(null);
  const btnAgainRef = useRef<HTMLButtonElement | null>(null);

  const scorePRef = useRef<HTMLDivElement | null>(null);
  const scoreCpuRef = useRef<HTMLDivElement | null>(null);
  const pStreakRef = useRef<HTMLSpanElement | null>(null);
  const pSpeedRef = useRef<HTMLSpanElement | null>(null);
  const pPowerRef = useRef<HTMLSpanElement | null>(null);
  const cpuStreakRef = useRef<HTMLSpanElement | null>(null);
  const cpuSpeedRef = useRef<HTMLSpanElement | null>(null);
  const cpuPowerRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const G = canvas.getContext("2d");
    if (!G) return;
    canvas.width = W;
    canvas.height = H;

    const audio = new AudioEngine();

    const updateMuteLabel = () => {
      if (muteBtnRef.current) {
        muteBtnRef.current.innerHTML = audio.muted
          ? "PRESS S FOR SOUND"
          : "PRESS S TO MUTE";
      }
    };
    updateMuteLabel();

    // ── Confetti ──
    const confetti: ConfettiPiece[] = [];
    const CONF_COLORS = [
      "#00d4ff",
      "#ff2d55",
      "#ffc940",
      "#ffffff",
      "#a855f7",
      "#22c55e",
      "#fb923c",
    ];
    let confettiInterval: ReturnType<typeof setInterval> | null = null;

    function spawnConfetti() {
      for (let i = 0; i < 160; i++) {
        confetti.push({
          x: Math.random() * W,
          y: -10 - Math.random() * 120,
          vx: (Math.random() - 0.5) * 5,
          vy: 2 + Math.random() * 4,
          rot: Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.22,
          w: 6 + Math.random() * 8,
          h: 3 + Math.random() * 4,
          col: CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)],
          life: 1,
        });
      }
    }
    function updateConfetti() {
      for (let i = confetti.length - 1; i >= 0; i--) {
        const c = confetti[i];
        c.x += c.vx;
        c.y += c.vy;
        c.vy += 0.08;
        c.vx *= 0.99;
        c.rot += c.rotV;
        if (c.y > H + 20) c.life -= 0.05;
        if (c.life <= 0) confetti.splice(i, 1);
      }
    }
    function drawConfetti() {
      confetti.forEach((c) => {
        G!.save();
        G!.globalAlpha = c.life;
        G!.translate(c.x, c.y);
        G!.rotate(c.rot);
        G!.fillStyle = c.col;
        G!.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        G!.restore();
      });
    }

    // ── Slo-mo state ──
    let sloMo = false;
    let sloMoAlpha = 0;
    let sloMoIntro = 0;
    let sloMoLabelTimer = 0;

    // ── State ──
    let state: GameState = "title";
    let tick = 0;
    let shakeX = 0,
      shakeY = 0,
      shakeAmt = 0;
    let goalFlash = 0,
      goalWho: Side = "p";
    let goalMsgScale = 0;
    let puckSpeedMult = 1.0;
    let lastSpeedUpAt = 0;
    let speedUpMsg = "";
    let speedUpTimer = 0;

    // ── Match stats ──
    const stats: MatchStats = {
      p: { goals: 0, streak: 0, bestStreak: 0, topSpeed: 0, powerHits: 0 },
      cpu: { goals: 0, streak: 0, bestStreak: 0, topSpeed: 0, powerHits: 0 },
      rallyHits: 0,
      totalHits: 0,
    };
    function resetStats() {
      stats.p = { goals: 0, streak: 0, bestStreak: 0, topSpeed: 0, powerHits: 0 };
      stats.cpu = { goals: 0, streak: 0, bestStreak: 0, topSpeed: 0, powerHits: 0 };
      stats.rallyHits = 0;
      stats.totalHits = 0;
    }

    // ── Score ──
    const score = { p: 0, cpu: 0 };

    // ── Puck ──
    const puck: PuckState = { x: CX, y: CY, vx: 0, vy: 0, r: PUCK_R };
    const trail: TrailPoint[] = [];

    // ── Mallets ──
    const player: PlayerMallet = {
      x: TABLE_X + 130,
      y: CY,
      r: MALLET_R,
      pvx: 0,
      pvy: 0,
    };
    const cpu: CpuMallet = {
      x: W - TABLE_X - 130,
      y: CY,
      r: MALLET_R,
      vx: 0,
      vy: 0,
      mistakeTimer: 0,
      errorY: 0,
      hitCool: 0,
    };

    // ── Particles ──
    const particles: GameParticle[] = [];
    function burst(x: number, y: number, col1: string, col2: string, n = 22) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2,
          s = 2 + Math.random() * 7;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 1,
          col: Math.random() > 0.5 ? col1 : col2,
          size: 2 + Math.random() * 4,
          glow: Math.random() > 0.4,
          gravity: 0.08 + Math.random() * 0.12,
        });
      }
    }
    function sparkLine(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      col: string,
      n = 8
    ) {
      for (let i = 0; i < n; i++) {
        const t = Math.random();
        const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 10;
        const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 10;
        const a = Math.random() * Math.PI * 2,
          s = 1 + Math.random() * 3;
        particles.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 1,
          col,
          size: 1.5 + Math.random() * 2,
          glow: true,
          gravity: 0.1,
        });
      }
    }

    // ── Input ──
    let rawMouseX = TABLE_X + 120,
      rawMouseY = H / 2;
    let prevRawX = TABLE_X + 120,
      prevRawY = H / 2;
    let mouseVX = 0,
      mouseVY = 0;

    function pointerToCanvas(clientX: number, clientY: number) {
      const r = canvas!.getBoundingClientRect();
      const scaleX = W / r.width,
        scaleY = H / r.height;
      const nx = (clientX - r.left) * scaleX;
      const ny = (clientY - r.top) * scaleY;
      rawMouseX = clamp(nx, TABLE_X + MALLET_R + 2, CX - 10);
      rawMouseY = clamp(
        ny,
        TABLE_Y + MALLET_R + 2,
        TABLE_Y + TABLE_H - MALLET_R - 2
      );
    }

    const onMouseMove = (e: MouseEvent) => pointerToCanvas(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      pointerToCanvas(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      pointerToCanvas(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyS") {
        audio.toggleMute();
        updateMuteLabel();
      }
      if (e.code === "Space" && state === "over") startGame();
    };

    canvas.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    document.addEventListener("keydown", onKeyDown);

    // ── Game flow ──
    function startGame() {
      score.p = 0;
      score.cpu = 0;
      resetStats();
      puckSpeedMult = 1.0;
      lastSpeedUpAt = 0;
      speedUpMsg = "";
      speedUpTimer = 0;
      sloMo = false;
      sloMoAlpha = 0;
      sloMoIntro = 0;
      sloMoLabelTimer = 0;
      confetti.length = 0;
      if (confettiInterval) {
        clearInterval(confettiInterval);
        confettiInterval = null;
      }
      resetRound("p");
      state = "play";
      gameoverRef.current?.classList.remove("on", "lose-state");
      particles.length = 0;
      updateStatDOM();
    }

    function resetRound(server: Side) {
      trail.length = 0;
      puck.x = CX;
      puck.y = CY;
      puck.vx = 0;
      puck.vy = 0;
      player.x = TABLE_X + 120;
      player.y = CY;
      player.pvx = 0;
      player.pvy = 0;
      cpu.x = W - TABLE_X - 120;
      cpu.y = CY;
      cpu.vx = 0;
      cpu.vy = 0;
      cpu.mistakeTimer = 0;
      stats.rallyHits = 0;
      if (server === "p") {
        puck.vx = -(3.5 + Math.random() * 1.5) * puckSpeedMult;
        puck.vy = (Math.random() - 0.5) * 3.5 * puckSpeedMult;
      } else {
        puck.vx = (3.5 + Math.random() * 1.5) * puckSpeedMult;
        puck.vy = (Math.random() - 0.5) * 3.5 * puckSpeedMult;
      }
    }

    function goalScored(who: Side) {
      if (state !== "play") return;
      state = "goal";
      goalWho = who;
      goalFlash = 160;
      goalMsgScale = 0;

      const ws = stats[who],
        ls = stats[who === "p" ? "cpu" : "p"];
      ws.goals++;
      ws.streak++;
      ws.bestStreak = Math.max(ws.bestStreak, ws.streak);
      ls.streak = 0;

      score[who]++;
      const totalGoals = score.p + score.cpu;
      if (totalGoals % 2 === 0 && totalGoals > lastSpeedUpAt) {
        lastSpeedUpAt = totalGoals;
        puckSpeedMult = Math.min(puckSpeedMult + 0.14, 2.0);
        const msgs = [
          "SPEEDING UP!",
          "FASTER!!",
          "KICK IT UP!",
          "NO MERCY!",
          "LIGHT SPEED!",
          "HOLD ON!!",
        ];
        speedUpMsg =
          msgs[Math.min(Math.floor(totalGoals / 2 - 1), msgs.length - 1)];
        speedUpTimer = 130;
      }
      if (who === "p") burst(TABLE_X, CY, "#00d4ff", "#ffffff", 40);
      else burst(W - TABLE_X, CY, "#ff2d55", "#ffffff", 40);
      burst(puck.x, puck.y, "#ffc940", "#ffffff", 30);
      shake(8);

      updateStatDOM();

      const newP = score.p,
        newCpu = score.cpu;
      if ((newP === MAX_SCORE - 1 || newCpu === MAX_SCORE - 1) && !sloMo) {
        sloMo = true;
        sloMoIntro = 80;
        sloMoLabelTimer = 80 + 90;
      }

      setTimeout(() => {
        if (score.p >= MAX_SCORE || score.cpu >= MAX_SCORE) {
          state = "over";
          const playerWon = score.p >= MAX_SCORE;
          if (goWhoRef.current) {
            goWhoRef.current.textContent = playerWon ? "YOU WIN" : "CPU WINS";
            goWhoRef.current.style.color = playerWon ? "#00d4ff" : "#ff2d55";
            goWhoRef.current.style.textShadow = playerWon
              ? "0 0 30px #00d4ff, 0 0 60px rgba(0,212,255,0.4)"
              : "0 0 30px #ff2d55, 0 0 60px rgba(255,45,85,0.4)";
          }
          if (goWinsRef.current) {
            goWinsRef.current.textContent = playerWon
              ? "GAME · SET · MATCH"
              : "BETTER LUCK NEXT TIME";
          }
          if (goFaceRef.current) {
            goFaceRef.current.textContent = playerWon ? "🏆" : "💀";
          }
          if (goFinalRef.current) {
            goFinalRef.current.textContent = `${score.p} – ${score.cpu}`;
          }
          gameoverRef.current?.classList.remove("lose-state");
          if (!playerWon) gameoverRef.current?.classList.add("lose-state");
          burst(CX, CY, "#ffc940", "#ffffff", 80);
          if (playerWon) {
            audio.play("victory");
            spawnConfetti();
            setTimeout(spawnConfetti, 400);
            setTimeout(spawnConfetti, 800);
            setTimeout(spawnConfetti, 1400);
            confettiInterval = setInterval(spawnConfetti, 1400);
          }
          gameoverRef.current?.classList.add("on");
        } else {
          resetRound(who === "p" ? "cpu" : "p");
          state = "play";
        }
      }, 1500);
    }

    function shake(amt: number) {
      shakeAmt = Math.max(shakeAmt, amt);
    }

    function updateStatDOM() {
      if (scorePRef.current) scorePRef.current.textContent = String(score.p);
      if (scoreCpuRef.current)
        scoreCpuRef.current.textContent = String(score.cpu);
      if (pStreakRef.current)
        pStreakRef.current.textContent = String(stats.p.bestStreak);
      if (pSpeedRef.current)
        pSpeedRef.current.textContent = String(stats.p.topSpeed);
      if (pPowerRef.current)
        pPowerRef.current.textContent = String(stats.p.powerHits);
      if (cpuStreakRef.current)
        cpuStreakRef.current.textContent = String(stats.cpu.bestStreak);
      if (cpuSpeedRef.current)
        cpuSpeedRef.current.textContent = String(stats.cpu.topSpeed);
      if (cpuPowerRef.current)
        cpuPowerRef.current.textContent = String(stats.cpu.powerHits);
    }

    // ── CPU AI ──
    function updateCPU(ts = 1) {
      const halfW = W / 2;
      const homeX = W - TABLE_X - 110;
      const minX = halfW + 10,
        maxX = W - TABLE_X - cpu.r - 2;
      const minY = TABLE_Y + cpu.r + 2,
        maxY = TABLE_Y + TABLE_H - cpu.r - 2;

      if (
        Math.random() < CPU_MISTAKE_CHANCE &&
        cpu.mistakeTimer === 0 &&
        puck.vx > 0
      ) {
        cpu.mistakeTimer = CPU_MISTAKE_DUR;
        cpu.errorY = (Math.random() - 0.5) * CPU_ERROR_Y * 2;
      }
      if (cpu.mistakeTimer > 0) cpu.mistakeTimer--;
      if (cpu.hitCool > 0) cpu.hitCool--;

      const err = cpu.mistakeTimer > 0 ? cpu.errorY : 0;
      const puckOnMySide = puck.x > halfW;
      const puckHeadingToMe = puck.vx > 0;

      const nearTopWall = cpu.y < minY + 20;
      const nearBottomWall = cpu.y > maxY - 20;
      const nearSideWall = cpu.x > maxX - 20;
      const cornered = (nearTopWall || nearBottomWall) && nearSideWall;
      const farFromHome = Math.hypot(cpu.x - homeX, cpu.y - CY) > 150;

      let tx: number, ty: number;

      if (cornered || (farFromHome && !puckHeadingToMe)) {
        tx = homeX;
        ty = CY;
      } else if (puckOnMySide && puckHeadingToMe) {
        const frames = Math.max(
          1,
          Math.min((cpu.x - puck.x) / Math.max(0.5, puck.vx), 60)
        );
        tx = clamp(puck.x + puck.vx * frames * CPU_REACT, minX, maxX);
        ty = clamp(puck.y + puck.vy * frames * CPU_REACT + err, minY, maxY);
      } else if (puckOnMySide) {
        tx = clamp(puck.x - 8, minX, maxX - 30);
        ty = clamp(puck.y + err, minY, maxY);
      } else {
        tx = homeX;
        ty = clamp(puck.y * 0.5 + CY * 0.5 + err * 0.3, minY, maxY);
      }

      const prevX = cpu.x,
        prevY = cpu.y;
      const dx = tx - cpu.x,
        dy = ty - cpu.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.1) {
        const step = Math.min(dist, CPU_SPEED * ts);
        cpu.x += (dx / dist) * step;
        cpu.y += (dy / dist) * step;
      }
      cpu.x = clamp(cpu.x, minX, maxX);
      cpu.y = clamp(cpu.y, minY, maxY);
      cpu.vx = cpu.x - prevX;
      cpu.vy = cpu.y - prevY;
    }

    // ── Physics ──
    function updatePuck() {
      if (state !== "play") return;

      const spd = Math.hypot(puck.vx, puck.vy);
      trail.push({ x: puck.x, y: puck.y, spd });
      if (trail.length > 18) trail.shift();

      if (spd < 0.8) {
        puck.vx += (Math.random() - 0.5) * 0.18;
        puck.vy += (Math.random() - 0.5) * 0.18;
      } else if (spd < 2.5) {
        puck.vx += (Math.random() - 0.5) * 0.06;
        puck.vy += (Math.random() - 0.5) * 0.06;
      }

      puck.x += puck.vx;
      puck.y += puck.vy;
      puck.vx *= FRICTION;
      puck.vy *= FRICTION;

      const tx = TABLE_X,
        ty = TABLE_Y,
        tw = TABLE_W,
        th = TABLE_H;

      if (puck.y - puck.r < ty) {
        puck.y = ty + puck.r;
        puck.vy = Math.abs(puck.vy) * WALL_BOUNCE;
        sparkLine(puck.x - 20, ty, puck.x + 20, ty, "#00d4ff");
      }
      if (puck.y + puck.r > ty + th) {
        puck.y = ty + th - puck.r;
        puck.vy = -Math.abs(puck.vy) * WALL_BOUNCE;
        sparkLine(puck.x - 20, ty + th, puck.x + 20, ty + th, "#00d4ff");
      }
      if (puck.x - puck.r < tx) {
        if (puck.y > GOAL_Y1 && puck.y < GOAL_Y2) {
          goalScored("cpu");
          return;
        }
        puck.x = tx + puck.r;
        puck.vx = Math.abs(puck.vx) * WALL_BOUNCE;
        sparkLine(tx, puck.y - 20, tx, puck.y + 20, "#ff2d55");
      }
      if (puck.x + puck.r > tx + tw) {
        if (puck.y > GOAL_Y1 && puck.y < GOAL_Y2) {
          goalScored("p");
          return;
        }
        puck.x = tx + tw - puck.r;
        puck.vx = -Math.abs(puck.vx) * WALL_BOUNCE;
        sparkLine(tx + tw, puck.y - 20, tx + tw, puck.y + 20, "#ff2d55");
      }

      circleMalletCollide(puck, true);
      circleMalletCollide(puck, false);
    }

    function circleMalletCollide(pk: PuckState, isPlayer: boolean) {
      const mallet = isPlayer ? player : cpu;
      const dx = pk.x - mallet.x,
        dy = pk.y - mallet.y;
      const dist = Math.hypot(dx, dy);
      const minDist = pk.r + mallet.r;
      if (dist >= minDist || dist < 0.01) return;

      if (!isPlayer && cpu.hitCool > 0) {
        const nx2 = dx / dist,
          ny2 = dy / dist;
        pk.x += nx2 * (minDist - dist);
        pk.y += ny2 * (minDist - dist);
        return;
      }

      const nx = dx / dist,
        ny = dy / dist;
      pk.x += nx * (minDist - dist);
      pk.y += ny * (minDist - dist);

      const mvx = isPlayer ? player.pvx * 1.8 : cpu.vx;
      const mvy = isPlayer ? player.pvy * 1.8 : cpu.vy;

      const relVX = pk.vx - mvx;
      const relVY = pk.vy - mvy;
      const dot = relVX * nx + relVY * ny;
      if (dot >= 0) return;

      const restitution = isPlayer ? 1.3 : 1.1;
      const impulse = -(1 + restitution) * dot;
      pk.vx += impulse * nx;
      pk.vy += impulse * ny;

      const spd = Math.hypot(pk.vx, pk.vy);
      const cap = (isPlayer ? 20 : 16) * puckSpeedMult;
      if (spd > cap) {
        pk.vx = (pk.vx / spd) * cap;
        pk.vy = (pk.vy / spd) * cap;
      }

      if (!isPlayer) cpu.hitCool = 20;

      const who: Side = isPlayer ? "p" : "cpu";
      stats.rallyHits++;
      const mphSpd = Math.round(spd * 4);
      if (mphSpd > stats[who].topSpeed) stats[who].topSpeed = mphSpd;
      if (spd > 14) stats[who].powerHits++;
      updateStatDOM();

      audio.play("hit", spd);

      if (spd > 3) {
        const col = isPlayer ? "#00d4ff" : "#ff2d55";
        burst(pk.x, pk.y, col, "#ffffff", Math.floor(spd * 1.5));
        if (spd > 19) shake(Math.min((spd - 19) * 0.4, 3));
      }
    }

    function updatePlayer(ts = 1) {
      const dx = rawMouseX - prevRawX;
      const dy = rawMouseY - prevRawY;
      mouseVX = mouseVX * 0.4 + dx * 0.6;
      mouseVY = mouseVY * 0.4 + dy * 0.6;
      prevRawX = rawMouseX;
      prevRawY = rawMouseY;

      if (ts === 1) {
        player.x = rawMouseX;
        player.y = rawMouseY;
      } else {
        player.x += (rawMouseX - player.x) * ts * 3;
        player.y += (rawMouseY - player.y) * ts * 3;
        player.x = clamp(player.x, TABLE_X + MALLET_R + 2, CX - 10);
        player.y = clamp(
          player.y,
          TABLE_Y + MALLET_R + 2,
          TABLE_Y + TABLE_H - MALLET_R - 2
        );
      }

      player.pvx = mouseVX * ts;
      player.pvy = mouseVY * ts;
    }

    // ══════════════════════════════════════
    //  RENDERING
    // ══════════════════════════════════════

    function grd(
      x: number,
      y: number,
      r0: number,
      r1: number,
      c0: string,
      c1: string
    ) {
      const g = G!.createRadialGradient(x, y, r0, x, y, r1);
      g.addColorStop(0, c0);
      g.addColorStop(1, c1);
      return g;
    }
    function lgrad(
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      stops: Array<[number, string]>
    ) {
      const g = G!.createLinearGradient(x0, y0, x1, y1);
      stops.forEach(([t, c]) => g.addColorStop(t, c));
      return g;
    }

    function drawTable() {
      const tx = TABLE_X,
        ty = TABLE_Y,
        tw = TABLE_W,
        th = TABLE_H;

      G!.save();
      G!.shadowColor = "rgba(0,180,255,0.2)";
      G!.shadowBlur = 28;
      G!.strokeStyle = "rgba(0,180,255,0.25)";
      G!.lineWidth = 3;
      G!.beginPath();
      G!.roundRect(tx - 4, ty - 4, tw + 8, th + 8, 14);
      G!.stroke();
      G!.restore();

      G!.fillStyle = lgrad(tx, ty, tx, ty + th, [
        [0, "#0a1a2e"],
        [0.5, "#071422"],
        [1, "#0a1a2e"],
      ]);
      G!.beginPath();
      G!.roundRect(tx, ty, tw, th, 10);
      G!.fill();

      G!.save();
      G!.globalAlpha = 0.055;
      G!.fillStyle = "#4af";
      for (let gx = tx + 18; gx < tx + tw - 10; gx += 18)
        for (let gy = ty + 18; gy < ty + th - 10; gy += 18) {
          G!.beginPath();
          G!.arc(gx, gy, 1.8, 0, Math.PI * 2);
          G!.fill();
        }
      G!.restore();

      G!.save();
      G!.strokeStyle = "rgba(0,212,255,0.16)";
      G!.lineWidth = 2;
      G!.setLineDash([6, 6]);
      G!.beginPath();
      G!.arc(CX, CY, 60, 0, Math.PI * 2);
      G!.stroke();
      G!.setLineDash([]);
      G!.restore();

      G!.save();
      G!.strokeStyle = "rgba(0,212,255,0.12)";
      G!.lineWidth = 2;
      G!.setLineDash([8, 8]);
      G!.beginPath();
      G!.moveTo(CX, ty + 2);
      G!.lineTo(CX, ty + th - 2);
      G!.stroke();
      G!.setLineDash([]);
      G!.restore();

      G!.save();
      G!.shadowColor = "rgba(0,212,255,0.5)";
      G!.shadowBlur = 8;
      G!.fillStyle = "rgba(0,212,255,0.4)";
      G!.beginPath();
      G!.arc(CX, CY, 5, 0, Math.PI * 2);
      G!.fill();
      G!.restore();

      const rt = lgrad(0, ty, 0, ty + 12, [
        [0, "#1a4a6e"],
        [0.6, "#0e2a40"],
        [1, "#0a1a2e"],
      ]);
      G!.fillStyle = rt;
      G!.fillRect(tx, ty, tw, 8);
      const rb = lgrad(0, ty + th - 8, 0, ty + th, [
        [0, "#0a1a2e"],
        [0.4, "#0e2a40"],
        [1, "#1a4a6e"],
      ]);
      G!.fillStyle = rb;
      G!.fillRect(tx, ty + th - 8, tw, 8);

      G!.save();
      G!.shadowColor = "#00d4ff";
      G!.shadowBlur = 10;
      G!.strokeStyle = "rgba(0,212,255,0.7)";
      G!.lineWidth = 2;
      G!.beginPath();
      G!.moveTo(tx + 2, ty + 2);
      G!.lineTo(tx + tw - 2, ty + 2);
      G!.stroke();
      G!.beginPath();
      G!.moveTo(tx + 2, ty + th - 2);
      G!.lineTo(tx + tw - 2, ty + th - 2);
      G!.stroke();
      G!.restore();

      G!.save();
      G!.shadowColor = "#00d4ff";
      G!.shadowBlur = 14;
      G!.strokeStyle = "rgba(0,212,255,0.7)";
      G!.lineWidth = 2.5;
      G!.beginPath();
      G!.moveTo(tx, GOAL_Y1);
      G!.lineTo(tx - GOAL_DEPTH, GOAL_Y1);
      G!.stroke();
      G!.beginPath();
      G!.moveTo(tx, GOAL_Y2);
      G!.lineTo(tx - GOAL_DEPTH, GOAL_Y2);
      G!.stroke();
      G!.strokeStyle = "rgba(0,212,255,0.3)";
      G!.lineWidth = 1.5;
      G!.beginPath();
      G!.moveTo(tx - GOAL_DEPTH, GOAL_Y1);
      G!.lineTo(tx - GOAL_DEPTH, GOAL_Y2);
      G!.stroke();
      G!.restore();

      G!.save();
      G!.shadowColor = "#ff2d55";
      G!.shadowBlur = 14;
      G!.strokeStyle = "rgba(255,45,85,0.7)";
      G!.lineWidth = 2.5;
      G!.beginPath();
      G!.moveTo(tx + tw, GOAL_Y1);
      G!.lineTo(tx + tw + GOAL_DEPTH, GOAL_Y1);
      G!.stroke();
      G!.beginPath();
      G!.moveTo(tx + tw, GOAL_Y2);
      G!.lineTo(tx + tw + GOAL_DEPTH, GOAL_Y2);
      G!.stroke();
      G!.strokeStyle = "rgba(255,45,85,0.3)";
      G!.lineWidth = 1.5;
      G!.beginPath();
      G!.moveTo(tx + tw + GOAL_DEPTH, GOAL_Y1);
      G!.lineTo(tx + tw + GOAL_DEPTH, GOAL_Y2);
      G!.stroke();
      G!.restore();

      [GOAL_Y1, GOAL_Y2].forEach((gy) => {
        G!.save();
        G!.shadowColor = "#00d4ff";
        G!.shadowBlur = 12;
        G!.fillStyle = "#00d4ff";
        G!.beginPath();
        G!.arc(tx, gy, 5, 0, Math.PI * 2);
        G!.fill();
        G!.restore();
        G!.save();
        G!.shadowColor = "#ff2d55";
        G!.shadowBlur = 12;
        G!.fillStyle = "#ff2d55";
        G!.beginPath();
        G!.arc(tx + tw, gy, 5, 0, Math.PI * 2);
        G!.fill();
        G!.restore();
      });
    }

    function drawPuck() {
      trail.forEach((t, i) => {
        const prog = i / trail.length;
        const r = prog * 9 * Math.min(t.spd / 6, 1);
        if (r < 0.5) return;
        G!.save();
        G!.globalAlpha = prog * 0.55 * Math.min(t.spd / 5, 1);
        G!.fillStyle = grd(
          t.x,
          t.y,
          0,
          r * 2,
          "rgba(0,212,255,0.9)",
          "transparent"
        );
        G!.beginPath();
        G!.arc(t.x, t.y, r * 2.2, 0, Math.PI * 2);
        G!.fill();
        G!.restore();
      });

      const bx = puck.x,
        by = puck.y,
        br = puck.r;
      const spd = Math.hypot(puck.vx, puck.vy);

      G!.save();
      G!.shadowColor = "#00d4ff";
      G!.shadowBlur = 24 + spd * 1.5;
      G!.fillStyle = grd(bx, by, 0, br + 8, "rgba(0,212,255,0.18)", "transparent");
      G!.beginPath();
      G!.arc(bx, by, br + 14, 0, Math.PI * 2);
      G!.fill();
      G!.restore();

      G!.fillStyle = grd(bx - br * 0.3, by - br * 0.3, br * 0.1, br, "#ffffff", "#cccccc");
      G!.beginPath();
      G!.arc(bx, by, br, 0, Math.PI * 2);
      G!.fill();

      G!.save();
      G!.shadowColor = "#00d4ff";
      G!.shadowBlur = 8;
      G!.strokeStyle = "#00d4ff";
      G!.lineWidth = 2.5;
      G!.beginPath();
      G!.arc(bx, by, br - 1, 0, Math.PI * 2);
      G!.stroke();
      G!.restore();

      G!.strokeStyle = "rgba(0,212,255,0.32)";
      G!.lineWidth = 1;
      G!.beginPath();
      G!.arc(bx, by, br * 0.55, 0, Math.PI * 2);
      G!.stroke();

      G!.fillStyle = "rgba(255,255,255,0.17)";
      G!.beginPath();
      G!.ellipse(bx - br * 0.28, by - br * 0.3, br * 0.38, br * 0.22, -0.4, 0, Math.PI * 2);
      G!.fill();
    }

    function drawMallet(m: { x: number; y: number; r: number }, col: string, glowCol: string) {
      const mx = m.x,
        my = m.y,
        mr = m.r;

      G!.save();
      G!.shadowColor = glowCol;
      G!.shadowBlur = 32;
      const halo = G!.createRadialGradient(mx, my, mr * 0.6, mx, my, mr + 18);
      halo.addColorStop(0, "transparent");
      halo.addColorStop(0.6, `${glowCol}22`);
      halo.addColorStop(1, "transparent");
      G!.fillStyle = halo;
      G!.beginPath();
      G!.arc(mx, my, mr + 18, 0, Math.PI * 2);
      G!.fill();
      G!.restore();

      G!.save();
      G!.globalAlpha = 0.45;
      G!.fillStyle = "rgba(0,0,0,0.7)";
      G!.beginPath();
      G!.ellipse(mx + 3, my + 4, mr, mr * 0.85, 0, 0, Math.PI * 2);
      G!.fill();
      G!.restore();

      const skirtG = G!.createRadialGradient(mx - mr * 0.2, my - mr * 0.2, mr * 0.1, mx, my, mr);
      skirtG.addColorStop(0, lighten(col, 0.12));
      skirtG.addColorStop(0.65, col);
      skirtG.addColorStop(1, darken(col, 0.45));
      G!.fillStyle = skirtG;
      G!.beginPath();
      G!.arc(mx, my, mr, 0, Math.PI * 2);
      G!.fill();

      G!.save();
      G!.shadowColor = glowCol;
      G!.shadowBlur = 12;
      G!.strokeStyle = glowCol;
      G!.lineWidth = 2.5;
      G!.beginPath();
      G!.arc(mx, my, mr - 1.5, 0, Math.PI * 2);
      G!.stroke();
      G!.restore();

      const grooveR = mr * 0.72;
      G!.strokeStyle = "rgba(0,0,0,0.55)";
      G!.lineWidth = 3;
      G!.beginPath();
      G!.arc(mx, my, grooveR, 0, Math.PI * 2);
      G!.stroke();
      G!.strokeStyle = "rgba(255,255,255,0.08)";
      G!.lineWidth = 1;
      G!.beginPath();
      G!.arc(mx, my, grooveR + 1.5, 0, Math.PI * 2);
      G!.stroke();

      const domeR = mr * 0.62;
      const domeG = G!.createRadialGradient(mx - domeR * 0.3, my - domeR * 0.35, 0, mx, my, domeR);
      domeG.addColorStop(0, lighten(col, 0.35));
      domeG.addColorStop(0.5, lighten(col, 0.1));
      domeG.addColorStop(1, darken(col, 0.2));
      G!.fillStyle = domeG;
      G!.beginPath();
      G!.arc(mx, my, domeR, 0, Math.PI * 2);
      G!.fill();

      G!.save();
      G!.shadowColor = glowCol;
      G!.shadowBlur = 14;
      G!.fillStyle = glowCol;
      G!.beginPath();
      G!.arc(mx, my, 4.5, 0, Math.PI * 2);
      G!.fill();
      G!.restore();

      G!.fillStyle = "rgba(255,255,255,0.28)";
      G!.beginPath();
      G!.ellipse(mx - domeR * 0.3, my - domeR * 0.32, domeR * 0.32, domeR * 0.18, -0.5, 0, Math.PI * 2);
      G!.fill();

      G!.fillStyle = "rgba(255,255,255,0.12)";
      G!.beginPath();
      G!.ellipse(mx - domeR * 0.15, my - domeR * 0.5, domeR * 0.14, domeR * 0.08, -0.3, 0, Math.PI * 2);
      G!.fill();
    }

    function drawParticles() {
      particles.forEach((p) => {
        G!.save();
        G!.globalAlpha = Math.pow(p.life, 1.4) * 0.9;
        if (p.glow) {
          G!.shadowColor = p.col;
          G!.shadowBlur = 10;
        }
        G!.fillStyle = p.col;
        G!.beginPath();
        G!.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        G!.fill();
        G!.restore();
      });
    }
    function updateParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.96;
        p.life -= 0.028;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }

    function drawGoalFlash() {
      if (goalFlash <= 0 || state !== "goal") return;
      const prog = goalFlash / 160,
        isP = goalWho === "p";
      G!.save();
      G!.globalAlpha = Math.min(prog * 3, 0.16);
      G!.fillStyle = isP ? "#00d4ff" : "#ff2d55";
      G!.fillRect(0, 0, W, H);
      G!.restore();

      goalMsgScale = Math.min(goalMsgScale + 0.12, 1);
      const ease = 1 - Math.pow(1 - goalMsgScale, 3);
      G!.save();
      G!.globalAlpha = Math.min(1, prog * 3) * Math.min(1, goalFlash / 40);
      G!.translate(W / 2, H / 2);
      G!.scale(ease, ease);
      G!.textAlign = "center";
      G!.font = '900 64px "Orbitron"';
      G!.fillStyle = isP ? "#00d4ff" : "#ff2d55";
      G!.shadowColor = isP ? "#00d4ff" : "#ff2d55";
      G!.shadowBlur = 40;
      G!.fillText("GOAL!", 0, -10);
      G!.shadowBlur = 0;
      G!.font = '500 13px "Rajdhani"';
      G!.fillStyle = isP ? "rgba(0,212,255,0.75)" : "rgba(255,45,85,0.75)";
      G!.fillText(isP ? "YOU SCORE" : "CPU SCORES", 0, 22);
      G!.restore();
      goalFlash--;
      if (goalFlash === 100) audio.play("goal");
    }

    function updatePuckScaled(ts: number) {
      if (ts !== 1) {
        puck.vx *= ts;
        puck.vy *= ts;
      }
      updatePuck();
      if (ts !== 1 && state === "play") {
        puck.vx /= ts;
        puck.vy /= ts;
      }
    }

    function drawSpeedUpMsg() {
      if (speedUpTimer <= 0) return;
      if (speedUpTimer === 129) audio.play("speedup");
      const t = speedUpTimer / 130;
      const scale = t > 0.85 ? 0.5 + (1 - (t - 0.85) / 0.15) * 0.5 : 1;
      const alpha = t < 0.2 ? t / 0.2 : 1;
      G!.save();
      G!.globalAlpha = alpha;
      G!.translate(W / 2, H / 2 - 60);
      G!.scale(scale, scale);
      G!.textAlign = "center";
      G!.font = '900 34px "Orbitron"';
      G!.fillStyle = "#000";
      G!.fillText(speedUpMsg, 2, 2);
      const grd2 = G!.createLinearGradient(-100, -30, 100, 10);
      grd2.addColorStop(0, "#ffc940");
      grd2.addColorStop(1, "#ff6820");
      G!.fillStyle = grd2;
      G!.shadowColor = "#ffc940";
      G!.shadowBlur = 24;
      G!.fillText(speedUpMsg, 0, 0);
      G!.restore();
      speedUpTimer--;
    }

    // ── Main Loop ──
    let rafId = 0;
    function loop() {
      tick++;
      G!.clearRect(0, 0, W, H);
      G!.fillStyle = "#04060a";
      G!.fillRect(0, 0, W, H);

      if (sloMo) sloMoAlpha = Math.min(sloMoAlpha + 0.055, 1);
      else sloMoAlpha = Math.max(sloMoAlpha - 0.07, 0);
      if (sloMoIntro > 0) sloMoIntro--;
      if (sloMoLabelTimer > 0) sloMoLabelTimer--;

      const timeScale = sloMo ? 0.55 : 1;

      if (shakeAmt > 0.3) {
        shakeX = (Math.random() - 0.5) * shakeAmt * 2;
        shakeY = (Math.random() - 0.5) * shakeAmt * 2;
        shakeAmt *= 0.72;
      } else {
        shakeX = 0;
        shakeY = 0;
        shakeAmt = 0;
      }

      G!.save();
      G!.translate(shakeX, shakeY);

      drawTable();

      if (state === "play" || state === "goal") {
        updatePlayer(timeScale);
        updateCPU(timeScale);
        updatePuckScaled(timeScale);
        updateParticles();
      }
      updateConfetti();

      drawParticles();
      drawPuck();
      drawMallet(cpu, "#2a0a0a", "#ff2d55");
      drawMallet(player, "#0a1a2a", "#00d4ff");
      drawGoalFlash();
      drawSpeedUpMsg();
      drawConfetti();

      if (sloMoAlpha > 0) {
        const vig = G!.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.75);
        vig.addColorStop(0, "transparent");
        vig.addColorStop(1, `rgba(0,0,0,${0.65 * sloMoAlpha})`);
        G!.fillStyle = vig;
        G!.fillRect(0, 0, W, H);

        const barH = 32 * sloMoAlpha;
        G!.fillStyle = `rgba(0,0,0,${0.88 * sloMoAlpha})`;
        G!.fillRect(0, 0, W, barH);
        G!.fillRect(0, H - barH, W, barH);

        G!.save();
        G!.globalAlpha = 0.15 * sloMoAlpha;
        G!.fillStyle = "#ff0040";
        G!.fillRect(0, 0, 5, H);
        G!.fillRect(W - 5, 0, 5, H);
        G!.fillStyle = "#0080ff";
        G!.fillRect(5, 0, 5, H);
        G!.fillRect(W - 10, 0, 5, H);
        G!.restore();

        if (sloMoLabelTimer > 0) {
          const fadeIn = Math.min(sloMoLabelTimer / 20, 1);
          const fadeOut = sloMoLabelTimer < 30 ? sloMoLabelTimer / 30 : 1;
          const alpha = fadeIn * fadeOut * sloMoAlpha;
          const pulse = 0.88 + Math.sin(tick * 0.12) * 0.12;

          G!.save();
          G!.globalAlpha = alpha * pulse;
          G!.textAlign = "center";
          G!.font = '900 16px "Orbitron"';
          G!.fillStyle = "rgba(0,0,0,0.5)";
          G!.fillText("  GAME POINT   ", W / 2 + 1, barH * 0.72 + 1);
          G!.fillStyle = "#ffc940";
          G!.shadowColor = "#ffc940";
          G!.shadowBlur = 14;
          G!.fillText("  GAME POINT   ", W / 2, barH * 0.72);
          G!.shadowBlur = 0;
          G!.restore();
        }
      }

      G!.restore();
      rafId = requestAnimationFrame(loop);
    }

    if (btnAgainRef.current) btnAgainRef.current.onclick = () => startGame();

    loop();
    startGame();

    return () => {
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("keydown", onKeyDown);
      if (confettiInterval) clearInterval(confettiInterval);
    };
  }, []);

  return (
    <div id="outer">
      <div id="stat-left" className="stat-panel">
        <div className="stat-name" style={{ color: "#00d4ff" }}>
          YOU
        </div>
        <div
          className="stat-score"
          ref={scorePRef}
          style={{ color: "#00d4ff", textShadow: "0 0 20px #00d4ff" }}
        >
          0
        </div>
        <div className="stat-divider" />
        <div className="stat-row">
          <span className="stat-label">STREAK</span>
          <span className="stat-val" ref={pStreakRef}>
            0
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">TOP SPEED</span>
          <span className="stat-val" ref={pSpeedRef}>
            0
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">POWER HITS</span>
          <span className="stat-val" ref={pPowerRef}>
            0
          </span>
        </div>
        <div className="stat-divider" />
        <div className="stat-footer">FIRST TO 7 WINS</div>
      </div>

      <div id="arena">
        <canvas id="c" ref={canvasRef} />
        <div id="mute-btn" ref={muteBtnRef} />
        <div id="ui" />

        <div id="gameover-screen" className="screen" ref={gameoverRef}>
          <div className="go-inner">
            <div className="go-face" ref={goFaceRef}>
              {" "}
            </div>
            <div className="go-who" ref={goWhoRef}>
              YOU WIN
            </div>
            <div className="go-wins" ref={goWinsRef}>
              GAME · SET · MATCH
            </div>
            <div className="go-final" ref={goFinalRef}>
              7 – 3
            </div>
            <button ref={btnAgainRef}>PLAY AGAIN</button>
          </div>
        </div>
      </div>

      <div id="stat-right" className="stat-panel">
        <div className="stat-name" style={{ color: "#ff2d55" }}>
          CPU
        </div>
        <div
          className="stat-score"
          ref={scoreCpuRef}
          style={{ color: "#ff2d55", textShadow: "0 0 20px #ff2d55" }}
        >
          0
        </div>
        <div className="stat-divider" />
        <div className="stat-row">
          <span className="stat-label">STREAK</span>
          <span className="stat-val" ref={cpuStreakRef}>
            0
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">TOP SPEED</span>
          <span className="stat-val" ref={cpuSpeedRef}>
            0
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-label">POWER HITS</span>
          <span className="stat-val" ref={cpuPowerRef}>
            0
          </span>
        </div>
        <div className="stat-divider" />
        <div className="stat-footer">FIRST TO 7 WINS</div>
      </div>
    </div>
  );
}
