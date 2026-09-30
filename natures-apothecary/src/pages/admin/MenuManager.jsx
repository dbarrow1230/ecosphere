// src/pages/admin/MenuManager.jsx
import {useState,useEffect,useMemo} from "react";
import {Container,Row,Col,Card,Form,Button,Table,Badge} from "react-bootstrap";
import Alert from "../../components/PopupAlert.jsx";

function MenuManager(){

 const initialFormData={
  name:"",
  description:"",
  category:"",
  pricePerGuest:"",
  minimumGuests:"",
  maximumGuests:"",
  status:"draft",
  notes:""
 };

 const [menus,setMenus]=useState([]);
 const [formData,setFormData]=useState(initialFormData);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [selectedMenu,setSelectedMenu]=useState(null);
 const [isEditing,setIsEditing]=useState(false);
 const [isAdding,setIsAdding]=useState(false);
 const [alert,setAlert]=useState({show:false,variant:"success",message:""});

 const normalizeStatus=value=>{
  const status=String(value||"").trim().toLowerCase();
  if(status==="active") return "active";
  if(status==="inactive") return "inactive";
  return "draft";
 };

 const statusLabel=status=>{
  const normalized=normalizeStatus(status);
  if(normalized==="active") return "Active";
  if(normalized==="inactive") return "Inactive";
  return "Draft";
 };

 const statusVariant=status=>{
  const normalized=normalizeStatus(status);
  if(normalized==="active") return "success";
  if(normalized==="draft") return "warning";
  return "secondary";
 };

 const formatMoney=value=>{
  if(value===null||value===undefined||value==="") return "0.00";
  if(typeof value==="object"&&value.$numberDecimal!==undefined) return Number(value.$numberDecimal).toFixed(2);
  const num=Number(value);
  if(Number.isNaN(num)) return "0.00";
  return num.toFixed(2);
 };

 const guestRange=menu=>{
  const min=menu.minimumGuests??0;
  const max=menu.maximumGuests??0;
  if(max>0) return `${min}-${max}`;
  return `${min}+`;
 };

 useEffect(()=>{
  const loadMenus=async()=>{
   try{
    setLoading(true);
    const res=await fetch("/api/menus");
    const data=await res.json();
    const menuList=Array.isArray(data?.menus)?data.menus:Array.isArray(data?.data)?data.data:Array.isArray(data)?data:[];
    setMenus(menuList);
   }catch(err){
    console.error("Error loading menus:",err);
    setMenus([]);
    setAlert({show:true,variant:"danger",message:"Failed to load menus."});
   }finally{
    setLoading(false);
   }
  };

  loadMenus();
 },[]);

 const handleChange=e=>{
  const {name,value}=e.target;
  if(name==="status"){
   setFormData(prev=>({...prev,status:normalizeStatus(value)}));
   return;
  }
  setFormData(prev=>({...prev,[name]:value}));
 };

 const resetForm=()=>{
  setFormData(initialFormData);
  setSelectedMenu(null);
  setIsEditing(false);
  setIsAdding(false);
 };

 const closeAlert=()=>{
  setAlert({show:false,variant:"success",message:""});
 };

 const handleAddMenu=()=>{
  setFormData(initialFormData);
  setSelectedMenu(null);
  setIsEditing(false);
  setIsAdding(true);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleViewMenu=menu=>{
  setSelectedMenu(menu);
  setIsEditing(false);
  setIsAdding(false);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleEditMenu=menu=>{
  setSelectedMenu(menu);
  setFormData({
   name:menu.name||"",
   description:menu.description||"",
   category:menu.category||"",
   pricePerGuest:typeof menu.pricePerGuest==="object"&&menu.pricePerGuest?.$numberDecimal!==undefined?menu.pricePerGuest.$numberDecimal:String(menu.pricePerGuest||""),
   minimumGuests:menu.minimumGuests??"",
   maximumGuests:menu.maximumGuests??"",
   status:normalizeStatus(menu.status),
   notes:menu.notes||""
  });
  setIsEditing(true);
  setIsAdding(false);
  closeAlert();
  window.scrollTo({top:0,behavior:"smooth"});
 };

 const handleDeleteMenu=async menuId=>{
  try{
   const confirmed=window.confirm("Are you sure you want to delete this menu?");
   if(!confirmed) return;

   closeAlert();

   const res=await fetch(`/api/menus/${menuId}`,{
    method:"DELETE"
   });

   const data=await res.json().catch(()=>null);

   if(res.ok){
    setMenus(prev=>prev.filter(menu=>menu._id!==menuId));
    if(selectedMenu?._id===menuId){
     resetForm();
    }
    setAlert({show:true,variant:"success",message:"Menu deleted successfully."});
   }else{
    setAlert({show:true,variant:"danger",message:data?.message||"Failed to delete menu."});
   }
  }catch(err){
   console.error("Error deleting menu:",err);
   setAlert({show:true,variant:"danger",message:"Error deleting menu."});
  }
 };

 const handleSubmit=async e=>{
  e.preventDefault();
  try{
   setSaving(true);
   closeAlert();

   const payload={
    name:formData.name,
    description:formData.description,
    category:formData.category,
    pricePerGuest:formData.pricePerGuest||"0",
    minimumGuests:Number(formData.minimumGuests||1),
    maximumGuests:Number(formData.maximumGuests||0),
    status:normalizeStatus(formData.status),
    notes:formData.notes
   };

   const url=isEditing&&selectedMenu?`/api/menus/${selectedMenu._id}`:"/api/menus";
   const method=isEditing&&selectedMenu?"PUT":"POST";

   const res=await fetch(url,{
    method,
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
   });

   const data=await res.json();
   const savedMenu=data?.menu||data?.data;

   if(res.ok&&savedMenu){
    if(isEditing&&selectedMenu){
     setMenus(prev=>prev.map(menu=>menu._id===savedMenu._id?savedMenu:menu));
     setSelectedMenu(savedMenu);
     setIsEditing(false);
     setAlert({show:true,variant:"success",message:"Menu updated successfully."});
    }else{
     setMenus(prev=>[savedMenu,...prev]);
     resetForm();
     setAlert({show:true,variant:"success",message:"Menu saved successfully."});
    }
   }else{
    setAlert({show:true,variant:"danger",message:data?.message||"Failed to save menu."});
   }
  }catch(err){
   console.error("Error saving menu:",err);
   setAlert({show:true,variant:"danger",message:"Error saving menu."});
  }finally{
   setSaving(false);
  }
 };

 const metrics=useMemo(()=>{
  return{
   total:menus.length,
   active:menus.filter(menu=>normalizeStatus(menu.status)==="active").length,
   drafts:menus.filter(menu=>normalizeStatus(menu.status)==="draft").length
  };
 },[menus]);

 return(
  <section className="menu-manager-page py-4">
   <Container fluid="lg">

    <Row className="g-4 mb-4">
     <Col lg={8}>
      <div>
       <p className="text-muted mb-2">Admin Menu Management</p>
       <h1 className="mb-2">Menu Manager</h1>
       <p className="text-muted mb-0">Create, update, and organize public-facing catering menus and packages.</p>
      </div>
     </Col>

     <Col lg={4}>
      <Card className="h-100">
       <Card.Body>
        <Row className="g-3 text-center">
         <Col xs={4}>
          <p className="text-muted mb-1">Total</p>
          <h3 className="mb-0">{metrics.total}</h3>
         </Col>
         <Col xs={4}>
          <p className="text-muted mb-1">Active</p>
          <h3 className="mb-0">{metrics.active}</h3>
         </Col>
         <Col xs={4}>
          <p className="text-muted mb-1">Drafts</p>
          <h3 className="mb-0">{metrics.drafts}</h3>
         </Col>
        </Row>
       </Card.Body>
      </Card>
     </Col>
    </Row>

    {alert.show&&(
     <Row className="mb-4">
      <Col lg={12}>
       <Alert variant={alert.variant} dismissible onClose={closeAlert} className="mb-0">
        {alert.message}
       </Alert>
      </Col>
     </Row>
    )}

    <Row className="g-4">
     <Col lg={4}>
      <Card>
       <Card.Body>

        {!selectedMenu&&!isEditing&&!isAdding&&(
         <>
          <h2 className="h4 mb-3">Menu Form</h2>

          <Form>
           <Form.Group className="mb-3" controlId="menuNameDisabled">
            <Form.Label>Menu Name</Form.Label>
            <Form.Control type="text" value="" placeholder="Menu name" disabled/>
           </Form.Group>

           <Form.Group className="mb-3" controlId="menuCategoryDisabled">
            <Form.Label>Category</Form.Label>
            <Form.Control type="text" value="" placeholder="Category" disabled/>
           </Form.Group>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="menuPriceDisabled">
              <Form.Label>Price Per Guest</Form.Label>
              <Form.Control type="text" value="" placeholder="0.00" disabled/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="menuGuestsDisabled">
              <Form.Label>Guest Range</Form.Label>
              <Form.Control type="text" value="" placeholder="10-50" disabled/>
             </Form.Group>
            </Col>
           </Row>

           <div className="d-grid">
            <Button type="button" variant="primary" onClick={handleAddMenu}>Add Menu</Button>
           </div>
          </Form>
         </>
        )}

        {isAdding&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">Create Menu</h2>
           <Button variant="outline-secondary" size="sm" onClick={resetForm}>Cancel</Button>
          </div>

          <Form onSubmit={handleSubmit}>
           <Form.Group className="mb-3" controlId="menuNameAdd">
            <Form.Label>Menu Name</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Menu name" required/>
           </Form.Group>

           <Form.Group className="mb-3" controlId="menuCategoryAdd">
            <Form.Label>Category</Form.Label>
            <Form.Select name="category" value={formData.category} onChange={handleChange} required>
             <option value="">Select category</option>
             <option value="Buffet">Buffet</option>
             <option value="Plated">Plated</option>
             <option value="Family Style">Family Style</option>
             <option value="Cocktail Reception">Cocktail Reception</option>
             <option value="Private Dining">Private Dining</option>
             <option value="Corporate">Corporate</option>
            </Form.Select>
           </Form.Group>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="menuPriceAdd">
              <Form.Label>Price Per Guest</Form.Label>
              <Form.Control type="number" step="0.01" name="pricePerGuest" value={formData.pricePerGuest} onChange={handleChange} placeholder="0.00" required/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="menuStatusAdd">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
               <option value="active">Active</option>
               <option value="draft">Draft</option>
               <option value="inactive">Inactive</option>
              </Form.Select>
             </Form.Group>
            </Col>
           </Row>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="menuMinGuestsAdd">
              <Form.Label>Minimum Guests</Form.Label>
              <Form.Control type="number" name="minimumGuests" value={formData.minimumGuests} onChange={handleChange} min="1" placeholder="10" required/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="menuMaxGuestsAdd">
              <Form.Label>Maximum Guests</Form.Label>
              <Form.Control type="number" name="maximumGuests" value={formData.maximumGuests} onChange={handleChange} min="0" placeholder="50"/>
             </Form.Group>
            </Col>
           </Row>

           <Form.Group className="mb-3" controlId="menuDescriptionAdd">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} placeholder="Short public menu description"/>
           </Form.Group>

           <Form.Group className="mb-4" controlId="menuNotesAdd">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={4} name="notes" value={formData.notes} onChange={handleChange} placeholder="Internal notes"/>
           </Form.Group>

           <div className="d-grid">
            <Button type="submit" variant="primary" disabled={saving}>{saving?"Saving...":"Save Menu"}</Button>
           </div>
          </Form>
         </>
        )}

        {selectedMenu&&!isEditing&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">View Menu</h2>
           <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={resetForm}>Close</Button>
            <Button variant="primary" size="sm" onClick={()=>handleEditMenu(selectedMenu)}>Edit Menu</Button>
            <Button variant="outline-danger" size="sm" onClick={()=>handleDeleteMenu(selectedMenu._id)}>Delete</Button>
           </div>
          </div>

          <div className="mb-3">
           <strong>Menu Name</strong>
           <div>{selectedMenu.name||"-"}</div>
          </div>

          <div className="mb-3">
           <strong>Category</strong>
           <div>{selectedMenu.category||"-"}</div>
          </div>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Price Per Guest</strong>
             <div>${formatMoney(selectedMenu.pricePerGuest)}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Status</strong>
             <div>
              <Badge bg={statusVariant(selectedMenu.status)}>
               {statusLabel(selectedMenu.status)}
              </Badge>
             </div>
            </div>
           </Col>
          </Row>

          <Row>
           <Col md={6}>
            <div className="mb-3">
             <strong>Minimum Guests</strong>
             <div>{selectedMenu.minimumGuests??"-"}</div>
            </div>
           </Col>

           <Col md={6}>
            <div className="mb-3">
             <strong>Maximum Guests</strong>
             <div>{selectedMenu.maximumGuests??"-"}</div>
            </div>
           </Col>
          </Row>

          <div className="mb-3">
           <strong>Description</strong>
           <div>{selectedMenu.description||"-"}</div>
          </div>

          <div className="mb-3">
           <strong>Items Linked</strong>
           <div>{Array.isArray(selectedMenu.items)?selectedMenu.items.length:0}</div>
          </div>

          <div className="mb-0">
           <strong>Notes</strong>
           <div>{selectedMenu.notes||"-"}</div>
          </div>
         </>
        )}

        {isEditing&&selectedMenu&&(
         <>
          <div className="d-flex justify-content-between align-items-center mb-3">
           <h2 className="h4 mb-0">Edit Menu</h2>
           <Button variant="outline-secondary" size="sm" onClick={()=>setIsEditing(false)}>Cancel</Button>
          </div>

          <Form onSubmit={handleSubmit}>
           <Form.Group className="mb-3" controlId="menuNameEdit">
            <Form.Label>Menu Name</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Menu name" required/>
           </Form.Group>

           <Form.Group className="mb-3" controlId="menuCategoryEdit">
            <Form.Label>Category</Form.Label>
            <Form.Select name="category" value={formData.category} onChange={handleChange} required>
             <option value="">Select category</option>
             <option value="Buffet">Buffet</option>
             <option value="Plated">Plated</option>
             <option value="Family Style">Family Style</option>
             <option value="Cocktail Reception">Cocktail Reception</option>
             <option value="Private Dining">Private Dining</option>
             <option value="Corporate">Corporate</option>
            </Form.Select>
           </Form.Group>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="menuPriceEdit">
              <Form.Label>Price Per Guest</Form.Label>
              <Form.Control type="number" step="0.01" name="pricePerGuest" value={formData.pricePerGuest} onChange={handleChange} placeholder="0.00" required/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="menuStatusEdit">
              <Form.Label>Status</Form.Label>
              <Form.Select name="status" value={formData.status} onChange={handleChange}>
               <option value="active">Active</option>
               <option value="draft">Draft</option>
               <option value="inactive">Inactive</option>
              </Form.Select>
             </Form.Group>
            </Col>
           </Row>

           <Row className="mb-3">
            <Col md={6}>
             <Form.Group controlId="menuMinGuestsEdit">
              <Form.Label>Minimum Guests</Form.Label>
              <Form.Control type="number" name="minimumGuests" value={formData.minimumGuests} onChange={handleChange} min="1" placeholder="10" required/>
             </Form.Group>
            </Col>

            <Col md={6}>
             <Form.Group controlId="menuMaxGuestsEdit">
              <Form.Label>Maximum Guests</Form.Label>
              <Form.Control type="number" name="maximumGuests" value={formData.maximumGuests} onChange={handleChange} min="0" placeholder="50"/>
             </Form.Group>
            </Col>
           </Row>

           <Form.Group className="mb-3" controlId="menuDescriptionEdit">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} placeholder="Short public menu description"/>
           </Form.Group>

           <Form.Group className="mb-4" controlId="menuNotesEdit">
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={4} name="notes" value={formData.notes} onChange={handleChange} placeholder="Internal notes"/>
           </Form.Group>

           <div className="d-grid">
            <Button type="submit" variant="primary" disabled={saving}>{saving?"Saving...":"Update Menu"}</Button>
           </div>
          </Form>
         </>
        )}

       </Card.Body>
      </Card>
     </Col>

     <Col lg={8}>
      <Card className="h-100">
       <Card.Body>
        <div className="d-flex align-items-center justify-content-between mb-3">
         <div>
          <h2 className="h4 mb-1">Menu List</h2>
          <p className="text-muted mb-0">Manage the menus shown on your public-facing menu page.</p>
         </div>
        </div>

        <div className="table-responsive">
         <Table hover className="align-middle mb-0">
          <thead>
           <tr>
            <th>Menu</th>
            <th>Category</th>
            <th>Guests</th>
            <th>Price</th>
            <th>Status</th>
           </tr>
          </thead>

          <tbody>
           {loading&&(
            <tr>
             <td colSpan="5" className="text-center text-muted py-4">Loading menus...</td>
            </tr>
           )}

           {!loading&&menus.length===0&&(
            <tr>
             <td colSpan="5" className="text-center text-muted py-4">No menus found.</td>
            </tr>
           )}

           {!loading&&menus.map(menu=>(
            <tr key={menu._id} onClick={()=>handleViewMenu(menu)} style={{cursor:"pointer"}} className={selectedMenu?._id===menu._id?"table-active":""}>
             <td>{menu.name}</td>
             <td>{menu.category||"-"}</td>
             <td>{guestRange(menu)}</td>
             <td>${formatMoney(menu.pricePerGuest)}</td>
             <td>
              <Badge bg={statusVariant(menu.status)}>
               {statusLabel(menu.status)}
              </Badge>
             </td>
            </tr>
           ))}
          </tbody>
         </Table>
        </div>
       </Card.Body>
      </Card>
     </Col>
    </Row>

   </Container>
  </section>
 );
}

export default MenuManager;