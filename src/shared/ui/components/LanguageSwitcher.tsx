import { useTranslation } from "react-i18next";
import { LANGS, type Lang } from "@/shared/i18n";

/** Toggle compacto EN / ES. Cambia el idioma global de i18next. */
export function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const current = (i18n.resolvedLanguage ?? i18n.language) as Lang;

    return (
        <div className="lang-switch" role="group" aria-label={t("lang.label")}>
            {LANGS.map(lng => (
                <button
                    key={lng}
                    type="button"
                    className={"lang-switch-btn" + (current === lng ? " active" : "")}
                    aria-pressed={current === lng}
                    onClick={() => i18n.changeLanguage(lng)}
                >
                    {lng.toUpperCase()}
                </button>
            ))}
        </div>
    );
}