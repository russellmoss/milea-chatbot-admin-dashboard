// src/contexts/SocketContext.tsx
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

// Define the shape of the context
interface SocketContextType {
  socket: any | null;
  isConnected: boolean;
  error: string | null;
}

// Create the context with a default value
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// Mock socket implementation
const createMockSocket = () => {
  let connected = false;
  let connecting = false;
  let connectPromise: Promise<void> | null = null;
  let animationFrameId: number | null = null;

  const mockSocket = {
    on: (event: string, callback: Function) => {
      console.log(`Registered mock socket event listener for ${event}`);
      if (event === 'connect') {
        // Use Promise-based connection instead of setTimeout
        if (!connectPromise) {
          connectPromise = new Promise((resolve) => {
            // Use requestAnimationFrame for a more CSP-friendly delay
            let startTime = performance.now();
            const animate = (currentTime: number) => {
              if (currentTime - startTime >= 500) {
                console.log('Mock socket connected');
                connected = true;
                connecting = false;
                callback();
                resolve();
                if (animationFrameId !== null) {
                  cancelAnimationFrame(animationFrameId);
                }
              } else {
                animationFrameId = requestAnimationFrame(animate);
              }
            };
            animationFrameId = requestAnimationFrame(animate);
          });
        }
      }
      return mockSocket;
    },
    emit: (event: string, ...args: any[]) => {
      console.log(`Mock socket emitted ${event}`, args);
      return mockSocket;
    },
    connect: () => {
      if (connecting) return mockSocket;
      console.log('Mock socket connecting...');
      connecting = true;
      return mockSocket;
    },
    disconnect: () => {
      console.log('Mock socket disconnected');
      connected = false;
      connecting = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      connectPromise = null;
      return mockSocket;
    },
    isConnected: () => connected,
    isConnecting: () => connecting
  };
  return mockSocket;
};

// Provider component
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<any | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const connectionPromiseRef = useRef<Promise<void> | null>(null);

  // Initialize socket connection
  useEffect(() => {
    let isMounted = true;
    console.log('Socket initializing - one-time setup');
    
    const setupSocket = async () => {
      try {
        // Create mock socket
        const mockSocket = createMockSocket();
        socketRef.current = mockSocket;
        
        // Register event handlers
        mockSocket.on('connect', () => {
          if (isMounted) {
            console.log('Mock socket connected event');
            setIsConnected(true);
          }
        });
        
        // Store the socket in state
        if (isMounted) {
          setSocket(mockSocket);
        }
        
        // Simulate connecting
        mockSocket.connect();
        
        // Store cleanup function
        cleanupRef.current = () => {
          console.log('Socket cleanup - final teardown');
          if (socketRef.current && socketRef.current.isConnected()) {
            socketRef.current.disconnect();
          }
        };
      } catch (err) {
        if (isMounted) {
          console.error('Socket connection error:', err);
          setError(err instanceof Error ? err.message : 'Failed to connect to socket');
        }
      }
    };

    setupSocket();

    return () => {
      isMounted = false;
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []); // Empty dependency array ensures this runs once

  return (
    <SocketContext.Provider value={{ socket, isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
};

// Hook to use the context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};