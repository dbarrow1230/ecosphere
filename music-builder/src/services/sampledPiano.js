import { SplendidGrandPiano } from "smplr";

let context;
let piano;

export async function getSampledPiano() {
  if (!context) {
    context = new AudioContext();
    piano = SplendidGrandPiano(context);
  }
  await context.resume();
  await piano.ready;
  return { context, piano };
}

export async function playSampledNotes(
  midis,
  { arpeggio = false, sustain = false } = {},
) {
  let instrument;
  try {
    instrument = await getSampledPiano();
  } catch {
    window.alert("The recorded piano samples could not be loaded.");
    return;
  }
  const start = instrument.context.currentTime + 0.05;
  const duration = sustain ? 3.2 : 1.15;
  midis.forEach((midi, index) =>
    instrument.piano.start({
      note: midi,
      velocity: 88,
      time: start + (arpeggio ? index * 0.22 : 0),
      duration,
    }),
  );
}
