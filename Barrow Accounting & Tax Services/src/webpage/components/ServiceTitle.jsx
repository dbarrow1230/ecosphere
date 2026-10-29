import {Calculator,BookOpen,ReceiptText,Stamp} from "lucide-react";

const icons={"01":Calculator,"02":BookOpen,"03":ReceiptText,"04":Stamp};
export default function ServiceTitle({service,as:Heading="h3"}){
 const Icon=icons[service.number];
 return <Heading className="bats-service-title">{Icon&&<Icon size={24} strokeWidth={1.7} aria-hidden="true"/>}<span>{service.title}</span></Heading>;
}
