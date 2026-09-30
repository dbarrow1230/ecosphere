import { getSampledPiano } from "../services/sampledPiano.js";

const LETTER_INDEX = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
const NATURAL_PITCHES = [0, 2, 4, 5, 7, 9, 11];
const SHARP_ORDER = [6, 1, 8, 3, 10, 5, 0];
const FLAT_ORDER = [10, 3, 8, 1, 6, 11, 4];
const MAJOR_SIGNATURES = {
  C: 0,
  G: 1,
  D: 2,
  A: 3,
  E: 4,
  B: 5,
  "F♯": 6,
  "C♯": 7,
  F: -1,
  "B♭": -2,
  "E♭": -3,
  "A♭": -4,
  "D♭": -5,
  "G♭": -6,
  "C♭": -7,
};
const MINOR_SIGNATURES = {
  A: 0,
  E: 1,
  B: 2,
  "F♯": 3,
  "C♯": 4,
  "G♯": 5,
  "D♯": 6,
  "A♯": 7,
  D: -1,
  G: -2,
  C: -3,
  F: -4,
  "B♭": -5,
  "E♭": -6,
  "A♭": -7,
};
const SHARP_TREBLE = [76, 94, 70, 88, 106, 82, 100];
const FLAT_TREBLE = [100, 82, 106, 88, 112, 94, 118];
const SHARP_BASS = [210, 228, 204, 222, 240, 216, 234];
const FLAT_BASS = [232, 214, 238, 220, 244, 226, 250];

const progressionSteps = (progression) => {
  return progression?.steps || [];
};

const DURATION_BEATS = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
  "thirty-second": 0.125,
  "sixty-fourth": 0.0625,
  "one-twenty-eighth": 0.03125,
};
const handEvents = (notes, style, patternName, noteValue, rest = false) => {
  const voiced = (notes || []).map(Number);
  const duration = DURATION_BEATS[noteValue] || 1;
  const count = Math.round(4 / duration);
  const up = voiced;
  const pattern =
    patternName === "down"
      ? [...up].reverse()
      : patternName === "up-down"
        ? [up[0], up[1], up[2], up[1]]
        : patternName === "alberti"
          ? [up[0], up[2], up[1], up[2]]
          : patternName === "random"
            ? [...up].sort(() => Math.random() - 0.5)
            : up;
  if (rest)
    return Array.from({ length: count }, (_, index) => ({
      beat: index * duration,
      duration,
      midis: [],
      rest: true,
    }));
  return voiced.length
    ? Array.from({ length: count }, (_, index) => ({
        beat: index * duration,
        duration,
        midis: style === "pattern" ? [pattern[index % pattern.length]] : voiced,
      }))
    : [];
};

const scoreBars = (progression) =>
  progressionSteps(progression).map((step) => {
    const rightNoteValue = step.rightNoteValue || "quarter";
    const leftNoteValue = step.leftNoteValue || "half";
    return {
      chord: step.chord,
      numeral: step.numeral,
      rightNoteValue,
      leftNoteValue,
      rightEvents: handEvents(
        step.rightHandNotes,
        step.rightStyle,
        step.rightPattern,
        rightNoteValue,
        step.rightRest,
      ),
      leftEvents: handEvents(
        step.leftHandNotes,
        step.leftStyle,
        step.leftPattern,
        leftNoteValue,
        step.leftRest,
      ),
    };
  });

const keyInfo = (progression) => {
  const text = `${progression?.key || "C"} ${progression?.mode || ""}`;
  const root = text.match(/[A-G](?:♯|♭)?/u)?.[0] || "C";
  const minor = /minor|aeolian/i.test(text);
  return {
    root,
    minor,
    signature: (minor ? MINOR_SIGNATURES : MAJOR_SIGNATURES)[root] ?? 0,
  };
};

// Playback is exported with the score so both saved and unsaved previews use identical events.
// eslint-disable-next-line react-refresh/only-export-components
export async function playPianoProgression(progression) {
  let instrument;
  try {
    instrument = await getSampledPiano();
  } catch {
    window.alert("The recorded piano samples could not be loaded.");
    return;
  }
  const bars = scoreBars(progression);
  const beatMs = 60000 / (progression?.tempo || 72);
  const start = instrument.context.currentTime + 0.08;
  bars.forEach((bar, barIndex) => {
    const measureStart = start + (barIndex * 4 * beatMs) / 1000;
    bar.rightEvents.forEach((event) =>
      event.midis.forEach((midi) =>
        instrument.piano.start({
          note: midi,
          velocity: 88,
          time: measureStart + (event.beat * beatMs) / 1000,
          duration: (event.duration * beatMs * 0.88) / 1000,
        }),
      ),
    );
    bar.leftEvents.forEach((event) =>
      event.midis.forEach((midi) =>
        instrument.piano.start({
          note: midi,
          velocity: 82,
          time: measureStart + (event.beat * beatMs) / 1000,
          duration: (event.duration * beatMs * 0.88) / 1000,
        }),
      ),
    );
  });
}

