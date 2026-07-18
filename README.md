<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00D4FF,25:2196F3,50:0D47A1,75:FF2D55,100:D4AF37&height=260&section=header&text=AIR%20HOCKEY&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Neon%20Arcade%20Air%20Hockey%20%E2%80%94%20Next.js%20%2B%20TypeScript%20Edition&descAlignY=58&descSize=16"/>

<img src="https://readme-typing-svg.demolab.com?font=Orbitron&weight=700&size=22&duration=3000&pause=1000&color=00D4FF&center=true&vCenter=true&width=750&lines=Fast-Paced+Neon+Air+Hockey;Rebuilt+with+Next.js+14+%2B+TypeScript;Canvas+2D+Rendering+Engine;Dynamic+Physics+%2B+Smart+CPU+AI;Slow-Motion+Game+Point+Moments" />

<br/>

[![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![React](https://img.shields.io/badge/React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=black)](#)
[![Canvas API](https://img.shields.io/badge/Canvas%202D-FF6B00?style=for-the-badge&logo=html5&logoColor=white)](#)
[![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-4CAF50?style=for-the-badge&logo=soundcharts&logoColor=white)](#)

[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge)](#contributing)
[![Maintained](https://img.shields.io/badge/Maintained-Yes-success?style=for-the-badge)](#)
![Repo Size](https://img.shields.io/github/repo-size/YasirAwan4831/air-hockey-next?style=for-the-badge&color=00d4ff)
![Last Commit](https://img.shields.io/github/last-commit/YasirAwan4831/air-hockey-next?style=for-the-badge&color=ff2d55)

<br/>

### 🕹️ [ Live Demo](https://yasir-air-hockey.vercel.app/) &nbsp;·&nbsp; 🐛 [Report Bug](https://github.com/YasirAwan4831/Air-Hockey-Arcade-Game) &nbsp;·&nbsp; 💡 [Request Feature](https://github.com/YasirAwan4831)

</div>

---

## 📖 Table of Contents

- [About The Project](#-about-the-project)
- [Why Next.js + TypeScript](#-why-nextjs--typescript)
- [Preview](#-preview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Available Scripts](#-available-scripts)
- [How To Play](#-how-to-play)
- [Game Mechanics](#-game-mechanics)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [About the Author](#-about-the-author)

---

## 🎯 About The Project

<img align="right" src="https://capsule-render.vercel.app/api?type=cylinder&color=00D4FF&height=110&section=header&width=280&animation=twinkling"/>

**Air Hockey** is a fast-paced, neon-themed arcade game rendered entirely on **HTML5 Canvas**, now rebuilt on a modern **Next.js 14 (App Router) + TypeScript** foundation. What began as a single self-contained HTML prototype has been restructured into a fully typed, component-driven, production-ready project.

Every visual effect, sound, particle, and physics interaction is still hand-coded — no game engine, no game asset libraries — but the codebase is now organized into typed modules: a reusable audio engine, shared math/color utilities, centralized game constants, and a single strongly-typed React client component driving the Canvas render loop.

> A showcase of custom **2D physics**, **procedural audio synthesis**, **particle systems**, and **cinematic UI effects** — engineered with **type-safe, component-based architecture**.

<br clear="right"/>

---

## ⚡ Why Next.js + TypeScript

| Before (v1) | Now (v2) |
|---|---|
| Single monolithic `index.html` | Modular Next.js App Router project |
| Plain JavaScript, no type safety | Fully typed with TypeScript interfaces |
| Inline `<script>` / `<style>` | Separated components, lib modules & global CSS |
| Manual DOM queries (`getElementById`) | React refs + a single client component |
| No build tooling | Next.js dev server, production build & optimized output |

The core game logic (physics, CPU AI, rendering, audio) is unchanged in behavior — only the architecture has evolved to be type-safe, maintainable, and ready for further framework-driven features (routing, difficulty settings pages, leaderboards, etc.).

---

## 🖼️ Preview

<div align="center">

<img src="https://img.shields.io/badge/STATUS-PLAYABLE-00d4ff?style=for-the-badge&labelColor=04060a"/>
<img src="https://img.shields.io/badge/PLATFORM-DESKTOP%20%26%20MOBILE-ff2d55?style=for-the-badge&labelColor=04060a"/>
<img src="https://img.shields.io/badge/MODE-SINGLE%20PLAYER%20VS%20CPU-ffc940?style=for-the-badge&labelColor=04060a"/>

<br/><br/>

| 🔵 Player Panel | 🏒 Neon Arena | 🔴 CPU Panel |
|:---:|:---:|:---:|
| Score · Streak · Top Speed · Power Hits | Glowing table, puck trail, particle bursts | Score · Streak · Top Speed · Power Hits |

*(![alt text](image.png))*

</div>

---

## ✨ Key Features

<table>
<tr>
<td width="50%" valign="top">

### 🎮 Gameplay
- 🖱️ Smooth **mouse & touch** mallet control
- 🤖 Adaptive **CPU AI** with realistic reaction time
- 🎯 Human-like AI mistakes for fair matches
- 🏆 First to **7 goals** wins the match
- 📈 Progressive **puck speed escalation**
- 🐢 Cinematic **slow-motion** on game point

</td>
<td width="50%" valign="top">

### 🎨 Visual & Audio
- 💥 Real-time **particle burst** effects
- ✨ Glowing **neon puck & mallet** rendering
- 🎊 **Confetti celebration** on victory
- 🔊 Procedurally generated **Web Audio** SFX
- 📱 Fully **responsive** scaling engine
- 🌈 Dynamic **screen shake** on power hits

</td>
</tr>
</table>

### 📊 Live Match Statistics
| Stat | Description |
|---|---|
| **Score** | Live goal tally for both sides |
| **Streak** | Best consecutive scoring streak |
| **Top Speed** | Fastest recorded puck hit |
| **Power Hits** | Number of high-velocity strikes |

### 🎬 Cinematic Moments
- **Game Point Slow-Motion** — vignette, letterbox bars & chromatic aberration
- **Goal Flash** — full-screen color flash with animated "GOAL!" text
- **Speed-Up Banner** — dramatic on-screen callouts as intensity rises
- **Victory Sequence** — confetti storm + triumphant fanfare

---

## 🛠️ Tech Stack

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Canvas API](https://img.shields.io/badge/Canvas%202D%20API-FF6B00?style=flat-square&logo=html5&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web%20Audio%20API-4CAF50?style=flat-square&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)

</div>

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Routing, build tooling, dev server |
| **Language** | TypeScript | Type-safe game state, entities & engine |
| **UI Layer** | React 18 (Client Component) | Canvas mount point, refs, DOM stat panels |
| **Rendering** | Canvas 2D API | Puck, mallets, table, particles, effects |
| **Physics & AI** | Custom TypeScript engine | Collision, momentum, CPU behavior |
| **Audio** | Web Audio API (`AudioEngine` class) | Procedural sound synthesis (no audio files) |
| **Styling** | Global CSS (Flexbox, Keyframes, clip-path) | Neon UI, responsive scaling, animations |
| **Fonts** | Google Fonts (Orbitron, Rajdhani) | Arcade-style typography |
| **Linting** | ESLint (`eslint-config-next`) | Code quality & consistency |

---

## 📁 Project Structure

```
air-hockey-next/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout, metadata & fonts
│   │   ├── page.tsx          # Home page — mounts the game
│   │   └── globals.css       # Global styles (neon theme, layout, animations)
│   ├── components/
│   │   └── AirHockeyGame.tsx # Client component — canvas mount + full game engine
│   ├── lib/
│   │   ├── audioEngine.ts    # Procedural Web Audio sound engine (typed class)
│   │   ├── constants.ts      # Table, puck, mallet & CPU tuning constants
│   │   └── utils.ts          # clamp / lighten / darken color helpers
│   └── types/
│       └── game.ts           # Shared TypeScript interfaces & types
├── public/                    # Static assets (add preview.gif, favicon, etc.)
├── next.config.mjs
├── tsconfig.json
├── package.json
├── .eslintrc.json
├── .gitignore
├── LICENSE
└── README.md
```

> Physics, CPU AI, rendering and audio are typed and modularized under `src/lib` and `src/types`, while `AirHockeyGame.tsx` wires everything together inside a single `useEffect`-driven render loop for maximum Canvas performance.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **npm**, **yarn**, or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/YasirAwan4831/air-hockey-next.git

# Move into the project directory
cd air-hockey-next

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to play.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Builds the app for production |
| `npm run start` | Runs the production build |
| `npm run lint` | Lints the codebase with ESLint |

---

## 🎮 How To Play

| Control | Action |
|---|---|
| 🖱️ **Mouse Move** | Move your mallet |
| 📱 **Touch & Drag** | Move your mallet (mobile) |
| ⌨️ **S** | Toggle sound on/off |
| ⌨️ **Space** | Restart after match ends |
| 🖱️ **Play Again Button** | Start a new match |

**Objective:** Strike the puck past the CPU's goal while defending your own. First side to reach **7 goals** wins the match.

---

## ⚙️ Game Mechanics

<details>
<summary><strong>🧲 Physics Engine</strong></summary>
<br/>

- Custom circle-vs-circle collision detection between puck and mallets
- Velocity-based impulse response with configurable restitution
- Friction-based deceleration for realistic puck glide
- Wall bounce dampening for authentic rail rebounds

</details>

<details>
<summary><strong>🤖 CPU AI Behavior</strong></summary>
<br/>

- Predictive tracking based on puck trajectory and velocity
- Configurable reaction delay to simulate human-like response
- Deliberate random "mistakes" to keep matches competitive
- Corner-escape logic to avoid the CPU getting stuck
- Home-position recovery when the puck is on the player's side

</details>

<details>
<summary><strong>🔊 Procedural Audio (typed <code>AudioEngine</code> class)</strong></summary>
<br/>

- All sound effects generated live via Web Audio oscillators & noise buffers
- Distinct SFX for hits, wall bounces, goals, speed-ups, and victory
- Zero external audio files — everything is synthesized in real time
- Encapsulated in `src/lib/audioEngine.ts` as a reusable, typed class

</details>

<details>
<summary><strong>🎥 Dynamic Difficulty & Cinematics</strong></summary>
<br/>

- Puck speed escalates progressively every 2 goals scored
- Automatic slow-motion sequence triggers at game point
- Screen shake intensity scales with impact velocity
- Full victory sequence with layered confetti bursts

</details>

---

## 🗺️ Roadmap

- [x] Core single-file playable prototype
- [x] Procedural audio system
- [x] CPU AI with adjustable difficulty
- [x] Slow-motion & cinematic game-point effects
- [x] Convert to **Next.js 14 + TypeScript** architecture
- [ ] Add difficulty selection (Easy / Normal / Hard)
- [ ] Add 2-player local multiplayer mode
- [ ] Add persistent leaderboard / match history (API routes)
- [ ] Add unit tests for physics & collision logic
- [ ] Deploy live demo on Vercel

See [open issues](#) for a full list of proposed features and known issues.

---

## 🤝 Contributing

Contributions make the open-source community amazing. Any contributions are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<br/>

## 👨‍💻 About the Author
<br/>
<img src="https://readme-typing-svg.demolab.com?font=Playfair+Display&weight=700&size=20&duration=3000&pause=1000&color=D4AF37&center=true&vCenter=true&width=700&lines=Muhammad+Yasir;Full+Stack+Web+Developer;Data+Analyst;AI+%26+Automation+Enthusiast;React+%7C+Node.js+%7C+MongoDB" />
<br/>

**Muhammad Yasir** is a **Full Stack Web Developer, Data Analyst and AI Automation Enthusiast** passionate about building scalable web applications, data-driven solutions, automation systems and modern software products with clean architecture and outstanding user experience.
<br/>

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/YasirAwan4831)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/yasirawan4831)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=vercel&logoColor=white)](https://yasirawaninfo.vercel.app)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:my3154831409@gmail.com)
<br/>

![Profile Views](https://komarev.com/ghpvc/?username=YasirAwan4831&style=for-the-badge&color=d4af37&label=PROFILE+VIEWS)
<br/>

---

### ⭐ Support This Project

Please consider giving this repository a **Star** if you found it helpful.
<br/>

[![⭐ Star This Repository](https://img.shields.io/badge/⭐%20Star%20This%20Repository-FFD700?style=for-the-badge&logo=starship&logoColor=black)](https://github.com/YasirAwan4831)
<br/>

---

<p align="center">
Crafted with precision and passion by <strong><a href="https://yasirawaninfo.vercel.app/" target="_blank">Muhammad Yasir</a></strong><br/>
Full Stack Web Developer • Data Analyst • AI & Automation Enthusiast • Open Source Contributor
</p>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:BBDEFB,25:64B5F6,50:2196F3,75:1976D2,100:0D47A1&height=180&section=footer&text=Thank%20You%20for%20Visiting&fontSize=35&fontColor=ffffff&animation=fadeIn"/>
