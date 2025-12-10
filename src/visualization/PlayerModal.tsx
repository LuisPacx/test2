import { useCallback, useEffect, useState, FC, useMemo } from 'react';
import { Synthesizer } from '../synthesizer/Synthesizer';
import { player as assignmentPlayer } from '../assignment/player';
import { Recorder, Recording } from '../synthesizer/Recorder';
import { ScoreVisualization } from './ScoreVisualization';
import { Handler } from '../util';
import { Score } from '../types';
import { PlayerInterface } from '../assignment/playerInterface';

interface PlayerModalProps {
  score: Score;
  shouldAutoStart: boolean;
  onAutoStart: Handler;
  onRequestClose: Handler;
}

export const PlayerModal: FC<PlayerModalProps> = ({ score, shouldAutoStart, onAutoStart, onRequestClose }) => {
  const [recording, setRecording] = useState<Recording & { time: number }>();
  const [isViewingScore, setViewingScore] = useState(false);

  const playerController = useMemo(() => new PlayerController(score), [score]);

  const toggleViewScore = useCallback(() => setViewingScore(!isViewingScore), [isViewingScore]);

  // Render at 30fps.
  useEffect(() => {
    const interval = setInterval(() => {
      const recordingState = playerController.getRecordingState();
      if (recordingState) {
        setRecording(recordingState);
      }
    }, 32);

    return () => clearInterval(interval);
  }, [playerController]);

  const onPlay = useCallback(async () => {
    return playerController.play();
  }, [playerController]);


  const onStop = useCallback(() => {
    playerController.stop()
  }, [playerController]);

  useEffect(() => {
    if (shouldAutoStart) {
      onPlay();
      onAutoStart();
    }
  }, [shouldAutoStart, onAutoStart, onPlay]);

  // Stop on unmount.
  useEffect(() => {
    return () => {
      playerController.stop();
    };
  }, [playerController]);

  const { error, isPlaying } = playerController;

  return (
    <>
      <div className="overlay" onClick={onRequestClose} />
      <div className="modal pane">
        {recording && <ScoreVisualization recording={recording} isViewingScore={isViewingScore} isPlaying={isPlaying} />}

        {!recording && <div>Play to visualize notes.</div>}

        <div className="player-controls">
          <button className="primary" onClick={() => onPlay()} disabled={isPlaying}>
            Play
          </button>

          <button className="primary destructive" onClick={onStop} disabled={!isPlaying}>
            Stop
          </button>

          {!isViewingScore && <button className="secondary" onClick={toggleViewScore}>View reference</button>}

          {isViewingScore && <button className="secondary" onClick={toggleViewScore}>View live</button>}

          <button className="secondary" disabled={!playerController.hasFastForward()} onClick={() => playerController.fastForward(-2000)}>Rewind 2s</button>
          <button className="secondary" disabled={!playerController.hasFastForward()} onClick={() => playerController.fastForward(2000)}>Forward 2s</button>

          <button className="secondary" onClick={onRequestClose}>Close</button>
        </div>

        {error && <div className="error">{String(error)}</div>}
      </div>
    </>
  );
};

/*
 * Helpers.
 */

/** Used to keep recorder, synthesizer and player synced & manage state */
class PlayerController {
  score: Score;
  recorder: Recorder | null = null;
  synthesizer: Synthesizer | null = null;
  player: PlayerInterface | null = null;
  isPlaying: boolean = false;
  error?: Error;

  constructor(score: Score) {
    this.score = score;
  }

  async play() {
    try {
      this.recorder = new Recorder(this.score);
      this.synthesizer = new Synthesizer(this.recorder);
      this.player = assignmentPlayer(this.synthesizer, this.score);
      this.isPlaying = true;
      await this.player.play();
    } catch (err: any) {
      this.error = err;
    } finally {
      this.isPlaying = false;
    }
  }

  stop() {
    this.synthesizer?.close();
    this.isPlaying = false;
  }

  getRecordingState() {
    if (!this.recorder) {
      return null;
    }
    return {
      ...this.recorder.getState(),
      ...(this.player && { time: this.player?.getTime() })
    }
  }

  hasFastForward() {
    return Boolean(this.player?.skipToTimestamp);
  }

  fastForward(delta: number) {
    if (!this.player || !this.player?.skipToTimestamp) {
      return;
    }
    const timestamp = Math.max(this.player.getTime() + delta, 0);
    this.player?.skipToTimestamp?.(timestamp);
    this.recorder?.skipToTimestamp(timestamp);
  }
}