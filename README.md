# Raja Mantri Chor Sipahi Online (OpenNext + Cloudflare D1 Edition)

A premium, privacy-first, Cloudflare D1-backed online edition of the classic Indian four-player guessing game. Built on Next.js 16 (App Router), React 19, and Drizzle ORM, optimized to run fully serverless on the edge with **@opennextjs/cloudflare**.

---

## 🎮 How to Play

A table requires exactly **four players**. In every round, the server shuffles and privately deals one of the four roles:

| Role | Points | What happens |
| :--- | :---: | :--- |
| **👑 Raja (King)** | 1000 | Calls for the Mantri; fixed points. |
| **🗡️ Mantri (Minister)** | 800 or 0 | Must identify the Chor. Correct guess: 800 pts. Wrong guess: 0 pts. |
| **💰 Chor (Thief)** | 0 or 800 | Stays hidden. Takes the Mantri's 800 pts if the Mantri accuses the Sipahi. |
| **🛡️ Sipahi (Soldier)** | 500 | Stays hidden; fixed points. |

### Game Flow:
1. **Host** creates a room, selects the number of rounds (3, 5, or 10), and shares the 6-digit invite code.
2. Exactly **four players** join the lobby.
3. The Host starts the game; roles are dealt.
4. Each player acknowledges their private card.
5. **Raja** calls *"Mera Mantri kaun hai?"*; the **Mantri** reveals themselves.
6. The **Mantri** accuses one of the remaining two players as the **Chor**.
7. The server reveals all roles, assigns points, and updates the leaderboard.
8. The Host advances to the next round. The player with the highest total points at the end wins!

---

## ✨ Features & Architecture

* **The Board Games Suite**: Features 15+ newly added classic board and card games (Chess, Battleship, Ludo, Teen Patti, Uno, CallBreak, Connect Four, Jhandi Munda, etc.) integrated alongside the core guessing game in a unified GameShell architecture.
* **Premium "Heritage" Design System**: Complete UI/UX overhaul featuring vintage paper-and-ink aesthetics (`#f7f0df`), smooth micro-animations (`pulseGlow`, `slideUpFade`), and native SVG icons for a rich tactile feel.
* **Visibility-Aware Backend Polling**: Smart serverless optimization that automatically pauses network syncs when the browser tab is hidden, preventing Cloudflare Workers rate-limit exhaustion and eliminating game lag.
* **D1 Cloudflare Database**: Powered by Cloudflare D1 (SQLite) with Drizzle ORM integration.
* **OpenNext Build Wrapper**: Compiles directly into Cloudflare Workers and Assets, resolving asset copy issues on Windows.
* **Zero-Cookie Privacy**: Anonymous session IDs generated dynamically from 256-bit salted browser seeds.
* **Real Web Icons**: Native high-quality SVG favicon (`favicon.svg`) and high-resolution PNG icon (`icon.png`) fully configured in layouts.
* **Edge-First Security**: Route-level security headers, encrypted device identity seeds, and fully server-authoritative state checks to prevent cheat inspection.

---

## 🛠️ Technical Stack

- **Frontend/Backend**: Next.js 16 (App Router) on **Edge Runtime**
- **Hosting**: Cloudflare Pages / Workers
- **Database**: Cloudflare D1 (Serverless SQLite)
- **Database Client**: Drizzle ORM (Runtime Context Dynamic Proxy Client)
- **Deployment Adapter**: `@opennextjs/cloudflare` (OpenNext)
- **Validations**: Zod
- **Icons**: Lucide React & Custom Assets

---

## 📋 Local Setup & Development

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Generate D1 Migrations
Generate SQLite-compatible migration files using Drizzle Kit:
```bash
npx drizzle-kit generate
```

### 3. Run Locally with Wrangler
Run the local environment with emulated D1 bindings:
```bash
# Apply migrations to your local emulator database
npx wrangler d1 migrations apply chor-sipahi-db --local

# Build the OpenNext Cloudflare bundle
npm run build

# Start wrangler local pages development server
npx wrangler dev
```

---

## 🚀 How to Deploy on Your Own Cloudflare Account

Anyone can clone this repository and deploy it to their own Cloudflare account in 5 simple steps:

### Step 1: Login to Cloudflare
Make sure you are logged in to your Cloudflare account via Wrangler CLI:
```bash
npx wrangler login
```

### Step 2: Create a D1 Database
Create a new serverless SQLite D1 database on your account:
```bash
npx wrangler d1 create chor-sipahi-db
```
Cloudflare will print the database configuration details.

