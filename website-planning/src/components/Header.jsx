// src/components/Header.jsx
import {useEffect,useState} from "react";
import logo from "../images/logo.png";
import {CurrentDateTime} from "@shared";
import "./Header.css";

function Header({
    logoAlt="Website Planning logo",
    eyebrow="Website Planning System",
    title="Website Planning",
    text="Plan website content, pages, navigation, tasks, and publishing workflows.",
    userDetails=null,
    onTitleChange
}){

 useEffect(()=>{if(onTitleChange)onTitleChange(title);},[title,onTitleChange]);
 const [currentUser,setCurrentUser]=useState(userDetails||{});

 useEffect(()=>{
  if(onTitleChange)onTitleChange(title);
 },[title,onTitleChange]);

 const getObjectId=value=>{
  if(!value)
  {
   return "";
  }

  if(typeof value==="string")
  {
   return value;
  }

  if(typeof value==="object")
  {
   if(typeof value.$oid==="string")
   {
    return value.$oid;
   }

   if(typeof value._id==="string")
   {
    return value._id;
   }

   if(typeof value.id==="string")
   {
    return value.id;
   }

   if(typeof value._id?.$oid==="string")
   {
    return value._id.$oid;
   }

   if(typeof value.id?.$oid==="string")
   {
    return value.id.$oid;
   }
  }

  return "";
 };

 const isObjectId=value=>/^[a-f\d]{24}$/i.test(String(value||""));

 useEffect(()=>{
  const userId=getObjectId(userDetails);

  queueMicrotask(()=>setCurrentUser(userDetails||{}));

  if(!isObjectId(userId))
  {
   return;
  }

  let ignore=false;

  const loadCurrentUser=async()=>{
   try
   {
    const res=await fetch(`/api/users/${userId}`);
    const data=await res.json();

    if(!res.ok)
    {
     return;
    }

    const loadedUser=data.data||data.user||data;

    if(!ignore&&loadedUser)
    {
     setCurrentUser(loadedUser);

     try
     {
      const storedKeys=["userInfo","user","authUser","currentUser"];

      for(const key of storedKeys)
      {
       const raw=localStorage.getItem(key);

       if(raw)
       {
        const parsed=JSON.parse(raw);

        if(parsed?.user)
        {
         localStorage.setItem(key,JSON.stringify({...parsed,user:loadedUser}));
        }
        else if(parsed?.data)
        {
         localStorage.setItem(key,JSON.stringify({...parsed,data:loadedUser}));
        }
        else
        {
         localStorage.setItem(key,JSON.stringify(loadedUser));
        }
       }

       const sessionRaw=sessionStorage.getItem(key);

       if(sessionRaw)
       {
        const parsed=JSON.parse(sessionRaw);

        if(parsed?.user)
        {
         sessionStorage.setItem(key,JSON.stringify({...parsed,user:loadedUser}));
        }
        else if(parsed?.data)
        {
         sessionStorage.setItem(key,JSON.stringify({...parsed,data:loadedUser}));
        }
        else
        {
         sessionStorage.setItem(key,JSON.stringify(loadedUser));
        }
       }
      }
     }
     catch(err)
     {
      console.error("Stored user refresh error",err);
     }
    }
   }
   catch(err)
   {
    console.error("Header user load error",err);
   }
  };

  loadCurrentUser();

  return()=>{
   ignore=true;
  };
 },[userDetails]);

 const details=currentUser?.userDetails||currentUser?.details||{};

 const fullName=[
  details?.firstName,
  details?.lastName
 ].filter(Boolean).join(" ");

 return(
  <header className="site-header">
   <div className="site-header-inner">
    <div className="site-header-content">

     <div className="site-header-col site-header-col-left">
      <div className="site-header-logo-wrap">
       {logo&&(
        <img src={logo} alt={logoAlt} className="site-header-logo"/>
       )}
      </div>

      <div className="site-header-text-wrap">
       <p className="site-header-eyebrow">{eyebrow}</p>

       <h1 className="site-header-title">
        {fullName&&<span className="site-header-user">{fullName}'s </span>}
        <span className="site-header-title-leafy">{title}</span>
       </h1>

       <p className="site-header-text">{text}</p>
      </div>
     </div>

     <div className="site-header-col site-header-col-right">
      <div className="site-header-datetime">
       <CurrentDateTime/>
      </div>
     </div>

    </div>
   </div>
  </header>
 );
}

export default Header;
