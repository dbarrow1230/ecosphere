import { useState } from "react";
import { MusicDialog as Modal } from "../components/MusicDialog.jsx";
import { ListMusic, Plus, Pencil, Trash2 } from "lucide-react";
import ProgressionDetailDialog from "../components/ProgressionDetailDialog.jsx";
import { playPianoProgression } from "../components/PianoProgressionScore.jsx";
import { chordData } from "../components/ChordDetailDialog.jsx";
import {
  useMusicOptions,
  useMusicRecords,
  csv,
  recordId,
} from "../hooks/useMusicRecords.js";
import {
  ConnectionChecks,
  Field,
  MeterInput,
  SelectInput,
  TextArea,
  TextInput,
  toggleConnection,
} from "../components/MusicFormControls.jsx";
import {
  MUSIC_KEYS,
  MUSIC_MODES,
  STANDARD_METERS,
} from "../utils/musicTheoryOptions.js";
import "../styles/MusicPages.css";

const sources = [
  "/api/music-projects",
  "/api/chord-ideas",
  "/api/chord-progressions",
];
const newStep = (chord = "", numeral = "") => ({
  chord,
  numeral,
  playStyle: "chord",
  noteValue: "quarter",
  pattern: "up",
  inversion: "root",
  rightHandNotes: [],
  leftHandNotes: [],
  rightStyle: "chord",
  leftStyle: "chord",
  rightPattern: "up",
  leftPattern: "up",
  rightNoteValue: "quarter",
  leftNoteValue: "half",
  rightInversion: 0,
  leftInversion: 0,
  rightRest: false,
  leftRest: false,
});
const empty = () => ({
  title: "",
  key: "",
  mode: "",
  steps: [newStep()],
  timeSignature: "",
  tempo: "",
  notes: "",
  projectIds: [],
  relatedChordIds: [],
  relatedProgressionIds: [],
  tags: "",
});
const formOf = (item) => ({
  ...item,
  steps: item.steps?.length
    ? item.steps.map((step) => {
        const merged = { ...newStep(), ...step };
        return {
          ...merged,
          rightHandNotes: merged.rightHandNotes?.length
            ? merged.rightHandNotes
            : rootVoicing(merged.chord, 4),
          leftHandNotes: merged.leftHandNotes?.length
            ? merged.leftHandNotes
            : rootVoicing(merged.chord, 2),
        };
      })
    : (item.chords || []).map((chord, index) =>
        newStep(chord, item.romanNumerals?.[index] || ""),
      ),
  projectIds: (item.projectIds || []).map(recordId),
  relatedChordIds: (item.relatedChordIds || []).map(recordId),
  relatedProgressionIds: (item.relatedProgressionIds || []).map(recordId),
  tags: (item.tags || []).join(", "),
});
const PITCH_NAMES = [
  "C",
  "C♯",
  "D",
  "D♯",
  "E",
  "F",
  "F♯",
  "G",
  "G♯",
  "A",
  "A♯",
  "B",
];
const CHORD_ROOTS = [
  "C",
  "C♯",
  "D",
  "E♭",
  "E",
  "F",
  "F♯",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
];
const CHORD_QUALITIES = [
  "",
  "m",
  "aug",
  "dim",
  "sus2",
  "sus4",
  "add9",
  "6",
  "m6",
  "7",
  "maj7",
  "m7",
  "dim7",
  "m7♭5",
  "9",
  "maj9",
  "m9",
  "11",
  "maj11",
  "m11",
  "13",
  "maj13",
  "m13",
];
const NOTE_NAMES = [
  "C",
  "C♯",
  "D",
  "D♯",
  "E",
  "F",
  "F♯",
  "G",
  "G♯",
  "A",
  "A♯",
  "B",
];
const OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const DURATION_OPTIONS = [
  ["whole", "Whole"],
  ["half", "Half"],
  ["quarter", "Quarter"],
  ["eighth", "Eighth"],
  ["sixteenth", "16th"],
  ["thirty-second", "32nd"],
  ["sixty-fourth", "64th"],
  ["one-twenty-eighth", "128th"],
];
const midiName = (midi) =>
  `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
const chordTones = (symbol) =>
  chordData(String(symbol).split("→")[0].trim())
    .pitches.map((pitch) => PITCH_NAMES[pitch])
    .join("–");

const rootVoicing = (symbol, octave) => {
  if (!symbol) return [];
  const data = chordData(symbol);
  const rootMidi = (octave + 1) * 12 + data.root;
  return data.pitches.map(
    (pitch) => rootMidi + ((pitch - data.root + 12) % 12),
  );
};
const invertVoicing = (notes, inversion) => {
  const result = [...notes].sort((a, b) => a - b);
  for (let index = 0; index < Number(inversion); index += 1)
    if (result.length) result.push(result.shift() + 12);
  return result;
};
const shuffled = (notes) => [...notes].sort(() => Math.random() - 0.5);

function HandNotePicker({
  label,
  value,
  onChange,
  style,
  noteValue,
  pattern,
  inversion,
  rest,
  onSetting,
  onRandomize,
}) {
  const update = (index, pitch, octave) =>
    onChange(
      value.map((note, noteIndex) =>
        noteIndex === index ? (Number(octave) + 1) * 12 + Number(pitch) : note,
      ),
    );
  return (
    <fieldset className="hand-note-picker">
      <legend>{label}</legend>
      <div className="hand-play-settings">
        <label>
          <span>Play as</span>
          <SelectInput
            value={style}
            onChange={(event) => onSetting("Style", event.target.value)}
          >
            <option value="chord">Block chord</option>
            <option value="pattern">Pattern</option>
          </SelectInput>
        </label>
        <label>
          <span>Rhythm</span>
          <SelectInput
            value={noteValue}
            onChange={(event) => onSetting("NoteValue", event.target.value)}
          >
            {DURATION_OPTIONS.map(([duration, text]) => (
              <option value={duration} key={duration}>
                {text}
              </option>
            ))}
          </SelectInput>
        </label>
        <label>
          <span>Inversion</span>
          <SelectInput
            value={inversion}
            onChange={(event) =>
              onSetting("Inversion", Number(event.target.value))
            }
          >
            <option value="0">Root position</option>
            <option value="1">First inversion</option>
            <option value="2">Second inversion</option>
            <option value="3">Third inversion</option>
          </SelectInput>
        </label>
        {style === "pattern" ? (
          <label>
            <span>Pattern</span>
            <SelectInput
              value={pattern}
              onChange={(event) => onSetting("Pattern", event.target.value)}
            >
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="up-down">Up–down</option>
              <option value="alberti">Alberti</option>
              <option value="random">Random</option>
            </SelectInput>
          </label>
        ) : null}
        <button type="button" onClick={onRandomize}>
          Randomize chord tones
        </button>
        <label className="hand-rest-toggle">
          <input
            type="checkbox"
            checked={rest}
            onChange={(event) => onSetting("Rest", event.target.checked)}
          />
          <span>Rest for this hand</span>
        </label>
      </div>
      {value.map((note, index) => (
        <div className="hand-note-row" key={`${note}-${index}`}>
          <b>{index + 1}</b>
          <label>
            <span>Note</span>
            <SelectInput
              value={note % 12}
              onChange={(event) =>
                update(index, event.target.value, Math.floor(note / 12) - 1)
              }
            >
              {NOTE_NAMES.map((name, pitch) => (
                <option value={pitch} key={name}>
                  {name}
                </option>
              ))}
            </SelectInput>
          </label>
          <label>
            <span>Octave</span>
            <SelectInput
              value={Math.floor(note / 12) - 1}
              onChange={(event) => update(index, note % 12, event.target.value)}
            >
              {OCTAVES.map((octave) => (
                <option value={octave} key={octave}>
                  {octave}
                </option>
              ))}
            </SelectInput>
          </label>
          <strong>{midiName(note)}</strong>
          <button
            aria-label={`Remove ${midiName(note)}`}
            type="button"
            onClick={() =>
              onChange(value.filter((_, noteIndex) => noteIndex !== index))
            }
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          onChange([...value, label.startsWith("Right") ? 60 : 48])
        }
      >
        <Plus size={14} />
        Add note
      </button>
    </fieldset>
  );
}

export default function ChordProgressionsPage() {
  const page = useMusicRecords("/api/chord-progressions", empty, formOf);
  const options = useMusicOptions(sources);
  const [selected, setSelected] = useState(null);
  const [patternStep, setPatternStep] = useState(null);
  const [playMeasures, setPlayMeasures] = useState([]);
  const openCreate = () => {
    setPlayMeasures([0]);
    page.openCreate();
  };
  const openEdit = (item) => {
    const count = item.steps?.length || item.chords?.length || 0;
    setPlayMeasures(Array.from({ length: count }, (_, index) => index));
    page.openEdit(item);
  };
  const togglePlayMeasure = (index) =>
    setPlayMeasures((current) =>
      current.includes(index)
        ? current.filter((value) => value !== index)
        : [...current, index].sort((a, b) => a - b),
    );
  const previewSelection = () =>
    playPianoProgression({
      ...page.form,
      steps: page.form.steps.filter((_, index) => playMeasures.includes(index)),
    });
  const set = (name, value) =>
    page.setForm((current) => ({ ...current, [name]: value }));
  const setStep = (index, name, value) =>
    page.setForm((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [name]: value } : step,
      ),
    }));
  const setChord = (index, chord) =>
    page.setForm((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) =>
        stepIndex === index
          ? {
              ...step,
              chord,
              rightHandNotes: rootVoicing(chord, 4),
              leftHandNotes: rootVoicing(chord, 2),
              rightInversion: 0,
              leftInversion: 0,
            }
          : step,
      ),
    }));
  const setHandSetting = (index, hand, setting, value) =>
    page.setForm((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) => {
        if (stepIndex !== index) return step;
        const next = { ...step, [`${hand}${setting}`]: value };
        if (setting === "Inversion")
          next[`${hand}HandNotes`] = invertVoicing(
            rootVoicing(step.chord, hand === "right" ? 4 : 2),
            value,
          );
        return next;
      }),
    }));
  const randomizeHand = (index, hand) =>
    page.setForm((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) =>
        stepIndex === index
          ? {
              ...step,
              [`${hand}HandNotes`]: shuffled(
                rootVoicing(step.chord, hand === "right" ? 4 : 2),
              ),
            }
          : step,
      ),
    }));
  const addStep = () => {
    const nextIndex = page.form.steps.length;
    setPlayMeasures((current) => [...new Set([...current, nextIndex])]);
    page.setForm((current) => ({
      ...current,
      steps: [...current.steps, newStep()],
    }));
  };
  const removeStep = (index) => {
    setPlayMeasures((current) =>
      current
        .filter((value) => value !== index)
        .map((value) => (value > index ? value - 1 : value)),
    );
    page.setForm((current) => ({
      ...current,
      steps: current.steps.filter((_, stepIndex) => stepIndex !== index),
    }));
  };
  const link = (name, id, checked) =>
    set(name, toggleConnection(page.form[name], id, checked));
  const submit = (event) => {
    event.preventDefault();
    const steps = page.form.steps.filter((step) => step.chord.trim());
    page.save({
      ...page.form,
      steps,
      chords: steps.map((step) => step.chord),
      romanNumerals: steps.map((step) => step.numeral),
      tags: csv(page.form.tags),
      tempo: page.form.tempo === "" ? null : Number(page.form.tempo),
    });
  };
  return (
    <section className="music-page progressions-page">
      <header className="music-page-header">
        <div>
          <span>Harmonic movement</span>
          <h1>Chord Progressions</h1>
          <p>Build and connect reusable harmonic sequences.</p>
        </div>
        <button onClick={openCreate}>
          <Plus size={18} />
          Build progression
        </button>
      </header>
      <div className="progression-list">
        {page.items.map((item) => (
          <article
            className="is-clickable"
            key={item._id}
            onClick={() => setSelected(item)}
          >
            <header>
              <h2>{item.title || "Untitled progression"}</h2>
              <span>
                {item.key} {item.mode}
              </span>
            </header>
            <div className="progression-lane">
              {(item.steps?.length
                ? item.steps
                : (item.chords || []).map((chord, index) =>
                    newStep(chord, item.romanNumerals?.[index]),
                  )
              ).map((step, index) => (
                <span key={`${step.chord}-${index}`}>
                  <strong>{step.chord}</strong>
                  <small>{step.numeral}</small>
                  <em>
                    {chordTones(step.chord)} · RH {step.rightStyle}/
                    {step.rightNoteValue} · LH {step.leftStyle}/
                    {step.leftNoteValue}
                  </em>
                </span>
              ))}
            </div>
            <footer>
              <p>
                {item.timeSignature}
                {item.tempo ? ` · ${item.tempo} BPM` : ""}
              </p>
              <aside>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    openEdit(item);
                  }}
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    page.remove(item);
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </aside>
            </footer>
          </article>
        ))}
      </div>
      {!page.loading && !page.items.length ? (
        <div className="music-empty">
          <ListMusic />
          <h2>No progressions</h2>
        </div>
      ) : null}
      <ProgressionDetailDialog
        progression={selected}
        onClose={() => setSelected(null)}
      />
      <Modal
        className="music-editor-modal"
        dialogClassName="music-editor-dialog progression-editor-dialog is-wide"
        show={page.showForm}
        onHide={page.close}
        centered
        scrollable
      >
        <form onSubmit={submit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {page.editingId ? "Edit progression" : "Build progression"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="progression-form-layout">
              <section>
                <h3>Sequence</h3>
                <Field label="Title">
                  <TextInput
                    value={page.form.title}
                    onChange={(event) => set("title", event.target.value)}
                  />
                </Field>
                <div className="progression-step-editor">
                  <header>
                    <strong>Measures</strong>
                    <button type="button" onClick={addStep}>
                      <Plus size={15} />
                      Add measure
                    </button>
                  </header>
                  {page.form.steps.map((step, index) => (
                    <section className="measure-row" key={index}>
                      <label className="measure-play-toggle">
                        <input
                          type="checkbox"
                          checked={playMeasures.includes(index)}
                          onChange={() => togglePlayMeasure(index)}
                        />
                        <span>Play</span>
                      </label>
                      <b>Measure {index + 1}</b>
                      <strong>{step.chord || "Select chord"}</strong>
                      <div className="measure-summary">
                        <span>{step.numeral || "No numeral"}</span>
                        <small>
                          Right hand: {step.rightStyle} · {step.rightNoteValue}
                          {step.rightStyle === "pattern"
                            ? ` · ${step.rightPattern}`
                            : ""}
                          {step.rightRest ? " · rest" : ""}
                        </small>
                        <small>
                          Left hand: {step.leftStyle} · {step.leftNoteValue}
                          {step.leftStyle === "pattern"
                            ? ` · ${step.leftPattern}`
                            : ""}
                          {step.leftRest ? " · rest" : ""}
                        </small>
                      </div>
                      <button
                        type="button"
                        className="edit-pattern"
                        onClick={() => setPatternStep(index)}
                      >
                        Choose chord & pattern
                      </button>
                      <button
                        type="button"
                        className="remove-step"
                        onClick={() => removeStep(index)}
                        disabled={page.form.steps.length === 1}
                      >
                        <Trash2 size={15} />
                      </button>
                    </section>
                  ))}
                </div>
                <div className="music-inline-fields">
                  <Field label="Key">
                    <SelectInput
                      value={page.form.key}
                      onChange={(event) => set("key", event.target.value)}
                    >
                      <option value="">Select key</option>
                      {MUSIC_KEYS.map((key) => (
                        <option key={key}>{key}</option>
                      ))}
                    </SelectInput>
                  </Field>
                  <Field label="Mode">
                    <SelectInput
                      value={page.form.mode}
                      onChange={(event) => set("mode", event.target.value)}
                    >
                      <option value="">Select mode</option>
                      {MUSIC_MODES.map((mode) => (
                        <option key={mode}>{mode}</option>
                      ))}
                    </SelectInput>
                  </Field>
                  <Field label="Meter">
                    <MeterInput
                      value={page.form.timeSignature}
                      meters={STANDARD_METERS}
                      onChange={(value) => set("timeSignature", value)}
                    />
                  </Field>
                  <Field label="Tempo">
                    <TextInput
                      type="number"
                      value={page.form.tempo}
                      onChange={(event) => set("tempo", event.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Notes" wide>
                  <TextArea
                    rows="5"
                    value={page.form.notes}
                    onChange={(event) => set("notes", event.target.value)}
                  />
                </Field>
                <Field label="Tags">
                  <TextInput
                    value={page.form.tags}
                    onChange={(event) => set("tags", event.target.value)}
                  />
                </Field>
              </section>
              <section className="connection-ledger">
                <h3>Connections</h3>
                {[
                  ["Projects", "projectIds", 0],
                  ["Chord ideas", "relatedChordIds", 1],
                  ["Related progressions", "relatedProgressionIds", 2],
                ].map(([label, name, index]) => (
                  <div key={name}>
                    <h4>{label}</h4>
                    <ConnectionChecks
                      items={options[sources[index]] || []}
                      value={page.form[name]}
                      excludeId={page.editingId}
                      onChange={(id, checked) => link(name, id, checked)}
                    />
                  </div>
                ))}
              </section>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <button
              type="button"
              className="progression-preview-button"
              onClick={previewSelection}
            >
              Play current pattern
            </button>
            <button type="button" onClick={page.close}>
              Cancel
            </button>
            <button className="is-primary">Save progression</button>
          </Modal.Footer>
        </form>
      </Modal>
      <Modal
        className="measure-pattern-modal"
        dialogClassName="measure-pattern-dialog"
        show={patternStep !== null}
        onHide={() => setPatternStep(null)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Measure {patternStep === null ? "" : patternStep + 1}
          </Modal.Title>
        </Modal.Header>
        {patternStep !== null ? (
          <Modal.Body>
            <div className="measure-pattern-form">
              <Field label="Chord" wide>
                <SelectInput
                  value={page.form.steps[patternStep].chord}
                  onChange={(event) =>
                    setChord(patternStep, event.target.value)
                  }
                >
                  <option value="">Select chord</option>
                  {page.form.steps[patternStep].chord &&
                  !CHORD_ROOTS.some((root) =>
                    CHORD_QUALITIES.some(
                      (quality) =>
                        `${root}${quality}` ===
                        page.form.steps[patternStep].chord,
                    ),
                  ) ? (
                    <option value={page.form.steps[patternStep].chord}>
                      {page.form.steps[patternStep].chord}
                    </option>
                  ) : null}
                  {CHORD_ROOTS.map((root) => (
                    <optgroup label={root} key={root}>
                      {CHORD_QUALITIES.map((quality) => (
                        <option
                          value={`${root}${quality}`}
                          key={`${root}-${quality || "major"}`}
                        >
                          {root}
                          {quality || " major"}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </SelectInput>
              </Field>
              <Field label="Numeral">
                <TextInput
                  value={page.form.steps[patternStep].numeral}
                  onChange={(event) =>
                    setStep(patternStep, "numeral", event.target.value)
                  }
                />
              </Field>
              <div className="hand-note-layout">
                <HandNotePicker
                  label="Right hand notes"
                  value={page.form.steps[patternStep].rightHandNotes || []}
                  style={page.form.steps[patternStep].rightStyle}
                  noteValue={page.form.steps[patternStep].rightNoteValue}
                  pattern={page.form.steps[patternStep].rightPattern}
                  inversion={page.form.steps[patternStep].rightInversion}
                  rest={page.form.steps[patternStep].rightRest}
                  onSetting={(setting, value) =>
                    setHandSetting(patternStep, "right", setting, value)
                  }
                  onRandomize={() => randomizeHand(patternStep, "right")}
                  onChange={(notes) =>
                    setStep(patternStep, "rightHandNotes", notes)
                  }
                />
                <HandNotePicker
                  label="Left hand notes"
                  value={page.form.steps[patternStep].leftHandNotes || []}
                  style={page.form.steps[patternStep].leftStyle}
                  noteValue={page.form.steps[patternStep].leftNoteValue}
                  pattern={page.form.steps[patternStep].leftPattern}
                  inversion={page.form.steps[patternStep].leftInversion}
                  rest={page.form.steps[patternStep].leftRest}
                  onSetting={(setting, value) =>
                    setHandSetting(patternStep, "left", setting, value)
                  }
                  onRandomize={() => randomizeHand(patternStep, "left")}
                  onChange={(notes) =>
                    setStep(patternStep, "leftHandNotes", notes)
                  }
                />
              </div>
            </div>
          </Modal.Body>
        ) : null}
        <Modal.Footer>
          {patternStep !== null ? (
            <div className="measure-preview-actions">
              <button
                type="button"
                className="progression-preview-button"
                onClick={() =>
                  playPianoProgression({
                    ...page.form,
                    steps: [page.form.steps[patternStep]],
                  })
                }
              >
                Play both hands
              </button>
              <button
                type="button"
                onClick={() =>
                  playPianoProgression({
                    ...page.form,
                    steps: [
                      {
                        ...page.form.steps[patternStep],
                        leftHandNotes: [],
                        leftRest: true,
                      },
                    ],
                  })
                }
              >
                Play right hand
              </button>
              <button
                type="button"
                onClick={() =>
                  playPianoProgression({
                    ...page.form,
                    steps: [
                      {
                        ...page.form.steps[patternStep],
                        rightHandNotes: [],
                        rightRest: true,
                      },
                    ],
                  })
                }
              >
                Play left hand
              </button>
            </div>
          ) : null}
          <button
            type="button"
            className="is-primary"
            onClick={() => setPatternStep(null)}
          >
            Done
          </button>
        </Modal.Footer>
      </Modal>
    </section>
  );
}
