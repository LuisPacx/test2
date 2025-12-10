import {CodeBlock} from "../CodeBlock";

const sample = [
  {
    "instrumentName": "Flute",
    "notes": [
      {
        "time": 0,
        "duration": 300,
        "name": "G5",
        "velocity": 81
      },
      {
        "time": 300,
        "duration": 400,
        "name": "A5",
        "velocity": 50
      }
    ]
  }
];

export const InstructionsFormat = () => (
  <>
    <h1>
      Music score format
    </h1>

    <p>
      The music score comes in a JSON format:
    </p>

    <ul>
      <li>A list of <code>tracks</code>.</li>
      <li>Each track has an <code>instrumentName</code> and a list of <code>notes</code>.</li>
      <li>Notes need to be played at a specific <code>time</code> for a given <code>duration</code> (both in milliseconds).</li>
      <li>Notes have a <code>name</code>, which indicates their frequencies.</li>
      <li>Notes also have a <code>velocity</code>, which indicates how loudly they must be played.</li>
    </ul>

    <p>
      You do not need to interpret the name and velocity in any way: they just need to be passed on to the synthesizer.
    </p>

    <p>Here is a sample score that plays 2 notes using a single instrument:</p>

    <CodeBlock content={JSON.stringify(sample, null, 2)} />

    <p>
      You can review sample files in the <code>public/tunes</code> folder.
    </p>

  </>
);
