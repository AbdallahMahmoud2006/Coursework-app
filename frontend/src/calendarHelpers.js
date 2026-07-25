export const TYPE_COLORS = {
  exam: "#cfe2ff", // light blue
  deadline: "#ffe5b4", // light orange
  other: "#e2e2e2", // grey
  task: "#d4f7d4", // light green
};

export function daysUntil(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

export function isUrgent(event) {
  const d = daysUntil(event.date);
  return d <= (event.reminderLeadDays ?? 3);
}
