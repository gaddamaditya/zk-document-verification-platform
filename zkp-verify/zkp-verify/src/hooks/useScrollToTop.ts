import { useEffect } from 'react';

export function useScrollToTop(dependency: unknown) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [dependency]);
}