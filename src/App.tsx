// src/App.tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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
import { Toaster } from 'react-hot-toast';

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <SocketProvider>
          <MessageProvider>
            <SMSProvider>
              <DashboardLayout />
            </SMSProvider>
          </MessageProvider>
        </SocketProvider>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: "feedback",
        element: <Feedback />
      },
      {
        path: "knowledge",
        element: <KnowledgeBase />
      },
      {
        path: "sms",
        element: <SMS />
      },
      {
        path: "analytics",
        element: <Analytics />
      }
    ]
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />
  }
], {
  future: {
    v7_normalizeFormMethod: true,
    v7_partialHydration: true
  }
});

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;