import "../styles/tasting-ratings.css";
import {formatDate as formatAppDate} from "../utils/dateFormat.js";
import {useEffect,useState} from "react";
import {useNavigate,useParams} from "react-router-dom";
import {Row,Col,Card,Button,Alert,Spinner} from "react-bootstrap";
import {ArrowLeft,CalendarDays,MapPin,Heart,ThumbsUp,X,Wine} from "lucide-react";

const BeverageTastingDetails=()=>{
    const {id}=useParams();
    const navigate=useNavigate();
    const [tasting,setTasting]=useState(null);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState("");

    useEffect(()=>{
        const getTasting=async()=>{
            try{
                const response=await fetch(`/api/beverage-tastings/${id}`);
                const data=await response.json();
                if(!response.ok){
                    throw new Error(data.message||"Unable to load beverage tasting");
                }
                setTasting(data);
            }catch(error){
                setError(error.message);
            }finally{
                setLoading(false);
            }
        };
        getTasting();
    },[id]);

    const displayRating=(rating)=>{
        if(rating==="love"){
            return <span className="tasting-rating-token tasting-rating--love"><Heart size={13} className="me-1"/>Love It</span>;
        }
        if(rating==="like"){
            return <span className="tasting-rating-token tasting-rating--like"><ThumbsUp size={13} className="me-1"/>Like It</span>;
        }
        if(rating==="leave"){
            return <span className="tasting-rating-token tasting-rating--leave"><X size={13} className="me-1"/>Leave It</span>;
        }
        return <span className="tasting-rating-token tasting-rating--unrated">Not Rated</span>;
    };

    if(loading){
        return(
            <div className="py-4 text-center">
                <Spinner animation="border"/>
            </div>
        );
    }

    if(error){
        return(
            <div className="py-4">
                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    return(
        <div className="py-4">
            <Button variant="outline-secondary" className="mb-3" onClick={()=>navigate("/beverage-tastings")}>
                <ArrowLeft size={16} className="me-1"/>
                Back
            </Button>
            <Card className="mb-4 shadow-sm">
                <Card.Header>
                    <div className="d-flex align-items-center gap-2">
                        <Wine size={22}/>
                        <h3 className="mb-0">{tasting.title}</h3>
                    </div>
                </Card.Header>
                <Card.Body>
                    <div className="mb-3"><strong className="detail-label">Tasting business:</strong> <span className="detail-value">{tasting.businessName||"—"}</span></div>
                    <Row>
                        <Col md={4}>
                            <strong>Date</strong>
                            <div className="d-flex align-items-center gap-1 mt-1">
                                <CalendarDays size={16}/>
                                {formatAppDate(tasting.tastingDate)}
                            </div>
                        </Col>
                        <Col md={4}>
                            <strong>Venue</strong>
                            <div className="mt-1">{tasting.venue||"-"}</div>
                        </Col>
                        <Col md={4}>
                            <strong>Location</strong>
                            <div className="d-flex align-items-center gap-1 mt-1">
                                {tasting.location&&<MapPin size={16}/>}
                                {tasting.location||"-"}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
            {tasting.beverages.map((beverage)=>(
                <Card className="mb-3" key={beverage._id}>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{beverage.order}. {beverage.vintageOrYear&&`${beverage.vintageOrYear} `}{beverage.name}</strong>
                            <span className="text-muted text-capitalize ms-2">{beverage.beverageType}</span>
                        </div>
                        {displayRating(beverage.rating)}
                    </Card.Header>
                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={4}>
                                <strong>Producer</strong>
                                <div>{beverage.producer||"-"}</div>
                            </Col>
                            <Col md={4}>
                                <strong>Region</strong>
                                <div>{beverage.region||"-"}</div>
                            </Col>
                            <Col md={4}>
                                <strong>Style</strong>
                                <div>{beverage.style||"-"}</div>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <strong>Producer Tasting Notes</strong>
                                <p className="mb-0 mt-1">{beverage.producerNotes||"No producer tasting notes."}</p>
                            </Col>
                            <Col md={6}>
                                <strong>My Notes</strong>
                                <p className="mb-0 mt-1">{beverage.personalNotes||"No personal notes."}</p>
                            </Col>
                        </Row>
                        {beverage.culinaryApplications&&<div className="mt-3"><strong className="detail-label">Culinary applications:</strong><p className="detail-value detail-notes mt-1">{beverage.culinaryApplications}</p></div>}
                    </Card.Body>
                </Card>
            ))}
            {tasting.overallNotes&&(
                <Card>
                    <Card.Header>
                        <strong>Overall Tasting Notes</strong>
                    </Card.Header>
                    <Card.Body>
                        <p className="mb-0">{tasting.overallNotes}</p>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default BeverageTastingDetails;