import {FC, useMemo} from 'react';

import {NoteVisualization} from './NoteVisualization';
import {Note} from '../types';
import {RecorderNote, RecorderTrack} from '../synthesizer/Recorder';
import {Range} from './ScoreVisualization';

interface TrackVisualizationProps {
  track: RecorderTrack;
  range: Range;
  scale: number;
}

export const TrackVisualization: FC<TrackVisualizationProps> = ({track, range, scale}) => {
  const notesInRange = useMemo(() => {
    return track.notes.filter((note) => {
      const noteEnd = typeof note.duration === 'undefined' ? undefined : note.time + note.duration;

      return note.time < range.end && (!noteEnd || noteEnd > range.start);
    });
  }, [track, range]);

  return (
    <div className="track">
      <div className="instrument">{track.instrumentName}</div>
      <div className="notes">
        {notesInRange.map((note) => (
          <NoteVisualization key={getNoteKey(note)} note={note} range={range} scale={scale} />
        ))}
      </div>
    </div>
  );
};

function getNoteKey(note: Note | RecorderNote) {
  return `${note.time}-${note.duration}`;
}
