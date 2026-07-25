# Notes Calendar App

A small calendar and notes web app for managing semesters, subjects, tasks, events, and grade items. This repository contains a Node/Express backend and a Vite + React frontend.

## Features
- Calendar view with weeks and day detail
- Manage semesters, subjects, tasks and events
- Grade items and lightweight grade calculations
- Upload and view PDFs
- Simple REST API for frontend consumption

## Tech stack
- Backend: Node.js, Express
- Frontend: React + Vite
- Data storage: file-based or database (configurable)

## Repo layout

- backend/ — Express server and API routes
  - controllers/, models/, routes/, uploads/, config/
- frontend/ — React app built with Vite
  - src/, public/, assets/

## Prerequisites
- Node.js 18+ and npm or yarn
- Optional: a running database if you wire one into backend/config/db.js

## Quick start (development)

1. Install backend dependencies and start the server

```bash
cd backend
npm install
npm run dev
# or: npm start
```

2. Install frontend dependencies and start the dev server

```bash
cd frontend
npm install
npm run dev
# opens Vite dev server (usually http://localhost:5173)
```

Open the frontend URL in your browser. The frontend talks to the backend API (default: http://localhost:3000).

## Environment / Configuration

The backend reads configuration from process.env. Create a .env in backend/ with values such as:

```
PORT=3000
NODE_ENV=development
# DB connection string or file path if used by backend/config/db.js
DATABASE_URL=mongodb://localhost:27017/notes-calendar
UPLOAD_DIR=uploads
```

Adjust the frontend API base URL in frontend/src/api.js if necessary.

## API overview

The backend exposes REST endpoints organized under backend/routes/. Key route files:

- categoryRoutes.js — categories management
- eventRoutes.js — calendar events
- gradeItemRoutes.js — grade items
- pdfRoutes.js — PDF upload / retrieval
- semesterRoutes.js — semesters
- subjectRoutes.js — subjects
- taskRoutes.js — tasks
- weekRoutes.js — week/agenda

Use an API client or the frontend to interact with the server. Inspect the route files for available endpoints and payload shapes.

## Uploads

Uploaded files are stored under backend/uploads/ by default. The location can be configured by UPLOAD_DIR and upload logic in backend/config/upload.js.

## Build & Production

Build the frontend for production and serve the static files from any static server or integrate with the backend:

```bash
cd frontend
npm run build
# serve the `dist/` folder with any static host, or copy into backend static assets
```

On the backend, use a process manager (pm2, systemd) or containerize the app for production deployments.

## Tests

There are no automated tests included by default. Consider adding unit and integration tests for critical controllers and frontend components.

## Contributing

1. Fork the repo and create a feature branch
2. Open a PR describing the change
3. Keep changes focused and add tests where applicable

## Troubleshooting
- If the frontend cannot reach the backend, confirm API base URL in frontend/src/api.js and that the backend PORT is correct.
- Check backend/server.js console logs for startup errors.

## License
This project is provided as-is. Add a LICENSE file if you want to specify terms.

---

If you want, I can: add a minimal `.env.example`, wire a sample SQLite or MongoDB config, or add npm scripts for combined start. Which would you like next?


Copyright © 2026 Abdallah Mahmoud. All rights reserved.