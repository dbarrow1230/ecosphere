import { Play, Volume2, Waves } from "lucide-react";
import GrandStaff from "./GrandStaff.jsx";
import { MusicDialog } from "./MusicDialog.jsx";
import { playSampledNotes } from "../services/sampledPiano.js";
import "../styles/ChordBuilderPage.css";

const ROOTS = {
  C: 0,
  "C♯": 1,
  "D♭": 1,
  D: 2,
  "D♯": 3,
  "E♭": 3,
  E: 4,
  F: 5,
  "F♯": 6,
  "G♭": 6,
  G: 7,
  "G♯": 8,
  "A♭": 8,
  A: 9,
  "A♯": 10,
  "B♭": 10,
  B: 11,
};
const TYPES = [
  ["m7♭5", [0, 3, 6, 10]],
  ["maj13", [0, 2, 4, 5, 7, 9, 11]],
  ["m13", [0, 2, 3, 5, 7, 9, 10]],
  ["13", [0, 2, 4, 5, 7, 9, 10]],
  ["maj11", [0, 2, 4, 5, 7, 11]],
  ["m11", [0, 2, 3, 5, 7, 10]],
  ["11", [0, 2, 4, 5, 7, 10]],
  ["maj9", [0, 2, 4, 7, 11]],
  ["m9", [0, 2, 3, 7, 10]],
  ["9", [0, 2, 4, 7, 10]],
  ["add9", [0, 2, 4, 7]],
  ["sus4", [0, 5, 7]],
  ["sus2", [0, 2, 7]],
  ["maj7", [0, 4, 7, 11]],
  ["dim7", [0, 3, 6, 9]],
  ["m7", [0, 3, 7, 10]],
  ["m6", [0, 3, 7, 9]],
  ["6", [0, 4, 7, 9]],
  ["7", [0, 4, 7, 10]],
  ["dim", [0, 3, 6]],
  ["aug", [0, 4, 8]],
  ["m", [0, 3, 7]],
  ["", [0, 4, 7]],
];

// Shared by chord cards and progression measure parsing.
// eslint-disable-next-line react-refresh/only-export-components
export const chordData = (symbol) => {
  const clean = String(symbol || "")
    .replace(/#/g, "♯")
    .split("/")[0]
    .trim();
  const match = clean.match(/^([A-G](?:♯|♭)?)(.*)$/u);
  const rootName = match?.[1] || "C";
  const suffix = match?.[2] || "";
  const type =
    TYPES.find(([name]) => suffix === name) ||
    TYPES.find(([name]) => name && suffix.startsWith(name)) ||
    TYPES.at(-1);
  const root = ROOTS[rootName] ?? 0;
  return {
    rootName,
    root,
    pitches: type[1].map((interval) => (root + interval) % 12),
    quality:
      suffix.startsWith("m") && !suffix.startsWith("maj") ? "Minor" : "Major",
  };
};

const playMidi = (midis, options) => playSampledNotes(midis, options);

export default function ChordDetailDialog({ chord, onClose, onEdit }) {
  if (!chord) return null;
  const data = chordData(chord.chord);
  const keyText = chord.key || `${data.rootName} ${data.quality}`;
  const keyRoot = keyText.match(/[A-G](?:♯|♭)?/u)?.[0] || data.rootName;
  const keyQuality = /minor/i.test(keyText) ? "Minor" : "Major";
  const closed = data.pitches.reduce((midis, pitch) => {
    let midi = 60 + pitch;
    while (midis.length && midi <= midis.at(-1)) midi += 12;
    return [...midis, midi];
  }, []);
  const bassRoot = 36 + data.root;
  const bothHands = [bassRoot, bassRoot + 7, ...closed];
  const open = [
    bassRoot,
    bassRoot + 7,
    closed[0],
    ...closed.slice(1).map((midi, index) => midi + (index ? 12 : 0)),
  ];
  return (
    <MusicDialog
      className="chord-detail-backdrop"
      dialogClassName="chord-detail-dialog"
      show
      onHide={onClose}
    >
      <MusicDialog.Header closeButton>
        <MusicDialog.Title>
          {chord.chord} <small>{chord.title}</small>
        </MusicDialog.Title>
      </MusicDialog.Header>
      <MusicDialog.Body>
        <div className="chord-detail-meta">
          <span>{keyText}</span>
          {chord.voicing ? <span>{chord.voicing}</span> : null}
          {chord.inversionId?.name ? (
            <span>{chord.inversionId.name}</span>
          ) : null}
        </div>
        <div className="chord-detail-staff">
          <GrandStaff
            pitches={data.pitches}
            chordName={chord.chord}
            keyRoot={keyRoot}
            quality={keyQuality}
            showInstrumentPanel={false}
          />
        </div>
        <div className="chord-playback">
          <button onClick={() => playMidi(bothHands)}>
            <Volume2 size={17} />
            Play chord
          </button>
          <button onClick={() => playMidi(bothHands, { arpeggio: true })}>
            <Play size={17} />
            Play notes
          </button>
          <button onClick={() => playMidi(bothHands, { sustain: true })}>
            <Waves size={17} />
            Play with sustain
          </button>
          <button onClick={() => playMidi(open, { sustain: true })}>
            <Volume2 size={17} />
            Play open voicing
          </button>
        </div>
      </MusicDialog.Body>
      <MusicDialog.Footer>
        <button type="button" onClick={onClose}>
          Close
        </button>
        <button
          type="button"
          className="is-primary"
          onClick={() => onEdit(chord)}
        >
          Edit chord
        </button>
      </MusicDialog.Footer>
    </MusicDialog>
  );
}
