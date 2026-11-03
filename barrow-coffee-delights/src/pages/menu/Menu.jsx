import React from "react";
import "../../styles/menu.css";

function Menu(){

 const sections=[
  {
   title:"Small Plates",
   items:[
    {name:"Flying Fish Tataki",price:"$18",desc:"Seared flying fish, ponzu, cucumber, scotch bonnet oil."},
    {name:"Breadfruit Tempura",price:"$14",desc:"Crisp breadfruit, nori salt, yuzu dip."},
    {name:"Cassava Gyoza",price:"$16",desc:"Pan-seared dumplings, ginger, herbs, soy glaze."}
   ]
  },
  {
   title:"Bowls & Plates",
   items:[
    {name:"Miso Brown Stew Chicken",price:"$24",desc:"Slow braised chicken, miso depth, rice."},
    {name:"Teriyaki Jerk Salmon",price:"$28",desc:"Glazed salmon, jerk spice, greens."},
    {name:"Bajan Curry Katsu",price:"$23",desc:"Crispy cutlet, curry sauce, rice."}
   ]
  },
  
  {
   title:"Vegetable Forward",
   items:[
    {name:"Roasted Pumpkin Udon",price:"$20",desc:"Pumpkin, shiitake, coconut dashi."},
    {name:"Breadfruit Donburi",price:"$19",desc:"Soy mushrooms, greens, egg."}
   ]
  },
  {
 title:"Drinks",
 items:[
  {
   name:"Sorrel Yuzu Spritz",
   price:"$8",
   desc:"House sorrel, yuzu citrus, light sparkle, and fresh herbs."
  },
  {
   name:"Coconut Matcha Cooler",
   price:"$9",
   desc:"Chilled matcha with coconut water and a hint of cane."
  },
  {
   name:"Ginger Calamansi Fizz",
   price:"$8",
   desc:"Fresh ginger, calamansi, and sparkling water."
  },
  {
   name:"Roasted Barley & Spice Tea",
   price:"$6",
   desc:"Warm mugicha-style tea with island spice notes."
  },
  {
   name:"Tamarind Iced Tea",
   price:"$7",
   desc:"Tart tamarind, black tea, and subtle sweetness."
  }
 ]
}
 ];

 return(
  <main className="menu-page">
   <div className="menu-container">

    <header className="menu-header">
     <p className="menu-eyebrow">Bajan × Japanese</p>
     <h1 className="menu-title">Menu</h1>
     <p className="menu-sub">
      Clean technique. Bold island flavor. Fresh ingredients.
     </p>
    </header>

    {sections.map((section,i)=>(
     <section key={i} className="menu-section">

      <h2 className="menu-section-title">{section.title}</h2>

      <div className="menu-grid">
       {section.items.map((item,idx)=>(
        <div key={idx} className="menu-item">

         <div className="menu-item-top">
          <h3>{item.name}</h3>
          <span>{item.price}</span>
         </div>

         <p>{item.desc}</p>

        </div>
       ))}
      </div>

     </section>
    ))}

   </div>
  </main>
 );
}

export default Menu;