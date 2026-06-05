# Garage Demo

A parking garage simulation built with React, TypeScript, Vite, MUI, Express, PostgreSQL, and Docker.

## Features
- Entrance gate UI for car entry and exit
- Parking space selection with vacancy checks
- Parking cost calculation based on time
- Backend persistence using PostgreSQL
- Docker Compose for local development

## Local Setup
1. Install Docker Desktop.
2. From the project root, start the app:

```bash
docker-compose up --build
```

3. Open the frontend:

- http://localhost:5173

4. The backend API is available at:

- http://localhost:4000/api

## Project Structure
- `frontend/` — React + Vite app
- `backend/` — Express API and database logic
- `docker-compose.yml` — local development services
- `backend/init.sql` — database schema and seed data
- `docs/plan.md` — project implementation plan

## Notes
- Garage capacity is fixed to 5 parking spaces.
- Pricing: first 3 hours at €0.50 per 10 minutes; after that €0.30 per 10 minutes.
