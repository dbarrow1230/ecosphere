// backend/pages/forms/MentorshipSurveyForm.jsx
import {useState} from "react";
import {Form,Row,Col,Button,Card} from "react-bootstrap";

const MentorshipSurveyForm=({menteeId,mentorId,onSubmit})=>{

 const [formData,setFormData]=useState({
  mentee:menteeId||"",
  mentor:mentorId||"",
  overallExperience:"",
  understandsGoals:"",
  relevantGuidance:"",
  communication:"",
  clearCommunication:"",
  comfortableAskingQuestions:"",
  listensToConcerns:"",
  helpsSetGoals:"",
  usefulFeedback:"",
  encouragesIndependentThinking:"",
  providesResources:"",
  accountability:"",
  preparedForMeetings:"",
  respectsTime:"",
  respectsIdeas:"",
  increasedConfidence:"",
  progressTowardGoals:"",
  mentorshipValue:"",
  mentorStrengths:"",
  areasForImprovement:"",
  wantMoreOf:"",
  wantLessOf:"",
  mostValuableAspect:"",
  additionalComments:""
 });

 const handleChange=(e)=>{
  const {name,value}=e.target;

  setFormData({
   ...formData,
   [name]:value
  });
 };

 const handleSubmit=(e)=>{
  e.preventDefault();

  if(onSubmit)
  {
   onSubmit(formData);
  }
 };

 return(
  <Form onSubmit={handleSubmit}>
   <Card className="mb-3">
    <Card.Header>Mentorship Experience</Card.Header>
    <Card.Body>
     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>How satisfied are you with your overall mentorship experience?</Form.Label>
        <Form.Select name="overallExperience" value={formData.overallExperience} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="very-satisfied">Very satisfied</option>
         <option value="satisfied">Satisfied</option>
         <option value="neutral">Neutral</option>
         <option value="dissatisfied">Dissatisfied</option>
         <option value="very-dissatisfied">Very dissatisfied</option>
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Does your mentor understand your goals?</Form.Label>
        <Form.Select name="understandsGoals" value={formData.understandsGoals} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Does your mentor provide guidance relevant to your goals?</Form.Label>
        <Form.Select name="relevantGuidance" value={formData.relevantGuidance} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>How would you rate your mentor's communication?</Form.Label>
        <Form.Select name="communication" value={formData.communication} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="excellent">Excellent</option>
         <option value="good">Good</option>
         <option value="fair">Fair</option>
         <option value="poor">Poor</option>
         <option value="very-poor">Very poor</option>
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Does your mentor explain information clearly?</Form.Label>
        <Form.Select name="clearCommunication" value={formData.clearCommunication} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Do you feel comfortable asking your mentor questions?</Form.Label>
        <Form.Select name="comfortableAskingQuestions" value={formData.comfortableAskingQuestions} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Does your mentor listen to your ideas and concerns?</Form.Label>
        <Form.Select name="listensToConcerns" value={formData.listensToConcerns} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Does your mentor help you develop realistic goals?</Form.Label>
        <Form.Select name="helpsSetGoals" value={formData.helpsSetGoals} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Does your mentor provide useful feedback?</Form.Label>
        <Form.Select name="usefulFeedback" value={formData.usefulFeedback} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Does your mentor encourage you to think through problems and make your own decisions?</Form.Label>
        <Form.Select name="encouragesIndependentThinking" value={formData.encouragesIndependentThinking} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Does your mentor provide useful resources or recommendations?</Form.Label>
        <Form.Select name="providesResources" value={formData.providesResources} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Does your mentor hold you accountable for agreed-upon goals and action steps?</Form.Label>
        <Form.Select name="accountability" value={formData.accountability} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>
    </Card.Body>
   </Card>

   <Card className="mb-3">
    <Card.Header>Professionalism</Card.Header>
    <Card.Body>
     <Row>
      <Col md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Is your mentor prepared for meetings?</Form.Label>
        <Form.Select name="preparedForMeetings" value={formData.preparedForMeetings} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Does your mentor respect your time and commitments?</Form.Label>
        <Form.Select name="respectsTime" value={formData.respectsTime} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Does your mentor treat you and your ideas with respect?</Form.Label>
        <Form.Select name="respectsIdeas" value={formData.respectsIdeas} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="always">Always</option>
         <option value="often">Often</option>
         <option value="sometimes">Sometimes</option>
         <option value="rarely">Rarely</option>
         <option value="never">Never</option>
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>
    </Card.Body>
   </Card>

   <Card className="mb-3">
    <Card.Header>Mentorship Impact</Card.Header>
    <Card.Body>
     <Row>
      <Col md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Has mentorship increased your confidence in making decisions?</Form.Label>
        <Form.Select name="increasedConfidence" value={formData.increasedConfidence} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="significantly">Significantly</option>
         <option value="moderately">Moderately</option>
         <option value="somewhat">Somewhat</option>
         <option value="very-little">Very little</option>
         <option value="not-at-all">Not at all</option>
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={4}>
       <Form.Group className="mb-3">
        <Form.Label>Has your mentor helped you make progress toward your goals?</Form.Label>
        <Form.Select name="progressTowardGoals" value={formData.progressTowardGoals} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="significantly">Significantly</option>
         <option value="moderately">Moderately</option>
         <option value="somewhat">Somewhat</option>
         <option value="very-little">Very little</option>
         <option value="not-at-all">Not at all</option>
        </Form.Select>
       </Form.Group>
      </Col>

      <Col md={4}>
       <Form.Group className="mb-3">
        <Form.Label>How valuable has the mentorship relationship been?</Form.Label>
        <Form.Select name="mentorshipValue" value={formData.mentorshipValue} onChange={handleChange} required>
         <option value="">Select</option>
         <option value="extremely-valuable">Extremely valuable</option>
         <option value="very-valuable">Very valuable</option>
         <option value="somewhat-valuable">Somewhat valuable</option>
         <option value="slightly-valuable">Slightly valuable</option>
         <option value="not-valuable">Not valuable</option>
        </Form.Select>
       </Form.Group>
      </Col>
     </Row>
    </Card.Body>
   </Card>

   <Card className="mb-3">
    <Card.Header>Written Feedback</Card.Header>
    <Card.Body>
     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>What does your mentor do particularly well?</Form.Label>
        <Form.Control as="textarea" rows={3} name="mentorStrengths" value={formData.mentorStrengths} onChange={handleChange}/>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>What could your mentor do differently to better support you?</Form.Label>
        <Form.Control as="textarea" rows={3} name="areasForImprovement" value={formData.areasForImprovement} onChange={handleChange}/>
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>What would you like more of from your mentor?</Form.Label>
        <Form.Control as="textarea" rows={3} name="wantMoreOf" value={formData.wantMoreOf} onChange={handleChange}/>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>What would you like less of from your mentor?</Form.Label>
        <Form.Control as="textarea" rows={3} name="wantLessOf" value={formData.wantLessOf} onChange={handleChange}/>
       </Form.Group>
      </Col>
     </Row>

     <Row>
      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>What has been the most valuable part of working with your mentor?</Form.Label>
        <Form.Control as="textarea" rows={3} name="mostValuableAspect" value={formData.mostValuableAspect} onChange={handleChange}/>
       </Form.Group>
      </Col>

      <Col md={6}>
       <Form.Group className="mb-3">
        <Form.Label>Additional comments</Form.Label>
        <Form.Control as="textarea" rows={3} name="additionalComments" value={formData.additionalComments} onChange={handleChange}/>
       </Form.Group>
      </Col>
     </Row>
    </Card.Body>
   </Card>

   <Button type="submit">Submit Survey</Button>
  </Form>
 );
};

export default MentorshipSurveyForm;