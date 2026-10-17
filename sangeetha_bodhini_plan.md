# Carnatic Music Learning Platform: "Sangeetha Bodhini" (Prototype / MVP)

## 1. Project Overview & Objective
Build a modern, interactive, and responsive web application designed for Carnatic music teachers and students. The immediate goal is to serve as an interactive teaching and visualization tool for **Sangeetha Bala Padam — Part 1: Sarali Varisai (14 Exercises)** in **Mayamalavagowla** ragam set to **Adi Talam**.

The app must include:
1. An exhaustive, pedagogical **Carnatic Fundamentals Introduction Page** (12 Swarasthanam / 16 Carnatic names, Adi Talam anatomy with hand-gesture visual indicators, Sthayis/octaves, and Shruti/Tambura setup).
2. An interactive **Practice & Visualization Studio** containing all **14 Sarali Varisai lessons** with note-by-note synchronization, Talam beat tracker (Kriya counter), audio playback via Web Audio API synthesized tones (or Tanpura + Swara samples), and playback across **Three Kaalams (Speeds)**.
3. Clean, modular, production-ready code organized so it runs effortlessly locally (`npm run dev`) and is easily deployable to static hosting (Vercel, Netlify, or Cloudflare Pages) later.

---

## 2. Tech Stack Recommendations
- **Framework:** React with Vite or Next.js (App Router), TypeScript.
- **Styling:** Tailwind CSS (configured with warm traditional Indian aesthetic tones).
- **Icons & Visuals:** Lucide-React + SVG-based custom illustrations/diagrams for hand mudras and Swarasthanam circles.
- **Audio Synthesis:** Web Audio API / Tone.js (synthesizing sine/triangle harmonic waveforms tuned to accurate Carnatic frequencies relative to a selectable base Adhaara Shadjam $S$, e.g., C3 / 130.81 Hz or D3 / 146.83 Hz).
- **Animation/Motion:** Framer Motion for rhythmic note bouncing and beat indicators.

---

## 3. Aesthetic & UI/UX Guidelines
- **Theme:** Warm, authentic, elegant traditional South Indian aesthetic.
  - Primary colors: Temple saffron (`#D97706`), deep maroon/kumkum (`#7F1D1D`), raw silk / ivory parchment (`#FFFDF7` / `#FDFBF7`), subtle gold accents (`#F59E0B`), warm charcoal for high-contrast legible typography (`#1F2937`).
- **Header Banner:**
  - Header with a subtle stylized silhouette/artistic tribute banner honoring the **Sangeetha Trimurti (Thyagaraja, Muthuswami Dikshitar, Syama Sastri)** along with Purandara Dasa (Pithamaha).
  - Clean bilingual labeling where appropriate (Sanskrit/Tamil transliteration in IAST or plain English with Tamil script tooltips/badges).
- **Typography:** Serif headings (e.g., Cormorant Garamond, Cinzel, or Playfair Display) paired with clean sans-serif body text (e.g., Inter, Plus Jakarta Sans) for high readability.

---

## 4. Feature Specifications

### Module A: Carnatic Fundamentals (Intro & Theory Page)
A rich visual and pedagogical guide covering:

1. **The 12 Swarasthanams & 16 Carnatic Swara Names:**
   - Visual interactive wheel or fretboard/keyboard matrix showing:
     - Shadjam ($S$)
     - Suddha Rishabham ($R_1$), Chathusruthi Rishabham ($R_2$), Shatsruthi Rishabham ($R_3$)
     - Sadharana Gandharam ($G_2$), Antara Gandharam ($G_3$), Suddha Gandharam ($G_1$)
     - Suddha Madhyamam ($M_1$), Prathi Madhyamam ($M_2$)
     - Panchamam ($P$)
     - Suddha Dhaivatham ($D_1$), Chathusruthi Dhaivatham ($D_2$), Shatsruthi Dhaivatham ($D_3$)
     - Kaisiki Nishadham ($N_2$), Kakali Nishadham ($N_3$), Suddha Nishadham ($N_1$)
   - Clearly highlight the 7 notes of **Mayamalavagowla** ($S, R_1, G_3, M_1, P, D_1, N_3, \dot{S}$) as the foundational ragam chosen by Sri Purandara Dasa.
   - Interactive "Play Swara" button for each note so students can hear pitch intervals.

2. **Adi Talam Anatomy & Hand Gestures (Kriyas):**
   - Detailed visual breakdown of **Chatusra Jathi Triputa Talam** (8 Aksharas = 1 Laghu of 4 + 2 Dhrithams of 2 each: `1 + 3 + 2 + 2 = 8`):
     - Beat 1: **Thattu** (Downward stroke / Clap)
     - Beat 2: **Kanishta** (Little finger tap)
     - Beat 3: **Anamika** (Ring finger tap)
     - Beat 4: **Madhyama** (Middle finger tap)
     - Beat 5: **Thattu** (Downward stroke / Clap)
     - Beat 6: **Veechu** (Wave of the hand / turning palm upward)
     - Beat 7: **Thattu** (Downward stroke / Clap)
     - Beat 8: **Veechu** (Wave of the hand / turning palm upward)
   - Visual card or SVG illustration for each gesture with both Tamil/Sanskrit terms and English explanations.

