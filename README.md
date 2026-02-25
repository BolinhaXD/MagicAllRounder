# Magic All Rounder

A **Magic: The Gathering** deck builder and randomizer — full-stack app with user accounts, auth, and a SQLite database.

---

## Tech stack

| Layer    | Stack |
|----------|--------|
| **Frontend** | React 19, Vite 7, React Router 7, TypeScript |
| **Backend**  | Express 5, TypeScript, Prisma, SQLite |
| **Auth**     | JWT, bcrypt, Zod (validation) |

---

## Prerequisites

- **Node.js** 18+ and **npm**
- (Optional) **make** — for the Makefile (use Git Bash / WSL on Windows if needed)

---

## Project structure

```
MagicAllRounder/
├── backend/                 # Express API
│   ├── prisma/
│   │   ├── schema.prisma    # DB schema (User, Deck, DeckCard)
│   │   ├── dev.db           # SQLite database (created by migrations)
│   │   └── migrations/
│   ├── src/
│   │   ├── index.ts         # App entry, routes mount
│   │   ├── routes/auth.ts   # POST /auth/register, /auth/login, GET /auth/me
│   │   └── middleware/auth.ts
│   └── .env                 # DATABASE_URL, JWT_SECRET, PORT
├── frontend/
│   ├── package.json         # "dev" runs MARFrontend
│   └── MARFrontend/         # Vite + React app
│       ├── src/
│       │   ├── api.ts       # API client, auth helpers
│       │   ├── context/AuthContext.tsx
│       │   └── pages/       # Home, Login, SignUp
│       └── .env             # VITE_API_URL
├── package.json             # Root scripts (dev, reload, etc.)
├── Makefile                 # install, dev, db-*, clean, etc.
└── README.md
```

---

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd MagicAllRounder
npm install
cd backend && npm install
cd ../frontend && npm install
cd MARFrontend && npm install
```

Or from root:

```bash
make install
```

### 2. Environment variables

**Backend** (`backend/.env`):

```env
# Optional if using default SQLite in schema
# DATABASE_URL="file:./dev.db"

JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
```

**Frontend** (`frontend/MARFrontend/.env`):

```env
VITE_API_URL=http://localhost:3001
```

### 3. Database

The app uses **SQLite** by default (`backend/prisma/dev.db`). Migrations are in `backend/prisma/migrations/`.

Apply migrations (from repo root or backend):

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

Or:

```bash
make db-migrate
make db-generate
```

### 4. Run the app

From the **repo root**:

```bash
npm run dev
```

- **Backend:** http://localhost:3001  
- **Frontend:** http://localhost:5173 (Vite)

Or run separately:

```bash
npm run dev:backend   # backend only
npm run dev:frontend  # frontend only
```

Or with make:

```bash
make dev
```

---

## Scripts (npm)

| Command | Description |
|--------|-------------|
| `npm run dev` | Run backend + frontend (concurrently) |
| `npm run dev:backend` | Run backend only |
| `npm run dev:frontend` | Run frontend only |
| `npm run reload` | Same as `dev` (restart after Ctrl+C) |
| `npm run restart` | Same as `dev` |

**Backend** (`backend/`):

| Command | Description |
|--------|-------------|
| `npm run dev` | Dev server (ts-node-dev) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run `node dist/index.js` |

**Frontend** (`frontend/MARFrontend/`):

| Command | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

---

## Makefile (optional)

From repo root:

| Target | Description |
|--------|-------------|
| `make` / `make help` | List all targets |
| `make install` | Install all dependencies |
| `make dev` | Run backend + frontend |
| `make dev-backend` / `make dev-frontend` | Run one app |
| `make build` | Build backend and frontend |
| `make db-migrate` | Apply Prisma migrations |
| `make db-studio` | Open Prisma Studio (edit DB in browser) |
| `make db-generate` | Generate Prisma client |
| `make db-push` | Push schema (no migration file) |
| `make db-reset` | Reset DB (destructive) |
| `make clean` | Remove node_modules and build output |
| `make lint` | Run linters |

On Windows, use Git Bash or WSL to run `make`, or use the npm scripts above.

---

## API (backend)

Base URL: `http://localhost:3001` (or your `PORT`).

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | API info + links |
| GET | `/health` | Health + DB connection |
| GET | `/db` | DB status + counts (users, decks) |
| GET | `/db/users` | List users (id, username, email, createdAt) |
| POST | `/auth/register` | Sign up — body: `{ username, email, password }` |
| POST | `/auth/login` | Log in — body: `{ email, password }` |
| GET | `/auth/me` | Current user — header: `Authorization: Bearer <token>` |

Auth responses return `{ user: { id, username?, email }, token }`. Use the token in the `Authorization` header for `/auth/me`.

---

## Database

- **Engine:** SQLite (`backend/prisma/dev.db`).
- **Schema:** `User` (username, email, passwordHash), `Deck`, `DeckCard` — see `backend/prisma/schema.prisma`.

**Edit data manually:**

```bash
cd backend
npx prisma studio
```

Opens http://localhost:5555 — browse and edit tables.

**Migrations:**

```bash
cd backend
npx prisma migrate dev --name your_migration_name
npx prisma generate
```

---

## Frontend overview

- **Routes:** `/` (home), `/login`, `/signup`.
- **Auth:** Token in `localStorage`; `AuthContext` provides `user`, `login`, `register`, `logout`.
- **API client:** `src/api.ts` — `auth.register(username, email, password)`, `auth.login(email, password)`, `auth.me()`.

---