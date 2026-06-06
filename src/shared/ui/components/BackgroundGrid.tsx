export function BackgroundGrid() {
    return (
        <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `linear-gradient(to right, var(--line) 1px, transparent 1px), linear-gradient(to bottom, var(--line) 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)"
        }}/>
    );
}