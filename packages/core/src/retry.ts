export type RetryDecision = {
  shouldRetry: boolean;
  delayMs: number;
  nextAttempt: number;
  deadLetter: boolean;
};

export function nextRetryDecision(attempt: number, maxAttempts = 5, baseDelayMs = 1000): RetryDecision {
  const nextAttempt = attempt + 1;
  if (nextAttempt > maxAttempts) {
    return { shouldRetry: false, delayMs: 0, nextAttempt, deadLetter: true };
  }
  const exponential = baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.round(exponential * 0.2);
  return { shouldRetry: true, delayMs: exponential + jitter, nextAttempt, deadLetter: false };
}
