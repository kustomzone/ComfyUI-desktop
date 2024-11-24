import { messages } from './en/messages';
import { error } from './en/error';
import type { InitOptions } from 'i18next';

const ns = ['messages', 'error'];

const resources = {
  en: {
    error,
    messages,
  },
};

export function getI18nConfig<T = object>(): InitOptions<T> {
  return {
    // TODO: Read language from settings, fall back to language detector.
    lng: 'en',
    debug: true,
    ns,
    defaultNS: 'messages',
    resources,
  };
}
