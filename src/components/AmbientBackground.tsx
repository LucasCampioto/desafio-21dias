export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Aurora blobs */}
      <div
        className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full opacity-50 blur-3xl animate-drift"
        style={{ background: "radial-gradient(circle, var(--aurora-1) 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full opacity-40 blur-3xl animate-drift-slow"
        style={{ background: "radial-gradient(circle, var(--aurora-2) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl animate-drift"
        style={{ background: "radial-gradient(circle, var(--aurora-3) 0%, transparent 70%)" }}
      />
      {/* Star dust */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, white, transparent), radial-gradient(1px 1px at 70% 60%, white, transparent), radial-gradient(1px 1px at 40% 80%, white, transparent), radial-gradient(1px 1px at 85% 20%, white, transparent), radial-gradient(1px 1px at 10% 65%, white, transparent), radial-gradient(1px 1px at 55% 15%, white, transparent)",
          backgroundSize: "600px 600px",
        }}
      />
      {/* Vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, oklch(0.08 0.03 280 / 0.6) 100%)" }} />
    </div>
  );
}
