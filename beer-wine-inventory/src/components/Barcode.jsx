import {upcBars} from "../utils/upc.js";

export default function Barcode({value}){
 const text=String(value??"");
 const bars=upcBars(text);
 if(!bars)return null;
 return <span className="barcode-preview"><svg className="upc-barcode" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 117 48" width="152" height="62" role="img" aria-label={`UPC ${text}`}>
  <title>{`UPC ${text}`}</title>
  <rect width="117" height="48" fill="white"/>
  {[...bars].map((bit,index)=>bit==="1"?<rect key={index} x={index+11} y="3" width="1" height={index<3||index>=92||index>=45&&index<50?32:27} fill="black"/>:null)}
  <text x="5" y="43" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="black">{text[0]}</text>
  <text x="35" y="43" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="black">{text.slice(1,6)}</text>
  <text x="81" y="43" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="black">{text.slice(6,11)}</text>
  <text x="112" y="43" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="black">{text[11]}</text>
 </svg></span>;
}
