import { Synthesizer } from '../synthesizer/Synthesizer';

import { Track } from '../types';
import { delayAsync, buildTimer } from '../util';
import { PlayerInterface } from './playerInterface';

export function player(synthesizer: Synthesizer, tracks: ReadonlyArray<Track>): PlayerInterface {
  const timer = buildTimer();

  let isPlaying = false;

  async function skipToTimestamp(timestamp: number): Promise<void> {
    console.log('Skipping to timestamp requested:', timestamp);
    console.log('Actual elapsed time before skip:', timer(), 'ms');
  }

  async function play(): Promise<void> {
    isPlaying = true;

    for (const track of tracks) {
      const channel = synthesizer.getChannel(track.instrumentName);

      for (const note of track.notes) {
        // 1. Create a NEW AbortController for this specific notes delay
        const noteAbortController = new AbortController();
        const signal = noteAbortController.signal;

        // 2. Define the Abort Function
        const abortCurrentDelay = () => {
          noteAbortController.abort();
        };

        // 3. Pass the abort function to the channel when playing the note
        // the link is now established
        channel.playNote(note.name, note.velocity, abortCurrentDelay);

        // Check if the note has been stopped externally
        if (channel.didSignalStop) {
          console.log(`Channel for instrument ${track.instrumentName} has been stopped. Exiting play loop.`);
          isPlaying = false;
          return;
        }

        try {
          // 4. Wait on the delay, which can be aborted by the channel
          await delayAsync(note.duration, signal);
        } catch (error: any) {
          // 5. Catch the AbortError (triggered by stop() -> synthesizer.close() -> channel.close() -> abortCurrentDelay())
          if (error.name === 'AbortError') {
            console.log(`Playback aborted by user's stop action.`);
            isPlaying = false;
            return; // Exit the entire play sequence
          }
          throw error;
        }

        channel.stopNote();
      }
    }

    isPlaying = false;
  }

  function getTime(): number {
    const elapsed = timer();

    if (!isPlaying) {
      return 0;
    }

    return elapsed;
  }

  return {
    play,
    getTime,
    skipToTimestamp,
  };
}
