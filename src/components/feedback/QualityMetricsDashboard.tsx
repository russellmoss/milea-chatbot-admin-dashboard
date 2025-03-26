import React, { useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title, 
  Tooltip, 
  Legend, 
  ChartData, 
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const QualityMetricsDashboard: React.FC = () => {
  const [timeFrame, setTimeFrame] = useState('30days');
  
  // Sample data for Interaction Quality Index
  const qualityIndexData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Interaction Quality Index',
        data: [7.5, 7.8, 8.1, 8.3, 8.7, 8.6],
        borderColor: '#5A3E00',
        backgroundColor: 'rgba(90, 62, 0, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Benchmark',
        data: [7.2, 7.3, 7.5, 7.6, 7.7, 7.8],
        borderColor: '#AAAAAA',
        borderDash: [5, 5],
        tension: 0.3,
        backgroundColor: 'transparent'
      }
    ]
  };
  
  // Sample data for Response Time
  const responseTimeData: ChartData<'bar'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Average Response Time (s)',
        data: [3.2, 2.9, 2.7, 2.5, 2.3, 2.2],
        backgroundColor: '#715100',
      }
    ]
  };
  
  // Sample data for Query Type Distribution
  const queryTypeData: ChartData<'doughnut'> = {
    labels: ['Wine Info', 'Club Membership', 'Visiting Hours', 'Reservations', 'Events', 'Other'],
    datasets: [
      {
        data: [35, 25, 15, 12, 8, 5],
        backgroundColor: [
          '#5A3E00', 
          '#715100', 
          '#8B6914', 
          '#A67D28', 
          '#C1923C',
          '#DCAC50'
        ],
        borderColor: '#FFFFFF',
        borderWidth: 1
      }
    ]
  };
  
  // Sample data for Response Performance by Category
  const categoryPerformanceData: ChartData<'radar'> = {
    labels: ['Wine Info', 'Club Membership', 'Visiting Hours', 'Reservations', 'Events', 'Other'],
    datasets: [
      {
        label: 'Current',
        data: [8.7, 9.2, 8.5, 7.8, 8.3, 7.5],
        backgroundColor: 'rgba(90, 62, 0, 0.2)',
        borderColor: '#5A3E00',
        pointBackgroundColor: '#5A3E00'
      },
      {
        label: 'Previous Period',
        data: [8.2, 8.9, 8.3, 7.5, 7.9, 7.3],
        backgroundColor: 'rgba(113, 81, 0, 0.2)',
        borderColor: '#715100',
        pointBackgroundColor: '#715100'
      }
    ]
  };
  
  return (
    <div className="space-y-6">
      {/* Top metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Interaction Quality Index</h3>
          <p className="text-2xl font-bold text-primary">8.6/10</p>
          <div className="flex items-center mt-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '86%' }}></div>
            </div>
            <span className="text-xs text-green-600 ml-2">Good</span>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Response Accuracy</h3>
          <p className="text-2xl font-bold text-primary">92%</p>
          <p className="text-sm text-green-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            3% from last month
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Avg. Response Time</h3>
          <p className="text-2xl font-bold text-primary">2.2s</p>
          <p className="text-sm text-green-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            0.3s improvement
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Customer Satisfaction</h3>
          <p className="text-2xl font-bold text-primary">87%</p>
          <p className="text-sm text-green-600 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            2% from last month
          </p>
        </div>
      </div>
      
      {/* Time frame selector */}
      <div className="flex justify-end mb-4">
        <select 
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          className="bg-white border border-gray-300 text-gray-700 py-1 px-2 pr-8 rounded leading-tight focus:outline-none focus:border-primary"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
          <option value="year">Last year</option>
        </select>
      </div>
      
      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Index Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium text-primary mb-4">Quality Index Trend</h3>
          <Line data={qualityIndexData} options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: false,
                min: 7,
                max: 10
              }
            }
          }} />
        </div>
        
        {/* Response Time Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium text-primary mb-4">Response Time Trend</h3>
          <Bar data={responseTimeData} options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }} />
        </div>
        
        {/* Query Type Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium text-primary mb-4">Query Type Distribution</h3>
          <div className="h-64">
            <Doughnut data={queryTypeData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'right'
                }
              }
            }} />
          </div>
        </div>
        
        {/* Response Performance by Category */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium text-primary mb-4">Performance by Category</h3>
          <div className="h-64">
            <Radar data={categoryPerformanceData} options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                r: {
                  min: 5,
                  max: 10,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }} />
          </div>
        </div>
      </div>
      
      {/* Problematic Categories Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <h3 className="text-lg font-medium text-primary mb-4">Areas Needing Improvement</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Response Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Negative Feedback %
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Reservations</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-yellow-600 bg-yellow-100 py-1 px-2 rounded-full text-xs font-medium">7.8/10</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  3.1s
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  14%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Declining
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Other Queries</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-yellow-600 bg-yellow-100 py-1 px-2 rounded-full text-xs font-medium">7.5/10</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  2.8s
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  12%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                    Stable
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">Events</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-green-600 bg-green-100 py-1 px-2 rounded-full text-xs font-medium">8.3/10</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  2.5s
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  9%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    Improving
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QualityMetricsDashboard;