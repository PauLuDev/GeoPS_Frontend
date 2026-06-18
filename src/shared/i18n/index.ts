import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en.ts";
import { es } from "./locales/es.ts";

export const LANGS = ["en", "es"] as const;
export type Lang = (typeof LANGS)[number];

const STORAGE_KEY = "geops.lang";

/* idioma inicial: lo guardado por el usuario, si no -> ingles por defecto */
const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
const initialLang: Lang = stored === "es" || stored === "en" ? stored : "en";

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        es: { translation: es },
    },
    lng: initialLang,
    fallbackLng: "es", // lo que aun no esta traducido cae a espanol
    interpolation: { escapeValue: false }, // react ya escapa
    react: { useSuspense: false }, // recursos inline -> sin suspense, evita pantalla en blanco al cargar directo
});

i18n.on("languageChanged", (lng) => {
    try { localStorage.setItem(STORAGE_KEY, lng); } catch { /* noop */ }
    if (typeof document !== "undefined") document.documentElement.lang = lng;
});

if (typeof document !== "undefined") document.documentElement.lang = initialLang;

export default i18n;