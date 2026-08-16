
export default function EngineeringGrid() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-0 opacity-40"
      style={{
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
        `,
        backgroundSize: "70px 70px",
        maskImage:
          "radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 100%)",
        WebkitMaskImage:
          "radial-gradient(ellipse 80% 60% at 50% 40%, black 20%, transparent 100%)",
      }}
    />
  );
}