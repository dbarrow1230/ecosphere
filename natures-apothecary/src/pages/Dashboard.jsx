import {FaBoxOpen,FaCalendarAlt,FaFlask,FaLeaf,FaPercent,FaShieldAlt,FaTags,FaTruck,FaUsers} from "react-icons/fa";
import ApothecaryDashboardHeader from "../components/dashboard/ApothecaryDashboardHeader.jsx";
import ApothecaryDashboardQuickActions from "../components/dashboard/ApothecaryDashboardQuickActions.jsx";
import ApothecaryDashboardSection from "../components/dashboard/ApothecaryDashboardSection.jsx";
import ApothecaryDashboardStats from "../components/dashboard/ApothecaryDashboardStats.jsx";
import ApothecaryDashboardList from "../components/dashboard/ApothecaryDashboardList.jsx";
import "../styles/Dashboard.css";

const workflowStats=[
 {
  label:"Products",
  value:"Catalog",
  icon:<FaLeaf/>,
  detail:"Salves, tinctures, teas, oils, bundles, stock, pricing, and labels"
 },
 {
  label:"Clients",
  value:"Care",
  icon:<FaUsers/>,
  detail:"Client records, contact details, addresses, consult notes, and status"
 },
 {
  label:"References",
  value:"Setup",
  icon:<FaFlask/>,
  detail:"Allergens, seasons, occasions, taglines, footers, vendors, and tax rates"
 },
 {
  label:"Access",
  value:"Staff",
  icon:<FaShieldAlt/>,
  detail:"Users, roles, departments, permission modules, and overrides"
 }
];

const dailyWorkflows=[
 {title:"Products",meta:"Manage catalog items, stock, featured products, prices, barcode labels, and product notes.",icon:<FaLeaf/>,to:"/products"},
 {title:"Clients",meta:"Open client profiles, contact data, shipping details, and active client records.",icon:<FaUsers/>,to:"/clients"},
 {title:"Orders",meta:"Create, review, and track orders connected to clients and events.",icon:<FaBoxOpen/>,to:"/orders"}
];

const referenceWorkflows=[
 {title:"Allergens",meta:"Maintain product allergen reference records for formulas, recipes, and labels.",icon:<FaFlask/>,to:"/admin/allergens"},
 {title:"Vendors",meta:"Track herb, bottle, packaging, label, and supply vendors.",icon:<FaTruck/>,to:"/admin/vendors"},
 {title:"Tax Rates",meta:"Manage tax rate records for retail and apothecary sales.",icon:<FaPercent/>,to:"/admin/tax-rates"},
 {title:"Seasons",meta:"Set up seasonal collections, availability windows, and seasonal references.",icon:<FaCalendarAlt/>,to:"/admin/seasons"},
 {title:"Occasions",meta:"Manage markets, workshops, gifting, seasonal campaigns, and collection occasions.",icon:<FaCalendarAlt/>,to:"/admin/occasions"},
 {title:"Taglines",meta:"Maintain reusable storefront, product, and brand display text.",icon:<FaTags/>,to:"/admin/taglines"}
];

const adminWorkflows=[
 {title:"Users",meta:"Create staff users and manage profile records.",icon:<FaUsers/>,to:"/admin/users"},
 {title:"Roles & Permissions",meta:"Assign roles, departments, permission modules, and user overrides.",icon:<FaShieldAlt/>,to:"/admin/business-roles-permissions"},
 {title:"Business Settings",meta:"Manage business profile, app keys, branding, receipt settings, and footer content.",icon:<FaShieldAlt/>,to:"/admin"}
];

function Dashboard(){
 return(
  <section className="dashboard">
   <ApothecaryDashboardHeader/>

   <ApothecaryDashboardStats stats={workflowStats}/>

   <div className="dashboard-grid mt-3">
    <div className="dashboard-main">
     <div className="dashboard-flow dashboard-flow-workflow">
      <ApothecaryDashboardSection
       kicker="Daily Work"
       title="Apothecary Operations"
       linkTo="/products"
       linkText="Open products"
       priority
      >
       <ApothecaryDashboardList
        items={dailyWorkflows}
        getTitle={item=>item.title}
        metaBuilder={item=>item.meta}
        getLink={item=>item.to}
        icon={<FaLeaf/>}
       />
      </ApothecaryDashboardSection>

      <ApothecaryDashboardSection
       kicker="Reference Data"
       title="Catalog & Compliance Setup"
       linkTo="/admin/allergens"
       linkText="Open allergens"
      >
       <ApothecaryDashboardList
        items={referenceWorkflows}
        getTitle={item=>item.title}
        metaBuilder={item=>item.meta}
        getLink={item=>item.to}
        icon={<FaFlask/>}
       />
      </ApothecaryDashboardSection>

      <ApothecaryDashboardSection
       kicker="Administration"
       title="People & Access"
       linkTo="/admin/business-roles-permissions"
       linkText="Open permissions"
      >
       <ApothecaryDashboardList
        items={adminWorkflows}
        getTitle={item=>item.title}
        metaBuilder={item=>item.meta}
        getLink={item=>item.to}
        icon={<FaShieldAlt/>}
       />
      </ApothecaryDashboardSection>
     </div>
    </div>
   </div>

   <ApothecaryDashboardQuickActions/>
  </section>
 );
}

export default Dashboard;
