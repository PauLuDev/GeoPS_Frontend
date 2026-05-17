export function HourChart() {
    const hours = Array.from({ length: 14 }, (_, i) => 8 + i);
    const reserved = [4, 6, 9, 14, 22, 38, 52, 41, 28, 19, 24, 31, 22, 12];
    const redeemed  = [2, 3, 5, 9, 16, 28, 41, 32, 20, 13, 17, 22, 15, 7];
    const max = Math.max(...reserved);
    return (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 200 }}>
            {hours.map((h, i) => (
                <div key={h} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 2, width: "100%", justifyContent: "center" }}>
                        <div style={{ width: "42%", background: "var(--ink)", borderRadius: "3px 3px 0 0", height: `${(reserved[i] / max) * 100}%`, transition: "height 800ms cubic-bezier(.2,.8,.2,1)", transitionDelay: `${i * 30}ms` }}/>
                        <div style={{ width: "42%", background: "var(--brand)", borderRadius: "3px 3px 0 0", height: `${(redeemed[i] / max) * 100}%`, transition: "height 800ms cubic-bezier(.2,.8,.2,1)", transitionDelay: `${i * 30 + 80}ms` }}/>
                    </div>
                    <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: i === 5 || i === 6 ? "var(--ink)" : "var(--ink-3)", fontWeight: i === 5 || i === 6 ? 600 : 400 }}>
                        {h.toString().padStart(2, "0")}
                    </div>
                </div>
            ))}
        </div>
    );
}