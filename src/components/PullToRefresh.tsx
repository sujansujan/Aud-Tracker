import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowDown, RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<any> | void;
  isRefreshing?: boolean;
  children: React.ReactNode;
  className?: string;
  pullText?: string;
  releaseText?: string;
  refreshingText?: string;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  isRefreshing = false,
  children,
  className = '',
  pullText = 'Pull down to scan Audible',
  releaseText = 'Release to check for new releases',
  refreshingText = 'Scanning Audible catalog...',
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const PULL_THRESHOLD = 70;

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    if (container.scrollTop > 5) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    startYRef.current = clientY;
    isDraggingRef.current = true;
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (!isDraggingRef.current || isRefreshing) return;
      const container = containerRef.current;
      if (!container || container.scrollTop > 5) {
        if (pullDistance > 0) setPullDistance(0);
        return;
      }

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = clientY - startYRef.current;

      if (deltaY > 0) {
        const dampened = Math.min(100, Math.pow(deltaY, 0.82));
        setPullDistance(dampened);
        setIsPulling(true);

        if (dampened >= PULL_THRESHOLD && pullDistance < PULL_THRESHOLD && typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(12);
          } catch {}
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    },
    [isRefreshing, pullDistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setPullDistance(50);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([15, 40, 15]);
        } catch {}
      }
      try {
        await onRefresh();
      } finally {
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMove = (e: TouchEvent) => handleTouchMove(e);
    const onEnd = () => handleTouchEnd();

    container.addEventListener('touchmove', onMove, { passive: true });
    container.addEventListener('touchend', onEnd);
    container.addEventListener('touchcancel', onEnd);

    return () => {
      container.removeEventListener('touchmove', onMove);
      container.removeEventListener('touchend', onEnd);
      container.removeEventListener('touchcancel', onEnd);
    };
  }, [handleTouchMove, handleTouchEnd]);

  const effectiveHeight = isRefreshing ? Math.max(pullDistance, 50) : pullDistance;
  const isReady = pullDistance >= PULL_THRESHOLD;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onMouseDown={handleTouchStart}
      onMouseMove={(e) => isDraggingRef.current && handleTouchMove(e.nativeEvent)}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      className={`relative overflow-y-auto ${className}`}
    >
      {/* Pull Indicator Area */}
      <div
        style={{
          height: `${effectiveHeight}px`,
          backgroundColor: 'transparent',
        }}
        className="transition-all duration-150 ease-out overflow-hidden flex items-center justify-center select-none shrink-0"
      >
        {effectiveHeight > 10 && (
          <div
            style={{
              backgroundColor: 'var(--md-sys-color-surface)',
              borderColor: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-surface)',
              boxShadow: 'var(--md-elevation-2)',
            }}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-full border transition-all"
          >
            {isRefreshing ? (
              <>
                <RefreshCw
                  className="h-4 w-4 animate-spin"
                  style={{ color: 'var(--md-sys-color-primary)' }}
                />
                <span style={{ color: 'var(--md-sys-color-primary)' }}>{refreshingText}</span>
              </>
            ) : isReady ? (
              <>
                <RefreshCw
                  className="h-4 w-4 rotate-180 transition-transform duration-200"
                  style={{ color: 'var(--md-sys-color-primary)' }}
                />
                <span style={{ color: 'var(--md-sys-color-primary)' }}>{releaseText}</span>
              </>
            ) : (
              <>
                <ArrowDown
                  className="h-4 w-4 transition-transform duration-150"
                  style={{
                    color: 'var(--md-sys-color-on-surface-variant)',
                    transform: `rotate(${Math.min(180, (pullDistance / PULL_THRESHOLD) * 180)}deg)`,
                  }}
                />
                <span style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>{pullText}</span>
              </>
            )}
          </div>
        )}
      </div>

      {children}
    </div>
  );
};
