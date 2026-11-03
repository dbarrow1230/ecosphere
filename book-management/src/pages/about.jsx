// src/pages/about.jsx
import "../styles/About.css";

function About(){

 return(
  <section className="about-page">
   <div className="about-page__container">

    <div className="about-page__hero">
     <p className="about-page__eyebrow">About Us</p>
     <h1 className="about-page__title">Barrow Coffee Delights</h1>
     <p className="about-page__lead">
      Barrow Coffee Delights is a warm and welcoming coffee experience built around quality, comfort, and connection. We bring together freshly brewed coffee, baked treats, and inviting surroundings to create moments worth savoring.
     </p>
    </div>

    <div className="about-page__grid">

     <article className="about-page__card">
      <h2 className="about-page__heading">Our Story</h2>
      <p className="about-page__text">
       What began as a love for rich coffee and comforting flavors grew into a space designed for community, conversation, and everyday indulgence. Barrow Coffee Delights is rooted in the idea that great coffee should feel personal, memorable, and full of warmth.
      </p>
      <p className="about-page__text">
       From the first pour to the final bite, every detail is meant to reflect hospitality, craft, and care. Whether you stop in for your morning cup, a midday reset, or a quiet place to unwind, our goal is to make every visit feel special.
      </p>
     </article>

     <article className="about-page__card">
      <h2 className="about-page__heading">What We Serve</h2>
      <p className="about-page__text">
       Our menu is centered on freshly brewed coffee, espresso drinks, comforting pastries, and delicious café favorites. We focus on flavor, consistency, and presentation so every order feels satisfying and thoughtfully prepared.
      </p>
      <p className="about-page__text">
       Barrow Coffee Delights is more than a coffee stop. It is a place where guests can enjoy quality beverages, enjoy baked comfort, and take a moment to slow down in a welcoming atmosphere.
      </p>
     </article>

     <article className="about-page__card">
      <h2 className="about-page__heading">Our Mission</h2>
      <p className="about-page__text">
       Our mission is to serve excellent coffee and delightful food while creating an experience that feels warm, inviting, and community-centered. We believe in simple pleasures done well, genuine hospitality, and a space that encourages people to gather, reflect, and connect.
      </p>
     </article>

     <article className="about-page__card">
      <h2 className="about-page__heading">Why Guests Love Us</h2>
      <ul className="about-page__list">
       <li>Freshly brewed coffee made with care</li>
       <li>Warm pastries and satisfying café treats</li>
       <li>A cozy atmosphere with inviting design</li>
       <li>Friendly service and a welcoming experience</li>
       <li>A relaxing place to meet, work, or unwind</li>
      </ul>
     </article>

    </div>

   </div>
  </section>
 );

}

export default About;