// src/pages/referance/ThemeExplorationPage.jsx
import {BookOpen,Heart,Layers,Lightbulb,MessageCircle,Sparkles} from "lucide-react";
import {Badge,Container} from "react-bootstrap";
import "./ThemeExplorationPage.css";

const popularThemes=[
 "Love conquers all",
 "Power corrupts",
 "Grief changes people",
 "Family is found, not born",
 "Freedom vs. control",
 "Survival through unity",
 "The illusion of perfection"
];

const themeSelection=[
 "Emotionally resonates with you",
 "Fits your characters’ arcs",
 "Can evolve or be challenged over the course of the plot"
];

const themeQuestions=[
 {
  title:"Definition",
  text:"What does this theme mean in your own words?"
 },
 {
  title:"Character Reflection",
  text:"How does the main character embody or challenge this theme?"
 },
 {
  title:"Conflict",
  text:"What opposing values or forces will test this theme?"
 },
 {
  title:"Symbolism",
  text:"What objects, locations, or images could visually represent your theme?"
 },
 {
  title:"Resolution",
  text:"What final message will your ending leave the reader with?"
 }
];

const brainstormQuestions=[
 "What core message or idea do I want to explore?",
 "Is there a personal belief or experience I want to express through fiction?",
 "What emotional truth should my characters wrestle with?"
];

function ThemeExplorationPage(){
 return (
  <main className="theme-exploration-page">
   <Container fluid>
    <section className="theme-hero">
     <Badge className="theme-badge">
      <BookOpen size={16} className="me-2"/>
      Story Development
     </Badge>

     <h1 className="theme-title">
      Find Your <span>theme</span>
     </h1>

     <p className="theme-lead">
      The theme of your story is its deeper meaning — the emotional, moral, or philosophical takeaway
      that lingers after the final page. It’s what your story is really about beyond plot and character.
     </p>

     <p className="theme-text">
      Whether you’re writing fiction, memoir, or fantasy, identifying your theme early can help anchor
      your narrative and guide character decisions, plot developments, and emotional arcs.
     </p>
    </section>

    <section className="theme-feature">
     <div className="theme-feature-icon">
      <Sparkles size={26}/>
     </div>

     <div className="theme-feature-content">
      <h2>Theme Exploration</h2>

      <p>
       Your theme is the why behind your story. It reflects the emotional and moral journey at the heart
       of the plot. Is your story about healing? Redemption? The cost of ambition?
      </p>

      <p>
       Themes can be subtle or bold — they don’t need to be stated outright, but they should resonate
       throughout your story’s events, choices, and tone.
      </p>
     </div>

     <div className="theme-feature-list">
      <h3>Popular themes</h3>

      <ul>
       {popularThemes.map((theme,index)=>(
        <li key={index}>{theme}</li>
       ))}
      </ul>
     </div>
    </section>

    <section className="theme-board">
     <article className="theme-board-section theme-board-large">
      <div className="theme-section-marker">
       <Heart size={24}/>
      </div>

      <div className="theme-section-content">
       <h2>Theme Selection</h2>

       <div className="theme-split">
        <div>
         <h3>Choose a theme that:</h3>

         <ul className="theme-check-list">
          {themeSelection.map((item,index)=>(
           <li key={index}>{item}</li>
          ))}
         </ul>
        </div>

        <div>
         <h3>Once selected, ask:</h3>

         <div className="theme-question-list">
          {themeQuestions.map((item,index)=>(
           <div className="theme-question" key={index}>
            <span>{String(index+1).padStart(2,"0")}</span>
            <div>
             <h4>{item.title}</h4>
             <p>{item.text}</p>
            </div>
           </div>
          ))}
         </div>
        </div>
       </div>
      </div>
     </article>

     <article className="theme-board-section">
      <div className="theme-section-marker">
       <Lightbulb size={24}/>
      </div>

      <div className="theme-section-content">
       <h2>Theme Brainstorm</h2>

       <h3>Before you begin writing, pause and ask:</h3>

       <ul className="theme-check-list">
        {brainstormQuestions.map((question,index)=>(
         <li key={index}>{question}</li>
        ))}
       </ul>

       <p>
        You might not know your theme yet — that’s okay. Sometimes, your theme becomes clearer
        during revision. Still, reflecting now helps you craft intentional scenes with deeper impact.
       </p>
      </div>
     </article>

     <article className="theme-board-section">
      <div className="theme-section-marker">
       <Layers size={24}/>
      </div>

      <div className="theme-section-content">
       <h2>Multiple Themes</h2>

       <p>
        Many great novels weave several themes together. For example, a story may explore both
        betrayal and forgiveness, or ambition and isolation. Just make sure they don’t compete —
        they should complement each other and enrich the core message.
       </p>
      </div>
     </article>
    </section>

    <section className="theme-closing-note">
     <MessageCircle size={28}/>

     <p>
      Theme is not just what the story says. It is what remains with the reader after the story ends.
     </p>
    </section>
   </Container>
  </main>
 );
}

export default ThemeExplorationPage;