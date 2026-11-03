export const makeSku=(name,price)=>{
 const namePart=String(name||"").trim().toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,16)||"PRODUCT";
 const cents=Math.round(Number(price||0)*100);
 return `${namePart}${String(Number.isFinite(cents)?cents:0).padStart(6,"0")}`;
};

export const buildBarcodeData=(name,price)=>makeSku(name,price);
