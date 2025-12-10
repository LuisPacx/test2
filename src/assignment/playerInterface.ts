export interface PlayerInterface {
  /** Start or resume the current tracks. */
  play(): Promise<void>;

  /** Return the current song progress in milliseconds. */
  getTime(): number;

  /**
   * Skip to a specific timestamp in milliseconds.
   *
   * @note Focus on getting `play` and `getTime` to work before implementing this.
   */
  skipToTimestamp?(timestamp: number): void;
}
