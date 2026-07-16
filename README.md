# Raja Mantri Chor Sipahi & The Ultimate Online Board Game Suite ??

Welcome to the **Heritage Edition** of Chor Sipahi! What started as a single classic Indian 4-player guessing game has evolved into a massive, multi-game platform featuring 15+ premium classic and board games—all powered by **Cloudflare D1 (Serverless Edge)** and **Next.js 16**.

This repository is optimized to run fully serverless on the edge with **@opennextjs/cloudflare**, meaning 0 latency, massive scalability, and 100% free-tier compatibility on Cloudflare.

---

## ?? What's Included (The Game Suite)

The platform is designed as a centralized gaming lobby where you and your friends can join a room and play a variety of games. 

### **1. Core Multiplayer Games (Live Sync Enabled)**
- **?? Raja Mantri Chor Sipahi**: The classic Indian 4-player role-guessing game. 
- **?? Chess**: Fully integrated live multiplayer chess with capture history and smooth piece animations.
- **? Tic-Tac-Toe**: Live synced multiplayer.
- **?? Connect Four**: Live synced multiplayer with gravity chips.
- **?? Rock Paper Scissors**: Classic 1v1 showdown.

### **2. Custom Heritage Board Games (Local & Bot Sandbox Modes)**
We have carefully integrated 10 beautifully styled sandbox games. (Currently running in localized sandbox modes; backend live-sync networking hooks are actively being integrated):
- **? Battleship**: Play against a smart AI with a fully animated dual-grid.
- **?? CallBreak**: Classic trick-taking card game.
- **?? Jhandi Munda**: Traditional dice betting game.
- **?? Memory**: Card matching game.
- **?? Othello / Reversi**: Strategy board game.
- **?? Snakes & Ladders**: Classic board game.
- **?? Teen Patti**: Indian flush/poker.
- **?? Uno**: Classic color-matching card game.
- **?? WordLink**: Word connection puzzle.

---

## ? Design & Architecture

### **Premium "Heritage" Design System**
We completely overhauled the UI/UX to feel like a premium, vintage paper-and-ink aesthetic. 
* **Paper & Ink Styling**: Replaced all generic dark modes with #f7f0df paper backgrounds and #172748 ink borders.
* **Micro-Animations**: All cards, game boards, and buttons feature smooth pulseGlow and slideUpFade CSS transitions for a buttery-smooth experience.
* **GameShell Architecture**: Every single game runs inside a unified <GameShell /> React wrapper, providing consistent rules, back buttons, and layout grids across all 15 games.

### **Serverless Network Optimizations**
* **Visibility-Aware Polling**: The platform intelligently detects when you switch tabs and pauses backend synchronization. This single feature prevents rate-limit crashes and keeps the Cloudflare Workers backend ultra-fast.
* **OpenNext Build Wrapper**: Compiles directly into Cloudflare Workers and Assets, natively resolving asset copy issues on Windows machines.

---

## ?? Strict Privacy Policy & Security

This platform operates on a **Privacy-First** architecture:
1. **No Accounts Required**: Users never sign up or provide an email.
2. **Strict Identity Cryptography**: Device sessions are generated anonymously via a **256-bit entropy seed** mixed with the current timestamp. It is then salted using a secure server environment secret (DEVICE_ID_SALT) and hashed using SHA-256. 
3. **No Trackers**: We do not use third-party analytics or invasive tracking cookies.
4. **Data Purge**: All game rooms, chat logs, and moves are designed to auto-delete after 30 days to protect metadata.

---

## ?? Local Setup & Development

### 1. Install Dependencies
`ash
npm install --legacy-peer-deps
`

### 2. Generate D1 Migrations
Generate SQLite-compatible migration files using Drizzle Kit:
`ash
npx drizzle-kit generate
`

### 3. Run Locally with Wrangler
Run the local environment with emulated D1 bindings:
`ash
# Apply migrations to your local emulator database
npx wrangler d1 migrations apply chor-sipahi-db --local

# Build the OpenNext Cloudflare bundle
npm run build

# Start wrangler local pages development server
npx wrangler dev
`

---

## ?? How to Deploy on Your Own Cloudflare Account

Anyone can clone this repository and deploy it to their own Cloudflare account in 5 simple steps:

1. **Login**: 
px wrangler login
2. **Create Database**: 
px wrangler d1 create chor-sipahi-db
3. **Link Database**: Copy the generated Database ID into wrangler.jsonc.
4. **Apply Tables**: 
px wrangler d1 migrations apply chor-sipahi-db --remote
5. **Build & Deploy**:
   `ash
   npm run build
   npx wrangler deploy
   `

---

## ?? Free Tier Limits (Cloudflare D1)

With Cloudflare D1 Free Tier (100,000 writes/day & 5GB storage):
- You can host approximately **1,500 to 2,000 full matches every single day** for absolutely zero cost!
- The database can comfortably store over **3,000,000 games** before running out of free storage.

---
*Built with ?? using Next.js, Cloudflare D1, and OpenNext.*
