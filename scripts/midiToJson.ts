import * as path from 'path';
import {performance} from 'perf_hooks';
import {writeFileSync} from 'fs';
import {findLast, flow, partition, sortBy, without} from 'lodash';
import * as MidiPlayer from 'midi-player-js';

// Will convert a MIDI file to a simplified JSON format.
// It erases many of the nuances of MIDI and the resulting audio may be significantly worse.
// Because MIDI timing is tricky to get right, we use a real-time player: it takes 1 min to convert a 1 min file...

const MIDI_INSTRUMENTS = [
  'Acoustic Grand Piano','Bright Acoustic Piano','Electric Grand Piano','Honky-tonk Piano','Electric Piano 1','Electric Piano 2',
  'Harpsichord','Clavinet','Celesta','Glockenspiel','Music Box','Vibraphone','Marimba','Xylophone','Tubular Bells','Dulcimer',
  'Drawbar Organ','Percussive Organ','Rock Organ','Church Organ','Reed Organ','Accordion','Harmonica','Tango Accordion',
  'Acoustic Guitar (nylon)','Acoustic Guitar (steel)','Electric Guitar (jazz)','Electric Guitar (clean)','Electric Guitar (muted)',
  'Overdriven Guitar','Distortion Guitar','Guitar Harmonics','Acoustic Bass','Electric Bass (finger)','Electric Bass (pick)',
  'Fretless Bass','Slap Bass 1','Slap Bass 2','Synth Bass 1','Synth Bass 2','Violin','Viola','Cello','Contrabass',
  'Tremolo Strings','Pizzicato Strings','Orchestral Harp','Timpani','String Ensemble 1','String Ensemble 2','Synth Strings 1',
  'Synth Strings 2','Choir Aahs','Voice Oohs','Synth Choir','Orchestra Hit','Trumpet','Trombone','Tuba','Muted Trumpet',
  'French Horn','Brass Section','Synth Brass 1','Synth Brass 2','Soprano Sax','Alto Sax','Tenor Sax','Baritone Sax','Oboe',
  'English Horn','Bassoon','Clarinet','Piccolo','Flute','Recorder','Pan Flute','Blown Bottle','Shakuhachi','Whistle',
  'Ocarina','Lead 1 (square)','Lead 2 (sawtooth)','Lead 3 (calliope)','Lead 4 (chiff)','Lead 5 (charang)','Lead 6 (voice)',
  'Lead 7 (fifths)','Lead 8 (bass + lead)','Pad 1 (new age)','Pad 2 (warm)','Pad 3 (polysynth)','Pad 4 (choir)','Pad 5 (bowed)',
  'Pad 6 (metallic)','Pad 7 (halo)','Pad 8 (sweep)','FX 1 (rain)','FX 2 (soundtrack)','FX 3 (crystal)','FX 4 (atmosphere)',
  'FX 5 (brightness)','FX 6 (goblins)','FX 7 (echoes)','FX 8 (sci-fi)','Sitar','Banjo','Shamisen','Koto','Kalimba','Bagpipe',
  'Fiddle','Shanai','Tinkle Bell','Agogo','Steel Drums','Woodblock','Taiko Drum','Melodic Tom','Synth Drum','Reverse Cymbal',
  'Guitar Fret Noise','Breath Noise','Seashore','Bird Tweet','Telephone Ring','Helicopter','Applause','Gunshot'
];

const MAX_NUM_TRACKS = 16;

function getInstrumentNameFromId(id: string) {
  return MIDI_INSTRUMENTS[id] ?? MIDI_INSTRUMENTS[0];
}

interface Note {
  time: number;
  name: string;
  duration: number;
  velocity: number;
}

interface Track {
  instrumentName: string;
  notes: Note[]
}

interface Tune {
  tracks: Record<number, Track>;
}

enum MidiEventsEnum {
  PROGRAM_CHANGE = 'Program Change',
  NOTE_ON = 'Note on',
  NOTE_OFF = 'Note off'
}

function convertFile(midiFile: string, adjustSpeed: number) {
  const start = performance.now();
  const speed = 1 + adjustSpeed/100;

  const tune: Tune = {
    tracks: {}
  };

  setInterval(() => {
    const tracks = Object.values(tune.tracks); 
    const numNotes = tracks.reduce((memo, track) => memo + track.notes.length, 0);
    console.log(`playing - ${tracks.length} tracks, ${numNotes} notes`);
  }, 1000);

  const player = new MidiPlayer.Player(event => {
    const time = Math.round((performance.now() - start) / speed);
    const track = getTrack(event.track, tune);
    
    switch (event.name) {
      case MidiEventsEnum.PROGRAM_CHANGE:
        track.instrumentName = getInstrumentNameFromId(event.value);
        break;

      case MidiEventsEnum.NOTE_ON:
      case MidiEventsEnum.NOTE_OFF: {
        // Finish the previous note
        const playingNote = findLast(track.notes, note => note.duration === 0);

        if (playingNote && playingNote.duration === 0)
          playingNote.duration = Math.round((time - playingNote.time) / speed);

        // Note_on with a velocity of 0 should be interpreted as Note_off
        if (event.velocity > 0) {
          track.notes.push({
            time: time,
            name: event.noteName,
            velocity: event.velocity,
            duration: 0
          });
        }
      
        break;
      }
    }
  });

  player.on('endOfFile', () => {
    const basename = path.basename(midiFile, path.extname(midiFile));
    const jsonFile = path.join(__dirname, '../public/tunes', basename + '.json');

    writeFileSync(jsonFile, JSON.stringify(serializeTune(tune), null, 2));
    console.log(`Wrote ${jsonFile}`);
    process.exit(0);
  });

  player.loadFile(midiFile);
  player.play();
}

