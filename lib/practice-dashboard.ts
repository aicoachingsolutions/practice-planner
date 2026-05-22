export function formatSportLabel(sportKey: string): string {
  return sportKey
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function countPracticesThisWeek(practiceDates: string[], now = new Date()): number {
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return practiceDates.filter((isoDate) => {
    const d = new Date(`${isoDate}T12:00:00`);
    return d >= monday && d <= sunday;
  }).length;
}
