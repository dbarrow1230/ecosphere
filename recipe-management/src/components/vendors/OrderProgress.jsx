const labels={draft:'Draft',submitted:'Submitted',approved:'Approved',sent:'Placed',partialReceived:'Partially received',received:'Received',closed:'Closed',cancelled:'Cancelled'};
export function OrderStatusBadge({status}){return <span className={'order-status-badge order-status-'+status}>{labels[status]||status}</span>;}
export default function OrderProgress({order}){
 const stages=order.orderType==='grocery'?[['draft','Draft'],['sent','Placed'],['received','Receiving'],['closed','Closed']]:[['draft','Draft'],['submitted','Submitted'],['approved','Approved'],['sent','Sent'],['received','Receiving'],['closed','Closed']];
 const current=order.status==='partialReceived'?'received':order.status,index=stages.findIndex(([key])=>key===current);
 return <nav className="order-progress" aria-label="Order progress"><ol>{stages.map(([key,label],i)=><li key={key} className={order.status==='cancelled'?'':i<index?'is-complete':i===index?'is-current':''} aria-current={i===index?'step':undefined}><span className="order-stage-marker">{i<index?'✓':i+1}</span><span>{key==='received'&&order.status==='received'?'Received':label}</span></li>)}</ol>{order.status==='cancelled'?<OrderStatusBadge status="cancelled"/>:null}</nav>;
}
