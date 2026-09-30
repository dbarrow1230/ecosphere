import {useEffect,useMemo,useState} from "react";
import {Alert,Badge,Card,Col,Form,InputGroup,Row,Spinner,Table} from "react-bootstrap";

const apiGet=async(url)=>{
	const res=await fetch(url,{credentials:"include"});
	if(!res.ok)throw new Error(`Failed to load ${url}`);
	return res.json();
};

const toArray=(value)=>{
	if(Array.isArray(value))return value;
	if(Array.isArray(value?.data))return value.data;
	if(Array.isArray(value?.results))return value.results;
	if(Array.isArray(value?.items))return value.items;
	return [];
};

const getId=(value)=>{
	if(!value)return "";
	if(typeof value==="string" || typeof value==="number")return String(value);
	if(value.$oid)return value.$oid;
	if(value._id){
		if(typeof value._id==="string" || typeof value._id==="number")return String(value._id);
		if(value._id?.$oid)return value._id.$oid;
	}
	if(value.id){
		if(typeof value.id==="string" || typeof value.id==="number")return String(value.id);
		if(value.id?.$oid)return value.id.$oid;
	}
	return "";
};

const text=(...values)=>{
	for(const value of values){
		if(value===0)return "0";
		if(value===false)return "false";
		if(value!==undefined && value!==null && typeof value!=="object" && String(value).trim())return String(value).trim();
	}
	return "";
};

const label=(value)=>{
	if(value===0)return "0";
	if(value===false)return "false";
	if(value===undefined || value===null)return "";
	if(typeof value==="string" || typeof value==="number" || typeof value==="boolean")return String(value).trim();
	if(typeof value==="object"){
		if(value.name && String(value.name).trim())return String(value.name).trim();
		if(value.title && String(value.title).trim())return String(value.title).trim();
		if(value.label && String(value.label).trim())return String(value.label).trim();
		if(value.categoryName && String(value.categoryName).trim())return String(value.categoryName).trim();
		if(value.locationName && String(value.locationName).trim())return String(value.locationName).trim();
		if(value.boroughName && String(value.boroughName).trim())return String(value.boroughName).trim();
		if(value.fullText && String(value.fullText).trim())return String(value.fullText).trim();
		if(value.address1 && String(value.address1).trim())return String(value.address1).trim();
		if(value.code && String(value.code).trim())return String(value.code).trim();
		if(value.abbreviation && String(value.abbreviation).trim())return String(value.abbreviation).trim();
	}
	return "";
};

const slugify=(value="")=>{
	return String(value).toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
};

const yesNo=(value)=>{
	if(value===true)return "Yes";
	if(value===false)return "No";
	return "";
};

const getCategoryId=(resource)=>{
	return text(
		resource?.resourceCategoryId,
		resource?.categoryId,
		resource?.resource_category_id,
		getId(resource?.resourceCategory),
		getId(resource?.category)
	);
};

const getCategoryName=(resource)=>{
	return text(
		resource?.resourceCategoryName,
		resource?.categoryName,
		label(resource?.resourceCategory),
		label(resource?.category)
	);
};

const getSubcategoryIds=(resource)=>{
	if(Array.isArray(resource?.subcategories))return resource.subcategories.map(getId).filter(Boolean);
	if(Array.isArray(resource?.subcategoryIds))return resource.subcategoryIds.map(getId).filter(Boolean);
	return [];
};

const getLocationName=(resource)=>{
	return text(
		resource?.locationName,
		label(resource?.location),
		resource?.siteName,
		resource?.location_title,
		resource?.address?.city
	);
};

const getBoroughName=(resource)=>{
	return text(
		resource?.boroughName,
		label(resource?.borough),
		label(resource?.address?.borough),
		resource?.location?.boroughName,
		label(resource?.location?.borough)
	);
};

const buildAddress=(resource)=>{
	const address1=text(resource?.address?.address1);
	const address2=text(resource?.address?.address2);
	const city=text(resource?.address?.city);
	const state=label(resource?.address?.state);
	const postalCode=text(resource?.address?.postalCode);
	const crossStreets=text(resource?.address?.crossStreets);
	const fullText=text(resource?.address?.fullText);

	if(fullText)return fullText;

	return [
		[address1,address2].filter(Boolean).join(" "),
		[city,state,postalCode].filter(Boolean).join(", "),
		crossStreets?`Cross Streets: ${crossStreets}`:""
	].filter(Boolean).join(" | ");
};

