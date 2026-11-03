export function isValidUpc(value){
 const text=String(value??"");
 if(!/^\d{12}$/.test(text))return false;
 const sum=[...text.slice(0,11)].reduce((total,digit,index)=>total+Number(digit)*(index%2===0?3:1),0);
 return (10-sum%10)%10===Number(text[11]);
}

const upcLeft=["0001101","0011001","0010011","0111101","0100011","0110001","0101111","0111011","0110111","0001011"];

// Encode the stored digits exactly; checksum validation remains separate.
export function upcBars(value){
 const text=String(value??"");
 if(!/^\d{12}$/.test(text))return "";
 const left=[...text.slice(0,6)].map(digit=>upcLeft[Number(digit)]).join("");
 const right=[...text.slice(6)].map(digit=>[...upcLeft[Number(digit)]].map(bit=>bit==="1"?"0":"1").join("")).join("");
 return "101"+left+"01010"+right+"101";
}
