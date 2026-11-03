// src/pages/about.jsx
import "../styles/About.css";

function About(){

 return(
  <section className="about-page">
   <div className="about-page-container">

    <div className="about-page-hero">
     <p className="about-page-eyebrow">About the Journal</p>
     <h1 className="about-page-title"> Gardening Journal</h1>
     <p className="about-page-lead">
      My Gardening Journal is a personal space for recording planting dates, seasonal changes, garden progress, and lessons learned throughout the year. It helps capture the rhythm of the garden while keeping important notes organized in one place.
     </p>
    </div>

    <div className="about-page-grid">

     <article className="about-page-card">
      <h2 className="about-page-heading">Why I Keep It</h2>
      <p className="about-page-text">
       This journal helps me track what happens in the garden from season to season. I can record what was planted, how each plant performed, and what conditions affected growth, bloom, or harvest.
      </p>
      <p className="about-page-text">
       Over time, these entries become a useful reference for making better decisions, avoiding repeated mistakes, and noticing patterns that would otherwise be easy to forget.
      </p>
     </article>

     <article className="about-page-card">
      <h2 className="about-page-heading">What I Record</h2>
      <p className="about-page-text">
       I use this journal to document seed starting, transplanting, watering, pruning, fertilizing, pest problems, weather shifts, and harvest results. Each entry adds to a clearer picture of how the garden changes over time.
      </p>
      <p className="about-page-text">
       It is also a place to note ideas for future planting, layout changes, and observations about which plants thrive best in different parts of the garden.
      </p>
     </article>

     <article className="about-page-card">
      <h2 className="about-page-heading">My Purpose</h2>
      <p className="about-page-text">
       The purpose of this gardening journal is to stay organized, reflect on progress, and build a stronger understanding of the growing process. It turns everyday observations into something practical that can guide future seasons.
      </p>
     </article>

     <article className="about-page-card">
      <h2 className="about-page-heading">What This Journal Helps Me Do</h2>
      <ul className="about-page-list">
       <li>Track planting dates and seasonal changes</li>
       <li>Record growth, blooms, and harvest results</li>
       <li>Monitor pests, disease, and plant health</li>
       <li>Remember what worked well each season</li>
       <li>Plan better for future garden projects</li>
      </ul>
     </article>

    </div>

   </div>
  </section>
 );

}

export default About;