3. **Sthayi (Octave System):**
   - Visual explanation of pitch registers:
     - Anumandra Sthayi, Mandra Sthayi (dot below: $\d{S}$), Madhya Sthayi ($S$), Tara Sthayi (dot above: $\dot{S}$), Ati-Tara Sthayi.

4. **Shruti Box / Tanpura Drone:**
   - Persistent or toggleable drone generator (Panchama Shruti: $P - S' - S - S_{base}$) with key selection (e.g., C, C#, D, D#) to provide an authentic learning environment.

---

### Module B: Sarali Varisai Studio (14 Lessons)
1. **Curriculum Data Structure:**
   - Store all 14 standard Sarali Varisai exercises in a typed JSON/TypeScript dataset.
   - Each lesson must have:
     - Lesson Number, Title, and Description/Pedagogical Objective (e.g., straight scale, jumping notes, zigzag patterns, vakra sancharas).
     - Full Arohanam (Ascent) and Avarohanam (Descent) notations.
     - Beat mapping: Partitioned strictly into 8 Aksharas of Adi Talam (e.g., 2 Avartanams per cycle).
   - Use standard diacritical formatting for high octave notes ($\dot{S}, \dot{R}, \dot{G}$) and low octave notes ($\d{D}, \d{N}$).

2. **Three Kaalams (Tempo / Speed Engine):**
   - Base tempo (Default: ~60 BPM, configurable via slider 45–90 BPM).
   - **Prathama Kaalam (1st Speed):** 1 swara per akshara (beat).
   - **Dwithiya Kaalam (2nd Speed):** 2 swaras per akshara (double speed).
   - **Thrithiya Kaalam (3rd Speed):** 4 swaras per akshara (quadruple speed).
   - Smooth transition buttons: `1st Speed (1x)`, `2nd Speed (2x)`, `3rd Speed (4x)`.

3. **Synchronized Visualizer:**
   - **The Notation Grid:** A large, high-visibility score view where each Akshara is grouped under its respective Talam part (`Laghu: [1, 2, 3, 4] | Dhritham 1: [5, 6] | Dhritham 2: [7, 8]`).
   - **Active Swara Highlighter:** Highlights the active note in real-time with an amber/gold glow and bounce animation.
   - **Talam Kriya Metronome:** A dedicated visual widget at the top showing the current Akshara (1 to 8) and an animated indicator displaying the corresponding hand gesture (e.g., "Thattu", "Kanishta", etc.) in sync with the beat.
   - Controls: `Play`, `Pause`, `Reset`, `Loop Avartanam / Lesson`, `Speed Select`, `Shruti Pitch Selector`.

4. **Audio Engine (Web Audio API):**
   - Pure Web Audio synthesis with subtle warm harmonics (avoid harsh beep sounds; blend 70% sine wave + 25% triangle wave + soft attack/decay envelope) tuned to Mayamalavagowla ratios:
     - $S$ (1.0), $R_1$ (16/15), $G_3$ (5/4), $M_1$ (4/3), $P$ (3/2), $D_1$ (8/5), $N_3$ (15/8), $\dot{S}$ (2.0).

---

## 5. Architectural & Code Quality Instructions
- **Project Structure:**
  ```text
  src/
  ├── assets/ (SVGs, Trimurti banners, gesture icons)
  ├── components/
  │   ├── common/ (Navbar, Header, Footer, ShrutiDrone)
  │   ├── theory/ (SwarasthanaWheel, TalaExplainer, SthayiChart)
  │   └── studio/ (LessonSelector, NotationGrid, TalamTracker, AudioControls)
  ├── data/
  │   ├── swaras.ts (12 positions, 16 names, frequencies)
  │   ├── talas.ts (Adi talam kriyas and definitions)
  │   └── saraliVarisai.ts (Strict array of all 14 lessons with 1st/2nd/3rd kaalam mappings)
  ├── hooks/ (useCarnaticAudio.ts, useTalamTimer.ts)
  └── types/ (carnatic.d.ts)

- Make the code completely modular and typed with TypeScript.
- Provide step-by-step instructions for running the project locally.
- Keep state management clean and lag-free, ensuring the Web Audio scheduler schedules notes ahead of time using AudioContext.currentTime to avoid any timing drift during speed changes.

## 6. Execution Plan
- Set up project files, Tailwind styling, and navigation (Theory Intro vs. Lesson Studio).
- Implement Carnatic theory data and the Intro page with interactive swara playback and Talam gesture breakdowns.
- Build the 14-lesson dataset in saraliVarisai.ts.
- Implement precision Web Audio synthesis engine and Talam timing clock.
- Build the visual notation player with 3-Kaalam toggle and dynamic synchronized highlighting.