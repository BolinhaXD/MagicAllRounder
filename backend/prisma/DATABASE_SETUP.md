# Database setup

Your app uses PostgreSQL. Right now Prisma can't reach the database (connection to `localhost:51214` fails).

## Option A: Use Prisma Postgres (current URL)

Your `.env` has a **Prisma Postgres** URL (`prisma+postgres://...`). That requires the Prisma Postgres server to be running.

- If you use [Prisma Data Platform](https://www.prisma.io/data-platform) or run Prisma Postgres locally, start that service first.
- Then in the backend folder run: `npx prisma migrate dev --name init`

## Option B: Use a normal PostgreSQL

1. Install and start PostgreSQL (e.g. [postgresql.org](https://www.postgresql.org/download/), Docker, or a cloud DB).
2. In `backend/.env`, set:
   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"
   ```
   Replace USER, PASSWORD, DATABASE_NAME with your DB user, password, and database name.
3. In the backend folder run:
   ```bash
   npx prisma migrate dev --name init
   ```

## Option C: Use SQLite (no server, good for local dev)

1. In `backend/prisma/schema.prisma`, change the datasource to:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```
2. In `backend/.env`, set:
   ```env
   DATABASE_URL="file:./dev.db"
   ```
   (Or remove DATABASE_URL and rely on the schema default for SQLite.)
3. In the backend folder run:
   ```bash
   npx prisma migrate dev --name init
   ```
   This creates `prisma/dev.db` and the tables. No separate database server needed.

---

After any option, run `npx prisma generate` if needed, then start the backend with `npm run dev`. Test the connection by opening http://localhost:3001/health (should show `"db": "connected"`).
