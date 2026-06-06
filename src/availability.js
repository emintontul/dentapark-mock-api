import { CLINIC } from "./clinic-data.js";
import { isTaken, listForDate } from "./store.js";

// Parse "HH:MM" -> minutes since midnight.
function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function toHHMM(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// date: "YYYY-MM-DD". Returns weekday 0..6 (0=Sun) using UTC to stay stable.
function weekdayOf(date) {
  const d = new Date(`${date}T00:00:00Z`);
  return d.getUTCDay();
}

export function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(date));
}

// Returns { open: bool, closedReason?, slots: [{ time, available }] }
export function getDay(date) {
  const wd = weekdayOf(date);
  const hours = CLINIC.hours[wd];
  if (!hours) {
    return { open: false, closedReason: "Klinik bu gün kapalı (Pazar).", slots: [] };
  }
  const start = toMinutes(hours.open);
  const end = toMinutes(hours.close);
  const step = CLINIC.slotMinutes;
  const slots = [];
  for (let t = start; t + step <= end; t += step) {
    const time = toHHMM(t);
    slots.push({ time, available: !isTaken(date, time) });
  }
  return { open: true, hours, slots };
}

// Only the free slots, as plain time strings.
export function availableSlots(date) {
  return getDay(date)
    .slots.filter((s) => s.available)
    .map((s) => s.time);
}

export function bookedCount(date) {
  return listForDate(date).length;
}