### Step 3: Configure Database ID
Open [**wrangler.jsonc**](file:///c:/Users/DELL/Desktop/forme%20forge%20investigation/chorsipahi-online-game-development/wrangler.jsonc) and update the `database_id` under the `d1_databases` array with the ID generated in Step 2:
```json
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "chor-sipahi-db",
      "database_id": "YOUR-NEW-D1-DATABASE-ID-HERE",
      "migrations_dir": "drizzle/migrations"
    }
  ]
```

### Step 4: Apply Database Migrations
Create the tables in your live Cloudflare D1 database:
```bash
npx wrangler d1 migrations apply chor-sipahi-db --remote
```

### Step 5: Push and Deploy
You can deploy directly or hook it up to Cloudflare Workers Builds CI/CD:
* **Option A: Auto-deploy via GitHub (Recommended)**
  Connect your GitHub repository to Cloudflare Workers & Pages dashboard. Whenever you `git push` to `main`, Cloudflare will build (Turbopack) and deploy it automatically.
* **Option B: Deploy directly from terminal**
  *(Recommended to run on Linux/macOS or WSL to avoid Windows file locks)*:
  ```bash
  npm run build
  npx wrangler deploy
  ```

---

## 🔒 Environment Variables (Cloudflare Dashboard)

Set the following variables in the Cloudflare Pages/Workers environment variables settings:

| Variable | Type | Description |
| :--- | :--- | :--- |
| `DB` | D1 Database Binding | Bind to the D1 Database named `chor-sipahi-db`. |
| `ENVIRONMENT` | String | Set to `production` (default in config). |
| `DEVICE_ID_SALT` | String | **(Critical)** Any secure random key/salt used to hash browser seeds to prevent session tampering. |

---

## 📑 API Reference

* `GET /api/auth` — Returns guest identity hash based on device seed.
* `GET /api/rooms` — Lists public lobbies waiting for players.
* `POST /api/rooms` — Creates a game room.
* `POST /api/rooms/:roomCode/join` — Joins an active lobby.
* `POST /api/rooms/:roomCode/start` — Starts the match (Host only).
* `GET /api/rooms/:roomCode/state` — Safely syncs match status (only shows permitted card info to each player).
* `POST /api/rooms/:roomCode/action` — Game actions (Acknowledge, Reveal Mantri, Guess Chor, Next Round).
* `POST /api/rooms/:roomCode/chat` — Send in-room chat message.
* `GET /api/stats` — Retrieves game leaderboard.
* `GET /api/health` — Checks D1 database binding health status.

---

## 📈 Database Capacity & Free Tier Limits (Cloudflare D1)

Cloudflare D1 Free Tier allows **100,000 writes per day** and **5 GB database storage**. Here is the daily usage calculation for your game:

* **1 Single Game Round Usage**: A single round of gameplay (Room Creation + Joining + Starting + Actions + Chat) writes around **10 to 15 rows** in the database.
* **Daily Games Limit (Free Tier)**: With **100,000 free writes daily**, you can play approximately **1,500 to 2,000 full matches every single day** for free! (Roughly 6,000 players active daily).
* **Storage Capacity (5 GB)**: A single game row takes only ~150 bytes. 5 GB can easily store **over 3,000,000 completed games**!
* **What happens when full?** You can run cleanup migrations regularly, but practically, the database will never fill up even with thousands of daily matches.

---

## 🔒 Privacy & Auto-Deletion Policy

This game platform is designed with a **privacy-first philosophy**:

1. **Zero Personal Data Collection**: We do not store names, email addresses, IP addresses, or phone numbers.
2. **Anonymous Device Identification**: Player device sessions are identified via an anonymous browser fingerprint hash. This hash is generated locally using browser entropy, salted with a secure worker-level environment secret (`DEVICE_ID_SALT`), and hashed with SHA-256. Raw cookies are never saved.
3. **30-Day Auto-Deletion (Cascading Purge)**:
   - To prevent storage clutter and protect user chat logs/game metadata, **all game rooms, round assignments, chat logs, and moves are automatically deleted from the database 30 days after creation**.
   - The deletion is executed automatically via cascading database triggers inside the room creation endpoint.
4. **No Third-Party Trackers**: We do not load third-party ad pixels, cookies, or track analytics.

---


## 🕒 Version History & Changelog


### **v2.0.0 (Current Edition - OpenNext & D1 migration)**
* **Adapter Shift**: Migrated project from Cloudflare Pages native build configuration to `@opennextjs/cloudflare` (OpenNext adapter).
* **Database Migration**: Swapped PostgreSQL schema and queries for SQLite-compatible core types under Cloudflare D1.
* **Build Wrapper Integration**: Created `build-cf.js` build script wrapper to solve Windows-related output copy issues, enabling seamless Windows/Linux local compilation.
* **Dark Mode Toggle**: Integrated the `<ThemeToggle />` component in the header navigation with `localStorage` state retention.
* **Icons Optimization**: Added high-quality SVG logo and custom PNG icons inside layout metadata configurations.
* **Security & Routing Adjustments**:
  - Removed standard Next.js Node.js middleware (`src/proxy.ts`) to avoid compilation crashes under edge runtimes.
  - Injected security headers directly through standard `next.config.ts`.
  - Configured secure dynamic device salt fetch from Cloudflare runtime context.
  - Removed GitHub Actions workflows (`.github`) to ensure clean developer-driven wrangler deployment pipelines.

### **v1.0.0 (Legacy Edition - Postgres & Node.js)**
* Initial codebase built with generic PostgreSQL setup.
* Relied on traditional Node.js modules (such as `node:crypto`) that are unsupported under edge sandboxes.
* Standard Pages/Vercel build output structure.