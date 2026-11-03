import React,{useEffect,useMemo,useState} from 'react';
import {Container,Row,Col,Card,Badge,Alert,Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';

export default function Pantry(){
	const [items,setItems]=useState([]);
	const [loading,setLoading]=useState(true);
	const [error,setError]=useState('');

	useEffect(()=>{
		let ignore=false;

		const loadInventory=async()=>{
			try{
				setLoading(true);
				setError('');

				const res=await fetch('/api/inventories',{
					headers:{'Content-Type':'application/json'}
				});

				if(!res.ok)throw new Error('Failed to load pantry inventory');

				const data=await res.json();
				const list=Array.isArray(data)?data:data?.inventories||data?.data||[];

				if(!ignore)setItems(list);
			}catch(err){
				if(!ignore){
					setError(err.message||'Failed to load pantry inventory');
					setItems([]);
				}
			}finally{
				if(!ignore)setLoading(false);
			}
		};

		loadInventory();

		return()=>{
			ignore=true;
		};
	},[]);

	const getCategoryName=(item)=>{
		const value=
			item?.product?.category?.name||
			item?.product?.category?.title||
			item?.product?.category?.label||
			item?.category?.name||
			item?.category?.title||
			item?.category?.label||
			item?.productCategory?.name||
			item?.productCategory||
			item?.category||
			'';

		return String(value).trim();
	};

	const getDepartmentName=(item)=>{
		const value=
			item?.product?.department?.name||
			item?.product?.department||
			item?.product?.type||
			item?.product?.group||
			item?.department||
			item?.type||
			'';

		return String(value).trim().toLowerCase();
	};

	const pantryItems=useMemo(()=>{
		return items.filter((item)=>{
			const department=getDepartmentName(item);
			const category=getCategoryName(item).toLowerCase();

			return(
				department==='pantry'||
				item?.product?.isPantry===true||
				[
					'pantry',
					'pantry staples',
					'dry goods',
					'rice',
					'beans',
					'pasta',
					'flour',
					'sugar',
					'baking',
					'oils',
					'vinegars',
					'spices',
					'seasonings',
					'condiments',
					'sauces',
					'canned goods',
					'grains',
					'breakfast',
					'snacks',
					'beverages'
				].includes(category)
			);
		});
	},[items]);

	const groupedItems=useMemo(()=>{
		return pantryItems.reduce((acc,item)=>{
			const category=getCategoryName(item)||'Uncategorized';

			if(!acc[category])acc[category]=[];
			acc[category].push(item);

			return acc;
		},{});
	},[pantryItems]);

	const categoryNames=useMemo(()=>{
		return Object.keys(groupedItems).sort((a,b)=>a.localeCompare(b));
	},[groupedItems]);

	if(loading){
		return(
			<Container className="py-4">
				<h1 className="m-0">Pantry Staples</h1>
				<p className="mt-3 mb-0">Loading pantry inventory...</p>
			</Container>
		);
	}

	if(error){
		return(
			<Container className="py-4">
				<h1 className="m-0">Pantry Staples</h1>
				<Alert variant="danger" className="mt-3 mb-0">{error}</Alert>
			</Container>
		);
	}

	return(
		<Container className="py-4">
			<Row className="mb-3">
				<Col className="d-flex justify-content-between align-items-center">
					<h1 className="m-0">Pantry Staples</h1>
					<Button as={Link} to="/inventories">Add or Edit Inventory</Button>
				</Col>
			</Row>

			{categoryNames.length>0?categoryNames.map((category)=>(
				<div key={category} className="mb-4">
					<Row className="mb-3">
						<Col>
							<h2 className="h4 m-0">{category}</h2>
						</Col>
					</Row>

					<Row>
						{groupedItems[category].map((item,index)=>(
							<Col key={item._id||item.id||index} xs={12} sm={6} md={4} lg={3} className="mb-4">
								<Card className="h-100">
									{item?.product?.image||item?.image?(
										<Card.Img
											variant="top"
											src={item?.product?.image||item?.image}
											alt={item?.product?.name||item?.name||'Pantry item'}
										/>
									):null}
									<Card.Body>
										<Card.Title>{item?.product?.name||item?.name||'Unnamed Item'}</Card.Title>
										<Card.Text className="mb-2">
											<strong>Quantity:</strong> {item?.quantity??0} {item?.unit?.name||item?.unit?.abbreviation||item?.unitLabel||''}
										</Card.Text>
										{item?.store?.name?<Card.Text className="mb-2"><strong>Store:</strong> {item.store.name}</Card.Text>:null}
										{item?.location?<Card.Text className="mb-2"><strong>Location:</strong> {item.location}</Card.Text>:null}
										{item?.expiryDate?<Card.Text className="mb-2"><strong>Expiry:</strong> {new Date(item.expiryDate).toLocaleDateString()}</Card.Text>:null}
										{item?.isLowStock?<Badge bg="warning" text="dark">Low Stock</Badge>:null}
									</Card.Body>
								</Card>
							</Col>
						))}
					</Row>
				</div>
			)):(
				<Row>
					<Col xs={12}>
						<p className="mb-0">No pantry staples found.</p>
					</Col>
				</Row>
			)}
		</Container>
	);
}
