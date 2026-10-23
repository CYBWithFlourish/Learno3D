# Learno3D (Gemma Spatial XR) — 3D Simulation & VR Learning Studio

> **Virtual Reality (VR) and 3D Simulation Studio for Immersive Learning powered by Gemma as the Spatial Intelligence Engine.**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0.2-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-0.186.x-black.svg?logo=three.js&logoColor=white)](https://threejs.org/)
[![WebXR](https://img.shields.io/badge/WebXR-Enabled-orange.svg)](https://immersiveweb.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

---

## 🌟 Executive Overview

**Learno3D (Gemma Spatial XR)** combines open-source 3D WebXR frameworks with open-weights foundation models like **Gemma** to enable real-time, interactive, and intelligent 3D learning worlds without relying on proprietary cloud APIs, vendor lock-in, or heavy video-streaming fees.

Students and educators can explore procedural physics, cardiac biomechanics, electrical engineering, and aerospace propulsion directly in their web browsers or in immersive VR headsets (Meta Quest 2/3/Pro, Apple Vision Pro, SteamVR). When curious about any dynamic scenario, they can speak or type to synthesize custom 3D simulations on the fly.

---

## 🏛️ Open-Source System Architecture

```text
 +-------------------------------------------------------------------------+
 |                              FRONTEND LAYER                             |
 |    WebXR / Three.js / Canvas Browser App (VR Headsets, Laptops, Mobile) |
 +-------------------------------------------------------------------------+
                                     │
                 User Speech / 3D Scene Interactions / Raycasts
                                     │
                                     ▼
 +-------------------------------------------------------------------------+
 |                           ORCHESTRATION LAYER                           |
 |         Node.js / Express Server + Vite Middleware Pipeline             |
 +-------------------------------------------------------------------------+
            │                                           │
            ▼                                           ▼
 +----------------------+                    +----------------------+
 |      AI ENGINE       |                    |    3D SCENE STATE    |
 |  Gemma (Spatial      |                    | Three.js Kinematics /|
 |  Intelligence & TTS) |                    | WebXR State Manager  |
 +----------------------+                    +----------------------+
```

---

## 🚀 Key Product Pillars

### 1. "Text-to-3D Lab" Dynamic Simulation Builder
* **Natural Language to 3D**: Enter prompts such as *"Create a physics lab simulation showing gravity on Mars vs. Earth with two bounceable spheres"* or *"Build an electrical circuit with a 12V battery and glowing bulb"*.
* **Dual Gemma Engine Router**: Toggle between **Google AI Studio Free Tier** (zero setup) and **Local Open-Weights Gemma 2 (9B / 2B via Ollama)** for 100% offline, privacy-preserving execution with zero API fees.
* **Spatial Code Generation**: Gemma acts as a code generator and spatial orchestrator, outputting structured 3D component graphs, PBR materials, rigid-body masses, initial velocities, restitution coefficients, and Socratic learning prompts.
* **Instant Calibration**: New simulations mount seamlessly in the running WebGL/WebXR session with zero page reloads.

### 2. Spatial AI Avatar Mentor ("Dr. Nova")
* **In-World 3D NPC**: Positioned at the edge of the experiment table with a polished white ceramic and chrome physical chassis, articulated floating spherical head, rotating gyroscopic rings, and a speech-reactive illuminated visor.
* **Socratic Guidance**: Rather than feeding direct answers, Dr. Nova analyzes live simulation telemetry (velocities, kinetic/potential energy ratios, circuit continuity, valve pressures) and poses probing questions.
* **Multimodal Voice Interaction**:
  - **Speech-to-Text (STT)**: Hands-free voice inquiry using the Web Speech API.
  - **Text-to-Speech (TTS)**: Unary audio synthesis with `gemini-3.8-flash-lite-tts` returning high-fidelity WAV speech with automatic browser speech synthesis fallback.

### 3. Photorealistic Physical Rendering Pipeline (`MeshPhysicalMaterial`)
* **Domain-Specialized PBR Shaders**:
  - **Aviation Titanium & Superalloys**: `metalness: 0.96`, `roughness: 0.14`, clearcoat finish, and procedural brushed lathe normal map generating authentic radial specular reflections.
  - **Living Myocardial Tissue**: Biological moist clearcoat (`0.75`), organic muscle striation normal maps, and simulated subsurface depth.
  - **Optical Glass Envelope & Hot Tungsten Filament**: Refractive glass envelope (`transmission: 0.94`, `ior: 1.52`) housing a procedural double-helix tungsten coil emitting realistic dynamic point light.
  - **Dark Granite Optical Calibration Bench**: High-anisotropy granite grain with laser-etched metric coordinate grids that remain razor-sharp at shallow grazing angles.
* **3-Point Studio Lighting Rig**: Warm key light with PCF soft shadows, cool sky/ground hemisphere ambient fill, and a cyan silhouette rim light ensuring realistic depth separation.

### 4. Procedural Multi-Domain Simulation Laboratories
Every laboratory subject is procedurally constructed as a composite **3–12 part hierarchy** (`THREE.Group`) across primary silhouette, secondary read, and accent trim:

* **🪐 Planetary Gravity & Elastic Ballistics**:
  - Dual vertical telemetry gantry towers with piezoelectric impact sensor plates.
  - Live gravity preset toggles: **Earth** ($9.81\text{ m/s}^2$), **Mars** ($3.72\text{ m/s}^2$), **Moon** ($1.62\text{ m/s}^2$), **Jupiter** ($24.79\text{ m/s}^2$), and **Zero-G**.
  - Real-time kinematic energy tracking ($PE = mgh$, $KE = \frac{1}{2}mv^2$) and impact velocity calculation ($v = \sqrt{2gh}$).
* **❤️ Cardiac Biomechanics & Anatomical Dissection**:
  - 8-part procedural Human Heart: Right/Left Ventricles, Right/Left Atria, Aortic Arch, Superior Vena Cava, and Pulmonary Artery.
  - Active myocardial contraction cycle ($72\text{ BPM}$) with Systole/Diastole volume deformation.
  - Dual-color blood cell particle flow (oxygenated arterial red vs deoxygenated venous blue).
  - **Exploded View Slider**: Smoothly separates heart chambers to reveal internal atrioventricular valve boundaries.
* **⚡ Vocational Electronics & DC Breadboard**:
  - 9V DC chemical cell, copper knife switch, 100Ω precision resistor, and tungsten vacuum filament lamp.
  - Live Ohm’s Law calculation ($V = I \times R$, $P = I^2 R$).
  - Toggleable switch with real-time electron drift particle animation along copper traces.
* **✈️ High-Bypass Turbofan Jet Engine**:
  - 10-part aerospace assembly: Titanium fan blades, Low-Pressure Compressor (LPC), High-Pressure Compressor (HPC), Annular Combustion Core, Multi-Stage Turbines, and Convergent-Divergent Exhaust Nozzle.
  - Throttle RPM control (1,200 to 3,400 RPM) with continuous rotor rotation and procedural combustion flame particles.
  - Exploded axial separation slider for component inspection.

---

## 🥽 Dual-Mode WebXR & Desktop Controls

| Control Action | VR Headset (WebXR) | Desktop / Laptop 6DOF |
| :--- | :--- | :--- |
| **Inspect / Select 3D Part** | Point controller laser + pull **Trigger** | **Left Click** on mesh |
| **Orbit Camera** | Look around physically / Right Thumbstick | **Left Click + Drag** background |
| **Pan Camera** | Move physically in room-scale boundary | **Right Click + Drag** |
| **Zoom In / Out** | Step closer to experiment bench | **Mouse Scroll Wheel** |
| **Socratic Speech Input** | Tap Mic icon in floating HUD | Click Mic button or type prompt |
| **Toggle Controls Dock** | Click **Hide/Show** tab or press `H` | Click **Hide/Show** tab or press `H` |

---

## 🎧 3D Spatial Audio & Procedural Sound Engine (HRTF Binaural Audio)

In compliance with strict zero-404 asset engineering directives, **all audio is synthesized procedurally in real-time** via the Web Audio API with full **3D Spatial Positional Audio** using the Head-Related Transfer Function (`HRTF`) panning model:

* **Real-Time 3D Listener Tracking**: The Web Audio `AudioListener` position and orientation vectors are continuously synchronized with the active Three.js camera or WebXR VR headset pose (`positionX/Y/Z`, `forwardX/Y/Z`, `upX/Y/Z`).
* **Physics Impact Localization**: Spheres colliding with the pedestal emit 3D spatial impacts (`playSpatialBounce`) at their exact $(x, y, z)$ point of contact, with volume and pitch modulated by impact velocity ($v = \sqrt{2gh}$) and mass.
* **Cardiac Pulse Stethoscope Effect**: The heart's systolic and diastolic lub-dub ($55\text{ Hz}$ / $75\text{ Hz}$) originates positionally from the anatomical chest cavity (`{ x: 0, y: 1.4, z: 0 }`), growing louder as students lean in.
* **Knife Switch & Spark Transients**: Electrical contact snap transients emanate positionally from the circuit switch terminal (`{ x: -0.2, y: 0.4, z: -0.6 }`).
* **Continuous Turbofan Spatial Humming**: The jet engine spool loop is bound to the engine's 3D coordinates (`{ x: 0, y: 1.2, z: 0 }`), exhibiting smooth inverse distance rolloff and binaural stereo separation as the user orbits or pans.
* **Avatar Mentor Positional Voice**: Dr. Nova's speech audio is routed directly through a dedicated spatial panner node at the avatar's pedestal (`{ x: -2.8, y: 1.4, z: 0.2 }`), giving users an authentic sense of an in-room mentor speaking from their left.

---

## 📂 Project Directory Structure

```text
├── server.ts                    # Express server with Vite middleware & Gemini API routes
├── index.html                   # HTML entry point with sync'd meta & typography
├── package.json                 # Project dependencies & build scripts
├── metadata.json                # AI Studio capability metadata & permissions
├── tsconfig.json                # TypeScript strict configuration
├── vite.config.ts               # Vite bundler with Tailwind CSS plugin
├── LICENSE                      # GNU General Public License v3.0
├── README.md                    # Project documentation
└── src/
    ├── main.tsx                 # React DOM bootstrap
    ├── App.tsx                  # Root application orchestrator
    ├── index.css                # Global Tailwind CSS imports & theme styling
    ├── audio/
    │   └── soundEngine.ts       # Procedural Web Audio API synthesizer
    ├── components/
    │   ├── HeaderBar.tsx        # Minimal non-intrusive top navigation & lab switcher
    │   ├── BottomDock.tsx       # Collapsible glassmorphic bottom dock (Zero Viewport Occlusion)
    │   └── VRModal.tsx          # WebXR headset guide & session launch modal
    ├── data/
    │   └── defaultLabs.ts       # Rich procedural labs (Physics, Anatomy, Circuits, Aero)
    ├── services/
    │   └── api.ts               # Server API proxy & fallback speech synthesizer
    ├── three/
    │   └── SimulationScene.ts   # Three.js WebGL & WebXR engine (PBR, avatars, particles)
    └── types/
        └── simulation.ts        # TypeScript interfaces for labs, physics, and telemetry
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.x or higher (or **Bun** v1.0+)
- **Package Manager**: npm v9.x or higher, pnpm, or **Bun**
- **Gemini API Key**: Set in your environment via `GEMINI_API_KEY` (configured automatically in Google AI Studio)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/cybwithflourish/Learno3D.git
   cd Learno3D
   ```

2. **Install dependencies (Resolution & Peer-Dependency Handling):**
   This project uses cutting-edge packages (**TypeScript 7.0.2**, **React 19**, and **Three.js 0.186.x**). To ensure smooth package resolution across package managers:

   ```bash
   # Using npm (recommended with legacy peer deps for React 19 / TS 7):
   npm install --legacy-peer-deps

   # Or using Bun:
   bun install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY="YOUR_API_KEY_HERE"
   PORT=3000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in any modern browser (or inside the Meta Quest Browser).

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 📡 Server API Reference

All Gemini model invocations execute securely on the server through `@google/genai`:

| Endpoint | Method | Purpose | Model Used |
| :--- | :--- | :--- | :--- |
| `/api/gemini/generate-lab` | `POST` | Translates natural language prompts into complete 3D simulation scene graphs | `gemini-3.8-flash` |
| `/api/gemini/tutor-dialogue`| `POST` | Socratic conversational feedback based on live 3D scene telemetry | `gemini-3.8-flash` |
| `/api/gemini/tts` | `POST` | Synthesizes natural speech audio (WAV) for Dr. Nova | `gemini-3.8-flash-lite-tts` |
| `/api/gemini/inspect-component` | `POST` | Returns deep educational breakdowns and interactive quiz questions | `gemini-3.8-flash` |

---

## 📜 License & Governance

This project is licensed under the **GNU General Public License v3.0 (GPLv3)**.

### Why GPLv3 Was Chosen for Learno3D

Learno3D was designed from the ground up to demonstrate that next-generation spatial computing and interactive VR classrooms do not need to rely on proprietary closed-source engines, vendor lock-in, or expensive streaming gatekeepers. We selected the **GNU General Public License v3.0 (GPLv3)** for four core reasons:

1. **Guaranteed Perpetual Open-Source Commons (Strong Copyleft)**:
   - Education is a universal public good. Under GPLv3, any developer, university, or EdTech organization that forks, improves, or integrates Learno3D into larger platforms is legally obligated to release their source code and enhancements under the exact same open-source terms.
   - This prevents proprietary software vendors from privatizing community-created 3D curriculum models, simulation engines, or Socratic avatar code.

2. **Alignment with the Open-Weights & Open-Web Philosophy**:
   - Just as open-weights models like **Gemma** empower developers to run spatial intelligence locally and openly, GPLv3 ensures the surrounding 3D orchestration software, physics bridges, and WebXR components remain freely inspectable, modifiable, and verifiable by the academic community.

3. **Protection for Hardware & VR Device Users (Anti-Tivoization)**:
   - GPLv3 includes specific protections preventing hardware manufacturers (such as VR headset vendors) from restricting users from installing modified versions of open-source software on their own physical devices. This ensures students and researchers have complete freedom to run Learno3D on Meta Quest, Apple Vision Pro, SteamVR, or custom WebXR hardware.

4. **Express Patent Peace & Protection**:
   - GPLv3 grants an explicit, royalty-free patent license from all contributors to all users, shielding open-source contributors and schools from predatory software patent litigation.

---

### Summary of Rights & Obligations

- **You Are Free To**: Run the software commercially or non-commercially, study the source code, modify all simulation models, and distribute copies.
- **Under the Condition That**: If you distribute modified versions or derivative works of Learno3D, you must provide full corresponding source code under the same GPLv3 license and clearly state your modifications.

See the full [LICENSE](LICENSE) file for complete legal terms.
