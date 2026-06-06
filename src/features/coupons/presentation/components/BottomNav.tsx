import {Icon} from "@/shared/ui/components/Icon.tsx";

interface BottomNavProps {
    tab: string;
    setTab: (t: string) => void;
    favCount: number;
}

export function BottomNav({ tab, setTab, favCount }: BottomNavProps) {
    const items = [
        { id: "map", label: "Mapa", icon: "map" },
        { id: "categories", label: "Categorías", icon: "grid" },
        { id: "saved", label: "Guardados", icon: "bookmark", badge: favCount },
        { id: "profile", label: "Perfil", icon: "user" },
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