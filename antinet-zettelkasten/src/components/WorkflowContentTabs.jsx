import {Tab,Tabs} from "react-bootstrap";
import RichTextContent from "./RichTextContent.jsx";
import "../styles/RecordDetail.css";

export default function WorkflowContentTabs({recordId,tabs=[],defaultTab}){
 return <section className="workflow-content-panel">
  <Tabs key={recordId} defaultActiveKey={defaultTab||tabs[0]?.key} className="workflow-content-tabs">
   {tabs.map(tab=><Tab key={tab.key} eventKey={tab.key} title={tab.title}>
    <div className="workflow-content-text" tabIndex={0} role="region" aria-label={tab.title}>
     {tab.content??<RichTextContent value={tab.value}/>}
    </div>
   </Tab>)}
  </Tabs>
 </section>;
}
