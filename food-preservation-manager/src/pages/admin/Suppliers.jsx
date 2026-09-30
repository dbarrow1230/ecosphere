import ResourceCrudPage from "./ResourceCrudPage.jsx";

const cleanId=value=>value||null;

const initialForm={
 name:"",
 code:"",
 type:"",
 contact:{contactName:"",email:"",phone:""},
 address:{street:"",city:"",state:"",country:"",zip:""},
 isActive:true,
 notes:""
};

const fields=[
 {name:"name",label:"Supplier Name",required:true},
 {name:"code",label:"Code"},
 {name:"type",label:"Type"},
 {name:"contact.contactName",label:"Contact Name"},
 {name:"contact.email",label:"Email",type:"email"},
 {name:"contact.phone",label:"Phone"},
 {name:"address.street",label:"Street"},
 {name:"address.city",label:"City"},
 {name:"address.state",label:"State",type:"select",optionsKey:"states",labelFields:["name","code"],placeholder:"Select state"},
 {name:"address.country",label:"Country",type:"select",optionsKey:"countries",labelFields:["name","code"],placeholder:"Select country"},
 {name:"address.zip",label:"Zip"},
 {name:"isActive",label:"Active",type:"checkbox"},
 {name:"notes",label:"Notes",type:"textarea"}
];

const columns=[
 {path:"name",label:"Supplier"},
 {path:"code",label:"Code"},
 {path:"type",label:"Type"},
 {path:"contact.email",label:"Email"},
 {path:"isActive",label:"Active"}
];

const formFromItem=item=>({
 name:item.name||"",
 code:item.code||"",
 type:item.type||"",
 contact:{contactName:item.contact?.contactName||"",email:item.contact?.email||"",phone:item.contact?.phone||""},
 address:{
  street:item.address?.street||"",
  city:item.address?.city||"",
  state:item.address?.state?._id||item.address?.state||"",
  country:item.address?.country?._id||item.address?.country||"",
  zip:item.address?.zip||""
 },
 isActive:item.isActive!==false,
 notes:item.notes||""
});

const buildPayload=form=>({
 ...form,
 address:{...form.address,state:cleanId(form.address.state),country:cleanId(form.address.country)}
});

export default function Suppliers(){
 return(
  <ResourceCrudPage
   title="Suppliers"
   subtitle="Manage farms, distributors, wholesale, retail, and other supply contacts."
   apiPath="/api/suppliers"
   arrayKey="suppliers"
   initialForm={initialForm}
   fields={fields}
   columns={columns}
   optionLoaders={{states:{url:"/api/states",arrayKey:"states"},countries:{url:"/api/countries",arrayKey:"countries"}}}
   formFromItem={formFromItem}
   buildPayload={buildPayload}
   getRowTitle={item=>item.name}
  />
 );
}
