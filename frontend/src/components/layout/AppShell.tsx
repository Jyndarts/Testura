import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileSidebarOverlay from "./MobileSidebarOverlay";

export default function AppShell() {
  const { isOpen, close } = useSidebar();
  const location = useLocation();

  useEffect(() => {
    close();
  }, [location.pathname]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Topbar />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar />
        {isOpen && <MobileSidebarOverlay />}
        <main
          className="app-content"
          style={{
            flex: 1,
            marginLeft: 0,
            padding: "24px",
            overflowY: "auto",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
