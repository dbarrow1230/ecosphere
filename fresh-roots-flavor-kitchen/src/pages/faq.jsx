import {Container,Row,Col,Card} from "react-bootstrap";

function FAQ(){

 return(
  <Container className="py-5">

   <Row className="justify-content-center mb-5">
    <Col lg={8} className="text-center">
     <h1 className="mb-3">Frequently Asked Questions</h1>
     <p className="text-muted">
      This section explains the different Bible study approaches included in the
      application and how each method helps readers understand Scripture more
      clearly and intentionally.
     </p>
    </Col>
   </Row>

   <Row className="justify-content-center">
    <Col lg={9}>

     <Card className="mb-4">
      <Card.Body>

       <h3 className="mb-3">What Bible study methods are included?</h3>

       <p>
        The app introduces a wide range of Bible study methods designed to help
        readers explore Scripture from multiple perspectives. Each method focuses
        on a different aspect of understanding the text — structure, context,
        themes, historical background, language, or personal reflection.
       </p>

       <p>
        No single method answers every question. By combining several approaches,
        readers can gain a more complete understanding of the passage and how it
        fits within the larger message of the Bible.
       </p>

      </Card.Body>
     </Card>

     <Card className="mb-4">
      <Card.Body>

       <h4>Chapter Study Method</h4>

       <p>
        Chapter and book studies focus on understanding the structure and flow
        of the biblical text.
       </p>

       <ul>
        <li><strong>Book Study</strong> — Examines the message, themes, and structure of an entire biblical book.</li>
        <li><strong>Chapter Study</strong> — Focuses deeply on one chapter to understand its key ideas and message.</li>
       </ul>

       <p><strong>Think of it this way:</strong></p>

       <ul>
        <li>Book Study → Understanding the entire landscape</li>
        <li>Chapter Study → Zooming into one important section</li>
       </ul>

      </Card.Body>
     </Card>

     <Card className="mb-4">
      <Card.Body>

       <h4>Context and Comparative Studies</h4>

       <p>
        These methods examine how passages relate to their historical setting
        and to other passages in Scripture.
       </p>

       <ul>
        <li><strong>Historical Study</strong> — Investigates the historical background of a passage.</li>
        <li><strong>Parallel Passage Study</strong> — Compares passages describing the same event.</li>
        <li><strong>Cross-Reference Study</strong> — Uses related verses to interpret a passage.</li>
       </ul>

      </Card.Body>
     </Card>

     <Card className="mb-4">
      <Card.Body>

       <h4>Devotional Study Methods</h4>

       <p>
        Devotional approaches emphasize reflection and spiritual growth rather
        than technical analysis.
       </p>

       <ul>
        <li><strong>Devotional Study</strong> — Personal reflection on Scripture for spiritual growth.</li>
        <li><strong>Meditation Study</strong> — Slow, thoughtful contemplation of a passage.</li>
        <li><strong>Lectio Divina</strong> — A historic Christian method of prayerful reading.</li>
       </ul>

      </Card.Body>
     </Card>

     <Card className="mb-4">
      <Card.Body>

       <h4>Character and Biographical Studies</h4>

       <p>
        These methods focus on the lives of individuals in Scripture and the
        lessons that can be learned from their experiences.
       </p>

       <ul>
        <li><strong>Character Study</strong> — Examines a person’s character and spiritual journey.</li>
        <li><strong>Leadership Study</strong> — Looks at leadership principles from biblical figures.</li>
        <li><strong>Biographical Study</strong> — Traces a person’s life across multiple passages.</li>
       </ul>

      </Card.Body>
     </Card>

     <Card className="mb-4">
      <Card.Body>

       <h4>Word Study Methods</h4>

       <p>
        Word studies explore the meaning of important terms and how they are
        used throughout Scripture.
       </p>

       <ul>
        <li><strong>Word Study</strong> — Traces a word’s meaning through different passages.</li>
        <li><strong>Key Word Study</strong> — Examines repeated words within a passage or book.</li>
        <li><strong>Original Language Study</strong> — Uses Hebrew and Greek to understand deeper meaning.</li>
       </ul>

      </Card.Body>
     </Card>

     <Card className="mb-4">
      <Card.Body>

       <h4>Topical and Doctrinal Studies</h4>

       <p>
        These approaches explore themes or teachings across the entire Bible.
       </p>

       <ul>
        <li><strong>Topical Study</strong> — Studies one subject across multiple passages.</li>
        <li><strong>Doctrinal Study</strong> — Examines a theological doctrine systematically.</li>
        <li><strong>Thematic Study</strong> — Follows a recurring theme through Scripture.</li>
       </ul>

      </Card.Body>
     </Card>

     <Card className="mb-4">
      <Card.Body>

       <h4>Structural and Expository Studies</h4>

       <p>
        These methods analyze the structure of the text and explain passages in
        careful detail.
       </p>

       <ul>
        <li><strong>Outline Study</strong> — Maps the logical flow of a chapter or book.</li>
        <li><strong>Expository Study</strong> — Explains Scripture passage by passage.</li>
        <li><strong>Verse-by-Verse Study</strong> — Examines each verse individually.</li>
        <li><strong>Passage Study</strong> — Studies a paragraph or section as a single unit.</li>
       </ul>

      </Card.Body>
     </Card>

     <Card>
      <Card.Body>

       <h4>Inductive Bible Study</h4>

       <p>
        Inductive study is one of the most widely used structured approaches to
        studying Scripture. It follows three key steps:
       </p>

       <ul>
        <li><strong>Observation</strong> — What does the text say?</li>
        <li><strong>Interpretation</strong> — What does the text mean?</li>
        <li><strong>Application</strong> — How should this truth affect life and faith?</li>
       </ul>

       <p>
        This method trains readers to examine Scripture carefully before drawing
        conclusions or applications.
       </p>

      </Card.Body>
     </Card>

    </Col>
   </Row>

  </Container>
 );

}

export default FAQ;