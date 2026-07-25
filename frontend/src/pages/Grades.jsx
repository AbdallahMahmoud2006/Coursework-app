import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";
import BackButton from "../components/BackButton";
import WeightBar from "../components/WeightBar";
import { computeOverall } from "../gradeCalculations";
import { computeAchievableGrades, computePassRequirement } from "../gradeCalculations";

export default function Grades() {
  const { semesterId, subjectId } = useParams();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const [catName, setCatName] = useState("");
  const [catWeight, setCatWeight] = useState("");
  const [catKeepBestN, setCatKeepBestN] = useState("");
  const [catIsMidterm, setCatIsMidterm] = useState(false);
  const [catIsFinal, setCatIsFinal] = useState(false);

  const [rowCategoryId, setRowCategoryId] = useState("");
  const [rowInstance, setRowInstance] = useState("");
  const [rowObtained, setRowObtained] = useState("");
  const [rowMax, setRowMax] = useState("");
  const [rowPercentage, setRowPercentage] = useState("");
  const [rowDate, setRowDate] = useState("");

  const [filterCategoryId, setFilterCategoryId] = useState("all");

  const hasMidtermCategory = categories.some((c) => c.isMidterm);
  const hasFinalCategory = categories.some((c) => c.isFinal);
  const selectedCategory = categories.find((c) => c._id === rowCategoryId);

  const load = async () => {
    try {
      const [cats, its] = await Promise.all([
        api.getCategories(subjectId),
        api.getGradeItems(subjectId),
      ]);
      setCategories(cats);
      setItems(its);
      if (!rowCategoryId && cats.length > 0) setRowCategoryId(cats[0]._id);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0);

  const itemsByCategoryId = {};
  for (const item of items) {
    const catId = item.category?._id || item.category;
    if (!itemsByCategoryId[catId]) itemsByCategoryId[catId] = [];
    itemsByCategoryId[catId].push(item);
  }

  const { overall, letter, perCategory } = computeOverall(categories, itemsByCategoryId);
  const achievableGrades = computeAchievableGrades(categories, itemsByCategoryId);
  const passInfo = computePassRequirement(categories, itemsByCategoryId);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.createCategory({
        subjectId,
        name: catName,
        weight: Number(catWeight),
        keepBestN: catIsMidterm ? null : catKeepBestN ? Number(catKeepBestN) : null,
        isMidterm: catIsMidterm,
        isFinal: catIsFinal,
      });
      setCatName("");
      setCatWeight("");
      setCatKeepBestN("");
      setCatIsMidterm(false);
      setCatIsFinal(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    await api.deleteCategory(id);
    load();
  };

  const handleAddRow = async (e) => {
    e.preventDefault();
    setError("");
    if (!selectedCategory) return;
    try {
      await api.createGradeItem({
        subjectId,
        categoryId: rowCategoryId,
        instanceNumber: selectedCategory.isMidterm ? null : Number(rowInstance) || null,
        obtained: selectedCategory.isMidterm ? null : Number(rowObtained),
        max: selectedCategory.isMidterm ? null : Number(rowMax),
        percentage: selectedCategory.isMidterm ? Number(rowPercentage) : null,
        date: rowDate,
      });
      setRowInstance("");
      setRowObtained("");
      setRowMax("");
      setRowPercentage("");
      setRowDate("");
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteRow = async (id) => {
    await api.deleteGradeItem(id);
    load();
  };

  const visibleItems =
    filterCategoryId === "all"
      ? items
      : items.filter((i) => (i.category?._id || i.category) === filterCategoryId);

  return (
    <div>
      <BackButton to={`/semesters/${semesterId}/subjects/${subjectId}`} label="Subject" />
      <h1>Grades</h1>
      {error && <p style={{ color: "var(--urgent)" }}>{error}</p>}

      <div className="card">
        <div className="card-row" style={{ marginBottom: "0.7rem" }}>
          <h2 style={{ margin: 0 }}>Course composition</h2>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: totalWeight === 100 ? "var(--task)" : "var(--deadline)" }}>
            {totalWeight}% allocated
          </span>
        </div>
        <WeightBar categories={categories} />
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Weight</th>
              <th>Keep best N</th>
              <th>Score</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id}>
                <td style={{ fontFamily: "var(--font-body)" }}>
                  {cat.name}{" "}
                  {cat.isMidterm && <span className="badge midterm">midterm</span>}
                  {cat.isFinal && <span className="badge exam">final</span>}
                </td>
                <td>{cat.weight}%</td>
                <td>{cat.isMidterm ? "-" : cat.keepBestN || "all"}</td>
                <td>
                  {perCategory[cat._id]?.scorePercent !== null
                    ? perCategory[cat._id].scorePercent.toFixed(1) + "%"
                    : <span className="text-muted">no data</span>}
                </td>
                <td><button onClick={() => handleDeleteCategory(cat._id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>

        <form onSubmit={handleAddCategory} className="form-row" style={{ marginTop: "1rem", marginBottom: 0 }}>
          <input type="text" placeholder="Category name" value={catName} onChange={(e) => setCatName(e.target.value)} required />
          <input type="number" placeholder="Weight %" value={catWeight} onChange={(e) => setCatWeight(e.target.value)} required />
          {!catIsMidterm && (
            <input type="number" placeholder="Keep best N (blank = all)" value={catKeepBestN} onChange={(e) => setCatKeepBestN(e.target.value)} />
          )}
          <label>
            <input type="checkbox" checked={catIsMidterm} disabled={hasMidtermCategory} onChange={(e) => setCatIsMidterm(e.target.checked)} /> Midterm
          </label>
          <label>
            <input type="checkbox" checked={catIsFinal} disabled={hasFinalCategory} onChange={(e) => setCatIsFinal(e.target.checked)} /> Final
          </label>
          <button type="submit" className="primary">Add Category</button>
        </form>
      </div>

      <div className="card">
        <div className="card-row">
          <h2 style={{ margin: 0 }}>Running total</h2>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.3rem", color: "var(--accent)" }}>
            {overall !== null ? `${overall.toFixed(1)}% · ${letter}` : "no data yet"}
          </span>
        </div>
        <p className="text-muted" style={{ marginBottom: 0, marginTop: "0.5rem" }}>
          Reflects only categories with data so far.
        </p>
      </div>

      {passInfo && (
        <div className="card">
          <h2>Pass requirement</h2>
          {passInfo.currentlyPassing !== null ? (
            <p style={{ color: passInfo.currentlyPassing ? "var(--task)" : "var(--urgent)", fontWeight: 600 }}>
              {passInfo.currentlyPassing ? "Currently passing" : "Currently not passing"}
            </p>
          ) : passInfo.possible ? (
            <p>
              You need at least{" "}
              <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent)", fontWeight: 700 }}>
                {passInfo.neededFinalRaw.toFixed(1)}%
              </span>{" "}
              on the {passInfo.finalCategory.name} to pass (needs ≥30% on it, and ≥50% overall).
            </p>
          ) : (
            <p style={{ color: "var(--urgent)", fontWeight: 600 }}>Passing is no longer mathematically possible.</p>
          )}

          <h3>Achievable grades</h3>
          <table>
            <thead>
              <tr><th>Grade</th><th>Needed on final</th><th>Achievable</th></tr>
            </thead>
            <tbody>
              {achievableGrades.map((g) => (
                <tr key={g.letter}>
                  <td style={{ fontFamily: "var(--font-body)" }}>{g.letter}</td>
                  <td>{g.neededRaw.toFixed(1)}%</td>
                  <td>{g.achievable ? "✓" : <span style={{ color: "var(--urgent)" }}>no</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card">
        <div className="card-row" style={{ marginBottom: "0.7rem" }}>
          <h2 style={{ margin: 0 }}>Grade items</h2>
          <select value={filterCategoryId} onChange={(e) => setFilterCategoryId(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Category</th><th>#</th><th>Obtained</th><th>Max</th>
              <th>Raw %</th><th>% of course</th><th>Counted</th><th>Date</th><th></th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => {
              const catId = item.category?._id || item.category;
              const cat = categories.find((c) => c._id === catId);
              const isMidterm = cat?.isMidterm;
              const rawPct = isMidterm ? item.percentage : item.max > 0 ? (item.obtained / item.max) * 100 : null;
              const weightedPct = rawPct !== null && cat ? (rawPct * cat.weight) / 100 : null;
              const counted = perCategory[catId]?.countedItemIds?.includes(item._id);
              return (
                <tr key={item._id}>
                  <td style={{ fontFamily: "var(--font-body)" }}>
                    {cat ? cat.name : "(deleted)"} {isMidterm && <span className="badge midterm">midterm</span>}
                  </td>
                  <td>{isMidterm ? "-" : item.instanceNumber ?? "-"}</td>
                  <td>{isMidterm ? "-" : item.obtained}</td>
                  <td>{isMidterm ? "-" : item.max}</td>
                  <td>{rawPct !== null ? rawPct.toFixed(1) + "%" : "-"}</td>
                  <td style={{ color: "var(--accent)" }}>{weightedPct !== null ? weightedPct.toFixed(1) + "%" : "-"}</td>
                  <td>{counted ? "✓" : <span className="text-muted">dropped</span>}</td>
                  <td>{item.date || "-"}</td>
                  <td><button onClick={() => handleDeleteRow(item._id)}>Delete</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <h3 style={{ marginTop: "1.2rem" }}>Add row</h3>
        {categories.length === 0 ? (
          <p className="text-muted">Add a category above first.</p>
        ) : (
          <form onSubmit={handleAddRow} className="form-row" style={{ marginBottom: 0 }}>
            <select value={rowCategoryId} onChange={(e) => setRowCategoryId(e.target.value)}>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>

            {selectedCategory && !selectedCategory.isMidterm && (
              <input type="number" placeholder="Instance #" value={rowInstance} onChange={(e) => setRowInstance(e.target.value)} />
            )}

            {selectedCategory?.isMidterm ? (
              <input type="number" step="0.01" min="0" max="100" placeholder="Percentage obtained" value={rowPercentage} onChange={(e) => setRowPercentage(e.target.value)} required />
            ) : (
              <>
                <input type="number" step="0.01" placeholder="Obtained" value={rowObtained} onChange={(e) => setRowObtained(e.target.value)} required />
                <input type="number" placeholder="Max" value={rowMax} onChange={(e) => setRowMax(e.target.value)} required />
              </>
            )}

            <input type="text" placeholder="Date (optional)" value={rowDate} onChange={(e) => setRowDate(e.target.value)} />
            <button type="submit" className="primary">Add Row</button>
          </form>
        )}
      </div>
    </div>
  );
}
