import {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import {TIME_RANGE, LEFT_OFFSET} from './constants';
import {TimerVisualization} from './TimerVisualization';
import {TrackVisualization} from './TrackVisualization';
import {Recording} from '../synthesizer/Recorder';

interface ScoreVisualizationProps {
  recording: Recording;
  isViewingScore: boolean;
  isPlaying: boolean;
}

export const ScoreVisualization: FC<ScoreVisualizationProps> = ({recording, isViewingScore, isPlaying}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>();
  const [info, setInfo] = useState<string>();

  const tracks = useMemo(
    () => (isViewingScore ? recording.score : recording.tracks),
    [isViewingScore, recording]
  );

  const range = useMemo(() => {
    const start = Math.floor(recording.time / TIME_RANGE) * TIME_RANGE;
    const end = start + TIME_RANGE;

    return {start, end, current: recording.time};
  }, [recording.time]);

  function measureDimensions() {
    if (ref.current) {
      setScale((ref.current.offsetWidth - LEFT_OFFSET) / TIME_RANGE);
    }
  }

  useLayoutEffect(measureDimensions, [ref]);

  useEffect(() => {
    window.addEventListener('resize', measureDimensions);

    return () => window.removeEventListener('resize', measureDimensions);
  }, [ref]);

  const onMouseMove: MouseEventHandler<HTMLDivElement> = useCallback((event) => {
    const {target} = event;

    setInfo(isNoteSpan(target) ? target.dataset.info : '');
  }, []);

  return (
    <div className="score-container">
      <div className="score" ref={ref} onMouseMove={onMouseMove}>
        {isPlaying && <TimerVisualization range={range} scale={scale} />}
        {scale &&
          tracks.map((track, index) => (
            <TrackVisualization key={index} track={track} range={range} scale={scale} />
          ))}
      </div>
      <p>
        <strong className="timer-label">{renderTime(range)}</strong>
        <span>{info}</span>
      </p>
    </div>
  );
};

function renderTime(range: Range) {
  return `${Math.floor(range.current / 1000)}s`;
}

export interface Range {
  start: number;
  end: number;
  current: number;
}

function isNoteSpan(node: any): node is HTMLSpanElement {
  return node.nodeType === 1 && node.tagName === 'SPAN' && node.className === 'note';
}