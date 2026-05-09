import { useState, useEffect, useRef } from "react";
import { CustomerApp } from "./components/geops/CustomerApp";
import { MerchantApp } from "./components/geops/MerchantApp";
import { TweaksPanel, TweakSection, TweakRadio, useTweaks } from "./components/geops/TweaksPanel";

const TWEAK_DEFAULTS = {
  "theme": "light",
  "density": "default",
  "brandHue": 130,
  "mapEngine": "osm"
};

export default function App() {
  const [role, setRole] = useState<"customer" | "merchant">("customer");
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = appRef.current;
    if (!el) return;
    el.setAttribute("data-theme", tweaks.theme);
    el.setAttribute("data-density", tweaks.density);
    el.style.setProperty("--brand-h", String(tweaks.brandHue));
  }, [tweaks]);

  const switchRole = () => setRole(r => r === "customer" ? "merchant" : "customer");

  return (
    <div ref={appRef} className="geops-app" data-screen-label={role === "customer" ? "Customer" : "Merchant"}>
      {role === "customer"
        ? <CustomerApp onSwitchRole={switchRole} mapEngine={tweaks.mapEngine} theme={tweaks.theme} onThemeChange={v => setTweak("theme", v)}/>
        : <MerchantApp onSwitchRole={switchRole} mapEngine={tweaks.mapEngine} theme={tweaks.theme}/>}

      <div id="geops-portal-root" style={{ position: "relative", zIndex: 9999 }}/>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Apariencia">
          <TweakRadio label="Tema" value={tweaks.theme} onChange={v => setTweak("theme", v)}
                      options={[{ value: "light", label: "Claro" }, { value: "dark", label: "Oscuro" }]}/>
          <TweakRadio label="Densidad" value={tweaks.density} onChange={v => setTweak("density", v)}
                      options={[{ value: "compact", label: "Compacta" }, { value: "default", label: "Normal" }, { value: "cozy", label: "Amplia" }]}/>
        </TweakSection>
        <TweakSection title="Color de marca">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
            {[
              { h: 130, name: "Lima" },
              { h: 155, name: "Menta" },
              { h: 180, name: "Cyan" },
              { h: 230, name: "Azul" },
              { h: 280, name: "Violeta" },
              { h: 25,  name: "Coral" },
            ].map(opt => {
              const active = tweaks.brandHue === opt.h;
              return (
                <button key={opt.h}
                        onClick={() => setTweak("brandHue", opt.h)}
                        title={opt.name}
                        style={{
                          appearance: "none",
                          border: active ? "2px solid var(--ink)" : "2px solid transparent",
                          padding: 0, height: 36, borderRadius: 10,
                          background: `oklch(0.78 0.18 ${opt.h})`,
                          cursor: "pointer",
                          boxShadow: active ? "0 0 0 2px var(--bg-elev) inset" : "none",
                          transition: "transform 160ms ease, border-color 160ms ease",
                          transform: active ? "scale(1.05)" : "scale(1)"
                        }}/>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 8, fontFamily: "var(--font-mono)" }}>
            HUE = {tweaks.brandHue}°
          </div>
        </TweakSection>
        <TweakSection title="Mapa">
          <TweakRadio label="Motor" value={tweaks.mapEngine || "osm"} onChange={v => setTweak("mapEngine", v)}
                      options={[{ value: "osm", label: "OpenStreetMap" }, { value: "stylized", label: "Estilizado" }]}/>
        </TweakSection>
        <TweakSection title="Vista activa">
          <TweakRadio label="Rol" value={role} onChange={(v: string) => setRole(v as "customer" | "merchant")}
                      options={[{ value: "customer", label: "Cliente" }, { value: "merchant", label: "Merchant" }]}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}
