import {FaBoxOpen,FaFlask,FaLeaf,FaShoppingBag} from 'react-icons/fa';
import DashboardHeader from '../components/dashboard/DashboardHeader.jsx';
import DashboardStats from '../components/dashboard/DashboardStats.jsx';
import DashboardEmpty from '../components/dashboard/DashboardEmpty.jsx';
import DashboardQuickActions from '../components/dashboard/DashboardQuickActions.jsx';
import BlendWorkflowPanel from '../components/dashboard/BlendWorkflowPanel.jsx';
import RecentBatchesPanel from '../components/dashboard/RecentBatchesPanel.jsx';
import {useStudio} from '../utils/studioContext.jsx';
import {getDashboardCounts} from '../utils/dashboard/dashboardData.js';
import '../styles/Dashboard.css';

export default function Dashboard(){
 const {data}=useStudio();
 if(!data)return <DashboardEmpty message="Loading Herbs & Spices dashboard…"/>;
 const counts=getDashboardCounts(data);
 const stats=[
  {label:'Original blends',value:counts.blends,icon:<FaFlask/>},
  {label:'Ingredients',value:counts.ingredients,icon:<FaLeaf/>},
  {label:'Finished packs',value:counts.finishedPacks,icon:<FaBoxOpen/>},
  {label:'New order requests',value:counts.pendingOrders,icon:<FaShoppingBag/>}
 ];
 return <section className="dashboard">
  <DashboardHeader/>
  <DashboardStats stats={stats}/>
  <div className="dashboard-grid mt-3">
   <div className="dashboard-main">
    <div className="dashboard-flow dashboard-flow-workflow">
     <RecentBatchesPanel batches={data.batches}/>
     <BlendWorkflowPanel/>
    </div>
   </div>
  </div>
  <DashboardQuickActions/>
 </section>;
}
