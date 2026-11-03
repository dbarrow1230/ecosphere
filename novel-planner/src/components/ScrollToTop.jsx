// src/components/ScrollToTop.jsx
import {useEffect,useState} from "react";
import {useLocation} from "react-router-dom";

function ScrollToTop(){
 const {pathname,hash}=useLocation();
 const [visible,setVisible]=useState(false);

 useEffect(()=>{
  if(hash){
   const target=document.getElementById(decodeURIComponent(hash.slice(1)));
   if(target){
    target.scrollIntoView({block:"start"});
    return;
   }
  }

  window.scrollTo(0,0);
 },[pathname,hash]);

 useEffect(()=>{
  const handleScroll=()=>setVisible(window.scrollY>300);

  window.addEventListener("scroll",handleScroll);

  return()=>window.removeEventListener("scroll",handleScroll);
 },[]);

 const scrollToTop=()=>{
  window.scrollTo({top:0,behavior:"smooth"});
 };

 return visible?(
  <button type="button" className="scroll-to-top-btn" onClick={scrollToTop} aria-label="Scroll to top">
   <span aria-hidden="true">↑</span>
  </button>
 ):null;
}

export default ScrollToTop;
