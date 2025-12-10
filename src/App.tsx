import {useMemo} from 'react';
import './App.css';
import {Panes} from './Panes';
import {InstructionsIntro} from './panes/InstructionsIntro';
import {InstructionsFormat} from './panes/InstructionsFormat';
import {InstructionsSynthesizer} from './panes/InstructionsSynthesizer';
import {InstructionsLoops} from './panes/InstructionsLoops';
import {InstructionsPlayer} from './panes/InstructionsPlayer';

function App() {
  const slides = useMemo(
    () => [
      <InstructionsIntro />,
      <InstructionsFormat />,
      <InstructionsSynthesizer />,
      <InstructionsLoops />,
      <InstructionsPlayer />
    ],
    []
  );

  return (
    <div className="app">
      <Panes slides={slides} />
    </div>
  );
}

export default App;
