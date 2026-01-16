# MLStudio Pro

> An interactive AI & Data Science learning platform that combines theory, visualization, and live experimentation.

## 🎯 Project Vision

MLStudio Pro helps users understand how AI systems behave **visually**, so they can build with **intuition** — not just memorization.

**Philosophy**: Theory → Visual Intuition → Code → Experimentation

---

## 📂 Project Structure

```
mlstudio-pro/
├── app-src/                    # Next.js 14 application
│   ├── src/
│   │   ├── app/               # App router pages
│   │   │   ├── page.tsx       # Landing page (/)
│   │   │   ├── explore/       # Scrollytelling experience
│   │   │   └── learn/         # Interactive learning system
│   │   ├── components/        # React components
│   │   └── types/             # TypeScript definitions
│   └── public/                # Static assets
├── docs/                      # Documentation
└── explorepage/               # Frame sequences for /explore
```

---

## ✅ Implemented Features

### 1. Landing Page (`/`)
- **Scroll-driven experience** with Framer Motion
- **System visualization** using HTML5 Canvas
- **Minimal design** with dark theme
- **CTA**: "Start Exploring" → `/explore`

**Tech Stack**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion

---

### 2. Explore Page (`/explore`)

#### Scrollytelling Experience (600vh)
- **192-frame image sequence** rendered on Canvas
- **6 narrative scenes**:
  1. **Emergence** - "Learning begins with orientation"
  2. **Core Formation** - "DATA SCIENCE" anchor
  3. **Primary Structure** - Domain labels (Programming, Math, ML)
  4. **Internal Structure** - Sub-branches (Regression, Classification, etc.)
  5. **Meaning & Intuition** - Philosophical statements
  6. **Transition** - CTA to `/learn`

#### Quality Optimizations
- **High-DPI rendering**: 2x minimum pixel ratio for retina displays
- **Frame blending**: Continuous cross-fade between frames (no threshold)
- **Strategic zoom**: 1.15x to crop watermarks
- **GPU acceleration**: CSS transforms and will-change hints
- **Smooth scrolling**: Momentum scrolling with optimized easing

**Components**:
- `ExploreCanvas.tsx` - Canvas renderer with frame interpolation
- `ExploreOverlay.tsx` - Text overlays with Framer Motion
- `ExploreNavbar.tsx` - Minimal navigation with scroll blur
- `LearningRoadmap.tsx` - 5-phase learning path overview

---

### 3. Learning Roadmap Section

Post-visualization content on `/explore` page:

**5 Learning Phases**:
1. **Foundations** - Data, uncertainty, and behavior
2. **Core Machine Learning** - Regression, classification, clustering
3. **Data Science in Practice** - Real-world workflows
4. **Deep Learning Systems** - Neural networks and transformers
5. **Applied Domains** - Computer Vision, NLP (locked)

**Design**: Minimal card-based layout with hover effects, inline action links, and final CTA.

---

## 🚀 Current Status

### ✅ Completed
- [x] Landing page with scroll-driven visuals
- [x] Explore page with 192-frame scrollytelling
- [x] 6-scene narrative overlay system
- [x] Learning roadmap section
- [x] Smoothness optimizations (frame blending, GPU acceleration)
- [x] Navigation flow: `/` → `/explore` → `/learn`
- [x] `/learn` system data models (Subject, Module, Topic)
- [x] API routes (`/api/subjects`, `/api/modules`, `/api/topics`)
- [x] Dynamic routing structure (subjects, modules, topics pages)

### 🚧 In Progress
- [/] `/learn` system implementation (Phase 1: Learning Backbone)
  - [x] Data models (Subject → Module → Topic)
  - [x] API routes
  - [x] Dynamic routing (3 levels complete)
  - [ ] Topic page with three-panel layout
  - [ ] First topic: Linear Regression

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Canvas**: HTML5 Canvas API
- **Fonts**: Inter (Google Fonts)

---

## 📊 Content Structure

### Subjects (7 total)
1. Foundations
2. Programming for Data Science
3. Data Handling
4. Machine Learning
5. Model Evaluation
6. Deep Learning
7. Applied Domains

### Total Topics: 379
See `docs/subjects.txt` for complete hierarchy.

---

## 🎨 Design Principles

- **Minimal & Calm**: No bright colors, no gamification
- **Dark UI**: Soft whites, muted cyans, neutral grays
- **Editorial Typography**: Clean sans-serif with strong hierarchy
- **Performance-first**: GPU acceleration, optimized rendering
- **Responsive**: Works across all screen sizes

---

## 🔧 Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
```bash
cd app-src
npm install
npm run dev
```

Visit `http://localhost:3000`

### Project Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

---

## 📝 Key Files

### Pages
- `src/app/page.tsx` - Landing page
- `src/app/explore/page.tsx` - Scrollytelling experience
- `src/app/learn/page.tsx` - Learning system (WIP)

### Components
- `src/components/explore/ExploreCanvas.tsx` - Frame renderer
- `src/components/explore/ExploreOverlay.tsx` - Text overlays
- `src/components/explore/LearningRoadmap.tsx` - Roadmap section

### Styles
- `src/app/globals.css` - Global styles with GPU acceleration

---

## 🎯 Next Steps

1. **Implement /learn system** (Phase 1: Learning Backbone)
   - Create data models for 379 topics
   - Build API layer
   - Implement dynamic routing
   - Create three-panel UI layout

2. **First Topic Implementation**
   - Linear Regression with interactive visuals
   - Live code playground
   - Synchronized theory and visualization

3. **Scale to all topics**
   - Clone topic template
   - Add content for remaining 378 topics

---

## 📄 License

Proprietary - All rights reserved

---

## 🤝 Contributing

This is a private educational project. Not open for external contributions.

---

**Last Updated**: 2026-01-16
