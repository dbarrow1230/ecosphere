// Populated reference documents must be rendered as labels, never as objects.
export function vendorDisplayText(value){
 if(value==null)return '';
 if(typeof value==='string'||typeof value==='number')return String(value);
 if(Array.isArray(value))return value.map(vendorDisplayText).filter(Boolean).join(', ');
 return value.name||value.state_name||value.country_name||value.abbreviation||value.state_abbrev||'';
}
