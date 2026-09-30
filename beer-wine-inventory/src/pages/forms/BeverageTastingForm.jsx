import {useState} from "react";
import {Container,Row,Col,Card,Form,Button,ButtonGroup,Alert} from "react-bootstrap";
import {Wine,Plus,Trash2,Save,Heart,ThumbsUp,X} from "lucide-react";

const BeverageTastingForm=({userId})=>{
    // Helper: creates a blank beverage entry
    const createEmptyBeverage=(order)=>({
        order,
        beverageType:"wine",
        vintageOrYear:"",
        name:"",
        producer:"",
        region:"",
        style:"",
        producerNotes:"",
        personalNotes:"",
        rating:""
    });

    const [formData,setFormData]=useState({
        userId:userId||"",
        title:"",
        tastingDate:"",
        venue:"",
        location:"",
        beverages:[createEmptyBeverage(1)],
        overallNotes:""
    });
    const [message,setMessage]=useState("");
    const [error,setError]=useState("");
    const [saving,setSaving]=useState(false);

    const handleChange=(e)=>{
        const {name,value}=e.target;
        setFormData((prev)=>({...prev,[name]:value}));
    };

    const handleBeverageChange=(index,e)=>{
        const {name,value}=e.target;
        setFormData((prev)=>{
            const beverages=[...prev.beverages];
            beverages[index]={...beverages[index],[name]:value};
            return {...prev,beverages};
        });
    };

    const handleRating=(index,rating)=>{
        setFormData((prev)=>{
            const beverages=[...prev.beverages];
            beverages[index]={...beverages[index],rating:beverages[index].rating===rating?"":rating};
            return {...prev,beverages};
        });
    };

    const addBeverage=()=>{
        setFormData((prev)=>({
            ...prev,
            beverages:[...prev.beverages,createEmptyBeverage(prev.beverages.length+1)]
        }));
    };

    const removeBeverage=(index)=>{
        setFormData((prev)=>({
            ...prev,
            beverages:prev.beverages.filter((_,beverageIndex)=>beverageIndex!==index).map((beverage,beverageIndex)=>({...beverage,order:beverageIndex+1}))
        }));
    };

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setMessage("");
        setError("");
        setSaving(true);
        try{
            const response=await fetch("/api/beverage-tastings",{
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body:JSON.stringify(formData)
            });
            const data=await response.json();
            if(!response.ok){
                throw new Error(data.message||"Unable to save beverage tasting");
            }
            setMessage("Beverage tasting saved.");
            setFormData({
                userId:userId||"",
                title:"",
                tastingDate:"",
                venue:"",
                location:"",
                beverages:[createEmptyBeverage(1)],
                overallNotes:""
            });
        }catch(error){
            setError(error.message);
        }finally{
            setSaving(false);
        }
    };

    return(
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col xl={10}>
                    <Card className="shadow-sm">
                        <Card.Header>
                            <div className="d-flex align-items-center gap-2">
                                <Wine size={22}/>
                                <h4 className="mb-0">Beverage Tasting</h4>
                            </div>
                        </Card.Header>
                        <Card.Body>
                            {message&&<Alert variant="success">{message}</Alert>}
                            {error&&<Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title</Form.Label>
                                            <Form.Control type="text" name="title" value={formData.title} onChange={handleChange} required/>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tasting Date</Form.Label>
                                            <Form.Control type="date" name="tastingDate" value={formData.tastingDate} onChange={handleChange} required/>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Venue</Form.Label>
                                            <Form.Control type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="Brooklyn Winery"/>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Location</Form.Label>
                                            <Form.Control type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Brooklyn, NY"/>
                                        </Form.Group>
                                    </Col>
                                </Row>
                                {formData.beverages.map((beverage,index)=>(
                                    <Card className="mb-3" key={index}>
                                        <Card.Header className="d-flex justify-content-between align-items-center">
                                            <strong>Beverage {index+1}</strong>
                                            {formData.beverages.length>1&&(
                                                <Button type="button" variant="outline-danger" size="sm" onClick={()=>removeBeverage(index)}>
                                                    <Trash2 size={16}/>
                                                </Button>
                                            )}
                                        </Card.Header>
                                        <Card.Body>
                                            <Row>
                                                <Col md={3}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Type</Form.Label>
                                                        <Form.Select name="beverageType" value={beverage.beverageType} onChange={(e)=>handleBeverageChange(index,e)}>
                                                            <option value="wine">Wine</option>
                                                            <option value="beer">Beer</option>
                                                            <option value="cider">Cider</option>
                                                            <option value="spirit">Spirit</option>
                                                            <option value="other">Other</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={3}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Vintage / Year</Form.Label>
                                                        <Form.Control type="text" name="vintageOrYear" value={beverage.vintageOrYear} onChange={(e)=>handleBeverageChange(index,e)}/>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Name</Form.Label>
                                                        <Form.Control type="text" name="name" value={beverage.name} onChange={(e)=>handleBeverageChange(index,e)} required/>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={4}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Producer</Form.Label>
                                                        <Form.Control type="text" name="producer" value={beverage.producer} onChange={(e)=>handleBeverageChange(index,e)}/>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Region</Form.Label>
                                                        <Form.Control type="text" name="region" value={beverage.region} onChange={(e)=>handleBeverageChange(index,e)}/>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Style</Form.Label>
                                                        <Form.Control type="text" name="style" value={beverage.style} onChange={(e)=>handleBeverageChange(index,e)}/>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Producer Tasting Notes</Form.Label>
                                                        <Form.Control as="textarea" rows={3} name="producerNotes" value={beverage.producerNotes} onChange={(e)=>handleBeverageChange(index,e)}/>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>My Notes</Form.Label>
                                                        <Form.Control as="textarea" rows={3} name="personalNotes" value={beverage.personalNotes} onChange={(e)=>handleBeverageChange(index,e)}/>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            <Form.Group>
                                                <Form.Label>Rating</Form.Label>
                                                <div>
                                                    <ButtonGroup>
                                                        <Button type="button" variant={beverage.rating==="love"?"danger":"outline-danger"} onClick={()=>handleRating(index,"love")}>
                                                            <Heart size={16} className="me-1"/>
                                                            Love It
                                                        </Button>
                                                        <Button type="button" variant={beverage.rating==="like"?"success":"outline-success"} onClick={()=>handleRating(index,"like")}>
                                                            <ThumbsUp size={16} className="me-1"/>
                                                            Like It
                                                        </Button>
                                                        <Button type="button" variant={beverage.rating==="leave"?"secondary":"outline-secondary"} onClick={()=>handleRating(index,"leave")}>
                                                            <X size={16} className="me-1"/>
                                                            Leave It
                                                        </Button>
                                                    </ButtonGroup>
                                                </div>
                                            </Form.Group>
                                        </Card.Body>
                                    </Card>
                                ))}
                                <Button type="button" variant="outline-primary" className="mb-3" onClick={addBeverage}>
                                    <Plus size={16} className="me-1"/>
                                    Add Beverage
                                </Button>
                                <Form.Group className="mb-3">
                                    <Form.Label>Overall Tasting Notes</Form.Label>
                                    <Form.Control as="textarea" rows={4} name="overallNotes" value={formData.overallNotes} onChange={handleChange}/>
                                </Form.Group>
                                <div className="d-flex justify-content-end">
                                    <Button type="submit" disabled={saving}>
                                        <Save size={16} className="me-1"/>
                                        {saving?"Saving...":"Save Tasting"}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default BeverageTastingForm;