import type { AppLanguage } from "@/store/languageStore";
import amAuth from "./am/auth";
import amContent from "./am/content";
import amGames from "./am/games";
import amGameUi from "./am/gameUi";
import amHome from "./am/home";
import amLevelMap from "./am/levelMap";
import amNavigation from "./am/navigation";
import amProfile from "./am/profile";
import amSidebar from "./am/sidebar";
import amWordDetails from "./am/wordDetails";
import amProgress from "./am/progress";
import enAuth from "./en/auth";
import enContent from "./en/content";
import enGames from "./en/games";
import enGameUi from "./en/gameUi";
import enHome from "./en/home";
import enLevelMap from "./en/levelMap";
import enNavigation from "./en/navigation";
import enProfile from "./en/profile";
import enProgress from "./en/progress";
import enSidebar from "./en/sidebar";
import enWordDetails from "./en/wordDetails";

export const TRANSLATIONS = {
  en: {
    auth: enAuth,
    content: enContent,
    games: enGames,
    gameUi: enGameUi,
    home: enHome,
    levelMap: enLevelMap,
    navigation: enNavigation,
    profile: enProfile,
    progress: enProgress,
    sidebar: enSidebar,
    wordDetails: enWordDetails,
  },
  am: {
    auth: amAuth,
    content: amContent,
    games: amGames,
    gameUi: amGameUi,
    home: amHome,
    levelMap: amLevelMap,
    navigation: amNavigation,
    profile: amProfile,
    progress: amProgress,
    sidebar: amSidebar,
    wordDetails: amWordDetails,
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
