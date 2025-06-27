import React, { useState, useEffect } from 'react';
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
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import { emptyResponseTimeData, emptyQueryTypeData } from './utils/QualityMetricsDashboard/static';
import { fetchQualityMetricsCharts } from './utils/QualityMetricsDashboard/utils';

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
  const [timeFrame, setTimeFrame] = useState<string>('7days');
  const [responseTimeData, setResponseTimeData] = useState<ChartData<'bar'>>(emptyResponseTimeData);
  const [queryTypeData, setQueryTypeData] = useState<ChartData<'doughnut'>>(emptyQueryTypeData);


  // fectch metrics data for charts based on timeFrame
  useEffect(() => {
    const loadChartData = async () => {
      const data = await fetchQualityMetricsCharts(timeFrame);
      if (data) {
        setResponseTimeData(data.avgResponseTimeData);
        setQueryTypeData(data.queryTypeData);
      };
    }
  
    loadChartData();
  }, [timeFrame]);
  
  
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

  // Common chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Top metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          <option value="1month">Last 1 month</option>
          <option value="quarter">Last quarter</option>
          <option value="year">Last year</option>
        </select>
      </div>
      
      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Trend */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium text-primary mb-4">Response Time Trend</h3>
          <div className="h-64">
            <Bar data={responseTimeData} options={{
              ...chartOptions,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }} />
          </div>
        </div>
        
        {/* Query Type Distribution */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-medium text-primary mb-4">Query Type Distribution</h3>
          <div className="h-64">
            <Doughnut data={queryTypeData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
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
              ...chartOptions,
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
                  Current Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gap
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action Items
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Reservations
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  7.8/10
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  8.5/10
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  -0.7
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <ul className="list-disc list-inside">
                    <li>Improve booking flow clarity</li>
                    <li>Add more reservation time slots</li>
                    <li>Enhance confirmation process</li>
                  </ul>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Events
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  8.3/10
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  9.0/10
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                  -0.7
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <ul className="list-disc list-inside">
                    <li>Update event calendar</li>
                    <li>Add more event details</li>
                    <li>Improve ticket booking process</li>
                  </ul>
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