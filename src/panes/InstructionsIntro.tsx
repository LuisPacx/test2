export const InstructionsIntro = () => (
  <>
    <h1>Backend exercise</h1>

    <p>
      Front is a large scale real-time app. It runs hundreds of independent services across thousands of servers, resulting in complex
      concurrency problems. This test explores a similar problem applied to a different domain: <strong>playing music</strong>.
    </p>

    <p>
      We will give you a music score and a synthesizer to play individual notes.
      Your goal is to play the right notes at the right time. You will build a simplified <a href="https://en.wikipedia.org/wiki/MIDI" target="_blank" rel="noreferrer">MIDI</a> player.
    </p>

    <ul>
      <li>In order to provide an environment easily accessible to all candidates, you will write JavaScript that runs in a browser.</li>
      <li>We will show you code examples to introduce the required APIs.</li>
      <li>Several aspects of music playback had to be simplified. Don't worry if the resulting audio sounds a little distorted.</li>
      <li>Please do not distribute your solution, as we intend to reuse the exercise.</li>
    </ul>

    <p>
      This exercise was built with open source code like <a href="https://github.com/g200kg/webaudio-tinysynth">tinysynth</a> and <a href="https://github.com/grimmdude/MidiPlayerJS" target="_blank" rel="noreferrer">MidiPlayerJS</a>. Full list is in the package.json file.
    </p>

    <p>
      (You can use keyboard arrows to navigate)
    </p>
  </>
);