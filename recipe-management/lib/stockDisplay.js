export function storageArea(name=''){
 const text=name.toLowerCase();
 if(/\bfrozen\b/.test(text))return 'Frozen Foods';
 if(/\b(?:milk|cream|creamer|cheese|butter|yogurt)\b/.test(text))return 'Dairy';
 if(/\b(?:chicken|turkey|beef|steak|pork|lamb|veal|bacon|sausage)\b/.test(text)&&! /\b(?:sauce|beans)\b/.test(text))return 'Meat & Poultry';
 if(/\b(?:salmon|shrimp|fish|cod|tilapia|shellfish|scallop)\b/.test(text))return 'Seafood';
 if(/\b(?:salad|spring mix)\b/.test(text))return 'Refrigerated Prepared Foods';
 if(/\b(?:oil|canned|marinated|flour|rice|pasta|beans|extract|sauce)\b/.test(text))return 'Dry Storage';
 if(/\b(?:mushrooms?|lemongrass|squash|lettuce|romaine|carrots?|potatoes?|peppers?|onions?|garlic|fruit|apples?|pears?|cauliflower|broccoli|basil|herbs?)\b/.test(text))return 'Produce';
 return '';
}
const rounded=value=>new Intl.NumberFormat('en-US',{maximumFractionDigits:2}).format(value);
export function stockAmounts(item){const n=Number(item.quantityOnHand||0);if(item.unit==='g')return {imperial:rounded(n/453.59237)+' lb',metric:rounded(n/1000)+' kg',count:'—'};if(item.unit==='ml')return {imperial:rounded(n/29.5735295625)+' fl oz',metric:rounded(n/1000)+' L',count:'—'};return {imperial:'—',metric:'—',count:rounded(n)+' '+(item.unit==='pack'?(n===1?'pack':'packs'):item.unit||'each')};}
