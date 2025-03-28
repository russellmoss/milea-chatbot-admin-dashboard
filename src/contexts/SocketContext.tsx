import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Mock socket interface to mimic the real Socket.IO client
interface MockSocket {
  connected: boolean;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, ...args: any[]) => void;
  connect: () => void;
  disconnect: () => void;
}

// Event listeners for the mock socket
type EventListeners = {
  [event: string]: ((data: any) => void)[];
};

// Create a mock socket implementation
const createMockSocket = (): MockSocket => {
  let connected = false;
  const listeners: EventListeners = {};

  return {
    connected,
    on: (event, callback) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    },
    off: (event, callback) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter(cb => cb !== callback);
      }
    },
    emit: (event, ...args) => {
      console.log(`MockSocket emitting ${event}`, args);
      
      // If this is a server-to-server message, we can simulate a response
      if (event === 'send-message') {
        const [message] = args;
        
        // Simulate message sent
        setTimeout(() => {
          const sentCallbacks = listeners['message-sent'] || [];
          sentCallbacks.forEach(cb => cb({ 
            messageId: message.id, 
            status: 'sent' 
          }));
          
          // Simulate delivery after a delay
          setTimeout(() => {
            const deliveredCallbacks = listeners['message-status-update'] || [];
            deliveredCallbacks.forEach(cb => cb({ 
              messageId: message.id, 
              status: 'delivered' 
            }));
          }, 2000);
        }, 500);
      }
    },
    connect: () => {
      connected = true;
      const connectCallbacks = listeners['connect'] || [];
      connectCallbacks.forEach(cb => cb(null));
    },
    disconnect: () => {
      connected = false;
      const disconnectCallbacks = listeners['disconnect'] || [];
      disconnectCallbacks.forEach(cb => cb(null));
    }
  };
};

// Socket context
interface SocketContextType {
  socket: MockSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<MockSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Initialize socket on mount or when user changes
  useEffect(() => {
    if (!user) {
      // No user, no socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Create a mock socket
    const newSocket = createMockSocket();
    setSocket(newSocket);

    // Set up connection events
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Additional events can be set up here
    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Simulate connection
    setTimeout(() => {
      newSocket.connect();
    }, 500);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
      setSocket(null);
    };
  }, [user]);

  // Simulate occasional disconnects and reconnects for realism
  useEffect(() => {
    if (!socket) return;

    const disconnectInterval = setInterval(() => {
      if (Math.random() < 0.05) { // 5% chance of disconnect every interval
        console.log('Simulating random disconnect');
        socket.disconnect();
        
        // Reconnect after a short delay
        setTimeout(() => {
          console.log('Simulating reconnect');
          socket.connect();
        }, 2000);
      }
    }, 60000); // Check every minute

    return () => clearInterval(disconnectInterval);
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}