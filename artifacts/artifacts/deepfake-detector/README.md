# Deepfake Detector Frontend

A modern React + Vite + Tailwind CSS app for fake media detection platform.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Demo login auto-applies: `demo@auradetect.ai`**

## Features
- Responsive cyberpunk-themed UI with shadcn/ui components
- File upload for image/video/audio analysis
- Real-time results with confidence scores
- User dashboard and scan history
- Framer Motion animations

## Scripts
- `npm run dev` - Start dev server (hot reload)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - TypeScript check

## Backend (optional)
See `../api-server/README.md` for API server setup.

## Troubleshooting
- Blank page? Ensure Tailwind plugin enabled in vite.config.ts
- Console errors? Check missing deps: `npm i`
- Images missing? public/images/cyber-bg.png present.

Built with ❤️ using Vite, React 18, Tailwind CSS v4, Wouter, Tanstack Query.
