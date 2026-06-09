const HOURS    = Array.from({ length: 14 }, (_, i) => 8 + i);
const RESERVED = [4, 6, 9, 14, 22, 38, 52, 41, 28, 19, 24, 31, 22, 12];
const REDEEMED = [2, 3, 5, 9, 16, 28, 41, 32, 20, 13, 17, 22, 15, 7];
const CHART_MAX = Math.max(...RESERVED);

export function HourChart() {
    return (
        <div className="hc-chart">
            {HOURS.map((h, i) => (
                <div key={h} className="hc-col">
                    <div className="hc-bars">
                        <div className="hc-bar hc-bar-reserved" style={{ height: `${(RESERVED[i] / CHART_MAX) * 100}%`, transitionDelay: `${i * 30}ms` }}/>
                        <div className="hc-bar hc-bar-redeemed" style={{ height: `${(REDEEMED[i] / CHART_MAX) * 100}%`, transitionDelay: `${i * 30 + 80}ms` }}/>
                    </div>
                    <div className={"hc-label" + (i === 5 || i === 6 ? " peak" : "")}>
                        {h.toString().padStart(2, "0")}
                    </div>
                </div>
            ))}
        </div>
    );
}