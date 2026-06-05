# Garage Demo Implementation Plan

## 1. Overview
- Build a web application using:
  - Frontend: React + TypeScript + Vite + MUI
  - Backend: Node.js + TypeScript + Express
  - Database: PostgreSQL
  - Local development: Docker Desktop with docker-compose
- The application simulates a parking garage entrance gate, handles arrivals and exits, and tracks parking costs.

## 2. Software Requirements
- UI simulates an entrance gate and an arriving car.
- Enter a car by license plate number.
- Backend API indicates whether the parking garage is full.
- Select a parking spot (e.g., space number 50).
- Backend API indicates whether a chosen space is vacant.
- Exit a car by license plate number.
- UI displays parking cost.
- Backend stores parking data: license plate number, parking space, time.
- Garage capacity: 5 parking spaces.
- Pricing:
  - First 3 hours: €0.50 per starting 10 minutes.
  - Additional time after first 3 hours: €0.30 per starting 10 minutes.
- Optional admin UI: show available spaces and active parked cars.

## 3. Architecture
- Monorepo structure with separate frontend and backend folders.
- Use Docker Compose to run PostgreSQL, backend, and frontend together.
- Frontend will consume backend REST APIs.

## 4. Data Model
- `parking_spaces`
  - `id`
  - `number` (1..5)
  - `is_vacant`
- `parking_sessions`
  - `id`
  - `license_plate`
  - `space_number`
  - `entered_at`
  - `exited_at` (nullable)
  - `price_cents` (nullable)

## 5. Backend API
- `GET /api/status`
  - returns garage occupancy and available spaces.
- `GET /api/spaces`
  - returns each space with vacancy status.
- `POST /api/entry`
  - body: `{ licensePlate, spaceNumber }`
  - validates: garage not full, space vacant.
  - stores entry time.
- `POST /api/exit`
  - body: `{ licensePlate }`
  - finds active session, computes cost, updates session.
- `GET /api/admin/parked`
  - returns active parked cars, spaces, and duration.

## 6. Pricing Logic
- Calculate total parking duration in minutes.
- Round up each segment to the next 10-minute interval.
- Apply pricing:
  - First 180 minutes: €0.50 per 10-minute increment.
  - Remaining minutes: €0.30 per 10-minute increment.

## 7. Frontend UI
- Entrance gate page:
  - license plate input.
  - parking space selection.
  - entry submit button.
  - display success or error status.
- Vacancy display:
  - show 5 spaces and their availability.
- Exit flow:
  - license plate input.
  - exit button.
  - show parking cost.
- Status display:
  - available spaces count.
  - garage full warning.

## 8. Optional Admin Interface
- A separate `/admin` route/page.
- Show available spaces count.
- Show active parked cars with space number, license plate, and duration.
- Use a MUI table or DataGrid.

## 9. Docker & Local Development
- `docker-compose.yml` with services:
  - `postgres`
  - `backend`
  - `frontend`
- Backend connects to Postgres over Docker network.
- Frontend proxies API requests to backend.
- Provide startup command: `docker-compose up --build`.
- Add DB initialization/migration script to create tables and seed 5 spaces.

## 10. Testing & Validation
- Manual tests:
  - enter car when space available.
  - reject entry when garage is full.
  - reject entry to occupied space.
  - exit car and verify cost.
  - verify admin view counts and durations.
- Optionally add backend unit tests for pricing and API validations.

## 11. Deliverables
- React + Vite frontend for entrance, selection, and exit.
- Express + TypeScript backend API with occupancy and vacancy checks.
- PostgreSQL storage of parking sessions.
- Docker-based local development setup.
- Optional admin UI for monitoring parked cars and available spaces.
