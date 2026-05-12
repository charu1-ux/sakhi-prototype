export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "var(--bg)",
        padding: 24,
      }}
    >
      <div style={{ fontSize: 44 }}>📈</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--fg)" }}>Finance</h1>
      <p style={{ fontSize: 13, color: "var(--fg-muted)" }}>Lead: Himen</p>
    </main>
  );
}
