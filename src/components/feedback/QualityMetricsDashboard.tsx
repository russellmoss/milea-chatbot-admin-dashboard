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
import { emptyResponseTimeData, emptyQueryTypeData, emptyQueryPerfData, ImproveTableData, emptyImproveTableData } from './utils/QualityMetricsDashboard/static';
import { computeAvgRespTimeDiff, fetchQualityMetricsCharts, fetchQualityMetricsData } from './utils/QualityMetricsDashboard/utils';
import { TrendingUp, TrendingDown, MoveRight } from 'lucide-react';

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
  const [categoryPerformanceData, setCategoryPerformanceData] = useState<ChartData<'radar'>>(emptyQueryPerfData);
  const [queryImproveData, setQueryImproveData] = useState<ImproveTableData[]>(emptyImproveTableData);
  const [responseTimeAccuThisMonth, setResponseTimeAccuThisMonth] = useState<number>(0);
  const [responseTimeAccuLastMonth, setResponseTimeAccuLastMonth] = useState<number>(0);
  const [avgResponseTimeThisMonth, setAvgResponseTimeThisMonth] = useState<number>(0);
  const [avgResponseTimeLastMonth, setAvgResponseTimeLastMonth] = useState<number>(0);


  // fectch metrics data for charts based on timeFrame
  useEffect(() => {
    const loadChartData = async () => {
      const data = await fetchQualityMetricsCharts(timeFrame);
      if (data) {
        setResponseTimeData(data.avgResponseTimeData);
        setQueryTypeData(data.queryTypeData);
        setCategoryPerformanceData(data.queryPerformanceData);
        setQueryImproveData(data.queryImprovementData);
      };
    }
    const loadMetricsData = async () => {
      const data = await fetchQualityMetricsData();
      if (data) {
        setResponseTimeAccuThisMonth(data.response_accuracy.this_month);
        setResponseTimeAccuLastMonth(data.response_accuracy.last_month);
        setAvgResponseTimeThisMonth(data.avg_response_time.this_month);
        setAvgResponseTimeLastMonth(data.avg_response_time.last_month);
      }
    }
  
    loadChartData();
    loadMetricsData();
  }, [timeFrame]);

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
          <p className="text-2xl font-bold text-primary">{(responseTimeAccuThisMonth * 100).toFixed(2)}%</p>
          <p className={`text-sm flex items-center gap-1 ` + (responseTimeAccuThisMonth > responseTimeAccuLastMonth ? 'text-green-600' : (responseTimeAccuThisMonth < responseTimeAccuLastMonth || responseTimeAccuLastMonth === 0) ? 'text-red-600' : 'text-gray-600')}>
            {responseTimeAccuThisMonth > responseTimeAccuLastMonth && <TrendingUp size={14} strokeWidth={2} />}
            {responseTimeAccuThisMonth === responseTimeAccuLastMonth && <MoveRight size={14} strokeWidth={2} />}
            {responseTimeAccuThisMonth < responseTimeAccuLastMonth && <TrendingDown size={14} strokeWidth={2} />}
            {((responseTimeAccuThisMonth - responseTimeAccuLastMonth) * 100).toFixed(2)}% from last month
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Avg. Response Time</h3>
          <p className="text-2xl font-bold text-primary">{(avgResponseTimeThisMonth / 1000).toFixed(2)}s</p>
          <p className={`text-sm flex items-center gap-1 ` + (avgResponseTimeThisMonth < avgResponseTimeLastMonth ? 'text-green-600' : (avgResponseTimeThisMonth > avgResponseTimeLastMonth || avgResponseTimeLastMonth) === 0 ? 'text-red-600' : 'text-gray-600')}>
            {avgResponseTimeThisMonth > avgResponseTimeLastMonth && <TrendingUp size={14} strokeWidth={2} />}
            {avgResponseTimeThisMonth === avgResponseTimeLastMonth && <MoveRight size={14} strokeWidth={2} />}
            {avgResponseTimeThisMonth < avgResponseTimeLastMonth && <TrendingDown size={14} strokeWidth={2} />}
            {computeAvgRespTimeDiff(avgResponseTimeThisMonth, avgResponseTimeLastMonth)}
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
              responsive: true,
              scales: {
                r: {
                  beginAtZero: true,
                  max: 10,
                  angleLines: {
                    display: true
                  },
                  grid: {
                    circular: true
                  },
                  pointLabels: {
                    font: {
                      size: 10
                    }
                  }
                }
              },
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
              {queryImproveData.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.current_score.toFixed(1)}/10
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.target_score.toFixed(1)}/10
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${item.current_score < item.target_score ? 'text-red-600' : 'text-green-600'}`}>
                    {Math.abs(item.target_score - item.current_score).toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <ul className="list-disc list-inside">
                      {item.action_items.map((action, actionIndex) => (
                        <li key={actionIndex}>{action}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default QualityMetricsDashboard;