const ResourcePage=({title,categoryKey,description,howToUse})=>{
	const [loading,setLoading]=useState(true);
	const [error,setError]=useState("");
	const [resources,setResources]=useState([]);
	const [categories,setCategories]=useState([]);
	const [boroughs,setBoroughs]=useState([]);
	const [locationFilter,setLocationFilter]=useState("");
	const [boroughFilter,setBoroughFilter]=useState("");
	const [search,setSearch]=useState("");

	useEffect(()=>{
		let mounted=true;

		const loadData=async()=>{
			try{
				setLoading(true);
				setError("");

				const [categoryRes,resourceRes,boroughRes]=await Promise.all([
					apiGet("/api/resource-categories"),
					apiGet("/api/community-resources"),
					apiGet("/api/boroughs")
				]);

				if(!mounted)return;

				setCategories(toArray(categoryRes));
				setResources(toArray(resourceRes));
				setBoroughs(toArray(boroughRes));
			}catch(err){
				if(!mounted)return;
				setError(err.message || "Failed to load page data.");
			}finally{
				if(mounted)setLoading(false);
			}
		};

		loadData();
		return ()=>{mounted=false;};
	},[]);

	const categoryTree=useMemo(()=>{
		const items=categories.map((item)=>({
			raw:item,
			id:getId(item),
			name:label(item),
			slug:slugify(text(item?.slug,item?.key,item?.code,label(item))),
			parentId:getId(item?.parentCategory)
		}));

		const byId=items.reduce((acc,item)=>{
			acc[item.id]=item;
			return acc;
		},{});

		const childrenByParent=items.reduce((acc,item)=>{
			if(!item.parentId)return acc;
			if(!acc[item.parentId])acc[item.parentId]=[];
			acc[item.parentId].push(item.id);
			return acc;
		},{});

		return {items,byId,childrenByParent};
	},[categories]);

	const matchedCategoryIds=useMemo(()=>{
		const wanted=slugify(categoryKey);
		const aliases={
			"food-and-pantry":["food-and-pantry","food","pantry","food-pantry"],
			"drop-in-centers":["drop-in-centers","drop-in-center","drop-in","dropin-centers","dropin"],
			"shelters":["shelters","shelter"],
			"medical":["medical","health","healthcare"],
			"legal":["legal","legal-services"]
		};

		const allowedSlugs=new Set(aliases[categoryKey]||[categoryKey]);

		const directMatches=categoryTree.items.filter((item)=>{
			return allowedSlugs.has(item.slug) || allowedSlugs.has(slugify(item.name));
		});

		const ids=new Set();

		const addChildren=(id)=>{
			ids.add(id);
			(categoryTree.childrenByParent[id]||[]).forEach((childId)=>addChildren(childId));
		};

		directMatches.forEach((item)=>addChildren(item.id));

		if(categoryKey==="food-and-pantry"){
			categoryTree.items.forEach((item)=>{
				if(["breakfast","lunch","dinner","food-pantry","food-pantry-service","food-pantry"].includes(item.slug)){
					const parent=categoryTree.byId[item.parentId];
					if(parent && slugify(parent.name)==="food")addChildren(item.id);
				}
			});
		}

		return ids;
	},[categories,categoryKey,categoryTree]);

	const rows=useMemo(()=>{
		return resources.filter((resource)=>{
			const resourceCategoryId=getCategoryId(resource);
			const resourceSubcategoryIds=getSubcategoryIds(resource);
			const categoryMatches=
				(resourceCategoryId && matchedCategoryIds.has(resourceCategoryId)) ||
				resourceSubcategoryIds.some((id)=>matchedCategoryIds.has(id));

			if(!categoryMatches)return false;

			const locationName=getLocationName(resource);
			const boroughName=getBoroughName(resource);
			const addressValue=buildAddress(resource);
			const phone=text(resource?.contact?.phone);
			const email=text(resource?.contact?.email);
			const website=text(resource?.contact?.website);

			const searchable=[
				text(resource?.name),
				text(resource?.organization),
				text(resource?.description),
				...(Array.isArray(resource?.services)?resource.services:[]),
				locationName,
				boroughName,
				addressValue,
				phone,
				email,
				website
			].join(" ").toLowerCase();

			return (!locationFilter || locationName===locationFilter) && (!boroughFilter || boroughName===boroughFilter) && (!search || searchable.includes(search.toLowerCase()));
		});
	},[resources,matchedCategoryIds,locationFilter,boroughFilter,search]);

	const locationOptions=useMemo(()=>{
		const values=new Set();

		resources.forEach((resource)=>{
			const resourceCategoryId=getCategoryId(resource);
			const resourceSubcategoryIds=getSubcategoryIds(resource);
			const categoryMatches=
				(resourceCategoryId && matchedCategoryIds.has(resourceCategoryId)) ||
				resourceSubcategoryIds.some((id)=>matchedCategoryIds.has(id));

			if(!categoryMatches)return;

			const locationName=getLocationName(resource);
			if(locationName)values.add(locationName);
		});

		return Array.from(values).sort((a,b)=>a.localeCompare(b));
	},[resources,matchedCategoryIds]);

	const boroughOptions=useMemo(()=>{
		const values=new Set();

		rows.forEach((resource)=>{
			const boroughName=getBoroughName(resource);
			if(boroughName)values.add(boroughName);
		});

		toArray(boroughs).forEach((borough)=>{
			const boroughName=label(borough);
			if(boroughName)values.add(boroughName);
		});

		return Array.from(values).sort((a,b)=>a.localeCompare(b));
	},[rows,boroughs]);

	return (
		<div className="container py-4">
			<Row className="g-4">
				<Col xs={12}>
					<Card className="shadow-sm border-0">
						<Card.Body>
							<div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
								<div>
									<h1 className="h3 mb-2">{title}</h1>
									<p className="mb-2">{description}</p>
								</div>
								<Badge bg="primary" pill>{rows.length} results</Badge>
							</div>
							<hr />
							<h2 className="h5">How to use this page</h2>
							<p className="mb-0">{howToUse}</p>
						</Card.Body>
					</Card>
				</Col>

				<Col xs={12}>
					<Card className="shadow-sm border-0">
						<Card.Body>
							<Row className="g-3">
								<Col md={4}>
									<Form.Group>
										<Form.Label>Search</Form.Label>
										<InputGroup>
											<Form.Control type="text" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search name, address, phone..." />
										</InputGroup>
									</Form.Group>
								</Col>

								<Col md={4}>
									<Form.Group>
										<Form.Label>Filter by location</Form.Label>
										<Form.Select value={locationFilter} onChange={(e)=>setLocationFilter(e.target.value)}>
											<option value="">All locations</option>
											{locationOptions.map((location)=>(
												<option key={location} value={location}>{location}</option>
											))}
										</Form.Select>
									</Form.Group>
								</Col>

								<Col md={4}>
									<Form.Group>
										<Form.Label>Filter by borough</Form.Label>
										<Form.Select value={boroughFilter} onChange={(e)=>setBoroughFilter(e.target.value)}>
											<option value="">All boroughs</option>
											{boroughOptions.map((borough)=>(
												<option key={borough} value={borough}>{borough}</option>
											))}
										</Form.Select>
									</Form.Group>
								</Col>
							</Row>
						</Card.Body>
					</Card>
				</Col>

				<Col xs={12}>
					<Card className="shadow-sm border-0">
						<Card.Body>
							{loading ? (
								<div className="text-center py-5">
									<Spinner animation="border" role="status" />
								</div>
							) : error ? (
								<Alert variant="danger" className="mb-0">{error}</Alert>
							) : rows.length===0 ? (
								<Alert variant="warning" className="mb-0">No resources found for the current filters.</Alert>
							) : (
								<div className="table-responsive">
									<Table striped bordered hover responsive className="align-middle mb-0">
										<thead>
											<tr>
												<th>Name</th>
												<th>Organization</th>
												<th>Description</th>
												<th>Location</th>
												<th>Borough</th>
												<th>Address</th>
												<th>Phone</th>
												<th>Email</th>
												<th>Website</th>
												<th>Active</th>
											</tr>
										</thead>
										<tbody>
											{rows.map((resource,index)=>{
												const id=text(resource?._id,resource?.id,`${categoryKey}-${index}`);
												const name=text(resource?.name,"—");
												const organization=text(resource?.organization,"—");
												const descriptionValue=text(resource?.description,"—");
												const locationName=text(getLocationName(resource),"—");
												const boroughName=text(getBoroughName(resource),"—");
												const addressValue=text(buildAddress(resource),"—");
												const phone=text(resource?.contact?.phone,"—");
												const email=text(resource?.contact?.email,"—");
												const website=text(resource?.contact?.website);
												const active=text(yesNo(resource?.isActive),"—");

												return (
													<tr key={id}>
														<td>{name}</td>
														<td>{organization}</td>
														<td>{descriptionValue}</td>
														<td>{locationName}</td>
														<td>{boroughName}</td>
														<td>{addressValue}</td>
														<td>{phone}</td>
														<td>{email}</td>
														<td>
															{website ? (
																<a href={website} target="_blank" rel="noreferrer">{website}</a>
															) : "—"}
														</td>
														<td>{active}</td>
													</tr>
												);
											})}
										</tbody>
									</Table>
								</div>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default ResourcePage;