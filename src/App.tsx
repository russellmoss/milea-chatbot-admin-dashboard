import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SMSProvider } from './contexts/SMSContext';
import { SocketProvider } from './contexts/SocketContext';
import { MessageProvider } from './contexts/MessageContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardLayout from './components/dashboard/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Feedback from './pages/Feedback';
import KnowledgeBase from './pages/KnowledgeBase';
import SMS from './pages/SMS';
import Analytics from './pages/Analytics';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <MessageProvider>
                  <SocketProvider>
                    <SMSProvider>
                      <DashboardLayout />
                    </SMSProvider>
                  </SocketProvider>
                </MessageProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="feedback" element={<Feedback />} />
            <Route path="knowledge" element={<KnowledgeBase />} />
            <Route path="sms" element={<SMS />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;