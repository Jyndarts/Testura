import { useAuth } from "../hooks/useAuth";

export default function DashboardPlaceholder() {
  const { user } = useAuth();

  return (
    <div style={{ color: "#cdd6f4" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "8px" }}>
        Welcome{user ? ` ${user.name}` : ""}
      </h1>
      <p style={{ color: "#6c7086" }}>Dashboard coming soon.</p>
    </div>
  );
}
