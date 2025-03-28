import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
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

  const emitMessageSent = (messageId: string) => {
    const sentCallbacks = listeners['message-sent'] || [];
    sentCallbacks.forEach(cb => cb({ 
      messageId, 
      status: 'sent' 
    }));
  };

  const emitMessageDelivered = (messageId: string) => {
    const deliveredCallbacks = listeners['message-status-update'] || [];
    deliveredCallbacks.forEach(cb => cb({ 
      messageId, 
      status: 'delivered' 
    }));
  };

  const handleMessageSent = (messageId: string) => {
    emitMessageSent(messageId);
    // Schedule delivery notification
    window.setTimeout(() => emitMessageDelivered(messageId), 2000);
  };

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
        
        // Schedule message sent notification
        window.setTimeout(() => handleMessageSent(message.id), 500);
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

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<MockSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const mountedRef = useRef(false);
  const socketRef = useRef<MockSocket | null>(null);
  const initializedRef = useRef(false);
  const timeoutRef = useRef<number>();
  const cleanupRef = useRef<(() => void) | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!user) {
      console.log('SocketContext: No user, skipping socket initialization');
      return;
    }

    // Only initialize once
    if (!initializedRef.current) {
      initializedRef.current = true;
      mountedRef.current = true;
      console.log('SocketContext: Initializing socket connection', {
        userId: user.uid,
        hasExistingSocket: !!socketRef.current
      });

      // Create mock socket instance
      const mockSocket = createMockSocket();
      
      socketRef.current = mockSocket;
      setSocket(mockSocket);

      // Set up connection event handlers
      mockSocket.on('connect', () => {
        if (mountedRef.current) {
          console.log('SocketContext: Socket connected');
          setIsConnected(true);
        }
      });

      mockSocket.on('disconnect', () => {
        if (mountedRef.current) {
          console.log('SocketContext: Socket disconnected');
          setIsConnected(false);
        }
      });

      // Simulate connection
      console.log('SocketContext: Simulating socket connection');
      timeoutRef.current = window.setTimeout(() => {
        if (mountedRef.current && socketRef.current) {
          socketRef.current.connect();
        }
      }, 1000);

      // Store cleanup function
      cleanupRef.current = () => {
        console.log('SocketContext: Cleaning up socket connection');
        if (timeoutRef.current) {
          window.clearTimeout(timeoutRef.current);
        }
        if (socketRef.current?.connected) {
          socketRef.current.disconnect();
        }
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      };
    }

    // Cleanup on unmount
    return () => {
      // Only cleanup if we're actually unmounting, not just in strict mode
      if (mountedRef.current) {
        mountedRef.current = false;
        if (cleanupRef.current) {
          cleanupRef.current();
        }
      }
    };
  }, [user?.uid]); // Only depend on user ID

  // Log connection status changes
  useEffect(() => {
    if (mountedRef.current) {
      console.log('SocketContext: Connection status changed', {
        isConnected,
        hasSocket: !!socketRef.current,
        userId: user?.uid
      });
    }
  }, [isConnected, user?.uid]);

  // Memoize the context value to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    socket,
    isConnected
  }), [socket, isConnected]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}