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

const clampNumber=(value,min,max,defaultValue)=>{
 const numericValue=Number(value);
 if(!Number.isFinite(numericValue))return defaultValue;
 return Math.max(min,Math.min(max,numericValue));
};

const normalizeBackgroundTreatment=value=>{
 const incoming=value&&typeof value==="object"&&!Array.isArray(value)?value:{};
 const mode=["color","gradient","image"].includes(incoming.mode)?incoming.mode:"color";
 const gradientType=["linear","radial"].includes(incoming.gradientType)?incoming.gradientType:"linear";

 return {
  mode,
  image:String(incoming.image||""),
  imageOpacity:clampNumber(incoming.imageOpacity,0,1,0.08),
  imageSize:String(incoming.imageSize||"cover"),
  imagePosition:String(incoming.imagePosition||"center"),
  imageRepeat:String(incoming.imageRepeat||"no-repeat"),
  overlayOpacity:clampNumber(incoming.overlayOpacity,0,1,0),
  gradientType,
  gradientDirection:String(incoming.gradientDirection||"180deg"),
  gradientStart:String(incoming.gradientStart||"#cfdcc8"),
  gradientEnd:String(incoming.gradientEnd||"#b7c9ad"),
  gradientStartStop:clampNumber(incoming.gradientStartStop,0,100,0),
  gradientEndStop:clampNumber(incoming.gradientEndStop,0,100,100)
 };
};

const buildGradientValue=treatment=>{
 const normalizedTreatment=normalizeBackgroundTreatment(treatment);

 if(normalizedTreatment.gradientType==="radial"){
  return `radial-gradient(circle,${normalizedTreatment.gradientStart} ${normalizedTreatment.gradientStartStop}%,${normalizedTreatment.gradientEnd} ${normalizedTreatment.gradientEndStop}%)`;
 }

 return `linear-gradient(${normalizedTreatment.gradientDirection},${normalizedTreatment.gradientStart} ${normalizedTreatment.gradientStartStop}%,${normalizedTreatment.gradientEnd} ${normalizedTreatment.gradientEndStop}%)`;
};

export const clearBusinessTheme=()=>{
 const root=document.documentElement;

 themeTokens.forEach(token=>{
  root.style.removeProperty(token);
 });

 root.style.removeProperty("--font-heading");
 root.style.removeProperty("--font-body");
 root.style.removeProperty("--app-background");
 root.style.removeProperty("--app-page-background");
 root.style.removeProperty("--app-background-image");
 root.style.removeProperty("--app-background-image-opacity");
 root.style.removeProperty("--app-background-image-size");
 root.style.removeProperty("--app-background-image-position");
 root.style.removeProperty("--app-background-image-repeat");
 root.style.removeProperty("--app-background-overlay-opacity");

 try{
  const cachedBusiness=JSON.parse(localStorage.getItem(themeStorageKey)||"null");
  if(cachedBusiness)applyBusinessTheme(cachedBusiness);
 }catch{
  // Keep the default theme when cached data is unavailable or invalid.
 }

};

export const applyBusinessTheme=business=>{
 if(!business)return;

 try{
  localStorage.setItem(themeStorageKey,JSON.stringify(business));
 }catch{
  // Theme persistence is an enhancement; applying it must still work when storage is unavailable.
 }

 const root=document.documentElement;
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

 const backgroundTreatment=normalizeBackgroundTreatment(theme.backgroundTreatment);

 if(backgroundTreatment.mode==="gradient"){
 root.style.setProperty("--app-background",buildGradientValue(backgroundTreatment));
  root.style.setProperty("--app-page-background","var(--app-background)");
  root.style.setProperty("--app-background-image","none");
  root.style.setProperty("--app-background-image-opacity","0");
  root.style.setProperty("--app-background-overlay-opacity","0");
 }else if(backgroundTreatment.mode==="image"&&backgroundTreatment.image){
  root.style.setProperty("--app-background","var(--bg)");
  root.style.setProperty("--app-page-background","transparent");
  root.style.setProperty("--app-background-image",`url("${backgroundTreatment.image}")`);
  root.style.setProperty("--app-background-image-opacity",String(backgroundTreatment.imageOpacity));
  root.style.setProperty("--app-background-image-size",backgroundTreatment.imageSize);
  root.style.setProperty("--app-background-image-position",backgroundTreatment.imagePosition);
  root.style.setProperty("--app-background-image-repeat",backgroundTreatment.imageRepeat);
  root.style.setProperty("--app-background-overlay-opacity",String(backgroundTreatment.overlayOpacity));
 }else{
  root.style.setProperty("--app-background","var(--bg)");
  root.style.setProperty("--app-page-background","var(--app-background)");
  root.style.setProperty("--app-background-image","none");
  root.style.setProperty("--app-background-image-opacity","0");
  root.style.setProperty("--app-background-overlay-opacity","0");
 }
};

try{
 const cachedBusiness=JSON.parse(localStorage.getItem(themeStorageKey)||"null");
 if(cachedBusiness)applyBusinessTheme(cachedBusiness);
}catch{
 // Ignore malformed or unavailable cached theme data.
}

const retryBusinessThemeAtStartup=async(attempt=0)=>{
 const appKey=String(document.querySelector('meta[name="app-key"]')?.content||window.APP_CONFIG?.APP_KEY||"").trim().toLowerCase();
 if(!appKey)return;
 try{
  const response=await fetch(`/api/app/current-business/${encodeURIComponent(appKey)}`);
  if(response.ok){applyBusinessTheme(await response.json());return;}
  if(response.status!==404&&response.status<500)return;
 }catch{ /* The backend may still be starting. */ }
 if(attempt<4)setTimeout(()=>retryBusinessThemeAtStartup(attempt+1),[400,1000,2000,4000][attempt]);
};

queueMicrotask(()=>retryBusinessThemeAtStartup());
