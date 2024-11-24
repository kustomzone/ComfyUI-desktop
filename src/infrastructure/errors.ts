import i18next from 'i18next';
// Keys only - not a hardcoded language
import type { error } from '../i18n/en/error';

/** Base error class for all errors. Adds {@link code}. */
export class DesktopError extends Error {
  constructor(
    public code: keyof typeof error,
    public interpolation?: Record<string, unknown>,
    options?: ErrorOptions
  ) {
    const message = i18next.t(code, interpolation);
    super(message, options);
    // https://github.com/microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // ES5 transpile safety; usually a good idea when extending errors.
    // Immeasurably small impact if already set correctly (ES6).
    Object.setPrototypeOf(this, DesktopError.prototype);
  }
}
