# DentaPark Mock Clinic API

A small, standalone, **real** HTTP service returning **mock** clinic data — the
backend the DentaPark WhatsApp assistant's tools call during demos. It is NOT a
real clinic system; appointments are kept in memory (reset on redeploy).

## Endpoints

All endpoints except `/health` require `x-api-key: <API_KEY>` when `API_KEY` is set.

- `GET /health` — liveness.
- `GET /clinic/services[?service=implant]` — service catalogue with TRY price ranges + durations.
- `GET /clinic/availability?date=YYYY-MM-DD[&service=]` — open slots for a date (booked slots removed; Sundays closed).
- `POST /clinic/appointments` — body `{ patientName, phone, service, date, time }` → creates a booking, returns `refNo` (e.g. `DP-2026-0042`). `409` if the slot is taken/out of hours.

## Run

```bash
npm install
API_KEY=secret PORT=8080 npm start
```

## Deploy

Dockerfile build pack on Coolify. Set `API_KEY` (and `PORT=8080`). The assistant's
HttpTool sends the same key via the `x-api-key` header.
