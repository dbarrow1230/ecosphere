const makeIcon=symbol=>function AdminIcon({size=18,className="",...props}){
 return <span {...props} className={`admin-inline-icon ${className}`.trim()} style={{display:"inline-flex",width:size,height:size,alignItems:"center",justifyContent:"center",fontWeight:700}} aria-hidden="true">{symbol}</span>;
};

export const Edit=makeIcon("E");
export const Plus=makeIcon("+");
export const RefreshCw=makeIcon("R");
export const Trash2=makeIcon("×");
export const Save=makeIcon("S");
export const Shield=makeIcon("P");
export const UserCog=makeIcon("U");
export const Building2=makeIcon("B");
