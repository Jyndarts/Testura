import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";

const linkStyle = {
  display: "block",
  padding: "10px 16px",
  color: "#cdd6f4",
  textDecoration: "none",
  borderRadius: "6px",
  marginBottom: "4px",
  fontSize: "14px",
};

const activeLinkStyle = {
  ...linkStyle,
  background: "#45475a",
  color: "#89b4fa",
};

export default function Sidebar() {
  const { user } = useAuth();
  const { isOpen, close } = useSidebar();

  return (
    <aside
      className={`sidebar${isOpen ? " open" : ""}`}
      style={{
        width: "260px",
        background: "#1e1e2e",
        color: "#cdd6f4",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s ease",
        position: "fixed" as const,
        top: 0,
        left: 0,
        height: "100vh",
        zIndex: 100,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
      }}
    >
      <div style={{ padding: "20px 16px", fontSize: "18px", fontWeight: 700, color: "#89b4fa" }}>
        Testura
      </div>
      <nav style={{ flex: 1, padding: "8px" }}>
        <NavLink
          to="/dashboard"
          onClick={close}
          style={({ isActive }) => (isActive ? activeLinkStyle : linkStyle)}
        >
          Dashboard
        </NavLink>
      </nav>
      {user && (
        <div style={{ padding: "16px", borderTop: "1px solid #313244", fontSize: "14px" }}>
          {user.name}
          <div style={{ color: "#6c7086", fontSize: "12px" }}>{user.email}</div>
        </div>
      )}
    </aside>
  );
}
