import { useTranslation } from "react-i18next";
import { Icon } from "@/shared/ui/components/Icon";

interface SidebarProps {
    view: string;
    setView: (v: string) => void;
    onSwitchRole: () => void;
    onSignOut: () => void;
    campaignCount?: number;
}

const SIDEBAR_ITEMS = [
    { id: "dashboard", labelKey: "merchant.navDashboard", icon: "home" },
    { id: "campaigns", labelKey: "merchant.navCampaigns", icon: "tag" },
    { id: "new", labelKey: "merchant.navNewCampaign", icon: "plus" },
    { id: "redeem", labelKey: "merchant.navRedeem", icon: "redeem" },
] as const;

export function MerchantSidebar({ view, setView, onSwitchRole, onSignOut, campaignCount = 0 }: SidebarProps) {
    const { t } = useTranslation();
    return (
        <aside className="msb">
            <div className="msb-head">
                <div className="brand">
                    <div className="brand-mark">
                        <svg viewBox="0 0 24 24" fill="none">
                            <path d="M12 22 C 6 15 4 11 4 8 a 8 8 0 0 1 16 0 c 0 3 -2 7 -8 14 z" fill="currentColor"/>
                            <circle cx="12" cy="9" r="3" fill="var(--brand)"/>
                        </svg>
                    </div>
                    <span>GeoPS</span>
                    <span className="brand-suffix">merchant</span>
                </div>
            </div>

            <nav className="msb-nav">
                {SIDEBAR_ITEMS.map(item => (
                    <button type="button" key={item.id}
                            className={"msb-item" + (view === item.id ? " active" : "")}
                            onClick={() => setView(item.id)}>
                        <Icon name={item.icon} size={16}/>
                        <span>{t(item.labelKey)}</span>
                        {item.id === "campaigns" && campaignCount > 0 && (
                            <span className="msb-badge">{campaignCount}</span>
                        )}
                    </button>
                ))}

                <div className="msb-section msb-section-gap">{t("merchant.navMyBusiness")}</div>
                <button type="button"
                        className={"msb-item" + (view === "establishments" ? " active" : "")}
                        onClick={() => setView("establishments")}>
                    <Icon name="store" size={16}/><span>{t("merchant.navEstablishments")}</span>
                </button>
                <button type="button"
                        className={"msb-item" + (view === "coupons" ? " active" : "")}
                        onClick={() => setView("coupons")}>
                    <Icon name="ticket" size={16}/><span>{t("merchant.navCoupons")}</span>
                </button>
                <button type="button"
                        className={"msb-item" + (view === "subscription" ? " active" : "")}
                        onClick={() => setView("subscription")}>
                    <Icon name="card" size={16}/><span>{t("merchant.navSubscription")}</span>
                </button>
                <button type="button"
                        className={"msb-item" + (view === "account" ? " active" : "")}
                        onClick={() => setView("account")}>
                    <Icon name="user" size={16}/><span>{t("merchant.navAccount")}</span>
                </button>
            </nav>

            <div className="msb-foot">
                <button type="button" className="btn btn-ghost btn-sm msb-switch-btn" onClick={onSwitchRole}>
                    <Icon name="arrow_up_right" size={14}/> {t("merchant.customerView")}
                </button>
                <button type="button" className="msb-signout" onClick={onSignOut}>
                    <Icon name="arrowLeft" size={14}/> {t("merchant.signOut")}
                </button>
            </div>
        </aside>
    );
}