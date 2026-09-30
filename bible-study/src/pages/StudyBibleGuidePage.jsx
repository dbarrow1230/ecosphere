// src/pages/StudyBibleGuidePage.jsx
import {Container,Row,Col,Card,Alert,ListGroup,Badge} from "react-bootstrap";

export default function StudyBibleGuidePage(){
 return(
  <Container className="py-4">
   <Row className="justify-content-center">
    <Col lg={10}>
     <Card className="shadow-sm border-0">
      <Card.Body className="p-4 p-md-5">
       <div className="mb-4">
        <Badge bg="primary" className="mb-3">Study Bible Guide</Badge>
        <h1 className="mb-3">What Is a Study Bible?</h1>
        <p className=" mb-0"> A study Bible is a Bible text paired with tools that help the reader understand Scripture more clearly.
         Instead of only presenting the biblical text, it also includes explanatory material designed to support reading, interpretation, context, and personal study. </p>
       </div>

       <hr className="my-4"/>

       <section className="mb-5">
        <h2 className="h4 mb-3">How a Study Bible Helps</h2>
        <p> A study Bible can make reading easier by giving historical background, explaining difficult passages, identifying themes, tracing important people and places, and connecting related verses. It helps readers
         move beyond simply reading the text to better understanding what they are reading and why it matters. </p>
        <p className="mb-0"> For many readers, a study Bible becomes a bridge between devotional reading and deeper Bible study.
         It supports both beginners who need guidance and experienced readers who want a structured reference beside the text.   </p>
       </section>

       <section className="mb-5">
        <h2 className="h4 mb-3">What You Usually Find in a Study Bible</h2>
        <ListGroup variant="flush">
         <ListGroup.Item className="px-0"> <strong>Study notes:</strong> Short explanations placed near verses or passages. </ListGroup.Item>
         <ListGroup.Item className="px-0"> <strong>Book introductions:</strong> Background on authorship, setting, themes, and purpose. </ListGroup.Item>
         <ListGroup.Item className="px-0"> <strong>Cross-references:</strong> Links to related passages elsewhere in Scripture. </ListGroup.Item>
         <ListGroup.Item className="px-0"> <strong>Maps, charts, and timelines:</strong> Visual tools for geography, history, and sequence. </ListGroup.Item>
         <ListGroup.Item className="px-0"> <strong>Articles and essays:</strong> Expanded help on theology, doctrine, or practical study topics.</ListGroup.Item>
         <ListGroup.Item className="px-0"> <strong>Indexes and reference tools:</strong> Helps for topical study, word study, and navigation. </ListGroup.Item>
        </ListGroup>
       </section>

       <section className="mb-5">
        <h2 className="h4 mb-3">Why Choosing the Right One Matters</h2>
        <p> Not every study Bible is built for the same reader. Some focus on accessibility and clarity. Others emphasize theology, language detail, historical context, discipleship, devotional use, or a specific
         audience such as students, women, men, new believers, or serious long-term researchers. </p>
        <p className="mb-0"> Because of that, the best study Bible is not simply the one with the most notes. It is the one that fits your translation preference, reading level, study goals, and the way you plan to use it. </p>
       </section>

       <section className="mb-5">
        <h2 className="h4 mb-3">How to Choose a Study Bible</h2>
        <Row className="g-3">
         <Col md={6}>
          <Card className="h-100 border-0 bg-light">
           <Card.Body>
            <h3 className="h6">1. Start with the translation</h3>
            <p className="mb-0"> Make sure the Bible text itself is one you can read with confidence and consistency. If the translation is a poor fit for you, the study helps will not matter as much.</p>
           </Card.Body>
          </Card>
         </Col>

         <Col md={6}>
          <Card className="h-100 border-0 bg-light">
           <Card.Body>
            <h3 className="h6">2. Match it to your purpose</h3>
            <p className="mb-0"> Decide whether you want devotional help, doctrinal depth, historical background, application, or a general all-purpose study tool. </p>
           </Card.Body>
          </Card>
         </Col>

         <Col md={6}>
          <Card className="h-100 border-0 bg-light">
           <Card.Body>
            <h3 className="h6">3. Consider the note style</h3>
            <p className="mb-0"> Some notes are brief and practical. Others are dense and academic. Choose a format that helps rather than overwhelms you. </p>
           </Card.Body>
          </Card>
         </Col>

         <Col md={6}>
          <Card className="h-100 border-0 bg-light">
           <Card.Body>
            <h3 className="h6">4. Think about usability</h3>
            <p className="mb-0"> Page layout, print size, headings, references, and visual tools affect whether the Bible is enjoyable and sustainable to use. </p>
           </Card.Body>
          </Card>
         </Col>

         <Col md={6}>
          <Card className="h-100 border-0 bg-light">
           <Card.Body>
            <h3 className="h6">5. Know the editorial perspective</h3>
            <p className="mb-0">
             Study notes are written by people and shaped by editorial choices. It helps to know the theological or
             interpretive perspective behind them.
            </p>
           </Card.Body>
          </Card>
         </Col>

         <Col md={6}>
          <Card className="h-100 border-0 bg-light">
           <Card.Body>
            <h3 className="h6">6. Choose for real use</h3>
            <p className="mb-0">
             The best option is the one you will actually open, read, mark, and return to regularly.
            </p>
           </Card.Body>
          </Card>
         </Col>
        </Row>
       </section>

       <Alert variant="secondary" className="mb-0">
        <h2 className="h5 mb-2">Conclusion: Choosing the Best Study Bible</h2>
        <p className="mb-0">
         The best study Bible is the one that helps you read Scripture faithfully, understand it more deeply,
         and stay engaged in consistent study. A good choice should fit your translation preference, your current
         level of understanding, and the kind of help you actually need. Choose the one that supports your growth,
         not just the one with the largest feature list.
        </p>
       </Alert>
      </Card.Body>
     </Card>
    </Col>
   </Row>
  </Container>
 );
}