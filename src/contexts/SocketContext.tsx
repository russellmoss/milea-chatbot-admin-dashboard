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

  // Log context initialization
  useEffect(() => {
    console.log('SocketContext: Initializing provider', {
      hasUser: !!user,
      hasSocket: !!socket,
      isConnected
    });
  }, [user, socket, isConnected]);

  // Initialize socket connection
  useEffect(() => {
    if (!user) {
      console.log('SocketContext: No user, skipping socket initialization');
      return;
    }

    console.log('SocketContext: Initializing socket connection', {
      userId: user.uid
    });

    // Create mock socket
    const mockSocket: MockSocket = {
      connected: false,
      on: (event: string, callback: (data: any) => void) => {
        console.log('SocketContext: Registered event listener', {
          event,
          hasCallback: !!callback
        });
      },
      off: (event: string, callback: (data: any) => void) => {
        console.log('SocketContext: Removed event listener', {
          event,
          hasCallback: !!callback
        });
      },
      emit: (event: string, ...args: any[]) => {
        console.log('SocketContext: Emitted event', {
          event,
          argsCount: args.length,
          args
        });
      },
      connect: () => {
        console.log('SocketContext: Connecting socket');
        mockSocket.connected = true;
        setIsConnected(true);
      },
      disconnect: () => {
        console.log('SocketContext: Disconnecting socket');
        mockSocket.connected = false;
        setIsConnected(false);
      }
    };

    // Simulate connection
    console.log('SocketContext: Simulating socket connection');
    setTimeout(() => {
      mockSocket.connect();
      setSocket(mockSocket);
    }, 1000);

    // Cleanup on unmount
    return () => {
      console.log('SocketContext: Cleaning up socket connection');
      if (mockSocket.connected) {
        mockSocket.disconnect();
      }
      setSocket(null);
    };
  }, [user]);

  // Log connection status changes
  useEffect(() => {
    console.log('SocketContext: Connection status changed', {
      isConnected,
      hasSocket: !!socket,
      userId: user?.uid
    });
  }, [isConnected, socket, user?.uid]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}