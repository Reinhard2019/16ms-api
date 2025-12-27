import i18next from "i18next";
import Cookies from "js-cookie";
import zh from "./zh";
import en from "./en";
import { type Lang } from "./types";

export function getDefaultLang(lang?: string) {
  lang = lang || navigator.language.toLowerCase();

  if (lang.startsWith("zh")) return "zh";

  if (lang.startsWith("en")) return "en";

  return "en"; // 默认英文
}

export const defaultLang: Lang = getDefaultLang();

export const getLng = () => (Cookies.get("lang") as Lang) ?? defaultLang;

export const setLang = (lang: Lang) => {
  Cookies.set("lang", lang, {
    domain: location?.hostname === "localhost" ? undefined : ".16ms.ai",
  });
};

i18next.init({
  lng: getLng(),
  resources: {
    en: {
      translation: en,
    },
    zh: {
      translation: zh,
    },
  },
});
