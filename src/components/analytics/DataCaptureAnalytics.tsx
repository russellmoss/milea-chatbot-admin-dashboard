import React, { useState, useMemo } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import DateRangeSelector from './DateRangeSelector';
import { format, subDays } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

// Define types for data capture metrics
interface DataCaptureMetric {
  id: string;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

// Define overall metrics type
interface OverallMetrics {
  totalInteractions: number;
  capturedInteractions: number;
  captureRate: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

// Define date range type
interface DateRange {
  from: Date;
  to: Date;
  label: string;
}

// Define data capture data type
interface DataCaptureData {
  overall: OverallMetrics;
  sourceBreakdown: Array<{
    source: string;
    interactions: number;
    captureRate: number;
  }>;
  monthlyTrend: {
    labels: string[];
    values: number[];
  };
  qualityBreakdown: Array<{
    quality: string;
    percentage: number;
  }>;
}

// Sample data capture data
const initialDataCaptureData = {
  overall: {
    totalInteractions: 2500,
    capturedInteractions: 1525,
    captureRate: 61.0,
    change: -4.7,
    trend: 'down' as const
  } as OverallMetrics,
  sourceBreakdown: [
    { source: 'Website Chatbot', interactions: 850, captureRate: 68 },
    { source: 'SMS', interactions: 425, captureRate: 55 },
    { source: 'Email', interactions: 350, captureRate: 52 },
    { source: 'In-Person', interactions: 250, captureRate: 45 },
    { source: 'Social Media', interactions: 150, captureRate: 38 }
  ],
  monthlyTrend: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    values: [70, 68, 65, 64, 62, 61]
  },
  qualityBreakdown: [
    { quality: 'High Quality', percentage: 45 },
    { quality: 'Medium Quality', percentage: 35 },
    { quality: 'Low Quality', percentage: 20 }
  ]
};

const DataCaptureAnalytics: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
    label: 'Last 30 days'
  });
  const [dataCaptureData] = useState<DataCaptureData>(initialDataCaptureData);

  // Monthly Trend Chart Configuration
  const monthlyTrendChartData = {
    labels: dataCaptureData.monthlyTrend.labels,
    datasets: [
      {
        label: 'Data Capture Rate (%)',
        data: dataCaptureData.monthlyTrend.values,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const monthlyTrendChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Data Capture Rate Trend'
      }
    }
  };

  // Source Breakdown Chart Configuration
  const sourceBreakdownChartData = {
    labels: dataCaptureData.sourceBreakdown.map(source => source.source),
    datasets: [
      {
        label: 'Interactions',
        data: dataCaptureData.sourceBreakdown.map(source => source.interactions),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const sourceBreakdownChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Interactions by Source'
      }
    }
  };

  // Quality Breakdown Chart Configuration
  const qualityBreakdownChartData = {
    labels: dataCaptureData.qualityBreakdown.map(q => q.quality),
    datasets: [
      {
        label: 'Data Quality',
        data: dataCaptureData.qualityBreakdown.map(q => q.percentage),
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const qualityBreakdownChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Data Quality Breakdown'
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Data Capture Analytics</h2>
        <DateRangeSelector
          selectedRange={selectedRange}
          onRangeChange={setSelectedRange}
        />
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Interactions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Interactions</h3>
            <span className={`text-xs font-medium ${
              dataCaptureData.overall.trend === 'up' 
                ? 'text-green-600' 
                : dataCaptureData.overall.trend === 'down' 
                  ? 'text-red-600' 
                  : 'text-gray-600'
            }`}>
              {dataCaptureData.overall.change > 0 ? '↑' : '↓'} {Math.abs(dataCaptureData.overall.change)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {dataCaptureData.overall.totalInteractions.toLocaleString()}
          </p>
        </div>

        {/* Captured Interactions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">Captured Interactions</h3>
            <span className={`text-xs font-medium ${
              dataCaptureData.overall.trend === 'up' 
                ? 'text-green-600' 
                : dataCaptureData.overall.trend === 'down' 
                  ? 'text-red-600' 
                  : 'text-gray-600'
            }`}>
              {dataCaptureData.overall.change > 0 ? '↑' : '↓'} {Math.abs(dataCaptureData.overall.change)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {dataCaptureData.overall.capturedInteractions.toLocaleString()}
          </p>
        </div>

        {/* Capture Rate */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">Data Capture Rate</h3>
            <span className={`text-xs font-medium ${
              dataCaptureData.overall.trend === 'up' 
                ? 'text-green-600' 
                : dataCaptureData.overall.trend === 'down' 
                  ? 'text-red-600' 
                  : 'text-gray-600'
            }`}>
              {dataCaptureData.overall.change > 0 ? '↑' : '↓'} {Math.abs(dataCaptureData.overall.change)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {dataCaptureData.overall.captureRate}%
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Line 
            data={monthlyTrendChartData} 
            options={monthlyTrendChartOptions} 
          />
        </div>

        {/* Source Breakdown Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Pie 
            data={sourceBreakdownChartData} 
            options={sourceBreakdownChartOptions} 
          />
        </div>

        {/* Quality Breakdown Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <Pie 
            data={qualityBreakdownChartData} 
            options={qualityBreakdownChartOptions} 
          />
        </div>

        {/* Source Breakdown Table */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Source Details</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Source</th>
                <th className="text-right py-2">Interactions</th>
                <th className="text-right py-2">Capture Rate</th>
              </tr>
            </thead>
            <tbody>
              {dataCaptureData.sourceBreakdown.map((source, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{source.source}</td>
                  <td className="text-right py-2">{source.interactions}</td>
                  <td className="text-right py-2">{source.captureRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataCaptureAnalytics;