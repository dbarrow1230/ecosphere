import {FaFlask} from 'react-icons/fa';
import DashboardSection from './DashboardSection.jsx';
import DashboardList from './DashboardList.jsx';

const workflows=[
 {title:'Blend recipes',description:'Create and maintain your own ingredient formulas.',to:'/blends'},
 {title:'Ingredient stock',description:'Receive ingredients and record stock adjustments.',to:'/stock'},
 {title:'Production',description:'Scale a recipe and record a finished batch.',to:'/production'},
 {title:'Customer orders',description:'Review requests and manage fulfillment.',to:'/orders'}
];

export default function BlendWorkflowPanel(){
 return <DashboardSection kicker="Daily Work" title="Blending Operations" linkTo="/blends/new" linkText="Create a blend">
  <DashboardList items={workflows} icon={<FaFlask/>} getTitle={item=>item.title} metaBuilder={item=>item.description} getLink={item=>item.to}/>
 </DashboardSection>;
}
