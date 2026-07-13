import { useRouter, Href } from "expo-router";
import { useRef, useCallback, useMemo } from "react";

export function useSafeRouter() {
  const router = useRouter();
  const lastPressTime = useRef<number>(0);

  const safePush = useCallback((href: Href, options?: any) => {
    const now = Date.now();
    if (now - lastPressTime.current < 800) {
      return;
    }
    lastPressTime.current = now;
    router.push(href, options);
  }, [router]);

  const safeReplace = useCallback((href: Href, options?: any) => {
    const now = Date.now();
    if (now - lastPressTime.current < 800) {
      return;
    }
    lastPressTime.current = now;
    router.replace(href, options);
  }, [router]);

  return useMemo(() => ({
    ...router,
    push: safePush,
    replace: safeReplace,
  }), [router, safePush, safeReplace]);
}
