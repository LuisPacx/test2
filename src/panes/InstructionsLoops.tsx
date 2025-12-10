import {useCallback, useEffect, useMemo} from 'react';
import {delayAsync} from '../util';
import {Synthesizer} from '../synthesizer/Synthesizer';
import {CodeBlock} from '../CodeBlock';

const sampleCode = `
import {delayAsync} from './util';

const ringtone = [
  'B5', 'G5', 'Fb5', 'Eb4', 'A4', 'D4',
  'C4', 'Cb5', 'Ab5', 'Db5', 'F4', 'Gb5'
];

const noteDuration = 200;

async function player(synthesizer) {
  const channel = synthesizer.getChannel('Marimba');

  for (const noteName of ringtone) {
    const isPlaying = channel.playNote(noteName, 100);
    if (!isPlaying) {
      break;
    }

    await delayAsync(noteDuration);

    channel.stopNote();
  }
}
`;

const ringtone = ['B5', 'G5', 'Fb5', 'Eb4', 'A4', 'D4', 'C4', 'Cb5', 'Ab5', 'Db5', 'F4', 'Gb5'];

const noteDuration = 200;

export const InstructionsLoops = () => {
  const synthesizer = useMemo(() => new Synthesizer(), []);
  useEffect(() => {
    // Close the synthesizer on unmount.
    return () => synthesizer.close();
  })

  const onPlay = useCallback(async () => {
    const channel = synthesizer.getChannel('Marimba');

    for (const noteName of ringtone) {
      const isPlaying = channel.playNote(noteName, 100);
      if (!isPlaying) {
        break;
      }

      await delayAsync(noteDuration);

      channel.stopNote();
    }
  }, [synthesizer]);

  return (
    <>
      <h1>Loops</h1>

      <p>
        You can use  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function" target="_blank" rel="noreferrer">async/await</a> to call <code>delayAsync()</code> inside a loop.
      </p>

      <p>To make things more interesting, <code>delayAsync</code> is not reentrant: you cannot call delayAsync again until the previous delay has elapsed.</p>

      <CodeBlock content={sampleCode} />

      <div className="player-controls">
        <button className="primary" onClick={onPlay}>Play</button>
      </div>
    </>
  );
};
