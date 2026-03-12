import { Prayer } from "@/lib/types";

export function PrayerList({ prayers }: { prayers: Prayer[] }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.1)",
        background: "rgba(255,255,255,0.05)",
        padding: "24px",
        borderRadius: "32px",
      }}
    >
      <h3 style={{ fontSize: "24px", color: "#fcd34d" }}>Prayer Archive</h3>
      <div style={{ marginTop: "16px", display: "grid", gap: "16px" }}>
        {prayers.length === 0 ? (
          <div style={{ border: "1px dashed rgba(255,255,255,0.1)", background: "rgba(2,6,23,0.4)", padding: "24px", borderRadius: "24px", color: "#94a3b8" }}>
            No prayers have been placed on this altar yet.
          </div>
        ) : (
          prayers.map((prayer) => (
            <div key={prayer.id} style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(2,6,23,0.7)", padding: "16px", borderRadius: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <div>
                  <h4 style={{ color: "white" }}>{prayer.title}</h4>
                  <p style={{ marginTop: "4px", fontSize: "12px", textTransform: "uppercase", letterSpacing: ".2em", color: "#94a3b8" }}>
                    {new Date(prayer.created_at).toLocaleString()}
                  </p>
                </div>
                <div style={{ fontSize: "12px", color: "#fef3c7" }}>{prayer.candle_count} candles</div>
              </div>
              <p style={{ marginTop: "12px", whiteSpace: "pre-wrap", color: "#cbd5e1", lineHeight: 1.7 }}>{prayer.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}