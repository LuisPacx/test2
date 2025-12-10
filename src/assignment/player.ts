import { Synthesizer } from '../synthesizer/Synthesizer';
import { Track } from '../types';
import { delayAsync, buildTimer } from '../util';
import { PlayerInterface } from './playerInterface';

export function player(synthesizer: Synthesizer, tracks: ReadonlyArray<Track>): PlayerInterface {
  const timer = buildTimer();

  // Controls the main playback loop
  let isPlaying = false;

  // Holds the specific timestamp we want to jump to
  let nextTimestamp: number | null = null;

  // Syncs the internal wall-clock timer with the musical timestamp after a skip
  let timeOffset = 0;

  // We need a reference to the current delay's controller so skipToTimestamp can interrupt it
  let activeAbortController: AbortController | null = null;

  async function skipToTimestamp(timestamp: number): Promise<void> {
    // 1. Set the target
    // Add a small buffer to avoid edge cases where it get unsynced
    nextTimestamp = timestamp + 100;

    // 2. Abort the currently playing note's delay.
    // This triggers an AbortError in the play() loop, which we catch to restart the loop.
    if (activeAbortController) {
      activeAbortController.abort();
    }
  }

  async function play(): Promise<void> {
    isPlaying = true;

    // Cache channels once to avoid creating duplicates if we restart the loop due to a skip
    const channels = tracks.map(track => synthesizer.getChannel(track.instrumentName));

    // Labeled loop allows us to "restart" the sequence when a skip occurs
    mainLoop: while (isPlaying) {
      let virtualTime = 0; // The current position in the score

      // Check if we are starting this iteration in "Seeking" mode
      let seeking = nextTimestamp !== null;
      const seekTarget = nextTimestamp || 0;
      nextTimestamp = null;

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const channel = channels[i];

        for (const note of track.notes) {
          if (!isPlaying) break mainLoop;

          // --- 1. SEEKING LOGIC ---
          if (seeking) {
            // If this note finishes before our target, skip it entirely (Fast Forward)
            if (virtualTime + note.duration < seekTarget) {
              virtualTime += note.duration;
              continue;
            }

            // We have reached the target note. Stop seeking and resume play.
            seeking = false;

            // Recalculate offset. 
            // We want getTime() to return the 'virtualTime' (song position).
            // timer() is wall-clock time since start.
            // Equation: timer() + timeOffset = virtualTime
            timeOffset = virtualTime - timer();
          }

          // --- 2. PLAYBACK LOGIC ---

          // Create a new controller for this specific note
          activeAbortController = new AbortController();
          const signal = activeAbortController.signal;

          // tmeporary local-scoped constant for the current controller
          const currentNoteAbortController = activeAbortController;

          const abortCurrentDelay = () => {
            currentNoteAbortController.abort();
          };

          channel.playNote(note.name, note.velocity, abortCurrentDelay);

          if (channel.didSignalStop) {
            console.log(`Channel for instrument ${track.instrumentName} has been stopped.`);
            isPlaying = false;
            return;
          }

          try {
            await delayAsync(note.duration, signal);
          } catch (error: any) {
            // Handle Abort (User pressed Stop OR Skip)
            if (error.name === 'AbortError') {
              channel.stopNote(); // Ensure note cuts off immediately

              if (nextTimestamp !== null) {
                // CASE: SKIP
                // The user asked to skip. We stopped the current note. 
                // Now we continue 'mainLoop' to restart the track iteration 
                // and fast-forward to the new timestamp.
                continue mainLoop;
              } else {
                // CASE: STOP
                console.log(`Playback aborted by user.`);
                isPlaying = false;
                return;
              }
            }
            throw error;
          }

          channel.stopNote();
          virtualTime += note.duration;
        }
      }

      // If we finished all tracks naturally without interruption
      isPlaying = false;
    }
  }

  function getTime(): number {
    const elapsed = timer();

    if (!isPlaying) {
      return 0;
    }

    // Return wall-clock time adjusted by our skip offsets
    return elapsed + timeOffset;
  }

  return {
    play,
    getTime,
    skipToTimestamp,
  };
}