const signatureAlterations = (signature) => {
  const map = new Map();
  const order = signature > 0 ? SHARP_ORDER : FLAT_ORDER;
  order.slice(0, Math.abs(signature)).forEach((pitch) => {
    const direction = signature > 0 ? 1 : -1;
    const index = NATURAL_PITCHES.findIndex(
      (value) => (value + direction + 12) % 12 === pitch,
    );
    if (index >= 0) map.set(index, direction);
  });
  return map;
};
const pitchSpelling = (midi, signature) => {
  const pitch = ((midi % 12) + 12) % 12;
  const alterations = signatureAlterations(signature);
  let letterIndex = NATURAL_PITCHES.findIndex(
    (natural, index) =>
      (natural + (alterations.get(index) || 0) + 12) % 12 === pitch,
  );
  let accidental = "";
  if (letterIndex < 0) {
    const direction = signature < 0 ? -1 : 1;
    letterIndex = NATURAL_PITCHES.findIndex(
      (natural) => (natural + direction + 12) % 12 === pitch,
    );
    accidental = direction > 0 ? "♯" : "♭";
    if (letterIndex < 0) {
      letterIndex = NATURAL_PITCHES.findIndex((natural) => natural === pitch);
      accidental = "♮";
    }
    if (letterIndex < 0) letterIndex = 0;
  }
  return {
    diatonic: (Math.floor(midi / 12) - 1) * 7 + letterIndex,
    accidental,
  };
};
const noteY = (midi, staff, signature) => {
  const { diatonic } = pitchSpelling(midi, signature);
  return staff === "treble"
    ? 118 - (diatonic - 30) * 6
    : 238 - (diatonic - 18) * 6;
};
const ledgerYs = (midi, staff, signature) => {
  const { diatonic } = pitchSpelling(midi, signature);
  const bottom = staff === "treble" ? 30 : 18;
  const top = staff === "treble" ? 38 : 26;
  const bottomY = staff === "treble" ? 118 : 238;
  const lines = [];
  if (diatonic < bottom)
    for (let value = bottom - 2; value >= diatonic; value -= 2)
      lines.push(bottomY - (value - bottom) * 6);
  if (diatonic > top)
    for (let value = top + 2; value <= diatonic; value += 2)
      lines.push(bottomY - (value - bottom) * 6);
  return lines;
};

function Note({ midi, x, staff, signature, value = "quarter" }) {
  const spelling = pitchSpelling(midi, signature);
  const y = noteY(midi, staff, signature);
  const stemUp = staff === "treble";
  const open = value === "whole" || value === "half";
  return (
    <g className="score-note">
      {ledgerYs(midi, staff, signature).map((lineY) => (
        <line
          className="score-ledger"
          x1={x - 12}
          x2={x + 12}
          y1={lineY}
          y2={lineY}
          key={lineY}
        />
      ))}
      {spelling.accidental ? (
        <text className="score-note-accidental" x={x - 20} y={y + 7}>
          {spelling.accidental}
        </text>
      ) : null}
      <ellipse
        className={open ? "is-half" : ""}
        cx={x}
        cy={y}
        rx="7.5"
        ry="5.5"
        transform={`rotate(-18 ${x} ${y})`}
      />
      {value !== "whole" ? (
        <line
          x1={x + (stemUp ? 7 : -7)}
          x2={x + (stemUp ? 7 : -7)}
          y1={y}
          y2={stemUp ? y - 31 : y + 31}
        />
      ) : null}
      {Array.from(
        {
          length:
            {
              eighth: 1,
              sixteenth: 2,
              "thirty-second": 3,
              "sixty-fourth": 4,
              "one-twenty-eighth": 5,
            }[value] || 0,
        },
        (_, index) => (
          <path
            className="score-flag"
            key={index}
            d={
              stemUp
                ? `M${x + 7} ${y - 31 + index * 6}q18 8 7 22`
                : `M${x - 7} ${y + 31 - index * 6}q-18-8-7-22`
            }
          />
        ),
      )}
    </g>
  );
}

