const allowedCharacters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,?/=";

export const parseMorsePracticeText=(value)=>{
 const raw=value||"";
 const upper=raw.toUpperCase();
 const unsupportedCharacters=[];
 let parsedText="";

 for(const char of upper){
  if(char===" "||char==="\n"||char==="\t"){
   parsedText+=" ";
  }else if(allowedCharacters.includes(char)){
   parsedText+=char;
  }else{
   if(!unsupportedCharacters.includes(char)){
    unsupportedCharacters.push(char);
   }
  }
 }

 parsedText=parsedText.replace(/\s+/g," ").trim();

 return {
  parsedText,
  unsupportedCharacters,
  wordCount:parsedText?parsedText.split(" ").length:0,
  characterCount:parsedText.replace(/\s/g,"").length
 };
};