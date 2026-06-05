import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import AppRouter from "./routes/AppRouter";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <AppRouter />
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
