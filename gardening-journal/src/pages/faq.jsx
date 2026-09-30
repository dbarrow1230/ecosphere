import {Container,Row,Col} from "react-bootstrap";

function FAQ(){

 return(
  <Container className="py-5">

   <Row className="justify-content-center mb-4">
    <Col lg={8} className="text-center">
     <h1 className="mb-3">Gardening Journal</h1>
     <p className="text-muted">
      Keep track of your plants, progress, and seasonal gardening notes.
     </p>
    </Col>
   </Row>

   <Row className="justify-content-center">
    <Col lg={8}>

     <div className="mb-4">
      <h4>What is a gardening journal?</h4>
      <p>
       A gardening journal is a place to record what you plant, how your
       garden changes, and what you observe throughout the growing season.
       It helps you stay organized and improve your results over time.
      </p>
     </div>

     <div className="mb-4">
      <h4>What should I record in my journal?</h4>
      <p>
       You can record planting dates, watering schedules, weather patterns,
       soil conditions, fertilizer use, pest issues, and harvest results.
       These notes help you understand what works best in your garden.
      </p>
     </div>

     <div className="mb-4">
      <h4>Why are plant observations important?</h4>
      <p>
       Observations help you notice growth patterns, leaf changes, blooms,
       and signs of stress or disease. Keeping track of these details makes
       it easier to care for plants at the right time.
      </p>
     </div>

     <div className="mb-4">
      <h4>Can I track seasonal changes?</h4>
      <p>
       Yes. A gardening journal is useful for documenting seasonal shifts,
       first frost dates, temperature changes, rainfall, and how different
       plants respond during each part of the year.
      </p>
     </div>

     <div className="mb-4">
      <h4>How does a journal help future planting?</h4>
      <p>
       Reviewing past entries helps you plan better for future seasons.
       You can see which plants thrived, which struggled, and when certain
       gardening tasks were most effective.
      </p>
     </div>

    </Col>
   </Row>

  </Container>
 );

}

export default FAQ;