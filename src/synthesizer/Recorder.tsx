import { buildTimer } from '../util';
import { Note, Score, Track } from '../types';

/** Notes in a recorder can have an undefined duration until they are done playing. */
export interface RecorderNote extends Omit<Note, 'duration'> {
  duration: number | undefined;
}

export interface RecorderTrack extends Omit<Track, 'notes'> {
  notes: Array<RecorderNote>;
}

export interface Recording {
  time: number;
  score: Score;
  tracks: ReadonlyArray<RecorderTrack>;
}

export class Recorder {
  score: Score;
  timer: (() => number) | undefined;
  closedAt: number | undefined;
  tracks: ReadonlyArray<RecorderTrack>;
  timeOffset: number = 0;

  constructor(score: Score) {
    this.score = score;

    this.tracks = score.map((track) => ({
      instrumentName: track.instrumentName,
      notes: []
    }));
  }

  getTime() {
    if (this.closedAt !== undefined) {
      return this.closedAt;
    }

    // We start the timer at the first played note.
    if (!this.timer) {
      this.timer = buildTimer();
    }

    return this.timer() + this.timeOffset;
  }

  onPlayNote(channelId: number, name: string, velocity: number) {
    if (this.closedAt) {
      return;
    }

    const track = this.tracks[channelId];

    if (!track) {
      return;
    }

    track.notes.push({
      time: this.getTime(),
      name,
      velocity,
      duration: undefined
    });
  }

  onStopNote(channelId: number) {
    if (this.closedAt) return;

    const track = this.tracks[channelId];

    if (!track) return;

    const lastNote = track.notes[track.notes.length - 1];
    if (!lastNote || lastNote.duration !== undefined) return;

    lastNote.duration = this.getTime() - lastNote.time;
  }

  onClose() {
    this.closedAt = this.getTime();
  }

  skipToTimestamp(timestamp: number) {
    this.timeOffset += timestamp - this.getTime();

    this.tracks = this.tracks.map((track) => (
      {
        ...track,
        notes: track.notes.filter(note => note.duration !== undefined && note.time < timestamp && note.time + note.duration < timestamp)
      }
    ))
  }

  getState(): Recording {
    return {
      time: this.getTime(),
      score: this.score,
      tracks: [...this.tracks]
    };
  }
}
