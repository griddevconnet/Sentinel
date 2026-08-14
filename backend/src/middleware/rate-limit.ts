import rateLimit from "express-rate-limit";

/**
 * Applied to the public, unauthenticated report-submission endpoint.
 * Generous enough for genuine repeated use from a shared community
 * device, but bounds automated/abusive flooding of the triage queue.
 */
export const reportSubmissionLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many reports submitted from this network. Please try again later." } },
});

/** Looser general-purpose limiter for the rest of the public API surface. */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

/** Stricter limiter for the login endpoint to slow credential-stuffing attempts. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: "Too many login attempts. Please try again later." } },
});
