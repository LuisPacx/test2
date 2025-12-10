import {FC, useMemo} from 'react';
import {noteToColor} from './colors';
import {Range} from './ScoreVisualization';
import {RecorderNote} from '../synthesizer/Recorder';

interface NoteVisualizationProps {
  note: RecorderNote;
  range: Range;
  scale: number;
}

export const NoteVisualization: FC<NoteVisualizationProps> = ({note, range, scale}) => {
  const style = useMemo(() => {
    const noteDuration = note.duration ?? range.current - note.time;

    return {
      left: computeNoteOffset(note, range, scale),
      width: noteDuration * scale,
      backgroundColor: noteToColor(note.name)
    };
  }, [note, range, scale]);

  return <span className="note" style={style} data-info={renderNoteInfo(note)} />;
};

function computeNoteOffset(note: RecorderNote, range: Range, scale: number) {
  return (note.time - range.start) * scale;
}

function renderNoteInfo(note: RecorderNote) {
  const base = `${note.name} - at ${note.time}ms`;

  return note.duration ? `${base} for ${note.duration}ms` : base;
}
