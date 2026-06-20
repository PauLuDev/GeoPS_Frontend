import {Icon} from "@/shared/ui/components/Icon.tsx";
import {useTranslation} from "react-i18next";

interface BottomNavProps {
    tab: string;
    setTab: (t: string) => void;
    savedCount: number;
}

export function BottomNav({ tab, setTab, savedCount }: BottomNavProps) {
    const { t } = useTranslation();
    const items = [
        { id: "map", label: t("nav.map"), icon: "map" },
        { id: "categories", label: t("nav.categories"), icon: "grid" },
        { id: "saved", label: t("nav.coupons"), icon: "ticket", badge: savedCount },
        { id: "profile", label: t("nav.profile"), icon: "user" },
    ];
    return (
        <nav className="bottom-nav">
            {items.map(it => (
                <button type="button" key={it.id} className={"bn-item" + (tab === it.id ? " active" : "")}
                        onClick={() => setTab(it.id)}>
          <span className="bn-icon-wrap">
            <Icon name={it.icon} size={20} stroke={tab === it.id ? 2 : 1.6}/>
              {(it.badge ?? 0) > 0 && <span className="bn-badge mono">{it.badge}</span>}
          </span>
                    <span className="bn-label">{it.label}</span>
                </button>
            ))}
            <span className="bn-indicator" style={{
                transform: `translateX(${items.findIndex(i => i.id === tab) * 100}%)`,
                width: `${100 / items.length}%`,
            }}/>
        </nav>
    );
}