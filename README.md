# 🎧 Viberr — Aesthetic Live Radio & Hi-Fi Lossless Streams

A high-performance aesthetic web radio platform featuring 28+ curated stations, 24/7 global Icecast streams, real-time Web Audio API visualizers, a 10-band studio equalizer, and background multitasking controls.

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## ☁️ Hosting Recommendation: Cloudflare Pages vs Vercel

| Feature | ⚡ Cloudflare Pages (Recommended) | 🔺 Vercel |
| :--- | :--- | :--- |
| **Bandwidth (Free Tier)** | **UNLIMITED Free Bandwidth** | 100 GB / month limit (overages incur charges) |
| **Suitability for Music** | ⭐⭐⭐⭐⭐ **Best for streaming & media** | ⭐⭐⭐ Good, but risk bandwidth cap with heavy listening |
| **Global Edge Network** | 330+ data centers worldwide | 18+ edge regions |
| **DDoS & Scraping Defense** | Enterprise Cloudflare WAF & Bot Protection | Standard |
| **Custom Domains & SSL** | 100% Free with Automatic SSL | 100% Free with Automatic SSL |
| **Deployment Speed** | Instant (< 15 seconds) | Instant (< 20 seconds) |

> **Verdict**: **Cloudflare Pages** is the best choice for Viberr because audio streaming and high-res visualizers consume significant data, and Cloudflare provides **unlimited free bandwidth** with zero risk of unexpected overage bills.

---

### 🚀 How to Deploy to Cloudflare Pages (100% Free)

1. Push this repository to **GitHub**.
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
3. Select your repository and configure build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
4. Click **Save and Deploy**. Your site will be live on `https://your-app.pages.dev` with free SSL and global CDN caching.

---

## 🔐 How to Manage APIs & Secrets

### 1. Client-Side Environment Variables
Store public configuration in `.env` (prefixed with `VITE_`):
```env
VITE_ADSTERRA_KEY=your_adsterra_zone_key_here
VITE_API_BASE_URL=https://api.viberr.live
```
Access inside React code:
```javascript
const adKey = import.meta.env.VITE_ADSTERRA_KEY;
```

### 2. Backend APIs & Stream Proxying (Cloudflare Workers)
To fetch external stream metadata, proxy audio streams, or protect API keys without exposing them to the client:
1. Create a `functions/api/` directory in this project:
   - Example: `functions/api/stream-meta.js`
2. Write a serverless handler:
   ```javascript
   export async function onRequest(context) {
     const secretApiKey = context.env.PRIVATE_API_SECRET;
     // Fetch protected data securely
     return new Response(JSON.stringify({ status: "ok" }), {
       headers: { "Content-Type": "application/json" }
     });
   }
   ```
3. Add secret variables in **Cloudflare Dashboard** → **Settings** → **Environment Variables** (encrypted at rest).

---

## 📢 Connecting Adsterra Monetization

1. Sign up on [Adsterra.com](https://adsterra.com/) and create a website placement (`Banner 728x90` or `Native Banner`).
2. Copy your **Adsterra Zone Key**.
3. Pass your key to `<AdBanner adsterraKey="YOUR_ZONE_KEY" />` inside `src/App.jsx`.
4. The ad container will silently preload in the background and only appear when a real ad has rendered, auto-closing after 15 seconds.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS, Framer Motion, Lucide Icons
- **Audio DSP**: Web Audio API (10-Band Parametric EQ, FFT Analyser, Procedural Soundscapes)
- **Background Multitasking**: Document Picture-in-Picture API, Canvas Video PiP Bridge, MediaSession API
- **Visuals**: Procedural Canvas Waveforms & Particle Dynamics, 8K Self-Hosted Assets
