import {useEffect,useMemo,useState} from "react";
import {Badge,Card,Col,Container,Form,InputGroup,Row,Tab,Tabs} from "react-bootstrap";
import {formulaSections} from "../../data/costingFormulaReference.js";

function CostingFormulaReference(){
  const [search,setSearch]=useState("");
  const [activeCategory,setActiveCategory]=useState(formulaSections[0]?.title||"");

  const filteredSections=useMemo(()=>{
    const term=search.trim().toLowerCase();

    if(!term){
      return formulaSections;
    }

    return formulaSections.map(section=>({
      ...section,
      formulas:section.formulas.filter(item=>
        item.name.toLowerCase().includes(term)||
        item.formula.toLowerCase().includes(term)||
        item.example.toLowerCase().includes(term)||
        item.use.toLowerCase().includes(term)
      )
    })).filter(section=>section.formulas.length);
  },[search]);

  useEffect(()=>{
    if(!filteredSections.length){
      setActiveCategory("");
      return;
    }

    const categoryExists=filteredSections.some(section=>section.title===activeCategory);

    if(!categoryExists){
      setActiveCategory(filteredSections[0].title);
    }
  },[filteredSections,activeCategory]);

  const formulaCount=formulaSections.reduce((total,section)=>total+section.formulas.length,0);
  const filteredCount=filteredSections.reduce((total,section)=>total+section.formulas.length,0);

  return(
    <Container fluid className="py-4">
      <Row className="justify-content-center">
        <Col xl={11}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <Row className="align-items-center g-3">
                <Col lg={8}>
                  <h1 className="h3 mb-2">Food Costing Formula Reference</h1>
                  <p className="text-muted mb-0">
                    Ingredient, recipe, labor, overhead, pricing, inventory, catering, menu engineering, and profitability formulas.
                  </p>
                </Col>

                <Col lg={4}>
                  <InputGroup>
                    <InputGroup.Text>Search</InputGroup.Text>
                    <Form.Control
                      type="search"
                      value={search}
                      placeholder="Search formulas"
                      aria-label="Search costing formulas"
                      onChange={event=>setSearch(event.target.value)}
                    />
                  </InputGroup>
                </Col>
              </Row>

              <div className="d-flex flex-wrap gap-2 mt-3">
                <Badge bg="primary">{formulaCount} formulas</Badge>
                <Badge bg="secondary">{formulaSections.length} categories</Badge>
                {search&&<Badge bg="success">{filteredCount} matches</Badge>}
              </div>
            </Card.Body>
          </Card>

          {filteredSections.length?(
            <Tabs
              activeKey={activeCategory}
              onSelect={category=>setActiveCategory(category||"")}
              className="mb-4 flex-wrap"
            >
              {filteredSections.map(section=>(
                <Tab
                  eventKey={section.title}
                  title={
                    <span className="d-inline-flex align-items-center gap-2 text-nowrap">
                      {section.title}
                      <Badge bg="secondary" pill>{section.formulas.length}</Badge>
                    </span>
                  }
                  key={section.title}
                >
                  <Row className="g-4 pt-3">
                    {section.formulas.map(item=>(
                      <Col md={6} xl={4} key={`${section.title}-${item.name}`}>
                        <Card className="h-100 border-0 shadow-sm">
                          <Card.Body className="d-flex flex-column p-4">
                            <Card.Title className="h5 mb-3">{item.name}</Card.Title>

                            <div className="mb-3">
                              <div className="small fw-semibold text-uppercase text-muted mb-1">Formula</div>
                              <div className="bg-light border rounded p-3">
                                <code className="text-dark">{item.formula}</code>
                              </div>
                            </div>

                            <div className="mb-3">
                              <div className="small fw-semibold text-uppercase text-muted mb-1">Example</div>
                              <p className="mb-0">{item.example}</p>
                            </div>

                            <div className="mt-auto">
                              <div className="small fw-semibold text-uppercase text-muted mb-1">Use</div>
                              <p className="text-muted mb-0">{item.use}</p>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Tab>
              ))}
            </Tabs>
          ):(
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-5 text-center">
                <h2 className="h5">No formulas found</h2>
                <p className="text-muted mb-0">Try a different search term.</p>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default CostingFormulaReference;