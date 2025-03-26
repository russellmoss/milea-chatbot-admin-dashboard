import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface NavItem {
  name: string;
  to: string;
  icon: JSX.Element;
}

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  
  const navigation: NavItem[] = [
    {
      name: 'Overview',
      to: '/dashboard',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Feedback',
      to: '/dashboard/feedback',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      )
    },
    {
      name: 'Knowledge Base',
      to: '/dashboard/knowledge',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    {
      name: 'SMS',
      to: '/dashboard/sms',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      name: 'Analytics',
      to: '/dashboard/analytics',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];
  
  return (
    <div className={`h-screen bg-white border-r border-gray-200 transition-all duration-300 ${expanded ? 'w-64' : 'w-20'}`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        {expanded ? (
          <h1 className="text-xl font-bold text-primary">WineAssist</h1>
        ) : (
          <span className="text-xl font-bold text-primary">WA</span>
        )}
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1 rounded-full text-primary hover:bg-gray-100"
        >
          {expanded ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      <nav className="mt-6">
        <ul className="space-y-2 px-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.to}
                className={({ isActive }: { isActive: boolean }) =>
                  `flex items-center px-4 py-2 rounded-md ${
                    isActive
                      ? 'bg-darkBrown text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${!expanded && 'justify-center'}`
                }
              >
                <span className={`${expanded ? 'mr-3' : ''}`}>{item.icon}</span>
                {expanded && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}