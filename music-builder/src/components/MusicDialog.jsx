import {createContext,useContext,useEffect} from "react";
import {createPortal} from "react-dom";

const DialogContext=createContext(()=>{});

export function MusicDialog({show,onHide,children,dialogClassName="",className=""}){
 useEffect(()=>{if(!show)return;const previous=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=previous;};},[show]);
 if(!show)return null;
 return createPortal(<DialogContext.Provider value={onHide}><div className={`music-dialog-backdrop ${className}`} role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onHide?.();}}><section className={`music-dialog ${dialogClassName}`} role="dialog" aria-modal="true">{children}</section></div></DialogContext.Provider>,document.body);
}
MusicDialog.Header=function Header({children,closeButton}){const close=useContext(DialogContext);return <header className="music-dialog-header">{children}{closeButton?<button type="button" aria-label="Close" onClick={close}>×</button>:null}</header>;};
MusicDialog.Title=function Title({children}){return <h2 className="music-dialog-title">{children}</h2>;};
MusicDialog.Body=function Body({children}){return <div className="music-dialog-body">{children}</div>;};
MusicDialog.Footer=function Footer({children}){return <footer className="music-dialog-footer">{children}</footer>;};