function Rest({ x, staff, value }) {
  const symbols = {
    whole: "𝄻",
    half: "𝄼",
    quarter: "𝄽",
    eighth: "𝄾",
    sixteenth: "𝄿",
    "thirty-second": "𝅀",
    "sixty-fourth": "𝅁",
    "one-twenty-eighth": "𝅂",
  };
  return (
    <text className="score-rest" x={x} y={staff === "treble" ? 103 : 223}>
      {symbols[value] || symbols.quarter}
    </text>
  );
}

function KeySignature({ signature, staff }) {
  const sharp = signature > 0;
  const positions =
    staff === "bass"
      ? sharp
        ? SHARP_BASS
        : FLAT_BASS
      : sharp
        ? SHARP_TREBLE
        : FLAT_TREBLE;
  return Array.from({ length: Math.abs(signature) }, (_, index) => (
    <text
      className="score-key"
      x={140 + index * 12}
      y={positions[index]}
      key={`${staff}-${index}`}
    >
      {sharp ? "♯" : "♭"}
    </text>
  ));
}

export default function PianoProgressionScore({ progression }) {
  const bars = scoreBars(progression);
  const key = keyInfo(progression);
  const startX = 210,
    measureWidth = 245,
    scoreEnd = startX + bars.length * measureWidth;
  const viewWidth = Math.max(760, scoreEnd + 50);
  return (
    <div className="piano-score-wrap">
      <svg
        className="piano-progression-score"
        viewBox={`0 0 ${viewWidth} 365`}
        role="img"
        aria-label={`${bars.length} measure piano grand staff`}
      >
        <text className="score-title" x="70" y="28">
          Piano · {progression.timeSignature || "4/4"} · {key.root}{" "}
          {key.minor ? "minor" : "major"}
        </text>
        {[70, 82, 94, 106, 118, 190, 202, 214, 226, 238].map((y) => (
          <line
            className="score-staff-line"
            key={y}
            x1="70"
            x2={scoreEnd}
            y1={y}
            y2={y}
          />
        ))}
        <line className="score-system-line" x1="70" x2="70" y1="70" y2="238" />
        <text className="score-clef score-treble" x="82" y="116">
          𝄞
        </text>
        <text className="score-clef score-bass" x="84" y="234">
          𝄢
        </text>
        <KeySignature signature={key.signature} staff="treble" />
        <KeySignature signature={key.signature} staff="bass" />
        {bars.map((bar, barIndex) => {
          const barX = startX + barIndex * measureWidth;
          return (
            <g key={`${bar.chord}-${barIndex}`}>
              <text
                className="score-chord-name"
                x={barX + measureWidth / 2}
                y="52"
              >
                {bar.chord}
              </text>
              {bar.rightEvents.flatMap((event, eventIndex) =>
                event.rest ? (
                  <Rest
                    x={barX + 28 + event.beat * 54}
                    staff="treble"
                    value={bar.rightNoteValue}
                    key={`rr-${eventIndex}`}
                  />
                ) : (
                  event.midis.map((midi, noteIndex) => (
                    <Note
                      midi={midi}
                      x={barX + 28 + event.beat * 54}
                      staff="treble"
                      signature={key.signature}
                      value={bar.rightNoteValue}
                      key={`r-${eventIndex}-${noteIndex}`}
                    />
                  ))
                ),
              )}
              {bar.leftEvents.flatMap((event, eventIndex) =>
                event.rest ? (
                  <Rest
                    x={barX + 28 + event.beat * 54}
                    staff="bass"
                    value={bar.leftNoteValue}
                    key={`lr-${eventIndex}`}
                  />
                ) : (
                  event.midis.map((midi, noteIndex) => (
                    <Note
                      midi={midi}
                      x={barX + 28 + event.beat * 54}
                      staff="bass"
                      signature={key.signature}
                      value={bar.leftNoteValue}
                      key={`l-${eventIndex}-${noteIndex}`}
                    />
                  ))
                ),
              )}
              <line
                className="score-barline"
                x1={barX + measureWidth}
                x2={barX + measureWidth}
                y1="70"
                y2="238"
              />
              <text className="score-measure-number" x={barX + 7} y="324">
                {barIndex + 1}
              </text>
            </g>
          );
        })}
        <line
          className="score-final-barline"
          x1={scoreEnd}
          x2={scoreEnd}
          y1="70"
          y2="238"
        />
        <text className="score-hand-label" x="76" y="151">
          RIGHT HAND
        </text>
        <text className="score-hand-label" x="76" y="344">
          LEFT HAND
        </text>
      </svg>
    </div>
  );
}
