// DentaPark Ağız ve Diş Sağlığı Polikliniği — demo clinic data.
// Mock but consistent. Prices are "starting from" ranges in TRY.

export const CLINIC = {
  name: "DentaPark Ağız ve Diş Sağlığı Polikliniği",
  district: "Kadıköy, İstanbul",
  address: "Bağdat Caddesi No:124, Kadıköy / İstanbul",
  phone: "+90 216 000 00 00",
  freeFirstExam: true, // ücretsiz ilk muayene + panoramik film
  doctors: [
    { name: "Dr. Elif Yıldız", field: "İmplantoloji" },
    { name: "Dr. Mert Kaya", field: "Ortodonti" },
    { name: "Dr. Aslı Demir", field: "Estetik Diş Hekimliği" },
  ],
  // hours per weekday (0=Sun ... 6=Sat). null = closed.
  hours: {
    0: null, // Pazar kapalı
    1: { open: "09:00", close: "19:00" },
    2: { open: "09:00", close: "19:00" },
    3: { open: "09:00", close: "19:00" },
    4: { open: "09:00", close: "19:00" },
    5: { open: "09:00", close: "19:00" },
    6: { open: "09:00", close: "17:00" }, // Cmt
  },
  slotMinutes: 30,
};

// Service catalogue. priceMin/priceMax in TRY; durationMin in minutes.
export const SERVICES = [
  { key: "implant", name: "İmplant", priceMin: 12000, priceMax: 18000, durationMin: 60, note: "Tek diş; cerrahi dahil. Kemik durumuna göre değişir." },
  { key: "zirkonyum", name: "Zirkonyum Kaplama", priceMin: 6500, priceMax: 6500, durationMin: 45, note: "Diş başına." },
  { key: "ortodonti", name: "Şeffaf Plak Ortodonti", priceMin: 45000, priceMax: 80000, durationMin: 45, note: "Tedavi süresi vakaya göre değişir." },
  { key: "beyazlatma", name: "Diş Beyazlatma", priceMin: 4500, priceMax: 4500, durationMin: 45 },
  { key: "kanal", name: "Kanal Tedavisi", priceMin: 3500, priceMax: 5000, durationMin: 60 },
  { key: "dolgu", name: "Dolgu", priceMin: 1200, priceMax: 2500, durationMin: 30 },
  { key: "dis_tasi", name: "Diş Taşı Temizliği", priceMin: 1500, priceMax: 1500, durationMin: 30 },
  { key: "cekim", name: "Diş Çekimi", priceMin: 1000, priceMax: 3000, durationMin: 30 },
  { key: "pedodonti", name: "Çocuk Diş Hekimliği (Pedodonti)", priceMin: 1000, priceMax: 2500, durationMin: 30 },
  { key: "cerrahi", name: "Ağız ve Diş Cerrahisi", priceMin: 3000, priceMax: 9000, durationMin: 60 },
];

export function findService(query) {
  if (!query) return null;
  const q = String(query).toLowerCase().trim();
  return (
    SERVICES.find((s) => s.key === q) ||
    SERVICES.find((s) => s.name.toLowerCase() === q) ||
    SERVICES.find((s) => s.name.toLowerCase().includes(q) || q.includes(s.key)) ||
    null
  );
}
