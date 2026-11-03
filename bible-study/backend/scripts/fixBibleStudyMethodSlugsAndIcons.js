// backend/scripts/fixBibleStudyMethodSlugsAndIcons.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({path:"backend/.env"});

const MONGO_URI=process.env.MONGO_URI||process.env.MONGODB_URI||process.env.DATABASE_URL;

const updates=[
 {
  titles:[
   "Book Bible Study Method",
   "Book Study Method"
  ],
  slug:"book-bible-study-method"
 },
 {
  titles:[
   "Chapter Bible Study Method",
   "Chapter Study Method"
  ],
  slug:"chapter-bible-study-method"
 },
 {
  titles:[
   "Inductive Bible Bible Study",
   "Inductive Bible Study Method",
   "Inductive Study Method"
  ],
  slug:"inductive-bible-study-method"
 },
 {
  titles:[
   "S.O.A.P  Bible Study Method",
   "S.O.A.P Bible Study Method",
   "SOAP Bible Study Method",
   "SOAP Method"
  ],
  slug:"soap-bible-study-method"
 },
 {
  titles:[
   "Historical Bible Study Method",
   "Historical Study Method"
  ],
  slug:"historical-bible-study-method"
 },
 {
  titles:[
   "Parallel Passage Bible Study Method",
   "Parallel Passage Study Method"
  ],
  slug:"parallel-passage-bible-study-method"
 },
 {
  titles:[
   "Cross-Reference Bible Study Method",
   "Cross Reference Bible Study Method",
   "Cross-Reference Study Method",
   "Cross Reference Study Method"
  ],
  slug:"cross-reference-bible-study-method"
 },
 {
  titles:[
   "Devotional Bible Study Method",
   "Devotional Study Method"
  ],
  slug:"devotional-bible-study-method"
 },
 {
  titles:[
   "Meditation Bible Study Method",
   "Meditation Study Method"
  ],
  slug:"meditation-bible-study-method"
 },
 {
  titles:[
   "Lectio Divina Bible Study Method",
   "Lectio Divina Method"
  ],
  slug:"lectio-divina-bible-study-method"
 },
 {
  titles:[
   "ACTS Bible Study Method",
   "ACTS Study Method",
   "ACTS Method"
  ],
  slug:"acts-bible-study-method"
 },
 {
  titles:[
   "FEAST Bible Study Method",
   "FEAST Study Method",
   "FEAST Method"
  ],
  slug:"feast-bible-study-method"
 },
 {
  titles:[
   "Character Bible Study Method",
   "Character Study Method"
  ],
  slug:"character-bible-study-method"
 },
 {
  titles:[
   "Leadership Bible Study Method",
   "Leadership Study Method"
  ],
  slug:"leadership-bible-study-method"
 },
 {
  titles:[
   "Biographical Bible Study Method",
   "Biographical Study Method"
  ],
  slug:"biographical-bible-study-method"
 },
 {
  titles:[
   "Word Bible Study Method",
   "Word Study Method"
  ],
  slug:"word-bible-study-method"
 },
 {
  titles:[
   "Key Word Bible Study Method",
   "Keyword Bible Study Method",
   "Key Word Study Method",
   "Keyword Study Method"
  ],
  slug:"key-word-bible-study-method"
 },
 {
  titles:[
   "Original Language Bible Study Method",
   "Original Language Study Method"
  ],
  slug:"original-language-bible-study-method"
 },
 {
  titles:[
   "Topical Bible Study Method",
   "Topical Study Method"
  ],
  slug:"topical-bible-study-method"
 },
 {
  titles:[
   "Doctrinal Bible Study Method",
   "Doctrinal Study Method"
  ],
  slug:"doctrinal-bible-study-method"
 },
 {
  titles:[
   "Thematic Bible Study Method",
   "Thematic Study Method"
  ],
  slug:"thematic-bible-study-method"
 },
 {
  titles:[
   "Outline Bible Study Method",
   "Outline Study Method"
  ],
  slug:"outline-bible-study-method"
 },
 {
  titles:[
   "Expository Bible Study Method",
   "Expository Study Method"
  ],
  slug:"expository-bible-study-method"
 },
 {
  titles:[
   "Verse By Verse Bible Study Method",
   "Verse-by-Verse Bible Study Method",
   "Verse By Verse Study Method",
   "Verse-by-Verse Study Method"
  ],
  slug:"verse-by-verse-bible-study-method"
 },
 {
  titles:[
   "Passage Bible Study Method",
   "Passage Study Method"
  ],
  slug:"passage-bible-study-method"
 },
 {
  titles:[
   "Observation Bible Study Method",
   "Observation Study Method"
  ],
  slug:"observation-bible-study-method"
 },
 {
  titles:[
   "Application Bible Study Method",
   "Application Study Method"
  ],
  slug:"application-bible-study-method"
 }
];

async function run(){
 if(!MONGO_URI){
  console.error("Missing MONGO_URI, MONGODB_URI, or DATABASE_URL in backend/.env");
  process.exit(1);
 }

 await mongoose.connect(MONGO_URI);

 const collection=mongoose.connection.collection("bible_study_methods");

 for(const item of updates){
  const result=await collection.findOneAndUpdate(
   {title:{$in:item.titles}},
   {
    $set:{
     slug:item.slug
    }
   },
   {returnDocument:"after"}
  );

  if(result){
   console.log(`Updated slug: ${result.title} -> ${result.slug}`);
  }else{
   console.log(`Not found: ${item.titles.join(" | ")}`);
  }
 }

 await mongoose.disconnect();
 console.log("Done.");
}

run().catch(async err=>{
 console.error(err);
 await mongoose.disconnect();
 process.exit(1);
});