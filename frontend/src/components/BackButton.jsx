import { Link } from "react-router-dom";

export default function BackButton({ to, label = "Back" }) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <Link
        to={to}
        className="text-muted"
        style={{ fontSize: "0.85rem", fontWeight: 500 }}
      >
        ← {label}
      </Link>
    </div>
  );
}
