import DashboardSection from './DashboardSection.jsx';
import DashboardEmpty from './DashboardEmpty.jsx';
import {money} from '../../utils/api.js';

export default function RecentBatchesPanel({batches=[]}){
 return <DashboardSection kicker="Production" title="Recent Batches" linkTo="/batches" linkText="View batch history" priority>
  {batches.length?<div className="table-wrap"><table>
   <thead><tr><th>Blend</th><th>Lot</th><th>Packs</th><th>Cost</th><th>Date</th></tr></thead>
   <tbody>{batches.slice(0,5).map(batch=><tr key={batch.id}>
    <td>{batch.name}</td><td>{batch.lot}</td><td>{batch.units}</td>
    <td>{money(batch.cost)}</td><td>{new Date(batch.createdAt).toLocaleDateString()}</td>
   </tr>)}</tbody>
  </table></div>:<DashboardEmpty message="No batches recorded yet. Your production history will appear here."/>}
 </DashboardSection>;
}
