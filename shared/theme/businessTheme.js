const STORAGE_KEY="ecosphere:business-theme";

const tokenMap={
 bg:"--bg",bgAlt:"--bg-alt",surface:"--surface",surface2:"--surface-2",
 text:"--text",textSoft:"--text-soft",textInverse:"--text-inverse",heading:"--heading",
 primary:"--primary",primaryHover:"--primary-hover",secondary:"--secondary",
 secondaryHover:"--secondary-hover",accent:"--accent",accentHover:"--accent-hover",
 accent2:"--accent-2",success:"--success",warning:"--warning",danger:"--danger",
 info:"--info",border:"--border",borderStrong:"--border-strong",
 gradientMain:"--gradient-main",gradientSoft:"--gradient-soft",overlay:"--overlay",
 tableStripe:"--table-stripe",selectionBg:"--selection-bg",selectionText:"--selection-text"
};

const unwrap=data=>data?.business||data?.data||data;
const valueOf=value=>typeof value==="string"?value.trim():typeof value?.value==="string"?value.value.trim():"";

export const applyBusinessTheme=input=>{
 const business=unwrap(input);
 if(!business)return false;

 try{localStorage.setItem(STORAGE_KEY,JSON.stringify(business));}catch{void 0;}

 const theme=business.themeColors||{};
 for(const [key,property] of Object.entries(tokenMap)){
  const value=valueOf(theme[key]);
  if(value)document.documentElement.style.setProperty(property,value);
 }

 const heading=theme.fontHeading?.fontName;
 const body=theme.fontBody?.fontName;
 if(heading)document.documentElement.style.setProperty("--font-heading",`"${heading}",${theme.fontHeading?.fallbackFont||"serif"}`);
 if(body)document.documentElement.style.setProperty("--font-body",`"${body}",${theme.fontBody?.fallbackFont||"sans-serif"}`);
 return true;
};

export const restoreCachedBusinessTheme=()=>{
 try{return applyBusinessTheme(JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"));}
 catch{return false;}
};

const STARTUP_RETRY_DELAYS=[0,400,1000,2000,4000];

const wait=delay=>new Promise(resolve=>setTimeout(resolve,delay));

export const loadBusinessTheme=async appKey=>{
 restoreCachedBusinessTheme();
 if(!appKey)return;

 for(const delay of STARTUP_RETRY_DELAYS){
  if(delay)await wait(delay);

  try{
   const response=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`);
   if(response.ok){
    applyBusinessTheme(await response.json());
    return;
   }

   if(response.status!==404&&response.status<500)return;
  }catch{
   // Retry while the backend is still starting; the cached theme remains active.
  }
 }
};

restoreCachedBusinessTheme();
