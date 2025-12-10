import { ChangeEventHandler, useCallback, useEffect, useState } from 'react';
import { Score } from '../types';
import { PlayerModal } from '../visualization/PlayerModal';

const tunes = [
  { name: 'Test 1', data: '5_notes.json' },
  { name: 'Test 2', data: 'item-discovery.json' },
  { name: 'Test 3', data: 'yoshi-s-island.json' },
  { name: 'Tetris', data: 'tetris.json' },
  { name: 'The Legend of Zelda', data: 'zelda.json' },
  { name: 'Super Mario Bros.', data: 'smb.json' },
  { name: 'Megaman 3', data: 'megaman3.json' },
  { name: 'Super Mario Bros. 3', data: 'smb3.json' },
  { name: 'Little Nemo', data: 'dream-1-mushroom-forest.json' },
  { name: 'Duck Tales', data: 'the-moon.json' },
  { name: 'MEGALOVANIA', data: 'megalovania.json' },
];

export const InstructionsPlayer = () => {
  const [tuneFile, setTuneFile] = useState(parseRouteTuneFile() || tunes[0].data);
  const [score, setScore] = useState<Score>();
  const [shouldAutoStart, setShouldAutoStart] = useState(true);

  const isModalOpen = score !== undefined;

  const onSelect: ChangeEventHandler<HTMLSelectElement> = useCallback((event) => {
    setTuneFile(event.target.value);
  }, []);

  const onPlay = useCallback(async () => {
    const response = await fetch(`tunes/${tuneFile}`);
    const newScore = await response.json();

    setScore(newScore);
  }, [tuneFile]);

  const onAutoStart = useCallback(() => setShouldAutoStart(false), []);

  const onCloseModal = useCallback(() => {
    setScore(undefined);
    setShouldAutoStart(true);
  }, []);

  // Store selected file in URL param.
  useEffect(() => {
    const routeTuneFile = parseRouteTuneFile();

    if (routeTuneFile !== tuneFile) {
      window.history.replaceState('', '', `${window.location.pathname}?tune=${tuneFile}`);
    }
  });

  return (
    <>
      <h1>Player</h1>

      <p>
        Now, it's your turn! Open <code>src/assignment/player.js</code> in your favorite text editor. This
        page will update automatically when you save your editor.
      </p>

      <p>Your goals:</p>

      <ul>
        <li>
          Create a channel for each track using <code>synthesizer.getChannel()</code>.
        </li>
        <li>
          Play notes with <code>channel.playNote()</code> and <code>channel.stopNote()</code>.
        </li>
        <li>
          Manage time with <code>delayAsync()</code> and <code>buildTimer()</code>. Do not use <code>setTimeout()</code> or <code>setInterval()</code>.
        </li>
        <li>
          We recommend you do <strong>not</strong> rely on promise concurrency methods, such as <code>Promise.all</code>.
        </li>
        <li>Gracefully handle the "Stop" button (see below).</li>
        <li>Tests are not required, but include comments to explain how you are solving problems.</li>
        <li>Make sure your program is resilient to errors. Even though no failures are expected in this demo, exceptions and edge cases should be gracefully handled at every stage.</li>
      </ul>

      <p>
        Browser timings are not accurate enough for duration beyond a few seconds. You can use{' '}
        <code>buildTimer()</code> to measure the time since the player started so you don't accumulate errors
        when delaying multiple times.
      </p>

      <p>
        <code>playNote()</code> returns a boolean: <code>false</code> indicates that the music was stopped.
        When this happens, your code must stop executing (you must not play new notes). You can test this by
        pressing "Stop" while a song is playing.
      </p>

      <p>
        Your code is expected to return an object with a <code>play</code> function, that will start playing the
        provided tracks, and a <code>getTime()</code> function, that will return the current song play time.
      </p>

      <p>
        After getting the <code>play</code> function to work correctly, you should implement the <code>skipToTimestamp</code> function.
        This function should stop the currently playing notes, and start playing notes starting at a specific timestamp.
        Adding this function will add rewind and fast forward capabilities to the player.
      </p>

      <p>The controls below will load a sample file and pass it to your code.</p>

      <div className="player-controls">
        <div className="select">
          <select onChange={onSelect} defaultValue={tuneFile}>
            {tunes.map((tune) => (
              <option key={tune.data} value={tune.data}>
                {tune.name}
              </option>
            ))}
          </select>
        </div>

        <button className="primary" onClick={onPlay} disabled={isModalOpen}>
          Play
        </button>
      </div>

      {isModalOpen && (
        <PlayerModal
          score={score}
          shouldAutoStart={shouldAutoStart}
          onAutoStart={onAutoStart}
          onRequestClose={onCloseModal}
        />
      )}
    </>
  );
};

function parseRouteTuneFile() {
  const routeTune = new URL(window.location.href).searchParams.get('tune');
  if (!routeTune) {
    return undefined;
  }

  return tunes.some((tune) => tune.data === routeTune) ? routeTune : undefined;
}
