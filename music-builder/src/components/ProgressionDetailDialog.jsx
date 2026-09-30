import {MusicDialog} from "./MusicDialog.jsx";
import {Play} from "lucide-react";
import PianoProgressionScore,{playPianoProgression} from "./PianoProgressionScore.jsx";

export default function ProgressionDetailDialog({progression,onClose}){
 if(!progression)return null;
 return <MusicDialog dialogClassName="progression-detail-dialog" show onHide={onClose}>
  <MusicDialog.Header closeButton><MusicDialog.Title>{progression.title}</MusicDialog.Title></MusicDialog.Header>
  <MusicDialog.Body>
   <PianoProgressionScore progression={progression}/>
  </MusicDialog.Body>
  <MusicDialog.Footer><button type="button" className="progression-play-button" onClick={()=>playPianoProgression(progression)}><Play size={17}/>Play progression</button><button type="button" onClick={onClose}>Close</button></MusicDialog.Footer>
 </MusicDialog>;
}
