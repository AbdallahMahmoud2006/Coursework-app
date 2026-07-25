const PALETTE = [
  "var(--exam)",
  "var(--task)",
  "var(--other)",
  "var(--deadline)",
  "#8B7CD8",
  "#4FB8C4",
];

export function categoryColor(category, index) {
  if (category.isMidterm) return "var(--deadline)";
  if (category.isFinal) return "var(--accent)";
  return PALETTE[index % PALETTE.length];
}

export default function WeightBar({ categories }) {
  if (!categories || categories.length === 0) {
    return <p className="text-muted">No grade categories yet.</p>;
  }

  return (
    <div>
      <div className="weight-bar">
        {categories.map((cat, i) => (
          <div
            key={cat._id}
            className="weight-bar-segment"
            style={{
              width: `${cat.weight}%`,
              background: categoryColor(cat, i),
            }}
            title={`${cat.name}: ${cat.weight}%`}
          />
        ))}
      </div>
      <div className="weight-bar-legend">
        {categories.map((cat, i) => (
          <div className="weight-bar-legend-item" key={cat._id}>
            <span
              className="weight-bar-legend-dot"
              style={{ background: categoryColor(cat, i) }}
            />
            {cat.name} ({cat.weight}%)
          </div>
        ))}
      </div>
    </div>
  );
}
