import { useSidebar } from "../../hooks/useSidebar";

export default function MobileSidebarOverlay() {
  const { close } = useSidebar();

  return (
    <div
      className="sidebar-overlay"
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        zIndex: 99,
      }}
    />
  );
}
