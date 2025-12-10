import {FC, useMemo} from 'react';
import {Range} from './ScoreVisualization';

import {LEFT_OFFSET} from './constants';

interface TimerVisualizationProps {
  range: Range;
  scale: number | undefined;
}

export const TimerVisualization: FC<TimerVisualizationProps> = ({range, scale}) => {
  const style = useMemo(
    () => ({
      left: computeIndicatorOffset(range, scale)
    }),
    [range, scale]
  );

  return <i className="timer" style={style} />;
};

function computeIndicatorOffset(range: Range, scale: number | undefined) {
  if (scale === undefined) {
    return 0;
  }

  return (range.current - range.start) * scale + LEFT_OFFSET;
}
