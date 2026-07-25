export default function DaysChip({ days, urgent }) {
  const label = days === 0 ? "today" : days === 1 ? "1d" : `${days}d`;
  return (
    <span
      className="days-chip"
      style={{
        background: urgent ? "var(--urgent)" : "var(--surface-hover)",
        color: urgent ? "white" : "var(--text)",
        border: urgent ? "none" : "1px solid var(--border-strong)",
      }}
    >
      {label}
    </span>
  );
}
