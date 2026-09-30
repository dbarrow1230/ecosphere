import {useEffect,useState} from "react";
import {useLocation} from "react-router-dom";
import {useIcons} from "@shared";

export default function ScrollToTop(){
 const {pathname}=useLocation();
 const {FontAwesomeIcons}=useIcons();
 const [visible,setVisible]=useState(false);

 useEffect(()=>{window.scrollTo(0,0);},[pathname]);
 useEffect(()=>{
  const handleScroll=()=>setVisible(window.scrollY>300);
  window.addEventListener("scroll",handleScroll);
  return()=>window.removeEventListener("scroll",handleScroll);
 },[]);

 return visible?<button type="button" className="scroll-to-top-btn" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})} aria-label="Scroll to top">
  {FontAwesomeIcons.ArrowUp}
 </button>:null;
}
