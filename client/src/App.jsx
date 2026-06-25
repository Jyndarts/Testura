import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Projects from './pages/Projects';
import TestCases from './pages/TestCases';
import TestRuns from './pages/TestRuns';
import RunExecution from './pages/RunExecution';
import Bugs from './pages/Bugs';
import Integrations from './pages/Integrations';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          element={
            <ProtectedRoute>
              <ProjectProvider>
                <AppLayout />
              </ProjectProvider>
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/test-cases" element={<TestCases />} />
          <Route path="/test-runs" element={<TestRuns />} />
          <Route path="/test-runs/:runId/execute" element={<RunExecution />} />
          <Route path="/bugs" element={<Bugs />} />
          <Route path="/integrations" element={<Integrations />} />
        </Route>
        <Route path="*" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
