/**
 * Wait for a specified amount of time. To make the exercise more interesting, delayAsync is not reentrant.
 *
 * @param duration the duration in milliseconds.
 */

let isDelaying = false;

// export async function delayAsync(duration: number) {
//   if (isDelaying)
//     throw new Error('delayAsync is not reentrant.');

//   isDelaying = true;

//   return new Promise((resolve) => setTimeout(() => {
//     isDelaying = false;
//     resolve(undefined);
//   }, duration));
// }

export async function delayAsync(duration: number, signal?: AbortSignal) {
  if (isDelaying) {
    throw new Error('delayAsync is not reentrant.');
  }

  // Define the custom error to throw on abort
  class AbortError extends Error {
    constructor(message = 'Delay aborted.') {
      super(message);
      this.name = 'AbortError';
    }
  }

  if (signal?.aborted) {
    throw new AbortError();
  }

  isDelaying = true;

  return new Promise((resolve, reject) => {
    // 1. Set up the timeout
    const timeoutId = setTimeout(() => {
      // Clean up after resolution/rejection
      signal?.removeEventListener('abort', onAbort);

      isDelaying = false;
      resolve(undefined);
    }, duration);

    // 2. Set up the abort listener
    const onAbort = () => {
      clearTimeout(timeoutId); // Stop the timeout
      signal?.removeEventListener('abort', onAbort); // Remove listener
      isDelaying = false;
      reject(new AbortError()); // Reject the Promise
    };

    signal?.addEventListener('abort', onAbort);
  });
}

/*
 * Factory for a timer that returns the number of milliseconds since the timer was created:
 * @example
 *   const timer = buildTimer();
 *   // later
 *   const elapsed = timer();
 */
export function buildTimer() {
  const startTime = performance.now();

  return () => {
    return Math.round(performance.now() - startTime);
  };
}

export type Handler<T extends ReadonlyArray<unknown> = []> = (...args: T) => void;
