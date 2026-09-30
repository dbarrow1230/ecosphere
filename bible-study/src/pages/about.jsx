// src/pages/About.jsx
import {Container,Row,Col} from "react-bootstrap";
import bannerImage from "../images/bible mountains.png";
import "../styles/About.css";

export default function About(){

 return(
  <main>
   <div className="about-banner"><img src={bannerImage} alt="Bible on mountains"/><div className="about-banner-overlay"><h1>About Bible Study Methods</h1></div></div>
   <Container className="py-5">
    <Row className="justify-content-center">
     <Col lg={9}>
      <p>Bible study methods are structured approaches that help readers engage Scripture with greater clarity, discipline, and understanding. Rather than reading only for familiarity, these methods encourage careful observation, thoughtful interpretation, meaningful comparison, and practical application.</p>
      <p>The purpose of this site is to present a broad range of Bible study methods in an organized and accessible way. Each method offers a distinct lens for working through the biblical text. Some methods focus on the structure of a chapter or book, some emphasize historical setting and literary context, some trace themes and doctrines across multiple passages, and others center on personal reflection, meditation, and spiritual growth.</p>
      <p>Studying the Bible well involves more than collecting information. It requires learning how to ask good questions of the text, how to recognize patterns, how to identify key words and repeated ideas, how to consider the original context, and how to distinguish between observation, interpretation, and application. Sound study methods help readers slow down, pay attention, and handle Scripture with care.</p>
      <h2 className="mt-4 mb-3">Helpful Questions When Studying Scripture</h2>
      <ul className="mb-4">
       <li><strong>What does the passage actually say?</strong> Identify the main statements, repeated ideas, and key words.</li>
       <li><strong>Who is speaking, and to whom?</strong> Determine the people involved and the audience being addressed.</li>
       <li><strong>What is the historical or cultural setting?</strong> Consider when the passage was written and the circumstances surrounding it.</li>
       <li><strong>What is the literary context?</strong> Look at the surrounding verses, the chapter, and the larger section of the book.</li>
       <li><strong>Are there repeated words, phrases, or themes?</strong> Repetition often highlights emphasis or important ideas.</li>
       <li><strong>How does this passage relate to the rest of Scripture?</strong> Compare cross-references or similar passages elsewhere in the Bible.</li>
       <li><strong>What is the main idea or message of the passage?</strong> Summarize the central teaching or theme in your own words.</li>
       <li><strong>What does this passage reveal about God?</strong> Consider what it shows about God’s character, actions, or purposes.</li>
       <li><strong>What response does this passage call for?</strong> Reflect on how the teaching might apply to faith, conduct, or understanding.</li>
      </ul>
      <p>This project includes methods such as chapter study, book study, historical study, cross-reference study, parallel passage study, devotional study, meditation study, character study, biographical study, word study, doctrinal study, thematic study, expository study, verse-by-verse study, and inductive study.</p>
      <p>Some methods are especially helpful for beginners because they provide clear step-by-step structure. Others are useful for deeper research, teaching, sermon preparation, group study, or tracing ideas across larger sections of Scripture.</p>
      <p>This site is designed to make those methods easier to explore and apply. The aim is not only to describe each study method, but to make each one practical, understandable, and useful for consistent Bible study.</p>
     </Col>
    </Row>
   </Container>
  </main>
 );

}