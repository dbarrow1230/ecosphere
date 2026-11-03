import React,{useEffect,useState} from 'react';
import {Container,Row,Col,Card,Badge,Alert,Button,Spinner} from 'react-bootstrap';
import {Link} from 'react-router-dom';

export default function Grocery(){
	const [items,setItems]=useState([]);
	const [loading,setLoading]=useState(true);
	const [error,setError]=useState('');

	useEffect(()=>{
		let ignore=false;
		fetch('/api/inventories')
			.then(async res=>{
				const data=await res.json();
				if(!res.ok)throw new Error(data.message||'Failed to load grocery inventory');
				if(!ignore)setItems(data.inventories||data.data||data||[]);
			})
			.catch(err=>{if(!ignore)setError(err.message||'Failed to load grocery inventory');})
			.finally(()=>{if(!ignore)setLoading(false);});
		return()=>{ignore=true;};
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

	const groceryItems=items.filter((item)=>{
		const department=getDepartmentName(item);
		const category=getCategoryName(item).toLowerCase();

		return (
			department==='grocery'||
			item?.product?.isGrocery===true||
			[
				'produce',
				'fruits',
				'vegetables',
				'dairy',
				'meat',
				'seafood',
				'bakery',
				'frozen',
				'pantry',
				'beverages',
				'snacks',
				'canned goods',
				'condiments',
				'spices',
				'breakfast',
				'deli'
			].includes(category)
		);
	});

	const groupedItems=groceryItems.reduce((acc,item)=>{
		const category=getCategoryName(item)||'Uncategorized';

		if(!acc[category]) acc[category]=[];
		acc[category].push(item);

		return acc;
	},{});

	const categoryNames=Object.keys(groupedItems).sort((a,b)=>a.localeCompare(b));

	return(
		<Container className="py-4">
			<Row className="mb-3">
				<Col className="d-flex justify-content-between align-items-center">
					<h1 className="m-0">Groceries</h1>
					<Button as={Link} to="/inventories">Add or Edit Inventory</Button>
				</Col>
			</Row>
			{loading?<div className="text-center py-4"><Spinner animation="border"/></div>:null}
			{error?<Alert variant="danger">{error}</Alert>:null}

			{!loading&&!error&&categoryNames.length>0?categoryNames.map((category)=>(
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
									{item?.product?.image||item?.image?<Card.Img variant="top" src={item?.product?.image||item?.image} alt={item?.product?.name||item?.name||'Grocery item'} />:null}
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
			)):!loading&&!error?(
				<Row>
					<Col xs={12}>
						<p>No grocery items found.</p>
					</Col>
				</Row>
			):null}
		</Container>
	);
}
