import React,{useState} from "react";
import {Row,Col,Card,Form,Button,ProgressBar,Alert,Badge} from "react-bootstrap";
import {MessageCircle,Compass,BookOpen,ShieldCheck,Users,Star,Send,CheckCircle2} from "lucide-react";

const MentorSurvey=()=>{
    const [ratings,setRatings]=useState({});
    const [responses,setResponses]=useState({});
    const [submitted,setSubmitted]=useState(false);

    const sections=[
        {
            title:"Communication",
            icon:MessageCircle,
            questions:[
                "My mentor communicates clearly with me.",
                "My mentor listens carefully to my questions, concerns, and ideas.",
                "My mentor makes me feel comfortable asking questions.",
                "My mentor responds to me within a reasonable amount of time.",
                "My mentor explains things in a way that I can understand."
            ]
        },
        {
            title:"Guidance and Support",
            icon:Compass,
            questions:[
                "My mentor provides useful guidance when I need help.",
                "My mentor helps me work through problems rather than simply giving me answers.",
                "My mentor encourages me to become more independent and confident.",
                "My mentor provides resources or information that support my development.",
                "My mentor helps me identify realistic goals."
            ]
        },
        {
            title:"Feedback and Learning",
            icon:BookOpen,
            questions:[
                "My mentor gives me constructive feedback.",
                "The feedback I receive helps me improve.",
                "My mentor recognizes my progress and accomplishments.",
                "My mentor corrects me respectfully when improvement is needed.",
                "My mentor encourages me to think critically and develop my own ideas."
            ]
        },
        {
            title:"Respect and Professionalism",
            icon:ShieldCheck,
            questions:[
                "My mentor treats me with respect.",
                "My mentor respects my opinions and perspectives, even when they differ from their own.",
                "My mentor is dependable and follows through on commitments.",
                "My mentor maintains appropriate professional boundaries.",
                "I feel that my mentor genuinely cares about my growth and development."
            ]
        },
        {
            title:"Mentoring Relationship",
            icon:Users,
            questions:[
                "I understand what is expected of me in this mentoring relationship.",
                "I feel comfortable being honest with my mentor.",
                "I feel supported when I make mistakes or encounter difficulties.",
                "Our mentoring meetings or conversations are productive.",
                "Overall, this mentoring relationship is helping me grow.",
                "I feel that I can give my mentor honest feedback without it negatively affecting our relationship."
            ]
        }
    ];

    const writtenQuestions=[
        "What am I doing well as your mentor?",
        "What could I do better as your mentor?",
        "Is there anything you need more help or guidance with?",
        "Is there anything you would like me to do differently during our meetings or conversations?",
        "What has been the most useful part of our mentoring relationship so far?",
        "Is there anything you have wanted to tell me about my mentoring style but have not had the opportunity to say?",
        "Any additional comments or suggestions?"
    ];

    const ratingLabels={
        1:"Strongly Disagree",
        2:"Disagree",
        3:"Neutral",
        4:"Agree",
        5:"Strongly Agree"
    };

    const totalRatingQuestions=sections.reduce((total,section)=>total+section.questions.length,0)+1;
    const completedRatings=Object.keys(ratings).length;
    const progress=Math.round((completedRatings/totalRatingQuestions)*100);

    const handleRating=(key,value)=>{
        setRatings({...ratings,[key]:value});
    };

    const handleResponse=(key,value)=>{
        setResponses({...responses,[key]:value});
    };

    const handleSubmit=(e)=>{
        e.preventDefault();

        const surveyData={
            ratings,
            responses,
            submittedAt:new Date().toISOString()
        };

        console.log("Mentor Survey:",surveyData);
        setSubmitted(true);
        window.scrollTo({top:0,behavior:"smooth"});
    };

    let questionNumber=1;

    return(
        <>
            <Row className="justify-content-center py-4">
                <Col xl={9} lg={10} md={11} xs={12}>
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Body className="p-4 p-md-5">
                            <div className="d-flex align-items-center gap-3 mb-3">
                                <div className="bg-primary bg-opacity-10 text-primary rounded-circle p-3">
                                    <Users size={30}/>
                                </div>

                                <div>
                                    <h2 className="mb-1">Mentor Feedback Survey</h2>
                                    <p className="text-muted mb-0">
                                        Your honest feedback will help me understand how effectively I am supporting you and where I can improve.
                                    </p>
                                </div>
                            </div>

                            <hr/>

                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">Rating Questions Completed</small>
                                <Badge bg="primary">{completedRatings} / {totalRatingQuestions}</Badge>
                            </div>

                            <ProgressBar now={progress} label={`${progress}%`}/>
                        </Card.Body>
                    </Card>

                    {submitted&&(
                        <Alert variant="success" className="d-flex align-items-center gap-2">
                            <CheckCircle2 size={22}/>
                            <div>
                                <strong>Thank you for your feedback.</strong>
                                <div>Your survey responses have been submitted.</div>
                            </div>
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Body className="p-4">
                                <h5 className="mb-3">Rating Scale</h5>

                                <Row className="g-2">
                                    {Object.entries(ratingLabels).map(([value,label])=>(
                                        <Col md key={value}>
                                            <div className="border rounded p-2 text-center h-100">
                                                <strong>{value}</strong>
                                                <div className="small text-muted">{label}</div>
                                            </div>
                                        </Col>
                                    ))}
                                </Row>
                            </Card.Body>
                        </Card>

                        {sections.map((section,sectionIndex)=>{
                            const Icon=section.icon;

                            return(
                                <Card className="border-0 shadow-sm mb-4" key={section.title}>
                                    <Card.Header className="bg-white border-0 pt-4 px-4">
                                        <div className="d-flex align-items-center gap-2">
                                            <Icon size={22} className="text-primary"/>
                                            <h4 className="mb-0">{section.title}</h4>
                                        </div>
                                    </Card.Header>

                                    <Card.Body className="p-4">
                                        {section.questions.map((question,questionIndex)=>{
                                            const currentNumber=questionNumber++;
                                            const key=`rating-${sectionIndex}-${questionIndex}`;

                                            return(
                                                <div
                                                    className={`pb-4 ${questionIndex<section.questions.length-1?"mb-4 border-bottom":""}`}
                                                    key={key}
                                                >
                                                    <Form.Label className="fw-semibold d-block mb-3">
                                                        {currentNumber}. {question}
                                                    </Form.Label>

                                                    <div className="d-flex flex-wrap gap-3">
                                                        {[1,2,3,4,5].map(value=>(
                                                            <Form.Check
                                                                inline
                                                                type="radio"
                                                                id={`${key}-${value}`}
                                                                name={key}
                                                                label={
                                                                    <span>
                                                                        <strong>{value}</strong>
                                                                        <span className="d-none d-lg-inline text-muted ms-1">
                                                                            {ratingLabels[value]}
                                                                        </span>
                                                                    </span>
                                                                }
                                                                value={value}
                                                                checked={ratings[key]===value}
                                                                onChange={()=>handleRating(key,value)}
                                                                key={value}
                                                                required
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </Card.Body>
                                </Card>
                            );
                        })}

                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-white border-0 pt-4 px-4">
                                <div className="d-flex align-items-center gap-2">
                                    <Star size={22} className="text-primary"/>
                                    <h4 className="mb-0">Overall Rating</h4>
                                </div>
                            </Card.Header>

                            <Card.Body className="p-4">
                                <Form.Label className="fw-semibold d-block mb-3">
                                    {questionNumber++}. Overall, how would you rate me as a mentor?
                                </Form.Label>

                                <Row className="g-2">
                                    {[
                                        {value:1,label:"Poor"},
                                        {value:2,label:"Needs Improvement"},
                                        {value:3,label:"Satisfactory"},
                                        {value:4,label:"Very Good"},
                                        {value:5,label:"Excellent"}
                                    ].map(option=>(
                                        <Col md key={option.value}>
                                            <Form.Check
                                                type="radio"
                                                id={`overall-${option.value}`}
                                                name="overall-rating"
                                                className="border rounded p-3 ps-5 h-100"
                                                label={
                                                    <div>
                                                        <strong>{option.value}</strong>
                                                        <div className="small text-muted">{option.label}</div>
                                                    </div>
                                                }
                                                checked={ratings.overall===option.value}
                                                onChange={()=>handleRating("overall",option.value)}
                                                required
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </Card.Body>
                        </Card>

                        <Card className="border-0 shadow-sm mb-4">
                            <Card.Header className="bg-white border-0 pt-4 px-4">
                                <div className="d-flex align-items-center gap-2">
                                    <MessageCircle size={22} className="text-primary"/>
                                    <h4 className="mb-0">Written Feedback</h4>
                                </div>
                            </Card.Header>

                            <Card.Body className="p-4">
                                {writtenQuestions.map((question,index)=>{
                                    const key=`response-${index}`;

                                    return(
                                        <Form.Group
                                            className={index<writtenQuestions.length-1?"mb-4":"mb-0"}
                                            key={key}
                                        >
                                            <Form.Label className="fw-semibold">
                                                {questionNumber++}. {question}
                                            </Form.Label>

                                            <Form.Control
                                                as="textarea"
                                                rows={4}
                                                value={responses[key]||""}
                                                onChange={(e)=>handleResponse(key,e.target.value)}
                                                placeholder="Enter your feedback here..."
                                            />
                                        </Form.Group>
                                    );
                                })}
                            </Card.Body>
                        </Card>

                        <div className="d-flex justify-content-center mb-5">
                            <Button type="submit" size="lg" className="d-flex align-items-center justify-content-center gap-2 px-5">
                                <Send size={20}/>
                                Submit Feedback
                            </Button>
                        </div>
                    </Form>
                </Col>
            </Row>
        </>
    );
};

export default MentorSurvey;