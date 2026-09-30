import {useCallback,useEffect,useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Col,Container,Form,Modal,Row,Table} from "react-bootstrap";
import SortedSelect from "../../components/SortedSelect.jsx";
import SortedList from "../../components/SortedList.jsx";
import "../../styles/HomeInventory.css";

const blankItem={
 name:"",
 brand:"",
 barcode:"",
 storageType:"pantry",
 category:"",
 location:"",
 quantity:"1",
 minimumQuantity:"0",
 parLevel:"0",
 unit:"each",
 cost:"0",
 purchaseDate:"",
 expirationDate:"",
 status:"active",
 shoppingList:false,
 notes:""
};

const storageTypes=[
 {value:"pantry",label:"Pantry"},
 {value:"fridge",label:"Fridge"},
 {value:"freezer",label:"Freezer"},
 {value:"household",label:"Household"}
];

const statuses=[
 {value:"active",label:"Active"},
 {value:"used",label:"Used"},
 {value:"expired",label:"Expired"},
 {value:"discarded",label:"Discarded"},
 {value:"needed",label:"Needed"}
];

const units=["each","box","bag","bottle","can","jar","pack","lb","oz","g","kg","gal","qt","fl oz"].map(unit=>({value:unit,label:unit}));

const toDateInput=value=>{
 if(!value)return "";
 const date=new Date(value);
 if(Number.isNaN(date.getTime()))return "";
 return date.toISOString().slice(0,10);
};

const getItemCategoryName=item=>item.category?.name||"Uncategorized";
const getItemLocationName=item=>item.location?.name||"Unassigned";

