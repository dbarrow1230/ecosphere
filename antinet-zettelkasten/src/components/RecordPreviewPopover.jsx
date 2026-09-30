import {OverlayTrigger,Popover} from "react-bootstrap";
import {richTextToPlainText} from "../utils/richText.js";

function RecordPreviewPopover({record,code,title}){
 const details=[
  ["Main idea",richTextToPlainText(record?.mainIdea)],
  ["Summary",richTextToPlainText(record?.summary)],
  ["Description",richTextToPlainText(record?.description)],
  ["Role / use",richTextToPlainText(record?.roleUse)],
  ["Author",record?.author],
  ["Publisher",record?.publisher],
  ["Entity type",record?.entityType],
  ["Subtype",Array.isArray(record?.subtype)?record.subtype.map(item=>item?.name||item?.code||item).join(", "):record?.subtype],
  ["Status",record?.status]
 ].filter(([,value])=>value);
 const popover=(
  <Popover className="record-preview-popover">
   <Popover.Header>{title||"Untitled record"}</Popover.Header>
   <Popover.Body>
    {details.length?(
     <dl>{details.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    ):<p>No additional record information is available.</p>}
   </Popover.Body>
  </Popover>
 );

 return(
  <OverlayTrigger placement="auto" delay={{show:250,hide:150}} overlay={popover}>
   <a className="record-preview-trigger" href={`#${code}`} onClick={event=>event.preventDefault()}><code>{code}</code></a>
  </OverlayTrigger>
 );
}

export default RecordPreviewPopover;
