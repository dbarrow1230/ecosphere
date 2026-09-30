export const scoreMorseAnswer=(targetText,userAnswer)=>{
 const target=(targetText||"").toUpperCase().trim();
 const answer=(userAnswer||"").toUpperCase().trim();

 let correctCharacters=0;
 let incorrectCharacters=0;
 let missedCharacters=0;

 for(let i=0;i<target.length;i++){
  if(answer[i]===target[i]){
   correctCharacters++;
  }else if(answer[i]){
   incorrectCharacters++;
  }else{
   missedCharacters++;
  }
 }

 const extraCharacters=answer.length>target.length?answer.length-target.length:0;
 incorrectCharacters+=extraCharacters;

 const accuracy=target.length?Math.round((correctCharacters/target.length)*100):0;

 return {
  correctCharacters,
  incorrectCharacters,
  missedCharacters,
  accuracy
 };
};