function HomeInventoryPage({mode="all",startAdding=false}){
 const [items,setItems]=useState([]);
 const [allItems,setAllItems]=useState([]);
 const [categories,setCategories]=useState([]);
 const [locations,setLocations]=useState([]);
 const [formData,setFormData]=useState(blankItem);
 const [selectedItem,setSelectedItem]=useState(null);
 const [isEditing,setIsEditing]=useState(false);
 const [isAdding,setIsAdding]=useState(startAdding);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [alert,setAlert]=useState(null);
 const [search,setSearch]=useState("");
 const [statusFilter,setStatusFilter]=useState("");
 const isShoppingList=mode==="shoppingList";

 const pageConfig={
  all:{title:"All Items",kicker:"Home Inventory",description:"Add, update, and review everything you keep at home."},
  pantry:{title:"Pantry",kicker:"Food Storage",description:"Track dry goods, canned items, staples, and shelf-stable supplies."},
  fridge:{title:"Fridge",kicker:"Cold Storage",description:"Track refrigerated groceries, leftovers, drinks, and perishables."},
  freezer:{title:"Freezer",kicker:"Frozen Storage",description:"Track frozen meals, ingredients, meats, vegetables, and long-term food storage."},
  household:{title:"Household Supplies",kicker:"Home Essentials",description:"Track cleaning products, toiletries, paper goods, tools, and other essentials."},
  expiring:{title:"Expiring Soon",kicker:"Time Sensitive",description:"Review food and supplies with upcoming expiration dates."},
  lowStock:{title:"Low Stock",kicker:"Needs Attention",description:"See items at or below their minimum quantity, with par levels shown for restocking."},
  shoppingList:{title:"Shopping List",kicker:"Restock & Replace",description:"Track items marked as needed, missing, or ready to restock."}
 }[mode]||{};

 const loadReferenceData=useCallback(async()=>{
  const [categoryRes,locationRes]=await Promise.all([
   fetch("/api/categories?isActive=true"),
   fetch("/api/locations?isActive=true")
  ]);

  const categoryData=await categoryRes.json();
  const locationData=await locationRes.json();

  setCategories(Array.isArray(categoryData?.categories)?categoryData.categories:[]);
  setLocations(Array.isArray(locationData?.locations)?locationData.locations:[]);
 },[]);

 const loadItems=useCallback(async()=>{
  setLoading(true);
  const params=new URLSearchParams();
  if(mode==="pantry")params.set("storageType","pantry");
  if(mode==="fridge")params.set("storageType","fridge");
  if(mode==="freezer")params.set("storageType","freezer");
  if(mode==="household")params.set("storageType","household");
  if(mode==="expiring")params.set("expiringDays","30");
  if(mode==="lowStock")params.set("lowStock","true");
  if(mode==="shoppingList")params.set("shoppingList","true");
  if(search.trim())params.set("search",search.trim());
  if(statusFilter)params.set("status",statusFilter);

  try{
   const res=await fetch(`/api/items${params.toString()?`?${params.toString()}`:""}`);
   const data=await res.json();
   setItems(Array.isArray(data?.items)?data.items:[]);
  }finally{
   setLoading(false);
  }
 },[mode,search,statusFilter]);

 const loadAllItems=useCallback(async()=>{
  if(!isShoppingList)return;
  const res=await fetch("/api/items");
  const data=await res.json();
  setAllItems(Array.isArray(data?.items)?data.items:[]);
 },[isShoppingList]);

 useEffect(()=>{
  let ignore=false;

  const load=async()=>{
   try{
    setLoading(true);
    await loadReferenceData();
   }catch(error){
    console.error("Failed to load home inventory",error);
    if(!ignore)setAlert({variant:"danger",message:"Failed to load home inventory."});
   }finally{
    if(!ignore)setLoading(false);
   }
  };

  load();

  return()=>{ignore=true;};
 },[loadReferenceData,mode]);

 useEffect(()=>{
  const timer=setTimeout(()=>{
   Promise.all([loadItems(),loadAllItems()]).catch(error=>{
    console.error("Failed to filter home inventory",error);
    setAlert({variant:"danger",message:"Failed to filter inventory."});
   });
  },250);

  return()=>clearTimeout(timer);
 },[loadAllItems,loadItems]);

 const metrics=useMemo(()=>{
  const now=new Date();
  const expiringThrough=new Date(now);
  expiringThrough.setDate(expiringThrough.getDate()+30);
  const lowItems=items.filter(item=>Number(item.minimumQuantity)>0&&Number(item.quantity)<=Number(item.minimumQuantity));
  const expiringSoonItems=items.filter(item=>{
   if(!item.expirationDate)return false;
   const date=new Date(item.expirationDate);
   return date>=now&&date<=expiringThrough;
  });
  const neededItems=items.filter(item=>item.shoppingList||item.status==="needed"||Number(item.quantity)===0);

  return{
   total:items.length,
   low:lowItems.length,
   expiring:expiringSoonItems.length,
   needed:neededItems.length,
   metricCards:[
    {
     key:"items",
     label:"Items",
     value:items.length,
     helper:"matching this view",
     empty:"No items in this view.",
     items:items.slice(0,5).map(item=>({
      key:item._id,
      name:item.name,
      meta:`qty ${item.quantity} ${item.unit||""} · min ${item.minimumQuantity||0} · par ${item.parLevel||0}`
     }))
    },
    {
     key:"low",
     label:"Low Stock",
     value:lowItems.length,
     helper:"at or below min",
     empty:"No low stock items.",
     items:lowItems.slice(0,5).map(item=>({
      key:item._id,
      name:item.name,
      meta:`${item.quantity} ${item.unit||""} left · min ${item.minimumQuantity||0} · par ${item.parLevel||0}`
     }))
    },
    {
     key:"expiring",
     label:"Expiring",
     value:expiringSoonItems.length,
     helper:"within 30 days",
     empty:"No expiring items.",
     items:expiringSoonItems.slice(0,5).map(item=>({
      key:item._id,
      name:item.name,
      meta:`Expires ${toDateInput(item.expirationDate)||"-"} · ${getItemLocationName(item)}`
     }))
    },
    {
     key:"needed",
     label:"Needed",
     value:neededItems.length,
     helper:"shopping list or empty",
     empty:"No needed items.",
     items:neededItems.slice(0,5).map(item=>({
      key:item._id,
      name:item.name,
      meta:`${getItemCategoryName(item)} · ${getItemLocationName(item)}`
     }))
    }
   ]
  };
 },[items]);

 const focusItems=useMemo(()=>{
  if(mode==="lowStock")return items.filter(item=>Number(item.minimumQuantity)>0&&Number(item.quantity)<=Number(item.minimumQuantity));
  if(mode==="expiring")return [...items].sort((a,b)=>new Date(a.expirationDate||"2999-01-01")-new Date(b.expirationDate||"2999-01-01"));
  if(mode==="shoppingList")return items.filter(item=>item.shoppingList||item.status==="needed"||Number(item.quantity)===0);
  return [];
 },[items,mode]);

 const showFocusPanel=["lowStock","expiring","shoppingList"].includes(mode);

 const shoppingListIds=useMemo(()=>new Set(items.map(item=>item._id)),[items]);

 const lowStockSuggestions=useMemo(()=>{
  if(!isShoppingList)return [];
  return allItems.filter(item=>!shoppingListIds.has(item._id)&&Number(item.minimumQuantity)>0&&Number(item.quantity)<=Number(item.minimumQuantity));
 },[allItems,isShoppingList,shoppingListIds]);

 const pantryAddCandidates=useMemo(()=>{
  if(!isShoppingList)return [];
  return allItems.filter(item=>!shoppingListIds.has(item._id)&&["pantry","fridge","freezer","household"].includes(item.storageType));
 },[allItems,isShoppingList,shoppingListIds]);

 const visibleCategories=useMemo(()=>{
  if(formData.storageType==="household")return categories.filter(category=>["all","household"].includes(category.type));
  return categories.filter(category=>["all","pantry","fridge","freezer"].includes(category.type));
 },[categories,formData.storageType]);

 const visibleLocations=useMemo(()=>{
  if(formData.storageType==="household")return locations;
  return locations.filter(location=>["pantry","fridge","freezer","cabinet","other"].includes(location.type));
 },[locations,formData.storageType]);

 const showAlert=(variant,message)=>setAlert({variant,message});
 const closeAlert=()=>setAlert(null);

 const handleChange=e=>{
  const {name,value,type,checked}=e.target;
  setFormData(prev=>({...prev,[name]:type==="checkbox"?checked:value}));
 };

 const resetForm=()=>{
  setFormData(blankItem);
  setSelectedItem(null);
  setIsEditing(false);
  setIsAdding(false);
 };

 const startAdd=()=>{
  const defaultStorage=["pantry","fridge","freezer","household"].includes(mode)?mode:"pantry";
  setFormData({...blankItem,storageType:defaultStorage,shoppingList:isShoppingList,status:isShoppingList?"needed":"active"});
  setSelectedItem(null);
  setIsEditing(false);
  setIsAdding(true);
  closeAlert();
 };

 const selectItem=item=>{
  setSelectedItem(item);
  setIsEditing(false);
  setIsAdding(false);
  closeAlert();
 };

 const editItem=item=>{
  setSelectedItem(item);
  setFormData({
   name:item.name||"",
   brand:item.brand||"",
   barcode:item.barcode||"",
   storageType:item.storageType||"pantry",
   category:item.category?._id||"",
   location:item.location?._id||"",
   quantity:String(item.quantity??0),
   minimumQuantity:String(item.minimumQuantity??0),
   parLevel:String(item.parLevel??0),
   unit:item.unit||"each",
   cost:String(item.cost??0),
   purchaseDate:toDateInput(item.purchaseDate),
   expirationDate:toDateInput(item.expirationDate),
   status:item.status||"active",
   shoppingList:Boolean(item.shoppingList),
   notes:item.notes||""
  });
  setIsEditing(true);
  setIsAdding(false);
  closeAlert();
 };

 const buildPayload=()=>({
  ...formData,
  category:formData.category||null,
  location:formData.location||null,
  quantity:Number(formData.quantity||0),
  minimumQuantity:Number(formData.minimumQuantity||0),
  parLevel:Number(formData.parLevel||0),
  cost:Number(formData.cost||0),
  purchaseDate:formData.purchaseDate||null,
  expirationDate:formData.expirationDate||null
 });

 const saveItem=async e=>{
  e.preventDefault();
  try{
   setSaving(true);
   closeAlert();

   const url=isEditing&&selectedItem?`/api/items/${selectedItem._id}`:"/api/items";
   const method=isEditing&&selectedItem?"PUT":"POST";
   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(buildPayload())
   });
   const data=await res.json();

   if(!res.ok)throw new Error(data?.message||"Failed to save item");

   const savedItem=data.item;
   setItems(prev=>isEditing?prev.map(item=>item._id===savedItem._id?savedItem:item):[savedItem,...prev]);
   if(isShoppingList)setAllItems(prev=>prev.some(item=>item._id===savedItem._id)?prev.map(item=>item._id===savedItem._id?savedItem:item):[savedItem,...prev]);
   setSelectedItem(savedItem);
   setIsEditing(false);
   setIsAdding(false);
   showAlert("success","Item saved.");
  }catch(error){
   showAlert("danger",error.message||"Failed to save item.");
  }finally{
   setSaving(false);
  }
 };

 const addExistingToShoppingList=async item=>{
  try{
   const payload={
    name:item.name,
    brand:item.brand||"",
    barcode:item.barcode||"",
    storageType:item.storageType||"pantry",
    category:item.category?._id||item.categoryId||null,
    location:item.location?._id||item.locationId||null,
    quantity:Number(item.quantity||0),
    minimumQuantity:Number(item.minimumQuantity||0),
    parLevel:Number(item.parLevel||0),
    unit:item.unit||"each",
    cost:Number(item.cost||0),
    purchaseDate:item.purchaseDate?toDateInput(item.purchaseDate):null,
    expirationDate:item.expirationDate?toDateInput(item.expirationDate):null,
    status:item.status||"active",
    shoppingList:true,
    notes:item.notes||""
   };

   const res=await fetch(`/api/items/${item._id}`,{
    method:"PUT",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });
   const data=await res.json();
   if(!res.ok)throw new Error(data?.message||"Failed to add item to shopping list");

   const savedItem=data.item;
   setItems(prev=>prev.some(current=>current._id===savedItem._id)?prev: [savedItem,...prev]);
   setAllItems(prev=>prev.map(current=>current._id===savedItem._id?savedItem:current));
   showAlert("success",`${savedItem.name} added to shopping list.`);
  }catch(error){
   showAlert("danger",error.message||"Failed to add item to shopping list.");
  }
 };

 const deleteItem=async item=>{
  if(!window.confirm(`Delete ${item.name}?`))return;

  try{
   const res=await fetch(`/api/items/${item._id}`,{method:"DELETE"});
   const data=await res.json().catch(()=>({}));
   if(!res.ok)throw new Error(data?.message||"Failed to delete item");

   setItems(prev=>prev.filter(current=>current._id!==item._id));
   resetForm();
   showAlert("success","Item deleted.");
  }catch(error){
   showAlert("danger",error.message||"Failed to delete item.");
  }
 };

 const statusBadge=item=>{
  if(Number(item.minimumQuantity)>0&&Number(item.quantity)<=Number(item.minimumQuantity))return <Badge bg="warning" text="dark">Low</Badge>;
  if(item.status==="needed")return <Badge bg="info">Needed</Badge>;
  if(item.status==="expired")return <Badge bg="danger">Expired</Badge>;
  if(item.status==="discarded")return <Badge bg="dark">Discarded</Badge>;
  if(item.status==="used")return <Badge bg="secondary">Used</Badge>;
  return <Badge bg="success">Active</Badge>;
 };

 return(
  <section className="home-inventory">
   <Container fluid="lg">
    <header className="home-inventory-header">
     <div>
      <p className="home-inventory-kicker">{pageConfig.kicker}</p>
      <h1>{pageConfig.title}</h1>
      <p>{pageConfig.description}</p>
     </div>
     <Button type="button" onClick={startAdd}>Add Item</Button>
    </header>

    {alert&&<Alert variant={alert.variant} dismissible onClose={closeAlert}>{alert.message}</Alert>}

    {showFocusPanel&&(
     <section className="focus-panel">
      <div className="focus-panel-head">
       <span>{mode==="lowStock"?"Items at or below min":mode==="expiring"?"Items expiring in the next 30 days":"Items marked for restock"}</span>
       <strong>{focusItems.length}</strong>
      </div>

      <SortedList
       items={focusItems}
       className="focus-list"
       getKey={item=>item._id}
       getLabel={item=>item.name}
       renderItem={item=>(
        <button type="button" className="focus-item" onClick={()=>selectItem(item)}>
         <span>
          <strong>{item.name}</strong>
         <small>{getItemCategoryName(item)} · {getItemLocationName(item)} · min {item.minimumQuantity||0} · par {item.parLevel||0}</small>
         </span>
         <span className="focus-item-meta">
          {mode==="expiring"?(toDateInput(item.expirationDate)||"No date"):`${item.quantity} ${item.unit}`}
         </span>
        </button>
       )}
      >
       <div className="focus-empty">No matching items right now.</div>
      </SortedList>
     </section>
    )}

    {isShoppingList&&(
     <section className="shopping-workflow">
      <Card>
       <Card.Body>
        <div className="form-head">
         <h2>Low Stock Suggestions</h2>
         <span className="subtext">{lowStockSuggestions.length} items</span>
        </div>
        <SortedList
         items={lowStockSuggestions}
         className="shopping-pick-list"
         getKey={item=>item._id}
         getLabel={item=>item.name}
         renderItem={item=>(
          <div className="shopping-pick-item">
           <span>
            <strong>{item.name}</strong>
            <small>{getItemCategoryName(item)} · qty {item.quantity} {item.unit} · min {item.minimumQuantity||0} · par {item.parLevel||0}</small>
           </span>
           <Button type="button" size="sm" onClick={()=>addExistingToShoppingList(item)}>Add</Button>
          </div>
         )}
        >
         <div className="focus-empty">No low stock suggestions right now.</div>
        </SortedList>
       </Card.Body>
      </Card>

      <Card>
       <Card.Body>
        <div className="form-head">
         <h2>Add Existing Item</h2>
         <span className="subtext">{pantryAddCandidates.length} available</span>
        </div>
        <SortedList
         items={pantryAddCandidates}
         className="shopping-pick-list"
         getKey={item=>item._id}
         getLabel={item=>item.name}
         renderItem={item=>(
          <div className="shopping-pick-item">
           <span>
            <strong>{item.name}</strong>
            <small>{item.storageType} · {getItemCategoryName(item)} · {getItemLocationName(item)}</small>
           </span>
           <Button type="button" size="sm" variant="outline-primary" onClick={()=>addExistingToShoppingList(item)}>Add</Button>
          </div>
         )}
        >
         <div className="focus-empty">No existing items available to add.</div>
        </SortedList>
       </Card.Body>
      </Card>
     </section>
    )}

    <section className="inventory-metrics">
     {metrics.metricCards.map(card=>(
      <article key={card.key} className="inventory-metric-card">
       <div className="inventory-metric-head">
        <span className="metric-label">{card.label}</span>
        <strong>{card.value}</strong>
       </div>
       <small>{card.helper}</small>

       <ul className="inventory-metric-items">
        {card.items.length?card.items.map(metricItem=>(
         <li key={metricItem.key}>
          <button type="button" onClick={()=>selectItem(items.find(current=>current._id===metricItem.key))}>
           <span>{metricItem.name}</span>
           <small>{metricItem.meta}</small>
          </button>
         </li>
        )):(
         <li className="inventory-metric-empty">{card.empty}</li>
        )}
       </ul>
      </article>
     ))}
    </section>

    <Row className="g-4">
     {!isShoppingList&&(
     <Col lg={4}>
      <Card>
       <Card.Body>
        {!isAdding&&!isEditing&&!selectedItem&&(
         <div className="empty-panel">
          <h2>Item Details</h2>
          <p>Select an item to view it, or add a new item to track quantity, location, and expiration.</p>
          <Button type="button" onClick={startAdd}>Add Item</Button>
         </div>
        )}

        {selectedItem&&!isEditing&&!isAdding&&(
         <div className="item-detail">
          <div className="form-head">
           <h2>{selectedItem.name}</h2>
           <Button type="button" variant="outline-secondary" size="sm" onClick={resetForm}>Close</Button>
          </div>
          <dl>
           <dt>Brand</dt><dd>{selectedItem.brand||"-"}</dd>
           <dt>Barcode</dt><dd>{selectedItem.barcode||"-"}</dd>
           <dt>Storage</dt><dd>{selectedItem.storageType}</dd>
           <dt>Category</dt><dd>{getItemCategoryName(selectedItem)}</dd>
           <dt>Location</dt><dd>{getItemLocationName(selectedItem)}</dd>
           <dt>Quantity</dt><dd>{selectedItem.quantity} {selectedItem.unit}</dd>
           <dt>Min</dt><dd>{selectedItem.minimumQuantity} {selectedItem.unit}</dd>
           <dt>Par Level</dt><dd>{selectedItem.parLevel??0} {selectedItem.unit}</dd>
           <dt>Cost</dt><dd>${Number(selectedItem.cost||0).toFixed(2)}</dd>
           <dt>Purchase Date</dt><dd>{toDateInput(selectedItem.purchaseDate)||"-"}</dd>
           <dt>Expiration Date</dt><dd>{toDateInput(selectedItem.expirationDate)||"-"}</dd>
           <dt>Status</dt><dd>{selectedItem.status}</dd>
           <dt>Shopping List</dt><dd>{selectedItem.shoppingList?"Yes":"No"}</dd>
           <dt>Notes</dt><dd>{selectedItem.notes||"-"}</dd>
          </dl>
          <div className="detail-actions">
           <Button type="button" onClick={()=>editItem(selectedItem)}>Edit</Button>
           <Button type="button" variant="outline-danger" onClick={()=>deleteItem(selectedItem)}>Delete</Button>
          </div>
         </div>
        )}
       </Card.Body>
      </Card>
     </Col>
     )}

     <Col lg={isShoppingList?12:8}>
      <Card>
       <Card.Body>
        <div className="list-tools">
         <Form.Control value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search inventory"/>
         <SortedSelect value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} options={statuses} placeholder="All statuses"/>
        </div>

        <div className="table-responsive">
         <Table hover className="align-middle mb-0">
          <thead>
           <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Location</th>
            <th>Qty</th>
            <th>Min</th>
            <th>Par</th>
            <th>Expires</th>
            <th>Status</th>
           </tr>
          </thead>
          <SortedList
           items={loading?[]:items}
           as="tbody"
           wrapItems={false}
           getKey={item=>item._id}
           getLabel={item=>item.name}
           renderItem={item=>(
            <tr onClick={()=>selectItem(item)} className={selectedItem?._id===item._id?"table-active":""}>
             <td>
              <strong>{item.name}</strong>
              {item.brand&&<span className="subtext">{item.brand}</span>}
             </td>
             <td>{getItemCategoryName(item)}</td>
             <td>{getItemLocationName(item)}</td>
             <td>{item.quantity} {item.unit}</td>
             <td>{item.minimumQuantity??0} {item.unit}</td>
             <td>{item.parLevel??0} {item.unit}</td>
             <td>{toDateInput(item.expirationDate)||"-"}</td>
             <td>{statusBadge(item)}</td>
            </tr>
           )}
          >
           {loading&&<tr><td colSpan="8" className="text-center text-muted py-4">Loading items...</td></tr>}
           {!loading&&items.length===0&&<tr><td colSpan="8" className="text-center text-muted py-4">No items found.</td></tr>}
          </SortedList>
         </Table>
        </div>
       </Card.Body>
      </Card>
     </Col>
   </Row>

   <Modal show={!isShoppingList&&(isAdding||isEditing)} onHide={resetForm} centered size="lg" backdrop="static">
    <Form onSubmit={saveItem}>
     <Modal.Header closeButton>
      <Modal.Title>{isEditing?"Edit Item":"Add Item"}</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <Row className="g-3">
       <Col md={8}>
        <Form.Group>
         <Form.Label>Name</Form.Label>
         <Form.Control name="name" value={formData.name} onChange={handleChange} required/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Storage Type</Form.Label>
         <SortedSelect name="storageType" value={formData.storageType} onChange={handleChange} options={storageTypes} includePlaceholder={false}/>
        </Form.Group>
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label>Brand</Form.Label>
         <Form.Control name="brand" value={formData.brand} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label>Barcode</Form.Label>
         <Form.Control name="barcode" value={formData.barcode} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label>Category</Form.Label>
         <SortedSelect name="category" value={formData.category} onChange={handleChange} options={visibleCategories} getValue={item=>item._id} getLabel={item=>item.name} placeholder="Select category"/>
        </Form.Group>
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label>Location</Form.Label>
         <SortedSelect name="location" value={formData.location} onChange={handleChange} options={visibleLocations} getValue={item=>item._id} getLabel={item=>item.name} placeholder="Select location"/>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>Quantity</Form.Label>
         <Form.Control type="number" min="0" name="quantity" value={formData.quantity} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>Min</Form.Label>
         <Form.Control type="number" min="0" name="minimumQuantity" value={formData.minimumQuantity} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>Par Level</Form.Label>
         <Form.Control type="number" min="0" name="parLevel" value={formData.parLevel} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>Unit</Form.Label>
         <SortedSelect name="unit" value={formData.unit} onChange={handleChange} options={units} includePlaceholder={false}/>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>Cost</Form.Label>
         <Form.Control type="number" min="0" step="0.01" name="cost" value={formData.cost} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>Purchase Date</Form.Label>
         <Form.Control type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>Expiration Date</Form.Label>
         <Form.Control type="date" name="expirationDate" value={formData.expirationDate} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={3}>
        <Form.Group>
         <Form.Label>Status</Form.Label>
         <SortedSelect name="status" value={formData.status} onChange={handleChange} options={statuses} includePlaceholder={false}/>
        </Form.Group>
       </Col>
       <Col xs={12}>
        <Form.Check name="shoppingList" checked={formData.shoppingList} onChange={handleChange} label="Add to shopping list"/>
       </Col>
       <Col xs={12}>
        <Form.Group>
         <Form.Label>Notes</Form.Label>
         <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange}/>
        </Form.Group>
       </Col>
      </Row>
     </Modal.Body>
     <Modal.Footer>
      <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
      <Button type="submit" disabled={saving}>{saving?"Saving...":isEditing?"Update Item":"Save Item"}</Button>
     </Modal.Footer>
    </Form>
   </Modal>

   <Modal show={isShoppingList&&isAdding} onHide={resetForm} centered size="lg" backdrop="static">
    <Form onSubmit={saveItem}>
     <Modal.Header closeButton>
      <Modal.Title>Add Shopping List Item</Modal.Title>
     </Modal.Header>
     <Modal.Body>
      <Row className="g-3">
       <Col md={8}>
        <Form.Group>
         <Form.Label>Name</Form.Label>
         <Form.Control name="name" value={formData.name} onChange={handleChange} required/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Storage Type</Form.Label>
         <SortedSelect name="storageType" value={formData.storageType} onChange={handleChange} options={storageTypes} includePlaceholder={false}/>
        </Form.Group>
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label>Category</Form.Label>
         <SortedSelect name="category" value={formData.category} onChange={handleChange} options={visibleCategories} getValue={item=>item._id} getLabel={item=>item.name} placeholder="Select category"/>
        </Form.Group>
       </Col>
       <Col md={6}>
        <Form.Group>
         <Form.Label>Location</Form.Label>
         <SortedSelect name="location" value={formData.location} onChange={handleChange} options={visibleLocations} getValue={item=>item._id} getLabel={item=>item.name} placeholder="Select location"/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Quantity Needed</Form.Label>
         <Form.Control type="number" min="0" name="quantity" value={formData.quantity} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Unit</Form.Label>
         <SortedSelect name="unit" value={formData.unit} onChange={handleChange} options={units} includePlaceholder={false}/>
        </Form.Group>
       </Col>
       <Col md={4}>
        <Form.Group>
         <Form.Label>Cost</Form.Label>
         <Form.Control type="number" min="0" step="0.01" name="cost" value={formData.cost} onChange={handleChange}/>
        </Form.Group>
       </Col>
       <Col xs={12}>
        <Form.Group>
         <Form.Label>Notes</Form.Label>
         <Form.Control as="textarea" rows={3} name="notes" value={formData.notes} onChange={handleChange}/>
        </Form.Group>
       </Col>
      </Row>
     </Modal.Body>
     <Modal.Footer>
      <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
      <Button type="submit" disabled={saving}>{saving?"Saving...":"Add to Shopping List"}</Button>
     </Modal.Footer>
    </Form>
   </Modal>
   </Container>
  </section>
 );
}

export default HomeInventoryPage;
