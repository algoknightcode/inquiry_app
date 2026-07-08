/**
 * Session-level flags that live only in memory.
 * Reset to false every time the app cold-starts.
 * Using a separate module (not app/index.tsx) avoids circular dependency
 * issues where auth screens import from the root route file.
 */

let sessionWelcomeShown = false;
let sessionSkippedRole = false;

export function getSessionWelcomeShown(): boolean {
  return sessionWelcomeShown;
}

export function setSessionWelcomeShown(): void {
  sessionWelcomeShown = true;
}

export function getSessionSkippedRole(): boolean {
  return sessionSkippedRole;
}

export function setSessionSkipRole(): void {
  sessionSkippedRole = true;
}
