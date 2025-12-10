export interface Note {
  name: string;
  time: number;
  velocity: number;
  duration: number;
}

export interface Track {
  instrumentName: string;
  notes: Array<Note>;
}

export type Score = Array<Track>;
