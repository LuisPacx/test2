import {FC, KeyboardEventHandler, ReactNode, useCallback, useEffect, useMemo, useRef, useState} from 'react';

interface PanesProps {
  slides: ReadonlyArray<ReactNode>;
}

export const Panes: FC<PanesProps> = ({slides}) => {
  const numSlides = slides.length;
  const [pageNum, setPageNum] = useState(getInitialPage(numSlides));

  const slide = useMemo(() => slides[pageNum - 1], [slides, pageNum]);

  const hasPrevious = pageNum > 1;
  const hasNext = pageNum < slides.length;

  const ref = useRef<HTMLDivElement>(null);

  // Store slide in URL param.
  useEffect(() => {
    const routePage = parseRoutePage();

    if (routePage !== pageNum) window.history.pushState('', '', `/${pageNum}`);
  });

  useEffect(() => {
    if (ref.current) ref.current.focus();
  });

  const onKeyDown: KeyboardEventHandler = useCallback(
    (event) => {
      if (event.code === 'ArrowLeft' && hasPrevious) setPageNum(pageNum - 1);

      if (event.code === 'ArrowRight' && hasNext) setPageNum(pageNum + 1);
    },
    [hasNext, hasPrevious, pageNum]
  );

  return (
    <div className="pane" onKeyDown={onKeyDown} tabIndex={0} ref={ref}>
      <div className="pane-content">{slide}</div>
      <div className="pane-controls">
        {hasPrevious && (
          <button className="tertiary" onClick={() => setPageNum(pageNum - 1)}>
            ◄ Previous
          </button>
        )}
        {hasNext && (
          <button className="tertiary next" onClick={() => setPageNum(pageNum + 1)}>
            Next ►
          </button>
        )}
      </div>
    </div>
  );
};

function parseRoutePage() {
  const {pathname} = window.location;
  const results = /^\/(\d+)$/.exec(pathname);

  return results ? Number(results[1]) : undefined;
}

function getInitialPage(numSlides: number) {
  const page = parseRoutePage() || 1;

  return Math.max(1, Math.min(page, numSlides));
}
