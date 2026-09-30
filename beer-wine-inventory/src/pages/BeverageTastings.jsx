import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {Container,Row,Col,Card,Table,Badge,Button,Alert,Spinner} from "react-bootstrap";
import {Wine,CalendarDays,MapPin,Eye,Plus,Heart,ThumbsUp,X} from "lucide-react";

const BeverageTastings=({userId})=>{
    const navigate=useNavigate();
    const [tastings,setTastings]=useState([]);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");

    useEffect(()=>{
        const getTastings=async()=>{
            try{
                const url=userId?`/api/beverage-tastings?userId=${userId}`:"/api/beverage-tastings";
                const response=await fetch(url);
                const data=await response.json();
                if(!response.ok){
                    throw new Error(data.message||"Unable to load beverage tastings");
                }
                setTastings(data);
            }catch(error){
                setError(error.message);
            }finally{
                setLoading(false);
            }
        };
        getTastings();
    },[userId]);

    const displayRating=(rating)=>{
        if(rating==="love"){
            return <Badge bg="danger"><Heart size={13} className="me-1"/>Love It</Badge>;
        }
        if(rating==="like"){
            return <Badge bg="success"><ThumbsUp size={13} className="me-1"/>Like It</Badge>;
        }
        if(rating==="leave"){
            return <Badge bg="secondary"><X size={13} className="me-1"/>Leave It</Badge>;
        }
        return "-";
    };

    if(loading){
        return(
            <Container className="py-4 text-center">
                <Spinner animation="border"/>
            </Container>
        );
    }

    return(
        <Container className="py-4">
            <Row className="align-items-center mb-4">
                <Col>
                    <div className="d-flex align-items-center gap-2">
                        <Wine size={26}/>
                        <h2 className="mb-0">Beverage Tastings</h2>
                    </div>
                </Col>
                <Col xs="auto">
                    <Button onClick={()=>navigate("/beverage-tastings/new")}>
                        <Plus size={16} className="me-1"/>
                        New Tasting
                    </Button>
                </Col>
            </Row>
            {error&&<Alert variant="danger">{error}</Alert>}
            {!error&&tastings.length===0&&<Alert variant="info">No beverage tastings found.</Alert>}
            {tastings.map((tasting)=>(
                <Card className="mb-4 shadow-sm" key={tasting._id}>
                    <Card.Header>
                        <Row className="align-items-center">
                            <Col>
                                <h4 className="mb-1">{tasting.title}</h4>
                                {tasting.venue&&<div className="text-muted">{tasting.venue}</div>}
                            </Col>
                            <Col xs="auto">
                                <div className="d-flex align-items-center gap-1">
                                    <CalendarDays size={16}/>
                                    {new Date(tasting.tastingDate).toLocaleDateString()}
                                </div>
                                {tasting.location&&(
                                    <div className="d-flex align-items-center gap-1 mt-1">
                                        <MapPin size={16}/>
                                        {tasting.location}
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body>
                        <Table responsive bordered hover className="mb-3">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Type</th>
                                    <th>Year</th>
                                    <th>Name</th>
                                    <th>Producer</th>
                                    <th>Region</th>
                                    <th>Style</th>
                                    <th>Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasting.beverages.map((beverage)=>(
                                    <tr key={beverage._id}>
                                        <td>{beverage.order}</td>
                                        <td className="text-capitalize">{beverage.beverageType}</td>
                                        <td>{beverage.vintageOrYear||"-"}</td>
                                        <td>{beverage.name}</td>
                                        <td>{beverage.producer||"-"}</td>
                                        <td>{beverage.region||"-"}</td>
                                        <td>{beverage.style||"-"}</td>
                                        <td>{displayRating(beverage.rating)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <div className="d-flex justify-content-end">
                            <Button variant="outline-primary" onClick={()=>navigate(`/beverage-tastings/${tasting._id}`)}>
                                <Eye size={16} className="me-1"/>
                                View Tasting
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            ))}
        </Container>
    );
};

export default BeverageTastings;