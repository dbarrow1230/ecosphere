import React,{useMemo,useState} from "react";
import {Alert,Badge,Button,Card,Col,Container,Form,InputGroup,Row,Table} from "react-bootstrap";
import {Calculator,CircleAlert,Droplets,FlaskConical,Plus,RotateCcw,Scale,Trash2} from "lucide-react";

const SaltPercentageCalculator=()=>{
    const [ingredients,setIngredients]=useState([
        {id:1,name:"",weight:""}
    ]);
    const [water,setWater]=useState("");
    const [saltPercentage,setSaltPercentage]=useState("3");
    const [fermentationType,setFermentationType]=useState("lacto");
    const [measuredPh,setMeasuredPh]=useState("");

    const fermentationTypes={
        lacto:{
            name:"Lacto Fermentation",
            safetyPh:4.6,
            practicalPh:4.0,
            safetyDisplay:"≤ 4.6",
            practicalDisplay:"≤ 4.0",
            safetyLabel:"Safety Threshold",
            practicalLabel:"Practical Finished Target",
            method:"Natural fermentation",
            acidity:"Lactic acid produced by lactic acid bacteria",
            description:"Lacto fermentation lowers pH naturally as lactic acid bacteria convert sugars in the food into lactic acid.",
            guidance:"The finished ferment should reach pH 4.6 or below through fermentation. A practical finished target of pH 4.0 or below provides a more conservative margin.",
            note:"Do not treat pH 4.0 as the regulatory cutoff. The key safety threshold is pH 4.6 or below."
        },
        pickling:{
            name:"Acid Pickling",
            safetyPh:4.6,
            practicalPh:4.0,
            safetyDisplay:"≤ 4.6",
            practicalDisplay:"≤ 4.0",
            safetyLabel:"Equilibrium Safety Threshold",
            practicalLabel:"Practical Finished Target",
            method:"Added acid",
            acidity:"Vinegar or another approved food acid",
            description:"Acid pickling lowers pH by adding acid rather than relying on lactic acid bacteria to produce the required acidity.",
            guidance:"The finished food should reach an equilibrium pH of 4.6 or below. A practical finished target of pH 4.0 or below provides a more conservative margin.",
            note:"For pickled foods, the important measurement is the finished equilibrium pH after the acid has distributed throughout the food."
        }
    };

    const addIngredient=()=>{
        setIngredients([
            ...ingredients,
            {
                id:Date.now(),
                name:"",
                weight:""
            }
        ]);
    };

    const updateIngredient=(id,field,value)=>{
        setIngredients(ingredients.map((ingredient)=>
            ingredient.id===id
                ? {...ingredient,[field]:value}
                : ingredient
        ));
    };

    const removeIngredient=(id)=>{
        if(ingredients.length===1){
            setIngredients([
                {id:1,name:"",weight:""}
            ]);
            return;
        }

        setIngredients(ingredients.filter((ingredient)=>ingredient.id!==id));
    };

    const ingredientWeight=useMemo(()=>{
        return ingredients.reduce((total,ingredient)=>{
            return total+Number(ingredient.weight || 0);
        },0);
    },[ingredients]);

    const waterWeight=Number(water || 0);
    const percentage=Number(saltPercentage || 0);
    const phInfo=fermentationTypes[fermentationType];

    const weightBeforeSalt=ingredientWeight+waterWeight;
    const saltRequired=weightBeforeSalt*(percentage/100);
    const finalBatchWeight=weightBeforeSalt+saltRequired;

    const phStatus=useMemo(()=>{
        if(measuredPh===""){
            return null;
        }

        const ph=Number(measuredPh);

        if(Number.isNaN(ph) || ph<0 || ph>14){
            return {
                variant:"danger",
                title:"Invalid pH",
                text:"Enter a pH value between 0 and 14."
            };
        }

        if(ph<=phInfo.practicalPh){
            return {
                variant:"success",
                title:"Practical Target Reached",
                text:`pH ${ph.toFixed(2)} is at or below the practical finished target of pH ${phInfo.practicalDisplay}.`
            };
        }

        if(ph<=phInfo.safetyPh){
            return {
                variant:"warning",
                title:"Below Safety Threshold",
                text:`pH ${ph.toFixed(2)} is at or below the pH 4.6 safety threshold, but it is above the more conservative practical target of pH 4.0.`
            };
        }

        return {
            variant:"danger",
            title:"Above Safety Threshold",
            text:`pH ${ph.toFixed(2)} is above pH 4.6 and has not reached the required acidity threshold.`
        };
    },[measuredPh,phInfo]);

    const resetCalculator=()=>{
        setIngredients([
            {id:1,name:"",weight:""}
        ]);
        setWater("");
        setSaltPercentage("3");
        setFermentationType("lacto");
        setMeasuredPh("");
    };

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col xl={11}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-white py-3">
                            <div className="d-flex align-items-center gap-2">
                                <Calculator size={22}/>
                                <h4 className="mb-0">Fermentation Salt & pH Calculator</h4>
                            </div>
                        </Card.Header>

                        <Card.Body>
                            <Row className="g-4">
                                <Col lg={7}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">
                                            Fermentation / Preservation Method
                                        </Form.Label>

                                        <Form.Select
                                            value={fermentationType}
                                            onChange={(e)=>setFermentationType(e.target.value)}
                                        >
                                            <option value="lacto">Lacto Fermentation</option>
                                            <option value="pickling">Acid Pickling</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Card className="border mb-4">
                                        <Card.Body>
                                            <div className="d-flex align-items-center gap-2 mb-3">
                                                <FlaskConical size={20}/>
                                                <h5 className="mb-0">{phInfo.name}</h5>
                                            </div>

                                            <p className="mb-3">
                                                {phInfo.description}
                                            </p>

                                            <Row className="g-3">
                                                <Col md={6}>
                                                    <div className="border rounded p-3 h-100">
                                                        <div className="text-muted small mb-1">
                                                            {phInfo.safetyLabel}
                                                        </div>

                                                        <div className="fs-3 fw-bold">
                                                            pH {phInfo.safetyDisplay}
                                                        </div>

                                                        <div className="small mt-2">
                                                            This is the key finished-food safety threshold.
                                                        </div>
                                                    </div>
                                                </Col>

                                                <Col md={6}>
                                                    <div className="border rounded p-3 h-100">
                                                        <div className="text-muted small mb-1">
                                                            {phInfo.practicalLabel}
                                                        </div>

                                                        <div className="fs-3 fw-bold">
                                                            pH {phInfo.practicalDisplay}
                                                        </div>

                                                        <div className="small mt-2">
                                                            More conservative finished target.
                                                        </div>
                                                    </div>
                                                </Col>
                                            </Row>

                                            <Table responsive bordered className="mt-3 mb-3">
                                                <tbody>
                                                    <tr>
                                                        <th style={{width:"40%"}}>
                                                            Method
                                                        </th>

                                                        <td>
                                                            {phInfo.method}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <th>
                                                            How Acidity Is Produced
                                                        </th>

                                                        <td>
                                                            {phInfo.acidity}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <th>
                                                            Required Finished pH
                                                        </th>

                                                        <td>
                                                            pH 4.6 or below
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <th>
                                                            Practical Target
                                                        </th>

                                                        <td>
                                                            pH 4.0 or below
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </Table>

                                            <Alert variant="info" className="mb-2">
                                                <strong>Guidance:</strong> {phInfo.guidance}
                                            </Alert>

                                            <div className="d-flex gap-2 align-items-start text-muted small">
                                                <CircleAlert size={17} className="flex-shrink-0 mt-1"/>
                                                <span>{phInfo.note}</span>
                                            </div>
                                        </Card.Body>
                                    </Card>

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <Scale size={20}/>
                                            <strong>Ingredients</strong>
                                        </div>

                                        <Button
                                            type="button"
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={addIngredient}
                                        >
                                            <Plus size={16} className="me-1"/>
                                            Add Ingredient
                                        </Button>
                                    </div>

                                    <Table responsive>
                                        <thead>
                                            <tr>
                                                <th>Ingredient</th>
                                                <th>Weight</th>
                                                <th style={{width:"50px"}}></th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {ingredients.map((ingredient)=>(
                                                <tr key={ingredient.id}>
                                                    <td>
                                                        <Form.Control
                                                            type="text"
                                                            value={ingredient.name}
                                                            onChange={(e)=>updateIngredient(
                                                                ingredient.id,
                                                                "name",
                                                                e.target.value
                                                            )}
                                                            placeholder="Ingredient name"
                                                        />
                                                    </td>

                                                    <td>
                                                        <InputGroup>
                                                            <Form.Control
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={ingredient.weight}
                                                                onChange={(e)=>updateIngredient(
                                                                    ingredient.id,
                                                                    "weight",
                                                                    e.target.value
                                                                )}
                                                                placeholder="0"
                                                            />
                                                            <InputGroup.Text>g</InputGroup.Text>
                                                        </InputGroup>
                                                    </td>

                                                    <td>
                                                        <Button
                                                            type="button"
                                                            variant="outline-danger"
                                                            onClick={()=>removeIngredient(ingredient.id)}
                                                        >
                                                            <Trash2 size={17}/>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>

                                        <tfoot>
                                            <tr>
                                                <th>Total Ingredient Weight</th>
                                                <th>{ingredientWeight.toFixed(2)} g</th>
                                                <th></th>
                                            </tr>
                                        </tfoot>
                                    </Table>

                                    <Row className="g-3 mt-2">
                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Water Weight</Form.Label>

                                                <InputGroup>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={water}
                                                        onChange={(e)=>setWater(e.target.value)}
                                                        placeholder="0"
                                                    />
                                                    <InputGroup.Text>g</InputGroup.Text>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Salt Percentage</Form.Label>

                                                <InputGroup>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        step="0.1"
                                                        value={saltPercentage}
                                                        onChange={(e)=>setSaltPercentage(e.target.value)}
                                                        placeholder="3"
                                                    />
                                                    <InputGroup.Text>%</InputGroup.Text>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group>
                                                <Form.Label>Measured Finished pH</Form.Label>

                                                <InputGroup>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        max="14"
                                                        step="0.01"
                                                        value={measuredPh}
                                                        onChange={(e)=>setMeasuredPh(e.target.value)}
                                                        placeholder="Enter pH reading"
                                                    />
                                                    <InputGroup.Text>pH</InputGroup.Text>
                                                </InputGroup>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {phStatus &&
                                        <Alert
                                            variant={phStatus.variant}
                                            className="mt-3 mb-0"
                                        >
                                            <div className="fw-semibold">
                                                {phStatus.title}
                                            </div>

                                            <div>
                                                {phStatus.text}
                                            </div>
                                        </Alert>
                                    }

                                    <Button
                                        type="button"
                                        variant="outline-secondary"
                                        className="mt-3"
                                        onClick={resetCalculator}
                                    >
                                        <RotateCcw size={17} className="me-2"/>
                                        Reset
                                    </Button>
                                </Col>

                                <Col lg={5}>
                                    <Card className="bg-light border-0 mb-4">
                                        <Card.Body>
                                            <div className="d-flex align-items-center gap-2 mb-4">
                                                <Droplets size={20}/>
                                                <h5 className="mb-0">Salt Calculation</h5>
                                            </div>

                                            <div className="d-flex justify-content-between mb-3">
                                                <span>Ingredient Weight</span>
                                                <strong>{ingredientWeight.toFixed(2)} g</strong>
                                            </div>

                                            <div className="d-flex justify-content-between mb-3">
                                                <span>Water Weight</span>
                                                <strong>{waterWeight.toFixed(2)} g</strong>
                                            </div>

                                            <div className="d-flex justify-content-between mb-3">
                                                <span>Weight Before Salt</span>
                                                <strong>{weightBeforeSalt.toFixed(2)} g</strong>
                                            </div>

                                            <div className="d-flex justify-content-between mb-3">
                                                <span>Salt Percentage</span>
                                                <strong>{percentage.toFixed(2)}%</strong>
                                            </div>

                                            <hr/>

                                            <div className="mb-4">
                                                <div className="fw-semibold mb-1">
                                                    Salt Required
                                                </div>

                                                <div className="display-5 fw-bold">
                                                    {saltRequired.toFixed(2)} g
                                                </div>

                                                <small className="text-muted">
                                                    {weightBeforeSalt.toFixed(2)} g × {percentage.toFixed(2)}%
                                                </small>
                                            </div>

                                            <hr/>

                                            <div className="d-flex justify-content-between">
                                                <span className="fw-semibold">
                                                    Final Batch Weight
                                                </span>

                                                <strong>
                                                    {finalBatchWeight.toFixed(2)} g
                                                </strong>
                                            </div>
                                        </Card.Body>
                                    </Card>

                                    <Card className="border">
                                        <Card.Body>
                                            <h5 className="mb-3">pH Summary</h5>

                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <span>Method</span>

                                                <Badge bg="secondary">
                                                    {phInfo.name}
                                                </Badge>
                                            </div>

                                            <div className="d-flex justify-content-between mb-3">
                                                <span>Safety Threshold</span>
                                                <strong>pH {phInfo.safetyDisplay}</strong>
                                            </div>

                                            <div className="d-flex justify-content-between mb-3">
                                                <span>Practical Target</span>
                                                <strong>pH {phInfo.practicalDisplay}</strong>
                                            </div>

                                            <div className="d-flex justify-content-between">
                                                <span>Measured pH</span>
                                                <strong>
                                                    {measuredPh!=="" ? Number(measuredPh).toFixed(2) : "Not entered"}
                                                </strong>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default SaltPercentageCalculator;