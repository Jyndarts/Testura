import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useSidebar } from "../../hooks/useSidebar";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Topbar() {
  const { user, logout } = useAuth();
  const { toggle } = useSidebar();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header
      style={{
        height: "56px",
        background: "#181825",
        color: "#cdd6f4",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        borderBottom: "1px solid #313244",
      }}
    >
      <button
        className="hamburger"
        onClick={toggle}
        style={{
          background: "none",
          border: "none",
          color: "#cdd6f4",
          fontSize: "24px",
          cursor: "pointer",
        }}
      >
        &#9776;
      </button>

      <div style={{ flex: 1 }} />

      {user && (
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              background: "#45475a",
              border: "none",
              color: "#cdd6f4",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {getInitials(user.name)}
          </button>
          {dropdownOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 4px)",
                background: "#313244",
                border: "1px solid #45475a",
                borderRadius: "6px",
                minWidth: "150px",
                zIndex: 50,
              }}
            >
              <button
                onClick={handleLogout}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  color: "#cdd6f4",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "14px",
                  borderRadius: "6px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#45475a")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
