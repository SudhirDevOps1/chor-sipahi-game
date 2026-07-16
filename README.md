# Raja Mantri Chor Sipahi Online (Cloudflare D1 + Workers Edition)

A privacy-first, Cloudflare D1-backed online edition of the classic Indian four-player guessing game. Built on Next.js 16, React 19, and Drizzle ORM, configured specifically to run at the edge on Cloudflare Pages and Workers.

## How to Play

A room requires exactly four players. Every round the server shuffles and privately deals one of these four roles:

| Role | Points | What happens |
| --- | ---: | --- |
| 👑 Raja | 1000 | Calls for the Mantri; fixed points. |
| 🗡️ Mantri | 800 or 0 | Reveals themselves and guesses the Chor. Correct guess: 800. Wrong guess: 0. |
| 💰 Chor | 0 or 800 | Stays hidden. Takes 800 only if Mantri accuses Sipahi. |
| 🛡️ Sipahi | 500 | Stays hidden; fixed points. |

### Round Flow:

1. **Host** creates a room and shares the six-digit invite code.
2. Exactly **four** players join; the host starts the game.
3. Each player sees only their own private role and confirms they've seen it.
4. **Raja** calls "Mera Mantri kaun hai?"; the **Mantri** reveals themselves.
5. The **Mantri** chooses one of the two remaining hidden players as the **Chor**.
6. The server reveals all roles, calculates awards, updates scores, and starts the next round.
7. After the selected number of rounds (e.g., 5 rounds), the highest score wins.

---

## Technical Stack

- **Framework**: Next.js 16 (App Router) running on **Edge Runtime**
- **Deployment Platform**: Cloudflare Pages / Workers
- **Database**: Cloudflare D1 (SQLite-compatible Serverless SQL database)
- **ORM**: Drizzle ORM
- **Validations**: Zod
- **Identity & Privacy**: Guest sessions with salted SHA-256 device hash, fully anonymous

---

## Local Setup & Development

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Generate SQLite Migrations
Use Drizzle Kit to generate migrations based on the schema:
```bash
npx drizzle-kit generate
```

### 3. Local Database & Development
To run the server locally with a local D1 instance (using Wrangler Pages emulator):
```bash
# 1. Build next-on-pages artifact
npm run pages:build

# 2. Run local preview with emulated D1 bindings
npx wrangler pages dev .vercel/output --compatibility-flags=nodejs_compat --d1 DB=chor-sipahi-db
```

To apply migrations locally for testing:
```bash
npx wrangler d1 migrations apply chor-sipahi-db --local
```

---

## Deploying to Cloudflare

### 1. Create a D1 Database
Create the database via wrangler:
```bash
npx wrangler d1 create chor-sipahi-db
```
Wrangler will output the configuration. Paste the `database_id` into your `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "chor-sipahi-db"
database_id = "YOUR_DATABASE_ID_HERE"
migrations_dir = "./drizzle/migrations"
```

### 2. Run Migrations on Production D1
Apply generated schema migrations to your live Cloudflare D1 database:
```bash
npx wrangler d1 migrations apply chor-sipahi-db --remote
```

### 3. Deploy App
Compile and deploy the application:
```bash
npm run pages:build
npx wrangler pages deploy .vercel/output
```

---

## API Endpoints

- `GET /api/auth` — Returns guest identity hash
- `GET /api/rooms` — Lists public waiting rooms
- `POST /api/rooms` — Creates a new game room
- `POST /api/rooms/:roomCode/join` — Joins a waiting room
- `POST /api/rooms/:roomCode/start` — Host deals roles and starts game
- `GET /api/rooms/:roomCode/state` — Syncs game room state safely
- `POST /api/rooms/:roomCode/action` — Acknowledge role, reveal Mantri, guess Chor, or proceed to next round
- `POST /api/rooms/:roomCode/chat` — Chat inside the game table
- `GET /api/stats` — Leaderboard stats
- `GET /api/health` — Cloudflare D1 connection health check