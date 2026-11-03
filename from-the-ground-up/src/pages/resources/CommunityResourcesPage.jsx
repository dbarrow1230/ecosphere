import {useEffect,useMemo,useState} from "react";
import {Accordion,Alert,Badge,Button,Card,Col,Container,Form,Row,Spinner} from "react-bootstrap";
import axios from "axios";

function CommunityResourcesPage(){

 const [categories,setCategories]=useState([]);
 const [resources,setResources]=useState([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const [selectedSection,setSelectedSection]=useState("");

 const getId=(value)=>{
  if(!value)return "";
  if(typeof value==="string")return value;
  if(value.$oid)return value.$oid;
  if(value._id){
   if(typeof value._id==="string")return value._id;
   if(value._id?.$oid)return value._id.$oid;
  }
  return "";
 };

 const getLabel=(value)=>{
  if(!value)return "";
  if(typeof value==="string")return value;
  if(value.name)return value.name;
  return "";
 };

 const getRefName=(val)=>{
  if(!val)return "";
  if(typeof val==="string")return val;
  if(typeof val==="object"){
   return val.name||val.title||val.code||val.abbreviation||"";
  }
  return "";
 };

 const splitTransitValues=(value)=>{
  if(!value)return [];
  if(Array.isArray(value)){
   return value.flatMap(item=>splitTransitValues(item));
  }
  return String(value)
   .split(/[,;/|]/)
   .map(item=>item.trim())
   .filter(Boolean);
 };

 const getTrainBadgeStyle=(line)=>{
  const value=String(line||"").trim().toUpperCase();

  const map={
   "1":{backgroundColor:"#EE352E",color:"#FFFFFF"},
   "2":{backgroundColor:"#EE352E",color:"#FFFFFF"},
   "3":{backgroundColor:"#EE352E",color:"#FFFFFF"},
   "4":{backgroundColor:"#00933C",color:"#FFFFFF"},
   "5":{backgroundColor:"#00933C",color:"#FFFFFF"},
   "6":{backgroundColor:"#00933C",color:"#FFFFFF"},
   "6X":{backgroundColor:"#00933C",color:"#FFFFFF"},
   "7":{backgroundColor:"#B933AD",color:"#FFFFFF"},
   "7X":{backgroundColor:"#B933AD",color:"#FFFFFF"},
   "A":{backgroundColor:"#0039A6",color:"#FFFFFF"},
   "C":{backgroundColor:"#0039A6",color:"#FFFFFF"},
   "E":{backgroundColor:"#0039A6",color:"#FFFFFF"},
   "B":{backgroundColor:"#FF6319",color:"#FFFFFF"},
   "D":{backgroundColor:"#FF6319",color:"#FFFFFF"},
   "F":{backgroundColor:"#FF6319",color:"#FFFFFF"},
   "M":{backgroundColor:"#FF6319",color:"#FFFFFF"},
   "G":{backgroundColor:"#6CBE45",color:"#FFFFFF"},
   "J":{backgroundColor:"#996633",color:"#FFFFFF"},
   "Z":{backgroundColor:"#996633",color:"#FFFFFF"},
   "L":{backgroundColor:"#A7A9AC",color:"#000000"},
   "N":{backgroundColor:"#FCCC0A",color:"#000000"},
   "Q":{backgroundColor:"#FCCC0A",color:"#000000"},
   "R":{backgroundColor:"#FCCC0A",color:"#000000"},
   "W":{backgroundColor:"#FCCC0A",color:"#000000"},
   "S":{backgroundColor:"#808183",color:"#FFFFFF"},
   "SR":{backgroundColor:"#808183",color:"#FFFFFF"},
   "SI":{backgroundColor:"#0039A6",color:"#FFFFFF"},
   "FS":{backgroundColor:"#808183",color:"#FFFFFF"},
   "GS":{backgroundColor:"#808183",color:"#FFFFFF"},
   "H":{backgroundColor:"#808183",color:"#FFFFFF"},
   "T":{backgroundColor:"#00ADD0",color:"#FFFFFF"}
  };

  return map[value]||{backgroundColor:"#0d6efd",color:"#FFFFFF"};
 };

 const isTopLevel=(category)=>{
  return !category?.parentCategory;
 };

 const getParentId=(category)=>{
  return getId(category?.parentCategory);
 };

 const normalizeResource=(item)=>{
  const categoryId=getId(item?.category);
  const categoryName=getLabel(item?.category);
  const subcategoryIds=Array.isArray(item?.subcategories)?item.subcategories.map(getId).filter(Boolean):[];

  return{
   ...item,
   _id:getId(item?._id)||item?._id,
   categoryId,
   categoryName,
   subcategoryIds
  };
 };

 const fetchData=async()=>{
  try{
   setLoading(true);
   setError("");

   const [categoriesRes,resourcesRes]=await Promise.all([
    axios.get("/api/resource-categories"),
    axios.get("/api/community-resources")
   ]);

   const categoryData=Array.isArray(categoriesRes.data)?categoriesRes.data:[];
   const resourceData=Array.isArray(resourcesRes.data)?resourcesRes.data:[];
   setCategories(categoryData);
   setResources(resourceData.map(normalizeResource));
  }catch(err){
   console.error(err);
   setError("Unable to load community resources.");
  }finally{
   setLoading(false);
  }
 };

 useEffect(()=>{
  fetchData();
 },[]);

 const topLevelSections=useMemo(()=>{
  return categories
   .filter(isTopLevel)
   .sort((a,b)=>(a.order||0)-(b.order||0)||String(a.name||"").localeCompare(String(b.name||"")));
 },[categories]);

 const categoryMap=useMemo(()=>{
  return categories.reduce((acc,item)=>{
   acc[getId(item._id)||getId(item)]=item;
   return acc;
  },{});
 },[categories]);

 const childCategoriesByParent=useMemo(()=>{
  return categories.reduce((acc,item)=>{
   const parentId=getParentId(item);
   if(!parentId)return acc;
   if(!acc[parentId])acc[parentId]=[];
   acc[parentId].push(item);
   return acc;
  },{});
 },[categories]);

 const resourcesBySection=useMemo(()=>{
  const map={};

  topLevelSections.forEach(section=>{
   const sectionId=getId(section._id);
   const childIds=(childCategoriesByParent[sectionId]||[]).map(item=>getId(item._id));
   const allowedIds=[sectionId,...childIds];

   map[sectionId]=resources.filter(resource=>{
    const text=[
     resource.name,
     resource.organization,
     resource.description,
     ...(resource.services||[]),
     resource?.address?.fullText,
     resource?.address?.address1,
     resource?.address?.address2,
     resource?.address?.crossStreets,
     resource?.contact?.phone,
     resource?.contact?.website,
     ...(resource?.transportation?.trains||[]),
     ...(resource?.transportation?.buses||[])
    ].filter(Boolean).join(" ").toLowerCase();

    const matchesSearch=!search.trim()||text.includes(search.trim().toLowerCase());
    const matchesSection=!selectedSection||selectedSection===sectionId;
    const matchesCategory=allowedIds.includes(resource.categoryId)||resource.subcategoryIds.some(id=>allowedIds.includes(id));
    return matchesSearch&&matchesSection&&matchesCategory;
   });
  });

  return map;
 },[topLevelSections,childCategoriesByParent,resources,search,selectedSection]);

 const renderSchedule=(schedule)=>{
  if(!Array.isArray(schedule)||!schedule.length)return null;
  return schedule.map((item,index)=>(
   <div key={`${item.dayLabel||"day"}-${index}`} className="small mb-1">
    <strong>{item.dayLabel||"Hours"}:</strong>{" "}
    {item.timeText||[item.startTime,item.endTime].filter(Boolean).join(" - ")||"N/A"}
    {item.notes?` — ${item.notes}`:""}
   </div>
  ));
 };

 const renderServices=(services)=>{
  if(!Array.isArray(services)||!services.length)return null;
  return(
   <div className="d-flex flex-wrap gap-2 mt-2">
    {services.map((service,index)=>(
     <Badge bg="secondary" key={`${service}-${index}`}>{service}</Badge>
    ))}
   </div>
  );
 };

 return(
  <Container className="py-4">
   <Row className="mb-4">
    <Col>
     <h1 className="mb-2">Community Resources</h1>
     <p className="text-muted mb-0">Find food, drop-in centers, shelter, medical, legal, and other support services.</p>
    </Col>
   </Row>

   <Card className="mb-4 shadow-sm">
    <Card.Body>
     <Row className="g-3">
      <Col md={8}>
       <Form.Group>
        <Form.Label>Search</Form.Label>
        <Form.Control
         value={search}
         onChange={(e)=>setSearch(e.target.value)}
         placeholder="Search by name, service, organization, or address"
        />
       </Form.Group>
      </Col>
      <Col md={4}>
       <Form.Group>
        <Form.Label>Section</Form.Label>
        <Form.Select value={selectedSection} onChange={(e)=>setSelectedSection(e.target.value)}>
         <option value="">All Sections</option>
         {topLevelSections.map(section=>(
          <option key={getId(section._id)} value={getId(section._id)}>{section.name}</option>
         ))}
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>
    </Card.Body>
   </Card>

   {loading?(
    <div className="text-center py-5">
     <Spinner animation="border"/>
    </div>
   ):error?(
    <Alert variant="danger">{error}</Alert>
   ):(
    <Accordion alwaysOpen defaultActiveKey={topLevelSections.map(section=>getId(section._id))}>
     {topLevelSections
      .filter(section=>!selectedSection||getId(section._id)===selectedSection)
      .map(section=>{
      const sectionId=getId(section._id);
      const sectionResources=resourcesBySection[sectionId]||[];
      const childCategories=(childCategoriesByParent[sectionId]||[]).sort((a,b)=>(a.order||0)-(b.order||0)||String(a.name||"").localeCompare(String(b.name||"")));

      return(
       <Accordion.Item eventKey={sectionId} key={sectionId}>
        <Accordion.Header>
         <div className="d-flex align-items-center gap-2">
          <span>{section.name}</span>
          <Badge bg="dark">{sectionResources.length}</Badge>
         </div>
        </Accordion.Header>
        <Accordion.Body>
         {section.description?<p className="text-muted">{section.description}</p>:null}

         {childCategories.length?(
          <div className="d-flex flex-wrap gap-2 mb-3">
           {childCategories.map(child=>(
            <Badge bg="light" text="dark" key={getId(child._id)}>{child.name}</Badge>
           ))}
          </div>
         ):null}

         {!sectionResources.length?(
          <Alert variant="light" className="mb-0">No resources found in this section.</Alert>
         ):(
          <Row className="g-3">
           {sectionResources.map(resource=>{
            const resourceCategory=categoryMap[resource.categoryId];
            const stateName=getRefName(resource?.address?.state);
            const countryName=getRefName(resource?.address?.country);
            const countyName=getRefName(resource?.address?.county);
            const boroughName=getRefName(resource?.address?.borough);
            const trainLines=splitTransitValues(resource?.transportation?.trains);
            const busLines=splitTransitValues(resource?.transportation?.buses);

            return(
             <Col lg={6} key={resource._id}>
              <Card className="h-100 shadow-sm">
               <Card.Body>
                <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                 <div>
                  <Card.Title className="mb-1">{resource.name}</Card.Title>
                  {resource.organization?<div className="text-muted small">{resource.organization}</div>:null}
                 </div>
                 {resourceCategory?.name?<Badge bg="primary">{resourceCategory.name}</Badge>:null}
                </div>

                {resource.description?<Card.Text>{resource.description}</Card.Text>:null}

                {resource?.address?(
                 <div className="mb-2">
                  <strong>Address:</strong>
                  <div>{resource?.address?.address1||"—"}</div>
                  {resource?.address?.address2?<div>{resource.address.address2}</div>:null}

                  <div>
                   {[
                    resource?.address?.city,
                    stateName,
                    resource?.address?.postalCode
                   ].filter(Boolean).join(", ")||"—"}
                  </div>

                  {boroughName?<div><strong>Borough:</strong> {boroughName}</div>:null}
                  {countyName?<div><strong>County:</strong> {countyName}</div>:null}
                  {countryName?<div><strong>Country:</strong> {countryName}</div>:null}
                  {resource?.address?.crossStreets?<div><strong>Cross Streets:</strong> {resource.address.crossStreets}</div>:null}

                  {trainLines.length>0?(
                   <div className="mt-1">
                    <strong>Trains:</strong>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                     {trainLines.map((line,index)=>(
                      <Badge
                       key={`train-${line}-${index}`}
                       style={getTrainBadgeStyle(line)}
                       className="border-0"
                      >
                       {line}
                      </Badge>
                     ))}
                    </div>
                   </div>
                  ):null}

                  {busLines.length>0?(
                   <div className="mt-1">
                    <strong>Buses:</strong>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                     {busLines.map((line,index)=>(
                      <Badge key={`bus-${line}-${index}`} bg="success">
                       {line}
                      </Badge>
                     ))}
                    </div>
                   </div>
                  ):null}
                 </div>
                ):null}

                {resource?.contact?.phone?(
                 <div className="mb-2">
                  <strong>Phone:</strong> {resource.contact.phone}
                 </div>
                ):null}

                {resource?.contact?.website?(
                 <div className="mb-2">
                  <strong>Website:</strong>{" "}
                  <a href={resource.contact.website} target="_blank" rel="noreferrer">{resource.contact.website}</a>
                 </div>
                ):null}

                {resource.eligibility?(
                 <div className="mb-2">
                  <strong>Eligibility:</strong> {resource.eligibility}
                 </div>
                ):null}

                {resource.requirements?(
                 <div className="mb-2">
                  <strong>Requirements:</strong> {resource.requirements}
                 </div>
                ):null}

                {resource.intakeInstructions?(
                 <div className="mb-2">
                  <strong>Intake:</strong> {resource.intakeInstructions}
                 </div>
                ):null}

                {renderSchedule(resource.schedule)}
                {renderServices(resource.services)}

                <div className="d-flex flex-wrap gap-2 mt-3">
                 {resource.isWalkIn?<Badge bg="success">Walk-In</Badge>:null}
                 {resource.appointmentRequired?<Badge bg="warning" text="dark">Appointment Required</Badge>:null}
                 {resource.idRequired?<Badge bg="danger">ID Required</Badge>:null}
                 {resource.is24Hours?<Badge bg="info">24 Hours</Badge>:null}
                 {resource.isFamilyFriendly?<Badge bg="secondary">Family Friendly</Badge>:null}
                 {resource.isWomenOnly?<Badge bg="dark">Women Only</Badge>:null}
                 {resource.isMenOnly?<Badge bg="dark">Men Only</Badge>:null}
                 {resource.youthOnly?<Badge bg="dark">Youth Only</Badge>:null}
                </div>
               </Card.Body>

               {(resource.source||resource.sourceDateLabel)?(
                <Card.Footer className="bg-white text-muted small">
                 {[resource.source,resource.sourceDateLabel].filter(Boolean).join(" • ")}
                </Card.Footer>
               ):null}
              </Card>
             </Col>
            );
           })}
          </Row>
         )}
        </Accordion.Body>
       </Accordion.Item>
      );
     })}
    </Accordion>
   )}

   {!loading&&!error?(
    <div className="d-flex justify-content-end mt-4">
     <Button variant="outline-secondary" onClick={fetchData}>Refresh</Button>
    </div>
   ):null}
  </Container>
 );
}

export default CommunityResourcesPage;