import {Tab,Table,Tabs} from "react-bootstrap";
import Barcode from "react-barcode";
import {makeSku,buildBarcodeData} from "../../shared/productIdentifiers.js";
import {groupProductSections} from "../utils/groupProductSections.js";
import "../styles/ProductDetails.css";

const text=value=>value===undefined||value===null||value===""?"—":value;
const money=value=>value===undefined||value===null||value===""?"—":`$${Number(value).toFixed(2)}`;

export default function ProductDetailsTabs({product,details}){
 const sku=makeSku(product.name,product.price);
 const barcodeValue=buildBarcodeData(product.name,product.price);
 const image=Array.isArray(product.image)?product.image.find(Boolean):product.image;
 const sectionGroups=groupProductSections(details?.sections,{includeEmpty:true});
 const fields=[
  ["SKU",sku],
  ["Price",money(product.price)],
  ...(product.compareAtPrice?[["Compare At Price",money(product.compareAtPrice)]]:[]),
  ["Stock",Number(product.quantity||0).toLocaleString()],
  ["Short Description",text(product.shortDescription)],
  ["Description",text(product.description)]
 ];

 return <Tabs defaultActiveKey="product" className="mb-3 product-view-tabs">
  <Tab eventKey="product" title="Product">
   <div className="product-tab-layout">
    <dl className="product-inline-fields">
     {fields.map(([label,value])=><div className="product-inline-row" key={label}><dt>{label}:</dt><dd>{value}</dd></div>)}
    </dl>
    <aside className="product-customer-media">
     <div className="product-customer-image-space">
      {image?<img className="product-customer-image" src={image} alt={product.name} />:<span>Product image</span>}
     </div>
     <div className="product-customer-barcode" role="img" aria-label={`Barcode for ${sku}`}>
      <Barcode value={barcodeValue} format="CODE128" width={1.1} height={56} displayValue={false} margin={0} background="var(--surface)" lineColor="var(--heading)" />
      <div className="product-customer-barcode-name">{product.name}</div>
      <div>{money(product.price)}</div>
      <div className="product-customer-barcode-code">{barcodeValue}</div>
     </div>
    </aside>
   </div>
  </Tab>
  {sectionGroups.map(group=><Tab eventKey={group.key} title={group.label} key={group.key}>
   {group.sections.length?<dl className="product-inline-fields product-saved-details">
    {group.sections.map((section,index)=>{
     const content=section.content?.split("\n").filter(line=>!section.tables?.length||(!line.includes("\t")&&!/^\s*\|.*\|\s*$/.test(line))).join("\n").trim();
     return <div className="product-inline-row" key={`${section.title}-${index}`}>
      <dt>{section.title}:</dt>
      <dd>
       {content&&<div className="product-details-text">{content}</div>}
       {section.tables?.map((table,tableIndex)=><Table striped bordered responsive size="sm" key={tableIndex} className="mt-2 mb-0">
        <thead><tr>{table.headers.map((header,cellIndex)=><th key={cellIndex}>{header}</th>)}</tr></thead>
        <tbody>{table.rows.map((row,rowIndex)=><tr key={rowIndex}>{row.map((cell,cellIndex)=><td key={cellIndex}>{cell}</td>)}</tr>)}</tbody>
       </Table>)}
       {!content&&!section.tables?.length&&"—"}
      </dd>
     </div>;
    })}
   </dl>:<p>No {group.label.toLowerCase()} information has been saved for this product.</p>}
  </Tab>)}
 </Tabs>;
}
