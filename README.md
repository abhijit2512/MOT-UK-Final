# MOT-UK-Final

A **UK-based AI Car Service & MOT Management App**.

This is a mobile-responsive web app (built first as a web app, and made
**Capacitor-friendly** so it can be wrapped into an Android app in a later phase).

> **Project status: Phase 2 — Foundation only.**
> This phase sets up the project structure, a running frontend, a running
> backend with a health route, and the database schema (Prisma + PostgreSQL).
> Features like login, voice input, charts, reports and prediction logic are
> **intentionally not built yet** — they come in later phases.

---

## 1. Project structure

```
MOT-UK-Final/
├── frontend/        React + TypeScript + Vite (mobile-responsive UI)
│   └── src/
│       ├── components/   Layout + bottom navigation
│       └── pages/        Placeholder screens
├── backend/         Node.js + Express + TypeScript API
│   ├── src/             Server entry + health route
│   └── prisma/          Prisma schema (database tables)
├── .gitignore
└── README.md        (this file)
```

> **Note on Prisma:** the Prisma schema lives inside `backend/prisma/` because
> the backend is the only part of the app that talks to the database. This is
> the standard, beginner-friendly layout and keeps the `DATABASE_URL` in one
> place (the backend `.env`).

---

## 2. Prerequisites

- **Node.js 18+** (this project was built with Node 22)
- **PostgreSQL** running locally, **or** a free cloud PostgreSQL database
  (for example [Neon](https://neon.tech) or [Supabase](https://supabase.com)).
  You only need the connection string.

---

## 3. Install packages

Install the frontend and backend dependencies separately.

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

---

## 4. Set the DATABASE_URL

The backend reads its configuration from a `.env` file. A template is provided.

```bash
cd backend
cp .env.example .env
```

Then open `backend/.env` and set your PostgreSQL connection string:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE_NAME?schema=public"
PORT=4000
```

Example for a local PostgreSQL install:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mot_uk?schema=public"
```

> **Never commit your real `.env` file.** It is already listed in `.gitignore`.
> Only `.env.example` (with placeholder values) is committed.

The frontend also has a template (`frontend/.env.example`) for the API URL:

```bash
cd frontend
cp .env.example .env
```

```
VITE_API_URL="http://localhost:4000"
```

---

## 5. Run the Prisma migration

This creates the database tables from the schema.

```bash
cd backend
npm run prisma:generate     # generate the Prisma client
npm run prisma:migrate      # create/apply the database tables
```

`prisma:migrate` will ask you to name the first migration — type something
like `init` and press Enter.

> If you just want to check the schema is valid **without** a database, run:
> ```bash
> npm run prisma:validate
> ```

---

## 6. Run the app

Open **two terminals**.

**Terminal 1 — backend:**
```bash
cd backend
npm run dev
```
The API starts on `http://localhost:4000`.
Test the health route in a browser: `http://localhost:4000/api/health`

**Terminal 2 — frontend:**
```bash
cd frontend
npm run dev
```
The app starts on `http://localhost:5173` (Vite will print the exact URL).

---

## 7. Useful commands

### Frontend (`/frontend`)
| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Type-check the project |

### Backend (`/backend`)
| Command | What it does |
|---|---|
| `npm run dev` | Start the API with auto-reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run the compiled server |
| `npm run prisma:generate` | Generate the Prisma client |
| `npm run prisma:migrate` | Create/apply database migrations |
| `npm run prisma:validate` | Check the schema is valid |
| `npm run prisma:studio` | Open Prisma Studio (visual DB browser) |

---

## 8. Vehicle API (Phase 3)

Base URL: `http://localhost:4000`

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/vehicles` | Create a vehicle |
| `GET` | `/api/vehicles` | List all vehicles |
| `GET` | `/api/vehicles/:id` | Get one vehicle |
| `PUT` | `/api/vehicles/:id` | Update a vehicle |
| `DELETE` | `/api/vehicles/:id` | Delete a vehicle |

Notes:
- Phase 3 uses a **temporary demo user** to own vehicles (full login comes
  later). It is created automatically the first time you add a vehicle.
- The reusable UK vehicle data (brands, models, fuel types, vehicle types)
  lives in `frontend/src/data/ukVehicles.ts`.
- The **Vehicles & Roles** screen lets you add, list, edit and delete vehicles,
  with a searchable brand dropdown and a model dropdown that depends on the
  chosen brand (including "Other Model" for custom entries).

> **Tip:** if `prisma migrate dev` reports a shadow-database permission error,
> grant your database user permission to create databases:
> `ALTER ROLE your_user CREATEDB;`

## 9. Roadmap (later phases)

- **Phase 3:** Vehicle data + car builder (UK brands, dependent models)
- **Phase 4:** Add / View / Edit / Delete service & MOT entries
- **Phase 5:** Wire screens to the backend + database
- **Phase 6:** Dashboard bar charts, reports, reminders
- **Phase 7:** Smart service prediction (separate from MOT due date)
- **Phase 8:** Voice input (speech → form → preview → save)
- **Phase 9:** Polish + testing
- **Phase 10:** Capacitor Android build
