import type { AppLanguage } from "@/store/languageStore";
import amHome from "./am/home";
import amNavigation from "./am/navigation";
import amProfile from "./am/profile";
import amSidebar from "./am/sidebar";
import enHome from "./en/home";
import enNavigation from "./en/navigation";
import enProfile from "./en/profile";
import enSidebar from "./en/sidebar";

export const TRANSLATIONS = {
  en: {
    home: enHome,
    navigation: enNavigation,
    profile: enProfile,
    sidebar: enSidebar,
  },
  am: {
    home: amHome,
    navigation: amNavigation,
    profile: amProfile,
    sidebar: amSidebar,
  },
} as const;

type TranslationParams = Record<string, string | number>;

function readPath(source: unknown, path: string): string | undefined {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  return path.split(".").reduce<unknown>((value, segment) => {
    if (!value || typeof value !== "object") {
      return undefined;
    }
    return (value as Record<string, unknown>)[segment];
  }, source) as string | undefined;
}

function interpolate(template: string, params?: TranslationParams) {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key];
    return value == null ? `{${key}}` : String(value);
  });
}

export function t(
  language: AppLanguage,
  key: string,
  params?: TranslationParams,
): string {
  const selected = readPath(TRANSLATIONS[language], key);
  const fallback = readPath(TRANSLATIONS.en, key);
  const value = selected ?? fallback ?? key;

  return interpolate(value, params);
}
