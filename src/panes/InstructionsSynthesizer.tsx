import { useCallback, useState } from 'react';
import { CodeBlock } from '../CodeBlock';
import { Synthesizer } from '../synthesizer/Synthesizer';
import { delayAsync } from '../util';

const sampleCode = `
import {delayAsync} from './util';

async function player(synthesizer) {
  const channel = synthesizer.getChannel('Flute');

  const keepPlaying = channel.playNote('G5', 81);
  await delayAsync(300);
  channel.stopNote();

  if (keepPlaying) {
    channel.playNote('A5', 50);
    await delayAsync(400);
    channel.stopNote();
  }
}
`;

export const InstructionsSynthesizer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const onPlay = useCallback(async () => {
    const synthesizer = new Synthesizer();
    setIsPlaying(true);

    const channel = synthesizer.getChannel('Flute');

    channel.playNote('G5', 81);
    await delayAsync(300);
    channel.stopNote();

    channel.playNote('A5', 50);
    await delayAsync(400);
    channel.stopNote();

    synthesizer.close();
    setIsPlaying(false);
  }, []);

  return (
    <>
      <h1>Synthesizer</h1>

      <p>
        The synthesizer can open several channels which play concurrently. Each channel plays <code>notes</code>:
      </p>

      <ul>
        <li>A note keeps playing until it is stopped.</li>
        <li>
          A channel can only play one note at a time: the previous note must be stopped before you can play a
          new one.
        </li>
        <li>
          <code>channel.playNote()</code> and <code>channel.stopNote()</code> return immediately.
        </li>
        <li>
          <code>channel.playNote()</code> returns a boolean: <code>false</code> indicates that the Stop button
          was pressed.
        </li>
      </ul>

      <p>
        You <strong><u>must</u></strong> use the provided <code>delayAsync()</code> to wait until a later point in time. To play the score from the previous page, you could do:
      </p>

      <CodeBlock content={sampleCode} />

      <div className="player-controls">
        <button className="primary" disabled={isPlaying} onClick={onPlay}>Play</button>
      </div>
    </>
  );
};
