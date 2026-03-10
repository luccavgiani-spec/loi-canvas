import { useEffect, useRef } from 'react';

/**
 * Intersection Observer hook that adds 'revealed' class
 * to elements with the 'reveal' class when they scroll into view.
 *
 * Pass extra `deps` so the observer re-scans after async content renders
 * (e.g. product cards that appear after a loading state resolves).
 */
export function useReveal(threshold = 0.15, deps: unknown[] = []) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const targets = el.querySelectorAll(
      '.reveal:not(.revealed), .reveal-fade:not(.revealed), .reveal-scale:not(.revealed), .reveal-left:not(.revealed), .reveal-right:not(.revealed), .reveal-stagger:not(.revealed)'
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, ...deps]);

  return containerRef;
}
