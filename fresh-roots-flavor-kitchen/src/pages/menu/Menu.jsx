import {useEffect,useState} from "react";
import {Alert} from "react-bootstrap";
import placeholderImage from "../../images/hero_image1.png";
import "../../styles/Menu.css";

const formatPrice=value=>{
 const amount=Number(value);
 if(!Number.isFinite(amount))return "$0";
 return new Intl.NumberFormat("en-US",{
  style:"currency",
  currency:"USD",
  minimumFractionDigits:Number.isInteger(amount)?0:2,
  maximumFractionDigits:2
 }).format(amount);
};

function Menu(){
 const [menus,setMenus]=useState([]);
 const [selectedMenuId,setSelectedMenuId]=useState("");
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");

 useEffect(()=>{
  let active=true;

  const loadMenus=async()=>{
   try{
    setLoading(true);
    setError("");
    const response=await fetch("/api/menus/public");
    const data=await response.json().catch(()=>null);
    if(!response.ok)throw new Error(data?.message||"Failed to load the menus");

    const loadedMenus=Array.isArray(data)
     ?data
     :Array.isArray(data?.menus)
      ?data.menus
      :Array.isArray(data?.data)
       ?data.data
       :data?.menu
        ?[data.menu]
        :[];

    if(active){
     setMenus(loadedMenus);
     setSelectedMenuId("");
    }
   }catch(loadError){
    if(active)setError(loadError.message||"Failed to load the menus");
   }finally{
    if(active)setLoading(false);
   }
  };

  loadMenus();

  return()=>{active=false;};
 },[]);

 const menu=selectedMenuId?menus.find(menu=>String(menu._id||menu.id||menu.name||menu.title||menu.eyebrow||"")===selectedMenuId)||null:null;
 const sections=menu&&Array.isArray(menu.sections)?menu.sections:[];

 return(
  <main className="menu-page">
   <header className="menu-header">
    <div className="menu-header-title">
     <p className="menu-eyebrow">Fresh Roots Flavor Kitchen</p>
     <h1 className="menu-title">Menu</h1>
    </div>
    <div className="menu-header-details">
     <div className="menu-selector">
      <label className="menu-selector-label" htmlFor="menuCuisineSelect">Choose Menu</label>
      <select className="menu-cuisine-select" id="menuCuisineSelect" value={selectedMenuId} onChange={event=>setSelectedMenuId(event.target.value)} disabled={loading||menus.length===0}>
       <option value="">Select a menu</option>
       {menus.map(menuOption=>(
        <option key={menuOption._id||menuOption.id||menuOption.name||menuOption.title||menuOption.eyebrow} value={String(menuOption._id||menuOption.id||menuOption.name||menuOption.title||menuOption.eyebrow||"")}>{menuOption.eyebrow||menuOption.cuisine||menuOption.name||menuOption.title||"Menu"}</option>
       ))}
      </select>
     </div>
     {menu&&(
      <>
       <h2 className="menu-cuisine">{menu.eyebrow||menu.cuisine||menu.name||menu.title||"Menu"}</h2>
       <p className="menu-sub">{menu.description||""}</p>
      </>
     )}
    </div>
   </header>
   <div className="menu-content">
    {loading&&<Alert variant="info" className="menu-state">Loading menus...</Alert>}
    {!loading&&error&&<Alert variant="danger" className="menu-state">{error}</Alert>}
    {!loading&&!error&&menus.length===0&&<Alert variant="warning" className="menu-state">No menus are available right now.</Alert>}
    {!loading&&!error&&menus.length>0&&!menu&&<Alert variant="info" className="menu-state">Choose a menu above to view its categories and menu items.</Alert>}
    {!loading&&!error&&menu&&sections.length===0&&<Alert variant="warning" className="menu-state">This menu does not have any categories or menu items available right now.</Alert>}
    {!loading&&!error&&menu&&sections.map((section,index)=>(
     <section key={section._id||section.title} className={`menu-section menu-section-${(index%4)+1}`}>
      <header className="menu-section-header">
       <div className="menu-section-number">{String(index+1).padStart(2,"0")}</div>
       <h2 className="menu-section-title">{section.title}</h2>
      </header>
      <div className="menu-items">
       {(section.items||[]).map(item=>(
        <article key={item._id||item.name} className="menu-item">
         <img className="menu-item-thumbnail" src={item.image||placeholderImage} alt={item.image?item.name:"Menu item placeholder"}/>
         <div className="menu-item-content">
          <div className="menu-item-top">
           <h3>{item.name}</h3>
           <span className="menu-item-price">{formatPrice(item.price)}</span>
          </div>
          <p>{item.description}</p>
         </div>
        </article>
       ))}
      </div>
     </section>
    ))}
   </div>
  </main>
 );
}

export default Menu;
