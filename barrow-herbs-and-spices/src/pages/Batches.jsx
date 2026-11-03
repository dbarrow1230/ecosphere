import { money } from "../utils/api.js";
import { useStudio } from "../utils/studioContext.jsx";
export default function BatchPage() {
  const {
    data
  } = useStudio();
  return <><h2>Batch history</h2>{data.batches.length ? data.batches.map(row => <details className="history" key={row.id}><summary>{row.name} · {row.lot} · {row.units} packs · {money(row.cost)}</summary><p>{new Date(row.createdAt).toLocaleString()} · {row.grams} g</p>{row.lines.map(line => <p key={line.ingredientId}>{line.name}: {line.grams} g ({line.percent}%)</p>)}<p>{row.notes}</p></details>) : <p>No batches recorded.</p>}</>;
}