function getTrack(trackId: number, tune: Tune) {
  let track = tune.tracks[trackId];

  if (track)
    return track;

  track = {
    instrumentName: getInstrumentNameFromId(0),
    notes: []    
  };

  tune.tracks[trackId] = track;

  return track;
}

function serializeTune(tune: Tune) {
  const tracks = Object.values(tune.tracks);
  const postprocess = flow(trimStart, splitTrackOverlaps, mergeNonOverlappingsTracks, limitTracks);

  return postprocess(tracks);
}

// Make sure that first note plays at 0.
function trimStart(tracks: Track[]) {
  const tuneStart = tracks.reduce((minTime, track) => {
    const trackStart = track.notes.reduce((minNote, note) => Math.min(minNote, note.time), Number.MAX_SAFE_INTEGER);

    return Math.min(minTime, trackStart);
  }, Number.MAX_SAFE_INTEGER);

  tracks.forEach(track => {
    track.notes.forEach(note => note.time -= tuneStart);
  });

  return tracks;
}

// Some files have multiple notes playing at the same time in the same channel. This will create new channels as needed.
// It's one of the places where the exercise is simplified compared to real MIDI.
function splitTrackOverlaps(tracks: Track[]) {
  let didFindOverlap = false;

  const processed = tracks.map(track => {
    let maxNoteEnd = 0;

    // Find overlapping notes: notes which start before a previous note has ended.
    const [overlapping, separate] = partition(track.notes, note => {
      const isOverlapping = note.time < maxNoteEnd;
      
      if (isOverlapping) {
        didFindOverlap = true;
        return true;
      }

      maxNoteEnd = Math.max(maxNoteEnd, note.time + note.duration);
      return false;
    });

    return [
      {...track, notes: separate},
      {...track, notes: overlapping},
    ].filter(track => track.notes.length > 0);
  }).flat();

  // If we did find overlapping notes, process again to make sure
  // the newly created channels don't have overlapping notes themselves.
  if (didFindOverlap)
    return splitTrackOverlaps(processed);

  return processed;
}

// The previous step tends to create many tracks with a handulf of notes.
// This will find tracks that do not overlap and merge them.
function mergeNonOverlappingsTracks(tracks: Track[]) {
  const match = findMergeableTracks(tracks);

  if (!match)
    return tracks;

  const [leftTrack, rightTrack, otherTracks] = match;

  const mergedTrack: Track = {
    instrumentName: leftTrack.instrumentName,
    notes: sortBy([...leftTrack.notes, ...rightTrack.notes], 'time')
  };

  return mergeNonOverlappingsTracks([mergedTrack, ...otherTracks]);
}

type MergeableTracks = [Track, Track, Track[]];
function findMergeableTracks(tracks: Track[]) {
  return tracks.reduce<MergeableTracks | undefined>((match, leftTrack, index) => {
    if (match)
      return match;

    const followingTracks = tracks.slice(index + 1);

    const nonOverlappingTrack = followingTracks.find(rightTrack => (
      leftTrack.instrumentName === rightTrack.instrumentName &&
      !areTracksOverlapping(leftTrack, rightTrack)
    ));

    if (!nonOverlappingTrack)
        return undefined;

    const otherTracks = without(tracks, leftTrack, nonOverlappingTrack);

    return [leftTrack, nonOverlappingTrack, otherTracks];
  }, undefined);
}

function areTracksOverlapping(leftTrack: Track, rightTrack: Track) {
  let rightNotes = rightTrack.notes;

  return leftTrack.notes.some(leftNote => {
    // First note from right track that finishes after left note.
    const rightIndex = rightNotes.findIndex(note => note.time + note.duration > leftNote.time);
    if (rightIndex < 0)
      return false;

    const rightNote = rightNotes[rightIndex];

    if (areNotesOverlapping(leftNote, rightNote))
      return true;

    // Eliminate notes that can no longer overlap.
    rightNotes = rightNotes.slice(rightIndex);
    return false;
  });
}

function areNotesOverlapping(leftNote: Note, rightNote: Note) {
  const endLeft = leftNote.time + leftNote.duration;
  const endRight = rightNote.time + rightNote.duration;

  return (
    (leftNote.time < rightNote.time && endLeft > rightNote.time)
    || (rightNote.time < leftNote.time && endRight > leftNote.time)
  );
}

function limitTracks(tracks: Track[]) {
  if (tracks.length < MAX_NUM_TRACKS)
    return tracks;

  console.error(`File has more than ${MAX_NUM_TRACKS} tracks, removing tracks with least notes. Will likely butcher the resulting audio.`);

  // We can have 16 channels maximum. Eliminate tracks with least notes if needed.
  return sortBy(tracks, track => -track.notes.length).slice(0, MAX_NUM_TRACKS);
}

function bail(reason: string) {
  console.error(reason);
  process.exit(-1);
}

const midiFile = process.argv[2];
const adjustSpeed = Number(process.argv[3]) || 0;

if (!midiFile) {
  bail('Expected: <filename.mid> [<adjustSpeed>]\nadjustSpeed: 20 = speedup track by 20%');
}

convertFile(midiFile, adjustSpeed);