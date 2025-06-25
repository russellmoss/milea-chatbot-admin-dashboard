import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';

// Import modal components
import ExportModal from '../components/dashboard/ExportModal';
import DateRangeModal from '../components/dashboard/DateRangeModal';

// Import apis
import { getConversationCount } from '../apis/metrics/apis';

// Import utils
import { computeConvRisePercent } from './utils/dashboard/utils';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const navigate = useNavigate();
  
  // State for modals
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [dateRangeModalOpen, setDateRangeModalOpen] = useState(false);
  
  // State for filters and selections
  const [dateRange, setDateRange] = useState('30days');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [alertFilter, setAlertFilter] = useState('all');

  // state for metrics
  const [totalConvsThisMonth, setTotalConvsThisMonth] = useState<number>(0);
  const [totalConvsLastMonth, setTotalConvsLastMonth] = useState<number>(0);
  
  // Sample data for the chart
  const chartData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Conversations',
        data: [65, 78, 90, 85, 112, 126],
        borderColor: '#5A3E00',
        backgroundColor: 'rgba(90, 62, 0, 0.1)',
        tension: 0.3
      },
      {
        label: 'Successful Resolutions',
        data: [55, 68, 82, 75, 102, 115],
        borderColor: '#715100',
        backgroundColor: 'rgba(113, 81, 0, 0.1)',
        tension: 0.3
      }
    ]
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Chatbot Performance',
      },
    },
  };
  
  // Sample alerts data
  const alerts = [
    {
      id: 1,
      priority: 'high',
      category: 'knowledge',
      title: 'Knowledge gap detected in "Wine Club" responses',
      description: 'Multiple users have reported receiving incomplete information about wine club tiers. Update needed.',
      action: 'View Details'
    },
    {
      id: 2,
      priority: 'medium',
      category: 'business',
      title: 'Resolution rate dropping for reservation queries',
      description: 'Reservation resolution rate has dropped by 8% in the past week. Consider updating reservation handling.',
      action: 'Investigate'
    },
    {
      // Continuing the Dashboard.tsx implementation

      // Continuing the Dashboard.tsx implementation

      id: 3,
      priority: 'low',
      category: 'system',
      title: 'Commerce7 sync completed successfully',
      description: '23 new products were synced from Commerce7. No errors detected.',
      action: 'View Log'
    }
  ];
  
  // Filter alerts based on selected category
  const filteredAlerts = alertFilter === 'all' 
    ? alerts 
    : alerts.filter(alert => alert.category === alertFilter);
  
  // Handle date range change
  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDateRange(value);
    if (value === 'custom') {
      setDateRangeModalOpen(true);
    }
  };
  
  // Handle custom date range apply
  const handleApplyCustomDateRange = (startDate: string, endDate: string) => {
    setCustomDateRange({ start: startDate, end: endDate });
    setDateRangeModalOpen(false);
  };
  
  // Handle export
  const handleExport = (format: string) => {
    console.log(`Exporting in ${format} format`);
    // In a real application, this would trigger the actual export
    setExportModalOpen(false);
  };
  
  // Navigation handlers
  const handleSyncKnowledgeBase = () => {
    navigate('/dashboard/knowledge');
  };

  const handleSendBulkMessage = () => {
    navigate('/dashboard/sms');
  };

  const handleViewConversions = () => {
    navigate('/dashboard/analytics');
  };

  const handleReviewNegativeFeedback = () => {
    navigate('/dashboard/feedback');
  };

  const handleGoToKnowledgeManager = () => {
    navigate('/dashboard/knowledge');
  };


  // pull metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); // last day of last month

        const [thisMonthData, lastMonthData] = await Promise.all([
          getConversationCount(startOfThisMonth, now),
          getConversationCount(startOfLastMonth, endOfLastMonth)
        ]);

        setTotalConvsThisMonth(thisMonthData);
        setTotalConvsLastMonth(lastMonthData);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
  }, []);

  
  return (
    <div className="space-y-6">
      {/* Modals */}
      <ExportModal 
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
      />
      
      <DateRangeModal
        isOpen={dateRangeModalOpen}
        onClose={() => setDateRangeModalOpen(false)}
        onApply={handleApplyCustomDateRange}
      />
      
      {/* Main Dashboard Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-primary mb-4">Dashboard Overview</h2>
        <p className="text-gray-600 mb-4">
          Welcome to the WineAssist management dashboard. Monitor key metrics and manage your chatbot from here.
        </p>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Total Conversations</h3>
            <p className="text-2xl font-bold text-primary">{totalConvsThisMonth}</p>
            <p className="text-sm text-green-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {computeConvRisePercent(totalConvsThisMonth, totalConvsLastMonth)} from last month
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Resolution Rate</h3>
            <p className="text-2xl font-bold text-primary">92%</p>
            <p className="text-sm text-green-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              3% from last month
            </p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Data Capture Rate</h3>
            <p className="text-2xl font-bold text-primary">61%</p>
            <p className="text-sm text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              5% from last month
            </p>
          </div>
          
          {/* Quality Index Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Quality Index</h3>
            <p className="text-2xl font-bold text-primary">8.7</p>
            <div className="flex items-center mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
              </div>
              <span className="text-xs text-green-600 ml-2">Good</span>
            </div>
          </div>
          
          {/* Club Conversion Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Club Conversion</h3>
            <p className="text-2xl font-bold text-primary">4.8%</p>
            <p className="text-sm text-green-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              0.7% from last month
            </p>
          </div>
        </div>
        
        {/* Chart Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-primary">Conversation Metrics</h3>
            
            <div className="flex items-center space-x-2">
              {/* Date Range Selector */}
              <select 
                value={dateRange}
                onChange={handleDateRangeChange}
                className="bg-white border border-gray-300 text-gray-700 py-1 px-2 pr-8 rounded leading-tight focus:outline-none focus:border-primary"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="quarter">Last quarter</option>
                <option value="custom">Custom range</option>
              </select>
              
              {/* Custom date range display */}
              {dateRange === 'custom' && customDateRange.start && customDateRange.end && (
                <div className="text-sm text-gray-600 ml-2">
                  {new Date(customDateRange.start).toLocaleDateString()} - {new Date(customDateRange.end).toLocaleDateString()}
                </div>
              )}
              
              {/* Export Button */}
              <button 
                onClick={() => setExportModalOpen(true)}
                className="bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export
                </span>
              </button>
            </div>
          </div>
          
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
      
      {/* Alerts Panel */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-primary">Alerts & Notifications</h2>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => setAlertFilter('all')}
              className={`px-3 py-1 rounded-md ${
                alertFilter === 'all' 
                  ? 'bg-darkBrown text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setAlertFilter('business')}
              className={`px-3 py-1 rounded-md ${
                alertFilter === 'business' 
                  ? 'bg-darkBrown text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Business
            </button>
            <button 
              onClick={() => setAlertFilter('knowledge')}
              className={`px-3 py-1 rounded-md ${
                alertFilter === 'knowledge' 
                  ? 'bg-darkBrown text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Knowledge
            </button>
            <button 
              onClick={() => setAlertFilter('system')}
              className={`px-3 py-1 rounded-md ${
                alertFilter === 'system' 
                  ? 'bg-darkBrown text-white' 
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              System
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {filteredAlerts.map(alert => (
            <div key={alert.id} className={`border-l-4 ${
              alert.priority === 'high' ? 'border-red-500 bg-red-50' :
              alert.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
              'border-blue-500 bg-blue-50'
            } p-4 rounded-r-lg`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {alert.priority === 'high' ? (
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : alert.priority === 'medium' ? (
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${
                    alert.priority === 'high' ? 'text-red-800' :
                    alert.priority === 'medium' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>{alert.title}</h3>
                  <div className={`mt-2 text-sm ${
                    alert.priority === 'high' ? 'text-red-700' :
                    alert.priority === 'medium' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>
                    <p>{alert.description}</p>
                  </div>
                  <div className="mt-2">
                    <button type="button" className={`text-sm font-medium ${
                      alert.priority === 'high' ? 'text-red-800 hover:text-red-600' :
                      alert.priority === 'medium' ? 'text-yellow-800 hover:text-yellow-600' :
                      'text-blue-800 hover:text-blue-600'
                    }`}>
                      {alert.action} →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredAlerts.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No alerts in this category.
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Feedback and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Feedback */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Recent Feedback</h2>
          <div className="space-y-4">
            {[
              {
                id: 1,
                user: "User #764",
                time: "Today, 3:42 PM",
                comment: "The wine recommendations were perfect for my dinner party! Five stars!",
                rating: 5
              },
              {
                id: 2,
                user: "User #582",
                time: "Yesterday",
                comment: "Couldn't book a reservation through the chat. Had to call instead.",
                rating: 2
              },
              {
                id: 3,
                user: "User #921",
                time: "2 days ago",
                comment: "Good information but took a while to get the right answer about the 2021 Cabernet.",
                rating: 3
              }
            ].map((feedback) => (
              <div key={feedback.id} className="border-b border-gray-200 pb-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{feedback.user}</span>
                  <span className="text-xs text-gray-500">{feedback.time}</span>
                </div>
                <div className="flex items-center mt-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`h-4 w-4 ${i < feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-700">
                  {feedback.comment}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 text-right">
            <button 
              onClick={() => navigate('/dashboard/feedback')}
              className="text-sm font-medium text-primary hover:text-darkBrown"
            >
              View All Feedback →
            </button>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-primary mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={handleSyncKnowledgeBase}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-medium text-gray-800">Sync Knowledge Base</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              onClick={handleSendBulkMessage}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span className="font-medium text-gray-800">Send Bulk Message</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              onClick={handleViewConversions}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium text-gray-800">View Recent Conversions</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button 
              onClick={handleReviewNegativeFeedback}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-primary mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-gray-800">Review Negative Feedback</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="mt-5">
            <button 
              onClick={handleGoToKnowledgeManager}
              className="w-full flex items-center justify-center px-4 py-2 bg-darkBrown text-white rounded-lg hover:bg-darkBrownHover transition-colors"
            >
              <span>Go to Knowledge Manager</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}