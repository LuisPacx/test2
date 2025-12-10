import { getIdFromInstrumentName } from '../instruments';
import { Recorder } from './Recorder';
import { JZZSynthesizerChannel, JZZSynthesizerChannelProgram } from 'jzz-synth-tiny';

const DEBUG = false;

export class Channel {
  isPlaying: boolean;
  didSignalStop: boolean;
  instrumentName: string;
  recorder?: Recorder;
  channel: JZZSynthesizerChannelProgram;
  channelId: number;
  currentNote: string | undefined;

  /*
    Hold a reference to the current note's abort function
    so that when stopNote is called, we can abort any ongoing delay
    in real time.
  */
  private delayAbortFunction: (() => void) | undefined;

  constructor(
    channel: JZZSynthesizerChannel,
    channelId: number,
    instrumentName: string,
    recorder?: Recorder
  ) {
    this.isPlaying = true;
    this.didSignalStop = false;
    this.instrumentName = instrumentName;
    this.recorder = recorder;
    this.channel = channel.program(getIdFromInstrumentName(instrumentName));
    this.channelId = channelId;
    this.currentNote = undefined;
  }

  playNote(noteName: string, velocity: number, abortDelay?: () => void) {
    if (DEBUG) {
      console.log('START', this.instrumentName, noteName);
    }

    this.recorder?.onPlayNote(this.channelId, noteName, velocity);

    if (this.currentNote) {
      throw new Error(
        `Started ${noteName} while ${this.currentNote} is still playing on ${this.instrumentName} (channel ${this.channelId}).`
      );
    }

    this.channel.note(noteName, velocity);
    this.currentNote = noteName;

    // Store the abort function
    this.delayAbortFunction = abortDelay;

    if (!this.isPlaying) {
      if (this.didSignalStop) throw new Error('Attempting to play note after channel has closed.');

      this.didSignalStop = true;
    }

    return this.isPlaying;
  }

  stopNote() {
    if (DEBUG) {
      console.log('STOP', this.instrumentName);
    }

    if (this.delayAbortFunction) {
      this.delayAbortFunction();
      this.delayAbortFunction = undefined;
    }

    if (this.recorder) {
      this.recorder.onStopNote(this.channelId);
    }

    if (this.currentNote) {
      this.channel.noteOff(this.currentNote);
      this.currentNote = undefined;
    }

    return this.isPlaying;
  }

  close() {
    this.stopNote();
    this.isPlaying = false;
  }
}
