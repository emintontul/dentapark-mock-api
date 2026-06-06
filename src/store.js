// In-memory appointment store. Persists for the container's lifetime so that
// availability reflects bookings during a demo. Resets on redeploy — this is a
// mock, not a real clinic system.

const appointments = []; // { refNo, patientName, phone, service, date, time, status }
let counter = 41; // ref numbers start at DP-<year>-0042

function pad(n) {
  return String(n).padStart(4, "0");
}

export function listForDate(date) {
  return appointments.filter((a) => a.date === date && a.status === "BOOKED");
}

export function isTaken(date, time) {
  return appointments.some(
    (a) => a.date === date && a.time === time && a.status === "BOOKED",
  );
}

export function createAppointment({ patientName, phone, service, date, time, year }) {
  counter += 1;
  const refNo = `DP-${year}-${pad(counter)}`;
  const record = {
    refNo,
    patientName,
    phone,
    service,
    date,
    time,
    status: "BOOKED",
    createdAt: new Date().toISOString(),
  };
  appointments.push(record);
  return record;
}

export function allAppointments() {
  return [...appointments];
}
