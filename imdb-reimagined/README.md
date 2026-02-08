# IMDb Reimagined

A luxury, cinematic reimagining of IMDb built with Next.js, TailwindCSS, and Framer Motion.

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **TailwindCSS** with custom IMDb theme
- **Framer Motion** for page transitions and animations
- **Google Fonts**: Oswald (display) + Inter Tight (body)

## Theme

| Token | Value |
|-------|-------|
| Gold | `#f5c518` |
| Black | `#161616` |
| White | `#f5f5f5` |
| Gray | `#969696` |
| Gradient | `#f9dc74 -> #f5c518 -> #ff6800` |

## Routes

| Path | Description |
|------|-------------|
| `/` | Home — hero + feature cards |
| `/new-title` | New Title — placeholder form |
| `/review` | Review — placeholder review form |

## Getting Started

```bash
cd imdb-reimagined
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
