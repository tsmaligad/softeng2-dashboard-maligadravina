import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ children }) {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    // 1) Reset the window scroll
    window.scrollTo(0, 0);

    // 2) Reset any app containers that might be scrolling
    const scrollers = [
      document.scrollingElement || document.documentElement,
      document.body,
      ...document.querySelectorAll(
        // add any selectors you use that can scroll
        'main, [data-scroll-container], [data-scroll], .overflow-y-auto, .overflow-auto'
      ),
    ].filter(Boolean);

    scrollers.forEach((el) => {
      try {
        el.scrollTop = 0;
        el.scrollLeft = 0;
      } catch {}
    });

    // 3) Run one more time after paint in case layout changed
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      scrollers.forEach((el) => {
        try { el.scrollTop = 0; el.scrollLeft = 0; } catch {}
      });
    });
  }, [pathname]);

  return children ?? null;
}
