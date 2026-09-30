// src/pages/forms/morse/MorsePracticeForm.jsx
import {useEffect,useRef,useState} from "react";
import {Alert,Button,Card,Col,Form,Row} from "react-bootstrap";
import {generateMorsePracticeText} from "../../../utils/morseGenerator.js";
import {parseMorsePracticeText} from "../../../utils/morseParser.js";
import {scoreMorseAnswer} from "../../../utils/morseScoring.js";
import {playMorseText} from "../../../utils/morseAudio.js";

const authHeaders=extra=>({Authorization:`Bearer ${localStorage.getItem("token")||sessionStorage.getItem("token")||""}`,...extra});

export default function MorsePracticeForm({currentUser,onSaved}){
 const [title,setTitle]=useState("");
 const [sourceType,setSourceType]=useState("generated");
 const [practiceType,setPracticeType]=useState("letters");
 const [level,setLevel]=useState(1);
 const [startingWpm,setStartingWpm]=useState(5);
 const [incrementBy,setIncrementBy]=useState(5);
 const [text,setText]=useState("");
 const [parsedText,setParsedText]=useState("");
 const [unsupportedCharacters,setUnsupportedCharacters]=useState([]);
 const [savedPracticeText,setSavedPracticeText]=useState(null);
 const [userAnswer,setUserAnswer]=useState("");
 const [score,setScore]=useState(null);
 const [message,setMessage]=useState("");
 const [error,setError]=useState("");
 const [attemptStarted,setAttemptStarted]=useState(false);
 const [isPlaying,setIsPlaying]=useState(false);
 const playbackRef=useRef(null);

 const resetAttempt=()=>{
  playbackRef.current?.stop();
  playbackRef.current=null;
  setAttemptStarted(false);
  setIsPlaying(false);
  setUserAnswer("");
  setScore(null);
 };

 useEffect(()=>()=>{playbackRef.current?.stop();},[]);

 const handleGenerate=()=>{
  const generatedText=generateMorsePracticeText(practiceType,Number(level));
  const parsed=parseMorsePracticeText(generatedText);
  setSourceType("generated");
  setText(generatedText);
  setParsedText(parsed.parsedText);
 setUnsupportedCharacters(parsed.unsupportedCharacters);
  resetAttempt();
  setMessage("Practice text generated.");
  setError("");
 };

 const handleParse=()=>{
  const parsed=parseMorsePracticeText(text);
  setParsedText(parsed.parsedText);
 setUnsupportedCharacters(parsed.unsupportedCharacters);
  resetAttempt();
  setMessage("Practice text parsed.");
  setError("");
 };

 const handleUpload=async(event)=>{
  const file=event.target.files[0];
  if(!file)return;
  const value=await file.text();
  const parsed=parseMorsePracticeText(value);
  setSourceType("uploaded");
  setText(value);
  setParsedText(parsed.parsedText);
 setUnsupportedCharacters(parsed.unsupportedCharacters);
  resetAttempt();
  setMessage("Uploaded text parsed.");
  setError("");
 };

 const handlePlay=async()=>{
  if(!parsedText){setError("Generate or parse practice text before listening.");return;}
  await playbackRef.current?.stop();
  setAttemptStarted(true);
  setIsPlaying(true);
  setScore(null);
  setError("");
  setMessage("Listen to the Morse code and type what you hear.");
  try{
   const playback=playMorseText(parsedText,{wpm:Number(startingWpm)});
   playbackRef.current=playback;
   await playback.finished;
  }catch(playError){setError(playError.message||"Morse audio could not be played.");}
  finally{playbackRef.current=null;setIsPlaying(false);}
 };

 const handleStop=async()=>{
  await playbackRef.current?.stop();
  playbackRef.current=null;
  setIsPlaying(false);
 };

 const handleSaveText=async()=>{
  if(!currentUser?._id){
   setError("Missing current user.");
   return;
  }

  const parsed=parseMorsePracticeText(text);

  if(!parsed.parsedText){
   setError("Practice text is empty.");
   return;
  }

  const payload={
   user:currentUser._id,
   title:title||"Morse Practice Text",
   sourceType,
   practiceType,
   level:Number(level),
   startingWpm:Number(startingWpm),
   incrementBy:Number(incrementBy),
   text,
   parsedText:parsed.parsedText,
   unsupportedCharacters:parsed.unsupportedCharacters,
   wordCount:parsed.wordCount,
   characterCount:parsed.characterCount
  };

  const res=await fetch("/api/morse/practice-texts",{
   method:"POST",
   headers:authHeaders({"Content-Type":"application/json"}),
   body:JSON.stringify(payload)
  });

  const data=await res.json();

  if(!data.success){
   setError(data.message||"Practice text could not be saved.");
   return;
  }

  setSavedPracticeText(data.data);
  setParsedText(data.data.parsedText);
  setMessage("Practice text saved.");
  setError("");

  if(onSaved){
   onSaved(data.data);
  }
 };

 const handleCheckAnswer=async()=>{
  if(!currentUser?._id){
   setError("Missing current user.");
   return;
  }

 if(!parsedText){
   setError("Parse or generate practice text first.");
   return;
 }

  if(!userAnswer.trim()){
   setError("Type your answer before completing the practice session.");
   return;
  }

  await handleStop();

  const result=scoreMorseAnswer(parsedText,userAnswer);
  setScore(result);

  const payload={
   user:currentUser._id,
   practiceText:savedPracticeText?._id||null,
   title:title||"Morse Practice Session",
   sourceType,
   practiceType,
   level:Number(level),
   wpm:Number(startingWpm),
   incrementBy:Number(incrementBy),
   targetText:parsedText,
   userAnswer,
   correctCharacters:result.correctCharacters,
   incorrectCharacters:result.incorrectCharacters,
   missedCharacters:result.missedCharacters,
   accuracy:result.accuracy,
   completedAt:new Date(),
   isCompleted:true
  };

  const res=await fetch("/api/morse/practice-sessions",{
   method:"POST",
   headers:authHeaders({"Content-Type":"application/json"}),
   body:JSON.stringify(payload)
  });

  const data=await res.json();

  if(!data.success){
   setError(data.message||"Practice session could not be saved.");
   return;
  }

  setMessage("Practice session saved.");
  setError("");
 };

 return(
  <>
   {message&&<Alert variant="info">{message}</Alert>}
   {error&&<Alert variant="danger">{error}</Alert>}
   <Card className="mb-3">
    <Card.Body>
     <Row className="g-3">
      <Col md={6}>
       <Form.Group>
        <Form.Label>Title</Form.Label>
        <Form.Control value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Basic 5 WPM Practice"/>
       </Form.Group>
      </Col>
      <Col md={3}>
       <Form.Group>
        <Form.Label>Practice Type</Form.Label>
        <Form.Select value={practiceType} onChange={(e)=>setPracticeType(e.target.value)}>
         <option value="letters">Letters</option>
         <option value="numbers">Numbers</option>
         <option value="mixed">Mixed</option>
         <option value="words">Words</option>
         <option value="qcodes">Q-Codes</option>
         <option value="callsigns">Call Signs</option>
         <option value="qso">QSO Exchange</option>
         <option value="custom">Custom</option>
        </Form.Select>
       </Form.Group>
      </Col>
      <Col md={3}>
       <Form.Group>
        <Form.Label>Source Type</Form.Label>
        <Form.Select value={sourceType} onChange={(e)=>setSourceType(e.target.value)}>
         <option value="generated">Generated</option>
         <option value="pasted">Pasted</option>
         <option value="uploaded">Uploaded</option>
         <option value="custom">Custom</option>
        </Form.Select>
       </Form.Group>
      </Col>
      <Col md={4}>
       <Form.Group>
        <Form.Label>Level</Form.Label>
        <Form.Control type="number" min="1" max="10" value={level} onChange={(e)=>setLevel(e.target.value)}/>
       </Form.Group>
      </Col>
      <Col md={4}>
       <Form.Group>
        <Form.Label>Starting WPM</Form.Label>
        <Form.Select value={startingWpm} onChange={(e)=>setStartingWpm(e.target.value)}>
         <option value="5">5 WPM</option>
         <option value="10">10 WPM</option>
         <option value="15">15 WPM</option>
         <option value="20">20 WPM</option>
         <option value="25">25 WPM</option>
         <option value="30">30 WPM</option>
        </Form.Select>
       </Form.Group>
      </Col>
      <Col md={4}>
       <Form.Group>
        <Form.Label>Increment By</Form.Label>
        <Form.Select value={incrementBy} onChange={(e)=>setIncrementBy(e.target.value)}>
         <option value="5">5 WPM</option>
         <option value="10">10 WPM</option>
        </Form.Select>
       </Form.Group>
      </Col>
      <Col md={12}>
       <Form.Group>
        <Form.Label>Paste Practice Text</Form.Label>
        {sourceType==="generated"||attemptStarted?<div className="morse-practice-message">{attemptStarted?"Practice text is hidden until you complete your answer.":"Generated practice text remains hidden during listening practice."}</div>:<Form.Control as="textarea" rows={5} value={text} onChange={(e)=>{setText(e.target.value);setSourceType("pasted");resetAttempt();}}/>}
       </Form.Group>
      </Col>
      <Col md={12}>
       <Form.Group>
        <Form.Label>Upload Text File</Form.Label>
        <Form.Control type="file" accept=".txt" onChange={handleUpload}/>
       </Form.Group>
      </Col>
      <Col md={12} className="d-flex flex-wrap gap-2">
       <Button type="button" onClick={handleGenerate}>Generate Text</Button>
       <Button type="button" variant="secondary" onClick={handleParse}>Parse Text</Button>
       <Button type="button" variant="success" onClick={handleSaveText}>Save Practice Text</Button>
      </Col>
     </Row>
    </Card.Body>
   </Card>
   <Card className="mb-3">
    <Card.Body>
     <h5>Listening Practice</h5>
     <div className="d-flex flex-wrap gap-2 mb-3">
      <Button type="button" onClick={handlePlay} disabled={!parsedText||isPlaying}>{isPlaying?"Playing Morse...":attemptStarted?"Replay Morse":"Start Listening"}</Button>
      {isPlaying?<Button type="button" variant="outline-secondary" onClick={handleStop}>Stop</Button>:null}
     </div>
     <div className={`morse-practice-reveal${score?" is-revealed":""}`}>{score?parsedText:parsedText?"Sent text hidden until your answer is complete.":"Generate or parse text to begin."}</div>
     {score&&unsupportedCharacters.length>0&&(
      <Alert variant="warning" className="mt-3 mb-0">
       Unsupported characters removed: {unsupportedCharacters.join(" ")}
      </Alert>
     )}
    </Card.Body>
   </Card>
   <Card>
    <Card.Body>
     <Form.Group className="mb-3">
      <Form.Label>Your Answer</Form.Label>
      <Form.Control className="morse-practice-answer" as="textarea" rows={4} value={userAnswer} onChange={(e)=>setUserAnswer(e.target.value)} disabled={!attemptStarted||!!score} placeholder={attemptStarted?"Type what you hear":"Select Start Listening before entering your answer"}/>
     </Form.Group>
     <Button type="button" onClick={handleCheckAnswer} disabled={!attemptStarted||!!score}>Complete Answer and Save Session</Button>
     {score&&(
      <div className="mt-3">
       <p className="mb-1"><strong>Accuracy:</strong> {score.accuracy}%</p>
       <p className="mb-1"><strong>Correct:</strong> {score.correctCharacters}</p>
       <p className="mb-1"><strong>Incorrect:</strong> {score.incorrectCharacters}</p>
       <p className="mb-0"><strong>Missed:</strong> {score.missedCharacters}</p>
      </div>
     )}
    </Card.Body>
   </Card>
  </>
 );
}
