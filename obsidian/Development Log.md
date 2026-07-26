# Development Log — Mzazi Coach

## 2026-07-26 — OCR Text Extraction Pipeline Fix & GitHub Push

### Bug Diagnosis & Root Cause
- When OCR runs on complex report cards or table layouts, strict single-line regex matches failed on extra columns, score percentages, or line breaks, forcing `processor.ts` to substitute the generic hardcoded fallback string (`Mathematics: AE, Kiswahili: ME, Science & Technology: BE`).
- Server-side Tesseract execution threw worker initialization errors when offline or missing network CDN links.

### Engineering Resolution
- **Multi-Strategy Band Extraction (`lib/ocr.ts`)**: Implemented line-by-line token matching with alias support (`Mathematics`, `Hesabu`, `English`, `Kiingereza`, `Science & Tech`, `Sayansi`, `Social Studies`, `Jamii`, `Creative Arts`, `Sanaa`) and two-pass regex scanning.
- **Dual-Path Browser & Server OCR (`app/scanner/page.tsx` & `lib/ocr.ts`)**: Enabled browser-side client OCR using Tesseract Web Workers in `ScannerPage` while configuring local node worker paths for server OCR. Removed forced hardcoded demo text substitution.
- **Verification**: Verified with `npm run typecheck` and `npm test` (24/24 tests passing).

## 2026-07-26 — Hero Section Media Assets Update & GitHub Sync

### Engineering Resolution
- **Hero Media Assets Update**: Replaced reference mock images (`ref-a.png`, `ref-b.png`) with optimized production hero video asset (`hero-scene.mp4`) and fallback poster (`hero-poster.webp`).
- **Repository Sync**: Staged, committed, and pushed changes to GitHub `main` branch.

