import express from "express";
import { CLINIC, SERVICES, findService } from "./clinic-data.js";
import { availableSlots, getDay, isValidDate } from "./availability.js";
import { createAppointment, isTaken } from "./store.js";

const app = express();
app.use(express.json());

// Lightweight request log so tool calls are visible during demos.
app.use((req, _res, next) => {
  if (req.path !== "/health") {
    const q = Object.keys(req.query).length ? ` ${JSON.stringify(req.query)}` : "";
    const b = req.method !== "GET" && req.body ? ` body=${JSON.stringify(req.body)}` : "";
    // eslint-disable-next-line no-console
    console.log(`[req] ${req.method} ${req.path}${q}${b}`);
  }
  next();
});

const PORT = process.env.PORT || 8080;
const API_KEY = process.env.API_KEY || ""; // shared secret; HttpTool sends x-api-key

// ── Auth (skipped for /health) ──────────────────────────────────────────────
function requireKey(req, res, next) {
  if (!API_KEY) return next(); // open if no key configured (dev)
  const key = req.get("x-api-key") || req.query.api_key;
  if (key !== API_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }
  next();
}

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "dentapark-mock-api", clinic: CLINIC.name });
});

// ── GET /clinic/services?service= ───────────────────────────────────────────
app.get("/clinic/services", requireKey, (req, res) => {
  const { service } = req.query;
  if (service) {
    const s = findService(service);
    if (!s) {
      return res.status(404).json({ ok: false, error: "service_not_found", query: service });
    }
    return res.json({ ok: true, clinic: CLINIC.name, service: s });
  }
  res.json({
    ok: true,
    clinic: CLINIC.name,
    freeFirstExam: CLINIC.freeFirstExam,
    currency: "TRY",
    services: SERVICES,
  });
});

// ── GET /clinic/availability?date=YYYY-MM-DD&service= ────────────────────────
app.get("/clinic/availability", requireKey, (req, res) => {
  const { date, service } = req.query;
  if (!date || !isValidDate(date)) {
    return res.status(400).json({ ok: false, error: "invalid_date", expected: "YYYY-MM-DD" });
  }
  const svc = service ? findService(service) : null;
  if (service && !svc) {
    return res.status(404).json({ ok: false, error: "service_not_found", query: service });
  }
  const day = getDay(date);
  if (!day.open) {
    return res.json({ ok: true, date, open: false, reason: day.closedReason, slots: [] });
  }
  const slots = day.slots.filter((s) => s.available).map((s) => s.time);
  res.json({
    ok: true,
    date,
    open: true,
    hours: day.hours,
    service: svc ? svc.name : null,
    slots,
  });
});

// ── POST /clinic/appointments ───────────────────────────────────────────────
app.post("/clinic/appointments", requireKey, (req, res) => {
  const { patientName, phone, service, date, time } = req.body || {};
  const missing = ["patientName", "phone", "service", "date", "time"].filter(
    (f) => !req.body || !req.body[f],
  );
  if (missing.length) {
    return res.status(400).json({ ok: false, error: "missing_fields", missing });
  }
  if (!isValidDate(date)) {
    return res.status(400).json({ ok: false, error: "invalid_date", expected: "YYYY-MM-DD" });
  }
  const svc = findService(service);
  if (!svc) {
    return res.status(404).json({ ok: false, error: "service_not_found", query: service });
  }
  const day = getDay(date);
  if (!day.open) {
    return res.status(409).json({ ok: false, error: "clinic_closed", reason: day.closedReason });
  }
  const slotExists = day.slots.some((s) => s.time === time);
  if (!slotExists) {
    return res.status(409).json({
      ok: false,
      error: "slot_out_of_hours",
      available: day.slots.filter((s) => s.available).map((s) => s.time),
    });
  }
  if (isTaken(date, time)) {
    return res.status(409).json({
      ok: false,
      error: "slot_taken",
      alternatives: availableSlots(date).slice(0, 5),
    });
  }
  const year = date.slice(0, 4);
  const record = createAppointment({
    patientName,
    phone,
    service: svc.name,
    date,
    time,
    year,
  });
  res.status(201).json({
    ok: true,
    message: "Randevu oluşturuldu.",
    appointment: {
      refNo: record.refNo,
      patientName: record.patientName,
      service: record.service,
      date: record.date,
      time: record.time,
      clinic: CLINIC.name,
      address: CLINIC.address,
    },
  });
});

app.use((_req, res) => res.status(404).json({ ok: false, error: "not_found" }));

app.listen(PORT, "0.0.0.0", () => {
  // eslint-disable-next-line no-console
  console.log(`dentapark-mock-api listening on :${PORT}`);
});
