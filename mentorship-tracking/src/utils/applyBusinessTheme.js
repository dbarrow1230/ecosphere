// src/utils/applyBusinessTheme.js
const themeTokenMap={
 bg:"--bg",
 bgAlt:"--bg-alt",
 surface:"--surface",
 surface2:"--surface-2",
 text:"--text",
 textSoft:"--text-soft",
 textInverse:"--text-inverse",
 heading:"--heading",
 primary:"--primary",
 primaryHover:"--primary-hover",
 secondary:"--secondary",
 secondaryHover:"--secondary-hover",
 accent:"--accent",
 accentHover:"--accent-hover",
 accent2:"--accent-2",
 success:"--success",
 warning:"--warning",
 danger:"--danger",
 info:"--info",
 border:"--border",
 borderStrong:"--border-strong",
 gradientMain:"--gradient-main",
 gradientSoft:"--gradient-soft",
 overlay:"--overlay",
 tableStripe:"--table-stripe",
 selectionBg:"--selection-bg",
 selectionText:"--selection-text"
};

const themeTokens=Object.values(themeTokenMap);
const themeStorageKey="ecosphere:business-theme";

const fontLinkIds=new Set();

const loadGoogleFont=fontName=>{
 const cleanName=String(fontName||"").trim();
 if(!cleanName)return;

 const id=`font-${cleanName.replace(/\s+/g,"-").toLowerCase()}`;
 if(fontLinkIds.has(id)||document.getElementById(id))return;

 const link=document.createElement("link");
 link.id=id;
 link.rel="stylesheet";
 link.href=`https://fonts.googleapis.com/css2?family=${cleanName.replace(/\s+/g,"+")}:wght@300;400;500;600;700;800&display=swap`;

 document.head.appendChild(link);
 fontLinkIds.add(id);
};

const getThemeColorValue=token=>{
 if(!token)return "";
 if(typeof token==="string")return token.trim();
 if(typeof token==="object"&&typeof token.value==="string")return token.value.trim();
 return "";
};

const unwrapBusiness=data=>{
 if(!data||typeof data!=="object")return null;
 if(data.business&&typeof data.business==="object")return data.business;
 if(data.data&&typeof data.data==="object"&&!Array.isArray(data.data))return data.data;
 return data;
};

export const clearBusinessTheme=(restoreSaved=true)=>{
 const root=document.documentElement;

 themeTokens.forEach(token=>{
  root.style.removeProperty(token);
 });

 root.style.removeProperty("--font-heading");
 root.style.removeProperty("--font-body");

 if(restoreSaved){
  try{
   const cachedBusiness=JSON.parse(localStorage.getItem(themeStorageKey)||"null");
   if(cachedBusiness)applyBusinessTheme(cachedBusiness);
  }catch{
   // Keep the default theme when cached data is unavailable or invalid.
  }
 }
};

export const applyBusinessTheme=input=>{
 const business=unwrapBusiness(input);
 if(!business)return;

 try{
  localStorage.setItem(themeStorageKey,JSON.stringify(business));
 }catch{
  // Theme persistence is an enhancement; applying it must still work when storage is unavailable.
 }

 const root=document.documentElement;

 clearBusinessTheme(false);

 const theme=business.themeColors&&typeof business.themeColors==="object"?business.themeColors:{};

 Object.entries(themeTokenMap).forEach(([key,cssVar])=>{
  const value=getThemeColorValue(theme[key]);
  if(value)root.style.setProperty(cssVar,value);
 });

 const headingFontName=theme.fontHeading?.fontName?.trim();
 const headingFallback=theme.fontHeading?.fallbackFont?.trim()||"serif";

 if(headingFontName){
  loadGoogleFont(headingFontName);
  root.style.setProperty("--font-heading",`"${headingFontName}",${headingFallback}`);
 }

 const bodyFontName=theme.fontBody?.fontName?.trim();
 const bodyFallback=theme.fontBody?.fallbackFont?.trim()||"sans-serif";

 if(bodyFontName){
  loadGoogleFont(bodyFontName);
  root.style.setProperty("--font-body",`"${bodyFontName}",${bodyFallback}`);
 }
};

try{
 const cachedBusiness=JSON.parse(localStorage.getItem(themeStorageKey)||"null");
 if(cachedBusiness)applyBusinessTheme(cachedBusiness);
}catch{
 // Ignore malformed or unavailable cached theme data.
}
